import { enqueueChatProcessing } from "../lib/chat-event.js";
import {
  deleteConversationById,
  findConversationByIdAndUserId,
  insertConversation,
  listConversationsBySourceId,
  touchConversationUpdatedAt,
} from "../repositories/conversation.repository.js";
import {
  insertChat,
  listChatsByConversationId,
} from "../repositories/chat.repository.js";
import {
  findSourceByIdAndWorkspace,
} from "../repositories/source.repository.js";
import { getWorkspaceByIdService } from "./workspace.service.js";
import { NotFoundError, ValidationError } from "../utils/api.error.js";

export async function createConversationService(
  workspaceId: string,
  sourceId: string,
  userId: string,
  title?: string,
) {
  await getWorkspaceByIdService(workspaceId, userId);

  const source = await findSourceByIdAndWorkspace(sourceId, workspaceId);
  if (!source) {
    throw new NotFoundError("Source not found");
  }

  return insertConversation({
    sourceId,
    workspaceId,
    userId,
    title: title?.trim() || null,
  });
}

export async function listConversationsService(
  workspaceId: string,
  sourceId: string,
  userId: string,
) {
  await getWorkspaceByIdService(workspaceId, userId);

  const source = await findSourceByIdAndWorkspace(sourceId, workspaceId);
  if (!source) {
    throw new NotFoundError("Source not found");
  }

  return listConversationsBySourceId(sourceId, userId);
}

export async function getConversationService(
  workspaceId: string,
  conversationId: string,
  userId: string,
) {
  await getWorkspaceByIdService(workspaceId, userId);

  const conversation = await findConversationByIdAndUserId(
    conversationId,
    userId,
  );
  if (!conversation || conversation.workspaceId !== workspaceId) {
    throw new NotFoundError("Conversation not found");
  }

  const chats = await listChatsByConversationId(conversationId);

  return { conversation, chats };
}

export async function deleteConversationService(
  workspaceId: string,
  conversationId: string,
  userId: string,
) {
  await getWorkspaceByIdService(workspaceId, userId);

  const conversation = await findConversationByIdAndUserId(
    conversationId,
    userId,
  );
  if (!conversation || conversation.workspaceId !== workspaceId) {
    throw new NotFoundError("Conversation not found");
  }

  const deleted = await deleteConversationById(conversationId, userId);
  return deleted;
}

export async function sendChatMessageService(input: {
  workspaceId: string;
  sourceId: string;
  userId: string;
  content: string;
  conversationId?: string;
}) {
  const content = input.content.trim();
  if (!content) {
    throw new ValidationError("Message content is required");
  }

  await getWorkspaceByIdService(input.workspaceId, input.userId);

  const source = await findSourceByIdAndWorkspace(
    input.sourceId,
    input.workspaceId,
  );
  if (!source) {
    throw new NotFoundError("Source not found");
  }

  let conversationId = input.conversationId;

  if (conversationId) {
    const existing = await findConversationByIdAndUserId(
      conversationId,
      input.userId,
    );
    if (
      !existing ||
      existing.workspaceId !== input.workspaceId ||
      existing.sourceId !== input.sourceId
    ) {
      throw new NotFoundError("Conversation not found");
    }
  } else {
    const created = await insertConversation({
      sourceId: input.sourceId,
      workspaceId: input.workspaceId,
      userId: input.userId,
    });
    conversationId = created!.id;
  }

  const userChat = await insertChat({
    conversationId: conversationId!,
    role: "user",
    content,
    status: "completed",
  });

  const assistantChat = await insertChat({
    conversationId: conversationId!,
    role: "assistant",
    content: "",
    status: "pending",
  });

  await enqueueChatProcessing({
    assistantChatId: assistantChat!.id,
    userChatId: userChat!.id,
    conversationId: conversationId!,
    workspaceId: input.workspaceId,
    sourceId: input.sourceId,
    userId: input.userId,
  });

  await touchConversationUpdatedAt(conversationId!);

  const conversation = await findConversationByIdAndUserId(
    conversationId!,
    input.userId,
  );

  return {
    conversation,
    userChat,
    assistantChat,
  };
}
