import { inngest } from "../inngest/client.js";

export async function enqueueChatProcessing(input: {
  assistantChatId: string;
  userChatId: string;
  conversationId: string;
  workspaceId: string;
  sourceId: string;
  userId: string;
}) {
  await inngest.send({
    name: "chat/message.requested",
    data: input,
  });
}
