/**
 * Voice Waveform Display Component
 * Animated visualization for active voice calls
 *
 * Features:
 * - Animated bars simulating audio waveform
 * - Different states: listening, speaking, idle
 * - Smooth transitions between states
 * - Customizable color and size
 */

"use client";

import { cn } from "@workspace/ui/lib/utils";

interface VoiceWaveformProps {
  isActive: boolean;
  isSpeaking?: boolean;
  className?: string;
}

export const VoiceWaveform = ({
  isActive,
  isSpeaking = false,
  className,
}: VoiceWaveformProps) => {
  // Generate 5 bars with different animation delays
  const bars = Array.from({ length: 5 }, (_, i) => i);

  return (
    <>
      {/* Global CSS for waveform animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes waveform {
            0%, 100% {
              height: 8px;
            }
            50% {
              height: 24px;
            }
          }
        `
      }} />

      <div
        className={cn(
          "flex items-center justify-center gap-1",
          className
        )}
        aria-label={
          isSpeaking
            ? "Assistant is speaking"
            : isActive
            ? "Listening"
            : "Voice inactive"
        }
      >
        {bars.map((i) => (
          <div
            key={i}
            className={cn(
              "w-1 rounded-full bg-primary transition-all duration-150",
              isSpeaking && "bg-blue-500"
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
              height: isActive || isSpeaking ? "8px" : "8px",
              animation: isActive || isSpeaking
                ? "waveform 1s ease-in-out infinite"
                : "none",
            }}
          />
        ))}
      </div>
    </>
  );
};
