"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ArrowRight,
  ChevronLeft,
  CalendarClock,
  ShieldCheck,
  Flag,
  Mail,
} from "lucide-react";
import {
  saveCoachOnboardingStep,
  markCoachStepComplete,
  completeCoachOnboarding,
  type CoachOnboardingData,
} from "./actions";
import "@/components/onboarding/onboarding.css";

// ──────────────────────────────────────────────────────────────────────────────
// Konstanter
// ──────────────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;

const SERTIFISERINGER = [
  "PGA NORGE",
  "TPI LEVEL 1",
  "TPI LEVEL 2",
  "TPI LEVEL 3",
  "TRACKMAN MASTER",
  "TRACKMAN CERTIFIED",
  "MOG NIVÅ 1",
  "MOG NIVÅ 2",
  "MOG NIVÅ 3",
  "PGA UK",
  "PGA US",
  "AIMPOINT EXPRESS",
  "BIOMEKANIKK",
  "MENTAL TRENER",
  "FYSISK TRENER",
];

const SPESIALITETER = [
  "FULL SWING",
  "PUTTING",
  "KORTSPILL",
  "BUNKERSPILL",
  "MENTAL",
  "FYSISK",
  "JUNIOR",
  "ELITE",
  "TURNERINGSCOACHING",
  "BANE-STRATEGI",
];

function toggle<T>(arr: T[], item: T, max: number): T[] {
  if (arr.includes(item)) return arr.filter((x) => x !== item);
  if (arr.length >= max) return arr;
  return [...arr, item];
}

// ──────────────────────────────────────────────────────────────────────────────
// Wizard
// ──────────────────────────────────────────────────────────────────────────────

type Props = {
  initialStep?: number;
  initialName: string;
  initialEmail: string;
  initialPhone: string | null;
};

export function CoachWizard({
  initialStep = 1,
  initialName,
  initialEmail,
  initialPhone,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Steg 1
  const [name, setName] = useState(initialName);
  const [accepted, setAccepted] = useState(false);

  // Steg 2
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Steg 3
  const [certifications, setCertifications] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  // Steg 4
  const [calendarConnected, setCalendarConnected] = useState(false);

  function buildData(): CoachOnboardingData {
    return {
      name: name.trim() || undefined,
      phone: phone || undefined,
      address: address || undefined,
      dateOfBirth: dateOfBirth || undefined,
      certifications,
      specialties,
      bio: bio || undefined,
      googleCalendarConnected: calendarConnected,
    };
  }

  function neste() {
    setError(null);

    // Validering per steg
    if (step === 1) {
      if (!name.trim()) {
        setError("Vennligst bekreft navnet ditt.");
        return;
      }
      if (!accepted) {
        setError("Du må akseptere invitasjonen for å fortsette.");
        return;
      }
    }
    if (step === 2 && !phone) {
      setError("Vennligst legg inn et telefonnummer.");
      return;
    }

    startTransition(async () => {
      try {
        await saveCoachOnboardingStep(buildData());
        await markCoachStepComplete(step);
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
        await saveCoachOnboardingStep(buildData());
        await completeCoachOnboarding();
      } catch {
        router.push("/admin");
        router.refresh();
      }
    });
  }

  return (
    <div>
      {/* ─── STEG 1 — Aksept invitasjon ─── */}
      {step === 1 && (
        <div className="ob-step-body">
          <div
            className="ob-illust"
            style={{ background: "linear-gradient(160deg, #003A2A 0%, #006C50 100%)" }}
          >
            <svg viewBox="0 0 520 180">
              <rect x="160" y="40" width="200" height="100" rx="12" fill="#FAFAF7" />
              <circle cx="200" cy="78" r="22" fill="#D1F843" />
              <rect x="234" y="62" width="100" height="8" rx="3" fill="#005840" opacity="0.30" />
              <rect x="234" y="78" width="80" height="6" rx="2" fill="#005840" opacity="0.20" />
              <rect x="234" y="92" width="60" height="6" rx="2" fill="#005840" opacity="0.20" />
              <rect x="180" y="118" width="160" height="10" rx="5" fill="#D1F843" />
              <text
                x="260"
                y="125"
                textAnchor="middle"
                fontFamily="JetBrains Mono"
                fontSize="7"
                fontWeight="800"
                fill="#0A1F17"
                letterSpacing="0.10em"
              >
                COACH-INVITASJON
              </text>
            </svg>
          </div>
          <h2 className="ob-step-title">
            Velkommen som <em>coach</em> i AK Golf.
          </h2>
          <div className="ob-ingress">
            <p>
              Du har blitt invitert til å være coach i AK Golf-plattformen.
              De neste 5 minuttene tar vi en kort gjennomgang for å sette opp
              coach-profilen din og kalender-tilkoblingen.
            </p>
            <p>
              <strong>Bekreft først at e-posten og navnet stemmer.</strong>
            </p>
          </div>

          <div className="ob-field-grid">
            <div className="ob-field full">
              <label htmlFor="coach-name" className="ob-label">
                Fullt navn
              </label>
              <input
                id="coach-name"
                type="text"
                className="ob-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Fornavn Etternavn"
              />
            </div>
            <div className="ob-field full">
              <label htmlFor="coach-email" className="ob-label">
                E-post (kan ikke endres her)
              </label>
              <input
                id="coach-email"
                type="email"
                className="ob-input"
                value={initialEmail}
                disabled
                style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}
              />
            </div>
          </div>

          <button
            type="button"
            className={`ob-agree-item${accepted ? " checked" : ""}`}
            onClick={() => setAccepted(!accepted)}
          >
            <div className="ob-agree-checkbox">
              {accepted && <Check size={12} color="#fff" />}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-inter-tight)",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Jeg aksepterer invitasjonen som coach
              </div>
              <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginTop: 2 }}>
                Jeg har lest coach-vilkårene og forplikter meg til å følge
                AK Golf sin treningsfilosofi og personvernsregler.
              </div>
            </div>
          </button>

          {error && (
            <div className="ob-error" role="alert">
              {error}
            </div>
          )}

          <div className="ob-cta-row center">
            <button
              className="ob-btn-lime big"
              onClick={neste}
              disabled={pending}
            >
              {pending ? "Lagrer…" : "Aksepter — fortsett"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEG 2 — Personalia ─── */}
      {step === 2 && (
        <div className="ob-step-body">
          <div
            className="ob-illust"
            style={{
              background: "linear-gradient(160deg, #F1EEE5 0%, #E5E3DD 100%)",
            }}
          >
            <svg viewBox="0 0 520 180">
              <rect x="120" y="30" width="280" height="120" rx="12" fill="#fff" stroke="#005840" strokeWidth="1.5" />
              <rect x="140" y="50" width="80" height="8" rx="3" fill="#005840" opacity="0.30" />
              <rect x="140" y="68" width="240" height="6" rx="2" fill="#005840" opacity="0.15" />
              <rect x="140" y="92" width="60" height="8" rx="3" fill="#005840" opacity="0.30" />
              <rect x="140" y="110" width="180" height="6" rx="2" fill="#005840" opacity="0.15" />
              <rect x="140" y="130" width="120" height="6" rx="2" fill="#005840" opacity="0.15" />
            </svg>
          </div>
          <h2 className="ob-step-title">
            Litt <em>kontaktinfo</em>.
          </h2>
          <p className="ob-ingress">
            Slik kan klubben og spillerne dine kontakte deg. Adresse brukes kun
            for skattedokumentasjon og kan stå tom for nå.
          </p>

          <div className="ob-field-grid">
            <div className="ob-field">
              <label htmlFor="coach-phone" className="ob-label">
                Telefon
              </label>
              <input
                id="coach-phone"
                type="tel"
                className="ob-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+47 ..."
              />
            </div>
            <div className="ob-field">
              <label htmlFor="coach-dob" className="ob-label">
                Fødselsdato
              </label>
              <input
                id="coach-dob"
                type="date"
                className="ob-input font-mono"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
            <div className="ob-field full">
              <label htmlFor="coach-address" className="ob-label">
                Adresse (valgfritt)
              </label>
              <input
                id="coach-address"
                type="text"
                className="ob-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Gateadresse, postnr., sted"
              />
            </div>
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
              {pending ? "Lagrer…" : "Neste — Kompetanse"}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEG 3 — Kompetanse / sertifiseringer ─── */}
      {step === 3 && (
        <div className="ob-step-body">
          <div
            className="ob-illust"
            style={{ background: "linear-gradient(160deg, #88B45A 0%, #5E8538 100%)" }}
          >
            <svg viewBox="0 0 520 180">
              <ShieldCheckIllust />
            </svg>
          </div>
          <h2 className="ob-step-title">
            Din <em>kompetanse</em>.
          </h2>
          <p className="ob-ingress">
            Velg sertifiseringene og spesialitetene dine. Disse vises i
            coach-profilen din og brukes for å matche spillere.
          </p>

          <div className="ob-field">
            <span className="ob-label">Sertifiseringer (velg alle som passer)</span>
            <div className="ob-multi-pills" style={{ marginTop: 4 }}>
              {SERTIFISERINGER.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCertifications((prev) => toggle(prev, s, 20))}
                  className={`ob-pill-toggle${certifications.includes(s) ? " selected" : ""}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="ob-field">
            <span className="ob-label">Spesialiteter (velg inntil 5)</span>
            <div className="ob-multi-pills" style={{ marginTop: 4 }}>
              {SPESIALITETER.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpecialties((prev) => toggle(prev, s, 5))}
                  className={`ob-pill-toggle${specialties.includes(s) ? " selected" : ""}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="ob-field">
            <label htmlFor="coach-bio" className="ob-label">
              Kort bio (valgfritt)
            </label>
            <textarea
              id="coach-bio"
              className="ob-input"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Kort om bakgrunn og treningsfilosofi. Vises i coach-profil."
              style={{ resize: "vertical", minHeight: 88 }}
            />
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
              {pending ? "Lagrer…" : "Neste — Kalender"}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEG 4 — Kalender + ferdig ─── */}
      {step === 4 && (
        <div className="ob-step-body">
          <div
            className="ob-illust"
            style={{ background: "linear-gradient(160deg, #003A2A 0%, #006C50 100%)" }}
          >
            <svg viewBox="0 0 520 180">
              <rect x="160" y="30" width="200" height="120" rx="12" fill="#FAFAF7" />
              <rect x="160" y="30" width="200" height="22" rx="12 12 0 0" fill="#005840" />
              <rect x="160" y="44" width="200" height="8" fill="#005840" />
              <g fill="#E5E3DD">
                {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                  <rect key={d} x={172 + d * 26} y={60} width={20} height={16} rx={2} />
                ))}
                {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                  <rect key={`r${d}`} x={172 + d * 26} y={80} width={20} height={16} rx={2} />
                ))}
                {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                  <rect key={`r2${d}`} x={172 + d * 26} y={100} width={20} height={16} rx={2} />
                ))}
              </g>
              <rect x={172 + 2 * 26} y={80} width={20} height={16} rx={2} fill="#D1F843" />
              <rect x={172 + 4 * 26} y={100} width={20} height={16} rx={2} fill="#D1F843" />
              <text
                x="260"
                y="142"
                textAnchor="middle"
                fontFamily="JetBrains Mono"
                fontSize="8"
                fontWeight="800"
                fill="#005840"
                letterSpacing="0.10em"
              >
                GOOGLE CALENDAR · LIVE-SYNC
              </text>
            </svg>
          </div>
          <h2 className="ob-step-title">
            Koble til <em>kalenderen</em> din.
          </h2>
          <p className="ob-ingress">
            Synk Google Calendar slik at booking-tider automatisk reserverer
            kalenderen din, og du unngår dobbeltbooking.
          </p>

          <div className="ob-connect-box">
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="ob-connect-icon">
                <CalendarClock size={24} />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-inter-tight)",
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                Google Calendar
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
              Vi viser kun ledig/opptatt-status. Vi ser aldri innholdet i
              møtene dine.
            </p>
            <button
              className="ob-btn-lime big"
              type="button"
              onClick={() => {
                // TODO: Google OAuth-flow
                setCalendarConnected(true);
              }}
              disabled={calendarConnected}
            >
              {calendarConnected ? (
                <>
                  <Check size={16} /> Koblet til
                </>
              ) : (
                <>
                  Koble til Google Calendar
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
              Du kan koble til senere fra Coach-innstillinger
            </p>
          </div>

          <div className="ob-security-strip">
            <ShieldCheck
              size={14}
              style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }}
            />
            Du vil få en separat e-post med lenke til verifikasjons-skjema
            (politiattest og forsikring). Dette tar normalt 1–2 virkedager.
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
              {pending ? "Lagrer…" : "Fullfør og gå til AgencyOS"}
              <Flag size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Hopp over-lenke (kun under wizard, ikke siste steg) */}
      {step > 1 && step < TOTAL_STEPS && (
        <div style={{ textAlign: "center", paddingBottom: 24 }}>
          <button
            type="button"
            onClick={fullfor}
            disabled={pending}
            className="ob-skip-link"
          >
            <Mail
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

// ──────────────────────────────────────────────────────────────────────────────
// Liten illustrasjon for steg 3 (skjold-symbol)
// ──────────────────────────────────────────────────────────────────────────────

function ShieldCheckIllust() {
  return (
    <g>
      <ellipse cx="260" cy="160" rx="120" ry="10" fill="#003A2A" opacity="0.25" />
      <path
        d="M260 30 L320 50 V100 Q320 145 260 160 Q200 145 200 100 V50 Z"
        fill="#003A2A"
      />
      <path
        d="M230 95 L255 118 L295 78"
        stroke="#D1F843"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}
