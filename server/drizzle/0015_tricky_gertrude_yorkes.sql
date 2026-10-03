ALTER TABLE "chat" ALTER COLUMN "conversation_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "conversation" ALTER COLUMN "source_id" SET DATA TYPE uuid;