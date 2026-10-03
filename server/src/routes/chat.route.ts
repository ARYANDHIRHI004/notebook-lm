import { Router } from "express";
import { requireAuth } from "../middlewares/auth.moddleware.js";
import {
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
  sendChatMessage,
} from "../controllers/chat.controller.js";

export const chatRoute = Router();

chatRoute.use(requireAuth);

chatRoute
  .route("/:workspaceId/sources/:sourceId/conversations")
  .get(listConversations)
  .post(createConversation);

chatRoute
  .route("/:workspaceId/sources/:sourceId/messages")
  .post(sendChatMessage);

chatRoute
  .route("/:workspaceId/conversations/:conversationId")
  .get(getConversation)
  .delete(deleteConversation);
