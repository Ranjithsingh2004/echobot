"use client";

import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { VoiceCallModal } from "@/modules/widget/ui/components/voice-call-modal";
import { Button } from "@workspace/ui/components/button";
import {
  ChevronRightIcon,
  MessageSquareTextIcon,
  PhoneIcon,
} from "lucide-react";
import { useSetAtom, useAtomValue } from "jotai";
import {
  contactSessionIdAtomFamily,
  organizationIdAtom,
  screenAtom,
  errorMessageAtom,
  conversationIdAtom,
} from "../../atoms/widget-atoms";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useState } from "react";
import { WidgetFooter } from "../components/widget-footer";
import { useVapi } from "../../hooks/use-vapi";

/**
 * Widget Selection Screen
 * Allows users to choose between text chat and voice call (if configured)
 *
 * Features:
 * - Text chat option (always available)
 * - Voice call option (only shown if Vapi is configured)
 * - Dynamic UI based on organization's capabilities
 */
export const WidgetSelectionScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  const createConversation = useMutation(api.public.conversations.create);
  const [isPending, setIsPending] = useState(false);

  // Local state for voice call modal (NO ROUTING)
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Initialize Vapi hook for voice calls
  const {
    isConfigured,
    isConnected,
    isConnecting,
    isSpeaking,
    transcript,
    startCall,
    endCall,
    error: vapiError,
  } = useVapi();

  /**
   * Handle Text Chat Selection
   * Creates a new conversation and navigates to chat screen
   */
  const handleNewConversation = async () => {
    if (!organizationId) {
      setScreen("error");
      setErrorMessage("Organization ID is missing");
      return;
    }

    if (!contactSessionId) {
      setScreen("auth");
      return;
    }

    setIsPending(true);

    try {
      const conversationId = await createConversation({
        contactSessionId,
        organizationId,
      });
      setConversationId(conversationId);
      setScreen("chat");
    } catch {
      setScreen("auth");
    } finally {
      setIsPending(false);
    }
  };

  /**
   * Handle Voice Call Selection
   * Opens floating voice call modal (NO NAVIGATION)
   */
  const handleVoiceCall = () => {
    if (!isConfigured) {
      setErrorMessage("Voice calls are not configured");
      return;
    }

    // Open modal
    setIsVoiceModalOpen(true);

    // Start call
    startCall();
  };

  const handleCloseVoiceModal = () => {
    setIsVoiceModalOpen(false);
    if (isConnected) {
      endCall();
    }
  };

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">Hi there! 👋</p>
          <p className="text-lg ">How would you like to get help?</p>
        </div>
      </WidgetHeader>

      {/* Voice Call Modal - Floating overlay (NO ROUTING) */}
      <VoiceCallModal
        isOpen={isVoiceModalOpen}
        onClose={handleCloseVoiceModal}
        isConnected={isConnected}
        isConnecting={isConnecting}
        isSpeaking={isSpeaking}
        transcript={transcript}
        onEndCall={endCall}
        error={vapiError}
      />

      <div className="flex flex-1 flex-col gap-y-4 p-4 overflow-y-auto">
        {/* Text Chat Option - Always Available */}
        <Button
          className="h-16 w-full justify-between"
          variant="outline"
          onClick={handleNewConversation}
          disabled={isPending}
        >
          <div className="flex items-center gap-x-2">
            <MessageSquareTextIcon className="size-4" />
            <span>Start chat</span>
          </div>
          <ChevronRightIcon />
        </Button>

        {/* Voice Call Option - Only shown if Vapi is configured */}
        {isConfigured && (
          <Button
            className="h-16 w-full justify-between"
            variant="outline"
            onClick={handleVoiceCall}
            disabled={isConnecting || isPending}
          >
            <div className="flex items-center gap-x-2">
              <PhoneIcon className="size-4" />
              <span>
                {isConnecting ? "Connecting..." : "Start voice call"}
              </span>
            </div>
            <ChevronRightIcon />
          </Button>
        )}

        {/* Voice Configuration Info - For debugging */}
        {isConfigured && (
          <div className="text-xs text-muted-foreground text-center">
            <p>Voice support enabled</p>
          </div>
        )}

        {/* Error Display */}
        {vapiError && (
          <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive">
            {vapiError}
          </div>
        )}
      </div>

      <WidgetFooter />
    </>
  );
};
