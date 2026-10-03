"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
  sendMessage,
} from "../lib/api";
import type { SendMessageInput } from "../lib/types";

export const chatKeys = {
  conversations: (workspaceId: string, sourceId: string) =>
    ["conversations", workspaceId, sourceId] as const,
  conversation: (workspaceId: string, conversationId: string) =>
    ["conversation", workspaceId, conversationId] as const,
};

export function useConversations(workspaceId: string, sourceId?: string) {
  return useQuery({
    queryKey: chatKeys.conversations(workspaceId, sourceId ?? ""),
    queryFn: () => listConversations(workspaceId, sourceId!),
    enabled: Boolean(workspaceId && sourceId),
  });
}

export function useConversation(workspaceId: string, conversationId?: string) {
  return useQuery({
    queryKey: chatKeys.conversation(workspaceId, conversationId ?? ""),
    queryFn: () => getConversation(workspaceId, conversationId!),
    enabled: Boolean(workspaceId && conversationId),
  });
}

export function useCreateConversation(workspaceId: string, sourceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title?: string) =>
      createConversation(workspaceId, sourceId, title),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(workspaceId, sourceId),
      });
    },
  });
}

export function useDeleteConversation(workspaceId: string, sourceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      deleteConversation(workspaceId, conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.removeQueries({
        queryKey: chatKeys.conversation(workspaceId, conversationId),
      });
      void queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(workspaceId, sourceId),
      });
    },
  });
}

export function useSendMessage(workspaceId: string, sourceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<SendMessageInput, "workspaceId" | "sourceId">) =>
      sendMessage({
        workspaceId,
        sourceId,
        ...input,
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(workspaceId, sourceId),
      });
      void queryClient.invalidateQueries({
        queryKey: chatKeys.conversation(workspaceId, data.conversation.id),
      });
    },
  });
}
