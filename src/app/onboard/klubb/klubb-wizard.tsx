"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ArrowRight,
  ChevronLeft,
  Building,
  Users,
  Upload,
  CreditCard,
  Plug,
  Flag,
  Plus,
  Trash2,
} from "lucide-react";
import {
  saveKlubbOnboardingStep,
  markKlubbStepComplete,
  completeKlubbOnboarding,
  type KlubbOnboardingData,
} from "./actions";
import "@/components/onboarding/onboarding.css";

const TOTAL_STEPS = 5;

type CoachInvite = { navn: string; epost: string };

// ──────────────────────────────────────────────────────────────────────────────
// Wizard
// ──────────────────────────────────────────────────────────────────────────────

type Props = {
  initialStep?: number;
  initialContactName: string;
  initialContactEmail: string;
};

export function KlubbWizard({
  initialStep = 1,
  initialContactName,
  initialContactEmail,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Steg 1
  const [klubbNavn, setKlubbNavn] = useState("");
  const [klubbAdresse, setKlubbAdresse] = useState("");
  const [klubbKontaktNavn, setKlubbKontaktNavn] = useState(initialContactName);
  const [klubbKontaktEpost, setKlubbKontaktEpost] = useState(initialContactEmail);
  const [klubbKontaktTelefon, setKlubbKontaktTelefon] = useState("");

  // Steg 2
  const [coachInvites, setCoachInvites] = useState<CoachInvite[]>([
    { navn: "", epost: "" },
  ]);

  // Steg 3
  const [importValg, setImportValg] = useState<"CSV" | "ASSISTERT" | "SENERE">(
    "ASSISTERT",
  );

  // Steg 4
  const [stripeConnected, setStripeConnected] = useState(false);

  // Steg 5
  const [googleCal, setGoogleCal] = useState(false);
  const [notion, setNotion] = useState(false);
  const [resendDomain, setResendDomain] = useState("");

  function buildData(): KlubbOnboardingData {
    return {
      klubbNavn: klubbNavn || undefined,
      klubbAdresse: klubbAdresse || undefined,
      klubbKontaktNavn: klubbKontaktNavn || undefined,
      klubbKontaktEpost: klubbKontaktEpost || undefined,
      klubbKontaktTelefon: klubbKontaktTelefon || undefined,
      klubbLogoUrl: undefined,
      coachInvites: coachInvites.filter((c) => c.navn && c.epost),
      spillerImportValg: importValg,
      stripeConnected,
      integrations: {
        googleCal,
        notion,
        resendDomain: resendDomain || undefined,
      },
    };
  }

  function neste() {
    setError(null);

    if (step === 1 && !klubbNavn.trim()) {
      setError("Klubbens navn er påkrevd.");
      return;
    }

    startTransition(async () => {
      try {
        await saveKlubbOnboardingStep(buildData());
        await markKlubbStepComplete(step);
      } catch {
        setError("Kunne ikke lagre. Prøv igjen.");
        return;
      }
      if (step < TOTAL_STEPS) {
        setStep(step + 1);
      } else {
        router.push("/admin");
        router.refresh();
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
        await saveKlubbOnboardingStep(buildData());
        await completeKlubbOnboarding();
      } catch {
        router.push("/admin");
        router.refresh();
      }
    });
  }

  function leggTilCoachInvite() {
    if (coachInvites.length >= 3) return;
    setCoachInvites([...coachInvites, { navn: "", epost: "" }]);
  }
  function fjernCoachInvite(i: number) {
    if (coachInvites.length === 1) {
      setCoachInvites([{ navn: "", epost: "" }]);
      return;
    }
    setCoachInvites(coachInvites.filter((_, idx) => idx !== i));
  }
  function settCoachInvite(i: number, field: "navn" | "epost", value: string) {
    setCoachInvites(
      coachInvites.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    );
  }

  return (
    <div>
      {/* ─── STEG 1 — Klubb-info ─── */}
      {step === 1 && (
        <div className="ob-step-body">
          <div
            className="ob-illust"
            style={{
              background: "linear-gradient(160deg, #003A2A 0%, #006C50 100%)",
            }}
          >
            <svg viewBox="0 0 520 180">
              <rect x="180" y="40" width="160" height="120" rx="12" fill="#FAFAF7" />
              <path d="M 200 60 L 320 60 L 320 80 L 260 80 L 260 100 L 320 100 L 320 120 L 200 120 Z" fill="#005840" />
              <rect x="220" y="130" width="80" height="14" rx="3" fill="#D1F843" />
              <text
                x="260"
                y="155"
                textAnchor="middle"
                fontFamily="JetBrains Mono"
                fontSize="8"
                fontWeight="800"
                fill="#FAFAF7"
                letterSpacing="0.10em"
              >
                KLUBB-OPPSETT
              </text>
            </svg>
          </div>
          <h2 className="ob-step-title">
            La oss sette opp <em>klubben</em>.
          </h2>
          <p className="ob-ingress">
            Vi trenger litt grunninfo om klubben og en hovedkontakt. Du kan
            endre alt senere i innstillinger.
          </p>

          <div className="ob-field-grid">
            <div className="ob-field full">
              <label htmlFor="k-navn" className="ob-label">
                Klubbnavn *
              </label>
              <input
                id="k-navn"
                type="text"
                className="ob-input"
                value={klubbNavn}
                onChange={(e) => setKlubbNavn(e.target.value)}
                placeholder="f.eks. Gamle Fredrikstad GK"
              />
            </div>
            <div className="ob-field full">
              <label htmlFor="k-adresse" className="ob-label">
                Adresse
              </label>
              <input
                id="k-adresse"
                type="text"
                className="ob-input"
                value={klubbAdresse}
                onChange={(e) => setKlubbAdresse(e.target.value)}
                placeholder="Gateadresse, postnr., sted"
              />
            </div>
            <div className="ob-field">
              <label htmlFor="k-kontakt-navn" className="ob-label">
                Kontakt-navn
              </label>
              <input
                id="k-kontakt-navn"
                type="text"
                className="ob-input"
                value={klubbKontaktNavn}
                onChange={(e) => setKlubbKontaktNavn(e.target.value)}
              />
            </div>
            <div className="ob-field">
              <label htmlFor="k-kontakt-tel" className="ob-label">
                Kontakt-telefon
              </label>
              <input
                id="k-kontakt-tel"
                type="tel"
                className="ob-input"
                value={klubbKontaktTelefon}
                onChange={(e) => setKlubbKontaktTelefon(e.target.value)}
                placeholder="+47 ..."
              />
            </div>
            <div className="ob-field full">
              <label htmlFor="k-kontakt-epost" className="ob-label">
                Kontakt-e-post
              </label>
              <input
                id="k-kontakt-epost"
                type="email"
                className="ob-input"
                value={klubbKontaktEpost}
                onChange={(e) => setKlubbKontaktEpost(e.target.value)}
              />
            </div>
          </div>

          <div className="ob-connect-box">
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="ob-connect-icon">
                <Upload size={24} />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-inter-tight)",
                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                Klubb-logo
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "hsl(var(--muted-foreground))",
                maxWidth: 380,
                textAlign: "center",
              }}
            >
              Last opp logo for å vise i portalen og på fakturaer.
            </p>
            <button
              className="ob-btn-outline"
              type="button"
              onClick={() => {
                // TODO: logo-upload med Supabase storage
              }}
            >
              Last opp logo (kan gjøres senere)
            </button>
          </div>

          {error && (
            <div className="ob-error" role="alert">
              {error}
            </div>
          )}

          <div className="ob-cta-row">
            <span />
            <button className="ob-btn-lime" onClick={neste} disabled={pending}>
              {pending ? "Lagrer…" : "Neste — Team"}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEG 2 — Team / coach-invitasjoner ─── */}
      {step === 2 && (
        <div className="ob-step-body">
          <div
            className="ob-illust"
            style={{
              background: "linear-gradient(160deg, #88B45A 0%, #5E8538 100%)",
            }}
          >
            <svg viewBox="0 0 520 180">
              <g fill="#003A2A">
                {[
                  { x: 200, r: 18 },
                  { x: 260, r: 22 },
                  { x: 320, r: 18 },
                ].map((c, i) => (
                  <g key={i}>
                    <circle cx={c.x} cy={70} r={c.r} />
                    <path
                      d={`M ${c.x - c.r} 100 Q ${c.x} ${100 + c.r * 1.4} ${c.x + c.r} 100 L ${c.x + c.r * 1.2} 140 L ${c.x - c.r * 1.2} 140 Z`}
                    />
                  </g>
                ))}
              </g>
              <text
                x="260"
                y="170"
                textAnchor="middle"
                fontFamily="JetBrains Mono"
                fontSize="8"
                fontWeight="800"
                fill="#FAFAF7"
                letterSpacing="0.10em"
              >
                COACH-TEAM
              </text>
            </svg>
          </div>
          <h2 className="ob-step-title">
            Inviter <em>coachene</em> dine.
          </h2>
          <p className="ob-ingress">
            Legg til opp til 3 coacher nå. De får e-post med invitasjon og
            kobles automatisk til klubben.
            <strong> Du kan legge til flere senere.</strong>
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {coachInvites.map((c, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto",
                  gap: 8,
                  alignItems: "end",
                }}
              >
                <div className="ob-field">
                  <label className="ob-label">Navn</label>
                  <input
                    type="text"
                    className="ob-input"
                    value={c.navn}
                    onChange={(e) => settCoachInvite(i, "navn", e.target.value)}
                    placeholder="Fornavn Etternavn"
                  />
                </div>
                <div className="ob-field">
                  <label className="ob-label">E-post</label>
                  <input
                    type="email"
                    className="ob-input"
                    value={c.epost}
                    onChange={(e) => settCoachInvite(i, "epost", e.target.value)}
                    placeholder="coach@klubb.no"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fjernCoachInvite(i)}
                  className="ob-btn-outline"
                  style={{ padding: "11px 14px" }}
                  aria-label="Fjern coach"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {coachInvites.length < 3 && (
              <button
                type="button"
                onClick={leggTilCoachInvite}
                className="ob-btn-outline"
                style={{ alignSelf: "flex-start" }}
              >
                <Plus size={15} />
                Legg til coach ({coachInvites.length}/3)
              </button>
            )}
          </div>

          <div className="ob-security-strip">
            Coachene må selv akseptere invitasjonen og gjennomgå sin egen
            onboarding (4 steg, ca. 5 minutter).
          </div>

          {error && (
            <div className="ob-error" role="alert">
              {error}
            </div>
          )}

          <div className="ob-cta-row">
            <button className="ob-btn-outline" onClick={tilbake} disabled={pending}>
              <ChevronLeft size={15} />
              Tilbake
            </button>
            <button className="ob-btn-lime" onClick={neste} disabled={pending}>
              {pending ? "Lagrer…" : "Neste — Spiller-import"}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEG 3 — Spiller-import ─── */}
      {step === 3 && (
        <div className="ob-step-body">
          <div
            className="ob-illust"
            style={{
              background: "linear-gradient(160deg, #F1EEE5 0%, #E5E3DD 100%)",
            }}
          >
            <svg viewBox="0 0 520 180">
              <rect x="120" y="30" width="280" height="120" rx="12" fill="#fff" stroke="#005840" strokeWidth="1.5" />
              <rect x="140" y="48" width="240" height="14" rx="3" fill="#D1F843" />
              {[0, 1, 2, 3, 4].map((row) => (
                <g key={row}>
                  <rect x={140} y={72 + row * 14} width={60} height={8} rx={2} fill="#005840" opacity="0.2" />
                  <rect x={210} y={72 + row * 14} width={100} height={8} rx={2} fill="#005840" opacity="0.15" />
                  <rect x={320} y={72 + row * 14} width={60} height={8} rx={2} fill="#005840" opacity="0.15" />
                </g>
              ))}
            </svg>
          </div>
          <h2 className="ob-step-title">
            <em>Importér</em> spillerne deres.
          </h2>
          <p className="ob-ingress">
            Velg hvordan dere vil komme i gang med spillerlisten.
          </p>

          <div className="ob-radio-group">
            <button
              type="button"
              className={`ob-radio-card${importValg === "ASSISTERT" ? " checked" : ""}`}
              onClick={() => setImportValg("ASSISTERT")}
            >
              <Check
                size={18}
                style={{ color: importValg === "ASSISTERT" ? "hsl(var(--primary))" : "hsl(var(--border))" }}
              />
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-inter-tight)",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  Vi importerer for dere (anbefalt)
                </div>
                <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                  Send oss en liste i e-post, så håndterer vi resten i løpet
                  av 1–2 virkedager.
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`ob-radio-card${importValg === "CSV" ? " checked" : ""}`}
              onClick={() => setImportValg("CSV")}
            >
              <Check
                size={18}
                style={{ color: importValg === "CSV" ? "hsl(var(--primary))" : "hsl(var(--border))" }}
              />
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-inter-tight)",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  Last opp CSV selv
                </div>
                <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                  Følg malen vår med kolonner for navn, e-post, fødselsdato
                  og hcp.
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`ob-radio-card${importValg === "SENERE" ? " checked" : ""}`}
              onClick={() => setImportValg("SENERE")}
            >
              <Check
                size={18}
                style={{ color: importValg === "SENERE" ? "hsl(var(--primary))" : "hsl(var(--border))" }}
              />
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-inter-tight)",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  Senere
                </div>
                <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                  Vi setter opp tilgang for dere først, så kan dere invitere
                  spillere manuelt.
                </div>
              </div>
            </button>
          </div>

          {importValg === "CSV" && (
            <div className="ob-connect-box">
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div className="ob-connect-icon">
                  <Upload size={24} />
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-inter-tight)",
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                >
                  CSV-fil
                </span>
              </div>
              <button
                className="ob-btn-outline"
                type="button"
                onClick={() => {
                  // TODO: CSV-upload (se scripts/import-beta-users.ts)
                }}
              >
                Velg fil (skjelett — kontakt support)
              </button>
              <p
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: 10,
                  color: "#908D86",
                  letterSpacing: "0.06em",
                }}
              >
                CSV-mal sendes på e-post etter onboarding
              </p>
            </div>
          )}

          {error && (
            <div className="ob-error" role="alert">
              {error}
            </div>
          )}

          <div className="ob-cta-row">
            <button className="ob-btn-outline" onClick={tilbake} disabled={pending}>
              <ChevronLeft size={15} />
              Tilbake
            </button>
            <button className="ob-btn-lime" onClick={neste} disabled={pending}>
              {pending ? "Lagrer…" : "Neste — Stripe"}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEG 4 — Stripe Connect ─── */}
      {step === 4 && (
        <div className="ob-step-body">
          <div
            className="ob-illust"
            style={{
              background: "linear-gradient(160deg, #003A2A 0%, #006C50 100%)",
            }}
          >
            <svg viewBox="0 0 520 180">
              <rect x="140" y="50" width="240" height="80" rx="10" fill="#635BFF" />
              <text
                x="260"
                y="100"
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontSize="40"
                fontWeight="800"
                fill="#fff"
              >
                stripe
              </text>
              <text
                x="260"
                y="155"
                textAnchor="middle"
                fontFamily="JetBrains Mono"
                fontSize="8"
                fontWeight="800"
                fill="#D1F843"
                letterSpacing="0.10em"
              >
                STRIPE CONNECT · PAYOUTS
              </text>
            </svg>
          </div>
          <h2 className="ob-step-title">
            Sett opp <em>betaling</em>.
          </h2>
          <p className="ob-ingress">
            Koble klubben mot Stripe slik at spillerne kan betale abonnement
            og økter direkte til dere. Vi tar 0% i kommisjon — kun Stripes
            standard transaksjonsgebyrer.
          </p>

          <div className="ob-connect-box">
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="ob-connect-icon">
                <CreditCard size={24} />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-inter-tight)",
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                Stripe Connect
              </span>
            </div>
            <p
              style={{
                fontSize: 14,
                color: "hsl(var(--muted-foreground))",
                maxWidth: 380,
                textAlign: "center",
              }}
            >
              Du blir sendt til Stripe for å bekrefte org.nr., bankkonto og
              identitet. Det tar typisk 5–10 minutter.
            </p>
            <button
              className="ob-btn-lime big"
              type="button"
              onClick={() => {
                // TODO: Stripe Connect onboarding-flyt
                setStripeConnected(true);
              }}
              disabled={stripeConnected}
            >
              {stripeConnected ? (
                <>
                  <Check size={16} /> Koblet til
                </>
              ) : (
                <>
                  Koble til Stripe
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            <p
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 10,
                color: "#908D86",
                letterSpacing: "0.06em",
              }}
            >
              Du kan også sette opp dette senere fra Innstillinger
            </p>
          </div>

          {error && (
            <div className="ob-error" role="alert">
              {error}
            </div>
          )}

          <div className="ob-cta-row">
            <button className="ob-btn-outline" onClick={tilbake} disabled={pending}>
              <ChevronLeft size={15} />
              Tilbake
            </button>
            <button className="ob-btn-lime" onClick={neste} disabled={pending}>
              {pending ? "Lagrer…" : "Neste — Integrasjoner"}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEG 5 — Integrasjoner + ferdig ─── */}
      {step === 5 && (
        <div className="ob-step-body">
          <div
            className="ob-illust"
            style={{
              background: "linear-gradient(160deg, #88B45A 0%, #5E8538 100%)",
            }}
          >
            <svg viewBox="0 0 520 180">
              <ellipse cx="260" cy="160" rx="180" ry="10" fill="#003A2A" opacity="0.25" />
              {[
                { x: 170, label: "GC" },
                { x: 260, label: "N" },
                { x: 350, label: "R" },
              ].map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={80} r={32} fill="#003A2A" />
                  <text
                    x={p.x}
                    y={88}
                    textAnchor="middle"
                    fontFamily="Inter Tight, sans-serif"
                    fontSize="22"
                    fontWeight="800"
                    fill="#D1F843"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
              <line x1={202} y1={80} x2={228} y2={80} stroke="#003A2A" strokeWidth={3} />
              <line x1={292} y1={80} x2={318} y2={80} stroke="#003A2A" strokeWidth={3} />
            </svg>
          </div>
          <h2 className="ob-step-title">
            Koble til <em>verktøyene</em> deres.
          </h2>
          <p className="ob-ingress">
            Valgfri integrasjoner som gjør hverdagen smidigere. Alle kan settes
            opp senere fra Coach HQ &rsaquo; Innstillinger &rsaquo; Integrasjoner.
          </p>

          <button
            type="button"
            className={`ob-agree-item${googleCal ? " checked" : ""}`}
            onClick={() => setGoogleCal(!googleCal)}
          >
            <div className="ob-agree-checkbox">
              {googleCal && <Check size={12} color="#fff" />}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-inter-tight)",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Google Calendar
              </div>
              <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginTop: 2 }}>
                Hver coach kan koble egen kalender. Vi viser kun ledig/opptatt.
              </div>
            </div>
          </button>

          <button
            type="button"
            className={`ob-agree-item${notion ? " checked" : ""}`}
            onClick={() => setNotion(!notion)}
          >
            <div className="ob-agree-checkbox">
              {notion && <Check size={12} color="#fff" />}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-inter-tight)",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Notion (rapporter og dokumentasjon)
              </div>
              <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginTop: 2 }}>
                Synk ukentlige rapporter og treningsplaner til Notion-databaser.
              </div>
            </div>
          </button>

          <div className="ob-field">
            <label htmlFor="k-resend" className="ob-label">
              <Plug
                size={11}
                style={{
                  display: "inline",
                  verticalAlign: "-1px",
                  marginRight: 4,
                }}
              />
              Egen e-post-domene (Resend) — valgfritt
            </label>
            <input
              id="k-resend"
              type="text"
              className="ob-input font-mono"
              value={resendDomain}
              onChange={(e) => setResendDomain(e.target.value)}
              placeholder="f.eks. coach.dinklubb.no"
            />
            <p
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 10,
                color: "#908D86",
              }}
            >
              Vi sender konfigurasjons-instrukser etter onboarding.
            </p>
          </div>

          <div className="ob-security-strip">
            <Building
              size={14}
              style={{
                display: "inline",
                verticalAlign: "-2px",
                marginRight: 6,
              }}
            />
            Vi tar kontakt innen 1 virkedag for å bekrefte oppsettet og avtale
            videre opplæring.
          </div>

          {error && (
            <div className="ob-error" role="alert">
              {error}
            </div>
          )}

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
              {pending ? "Lagrer…" : "Fullfør og gå til Coach HQ"}
              <Flag size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Hopp over (kun under wizard, ikke første/siste steg) */}
      {step > 1 && step < TOTAL_STEPS && (
        <div style={{ textAlign: "center", paddingBottom: 24 }}>
          <button
            type="button"
            onClick={fullfor}
            disabled={pending}
            className="ob-skip-link"
          >
            <Users
              size={11}
              style={{
                display: "inline",
                verticalAlign: "-1px",
                marginRight: 4,
              }}
            />
            Hopp over og fullfør senere
          </button>
        </div>
      )}
    </div>
  );
}
