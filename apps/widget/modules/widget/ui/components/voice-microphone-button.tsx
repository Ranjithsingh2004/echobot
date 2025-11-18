/**
 * Voice Microphone Button Component
 * Interactive button for controlling voice input in chat
 *
 * Features:
 * - Toggles between start/stop states
 * - Visual feedback for recording state
 * - Pulse animation when active
 * - Disabled state when voice not configured
 */

"use client";

import { Button } from "@workspace/ui/components/button";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface VoiceMicrophoneButtonProps {
  isRecording: boolean;
  isDisabled?: boolean;
  onToggle: () => void;
  className?: string;
}

export const VoiceMicrophoneButton = ({
  isRecording,
  isDisabled = false,
  onToggle,
  className,
}: VoiceMicrophoneButtonProps) => {
  return (
    <Button
      type="button"
      size="icon"
      variant={isRecording ? "default" : "ghost"}
      disabled={isDisabled}
      onClick={onToggle}
      className={cn(
        "relative transition-all duration-200",
        isRecording && "animate-pulse bg-red-500 hover:bg-red-600",
        className
      )}
      aria-label={isRecording ? "Stop voice input" : "Start voice input"}
    >
      {isRecording ? (
        <MicOff className="size-4" />
      ) : (
        <Mic className="size-4" />
      )}

      {/* Pulse ring animation when recording */}
      {isRecording && (
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-red-400 opacity-75" />
      )}
    </Button>
  );
};
