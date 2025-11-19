"use client";

import {
  type LucideIcon,
  BookOpenIcon,
  BotIcon,
  GemIcon,
  MicIcon,
  PaletteIcon,
  PhoneIcon,
  UsersIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

interface Feature {
  icon: LucideIcon;
  label: string;
  description: string;
};

interface PremiumFeatureOverlayProps {
  children: React.ReactNode;
};

const features: Feature[] = [
  {
    icon: BotIcon,
    label: "AI Customer Support",
    description: "Intelligent automated responses 24/7",
  },
  {
    icon: MicIcon,
    label: "Voice Commands",
    description: "Control the app with your voice",
  },
  {
    icon: PhoneIcon,
    label: "Phone Support",
    description: "Intelligent automated responses 24/7",
  },
  {
    icon: BookOpenIcon,
    label: "AI Customer Support",
    description: "Intelligent automated responses 24/7",
  },
  {
    icon: UsersIcon,
    label: "AI Customer Support",
    description: "Intelligent automated responses 24/7",
  },
  {
    icon: PaletteIcon,
    label: "AI Customer Support",
    description: "Intelligent automated responses 24/7",
  },

];


export const PremiumFeatureOverlay = ({
  children
}: PremiumFeatureOverlayProps) => {
    const router = useRouter();







  return (
    <div className="relative min-h-screen">
      {/* Blurred background content */}
      <div className="pointer-events-none select-none blur-[2px]">
        {children}
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
  <Card className="w-full max-w-md">
    <CardHeader className="text-center">
      <div className="flex items-center justify-center">
        <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full border bg-muted">
          <GemIcon className="size-6 text-muted-foreground" />
        </div>
      </div>
      <CardTitle className="text-xl">Premium Feature</CardTitle>
      <CardDescription>
        This feature requires a Pro subscriptions
      </CardDescription>
    </CardHeader>


    <CardContent className="space-y-6">
  {/* Features List */}
  <CardContent className="space-y-6">
  {/* Features List */}
  <div className="space-y-6">
    {features.map((feature) => (
      <div key={feature.label} className="flex items-center gap-4">
        <div className="flex size-8 items-center justify-center rounded-full bg-muted">
          <feature.icon className="size-4 text-muted-foreground" />
        </div>
        <div className="text-left">
          <p className="font-medium text-sm">{feature.label}</p>
          <p className="text-muted-foreground text-xs">{feature.description}</p>
        </div>
      </div>
    ))}
  </div>
  <Button
  className="w-full"
  onClick={() => router.push("/billing")}
  size="lg"
>
  View Plans
</Button>










</CardContent>

  <div className="space-y-6">
  </div>
</CardContent>


  </Card>
</div>


    </div>
  );
};



