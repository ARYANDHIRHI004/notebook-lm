import { asc, eq } from "drizzle-orm";
import { db } from "../config/db.js";
import {
  chat,
  type ChatRecord,
  type ChatRole,
  type ChatStatus,
} from "../models/chat.model.js";

export type { ChatRecord, ChatRole, ChatStatus };

export async function insertChat(data: {
  conversationId: string;
  role: ChatRole;
  content: string;
  status?: ChatStatus;
  metadata?: Record<string, unknown> | null;
}) {
  const [created] = await db.insert(chat).values(data).returning();
  return created;
}

export async function findChatById(chatId: string): Promise<ChatRecord | undefined> {
  const [found] = await db
    .select()
    .from(chat)
    .where(eq(chat.id, chatId))
    .limit(1);

  return found;
}

export async function listChatsByConversationId(
  conversationId: string,
): Promise<ChatRecord[]> {
  return db
    .select()
    .from(chat)
    .where(eq(chat.conversationId, conversationId))
    .orderBy(asc(chat.createdAt));
}

export async function updateChatById(
  chatId: string,
  data: Partial<
    Pick<ChatRecord, "content" | "status" | "metadata">
  >,
) {
  const [updated] = await db
    .update(chat)
    .set(data)
    .where(eq(chat.id, chatId))
    .returning();

  return updated;
}

export async function countChatsByConversationId(
  conversationId: string,
): Promise<number> {
  const rows = await db
    .select({ id: chat.id })
    .from(chat)
    .where(eq(chat.conversationId, conversationId));

  return rows.length;
}
