export type ChatRole = "user" | "assistant" | "system";

export type ChatStatus = "pending" | "completed" | "failed";

export type ChatCitation = {
  index: number;
  chunkId: string;
  sourceId: string;
  sourceTitle: string;
  page?: number;
  score: number;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  role: ChatRole;
  content: string;
  status: ChatStatus;
  metadata?: {
    citations?: ChatCitation[];
  } | null;
  createdAt: string;
};

export type Conversation = {
  id: string;
  sourceId: string;
  workspaceId: string;
  userId: string;
  title: string | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SendMessageInput = {
  workspaceId: string;
  sourceId: string;
  content: string;
  conversationId?: string;
};

export type SendMessageResponse = {
  conversation: Conversation;
  userChat: ChatMessage;
  assistantChat: ChatMessage;
};

export type ConversationDetail = {
  conversation: Conversation;
  chats: ChatMessage[];
};
