"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUp,
  Bot,
  Loader2,
  MessageSquare,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { Source } from "@/features/source";
import {
  useConversation,
  useConversations,
  useCreateConversation,
  useDeleteConversation,
  useSendMessage,
} from "../hooks/use-chat";

type SourceChatPanelProps = {
  workspaceId: string;
  source: Source | null;
  workspaceIcon?: string | null;
  workspaceName: string;
};

export function SourceChatPanel({
  workspaceId,
  source,
  workspaceIcon,
  workspaceName,
}: SourceChatPanelProps) {
  const sourceId = source ? String(source.id) : undefined;
  const [activeConversationId, setActiveConversationId] = useState<
    string | undefined
  >();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: conversationsLoading } =
    useConversations(workspaceId, sourceId);

  const createConversationMutation = useCreateConversation(
    workspaceId,
    sourceId ?? "",
  );
  const deleteConversationMutation = useDeleteConversation(
    workspaceId,
    sourceId ?? "",
  );
  const sendMessageMutation = useSendMessage(workspaceId, sourceId ?? "");

  const {
    data: conversationDetail,
    isLoading: conversationLoading,
    refetch: refetchConversation,
  } = useConversation(workspaceId, activeConversationId);

  const chats = conversationDetail?.chats ?? [];
  const isSending = sendMessageMutation.isPending;
  const hasPendingAssistant = chats.some((chat) => chat.status === "pending");

  useEffect(() => {
    if (!hasPendingAssistant) return;
    const timer = window.setInterval(() => {
      void refetchConversation();
    }, 1500);
    return () => window.clearInterval(timer);
  }, [hasPendingAssistant, refetchConversation]);

  useEffect(() => {
    if (!sourceId) {
      setActiveConversationId(undefined);
      return;
    }

    if (
      activeConversationId &&
      conversations.some((item) => item.id === activeConversationId)
    ) {
      return;
    }

    if (conversations.length > 0) {
      setActiveConversationId(conversations[0]?.id);
    } else {
      setActiveConversationId(undefined);
    }
  }, [sourceId, conversations, activeConversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats.length, hasPendingAssistant]);

  const sourceTitle = source?.title || source?.name || "Resource";
  const sourceReady = source?.status === "ready";

  const handleNewConversation = async () => {
    if (!sourceId) return;
    const created = await createConversationMutation.mutateAsync(undefined);
    setActiveConversationId(created.id);
  };

  const handleSend = async (contentOverride?: string) => {
    const content = (contentOverride ?? draft).trim();
    if (!content || !sourceId || isSending || hasPendingAssistant) return;

    setDraft("");

    const result = await sendMessageMutation.mutateAsync({
      content,
      conversationId: activeConversationId,
    });

    setActiveConversationId(result.conversation.id);
  };

  if (!source) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <MessageSquare className="mb-4 h-10 w-10 text-muted-foreground/40" />
        <h3 className="text-lg font-semibold">Select a resource</h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Choose a source from the sidebar to start an independent conversation
          grounded in that document.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-muted/20 md:flex">
        <div className="flex items-center justify-between border-b px-3 py-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Conversations
            </p>
            <p className="truncate text-sm font-medium">{sourceTitle}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => void handleNewConversation()}
            disabled={createConversationMutation.isPending}
            title="New conversation"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {conversationsLoading ? (
              <p className="px-2 py-4 text-xs text-muted-foreground">
                Loading conversations...
              </p>
            ) : conversations.length === 0 ? (
              <p className="px-2 py-4 text-xs text-muted-foreground">
                No conversations yet. Start one to chat about this resource.
              </p>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group flex items-center gap-1 rounded-lg border border-transparent",
                    activeConversationId === conversation.id && "bg-accent",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setActiveConversationId(conversation.id)}
                    className="min-w-0 flex-1 px-3 py-2 text-left"
                  >
                    <p className="truncate text-sm font-medium">
                      {conversation.title || "New conversation"}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {new Date(conversation.updatedAt).toLocaleString()}
                    </p>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-1 h-7 w-7 opacity-0 group-hover:opacity-100"
                    onClick={() => {
                      void deleteConversationMutation
                        .mutateAsync(conversation.id)
                        .then(() => {
                          if (activeConversationId === conversation.id) {
                            setActiveConversationId(undefined);
                          }
                        });
                    }}
                    title="Delete conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {!sourceReady && (
          <div className="border-b bg-amber-500/10 px-4 py-2 text-sm text-amber-700 dark:text-amber-300">
            This source is still indexing. You can open a conversation, but
            answers will work best after status is ready.
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {conversationLoading && activeConversationId ? (
              <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading conversation...
              </div>
            ) : !activeConversationId ? (
              <EmptyConversation
                workspaceIcon={workspaceIcon}
                workspaceName={workspaceName}
                sourceTitle={sourceTitle}
                onStart={() => void handleNewConversation()}
                onSuggest={(text) => void handleSend(text)}
              />
            ) : chats.length === 0 ? (
              <EmptyConversation
                workspaceIcon={workspaceIcon}
                workspaceName={workspaceName}
                sourceTitle={sourceTitle}
                onSuggest={(text) => void handleSend(text)}
              />
            ) : (
              chats.map((chat) => <ChatBubble key={chat.id} chat={chat} />)
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t bg-background/80 p-4 backdrop-blur md:px-6">
          <div className="mx-auto max-w-3xl">
            {sendMessageMutation.isError && (
              <div className="mb-2 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Failed to send message. Please try again.</span>
              </div>
            )}

            <div className="relative rounded-xl border bg-background shadow-xs focus-within:ring-2 focus-within:ring-primary/20">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Ask about ${sourceTitle}...`}
                className="min-h-[90px] w-full resize-none border-0 bg-transparent p-3 pb-12 focus-visible:ring-0 focus-visible:outline-none"
                disabled={!sourceReady || isSending || hasPendingAssistant}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
              />

              <Button
                size="icon"
                className="absolute bottom-3 right-3 h-8 w-8"
                disabled={
                  !draft.trim() ||
                  !sourceReady ||
                  isSending ||
                  hasPendingAssistant
                }
                onClick={() => void handleSend()}
              >
                {isSending || hasPendingAssistant ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
            </div>

            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Responses run in the background via Inngest and use retrieved
              excerpts from this resource only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyConversation({
  workspaceIcon,
  workspaceName,
  sourceTitle,
  onStart,
  onSuggest,
}: {
  workspaceIcon?: string | null;
  workspaceName: string;
  sourceTitle: string;
  onStart?: () => void;
  onSuggest: (text: string) => void;
}) {
  const suggestions = [
    `Summarize the main ideas in ${sourceTitle}`,
    "What are the key definitions and terms?",
    "List the most important findings with context",
    "What questions does this source leave open?",
  ];

  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">
        {workspaceIcon ? <span>{workspaceIcon}</span> : <Bot className="h-7 w-7" />}
      </div>
      <h3 className="mt-4 text-lg font-semibold">
        Chat about {sourceTitle}
      </h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Conversations in {workspaceName} stay scoped to this resource. Each
        thread keeps its own history.
      </p>
      {onStart && (
        <Button className="mt-4 gap-2" onClick={onStart}>
          <Plus className="h-4 w-4" />
          New conversation
        </Button>
      )}
      <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
        {suggestions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSuggest(item)}
            className="rounded-lg border bg-card p-3 text-left text-sm transition-colors hover:bg-accent"
          >
            <span className="text-muted-foreground">{item}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatBubble({
  chat,
}: {
  chat: {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    status: "pending" | "completed" | "failed";
    metadata?: { citations?: Array<{ index: number; sourceTitle: string; page?: number }> } | null;
  };
}) {
  const isUser = chat.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border bg-card",
          chat.status === "failed" && !isUser && "border-destructive/40",
        )}
      >
        {chat.status === "pending" && !isUser ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Searching sources and drafting an answer...</span>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{chat.content}</p>
        )}

        {!isUser &&
          chat.status === "completed" &&
          chat.metadata?.citations &&
          chat.metadata.citations.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-3">
              {chat.metadata.citations.map((citation) => (
                <Badge key={citation.index} variant="secondary" className="text-[10px]">
                  [{citation.index}] {citation.sourceTitle}
                  {citation.page !== undefined
                    ? ` · p.${citation.page + 1}`
                    : ""}
                </Badge>
              ))}
            </div>
          )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
