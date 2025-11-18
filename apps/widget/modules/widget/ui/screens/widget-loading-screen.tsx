"use client";
import { useState, useEffect } from "react";
import { useSetAtom, useAtomValue } from "jotai";
import { LoaderIcon } from "lucide-react";
import {
  contactSessionIdAtomFamily,
  errorMessageAtom,
  loadingMessageAtom,
  organizationIdAtom,
  screenAtom,
  vapiSecretsAtom,
} from "@/modules/widget/atoms/widget-atoms";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { api } from "@workspace/backend/_generated/api";
import { useAction, useMutation, useQuery } from "convex/react";

/**
 * Widget Initialization Steps
 * - org: Validate organization exists and is configured
 * - session: Validate contact session (if exists in localStorage)
 * - settings: Load widget settings (greeting, suggestions, vapi config)
 * - vapi: Load Vapi secrets and validate configuration
 * - done: Transition to appropriate screen (auth/selection)
 */
type InitStep = "org" | "session" | "settings" | "vapi" | "done";

export const WidgetLoadingScreen = ({
  organizationId,
}: {
  organizationId: string | null;
}) => {
  const [step, setStep] = useState<InitStep>("org");
  const [sessionValid, setSessionValid] = useState(false);

  const loadingMessage = useAtomValue(loadingMessageAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setScreen = useSetAtom(screenAtom);
  const setLoadingMessage = useSetAtom(loadingMessageAtom);
  const setOrganizationId = useSetAtom(organizationIdAtom);
  const setVapiSecrets = useSetAtom(vapiSecretsAtom);

  // Convex actions and mutations
  const validateOrganization = useAction(api.public.organizations.validate);
  const validateContactSession = useMutation(
    api.public.contactSessions.validate
  );
  const getVapiSecrets = useAction(api.public.secrets.getVapiSecrets);

  // Convex queries (only active when needed)
  const widgetSettings = useQuery(
    api.public.widgetSettings.getByOrganizationId,
    step === "settings" && organizationId ? { organizationId } : "skip"
  );

  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  /**
   * Step 1: Validate Organization
   * Ensures the organization exists and is properly configured
   */
  useEffect(() => {
    if (step !== "org") {
      return;
    }

    setLoadingMessage("Finding organization...");

    if (!organizationId) {
      setErrorMessage("Organization ID is required");
      setScreen("error");
      return;
    }

    setOrganizationId(organizationId);

    setLoadingMessage("Verifying organization...");
    validateOrganization({ organizationId })
      .then((result) => {
        if (result.valid) {
          setOrganizationId(organizationId);
          setStep("session");
        } else {
          setErrorMessage(result.reason || "Invalid configuration");
          setScreen("error");
        }
      })
      .catch(() => {
        setErrorMessage("Unable to verify organization");
        setScreen("error");
      });
  }, [
    step,
    organizationId,
    setErrorMessage,
    setScreen,
    setOrganizationId,
    validateOrganization,
    setLoadingMessage,
  ]);

  /**
   * Step 2: Validate Contact Session
   * Checks if user has an existing valid session in localStorage
   */
  useEffect(() => {
    if (step !== "session") {
      return;
    }

    setLoadingMessage("Finding contact session...");

    if (!contactSessionId) {
      setSessionValid(false);
      setStep("settings"); // Proceed to load settings even without session
      return;
    }

    setLoadingMessage("Validating session...");

    validateContactSession({ contactSessionId })
      .then((result) => {
        setSessionValid(result.valid);
        setStep("settings");
      })
      .catch(() => {
        setSessionValid(false);
        setStep("settings");
      });
  }, [step, contactSessionId, validateContactSession, setLoadingMessage]);

  /**
   * Step 3: Load Widget Settings
   * Fetches organization's widget configuration including Vapi settings
   */
  useEffect(() => {
    if (step !== "settings") {
      return;
    }

    setLoadingMessage("Loading widget settings...");

    // widgetSettings query is reactive - wait for it to load
    if (widgetSettings === undefined) {
      // Still loading
      return;
    }

    if (widgetSettings === null) {
      // Failed to load - use defaults and skip Vapi
      console.warn("Widget settings not found, using defaults");
      setStep("done");
      return;
    }

    // Settings loaded successfully
    // Check if Vapi is configured in settings
    const hasVapiSettings =
      widgetSettings.vapiSettings?.assistantId ||
      widgetSettings.vapiSettings?.phoneNumber;

    if (hasVapiSettings) {
      // Proceed to load Vapi secrets
      setStep("vapi");
    } else {
      // No Vapi configured - skip to done
      setStep("done");
    }
  }, [step, widgetSettings]);

  /**
   * Step 4: Load Vapi Secrets
   * Retrieves Vapi public API key and validates complete configuration
   */
  useEffect(() => {
    if (step !== "vapi") {
      return;
    }

    if (!organizationId) {
      setStep("done");
      return;
    }

    setLoadingMessage("Loading voice capabilities...");

    getVapiSecrets({ organizationId })
      .then((secrets) => {
        if (secrets) {
          // Successfully loaded secrets - update Vapi secrets atom
          setVapiSecrets({
            publicApiKey: secrets.publicKey,
          });
        } else {
          // No secrets found - Vapi not configured
          console.warn("Vapi secrets not found");
          setVapiSecrets(null);
        }
        setStep("done");
      })
      .catch((error) => {
        console.error("Failed to load Vapi secrets:", error);
        // Non-fatal error - continue without Vapi
        setVapiSecrets(null);
        setStep("done");
      });
  }, [
    step,
    organizationId,
    widgetSettings,
    getVapiSecrets,
    setVapiSecrets,
    setLoadingMessage,
  ]);

  /**
   * Step 5: Done - Transition to Appropriate Screen
   * Routes to either auth (new user) or selection (returning user)
   */
  useEffect(() => {
    if (step !== "done") {
      return;
    }

    const hasValidSession = contactSessionId && sessionValid;
    setScreen(hasValidSession ? "selection" : "auth");
  }, [step, contactSessionId, sessionValid, setScreen]);

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">Hi there! 👋</p>
          <p className="text-lg ">Let&apos;s get you started</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
        <LoaderIcon className="animate-spin" />
        <p className="text-sm">{loadingMessage || "Loading..."}</p>
      </div>
    </>
  );
};
