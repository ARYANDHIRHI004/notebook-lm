import {
  CONVERSATION_SUMMARY_INTERVAL,
  RECENT_MESSAGE_WINDOW,
} from "../lib/ai-config.js";
import {
  generateChatCompletion,
  type ChatCompletionMessage,
} from "../lib/openai.js";
import {
  countChatsByConversationId,
  findChatById,
  listChatsByConversationId,
  updateChatById,
} from "../repositories/chat.repository.js";
import {
  findConversationByIdAndUserId,
  updateConversationById,
} from "../repositories/conversation.repository.js";
import { findSourceContentById } from "../repositories/source.repository.js";
import { findWorkSpcaceByIdAndUserId } from "../repositories/workspace.repository.js";
import {
  formatRetrievedContext,
  retrieveSourceContext,
  type RetrievedChunk,
} from "./retrieval.service.js";

const SYSTEM_PROMPT = `You are Quire, a research assistant that answers questions using only the provided source excerpts and the current conversation.

Rules:
- Ground answers in the retrieved excerpts when possible.
- If the excerpts do not contain enough information, say so clearly.
- Be concise, accurate, and structured when helpful.
- Do not invent citations or facts not supported by the excerpts.`;

export async function processChatMessageJob(input: {
  assistantChatId: string;
  userChatId: string;
  conversationId: string;
  workspaceId: string;
  sourceId: string;
  userId: string;
}) {
  const userChat = await findChatById(input.userChatId);
  const assistantChat = await findChatById(input.assistantChatId);

  if (!userChat || !assistantChat) {
    throw new Error("Chat records not found");
  }

  if (
    userChat.conversationId !== input.conversationId ||
    assistantChat.conversationId !== input.conversationId
  ) {
    throw new Error("Chat conversation mismatch");
  }

  const conversation = await findConversationByIdAndUserId(
    input.conversationId,
    input.userId,
  );
  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const workspace = await findWorkSpcaceByIdAndUserId(
    input.workspaceId,
    input.userId,
  );
  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const source = await findSourceContentById(input.sourceId);
  if (!source || source.workspaceId !== input.workspaceId) {
    throw new Error("Source not found");
  }

  if (source.status !== "ready") {
    await updateChatById(input.assistantChatId, {
      status: "failed",
      content:
        "This source is still processing. Please wait until indexing finishes and try again.",
    });
    return { status: "failed", reason: "source_not_ready" };
  }

  try {
    const chunks = await retrieveSourceContext(
      input.workspaceId,
      input.sourceId,
      userChat.content,
    );

    const model = workspace.defaultModel || undefined;
    const completionMessages = await buildChatCompletionMessages({
      conversationId: input.conversationId,
      conversation,
      userPrompt: userChat.content,
      chunks,
      excludeChatIds: new Set([input.assistantChatId]),
    });

    const answer = await generateChatCompletion(completionMessages, model);

    await updateChatById(input.assistantChatId, {
      content: answer,
      status: "completed",
      metadata: {
        citations: chunks.map((chunk, index) => ({
          index: index + 1,
          chunkId: chunk.chunkId,
          sourceId: chunk.sourceId,
          sourceTitle: chunk.sourceTitle,
          page: chunk.page,
          score: chunk.score,
        })),
      },
    });

    if (!conversation.title) {
      const title = await generateConversationTitle(userChat.content, model);
      await updateConversationById(input.conversationId, { title });
    }

    const messageCount = await countChatsByConversationId(input.conversationId);
    if (
      messageCount > 0 &&
      messageCount % CONVERSATION_SUMMARY_INTERVAL === 0
    ) {
      await refreshConversationSummary(input.conversationId, model);
    }

    return { status: "completed", citationCount: chunks.length };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate a response";

    await updateChatById(input.assistantChatId, {
      status: "failed",
      content: message,
    });

    throw error;
  }
}

function buildPromptMessages(input: {
  conversation: { summary: string | null };
  userPrompt: string;
  chunks: RetrievedChunk[];
  excludeChatIds: Set<string>;
}): ChatCompletionMessage[] {
  const contextBlock = formatRetrievedContext(input.chunks);
  const messages: ChatCompletionMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "system",
      content: `Retrieved source excerpts:\n\n${contextBlock}`,
    },
  ];

  if (input.conversation.summary) {
    messages.push({
      role: "system",
      content: `Conversation summary (earlier messages in this thread only):\n${input.conversation.summary}`,
    });
  }

  return messages;
}

async function buildPromptMessagesWithHistory(input: {
  conversationId: string;
  conversation: { summary: string | null };
  userPrompt: string;
  chunks: RetrievedChunk[];
  excludeChatIds: Set<string>;
}): Promise<ChatCompletionMessage[]> {
  const base = buildPromptMessages(input);
  const allChats = await listChatsByConversationId(input.conversationId);
  const completed = allChats.filter(
    (row) =>
      row.status === "completed" &&
      !input.excludeChatIds.has(row.id) &&
      row.role !== "system",
  );

  const recent =
    input.conversation.summary && completed.length > RECENT_MESSAGE_WINDOW
      ? completed.slice(-RECENT_MESSAGE_WINDOW)
      : completed;

  for (const row of recent) {
    if (row.role === "user" || row.role === "assistant") {
      base.push({
        role: row.role,
        content: row.content,
      });
    }
  }

  const last = recent[recent.length - 1];
  if (!last || last.role !== "user" || last.content !== input.userPrompt) {
    base.push({ role: "user", content: input.userPrompt });
  }

  return base;
}

// Fix: I need to use buildPromptMessagesWithHistory in processChatMessageJob
export async function buildChatCompletionMessages(input: {
  conversationId: string;
  conversation: { summary: string | null };
  userPrompt: string;
  chunks: RetrievedChunk[];
  excludeChatIds: Set<string>;
}) {
  return buildPromptMessagesWithHistory(input);
}

async function generateConversationTitle(
  firstUserMessage: string,
  model?: string,
): Promise<string> {
  const title = await generateChatCompletion(
    [
      {
        role: "system",
        content:
          "Generate a short conversation title (max 8 words) based on the user's first message. Return only the title.",
      },
      { role: "user", content: firstUserMessage },
    ],
    model,
  );

  return title.replace(/^["']|["']$/g, "").slice(0, 120);
}

async function refreshConversationSummary(
  conversationId: string,
  model?: string,
) {
  const chats = await listChatsByConversationId(conversationId);
  const transcript = chats
    .filter((row) => row.status === "completed" && row.role !== "system")
    .map((row) => `${row.role}: ${row.content}`)
    .join("\n\n");

  if (!transcript) {
    return;
  }

  const summary = await generateChatCompletion(
    [
      {
        role: "system",
        content:
          "Summarize this conversation for future context. Keep key facts, questions, and conclusions. Max 200 words.",
      },
      { role: "user", content: transcript },
    ],
    model,
  );

  await updateConversationById(conversationId, { summary });
}
