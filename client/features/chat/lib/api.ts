import { axiosInstance } from "@/lib/axios";
import { ApiError } from "@/shared/lib/api";
import type {
  Conversation,
  ConversationDetail,
  SendMessageInput,
  SendMessageResponse,
} from "./types";

function normalizeConversation(data: any): Conversation {
  return {
    ...data,
    id: String(data.id),
    sourceId: String(data.sourceId),
    workspaceId: String(data.workspaceId),
  };
}

function normalizeChat(data: any) {
  return {
    ...data,
    id: String(data.id),
    conversationId: String(data.conversationId),
  };
}

export async function listConversations(
  workspaceId: string,
  sourceId: string,
): Promise<Conversation[]> {
  try {
    const response = await axiosInstance.get(
      `/api/v1/chat/${workspaceId}/sources/${sourceId}/conversations`,
    );
    const data = Array.isArray(response.data) ? response.data : [];
    return data.map(normalizeConversation);
  } catch (error) {
    throw ApiError.fromError(error);
  }
}

export async function createConversation(
  workspaceId: string,
  sourceId: string,
  title?: string,
): Promise<Conversation> {
  try {
    const response = await axiosInstance.post(
      `/api/v1/chat/${workspaceId}/sources/${sourceId}/conversations`,
      title ? { title } : {},
    );
    return normalizeConversation(response.data);
  } catch (error) {
    throw ApiError.fromError(error);
  }
}

export async function getConversation(
  workspaceId: string,
  conversationId: string,
): Promise<ConversationDetail> {
  try {
    const response = await axiosInstance.get(
      `/api/v1/chat/${workspaceId}/conversations/${conversationId}`,
    );
    return {
      conversation: normalizeConversation(response.data.conversation),
      chats: (response.data.chats ?? []).map(normalizeChat),
    };
  } catch (error) {
    throw ApiError.fromError(error);
  }
}

export async function deleteConversation(
  workspaceId: string,
  conversationId: string,
): Promise<void> {
  try {
    await axiosInstance.delete(
      `/api/v1/chat/${workspaceId}/conversations/${conversationId}`,
    );
  } catch (error) {
    throw ApiError.fromError(error);
  }
}

export async function sendMessage(
  input: SendMessageInput,
): Promise<SendMessageResponse> {
  try {
    const response = await axiosInstance.post(
      `/api/v1/chat/${input.workspaceId}/sources/${input.sourceId}/messages`,
      {
        content: input.content,
        conversationId: input.conversationId,
      },
    );

    return {
      conversation: normalizeConversation(response.data.conversation),
      userChat: normalizeChat(response.data.userChat),
      assistantChat: normalizeChat(response.data.assistantChat),
    };
  } catch (error) {
    throw ApiError.fromError(error);
  }
}
