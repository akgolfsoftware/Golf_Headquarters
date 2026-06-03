/**
 * Preview-rute (offentlig, ingen auth) for Auth — Onboarding-wizard, steg 1.
 * Rendrer <Onboarding> som selvstendig full side (forest-bakgrunn, hvit logo
 * øverst, sentrert hvitt kort — ingen app-sidebar) med hardkodet demo-data som
 * matcher v10-fasiten (public/design-handover/_screens/pl-onboarding.png).
 *
 * INGEN Prisma/DB/auth her — kun presentasjon.
 */

import { Onboarding, type OnboardingData } from "@/components/auth/onboarding";

// ── Demo-data — matcher pl-onboarding.png ────────────────────────────────────
const demoOnboarding: OnboardingData = {
  stegTotalt: 7,
  stegNaa: 1,
  eyebrowVenstre: "1 av 7 · Velkommen",
  eyebrowHoyre: "Steg 1 av 7",
  heroLabel: "Velkommen",
  overskriftFor: "Vi ",
  overskriftAksent: "gleder oss",
  overskriftEtter: " til å jobbe med deg.",
  brodtekst:
    "Coach Anders har invitert deg inn i AK Golf Academy. De neste minuttene tar vi en kort gjennomgang for å sette opp profilen din.",
  sitat:
    "Vi tenker langsiktig. Du blir bedre ved å gjøre de små tingene riktig — hver dag, i 3 år, i 5 år. Vi bygger karriere, ikke quick fixes.",
  sitatNavn: "Anders Kristiansen · Head Coach",
  tilbakefallTekst: "Du kan når som helst gå tilbake, lagre og fortsette senere.",
  tilbakefallUthevet: "Ingenting er låst før du bekrefter siste steg.",
  ctaLabel: "La oss starte",
  ctaHref: "/auth/onboarding/konto",
  vilkarHref: "/personvern",
};

export default function OnboardingPreviewPage() {
  return <Onboarding data={demoOnboarding} />;
}
