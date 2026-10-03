import type { Request, Response } from "express";
import { UnauthorizedError, ValidationError } from "../utils/api.error.js";
import {
  createConversationService,
  deleteConversationService,
  getConversationService,
  listConversationsService,
  sendChatMessageService,
} from "../services/chat.service.js";

export async function createConversation(req: Request, res: Response) {
  const userId = req.session?.user?.id;
  const { workspaceId, sourceId } = req.params;
  const title =
    typeof req.body?.title === "string" ? req.body.title : undefined;

  if (!userId) throw new UnauthorizedError("Unauthorized");
  if (!workspaceId) throw new ValidationError("Workspace ID is required");
  if (!sourceId) throw new ValidationError("Source ID is required");

  const conversation = await createConversationService(
    workspaceId as string,
    sourceId as string,
    userId,
    title,
  );

  res.status(201).json(conversation);
}

export async function listConversations(req: Request, res: Response) {
  const userId = req.session?.user?.id;
  const { workspaceId, sourceId } = req.params;

  if (!userId) throw new UnauthorizedError("Unauthorized");
  if (!workspaceId) throw new ValidationError("Workspace ID is required");
  if (!sourceId) throw new ValidationError("Source ID is required");

  const conversations = await listConversationsService(
    workspaceId as string,
    sourceId as string,
    userId,
  );

  res.status(200).json(conversations);
}

export async function getConversation(req: Request, res: Response) {
  const userId = req.session?.user?.id;
  const { workspaceId, conversationId } = req.params;

  if (!userId) throw new UnauthorizedError("Unauthorized");
  if (!workspaceId) throw new ValidationError("Workspace ID is required");
  if (!conversationId) throw new ValidationError("Conversation ID is required");

  const data = await getConversationService(
    workspaceId as string,
    conversationId as string,
    userId,
  );

  res.status(200).json(data);
}

export async function deleteConversation(req: Request, res: Response) {
  const userId = req.session?.user?.id;
  const { workspaceId, conversationId } = req.params;

  if (!userId) throw new UnauthorizedError("Unauthorized");
  if (!workspaceId) throw new ValidationError("Workspace ID is required");
  if (!conversationId) throw new ValidationError("Conversation ID is required");

  const deleted = await deleteConversationService(
    workspaceId as string,
    conversationId as string,
    userId,
  );

  res.status(200).json(deleted);
}

export async function sendChatMessage(req: Request, res: Response) {
  const userId = req.session?.user?.id;
  const { workspaceId, sourceId } = req.params;
  const content =
    typeof req.body?.content === "string" ? req.body.content : "";
  const conversationId =
    typeof req.body?.conversationId === "string"
      ? req.body.conversationId
      : undefined;

  if (!userId) throw new UnauthorizedError("Unauthorized");
  if (!workspaceId) throw new ValidationError("Workspace ID is required");
  if (!sourceId) throw new ValidationError("Source ID is required");

  const result = await sendChatMessageService({
    workspaceId: workspaceId as string,
    sourceId: sourceId as string,
    userId,
    content,
    conversationId,
  });

  res.status(202).json(result);
}
