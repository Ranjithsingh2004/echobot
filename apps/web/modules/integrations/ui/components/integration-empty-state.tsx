import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { PackageSearchIcon, PlugIcon, SearchXIcon } from "lucide-react";

interface IntegrationEmptyStateProps {
  type: "no-results" | "no-connected" | "error";
  onReset?: () => void;
  errorMessage?: string;
}

/**
 * Empty state component for integrations
 * Handles different empty states: no results, no connected integrations, errors
 */
export const IntegrationEmptyState = ({
  type,
  onReset,
  errorMessage,
}: IntegrationEmptyStateProps) => {
  const stateConfig = {
    "no-results": {
      icon: SearchXIcon,
      title: "No integrations found",
      description:
        "We couldn't find any integrations matching your search. Try adjusting your filters or search query.",
      showResetButton: true,
    },
    "no-connected": {
      icon: PlugIcon,
      title: "No connected integrations",
      description:
        "You haven't connected any integrations yet. Browse available integrations to get started.",
      showResetButton: true,
    },
    error: {
      icon: PackageSearchIcon,
      title: "Something went wrong",
      description:
        errorMessage ||
        "We encountered an error loading integrations. Please try again.",
      showResetButton: false,
    },
  };

  const config = stateConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex min-h-[400px] items-center justify-center py-12">
      <Card className="max-w-md border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <Icon className="size-8 text-muted-foreground" />
          </div>
          <CardTitle>{config.title}</CardTitle>
          <CardDescription className="text-center">
            {config.description}
          </CardDescription>
        </CardHeader>
        {config.showResetButton && onReset && (
          <CardContent className="flex justify-center">
            <Button onClick={onReset} variant="outline">
              Reset Filters
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
