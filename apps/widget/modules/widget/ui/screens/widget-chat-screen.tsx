"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {useThreadMessages,toUIMessages} from "@convex-dev/agent/react";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { Button} from "@workspace/ui/components/button";
import { ArrowLeft, MenuIcon } from "lucide-react";
import { useAtomValue,useSetAtom } from "jotai";
import { conversationIdAtom, organizationIdAtom, contactSessionIdAtomFamily, screenAtom } from"../../atoms/widget-atoms";
import { api } from "@workspace/backend/_generated/api";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {DicebearAvatar} from "@workspace/ui/components/dicebear-avatar";
import {useAction,useQuery} from "convex/react";
import { Form,FormField } from "@workspace/ui/components/form";
import {useInfiniteScroll} from "@workspace/ui/hooks/use-infinite-scroll";
import {InfiniteScrollTrigger} from "@workspace/ui/components/infinite-scroll-trigger";

import {
  AIInput,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@workspace/ui/components/ai/input";

import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { AISuggestions, AISuggestion } from "@workspace/ui/components/ai/suggestion";
import { Value } from "convex/values";
import { useWidgetSettings } from "@/modules/widget/hooks/use-widget-settings";
import { useVapi } from "@/modules/widget/hooks/use-vapi";
import { VoiceMicrophoneButton } from "@/modules/widget/ui/components/voice-microphone-button";
import { VoiceStatusBanner } from "@/modules/widget/ui/components/voice-status-banner";
import { VoiceTranscriptMessage } from "@/modules/widget/ui/components/voice-transcript-message";

const formSchema = z.object({
  message: z.string().min(1,"Message is required"),

});




export const WidgetChatScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);
  const conversationId = useAtomValue(conversationIdAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  // Fetch widget settings for greeting and suggestions
  const widgetSettings = useWidgetSettings(organizationId || undefined);

  // Initialize Vapi for voice support
  const {
    isConfigured: isVapiConfigured,
    isConnected: isVoiceCallActive,
    isConnecting: isVoiceCallConnecting,
    isSpeaking: isAssistantSpeaking,
    transcript: voiceTranscript,
    startCall: startVoiceCall,
    endCall: endVoiceCall,
    error: vapiError,
  } = useVapi();

  const onBack = () => {
    // End voice call if active when navigating away
    if (isVoiceCallActive) {
      endVoiceCall();
    }
    setConversationId(null);
    setScreen("selection");
  };

  const conversation = useQuery(
    api.public.conversations.getOne,
    conversationId && contactSessionId
      ? {
          conversationId,
          contactSessionId,
        }
      : "skip"
  );

  const messages = useThreadMessages(
    api.public.messages.getMany,
    conversation?.threadId && contactSessionId
      ? {
          threadId: conversation.threadId,
          contactSessionId,
        }
      : "skip",
      { initialNumItems: 10 },
    );

  // Get suggestions as array, filtering out undefined values
  const suggestions = widgetSettings?.defaultSuggestions
    ? [
        widgetSettings.defaultSuggestions.suggestion1,
        widgetSettings.defaultSuggestions.suggestion2,
        widgetSettings.defaultSuggestions.suggestion3,
      ].filter((s): s is string => !!s)
    : [];

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } = useInfiniteScroll({
    status: messages.status,
    loadMore: messages.loadMore,
    loadSize: 10
  });




  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const createMessage = useAction(api.public.messages.create);
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!conversation || !contactSessionId) {
      return;
    }

    form.reset();

    await createMessage({
      threadId: conversation.threadId,
      prompt: values.message,
      contactSessionId,
    });
  };

  // Handler for suggestion clicks
  const handleSuggestionClick = (suggestion: string) => {
    form.setValue("message", suggestion);
    form.handleSubmit(onSubmit)();
  };

  // Handler for voice toggle
  const handleVoiceToggle = () => {
    if (isVoiceCallActive) {
      endVoiceCall();
    } else {
      startVoiceCall();
    }
  };

  // Determine voice status for banner
  const getVoiceStatus = ():
    | "connecting"
    | "listening"
    | "speaking"
    | "error"
    | null => {
    if (vapiError) return "error";
    if (isVoiceCallConnecting) return "connecting";
    if (isAssistantSpeaking) return "speaking";
    if (isVoiceCallActive) return "listening";
    return null;
  };

  const voiceStatus = getVoiceStatus();



  return (
    <>
      <WidgetHeader className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Button
            size ="icon"
            variant="transparent"
            onClick={onBack}

          >
            <ArrowLeft />


          </Button>
          <p>Chat</p>


        </div>
        <Button
          size="icon"
          variant="transparent"
        >
          <MenuIcon />
        </Button>

      </WidgetHeader>

      {/* Voice Status Banner - shown when voice call is active */}
      {voiceStatus && (
        <VoiceStatusBanner
          status={voiceStatus}
          message={vapiError || undefined}
          onEndCall={isVoiceCallActive ? endVoiceCall : undefined}
        />
      )}

      <AIConversation>
        <AIConversationContent>
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />

          {/* Regular chat messages */}
          {toUIMessages(messages.results ?? [])?.map((message, index) => {
            // Check if this is the first message (greeting message)
            const isFirstMessage = index === 0;
            const showSuggestions = isFirstMessage && suggestions.length > 0;
            return (
              <AIMessage
                from={message.role === "user" ? "user" : "assistant"}
                key={message.id}
              >
                <AIMessageContent>
                  <AIResponse>
                    {(message as any).content}
                  </AIResponse>
                  {/* Show suggestions on the first assistant message (greeting) */}
                  {showSuggestions && message.role === "assistant" && (
                    <AISuggestions>
                      {suggestions.map((suggestion, suggestionIndex) => (
                        <AISuggestion
                          key={suggestionIndex}
                          suggestion={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                        />
                      ))}
                    </AISuggestions>
                  )}
                </AIMessageContent>

                {message.role === "assistant" && (
                <DicebearAvatar
                  imageUrl="/logo.svg"
                  seed="assistant"
                  size={32}
                />
              )}



              </AIMessage>
            );
          })}

          {/* Voice transcript messages - displayed in chat */}
          {voiceTranscript.map((transcriptMsg, index) => (
            <VoiceTranscriptMessage
              key={`voice-${index}`}
              role={transcriptMsg.role}
              text={transcriptMsg.text}
              timestamp={transcriptMsg.timestamp}
            />
          ))}
        </AIConversationContent>
    </AIConversation>

    <Form {...form}>
      <AIInput
        className="rounded-none border-x-0 border-b-0"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          disabled={conversation?.status === "resolved"}
          name="message"
          render={({ field }) => (
            <AIInputTextarea
              disabled={conversation?.status === "resolved"}
              onChange={field.onChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  form.handleSubmit(onSubmit)();
                }
              }}
                            placeholder={
                conversation?.status === "resolved"
                  ? "This conversation has been resolved."
                  : "Type your message..."
              }
              value={field.value}
              />




          )}
        />

        <AIInputToolbar>
          <AIInputTools>
            {/* Voice microphone button - only shown if Vapi is configured */}
            {isVapiConfigured && (
              <VoiceMicrophoneButton
                isRecording={isVoiceCallActive}
                isDisabled={conversation?.status === "resolved"}
                onToggle={handleVoiceToggle}
              />
            )}
          </AIInputTools>
          <AIInputSubmit
            disabled={conversation?.status === "resolved" || !form.formState.isValid}
            status="ready"
            type="submit"
          />
      </AIInputToolbar>


      </AIInput>
    </Form>




    </>
  )
}
