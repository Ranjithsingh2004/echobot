"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Mail, Monitor, Globe, Clock } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { parseUserAgent } from "@/lib/user-agent-utils";
import { getCountryFromTimezone } from "@/lib/country-utils";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";

export const ContactPanel = ({
  conversationId,
}: {
  conversationId: Id<"conversations">;
}) => {
  const data = useQuery(api.private.contact.getOneByConversationId, {
    conversationId,
  });

  const markResolved = useMutation(api.private.contact.markResolved);
  const [isTogglingResolved, setIsTogglingResolved] = useState(false);

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  const { contactSession, conversation } = data;

  const { browser, os, deviceType } = parseUserAgent(
    contactSession.metadata?.userAgent
  );

  const country = getCountryFromTimezone(contactSession.metadata?.timezone);
  const language = contactSession.metadata?.language || "Unknown";
  const timezone = contactSession.metadata?.timezone || "Unknown";

  const sessionStarted = format(
    new Date(contactSession._creationTime),
    "M/d/yyyy, h:mm:ss a"
  );

  const initials = contactSession.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isResolved = conversation.status === "resolved";

  const handleToggleResolved = async (resolved: boolean) => {
    setIsTogglingResolved(true);
    try {
      await markResolved({
        conversationId,
        resolved,
      });
    } catch (error) {
      console.error("Failed to toggle resolved status:", error);
    } finally {
      setIsTogglingResolved(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src="" alt={contactSession.name} />
            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm">{contactSession.name}</h3>
            <p className="text-muted-foreground text-xs">{contactSession.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-md border bg-muted p-1">
          <button
            className={cn(
              "rounded-xs px-3 py-1 text-xs font-medium transition-colors",
              !isResolved
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            disabled={isTogglingResolved}
            onClick={() => handleToggleResolved(false)}
          >
            Unresolved
          </button>
          <button
            className={cn(
              "rounded-xs px-3 py-1 text-xs font-medium transition-colors",
              isResolved
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            disabled={isTogglingResolved}
            onClick={() => handleToggleResolved(true)}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Send Email CTA */}
          <Button className="w-full" size="lg">
            <Mail />
            Send Email
          </Button>

          <div className="border-t" />

          {/* Accordions */}
          <Accordion className="w-full" type="single" collapsible defaultValue="session">
            {/* Device Information */}
            <AccordionItem value="device">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Monitor className="size-4" />
                  <span>Device Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Device Type:</span>
                    <span className="font-medium">{deviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Operating System:</span>
                    <span className="font-medium">{os}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Browser:</span>
                    <span className="font-medium">{browser}</span>
                  </div>
                  {contactSession.metadata?.screenResolution && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Screen Resolution:</span>
                      <span className="font-medium">{contactSession.metadata.screenResolution}</span>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Location & Language */}
            <AccordionItem value="location">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Globe className="size-4" />
                  <span>Location & Language</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Country:</span>
                    <span className="font-medium">{country?.name || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timezone:</span>
                    <span className="font-medium">{timezone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language:</span>
                    <span className="font-medium">{language}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Session Details */}
            <AccordionItem value="session">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Clock className="size-4" />
                  <span>Session Details</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session Started:</span>
                    <span className="font-medium">{sessionStarted}</span>
                  </div>
                  {contactSession.metadata?.referrer && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Referrer:</span>
                      <span className="font-medium truncate max-w-[200px]" title={contactSession.metadata.referrer}>
                        {contactSession.metadata.referrer}
                      </span>
                    </div>
                  )}
                  {contactSession.metadata?.currentUrl && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current URL:</span>
                      <span className="font-medium truncate max-w-[200px]" title={contactSession.metadata.currentUrl}>
                        {contactSession.metadata.currentUrl}
                      </span>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};
