/**
 * Voice Call Modal Component
 * Floating overlay for voice calls - independent of routing
 *
 * Features:
 * - Appears above all content as modal/overlay
 * - No navigation required
 * - Local state management
 * - Shows call status, transcript, controls
 */

"use client";

import { X } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { VoiceStatusBanner } from "./voice-status-banner";
import { VoiceTranscriptMessage } from "./voice-transcript-message";
import { cn } from "@workspace/ui/lib/utils";

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  transcript: Array<{
    role: "user" | "assistant";
    text: string;
    timestamp?: number;
  }>;
  onEndCall: () => void;
  error: string | null;
}

export const VoiceCallModal = ({
  isOpen,
  onClose,
  isConnected,
  isConnecting,
  isSpeaking,
  transcript,
  onEndCall,
  error,
}: VoiceCallModalProps) => {
  if (!isOpen) return null;

  // Determine voice status for banner
  const getVoiceStatus = ():
    | "connecting"
    | "listening"
    | "speaking"
    | "error"
    | null => {
    if (error) return "error";
    if (isConnecting) return "connecting";
    if (isSpeaking) return "speaking";
    if (isConnected) return "listening";
    return null;
  };

  const voiceStatus = getVoiceStatus();

  const handleClose = () => {
    if (isConnected) {
      onEndCall();
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={cn(
            "pointer-events-auto relative w-full max-w-md rounded-lg bg-background shadow-lg",
            "flex flex-col max-h-[80vh]"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Voice Call</h2>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleClose}
              aria-label="Close voice call"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Status Banner */}
          {voiceStatus && (
            <VoiceStatusBanner
              status={voiceStatus}
              message={error || undefined}
              onEndCall={isConnected ? onEndCall : undefined}
            />
          )}

          {/* Transcript Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {transcript.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <p className="text-sm">
                  {isConnecting
                    ? "Connecting to voice assistant..."
                    : isConnected
                    ? "Start speaking..."
                    : "Voice call inactive"}
                </p>
              </div>
            ) : (
              transcript.map((msg, index) => (
                <VoiceTranscriptMessage
                  key={`voice-${index}`}
                  role={msg.role}
                  text={msg.text}
                  timestamp={msg.timestamp}
                />
              ))
            )}
          </div>

          {/* Footer with End Call Button */}
          {isConnected && (
            <div className="border-t p-4">
              <Button
                className="w-full"
                variant="destructive"
                onClick={onEndCall}
              >
                End Call
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
