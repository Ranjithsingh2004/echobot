/**
 * Hook to fetch widget settings from public Convex functions
 * This hook loads greeting message and suggestions for the widget
 */

import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

export interface WidgetSettings {
  greetMessage: string;
  defaultSuggestions: {
    suggestion1?: string;
    suggestion2?: string;
    suggestion3?: string;
  };
  vapiSettings: {
    assistantId?: string;
    phoneNumber?: string;
  };
}

/**
 * Hook to get all widget settings by organization ID
 * Uses PUBLIC Convex function - no authentication required
 *
 * @param organizationId - The organization identifier
 * @returns Widget settings including greeting, suggestions, and VAPI config
 */
export function useWidgetSettings(organizationId: string | undefined) {
  const settings = useQuery(
    api.public.widgetSettings.getByOrganizationId,
    organizationId ? { organizationId } : "skip"
  );

  return settings;
}

/**
 * Hook to get just the greeting message
 * Lightweight alternative when only greeting is needed
 *
 * @param organizationId - The organization identifier
 * @returns Greeting message string
 */
export function useWidgetGreeting(organizationId: string | undefined) {
  const greeting = useQuery(
    api.public.widgetSettings.getGreeting,
    organizationId ? { organizationId } : "skip"
  );

  return greeting;
}

/**
 * Hook to get suggestions as an array
 * Filters out empty suggestions automatically
 *
 * @param organizationId - The organization identifier
 * @returns Array of suggestion strings
 */
export function useWidgetSuggestions(organizationId: string | undefined) {
  const suggestions = useQuery(
    api.public.widgetSettings.getSuggestions,
    organizationId ? { organizationId } : "skip"
  );

  return suggestions;
}
