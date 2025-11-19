import { Badge } from "@workspace/ui/components/badge";
import { CheckCircle2Icon, ClockIcon, PackageIcon } from "lucide-react";
import type { IntegrationStatus } from "../../constants";

interface IntegrationStatusBadgeProps {
  status: IntegrationStatus;
}

/**
 * Status badge component for integrations
 * Shows visual indicator for available, connected, or coming-soon states
 */
export const IntegrationStatusBadge = ({
  status,
}: IntegrationStatusBadgeProps) => {
  const statusConfig = {
    available: {
      label: "Available",
      variant: "secondary" as const,
      icon: PackageIcon,
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    },
    connected: {
      label: "Connected",
      variant: "default" as const,
      icon: CheckCircle2Icon,
      className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    },
    "coming-soon": {
      label: "Coming Soon",
      variant: "outline" as const,
      icon: ClockIcon,
      className: "bg-muted text-muted-foreground",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
};
