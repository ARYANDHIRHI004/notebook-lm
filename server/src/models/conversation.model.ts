import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";
import { source } from "./soruce.models.js";
import { workspace } from "./workspace.model.js";

export const conversation = pgTable("conversation", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceId: uuid("source_id")
    .notNull()
    .references(() => source.id, { onDelete: "cascade" }),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title"),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const conversationRelations = relations(conversation, ({ one }) => ({
  source: one(source, {
    fields: [conversation.sourceId],
    references: [source.id],
  }),
  workspace: one(workspace, {
    fields: [conversation.workspaceId],
    references: [workspace.id],
  }),
  user: one(user, {
    fields: [conversation.userId],
    references: [user.id],
  }),
}));

export type ConversationRecord = typeof conversation.$inferSelect;
