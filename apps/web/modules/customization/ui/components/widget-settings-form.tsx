"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Spinner } from "@workspace/ui/components/spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {
  widgetSettingsSchema,
  type WidgetSettingsFormData,
} from "../../lib/widget-settings-schema";
import { useVapiAssistants, useVapiPhoneNumbers } from "@/modules/plugins/hooks/use-vapi-data";

/**
 * Widget Settings Form Component
 * Allows users to configure widget settings including:
 * - Greeting message
 * - Default suggestions
 * - VAPI settings (if connected)
 */
export const WidgetSettingsForm = () => {
  // Fetch existing widget settings
  const existingSettings = useQuery(api.private.widgetSettings.getOne);

  // Fetch VAPI plugin status
  const vapiPlugin = useQuery(api.private.plugins.getOne, { service: "vapi" });

  // Fetch VAPI data (only if connected)
  const { data: assistants, isLoading: assistantsLoading } = useVapiAssistants();
  const { data: phoneNumbers, isLoading: phoneNumbersLoading } = useVapiPhoneNumbers();

  // Mutation to save widget settings
  const upsertSettings = useMutation(api.private.widgetSettings.upsert);

  // Initialize form with default values
  const form = useForm<WidgetSettingsFormData>({
    resolver: zodResolver(widgetSettingsSchema),
    defaultValues: {
      greetMessage: existingSettings?.greetMessage || "",
      defaultSuggestions: {
        suggestion1: existingSettings?.defaultSuggestions?.suggestion1 || "",
        suggestion2: existingSettings?.defaultSuggestions?.suggestion2 || "",
        suggestion3: existingSettings?.defaultSuggestions?.suggestion3 || "",
      },
      vapiSettings: {
        assistantId: existingSettings?.vapiSettings?.assistantId || "",
        phoneNumber: existingSettings?.vapiSettings?.phoneNumber || "",
      },
    },
  });

  // Update form values when settings are loaded
  if (existingSettings && !form.formState.isDirty) {
    form.reset({
      greetMessage: existingSettings.greetMessage,
      defaultSuggestions: {
        suggestion1: existingSettings.defaultSuggestions?.suggestion1 || "",
        suggestion2: existingSettings.defaultSuggestions?.suggestion2 || "",
        suggestion3: existingSettings.defaultSuggestions?.suggestion3 || "",
      },
      vapiSettings: {
        assistantId: existingSettings.vapiSettings?.assistantId || "",
        phoneNumber: existingSettings.vapiSettings?.phoneNumber || "",
      },
    });
  }

  // Handle form submission
  const onSubmit = async (data: WidgetSettingsFormData) => {
    try {
      await upsertSettings({
        greetMessage: data.greetMessage,
        defaultSuggestions: {
          suggestion1: data.defaultSuggestions.suggestion1 || undefined,
          suggestion2: data.defaultSuggestions.suggestion2 || undefined,
          suggestion3: data.defaultSuggestions.suggestion3 || undefined,
        },
        vapiSettings: {
          assistantId: data.vapiSettings.assistantId || undefined,
          phoneNumber: data.vapiSettings.phoneNumber || undefined,
        },
      });

      toast.success("Widget settings saved successfully!");
    } catch (error) {
      console.error("Failed to save widget settings:", error);
      toast.error("Failed to save widget settings. Please try again.");
    }
  };

  // Show loading spinner while fetching settings
  if (existingSettings === undefined) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const isVapiConnected = !!vapiPlugin;
  const isVapiDataLoading = assistantsLoading || phoneNumbersLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Greeting Message Section */}
        <Card>
          <CardHeader>
            <CardTitle>Greeting Message</CardTitle>
            <CardDescription>
              This message will be displayed when users first open the chat widget.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="greetMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Hello! How can I help you today?"
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a friendly greeting message for your customers.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Default Suggestions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Default Suggestions</CardTitle>
            <CardDescription>
              Quick action buttons that appear below the greeting message.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="defaultSuggestions.suggestion1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suggestion 1</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Track my order" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultSuggestions.suggestion2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suggestion 2</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Return an item" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultSuggestions.suggestion3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suggestion 3</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Contact support" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* VAPI Settings Section (only shown if VAPI is connected) */}
        {isVapiConnected && (
          <Card>
            <CardHeader>
              <CardTitle>VAPI Voice Settings</CardTitle>
              <CardDescription>
                Configure voice assistant settings for your widget.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isVapiDataLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Spinner className="h-6 w-6" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Loading VAPI data...
                  </span>
                </div>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="vapiSettings.assistantId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assistant</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!assistants || assistants.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an assistant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {assistants && assistants.length > 0 ? (
                              assistants.map((assistant) => (
                                <SelectItem key={assistant.id} value={assistant.id}>
                                  {assistant.name || assistant.id}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                No assistants available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the VAPI assistant to use for voice interactions.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vapiSettings.phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!phoneNumbers || phoneNumbers.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a phone number" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {phoneNumbers && phoneNumbers.length > 0 ? (
                              phoneNumbers.map((phone) => (
                                <SelectItem key={phone.id} value={phone.id}>
                                  {phone.number || phone.id}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                No phone numbers available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the phone number for voice calls.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || !form.formState.isDirty}
          >
            {form.formState.isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
