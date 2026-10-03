import { inngest } from "../client.js";
import { processChatMessageJob } from "../../services/chat-process.service.js";

export const processChatMessage = inngest.createFunction(
  {
    id: "process-chat-message",
    retries: 3,
    triggers: [{ event: "chat/message.requested" }],
  },
  async ({ event, step }) => {
    const result = await step.run("generate-response", () =>
      processChatMessageJob(
        event.data as {
          assistantChatId: string;
          userChatId: string;
          conversationId: string;
          workspaceId: string;
          sourceId: string;
          userId: string;
        },
      ),
    );

    return result;
  },
);
