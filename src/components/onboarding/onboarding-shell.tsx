"use client";

/**
 * OnboardingShell — V2/B (2026-07-22).
 * Gjenbruker samme lyse veiviser-flate som auth-onboarding (VeiviserFlate).
 * Gammel mørk CSS-shell er avviklet.
 */
import { VeiviserFlate } from "@/components/auth/onboarding/wizard-chrome";

type Props = {
  children: React.ReactNode;
};

export function OnboardingShell({ children }: Props) {
  return <VeiviserFlate>{children}</VeiviserFlate>;
}
