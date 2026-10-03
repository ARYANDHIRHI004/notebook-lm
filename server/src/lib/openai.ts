/**
 * OpenAI SDK client for embeddings (RAG indexing and query embedding).
 *
 * Chat generation uses the AI SDK (`@ai-sdk/openai`) instead of this client.
 * Requires `OPENAI_API_KEY` in the environment.
 */

import OpenAI from "openai";
import {
    CHAT_MODEL,
    EMBEDDING_DIMENSIONS,
    EMBEDDING_MODEL,
} from "./ai-config.js";

export { CHAT_MODEL, EMBEDDING_DIMENSIONS, EMBEDDING_MODEL };

let client: OpenAI | null = null;

/**
 * Creates embedding vectors for one or more text strings.
 *
 * Used during source indexing (`embedAndIndexSource`) and RAG query embedding
 * (`retrieveWorkspaceContext`).
 *
 * @param texts - Strings to embed (empty array returns immediately)
 * @returns Embedding vectors in the same order as input texts (1536 dimensions each)
 * @throws When `OPENAI_API_KEY` is not configured
 *
 *
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
        return [];
    }

    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured");
    }

    if (!client) {
        client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    const response = await client.embeddings.create({
        model: EMBEDDING_MODEL,
        input: texts,
        dimensions: EMBEDDING_DIMENSIONS,
    });

    return response.data
        .sort((a, b) => a.index - b.index)
        .map((item) => item.embedding);
}

export type ChatCompletionMessage = {
    role: "system" | "user" | "assistant";
    content: string;
};

/**
 * Generates a chat completion using the configured OpenAI chat model.
 */
export async function generateChatCompletion(
    messages: ChatCompletionMessage[],
    model?: string,
): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured");
    }

    if (!client) {
        client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    const response = await client.chat.completions.create({
        model: model ?? CHAT_MODEL,
        messages,
        temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
        throw new Error("OpenAI returned an empty completion");
    }

    return content;
}