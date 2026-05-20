import { OnboardingClient } from "./onboarding-client";

export default function OnboardingPage() {
  // Onboarding er åpent for innloggede og ikke-innloggede — auth-sjekk
  // gjøres ved completeOnboarding hvis brukeren er innlogget.
  return <OnboardingClient defaultName="Markus Røinås Pedersen" />;
}
