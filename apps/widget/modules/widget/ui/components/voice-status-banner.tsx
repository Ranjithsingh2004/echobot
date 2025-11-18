/**
 * Voice Status Banner Component
 * Displays current voice call status with visual feedback
 *
 * States:
 * - Connecting: Establishing voice connection
 * - Listening: Waiting for user speech
 * - Speaking: AI assistant is talking
 * - Error: Something went wrong
 */

"use client";

import { cn } from "@workspace/ui/lib/utils";
import { VoiceWaveform } from "./voice-waveform";
import { Loader2, PhoneOff, AlertCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

interface VoiceStatusBannerProps {
  status: "connecting" | "listening" | "speaking" | "error";
  message?: string;
  onEndCall?: () => void;
  className?: string;
}

export const VoiceStatusBanner = ({
  status,
  message,
  onEndCall,
  className,
}: VoiceStatusBannerProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "connecting":
        return {
          icon: <Loader2 className="size-4 animate-spin" />,
          text: message || "Connecting...",
          bgColor: "bg-blue-50 dark:bg-blue-950",
          textColor: "text-blue-700 dark:text-blue-300",
        };
      case "listening":
        return {
          icon: <VoiceWaveform isActive={true} isSpeaking={false} />,
          text: message || "Listening...",
          bgColor: "bg-green-50 dark:bg-green-950",
          textColor: "text-green-700 dark:text-green-300",
        };
      case "speaking":
        return {
          icon: <VoiceWaveform isActive={true} isSpeaking={true} />,
          text: message || "Assistant is speaking...",
          bgColor: "bg-blue-50 dark:bg-blue-950",
          textColor: "text-blue-700 dark:text-blue-300",
        };
      case "error":
        return {
          icon: <AlertCircle className="size-4" />,
          text: message || "Voice call error",
          bgColor: "bg-red-50 dark:bg-red-950",
          textColor: "text-red-700 dark:text-red-300",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-2 border-b",
        config.bgColor,
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className={config.textColor}>{config.icon}</div>
        <span className={cn("text-sm font-medium", config.textColor)}>
          {config.text}
        </span>
      </div>

      {onEndCall && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onEndCall}
          className={cn("h-7", config.textColor)}
        >
          <PhoneOff className="mr-1 size-3" />
          End Call
        </Button>
      )}
    </div>
  );
};
