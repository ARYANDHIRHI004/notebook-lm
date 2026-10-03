import {
  RAG_MIN_SCORE,
  RAG_TOP_K,
} from "../lib/ai-config.js";
import { embedTexts } from "../lib/openai.js";
import {
  queryWorkspaceVectors,
  type VectorMetadata,
} from "../lib/pinecone.js";

export type RetrievedChunk = {
  chunkId: string;
  sourceId: string;
  sourceTitle: string;
  sourceType: string;
  text: string;
  score: number;
  page?: number;
};

/**
 * Retrieves the most relevant chunks for a user query scoped to a single source.
 */
export async function retrieveSourceContext(
  workspaceId: string,
  sourceId: string,
  query: string,
): Promise<RetrievedChunk[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const [embedding] = await embedTexts([trimmed]);
  if (!embedding) {
    return [];
  }

  const matches = await queryWorkspaceVectors(
    workspaceId,
    embedding,
    RAG_TOP_K,
    { sourceId: { $eq: sourceId } },
  );

  return matches
    .filter((match) => (match.score ?? 0) >= RAG_MIN_SCORE)
    .map((match) => {
      const metadata = match.metadata as VectorMetadata | undefined;
      return {
        chunkId: metadata?.chunkId ?? match.id ?? "",
        sourceId: metadata?.sourceId ?? sourceId,
        sourceTitle: metadata?.sourceTitle ?? "Source",
        sourceType: metadata?.sourceType ?? "pdf",
        text: metadata?.text ?? "",
        score: match.score ?? 0,
        page: metadata?.page,
      };
    })
    .filter((chunk) => chunk.text.length > 0);
}

export function formatRetrievedContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "No relevant excerpts were found in the indexed source.";
  }

  return chunks
    .map((chunk, index) => {
      const pageLabel =
        chunk.page !== undefined ? ` (page ${chunk.page + 1})` : "";
      return `[${index + 1}] ${chunk.sourceTitle}${pageLabel}\n${chunk.text}`;
    })
    .join("\n\n");
}
