import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

const SESSION_DURATION_MS = 24**60*60*1000; // 24 hours in milliseconds

const AUTO_REFRESH_THRESHOLD_MS = 4 * 60 * 60 * 1000; // 1 hour in milliseconds

export const refresh = internalMutation({
  args: {
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);

    if (!contactSession) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Contact session not found",
      });
    }

    if (contactSession.expiresAt < Date.now()) {
       throw new ConvexError({
        code: "ExPIRED",
        message: "Contact session not found",
      });
    }

    const timeRemaining = contactSession.expiresAt - Date.now();




    if (timeRemaining > AUTO_REFRESH_THRESHOLD_MS) {
      const mewExpiresAt = Date.now() + SESSION_DURATION_MS;
      await ctx.db.patch(args.contactSessionId, {
        expiresAt: mewExpiresAt,
      });
      return {...contactSession, newExpiresAt: mewExpiresAt };
    }

    return { ...contactSession };
  },
});




export const getOne = internalQuery({
  args: {
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.contactSessionId);
  },
});
