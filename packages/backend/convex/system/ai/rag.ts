import { google } from "@ai-sdk/google";
import { RAG } from "@convex-dev/rag";
import { components } from "../../_generated/api";

// v1 provider model
const v1 = google.textEmbeddingModel("gemini-embedding-001");

// v2 adapter for RAG
const embeddingModelV2 = {
  specificationVersion: "v2" as const,
  id: (v1 as any)?.id ?? "gemini-embedding-001",

  async embed(input: string) {
    if (typeof (v1 as any).embed === "function") {
      const out = await (v1 as any).embed(input);
      return Array.isArray(out) && Array.isArray(out[0]) ? out[0] : out;
    }
    if (typeof (v1 as any).embedMany === "function") {
      const arr = await (v1 as any).embedMany([input]);
      return Array.isArray(arr) ? arr[0] : arr;
    }
    throw new Error("v1 embedding model has no embed/embedMany");
  },

  async embedMany(inputs: string[]) {
    if (typeof (v1 as any).embedMany === "function")
      return await (v1 as any).embedMany(inputs);

    if (typeof (v1 as any).embed === "function")
      return await Promise.all(inputs.map((s) => (v1 as any).embed(s)));

    throw new Error("v1 embedding model can't embedMany");
  },
};

// RAG instance using the v2 adapter
const rag = new RAG(components.rag, {
  textEmbeddingModel: embeddingModelV2 as any,
  embeddingDimension: 3072,
});

export default rag;
