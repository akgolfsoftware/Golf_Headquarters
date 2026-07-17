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
import { T } from "@/lib/v2/tokens";
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
  SecondaryLink,
} from "@/components/auth/onboarding/wizard-chrome";
import {
  Field,
  TextField,
  FieldGroupLabel,
  HeroIllo,
  AgreeItem,
  SecurityStrip,
} from "@/components/auth/onboarding/wizard-fields";

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

// Mobil-først body-wrapper — 430px kolonne, DS-token-spacing.
function StepBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-4 px-4 py-6">
      {children}
    </div>
  );
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
    1: "1 av 4 · Velkommen",
    2: "2 av 4 · Din info",
    3: "3 av 4 · Vilkår og samtykke",
    4: "4 av 4 · Betaling",
  };

  return (
    <div className="w-full">
      {/* progress + header (felles chrome) */}
      <div className="mx-auto w-full max-w-[430px] px-4 pt-4">
        <ProgressDots total={TOTAL_STEPS} current={step} />
        <div className="mt-3">
          <StepHeader
            step={step}
            total={TOTAL_STEPS}
            eyebrow={eyebrowFor[step]}
            onBack={tilbake}
            canGoBack={step > 1}
            disabled={pending}
          />
        </div>
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
          <div
            className="px-4 py-4"
            style={{ borderRadius: 14, background: T.panel2, border: `1px solid ${T.border}` }}
          >
            <p className="text-[13px] leading-relaxed" style={{ color: T.mut }}>
              Du får din egen{" "}
              <strong style={{ fontWeight: 600, color: T.fg }}>foreldre-portal</strong> med
              innsyn i planer, runder, fakturaer og fremgang. Du kan også sende meldinger til
              Anders direkte.
            </p>
          </div>
          <div
            className="px-4 py-4"
            style={{
              borderRadius: 14,
              background: `color-mix(in srgb, ${T.lime} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${T.lime} 35%, transparent)`,
            }}
          >
            <blockquote
              className="italic leading-snug"
              style={{ fontFamily: T.disp, fontSize: 15, color: T.fg }}
            >
              Foreldre er den viktigste støttespilleren en ung utøver har. Vi gjør alt vi kan for
              at du skal føle deg trygg på hva vi gjør — og hvorfor.
            </blockquote>
            <cite
              className="mt-2 block not-italic"
              style={{
                fontFamily: T.mono,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: T.lime,
              }}
            >
              Anders Kristiansen · Head Coach
            </cite>
          </div>
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
          <div className="grid grid-cols-3 gap-2">
            {RELASJONER.map((rel) => {
              const selected = parentRelation === rel.id;
              return (
                <button
                  key={rel.id}
                  type="button"
                  onClick={() => setParentRelation(rel.id)}
                  aria-pressed={selected}
                  className="v2-press v2-focus"
                  style={{
                    appearance: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 44,
                    borderRadius: 11,
                    cursor: "pointer",
                    fontFamily: T.ui,
                    fontSize: 13,
                    fontWeight: 600,
                    background: selected ? T.panel3 : T.panel2,
                    border: `1px solid ${selected ? T.lime : T.border}`,
                    color: selected ? T.fg : T.mut,
                  }}
                >
                  {rel.label}
                </button>
              );
            })}
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

          {/* Abonnement-oppsummering — mørkt forest-merkevarekort (fast forest,
              hvit tekst — uavhengig av tema, samme idiom som HeroIllo) */}
          <div
            className="flex flex-col gap-1 px-4 py-4"
            style={{ borderRadius: 16, background: T.forest }}
          >
            <span
              style={{
                fontFamily: T.mono,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.75)",
              }}
            >
              Abonnement
            </span>
            <span style={{ fontFamily: T.disp, fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.96)" }}>
              AK Golf Academy PRO
            </span>
            <span
              style={{
                fontFamily: T.mono,
                fontSize: 28,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.01em",
                fontVariantNumeric: "tabular-nums",
                color: "rgba(255,255,255,0.96)",
              }}
            >
              299 kr/mnd
            </span>
            <span
              className="mt-1"
              style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.04em", color: "rgba(255,255,255,0.65)" }}
            >
              Avsluttes når som helst · 30 dagers oppsigelse
            </span>
          </div>

          <FieldGroupLabel>Velg betalingsmetode</FieldGroupLabel>
          <div className="grid grid-cols-3 gap-2">
            {BETALINGSMETODER.map(({ id, label, sub, anbefalt, icon: Icon }) => {
              const selected = paymentMethod === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPaymentMethod(id)}
                  aria-pressed={selected}
                  className="v2-press v2-focus"
                  style={{
                    position: "relative",
                    appearance: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    borderRadius: 13,
                    padding: "12px 8px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: selected ? T.panel3 : T.panel2,
                    border: `1px solid ${selected ? T.lime : T.border}`,
                  }}
                >
                  {anbefalt && (
                    <span
                      style={{
                        position: "absolute",
                        top: -9,
                        right: 6,
                        borderRadius: 4,
                        background: T.lime,
                        padding: "2px 6px",
                        fontFamily: T.mono,
                        fontSize: 8,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: T.onLime,
                      }}
                    >
                      Anbefalt
                    </span>
                  )}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      borderRadius: 9999,
                      background: selected
                        ? `color-mix(in srgb, ${T.lime} 14%, transparent)`
                        : T.panel3,
                      color: selected ? T.lime : T.mut,
                    }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span
                    style={{ fontFamily: T.disp, fontSize: 12.5, fontWeight: 700, letterSpacing: "-0.015em", color: T.fg }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: 8,
                      fontWeight: 600,
                      lineHeight: 1.4,
                      letterSpacing: "0.04em",
                      color: T.mut,
                    }}
                  >
                    {sub}
                  </span>
                </button>
              );
            })}
          </div>

          <SecurityStrip>
            Sikret med Stripe · 256-bit kryptering · GDPR-kompatibelt
          </SecurityStrip>

          <PrimaryCta onClick={fullfor} disabled={pending} icon={Users}>
            {pending ? "Aktiverer…" : "Fullfør og aktiver"}
          </PrimaryCta>
        </StepBody>
      )}

      {error && (
        <div className="mx-auto mb-4 w-full max-w-[430px] px-4">
          <div
            className="px-4 py-3 text-[13px]"
            style={{
              borderRadius: 11,
              border: `1px solid color-mix(in srgb, ${T.down} 30%, transparent)`,
              background: `color-mix(in srgb, ${T.down} 10%, transparent)`,
              color: T.down,
            }}
            role="alert"
          >
            {error}
          </div>
        </div>
      )}

      {step > 1 && step < TOTAL_STEPS && (
        <div className="mx-auto w-full max-w-[430px] px-4 pb-6">
          <SecondaryLink onClick={tilbake} disabled={pending}>
            Tilbake
          </SecondaryLink>
        </div>
      )}
    </div>
  );
}
