/**
 * PUBLIC Widget Settings Functions
 * These functions are publicly accessible for the widget to fetch settings
 * No authentication required - designed for public widget usage
 */

import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * PUBLIC Query: Get widget settings by organization ID
 * This is used by the public widget to fetch greeting message and suggestions
 *
 * @param organizationId - The organization identifier (required)
 * @returns Widget settings including greeting message, suggestions, and VAPI settings
 */
export const getByOrganizationId = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    // No authentication check - this is a PUBLIC endpoint for widget usage

    // Validate organization ID
    if (!args.organizationId) {
      return null;
    }

    // Query widget settings for this organization
    const widgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .unique();

    // If no settings found, return default values
    if (!widgetSettings) {
      return {
        theme: "system" as const,
        icon: undefined,
        title: "Support Chat",
        visibility: true,
        greetMessage: "Hello! How can I help you today?",
        defaultSuggestions: {
          suggestion1: undefined,
          suggestion2: undefined,
          suggestion3: undefined,
        },
        vapiSettings: {
          assistantId: undefined,
          phoneNumber: undefined,
        },
      };
    }

    // Return only the necessary fields for the widget
    return {
      theme: widgetSettings.theme ?? "system",
      icon: widgetSettings.icon,
      title: widgetSettings.title ?? "Support Chat",
      visibility: widgetSettings.visibility ?? true,
      greetMessage: widgetSettings.greetMessage,
      defaultSuggestions: widgetSettings.defaultSuggestions,
      vapiSettings: widgetSettings.vapiSettings,
    };
  },
});

/**
 * PUBLIC Query: Get greeting message only
 * Lightweight endpoint to fetch just the greeting message
 *
 * @param organizationId - The organization identifier (required)
 * @returns Greeting message string or default message
 */
export const getGreeting = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.organizationId) {
      return "Hello! How can I help you today?";
    }

    const widgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .unique();

    return widgetSettings?.greetMessage || "Hello! How can I help you today?";
  },
});

/**
 * PUBLIC Query: Get suggestions only
 * Lightweight endpoint to fetch just the quick reply suggestions
 *
 * @param organizationId - The organization identifier (required)
 * @returns Array of suggestion strings (filtered to remove empty values)
 */
export const getSuggestions = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.organizationId) {
      return [];
    }

    const widgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .unique();

    if (!widgetSettings?.defaultSuggestions) {
      return [];
    }

    // Convert suggestions object to array and filter out empty values
    const suggestions = [
      widgetSettings.defaultSuggestions.suggestion1,
      widgetSettings.defaultSuggestions.suggestion2,
      widgetSettings.defaultSuggestions.suggestion3,
    ].filter((s): s is string => !!s);

    return suggestions;
  },
});
