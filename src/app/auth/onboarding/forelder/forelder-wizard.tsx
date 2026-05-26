"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ArrowRight,
  ChevronLeft,
  FileText,
  Shield,
  CreditCard,
  Mail,
  Smartphone,
} from "lucide-react";
import {
  saveForelderOnboardingStep,
  completeForelderOnboarding,
  type ForelderOnboardingData,
} from "../actions";
import "@/components/onboarding/onboarding.css";

// ──────────────────────────────────────────────────────────────────────────────
// Illustrasjoner
// ──────────────────────────────────────────────────────────────────────────────

function IllustVelkommen() {
  return (
    <div
      className="ob-illust"
      style={{ background: "linear-gradient(160deg, #F1EEE5 0%, #E5E3DD 100%)" }}
    >
      <svg viewBox="0 0 520 180">
        <g fill="#003A2A">
          <path d="M 200 112 Q 215 83 242 75 L 256 83 Q 242 100 228 118 Z" />
          <path d="M 320 112 Q 305 83 278 75 L 264 83 Q 278 100 292 118 Z" />
        </g>
        <circle cx="260" cy="90" r="16" fill="#D1F843" stroke="#003A2A" strokeWidth="2.5" />
        <ellipse cx="260" cy="163" rx="180" ry="11" fill="#88B45A" opacity="0.5" />
      </svg>
    </div>
  );
}

function IllustBarnet() {
  return (
    <div
      className="ob-illust"
      style={{ background: "linear-gradient(160deg, #006C50 0%, #003A2A 100%)" }}
    >
      <svg viewBox="0 0 520 180">
        <rect x="160" y="30" width="200" height="120" rx="12" fill="#FAFAF7" stroke="#D1F843" strokeWidth="2.5" />
        <circle cx="212" cy="84" r="25" fill="#D1F843" />
        <text x="212" y="91" textAnchor="middle" fontFamily="Inter Tight" fontSize="14" fontWeight="800" fill="#003A2A">MR</text>
        <rect x="252" y="52" width="90" height="7" rx="2.5" fill="#005840" opacity="0.30" />
        <rect x="252" y="66" width="68" height="6" rx="2" fill="#005840" opacity="0.20" />
        <rect x="252" y="78" width="80" height="6" rx="2" fill="#005840" opacity="0.20" />
      </svg>
    </div>
  );
}

function IllustVilkar() {
  return (
    <div
      className="ob-illust"
      style={{ background: "linear-gradient(160deg, #88B45A 0%, #5E8538 100%)" }}
    >
      <svg viewBox="0 0 520 180">
        <rect x="140" y="45" width="240" height="90" rx="5" fill="#FAFAF7" />
        <line x1="162" y1="108" x2="358" y2="108" stroke="#003A2A" strokeWidth="1.5" />
        <g transform="translate(316 90) rotate(-30)">
          <rect x="0" y="0" width="60" height="8" fill="#D1F843" />
          <polygon points="60,0 76,4 60,8" fill="#003A2A" />
          <rect x="-9" y="0" width="9" height="8" fill="#003A2A" />
        </g>
      </svg>
    </div>
  );
}

function IllustBetaling() {
  return (
    <div
      className="ob-illust"
      style={{ background: "linear-gradient(160deg, #F1EEE5 0%, #E5E3DD 100%)" }}
    >
      <svg viewBox="0 0 520 180">
        <rect x="180" y="28" width="160" height="124" rx="6" fill="#FAFAF7" stroke="#003A2A" strokeWidth="1.5" />
        <rect x="180" y="28" width="160" height="32" fill="#003A2A" />
        <text x="260" y="49" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fontWeight="800" fill="#D1F843" letterSpacing="0.16em">AK GOLF · FAKTURA</text>
        <line x1="198" y1="78" x2="322" y2="78" stroke="#E5E3DD" strokeWidth="1" />
        <line x1="198" y1="96" x2="322" y2="96" stroke="#E5E3DD" strokeWidth="1" />
        <line x1="198" y1="114" x2="322" y2="114" stroke="#E5E3DD" strokeWidth="1" />
        <text x="200" y="140" fontFamily="JetBrains Mono" fontSize="16" fontWeight="800" fill="#003A2A">300 kr</text>
        <rect x="270" y="126" width="64" height="22" rx="5" fill="#D1F843" />
        <text x="302" y="140" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fontWeight="800" fill="#003A2A" letterSpacing="0.10em">PR. MND</text>
      </svg>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Wizard
// ──────────────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;

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

  const kanFullfore =
    acceptedTraining && acceptedPrivacy && acceptedPayment;

  return (
    <div>
      {/* Progress-indikator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "24px 40px 0",
        }}
      >
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <span key={n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  display: "block",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  border: "1.5px solid",
                  borderColor: done || active ? "hsl(var(--primary))" : "hsl(var(--border))",
                  background: done
                    ? "hsl(var(--primary))"
                    : active
                    ? "hsl(var(--accent))"
                    : "hsl(var(--border))",
                  transform: active ? "scale(1.3)" : "scale(1)",
                  transition: "all 0.2s",
                }}
              />
              {i < TOTAL_STEPS - 1 && (
                <span
                  style={{
                    display: "block",
                    width: 24,
                    height: 2,
                    background: done ? "hsl(var(--primary))" : "hsl(var(--border))",
                    transition: "background 0.2s",
                  }}
                />
              )}
            </span>
          );
        })}
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.10em",
            color: "hsl(var(--primary))",
            marginLeft: 10,
            textTransform: "uppercase",
          }}
        >
          Steg {step} av {TOTAL_STEPS}
        </span>
      </div>

      {step === 1 && (
        <div className="ob-step-body">
          <IllustVelkommen />
          <h2 className="ob-step-title">
            Hei — <em>velkommen inn</em>.
          </h2>
          <div className="ob-ingress">
            <p>
              Coach Anders og spilleren din har akkurat satt opp profilen hos
              AK Golf Academy. Som foresatt er du en sentral del av utviklingen,
              og vi vil at du skal være tett på — uten å være i veien.
            </p>
            <p>
              Du får din egen <strong>foreldre-portal</strong> med innsyn i
              planer, runder, fakturaer og fremgang. Du kan også sende meldinger
              til Anders direkte.
            </p>
          </div>
          <div className="ob-inspo cream">
            <blockquote>
              Foreldre er den viktigste støttespilleren en ung utøver har. Vi
              gjør alt vi kan for at du skal føle deg trygg på hva vi gjør — og
              hvorfor.
            </blockquote>
            <cite>Anders Kristiansen · Head Coach AK Golf Academy</cite>
          </div>
          <div className="ob-cta-row center">
            <button className="ob-btn-lime big" onClick={neste} disabled={pending}>
              La oss begynne
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="ob-step-body">
          <IllustBarnet />
          <h2 className="ob-step-title">
            Bekreft <em>din info</em>.
          </h2>
          <p className="ob-ingress">
            Litt info om deg som foresatt, slik at vi kan sende fakturaer og
            holde kontakten.
          </p>
          <div className="ob-field-grid">
            <div className="ob-field">
              <label htmlFor="ob-parent-name" className="ob-label">
                Ditt navn
              </label>
              <input
                id="ob-parent-name"
                type="text"
                className="ob-input"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Fullt navn"
              />
            </div>
            <div className="ob-field">
              <label htmlFor="ob-parent-phone" className="ob-label">
                Telefon
              </label>
              <input
                id="ob-parent-phone"
                type="tel"
                className="ob-input font-mono"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="+47 ..."
              />
            </div>
            <div className="ob-field full">
              <label htmlFor="ob-parent-email" className="ob-label">
                E-post
              </label>
              <input
                id="ob-parent-email"
                type="email"
                className="ob-input"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="din@epost.no"
              />
            </div>
            <div className="ob-field full">
              <span className="ob-label">Relasjon</span>
              <div className="ob-radio-grid" style={{ display: "flex", gap: 8 }}>
                {(["MOR", "FAR", "FORESATT"] as const).map((rel) => (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => setParentRelation(rel)}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border:
                        parentRelation === rel
                          ? "2px solid #D1F843"
                          : "1.5px solid #E5E3DD",
                      background:
                        parentRelation === rel
                          ? "rgba(209,248,67,0.10)"
                          : "#ffffff",
                      cursor: "pointer",
                      fontFamily: "var(--font-inter-tight)",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "hsl(var(--foreground))",
                    }}
                  >
                    {rel === "MOR" ? "Mor" : rel === "FAR" ? "Far" : "Foresatt"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="ob-security-strip">
            Du kan invitere annen foresatt senere fra foreldre-portalen.{" "}
            <strong>Begge får samme tilgangsnivå.</strong>
          </div>
          <div className="ob-cta-row">
            <button className="ob-btn-outline" onClick={tilbake} disabled={pending}>
              <ChevronLeft size={15} />
              Tilbake
            </button>
            <button className="ob-btn-lime" onClick={neste} disabled={pending}>
              {pending ? "Lagrer…" : "Neste — Godkjenn vilkår"}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="ob-step-body">
          <IllustVilkar />
          <h2 className="ob-step-title">
            Vilkår og <em>samtykke</em>.
          </h2>
          <p className="ob-ingress">
            Som foresatt for en mindreårig spiller må du godkjenne våre vilkår,
            personvernerklæringen og avtalen om trenings-data.
          </p>
          <div className="ob-agree-list">
            <button
              type="button"
              className={`ob-agree-item${acceptedTraining ? " checked" : ""}`}
              onClick={() => setAcceptedTraining(!acceptedTraining)}
            >
              <div className="ob-agree-checkbox">
                {acceptedTraining && <Check size={11} color="#fff" />}
              </div>
              <div
                className="ob-connect-icon"
                style={{
                  width: 32,
                  height: 32,
                  minWidth: 32,
                  borderRadius: 8,
                  background: "#fff",
                  border: "1px solid #E5E3DD",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "hsl(var(--primary))",
                }}
              >
                <FileText size={15} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-inter-tight)", fontSize: 13.5, fontWeight: 700 }}>
                  AK Golf Academy Treningsavtale
                </div>
                <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginTop: 2 }}>
                  Beskriver hva spilleren får tilgang til, frekvens og
                  forventninger.
                </div>
              </div>
            </button>
            <button
              type="button"
              className={`ob-agree-item${acceptedPrivacy ? " checked" : ""}`}
              onClick={() => setAcceptedPrivacy(!acceptedPrivacy)}
            >
              <div className="ob-agree-checkbox">
                {acceptedPrivacy && <Check size={11} color="#fff" />}
              </div>
              <div
                style={{
                  width: 32,
                  height: 32,
                  minWidth: 32,
                  borderRadius: 8,
                  background: "#fff",
                  border: "1px solid #E5E3DD",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "hsl(var(--primary))",
                }}
              >
                <Shield size={15} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-inter-tight)", fontSize: 13.5, fontWeight: 700 }}>
                  Personvernerklæring og datadeling
                </div>
                <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginTop: 2 }}>
                  Hvilke data vi samler, hvordan vi bruker dem, og dine
                  rettigheter.
                </div>
              </div>
            </button>
            <button
              type="button"
              className={`ob-agree-item${acceptedPayment ? " checked" : ""}`}
              onClick={() => setAcceptedPayment(!acceptedPayment)}
            >
              <div className="ob-agree-checkbox">
                {acceptedPayment && <Check size={11} color="#fff" />}
              </div>
              <div
                style={{
                  width: 32,
                  height: 32,
                  minWidth: 32,
                  borderRadius: 8,
                  background: "#fff",
                  border: "1px solid #E5E3DD",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "hsl(var(--primary))",
                }}
              >
                <CreditCard size={15} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-inter-tight)", fontSize: 13.5, fontWeight: 700 }}>
                  Betaling og oppsigelse
                </div>
                <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginTop: 2 }}>
                  Faktura månedlig. Avsluttes når som helst med 30 dagers
                  oppsigelse.
                </div>
              </div>
            </button>
          </div>
          <div className="ob-security-strip">
            <strong>Anders Kristiansen og AK Golf Academy</strong> er forsikret,
            registrert som golftrener av NGF og har politiattest. Alle rutiner
            følger NIF sine retningslinjer for arbeid med mindreårige.
          </div>
          <div className="ob-cta-row">
            <button className="ob-btn-outline" onClick={tilbake} disabled={pending}>
              <ChevronLeft size={15} />
              Tilbake
            </button>
            <button
              className="ob-btn-lime"
              onClick={neste}
              disabled={pending || !kanFullfore}
            >
              {pending ? "Lagrer…" : "Neste — Betaling"}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="ob-step-body">
          <IllustBetaling />
          <h2 className="ob-step-title">
            Sett opp <em>betaling</em>.
          </h2>
          <p className="ob-ingress">
            Spilleren har valgt PRO-abonnement, 300 kr/mnd. Du faktureres
            månedlig fra dato spilleren er aktivert. Avsluttes når som helst.
          </p>
          <div className="ob-pay-summary">
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 10,
                color: "rgba(209,248,67,0.65)",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
              }}
            >
              Abonnement
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter-tight)",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              AK Golf Academy PRO
            </div>
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "-0.01em",
              }}
            >
              300 kr/mnd
            </div>
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 10,
                color: "rgba(255,255,255,0.65)",
                marginTop: 4,
              }}
            >
              Avsluttes når som helst · 30 dagers oppsigelse
            </div>
          </div>
          <div>
            <span className="ob-label" style={{ display: "block", marginBottom: 8 }}>
              Velg betalingsmetode
            </span>
            <div className="ob-paymethod-grid">
              {(
                [
                  { id: "VIPPS", label: "Vipps", sub: "Trekkes auto. 20. hver mnd", anbefalt: true, Icon: Smartphone },
                  { id: "KORT", label: "Kort", sub: "Visa, MC, Stripe", anbefalt: false, Icon: CreditCard },
                  { id: "FAKTURA", label: "Faktura", sub: "30 dagers betalingsfrist", anbefalt: false, Icon: Mail },
                ] as const
              ).map(({ id, label, sub, anbefalt, Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`ob-paymethod${paymentMethod === id ? " selected" : ""}`}
                  onClick={() => setPaymentMethod(id)}
                  style={{ position: "relative" }}
                >
                  {anbefalt && (
                    <span
                      style={{
                        position: "absolute",
                        top: -8,
                        right: 8,
                        background: "hsl(var(--accent))",
                        color: "hsl(var(--foreground))",
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: 8,
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      ANBEFALT
                    </span>
                  )}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "hsl(var(--primary))",
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-inter-tight)",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: 9,
                      color: "hsl(var(--muted-foreground))",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {sub}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="ob-security-strip">
            Sikret med Stripe · 256-bit kryptering · GDPR-kompatibelt
          </div>
          <div className="ob-cta-row">
            <button className="ob-btn-outline" onClick={tilbake} disabled={pending}>
              <ChevronLeft size={15} />
              Tilbake
            </button>
            <button
              className="ob-btn-lime big"
              onClick={fullfor}
              disabled={pending}
            >
              {pending ? "Aktiverer…" : "Fullfør og aktiver"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="ob-error" style={{ margin: "0 40px 24px" }} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
