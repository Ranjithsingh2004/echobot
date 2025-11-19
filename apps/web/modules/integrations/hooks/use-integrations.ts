"use client";

import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "@workspace/backend/_generated/api";
import {
  AVAILABLE_INTEGRATIONS,
  filterIntegrationsByCategory,
  searchIntegrations,
  type IntegrationCategory,
  type IntegrationService,
} from "../constants";

/**
 * Custom hook for managing integrations state
 * Handles filtering, searching, and connected status
 */
export const useIntegrations = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<IntegrationCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showConnectedOnly, setShowConnectedOnly] = useState(false);

  // Fetch connected plugins from backend
  // Note: The current schema only supports "vapi", but this is extensible
  const vapiPlugin = useQuery(api.private.plugins.getOne, { service: "vapi" });

  // Track which integrations are connected
  const connectedIntegrations = useMemo(() => {
    const connected: Set<IntegrationService> = new Set();
    if (vapiPlugin) {
      connected.add("vapi");
    }
    return connected;
  }, [vapiPlugin]);

  // Filter and search integrations
  const filteredIntegrations = useMemo(() => {
    let integrations = AVAILABLE_INTEGRATIONS;

    // Apply category filter
    if (selectedCategory !== "all") {
      integrations = filterIntegrationsByCategory(selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      integrations = searchIntegrations(searchQuery);
    }

    // Apply connected-only filter
    if (showConnectedOnly) {
      integrations = integrations.filter((integration) =>
        connectedIntegrations.has(integration.id)
      );
    }

    return integrations;
  }, [selectedCategory, searchQuery, showConnectedOnly, connectedIntegrations]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: AVAILABLE_INTEGRATIONS.length,
      connected: connectedIntegrations.size,
      available: AVAILABLE_INTEGRATIONS.filter((i) => i.status === "available")
        .length,
      comingSoon: AVAILABLE_INTEGRATIONS.filter(
        (i) => i.status === "coming-soon"
      ).length,
    };
  }, [connectedIntegrations.size]);

  // Check if an integration is connected
  const isConnected = (integrationId: IntegrationService): boolean => {
    return connectedIntegrations.has(integrationId);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setShowConnectedOnly(false);
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedCategory !== "all" || searchQuery.trim() !== "" || showConnectedOnly;

  return {
    // Data
    integrations: filteredIntegrations,
    connectedIntegrations,
    stats,

    // Filters
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    showConnectedOnly,
    setShowConnectedOnly,

    // Helpers
    isConnected,
    resetFilters,
    hasActiveFilters,

    // Loading state
    isLoading: vapiPlugin === undefined,
  };
};
