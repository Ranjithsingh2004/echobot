/**
 * PUBLIC Secrets Management Functions
 * These functions provide secure access to organization-level secrets for the widget
 * Only returns PUBLIC API keys - never exposes private/sensitive credentials
 */

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { getSecretValue, parseSecretString } from "../lib/secrets";

/**
 * Vapi Secret Structure stored in AWS Secrets Manager
 * Path: tenant/{organizationId}/vapi
 */
interface VapiSecretData {
  privateApiKey: string; // Server-side only - NEVER exposed to public
  publicApiKey: string;  // Client-side safe - used in widget
}

/**
 * PUBLIC Action: Get Vapi Public API Key
 * Retrieves organization's Vapi public key for client-side voice integration
 *
 * Security: Only returns public key - private key remains server-side
 *
 * @param organizationId - Organization identifier
 * @returns Object with publicKey or null if not configured
 *
 * @example
 * ```typescript
 * const secrets = await getVapiSecrets({ organizationId: "org_123" });
 * if (secrets) {
 *   const vapi = new Vapi(secrets.publicKey);
 * }
 * ```
 */
export const getVapiSecrets = action({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate organization ID
    if (!args.organizationId) {
      return null;
    }

    // Step 1: Check if Vapi plugin is connected for this organization
    const plugin = await ctx.runQuery(
      internal.system.plugins.getByOrganizationIdAndService,
      {
        organizationId: args.organizationId,
        service: "vapi",
      },
    );

    // No plugin configured - Vapi not connected
    if (!plugin) {
      return null;
    }

    // Step 2: Retrieve secret from AWS Secrets Manager
    const secretName = plugin.secretName;
    let secret;

    try {
      secret = await getSecretValue(secretName);
    } catch (error) {
      console.error(`Failed to retrieve secret ${secretName}:`, error);
      return null;
    }

    // Step 3: Parse secret string to typed object
    const secretData = parseSecretString<VapiSecretData>(secret);

    if (!secretData) {
      console.error(`Failed to parse secret data for ${secretName}`);
      return null;
    }

    // Step 4: Validate required fields exist
    if (!secretData.publicApiKey) {
      console.error(`Public API key missing in secret ${secretName}`);
      return null;
    }

    // Note: We don't need to validate privateApiKey here since we never return it
    // The private key is only validated in server-side actions (like vapi.ts)

    // Step 5: Return ONLY the public key (safe for client-side)
    return {
      publicKey: secretData.publicApiKey,
    };
  },
});

/**
 * PUBLIC Action: Check if Vapi is configured
 * Lightweight check to see if organization has Vapi integration enabled
 *
 * @param organizationId - Organization identifier
 * @returns Boolean indicating if Vapi is configured
 *
 * @example
 * ```typescript
 * const isConfigured = await checkVapiConfigured({ organizationId: "org_123" });
 * if (isConfigured) {
 *   // Show voice call options
 * }
 * ```
 */
export const checkVapiConfigured = action({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    if (!args.organizationId) {
      return false;
    }

    const plugin = await ctx.runQuery(
      internal.system.plugins.getByOrganizationIdAndService,
      {
        organizationId: args.organizationId,
        service: "vapi",
      },
    );

    return !!plugin;
  },
});
