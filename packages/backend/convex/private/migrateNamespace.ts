import { action } from "../_generated/server";
import { v } from "convex/values";
import { components } from "../_generated/api";
import { api } from "../_generated/api";

/**
 * Check existing namespaces and their structure
 */
export const checkNamespaces = action({
  args: {},
  handler: async (ctx) => {
    // Use the RAG component's API to list namespaces
    const namespaces = await ctx.runQuery(components.rag.namespaces.list, {
      paginationOpts: { cursor: null, numItems: 100 },
      status: "ready",
    });

    return {
      namespaces: namespaces.page,
      total: namespaces.page.length,
    };
  },
});

/**
 * Delete a specific namespace by ID (requires deleting entries first)
 * WARNING: This will delete all files in the namespace!
 */
export const deleteNamespace = action({
  args: {
    namespaceId: v.string(),
    confirm: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.confirm) {
      throw new Error("Must confirm deletion by passing { confirm: true }");
    }

    // Use the RAG component's deleteNamespaceSync action
    await ctx.runAction(components.rag.namespaces.deleteNamespaceSync, {
      namespaceId: args.namespaceId as any,
    });

    return {
      message: `Deleted namespace ${args.namespaceId}`,
    };
  },
});
