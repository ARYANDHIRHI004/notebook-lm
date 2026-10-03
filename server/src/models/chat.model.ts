import { pgEnum, pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { conversation } from "./conversation.model.js";
import { source } from "./soruce.models.js";

export const chatRole = pgEnum("chat_role", ["user", "assistant", "system"]);

export const chatStatus = pgEnum("chat_status", [
  "pending",
  "completed",
  "failed",
]);

export const chat = pgTable("chat", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversation.id, { onDelete: "cascade" }),
  role: chatRole("role").notNull(),
  content: text("content").notNull().default(""),
  status: chatStatus("status").notNull().default("completed"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatRelations = relations(chat, ({ one }) => ({
  conversation: one(conversation, {
    fields: [chat.conversationId],
    references: [conversation.id],
  }),
}));

export const conversationChatRelations = relations(conversation, ({ many }) => ({
  chats: many(chat),
}));

export const sourceConversationRelations = relations(source, ({ many }) => ({
  conversations: many(conversation),
}));

export type ChatRecord = typeof chat.$inferSelect;
export type ChatRole = ChatRecord["role"];
export type ChatStatus = ChatRecord["status"];
