"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { CheckCircle2Icon, ExternalLinkIcon, LockIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Integration } from "../../constants";
import { IntegrationStatusBadge } from "./integration-status-badge";

interface IntegrationCardProps {
  integration: Integration;
  isConnected?: boolean;
  onConnect?: () => void;
  isLoading?: boolean;
}

/**
 * Integration card component - displays integration details with connect/setup options
 * Handles all states: available, connected, coming soon, premium
 */
export const IntegrationCard = ({
  integration,
  isConnected = false,
  onConnect,
  isLoading = false,
}: IntegrationCardProps) => {
  const isComingSoon = integration.status === "coming-soon";
  const isAvailable = integration.status === "available";

  // explicit local references so we can narrow types reliably
  const setupUrl = integration.setupUrl; // string | undefined
  const docsUrl = integration.docsUrl; // string | undefined

  const showConnectButton = isAvailable && !isConnected;
  const showSetupButton = isConnected && !!setupUrl; // boolean
  const showViewDocs = !!docsUrl; // boolean

  const handleConnect = () => {
    if (onConnect && !isLoading && !isComingSoon) {
      onConnect();
    }
  };

  return (
    <Card className="group relative flex h-full flex-col transition-all hover:shadow-lg">
      {/* Premium badge overlay */}
      {integration.isPremium && (
        <div className="absolute right-4 top-4 z-10">
          <Badge variant="default" className="gap-1">
            <LockIcon className="size-3" />
            Premium
          </Badge>
        </div>
      )}

      <CardHeader className="space-y-4">
        <div className="flex items-start gap-4">
          {/* Integration logo */}
          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
            <Image
              src={integration.image}
              alt={`${integration.name} logo`}
              fill
              className="object-contain p-2"
              onError={(e) => {
                // Fallback to placeholder on error
                // Next/Image onError doesn't expose the HTMLImageElement reliably,
                // but this preserves your original behavior without changing runtime shape.
                const target = e.target as HTMLImageElement | null;
                if (target) {
                  target.src = "/logo.svg";
                }
              }}
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{integration.name}</CardTitle>
              {isConnected && (
                <CheckCircle2Icon className="size-5 text-green-600" />
              )}
            </div>
            <IntegrationStatusBadge
              status={isConnected ? "connected" : integration.status}
            />
          </div>
        </div>

        <CardDescription className="line-clamp-2">
          {integration.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm font-medium">Features:</p>
          <ul className="space-y-2">
            {integration.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <feature.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <span className="font-medium">{feature.label}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    - {feature.description}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {integration.features.length > 3 && (
            <p className="text-muted-foreground text-xs">
              +{integration.features.length - 3} more features
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        {/* Connect button for available integrations */}
        {showConnectButton && (
          <Button
            className="w-full"
            onClick={handleConnect}
            disabled={isLoading || isComingSoon || integration.isPremium}
          >
            {isLoading ? "Connecting..." : "Connect"}
          </Button>
        )}

        {/* Setup button for connected integrations */}
        {/* Guard directly with isConnected && setupUrl so TS knows setupUrl is defined */}
        {isConnected && setupUrl && (
          <Button asChild className="w-full" variant="default">
            <Link href={setupUrl}>
              Configure Integration
              <ExternalLinkIcon className="ml-2 size-4" />
            </Link>
          </Button>
        )}

        {/* Coming soon state */}
        {isComingSoon && (
          <Button className="w-full" disabled variant="secondary">
            Coming Soon
          </Button>
        )}

        {/* View documentation link */}
        {docsUrl && (
          <Button asChild className="w-full" variant="outline" size="sm">
            <Link href={docsUrl} target="_blank" rel="noopener noreferrer">
              View Documentation
              <ExternalLinkIcon className="ml-2 size-3" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
