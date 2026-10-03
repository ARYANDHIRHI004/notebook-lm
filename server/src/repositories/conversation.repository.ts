import { and, desc, eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { conversation } from "../models/conversation.model.js";

export type ConversationRecord = typeof conversation.$inferSelect;

export async function insertConversation(data: {
  sourceId: string;
  workspaceId: string;
  userId: string;
  title?: string | null;
}) {
  const [created] = await db.insert(conversation).values(data).returning();
  // console.log("create hua", created);
  return created;
}

export async function findConversationByIdAndUserId(
  conversationId: string,
  userId: string,
): Promise<ConversationRecord | undefined> {
  const [found] = await db
    .select()
    .from(conversation)
    .where(
      and(eq(conversation.id, conversationId), eq(conversation.userId, userId)),
    )
    .limit(1);

  return found;
}

export async function listConversationsBySourceId(
  sourceId: string,
  userId: string,
): Promise<ConversationRecord[]> {
  return db
    .select()
    .from(conversation)
    .where(
      and(eq(conversation.sourceId, sourceId), eq(conversation.userId, userId)),
    )
    .orderBy(desc(conversation.updatedAt));
}

export async function touchConversationUpdatedAt(conversationId: string) {
  await db
    .update(conversation)
    .set({ updatedAt: new Date() })
    .where(eq(conversation.id, conversationId));
}

export async function updateConversationById(
  conversationId: string,
  data: Partial<Pick<ConversationRecord, "title" | "summary">>,
) {
  const [updated] = await db
    .update(conversation)
    .set(data)
    .where(eq(conversation.id, conversationId))
    .returning();

  return updated;
}

export async function deleteConversationById(
  conversationId: string,
  userId: string,
) {
  const [deleted] = await db
    .delete(conversation)
    .where(
      and(eq(conversation.id, conversationId), eq(conversation.userId, userId)),
    )
    .returning();

  return deleted;
}
