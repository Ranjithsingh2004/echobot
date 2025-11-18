import { google } from "@ai-sdk/google";
import { embedMany } from "ai";
import { RAG } from "@convex-dev/rag";
import { components } from "../../_generated/api";

// Google embedding model
const googleEmbedding = google.textEmbeddingModel("gemini-embedding-001");

// Adapter for RAG - v1 specification for AI SDK 4
const embeddingModelAdapter = {
  specificationVersion: "v1" as const,
  modelId: "gemini-embedding-001",
  provider: "google",
  maxEmbeddingsPerCall: 100,
  supportsParallelCalls: true,

  async doEmbed(args: { values: string[] }) {
    const { embeddings } = await embedMany({
      model: googleEmbedding,
      values: args.values,
    });
    return { embeddings };
  },
};

// RAG instance using the adapter
const rag = new RAG(components.rag, {
  textEmbeddingModel: embeddingModelAdapter as any,
  embeddingDimension: 3072,
});

export default rag;
