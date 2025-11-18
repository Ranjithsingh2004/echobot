/**
 * Knowledge Base Functions
 * Backend CRUD operations for knowledge base documents
 * Handles document management for RAG integration
 */

import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Query to get all knowledge base documents for the current organization
 * Returns documents sorted by creation date (newest first)
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user identity
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    // Query all documents for this organization
    const documents = await ctx.db
      .query("knowledgeBase")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .collect();

    // Sort by creation date (newest first)
    return documents.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Query to get a single knowledge base document by ID
 */
export const getOne = query({
  args: {
    documentId: v.id("knowledgeBase"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    // Get the document
    const document = await ctx.db.get(args.documentId);

    if (!document) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Document not found",
      });
    }

    // Verify the document belongs to this organization
    if (document.organizationId !== orgId) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Access denied",
      });
    }

    return document;
  },
});

/**
 * Mutation to create a new knowledge base document
 * Used after file upload to store document metadata
 */
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    mimeType: v.string(),
    fileName: v.string(),
    embedUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    // Validate input
    if (!args.title.trim()) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Title cannot be empty",
      });
    }

    if (!args.content.trim()) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Content cannot be empty",
      });
    }

    // Create the document
    const documentId = await ctx.db.insert("knowledgeBase", {
      organizationId: orgId,
      title: args.title,
      content: args.content,
      mimeType: args.mimeType,
      fileName: args.fileName,
      embedUrl: args.embedUrl,
      storageId: args.storageId,
      createdAt: Date.now(),
    });

    return documentId;
  },
});

/**
 * Mutation to update document metadata (rename, update content, etc.)
 */
export const update = mutation({
  args: {
    documentId: v.id("knowledgeBase"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    // Get the document
    const document = await ctx.db.get(args.documentId);

    if (!document) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Document not found",
      });
    }

    // Verify ownership
    if (document.organizationId !== orgId) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Access denied",
      });
    }

    // Prepare update object
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) {
      if (!args.title.trim()) {
        throw new ConvexError({
          code: "BAD_REQUEST",
          message: "Title cannot be empty",
        });
      }
      updates.title = args.title;
    }

    if (args.content !== undefined) {
      if (!args.content.trim()) {
        throw new ConvexError({
          code: "BAD_REQUEST",
          message: "Content cannot be empty",
        });
      }
      updates.content = args.content;
      // Clear embedding when content changes - will need to be regenerated
      updates.embedding = undefined;
    }

    // Update the document
    await ctx.db.patch(args.documentId, updates);

    return args.documentId;
  },
});

/**
 * Mutation to delete a knowledge base document
 */
export const remove = mutation({
  args: {
    documentId: v.id("knowledgeBase"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    // Get the document
    const document = await ctx.db.get(args.documentId);

    if (!document) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Document not found",
      });
    }

    // Verify ownership
    if (document.organizationId !== orgId) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Access denied",
      });
    }

    // Delete associated file from storage if it exists
    if (document.storageId) {
      await ctx.storage.delete(document.storageId);
    }

    // Delete the document
    await ctx.db.delete(args.documentId);

    return { success: true };
  },
});

/**
 * Mutation to generate URL for file upload
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    // Generate upload URL
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Query to get file URL from storage
 */
export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
