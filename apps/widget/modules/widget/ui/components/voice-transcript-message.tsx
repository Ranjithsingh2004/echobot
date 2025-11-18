/**
 * Voice Transcript Message Component
 * Displays voice conversation transcript in chat message format
 *
 * Features:
 * - Visual distinction from text messages (mic icon)
 * - Same styling as regular chat messages
 * - Supports user and assistant roles
 * - Timestamp display
 */

"use client";

import { AIMessage, AIMessageContent } from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { Mic } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface VoiceTranscriptMessageProps {
  role: "user" | "assistant";
  text: string;
  timestamp?: number;
}

export const VoiceTranscriptMessage = ({
  role,
  text,
  timestamp,
}: VoiceTranscriptMessageProps) => {
  return (
    <AIMessage from={role}>
      <AIMessageContent>
        {/* Voice indicator badge */}
        <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Mic className="size-3" />
          <span>Voice message</span>
          {timestamp && (
            <span className="ml-1">
              {new Date(timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        {/* Transcript text */}
        <AIResponse className={cn(
          "rounded-lg border border-primary/20 bg-primary/5 p-3"
        )}>
          {text}
        </AIResponse>
      </AIMessageContent>

      {/* Avatar for assistant messages */}
      {role === "assistant" && (
        <DicebearAvatar imageUrl="/logo.svg" seed="assistant" size={32} />
      )}
    </AIMessage>
  );
};
