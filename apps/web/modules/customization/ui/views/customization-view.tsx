"use client";

import { WidgetSettingsForm } from "../components/widget-settings-form";

/**
 * Customization View
 * Main page component for customizing widget settings
 */
export const CustomizationView = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Widget Customization</h1>
        <p className="text-muted-foreground mt-2">
          Customize your AI support widget appearance and behavior
        </p>
      </div>

      <WidgetSettingsForm />
    </div>
  );
};
