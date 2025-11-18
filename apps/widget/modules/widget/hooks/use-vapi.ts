/**
 * useVapi Hook
 * Manages Vapi voice call integration with organization-level configuration
 *
 * Features:
 * - Initializes Vapi client with organization's public API key
 * - Manages call state (connected, connecting, speaking)
 * - Handles real-time transcript with role-based messages
 * - Provides call control methods (start, end)
 *
 * Configuration:
 * - Public API key loaded from organization secrets (via vapiSecretsAtom)
 * - Assistant ID from widget settings (fetched via useQuery)
 * - Automatically configured during widget initialization
 */

import Vapi from "@vapi-ai/web";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAtomValue } from "jotai";
import { vapiSecretsAtom, organizationIdAtom } from "@/modules/widget/atoms/widget-atoms";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

/**
 * Transcript message structure
 * Tracks conversation between user and AI assistant
 */
interface TranscriptMessage {
  role: "user" | "assistant";
  text: string;
  timestamp?: number; // Optional: when message was received
}

/**
 * Vapi Hook Return Type
 * Provides voice call state and control methods
 */
interface UseVapiReturn {
  isConfigured: boolean; // Whether Vapi is properly set up
  isConnected: boolean; // Whether call is active
  isConnecting: boolean; // Whether call is being established
  isSpeaking: boolean; // Whether assistant is currently speaking
  transcript: TranscriptMessage[]; // Conversation history
  startCall: () => void; // Initiate voice call
  endCall: () => void; // Terminate voice call
  error: string | null; // Error message if any
}

/**
 * useVapi - Voice Integration Hook
 *
 * Usage:
 * ```tsx
 * const { isConfigured, startCall, endCall, transcript } = useVapi();
 *
 * if (!isConfigured) {
 *   return <p>Voice not available</p>;
 * }
 *
 * return (
 *   <button onClick={startCall}>Start Call</button>
 * );
 * ```
 */
export const useVapi = (): UseVapiReturn => {
  // Get Vapi secrets from global state (loaded during initialization)
  const vapiSecrets = useAtomValue(vapiSecretsAtom);
  const organizationId = useAtomValue(organizationIdAtom);

  // Fetch widget settings to get assistant ID
  const widgetSettings = useQuery(
    api.public.widgetSettings.getByOrganizationId,
    organizationId ? { organizationId } : "skip"
  );

  // Use ref to hold Vapi instance (prevents stale closures)
  const vapiRef = useRef<Vapi | null>(null);

  // Call state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Conversation state
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Derived state: Is Vapi fully configured?
  const isConfigured =
    !!vapiSecrets?.publicApiKey && !!widgetSettings?.vapiSettings?.assistantId;

  /**
   * Initialize Vapi Client
   * Creates instance with organization's public API key
   * Sets up event listeners for call lifecycle
   *
   * FIXED: Proper cleanup of event listeners and instance
   */
  useEffect(() => {
    // Don't initialize if Vapi not configured
    if (!vapiSecrets?.publicApiKey) {
      console.warn("Vapi not configured - no public API key");
      return;
    }

    try {
      // Create Vapi instance with organization's public key
      const vapiInstance = new Vapi(vapiSecrets.publicApiKey);
      vapiRef.current = vapiInstance;

      // Event handlers (defined outside to allow removal)
      const handleCallStart = () => {
        console.log("Vapi call started");
        setIsConnected(true);
        setIsConnecting(false);
        setTranscript([]); // Clear previous conversation
        setError(null);
      };

      const handleCallEnd = () => {
        console.log("Vapi call ended");
        setIsConnected(false);
        setIsConnecting(false);
        setIsSpeaking(false);
      };

      const handleSpeechStart = () => {
        setIsSpeaking(true);
      };

      const handleSpeechEnd = () => {
        setIsSpeaking(false);
      };

      const handleError = (errorEvent: any) => {
        console.error("Vapi error:", errorEvent);
        setError(errorEvent?.message || "Voice call error occurred");
        setIsConnecting(false);
        setIsConnected(false);
      };

      const handleMessage = (message: any) => {
        // Only process final transcript messages
        if (message.type === "transcript" && message.transcriptType === "final") {
          setTranscript((prev) => [
            ...prev,
            {
              role: message.role === "user" ? "user" : "assistant",
              text: message.transcript,
              timestamp: Date.now(),
            },
          ]);
        }
      };

      // Attach event listeners
      vapiInstance.on("call-start", handleCallStart);
      vapiInstance.on("call-end", handleCallEnd);
      vapiInstance.on("speech-start", handleSpeechStart);
      vapiInstance.on("speech-end", handleSpeechEnd);
      vapiInstance.on("error", handleError);
      vapiInstance.on("message", handleMessage);

      // Cleanup: PROPERLY remove listeners and stop call
      return () => {
        console.log("Cleaning up Vapi instance");

        // Remove all event listeners to prevent memory leaks
        vapiInstance.off("call-start", handleCallStart);
        vapiInstance.off("call-end", handleCallEnd);
        vapiInstance.off("speech-start", handleSpeechStart);
        vapiInstance.off("speech-end", handleSpeechEnd);
        vapiInstance.off("error", handleError);
        vapiInstance.off("message", handleMessage);

        // Stop any active call
        try {
          vapiInstance.stop();
        } catch (err) {
          console.warn("Error stopping Vapi during cleanup:", err);
        }

        // Clear ref
        vapiRef.current = null;
      };
    } catch (err) {
      console.error("Failed to initialize Vapi:", err);
      setError("Failed to initialize voice system");
      vapiRef.current = null;
    }
  }, [vapiSecrets?.publicApiKey]);

  /**
   * Start Voice Call
   * Initiates call with configured assistant
   *
   * FIXED: Uses ref instead of state to avoid stale closures
   * FIXED: Uses latest widgetSettings via dependency
   */
  const startCall = useCallback(() => {
    const vapi = vapiRef.current;

    if (!vapi) {
      setError("Voice system not initialized");
      return;
    }

    const assistantId = widgetSettings?.vapiSettings?.assistantId;
    if (!assistantId) {
      setError("No assistant configured");
      return;
    }

    if (isConnected || isConnecting) {
      console.warn("Call already active or connecting");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // Start call with organization's configured assistant
      vapi.start(assistantId);
      console.log("Starting call with assistant:", assistantId);
    } catch (err) {
      console.error("Failed to start call:", err);
      setError("Failed to start voice call");
      setIsConnecting(false);
    }
  }, [widgetSettings, isConnected, isConnecting]);

  /**
   * End Voice Call
   * Terminates active call gracefully
   *
   * FIXED: Uses ref to get current instance
   */
  const endCall = useCallback(() => {
    const vapi = vapiRef.current;

    if (!vapi) {
      return;
    }

    try {
      vapi.stop();
      console.log("Ending call");
    } catch (err) {
      console.error("Failed to end call:", err);
    }
  }, []);

  return {
    isConfigured,
    isConnected,
    isConnecting,
    isSpeaking,
    transcript,
    startCall,
    endCall,
    error,
  };
};
