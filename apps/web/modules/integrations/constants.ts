import {
  BotIcon,
  CodeIcon,
  GlobeIcon,
  MailIcon,
  MessageSquareIcon,
  PhoneIcon,
  type LucideIcon,
  ZapIcon,
  DatabaseIcon,
  ShieldCheckIcon,
} from "lucide-react";

/**
 * Integration category types
 */
export type IntegrationCategory =
  | "all"
  | "communication"
  | "voice"
  | "ai"
  | "automation"
  | "database"
  | "security";

/**
 * Integration status types
 */
export type IntegrationStatus = "available" | "connected" | "coming-soon";

/**
 * Integration service types (matches backend schema)
 */
export type IntegrationService = "vapi" | "slack" | "discord" | "twilio";

/**
 * Feature interface for integration cards
 */
export interface IntegrationFeature {
  icon: LucideIcon;
  label: string;
  description: string;
}

/**
 * Main integration interface
 */
export interface Integration {
  id: IntegrationService;
  name: string;
  description: string;
  image: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  features: IntegrationFeature[];
  setupUrl?: string;
  docsUrl?: string;
  isPremium?: boolean;
}

/**
 * Category configuration
 */
export interface CategoryConfig {
  value: IntegrationCategory;
  label: string;
  icon: LucideIcon;
}

/**
 * Available categories for filtering
 */
export const INTEGRATION_CATEGORIES: CategoryConfig[] = [
  {
    value: "all",
    label: "All Integrations",
    icon: GlobeIcon,
  },
  {
    value: "communication",
    label: "Communication",
    icon: MessageSquareIcon,
  },
  {
    value: "voice",
    label: "Voice & Phone",
    icon: PhoneIcon,
  },
  {
    value: "ai",
    label: "AI & ML",
    icon: BotIcon,
  },
  {
    value: "automation",
    label: "Automation",
    icon: ZapIcon,
  },
  {
    value: "database",
    label: "Database",
    icon: DatabaseIcon,
  },
  {
    value: "security",
    label: "Security",
    icon: ShieldCheckIcon,
  },
] as const;

/**
 * All available integrations
 */
export const AVAILABLE_INTEGRATIONS: Integration[] = [
  {
    id: "vapi",
    name: "Vapi",
    description: "AI-powered voice calls and phone support for your customers",
    image: "/vapi.jpg",
    category: "voice",
    status: "available",
    setupUrl: "/plugins/vapi",
    docsUrl: "https://vapi.ai/docs",
    features: [
      {
        icon: GlobeIcon,
        label: "Web voice calls",
        description: "Voice chat directly in your app",
      },
      {
        icon: PhoneIcon,
        label: "Phone numbers",
        description: "Get dedicated business lines",
      },
      {
        icon: PhoneIcon,
        label: "Outbound calls",
        description: "Automated customer outreach",
      },
      {
        icon: ZapIcon,
        label: "Workflows",
        description: "Custom conversation flows",
      },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    description: "Connect your workspace to receive notifications and chat updates",
    image: "/logo.svg", // Placeholder - replace with actual Slack logo
    category: "communication",
    status: "coming-soon",
    docsUrl: "https://api.slack.com/",
    features: [
      {
        icon: MessageSquareIcon,
        label: "Channel notifications",
        description: "Get updates in your channels",
      },
      {
        icon: BotIcon,
        label: "Bot integration",
        description: "Automated responses via Slack bot",
      },
      {
        icon: ZapIcon,
        label: "Slash commands",
        description: "Control your bot from Slack",
      },
      {
        icon: MailIcon,
        label: "Direct messages",
        description: "DM notifications for critical events",
      },
    ],
  },
  {
    id: "discord",
    name: "Discord",
    description: "Integrate with Discord servers for community support",
    image: "/logo.svg", // Placeholder - replace with actual Discord logo
    category: "communication",
    status: "coming-soon",
    docsUrl: "https://discord.com/developers/docs",
    features: [
      {
        icon: MessageSquareIcon,
        label: "Server integration",
        description: "Connect to Discord servers",
      },
      {
        icon: BotIcon,
        label: "Bot commands",
        description: "Custom bot interactions",
      },
      {
        icon: ZapIcon,
        label: "Webhooks",
        description: "Real-time event notifications",
      },
      {
        icon: ShieldCheckIcon,
        label: "Role management",
        description: "Permission-based access control",
      },
    ],
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "SMS and voice communication platform integration",
    image: "/logo.svg", // Placeholder - replace with actual Twilio logo
    category: "voice",
    status: "coming-soon",
    docsUrl: "https://www.twilio.com/docs",
    isPremium: true,
    features: [
      {
        icon: MessageSquareIcon,
        label: "SMS messaging",
        description: "Send and receive text messages",
      },
      {
        icon: PhoneIcon,
        label: "Voice calls",
        description: "Programmable voice capabilities",
      },
      {
        icon: GlobeIcon,
        label: "Global reach",
        description: "International phone numbers",
      },
      {
        icon: ZapIcon,
        label: "Automation",
        description: "Automated messaging workflows",
      },
    ],
  },
] as const;

/**
 * Legacy integration types for backward compatibility
 */
export const INTEGRATIONS = [
  {
    id: "html",
    title: "HTML",
    icon: "/languages/html5.svg",
  },
  {
    id: "react",
    title: "React",
    icon: "/languages/react.svg",
  },
  {
    id: "nextjs",
    title: "Next.js",
    icon: "/languages/nextjs.svg",
  },
  {
    id: "javascript",
    title: "JavaScript",
    icon: "/languages/javascript.svg",
  },
];

/**
 * Get integration by ID
 */
export const getIntegrationById = (
  id: IntegrationService
): Integration | undefined => {
  return AVAILABLE_INTEGRATIONS.find((integration) => integration.id === id);
};

/**
 * Filter integrations by category
 */
export const filterIntegrationsByCategory = (
  category: IntegrationCategory
): Integration[] => {
  if (category === "all") {
    return AVAILABLE_INTEGRATIONS;
  }
  return AVAILABLE_INTEGRATIONS.filter(
    (integration) => integration.category === category
  );
};

/**
 * Filter integrations by status
 */
export const filterIntegrationsByStatus = (
  status: IntegrationStatus
): Integration[] => {
  return AVAILABLE_INTEGRATIONS.filter(
    (integration) => integration.status === status
  );
};

/**
 * Search integrations by query
 */
export const searchIntegrations = (query: string): Integration[] => {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) {
    return AVAILABLE_INTEGRATIONS;
  }
  return AVAILABLE_INTEGRATIONS.filter(
    (integration) =>
      integration.name.toLowerCase().includes(lowerQuery) ||
      integration.description.toLowerCase().includes(lowerQuery) ||
      integration.category.toLowerCase().includes(lowerQuery)
  );
};
