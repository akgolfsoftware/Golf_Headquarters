/**
 * Preview-rute (offentlig, ingen auth) for Auth — Registrer konto (tier-valg).
 * Rendrer <SignupSkjerm> som selvstendig full side (sentrert kort på cream-bg,
 * ingen app-sidebar) med hardkodet demo-data som matcher v10-fasiten
 * (public/design-handover/_screens/au-signup.png).
 *
 * INGEN Prisma/DB/auth her — kun presentasjon.
 */

import { SignupSkjerm, type SignupSkjermData } from "@/components/auth/signup-skjerm";

// ── Demo-data — matcher au-signup.png ────────────────────────────────────────
const demoSignup: SignupSkjermData = {
  eyebrow: "AK GOLF · NY KONTO",
  overskriftItalic: "Velkommen",
  overskriftResten: "til AK Golf",
  underTekst: "Lag en konto og kom i gang.",
  medlemskapLabel: "Velg medlemskap",
  tiers: [
    {
      id: "performance-pro",
      navn: "Performance Pro",
      pris: "2 220 kr/mnd",
      beskrivelse: "4 coaching-økter i måneden · PlayerHQ inkludert",
      toppBadge: "Mest populær",
    },
    {
      id: "performance",
      navn: "Performance",
      pris: "1 200 kr/mnd",
      beskrivelse: "2 coaching-økter i måneden · PlayerHQ inkludert",
    },
    {
      id: "playerhq",
      navn: "PlayerHQ",
      pris: "300 kr/mnd",
      beskrivelse: "App-tilgang: tracking, AI-coach, treningsplaner",
      inlineBadge: "1. måned gratis",
    },
  ],
  valgtTierId: "performance-pro",
  fornavnLabel: "Fornavn",
  etternavnLabel: "Etternavn",
  roller: [
    { id: "spiller", label: "Spiller" },
    { id: "foresatt", label: "Foresatt" },
  ],
  valgtRolleId: "spiller",
  ctaLabel: "Opprett konto",
  loggInnPrefiks: "Har du allerede konto?",
  loggInnLabel: "Logg inn",
  loggInnHref: "/auth/login",
  ctaHref: "/auth/onboarding",
  vilkarHref: "/vilkar",
  personvernHref: "/personvern",
};

export default function AuthSignupPreviewPage() {
  return <SignupSkjerm data={demoSignup} />;
}
