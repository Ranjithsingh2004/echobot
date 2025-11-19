"use client";

import { useOrganization } from "@clerk/nextjs";
import { Separator } from "@workspace/ui/components/separator";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { CopyIcon, InfoIcon, PlugIcon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { IntegrationCard } from "../components/integration-card";
import { IntegrationFilters } from "../components/integration-filters";
import { IntegrationSearch } from "../components/integration-search";
import { IntegrationEmptyState } from "../components/integration-empty-state";
import { IntegrationErrorBoundary } from "../components/integration-error-boundary";
import { IntegrationLoadingGrid } from "../components/integration-loading-skeleton";
import { useIntegrations } from "../../hooks/use-integrations";

export const IntegrationsView = () => {
  const { organization } = useOrganization();
  const router = useRouter();

  const {
    integrations,
    stats,
    selectedCategory,
    setSelectedCategory,
    setSearchQuery,
    showConnectedOnly,
    setShowConnectedOnly,
    isConnected,
    resetFilters,
    hasActiveFilters,
    isLoading,
  } = useIntegrations();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(organization?.id ?? "");
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleConnect = (integrationId: string) => {
    // Navigate to the integration setup page
    const integration = integrations.find((i) => i.id === integrationId);
    if (integration?.setupUrl) {
      router.push(integration.setupUrl);
    } else {
      toast.info("Integration setup coming soon!");
    }
  };

  return (
    <IntegrationErrorBoundary>
      <div className="flex min-h-screen flex-col bg-muted p-4 sm:p-8">
        <div className="mx-auto w-full max-w-screen-2xl">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold md:text-4xl">
              Setup & Integrations
            </h1>
            <p className="text-muted-foreground">
              Connect your favorite tools and services to extend functionality
            </p>
          </div>

          {/* Organization ID Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <InfoIcon className="size-5" />
                Organization ID
              </CardTitle>
              <CardDescription>
                Use this ID when configuring integrations or API access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <Input
                    disabled
                    id="organization-id"
                    readOnly
                    value={organization?.id ?? ""}
                    className="bg-muted font-mono text-sm"
                    aria-label="Organization ID"
                  />
                </div>
                <Button
                  className="gap-2 sm:w-auto"
                  onClick={handleCopy}
                  size="default"
                  variant="secondary"
                >
                  <CopyIcon className="size-4" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Integrations
                </CardTitle>
                <PlugIcon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Available services
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connected</CardTitle>
                <PlugIcon className="size-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.connected}</div>
                <p className="text-xs text-muted-foreground">
                  Active connections
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
                <PlugIcon className="size-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.available}</div>
                <p className="text-xs text-muted-foreground">
                  Ready to connect
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Coming Soon
                </CardTitle>
                <SparklesIcon className="size-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.comingSoon}</div>
                <p className="text-xs text-muted-foreground">
                  In development
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <IntegrationSearch onSearch={setSearchQuery} />
            <IntegrationFilters
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              showConnectedOnly={showConnectedOnly}
              onShowConnectedOnlyChange={setShowConnectedOnly}
              connectedCount={stats.connected}
            />
          </div>

          {/* Integrations Grid */}
          <div className="mb-8">
            {isLoading ? (
              <IntegrationLoadingGrid count={4} />
            ) : integrations.length === 0 ? (
              <IntegrationEmptyState
                type={
                  showConnectedOnly && stats.connected === 0
                    ? "no-connected"
                    : "no-results"
                }
                onReset={hasActiveFilters ? resetFilters : undefined}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {integrations.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    isConnected={isConnected(integration.id)}
                    onConnect={() => handleConnect(integration.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Results count */}
          {!isLoading && integrations.length > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              Showing {integrations.length} of {stats.total} integrations
              {hasActiveFilters && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={resetFilters}
                  className="ml-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </IntegrationErrorBoundary>
  );
};
