"use client";

/**
 * Forelder-onboarding-wizard — MOBIL-FØRST 430px.
 * Foreldre-flyt etter at en mindreårig spiller er satt opp: bekreft info,
 * godkjenn vilkår/samtykke, og sett opp betaling.
 *
 * 4 steg: 1 Velkommen · 2 Din info + relasjon · 3 Vilkår og samtykke ·
 *         4 Betaling.
 *
 * VIKTIG: All steg-logikk og lagre-actions er beholdt uendret — kun
 * presentasjonen er portet til DS-token-komponenter (samme vokabular som
 * spiller-wizarden i onboarding-wizard.tsx). v2-port 16. juli 2026:
 * primitivfilene er restylet til v2-tokens; her er KUN inline-presentasjon
 * (velkomst-kort, relasjon-/betalingsvalg, abonnement-kort, feilboks)
 * flyttet til T-tokens. Steg-maskin og actions 100 % uendret.
 * Ingen hardkodet hex. Ingen emoji — kun lucide-react. Norsk bokmål.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Mail, Smartphone, Users } from "lucide-react";

import {
  saveForelderOnboardingStep,
  completeForelderOnboarding,
  type ForelderOnboardingData,
} from "../actions";
import {
  ProgressDots,
  StepHeader,
  StepHeading,
  PrimaryCta,
  Field,
  TextField,
  FieldGroupLabel,
  HeroIllo,
  OptionRow,
  AgreeItem,
  SecurityStrip,
} from "@/components/auth/precision/veiviser";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { Meta } from "@/components/precision/pa";

// ──────────────────────────────────────────────────────────────────────────────
// Konstanter
// ──────────────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;

const RELASJONER = [
  { id: "MOR", label: "Mor" },
  { id: "FAR", label: "Far" },
  { id: "FORESATT", label: "Foresatt" },
] as const;

const BETALINGSMETODER = [
  { id: "VIPPS", label: "Vipps", sub: "Auto. 20. hver mnd", anbefalt: true, icon: Smartphone },
  { id: "KORT", label: "Kort", sub: "Visa · MC · Stripe", anbefalt: false, icon: CreditCard },
  { id: "FAKTURA", label: "Faktura", sub: "30 dagers frist", anbefalt: false, icon: Mail },
] as const;

// Kolonnen (bredde og luft) eies av VeiviserFlate; steget legger bare blokkene under hverandre.
function StepBody({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-5">{children}</div>;
}

// ──────────────────────────────────────────────────────────────────────────────
// Wizard
// ──────────────────────────────────────────────────────────────────────────────

export function ForelderWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Steg 2
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentRelation, setParentRelation] = useState<"MOR" | "FAR" | "FORESATT">("MOR");

  // Steg 3
  const [acceptedTraining, setAcceptedTraining] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedPayment, setAcceptedPayment] = useState(false);

  // Steg 4
  const [paymentMethod, setPaymentMethod] = useState<"VIPPS" | "KORT" | "FAKTURA">("VIPPS");

  function buildData(): ForelderOnboardingData {
    return {
      parentName: parentName || undefined,
      parentPhone: parentPhone || undefined,
      parentEmail: parentEmail || undefined,
      parentRelation,
      acceptedTermsParent: acceptedTraining,
      acceptedPrivacyParent: acceptedPrivacy,
      acceptedPaymentParent: acceptedPayment,
      paymentMethod,
    };
  }

  function neste() {
    setError(null);
    startTransition(async () => {
      try {
        await saveForelderOnboardingStep(buildData());
      } catch {
        setError("Kunne ikke lagre. Prøv igjen.");
        return;
      }
      if (step < TOTAL_STEPS) {
        setStep(step + 1);
      }
    });
  }

  function tilbake() {
    if (step > 1) setStep(step - 1);
  }

  function fullfor() {
    setError(null);
    startTransition(async () => {
      try {
        await saveForelderOnboardingStep(buildData());
        await completeForelderOnboarding();
      } catch {
        router.push("/portal");
        router.refresh();
      }
    });
  }

  const kanFullfore = acceptedTraining && acceptedPrivacy && acceptedPayment;

  const eyebrowFor: Record<number, string> = {
    1: "Velkommen",
    2: "Din info",
    3: "Vilkår og samtykke",
    4: "Betaling",
  };

  return (
    <div className="flex w-full flex-col gap-5">
      {/* stegstrek + tilbake (felles chrome) */}
      <div className="flex flex-col gap-2">
        <ProgressDots total={TOTAL_STEPS} current={step} etikett="Forelder" />
        <StepHeader
          step={step}
          total={TOTAL_STEPS}
          eyebrow={eyebrowFor[step]}
          onBack={tilbake}
          canGoBack={step > 1}
          disabled={pending}
        />
      </div>

      {/* ── STEG 1 — Velkommen ─────────────────────────────────── */}
      {step === 1 && (
        <StepBody>
          <HeroIllo label="Foreldre-portal" />
          <StepHeading
            title="Hei —"
            emphasis="velkommen inn"
            titleAfter="."
            deck="Coach Anders og spilleren din har akkurat satt opp profilen hos AK Golf Academy. Som foresatt er du en sentral del av utviklingen — uten å være i veien."
          />
          <InlineVarsel tone="info">
            Du får din egen <strong>foreldre-portal</strong> med innsyn i planer, runder, fakturaer og fremgang. Du kan også sende meldinger til Anders direkte.
          </InlineVarsel>
          <PrimaryCta onClick={neste} disabled={pending}>
            La oss begynne
          </PrimaryCta>
        </StepBody>
      )}

      {/* ── STEG 2 — Din info + relasjon ───────────────────────── */}
      {step === 2 && (
        <StepBody>
          <StepHeading
            title="Bekreft"
            emphasis="din info"
            titleAfter="."
            deck="Litt info om deg som foresatt, slik at vi kan sende fakturaer og holde kontakten."
          />
          <Field label="Ditt navn" htmlFor="forelder-navn">
            <TextField
              id="forelder-navn"
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Fullt navn"
              autoComplete="name"
            />
          </Field>
          <Field label="Telefon" htmlFor="forelder-telefon">
            <TextField
              id="forelder-telefon"
              mono
              type="tel"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="+47 ..."
              autoComplete="tel"
            />
          </Field>
          <Field label="E-post" htmlFor="forelder-epost">
            <TextField
              id="forelder-epost"
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="din@epost.no"
              autoComplete="email"
            />
          </Field>

          <FieldGroupLabel>Relasjon</FieldGroupLabel>
          <div className="pa-seg pa-seg--full" role="group" aria-label="Relasjon">
            {RELASJONER.map((rel) => (
              <button
                key={rel.id}
                type="button"
                className="pa-seg__opt"
                onClick={() => setParentRelation(rel.id)}
                aria-pressed={parentRelation === rel.id}
              >
                {rel.label}
              </button>
            ))}
          </div>

          <SecurityStrip>
            Du kan invitere annen foresatt senere fra foreldre-portalen.{" "}
            <strong className="font-semibold">Begge får samme tilgangsnivå.</strong>
          </SecurityStrip>

          <PrimaryCta onClick={neste} disabled={pending}>
            {pending ? "Lagrer…" : "Neste — Godkjenn vilkår"}
          </PrimaryCta>
        </StepBody>
      )}

      {/* ── STEG 3 — Vilkår og samtykke ────────────────────────── */}
      {step === 3 && (
        <StepBody>
          <StepHeading
            title="Vilkår og"
            emphasis="samtykke"
            titleAfter="."
            deck="Som foresatt for en mindreårig spiller må du godkjenne våre vilkår, personvernerklæringen og avtalen om trenings-data."
          />

          <div className="flex flex-col gap-2">
            <AgreeItem
              title="AK Golf Academy treningsavtale"
              desc="Hva spilleren får tilgang til, frekvens og forventninger."
              checked={acceptedTraining}
              onClick={() => setAcceptedTraining(!acceptedTraining)}
            />
            <AgreeItem
              title="Personvernerklæring og datadeling"
              desc="Hvilke data vi samler, hvordan vi bruker dem, og dine rettigheter."
              checked={acceptedPrivacy}
              onClick={() => setAcceptedPrivacy(!acceptedPrivacy)}
            />
            <AgreeItem
              title="Betaling og oppsigelse"
              desc="Faktura månedlig. Avsluttes når som helst med 30 dagers oppsigelse."
              checked={acceptedPayment}
              onClick={() => setAcceptedPayment(!acceptedPayment)}
            />
          </div>

          <SecurityStrip>
            <strong className="font-semibold">Anders Kristiansen og AK Golf Academy</strong> er
            forsikret, registrert som golftrener av NGF og har politiattest. Alle rutiner følger
            NIF sine retningslinjer for arbeid med mindreårige.
          </SecurityStrip>

          <PrimaryCta onClick={neste} disabled={pending || !kanFullfore}>
            {pending ? "Lagrer…" : "Neste — Betaling"}
          </PrimaryCta>
        </StepBody>
      )}

      {/* ── STEG 4 — Betaling ──────────────────────────────────── */}
      {step === 4 && (
        <StepBody>
          <StepHeading
            title="Sett opp"
            emphasis="betaling"
            titleAfter="."
            deck="Spilleren har valgt PRO-abonnement, 299 kr/mnd. Du faktureres månedlig fra dato spilleren er aktivert. Avsluttes når som helst."
          />

          <div className="pa-card" style={{ padding: 16, gap: 4 }}>
            <Meta>ABONNEMENT</Meta>
            <span style={{ font: "600 15px/1.3 var(--font-sans)" }}>AK Golf Academy PRO</span>
            <span style={{ font: "var(--type-num)", fontSize: 28, lineHeight: 1.1 }}>299 kr/mnd</span>
            <Meta>AVSLUTTES NÅR SOM HELST · 30 DAGERS OPPSIGELSE</Meta>
          </div>

          <FieldGroupLabel>Velg betalingsmetode</FieldGroupLabel>
          <div role="radiogroup" aria-label="Betalingsmetode" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {BETALINGSMETODER.map(({ id, label, sub, anbefalt, icon }) => (
              <OptionRow
                key={id}
                label={anbefalt ? `${label} · anbefalt` : label}
                sub={sub}
                icon={icon}
                selected={paymentMethod === id}
                onClick={() => setPaymentMethod(id)}
              />
            ))}
          </div>

          <SecurityStrip>
            Sikret med Stripe · 256-bit kryptering · GDPR-kompatibelt
          </SecurityStrip>

          <PrimaryCta onClick={fullfor} disabled={pending} icon={Users}>
            {pending ? "Aktiverer…" : "Fullfør og aktiver"}
          </PrimaryCta>
        </StepBody>
      )}

      {error && <InlineVarsel tone="signal">{error}</InlineVarsel>}
    </div>
  );
}
