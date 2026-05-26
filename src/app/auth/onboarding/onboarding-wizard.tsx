"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ArrowRight,
  Link2,
  Settings,
  ChevronLeft,
  Flag,
} from "lucide-react";
import {
  saveSpillerOnboardingStep,
  markStepComplete,
  completeOnboarding,
  setDateOfBirthAndCheckMinor,
  type SpillerOnboardingData,
} from "./actions";
import "@/components/onboarding/onboarding.css";

// ──────────────────────────────────────────────────────────────────────────────
// Konstanter
// ──────────────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 7;

const SESONMAAL = [
  "SENKE HCP",
  "VINNE KLUBBM.",
  "SPILLE NM",
  "COLLEGE USA",
  "UNDER PAR",
  "BEDRE PUTTING",
  "BEDRE IRON-SPILL",
  "MENTAL ROBUSTHET",
  "BLI PROFF",
];

const COACHES = [
  { initialer: "AK", navn: "Anders Kristiansen", rolle: "HEAD COACH", meta: "38 aktive spillere · Mac O'Grady-skolen" },
  { initialer: "ES", navn: "Erik Solli", rolle: "PUTTING-SPESIALIST", meta: "Anbefales for kort-spill-fokus" },
  { initialer: "MH", navn: "Maja Hagen", rolle: "JUNIOR / UTVIKLING", meta: "Anbefales for nybegynnere og 12–16 år" },
];

// ──────────────────────────────────────────────────────────────────────────────
// Illustrasjoner
// ──────────────────────────────────────────────────────────────────────────────

function IllustVelkommen() {
  return (
    <div
      className="ob-illust"
      style={{ background: "linear-gradient(160deg, #D1F843 0%, #88B45A 100%)" }}
    >
      <svg viewBox="0 0 520 180" preserveAspectRatio="xMidYMid meet">
        <ellipse cx="130" cy="155" rx="65" ry="16" fill="#1A4D2E" opacity="0.55" />
        <path
          d="M130 45 L147 78 L170 74 L150 104 L178 112 L148 136 L130 155 L112 136 L82 112 L110 104 L90 74 L113 78 Z"
          fill="#1A4D2E"
        />
        <path d="M 0 155 Q 260 130 520 155 L 520 180 L 0 180 Z" fill="#5E8538" />
        <g transform="translate(340 75)" fill="#003A2A">
          <ellipse cx="0" cy="-6" rx="10" ry="11" />
          <path d="M0 5 L-3 53 L-13 80 L-8 84 L0 58 L8 78 L13 80 L3 53 L0 5 Z" />
          <path d="M-5 12 Q-23-8-40-10 Q-35-6-24 0 Q-15 6-5 18 Z" />
          <line x1="-38" y1="-12" x2="-70" y2="-51" stroke="#003A2A" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <circle cx="375" cy="155" r="5" fill="#fff" />
      </svg>
    </div>
  );
}

function IllustProfil() {
  return (
    <div
      className="ob-illust"
      style={{ background: "linear-gradient(160deg, #003A2A 0%, #006C50 100%)" }}
    >
      <svg viewBox="0 0 520 180">
        <rect x="160" y="30" width="200" height="120" rx="12" fill="#FAFAF7" stroke="#D1F843" strokeWidth="2.5" />
        <circle cx="210" cy="84" r="25" fill="#D1F843" />
        <rect x="248" y="52" width="90" height="8" rx="3" fill="#005840" opacity="0.30" />
        <rect x="248" y="68" width="70" height="6" rx="2" fill="#005840" opacity="0.20" />
        <rect x="248" y="82" width="80" height="6" rx="2" fill="#005840" opacity="0.20" />
        <rect x="185" y="124" width="150" height="5" rx="2" fill="#005840" opacity="0.15" />
        <rect x="185" y="134" width="110" height="5" rx="2" fill="#005840" opacity="0.15" />
      </svg>
    </div>
  );
}

function IllustHcp() {
  return (
    <div
      className="ob-illust"
      style={{ background: "linear-gradient(160deg, #F1EEE5 0%, #E5E3DD 100%)" }}
    >
      <svg viewBox="0 0 520 180">
        <g transform="translate(225 40)">
          <ellipse cx="35" cy="22" rx="40" ry="10" fill="#1A4D2E" />
          <path d="M-5 22 L-5 120 Q-5 132 35 132 Q75 132 75 120 L75 22 Z" fill="#005840" />
          <ellipse cx="35" cy="22" rx="40" ry="10" fill="#003A2A" opacity="0.55" />
          <line x1="20" y1="16" x2="14" y2="-22" stroke="#3A3A3A" strokeWidth="2.5" />
          <line x1="32" y1="16" x2="30" y2="-30" stroke="#3A3A3A" strokeWidth="2.5" />
          <line x1="44" y1="16" x2="44" y2="-38" stroke="#3A3A3A" strokeWidth="2.5" />
          <line x1="56" y1="16" x2="60" y2="-26" stroke="#3A3A3A" strokeWidth="2.5" />
          <ellipse cx="14" cy="-22" rx="5" ry="3" fill="#D1F843" />
          <ellipse cx="30" cy="-30" rx="5" ry="3" fill="#D1F843" />
          <ellipse cx="44" cy="-38" rx="5.5" ry="3.5" fill="#D1F843" />
          <ellipse cx="60" cy="-26" rx="5" ry="3" fill="#D1F843" />
        </g>
      </svg>
    </div>
  );
}

function IllustGolfBox() {
  return (
    <div
      className="ob-illust"
      style={{ background: "linear-gradient(160deg, #F1EEE5 0%, #FAFAF7 100%)" }}
    >
      <svg viewBox="0 0 520 180">
        <rect x="120" y="20" width="280" height="140" rx="12" fill="#fff" stroke="#005840" strokeWidth="1.5" />
        <line x1="138" y1="38" x2="138" y2="148" stroke="#E5E3DD" strokeWidth="1" />
        <line x1="138" y1="148" x2="382" y2="148" stroke="#E5E3DD" strokeWidth="1" />
        <polyline points="145,128 178,104 210,108 242,84 274,78 306,62 338,52 358,42" fill="none" stroke="#D1F843" strokeWidth="2.5" />
        <polyline points="145,136 182,124 214,120 246,112 278,104 310,96 342,88 362,80" fill="none" stroke="#005840" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x="260" y="170" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700" fill="#005840" letterSpacing="0.10em">HCP-HISTORIKK</text>
      </svg>
    </div>
  );
}

function IllustTrackMan() {
  return (
    <div
      className="ob-illust"
      style={{ background: "linear-gradient(160deg, #003A2A 0%, #006C50 100%)" }}
    >
      <svg viewBox="0 0 520 180">
        <g stroke="#D1F843" fill="none" strokeWidth="1.5" opacity="0.5">
          <path d="M 40 155 Q 40 75 155 75" />
          <path d="M 40 155 Q 40 45 215 45" />
          <path d="M 40 155 Q 40 15 275 15" />
        </g>
        <path d="M 40 155 Q 215 38 460 84" fill="none" stroke="#D1F843" strokeWidth="3" />
        <g fill="#D1F843">
          <circle cx="155" cy="92" r="4" />
          <circle cx="245" cy="62" r="4" />
          <circle cx="335" cy="62" r="4" />
          <circle cx="425" cy="83" r="4" />
        </g>
        <rect x="42" y="150" width="6" height="11" fill="#fff" />
        <circle cx="45" cy="155" r="3" fill="#fff" />
        <text x="340" y="170" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700" fill="#D1F843" letterSpacing="0.08em">258m · 1.37 smash · 6° launch</text>
      </svg>
    </div>
  );
}

function IllustCoach() {
  return (
    <div
      className="ob-illust"
      style={{ background: "linear-gradient(160deg, #88B45A 0%, #5E8538 100%)" }}
    >
      <svg viewBox="0 0 520 180">
        <ellipse cx="260" cy="158" rx="200" ry="12" fill="#003A2A" opacity="0.30" />
        <g transform="translate(200 68)" fill="#003A2A">
          <ellipse cx="0" cy="-4" rx="10" ry="11" />
          <path d="M-2 6 L-5 62 L-14 86 L-9 90 L-2 64 L0 64 L2 64 L9 90 L14 86 L5 62 L2 6 Z" />
        </g>
        <g transform="translate(310 74)" fill="#003A2A">
          <ellipse cx="0" cy="-4" rx="9" ry="10" />
          <path d="M-2 5 L-4 56 L-12 78 L-8 82 L-2 58 L0 58 L2 58 L8 82 L12 78 L4 56 L2 5 Z" />
        </g>
        <circle cx="255" cy="153" r="8" fill="#D1F843" stroke="#003A2A" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function IllustFerdig() {
  return (
    <div
      className="ob-illust"
      style={{ background: "linear-gradient(160deg, #F1EEE5 0%, #E5E3DD 100%)" }}
    >
      <svg viewBox="0 0 520 180">
        <ellipse cx="260" cy="162" rx="200" ry="10" fill="#88B45A" opacity="0.55" />
        <g transform="translate(220 82)" fill="#003A2A">
          <ellipse cx="0" cy="-6" rx="11" ry="12" />
          <path d="M-2 6 L-5 60 L-15 80 L-9 84 L-2 62 L0 62 L2 62 L9 84 L15 80 L5 60 L2 6 Z" />
        </g>
        <g transform="translate(300 96)" fill="#003A2A">
          <ellipse cx="0" cy="-4" rx="9" ry="10" />
          <path d="M-2 5 L-4 50 L-12 70 L-8 74 L-2 52 L0 52 L2 52 L8 74 L12 70 L4 50 L2 5 Z" />
        </g>
      </svg>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Hjelpere
// ──────────────────────────────────────────────────────────────────────────────

function toggle<T>(arr: T[], item: T, max: number): T[] {
  if (arr.includes(item)) return arr.filter((x) => x !== item);
  if (arr.length >= max) return arr;
  return [...arr, item];
}

// ──────────────────────────────────────────────────────────────────────────────
// Wizard
// ──────────────────────────────────────────────────────────────────────────────

export function OnboardingWizard({ initialStep = 1 }: { initialStep?: number }) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Steg 2 — Kontaktinfo + fødselsdato
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(""); // format YYYY-MM-DD
  const [guardianEmail, setGuardianEmail] = useState("");
  const [dobIsMinor, setDobIsMinor] = useState(false);

  // Steg 3
  const [hcp, setHcp] = useState("");
  const [homeClub, setHomeClub] = useState("");
  const [playingYears, setPlayingYears] = useState("5");
  const [sessionFrequency, setSessionFrequency] = useState(5);
  const [seasonGoals, setSeasonGoals] = useState<string[]>([]);

  // Steg 5
  const [selectedCoach, setSelectedCoach] = useState("Anders Kristiansen");
  const [selectedTier, setSelectedTier] = useState<"GRATIS" | "PRO">("PRO");

  // Steg 6
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  function buildData(): SpillerOnboardingData {
    return {
      phone: phone || undefined,
      hcp: hcp ? parseFloat(hcp.replace(",", ".")) : undefined,
      homeClub: homeClub || undefined,
      playingYears: playingYears ? parseInt(playingYears, 10) : undefined,
      sessionFrequency,
      seasonGoals,
      selectedCoach,
      selectedTier,
      acceptedTerms,
      acceptedPrivacy,
    };
  }

  // S-13: steg 2 har egen handler som kaller setDateOfBirthAndCheckMinor
  // hvis bruker har lagt inn fødselsdato.
  function nesteSteg2() {
    setError(null);
    if (!dateOfBirth) {
      // DOB ikke satt — tillat videre (DOB er valgfritt på dette steget)
      neste();
      return;
    }
    startTransition(async () => {
      const result = await setDateOfBirthAndCheckMinor({
        dateOfBirth,
        guardianEmail: dobIsMinor && guardianEmail ? guardianEmail : undefined,
      });
      if (!result.ok) {
        setError(result.error ?? "Noe gikk galt med fødselsdato.");
        // Hvis bruker er mindreårig og trenger guardian email — vis feltet
        if (result.isMinor) setDobIsMinor(true);
        return;
      }
      if (result.isMinor && !guardianEmail) {
        // Bruker er mindreårig men har ikke lagt inn guardian-email ennå
        setDobIsMinor(true);
        setError("Du er under 16 år og trenger foreldresamtykke. Oppgi e-post til foresatt.");
        return;
      }
      // DOB lagret — gå videre med vanlig lagring
      try {
        await saveSpillerOnboardingStep(buildData());
        await markStepComplete(step);
      } catch {
        setError("Kunne ikke lagre. Prøv igjen.");
        return;
      }
      setStep(step + 1);
    });
  }

  function neste() {
    setError(null);
    startTransition(async () => {
      try {
        await saveSpillerOnboardingStep(buildData());
        await markStepComplete(step);
      } catch {
        setError("Kunne ikke lagre. Prøv igjen.");
        return;
      }
      if (step < TOTAL_STEPS) {
        setStep(step + 1);
      } else {
        router.push("/portal");
        router.refresh();
      }
    });
  }

  function tilbake() {
    if (step > 1) setStep(step - 1);
  }

  function hopp() {
    setError(null);
    startTransition(async () => {
      try {
        await saveSpillerOnboardingStep(buildData());
        await completeOnboarding();
      } catch {
        router.push("/portal");
        router.refresh();
      }
    });
  }

  // Steg 7 er suksess-skjerm — redirect til portal
  function fullfor() {
    setError(null);
    startTransition(async () => {
      try {
        await completeOnboarding();
      } catch {
        router.push("/portal");
        router.refresh();
      }
    });
  }

  return (
    <div>
      {step === 1 && (
        <div className="ob-step-body">
          <IllustVelkommen />
          <h2 className="ob-step-title">
            Vi <em>gleder oss</em> til å jobbe med deg.
          </h2>
          <div className="ob-ingress">
            <p>
              Coach Anders har invitert deg inn i AK Golf Academy. De neste 5
              minuttene tar vi en kort gjennomgang for å sette opp profilen din
              og vise deg hvordan AK Golf fungerer.
            </p>
            <p>
              Du kan når som helst gå tilbake, lagre og fortsette senere.{" "}
              <strong>Ingenting er låst før du bekrefter siste steg.</strong>
            </p>
          </div>
          <div className="ob-inspo">
            <blockquote>
              Vi tenker langsiktig. Du blir bedre ved å gjøre de små tingene
              riktig — hver dag, i 3 år, i 5 år. Vi bygger karriere, ikke quick
              fixes.
            </blockquote>
            <cite>Anders Kristiansen · Head Coach AK Golf Academy</cite>
          </div>
          <div className="ob-cta-row center">
            <button className="ob-btn-lime big" onClick={neste} disabled={pending}>
              La oss starte
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="ob-step-body">
          <IllustProfil />
          <h2 className="ob-step-title">
            La oss bli <em>kjent</em>.
          </h2>
          <p className="ob-ingress">
            Litt grunninfo så Anders kan tilpasse opplegget ditt. Du kan endre alt
            senere.
          </p>
          <div className="ob-field-grid">
            <div className="ob-field">
              <label htmlFor="ob-phone" className="ob-label">
                Telefon
              </label>
              <input
                id="ob-phone"
                type="tel"
                className="ob-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+47 ..."
              />
            </div>
            <div className="ob-field">
              <label htmlFor="ob-hcp-early" className="ob-label">
                Handicap (forhåndsvisning)
              </label>
              <input
                id="ob-hcp-early"
                type="text"
                inputMode="decimal"
                className="ob-input font-mono"
                value={hcp}
                onChange={(e) => setHcp(e.target.value)}
                placeholder="f.eks. 18,4"
              />
            </div>
            <div className="ob-field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="ob-dob" className="ob-label">
                Fødselsdato{" "}
                <span style={{ fontWeight: 400, color: "#9C9990" }}>
                  — brukes for GDPR-samtykke (under 16 år)
                </span>
              </label>
              <input
                id="ob-dob"
                type="date"
                className="ob-input"
                value={dateOfBirth}
                onChange={(e) => {
                  setDateOfBirth(e.target.value);
                  // Reset minor-state når dato endres
                  setDobIsMinor(false);
                  setGuardianEmail("");
                  setError(null);
                }}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            {dobIsMinor && (
              <div className="ob-field" style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="ob-guardian-email" className="ob-label" style={{ color: "#B8852A" }}>
                  E-post til foresatt (påkrevd)
                </label>
                <input
                  id="ob-guardian-email"
                  type="email"
                  className="ob-input"
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  placeholder="forelder@example.com"
                  autoComplete="email"
                />
                <p style={{ marginTop: 4, fontSize: 12, color: "#B8852A" }}>
                  Vi sender en forespørsel om foreldresamtykke iht. GDPR art. 8.
                </p>
              </div>
            )}
          </div>
          <div className="ob-cta-row">
            <button className="ob-btn-outline" onClick={tilbake} disabled={pending}>
              <ChevronLeft size={15} />
              Tilbake
            </button>
            <button className="ob-btn-lime" onClick={nesteSteg2} disabled={pending}>
              {pending ? "Lagrer…" : "Neste — Golf-erfaring"}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="ob-step-body">
          <IllustHcp />
          <h2 className="ob-step-title">
            Fortell om <em>spillet ditt</em>.
          </h2>
          <p className="ob-ingress">
            Dette hjelper Anders med å skreddersy treningsplanen din fra dag én.
          </p>
          <div className="ob-field-grid">
            <div className="ob-field">
              <label htmlFor="ob-hcp" className="ob-label">
                Handicap
              </label>
              <input
                id="ob-hcp"
                type="text"
                inputMode="decimal"
                className="ob-input font-mono"
                style={{ fontSize: "22px", fontWeight: 700 }}
                value={hcp}
                onChange={(e) => setHcp(e.target.value)}
                placeholder="+3,5"
              />
            </div>
            <div className="ob-field">
              <label htmlFor="ob-club" className="ob-label">
                Hjemmebane / klubb
              </label>
              <input
                id="ob-club"
                type="text"
                className="ob-input"
                value={homeClub}
                onChange={(e) => setHomeClub(e.target.value)}
                placeholder="f.eks. Gamle Fredrikstad GK"
              />
            </div>
            <div className="ob-field">
              <label htmlFor="ob-years" className="ob-label">
                Antall år du har spilt
              </label>
              <input
                id="ob-years"
                type="number"
                min={0}
                max={50}
                className="ob-input font-mono"
                value={playingYears}
                onChange={(e) => setPlayingYears(e.target.value)}
                placeholder="f.eks. 11"
              />
            </div>
            <div className="ob-field">
              <span className="ob-label">Antall økter per uke</span>
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap",
                  background: "#fff",
                  border: "1px solid #E5E3DD",
                  borderRadius: 8,
                  padding: "6px 8px",
                }}
              >
                {[3, 4, 5, 6, 7].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSessionFrequency(n)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 6,
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontWeight: 700,
                      fontSize: 13,
                      border: "none",
                      cursor: "pointer",
                      background: sessionFrequency === n ? "#005840" : "transparent",
                      color: sessionFrequency === n ? "#D1F843" : "#5E5C57",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="ob-field">
            <span className="ob-label">Sesongmål — velg inntil 3</span>
            <div className="ob-multi-pills" style={{ marginTop: 4 }}>
              {SESONMAAL.map((maal) => (
                <button
                  key={maal}
                  type="button"
                  onClick={() =>
                    setSeasonGoals((prev) => toggle(prev, maal, 3))
                  }
                  className={`ob-pill-toggle${seasonGoals.includes(maal) ? " selected" : ""}`}
                >
                  {maal}
                </button>
              ))}
            </div>
          </div>

          <div className="ob-cta-row">
            <button className="ob-btn-outline" onClick={tilbake} disabled={pending}>
              <ChevronLeft size={15} />
              Tilbake
            </button>
            <button className="ob-btn-lime" onClick={neste} disabled={pending}>
              {pending ? "Lagrer…" : "Neste — Koble GolfBox"}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="ob-step-body">
          <IllustGolfBox />
          <h2 className="ob-step-title">
            Koble til <em>GolfBox</em>.
          </h2>
          <p className="ob-ingress">
            Når du kobler til GolfBox-kontoen din, henter vi automatisk inn
            HCP-historikken og runde-data dine.{" "}
            <strong>Anders får et komplett bilde fra dag én.</strong>
          </p>
          <div className="ob-connect-box">
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="ob-connect-icon">
                <Link2 size={24} />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-inter-tight)",
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                GolfBox
              </span>
            </div>
            <p style={{ fontSize: 14, color: "#5E5C57", maxWidth: 380, textAlign: "center" }}>
              Vi henter HCP, runder spilt siste 24 mnd, og turneringshistorikk.
            </p>
            <button
              className="ob-btn-lime big"
              type="button"
              onClick={() => {
                /* TODO: GolfBox OAuth */
              }}
            >
              Koble til GolfBox
            </button>
            <p
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 10,
                color: "#908D86",
                letterSpacing: "0.06em",
              }}
            >
              Krever GolfBox-konto · Vi lagrer aldri passordet ditt
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <button className="ob-skip-link" type="button" onClick={neste} disabled={pending}>
              Hopp over — jeg kobler til senere
            </button>
          </div>
          <div className="ob-security-strip">
            Vi følger GDPR og lagrer kun det vi trenger for å hjelpe deg utvikle
            deg som spiller.
          </div>
          <div className="ob-cta-row">
            <button className="ob-btn-outline" onClick={tilbake} disabled={pending}>
              <ChevronLeft size={15} />
              Tilbake
            </button>
            <button className="ob-btn-lime" onClick={neste} disabled={pending}>
              {pending ? "Lagrer…" : "Neste — TrackMan"}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="ob-step-body">
          <IllustTrackMan />
          <h2 className="ob-step-title">
            Koble til <em>TrackMan</em>.
          </h2>
          <p className="ob-ingress">
            Hvis du har en TrackMan-konto (egen, fra klubb, eller fra Performance
            Studio), kobler vi den slik at swing-data og ball-flight-info
            automatisk synkes til profilen din.
          </p>
          <div className="ob-connect-box">
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="ob-connect-icon">
                <Settings size={24} />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-inter-tight)",
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                TrackMan
              </span>
            </div>
            <p style={{ fontSize: 14, color: "#5E5C57", maxWidth: 380, textAlign: "center" }}>
              Vi henter swing-data, ball-flight og distance-data fra alle dine
              økter.
            </p>
            <button
              className="ob-btn-lime big"
              type="button"
              onClick={() => {
                /* TODO: TrackMan OAuth */
              }}
            >
              Koble til TrackMan
            </button>
            <p
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 10,
                color: "#908D86",
                letterSpacing: "0.06em",
              }}
            >
              Krever TrackMan-konto eller Performance Studio-tilgang
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <button className="ob-skip-link" type="button" onClick={neste} disabled={pending}>
              Hopp over — jeg har ikke TrackMan-konto
            </button>
          </div>
          <div className="ob-security-strip">
            <strong>Bruker du Performance Studio på GFGK?</strong> Da er TrackMan
            automatisk koblet på via klubb-abonnementet.
          </div>
          <div className="ob-cta-row">
            <button className="ob-btn-outline" onClick={tilbake} disabled={pending}>
              <ChevronLeft size={15} />
              Tilbake
            </button>
            <button className="ob-btn-lime" onClick={neste} disabled={pending}>
              {pending ? "Lagrer…" : "Neste — Coach og abonnement"}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="ob-step-body">
          <IllustCoach />
          <h2 className="ob-step-title">
            Din <em>coach</em> og ditt opplegg.
          </h2>
          <p className="ob-ingress">
            Velg coach og abonnement. Du kan endre dette når som helst.
          </p>

          <div>
            <span
              className="ob-label"
              style={{ display: "block", marginBottom: 8 }}
            >
              Velg coach
            </span>
            <div className="ob-coach-grid">
              {COACHES.map((coach) => (
                <button
                  key={coach.navn}
                  type="button"
                  className={`ob-coach-card${selectedCoach === coach.navn ? " selected" : ""}`}
                  onClick={() => setSelectedCoach(coach.navn)}
                >
                  {selectedCoach === coach.navn && (
                    <span
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: 8,
                        fontWeight: 800,
                        letterSpacing: "0.10em",
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: "#D1F843",
                        color: "#0A1F17",
                      }}
                    >
                      VALGT
                    </span>
                  )}
                  <div className="ob-coach-avatar">{coach.initialer}</div>
                  <div
                    style={{
                      fontFamily: "var(--font-inter-tight)",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {coach.navn}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: 9,
                      color: "#5E5C57",
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                    }}
                  >
                    {coach.rolle}
                  </div>
                  <div style={{ fontSize: 11, color: "#5E5C57", lineHeight: 1.4 }}>
                    {coach.meta}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span
              className="ob-label"
              style={{ display: "block", marginBottom: 8 }}
            >
              Velg abonnement
            </span>
            <div className="ob-plan-grid">
              <button
                type="button"
                className={`ob-plan-card${selectedTier === "GRATIS" ? " selected" : ""}`}
                onClick={() => setSelectedTier("GRATIS")}
              >
                <div
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                    color: selectedTier === "GRATIS" ? "#005840" : "#5E5C57",
                  }}
                >
                  GRATIS
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#0A1F17",
                  }}
                >
                  0 kr
                  <span style={{ fontSize: 13, color: "#5E5C57", fontWeight: 500 }}>
                    /mnd
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, color: "#5E5C57" }}>
                  {["PlayerHQ-profil", "1 økt-logg per uke", "Turneringskalender", "HCP-tracking"].map((f) => (
                    <div key={f} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                      <Check size={12} style={{ color: "#2C7D52", marginTop: 1, flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                  <div style={{ color: "#908D86", marginTop: 2 }}>— Ingen booking, drill-bibliotek eller AI-coach</div>
                </div>
              </button>
              <button
                type="button"
                className={`ob-plan-card${selectedTier === "PRO" ? " selected" : ""}`}
                onClick={() => setSelectedTier("PRO")}
              >
                {selectedTier === "PRO" && (
                  <span
                    style={{
                      position: "absolute",
                      top: -9,
                      right: 14,
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: 8.5,
                      fontWeight: 800,
                      letterSpacing: "0.10em",
                      padding: "2px 7px",
                      borderRadius: 4,
                      background: "#D1F843",
                      color: "#0A1F17",
                    }}
                  >
                    ANBEFALT
                  </span>
                )}
                <div
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                    color: selectedTier === "PRO" ? "#005840" : "#5E5C57",
                  }}
                >
                  PRO
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#0A1F17",
                  }}
                >
                  300 kr
                  <span style={{ fontSize: 13, color: "#5E5C57", fontWeight: 500 }}>
                    /mnd
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, color: "#5E5C57" }}>
                  {[
                    "Alt i GRATIS",
                    "Booking av økter og turneringer",
                    "142-drill bibliotek",
                    "AI-coach Anders",
                    "Bane-strategier · Foreldre-portal",
                  ].map((f) => (
                    <div key={f} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                      <Check size={12} style={{ color: "#2C7D52", marginTop: 1, flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                  <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 10, color: "#5E5C57", marginTop: 4 }}>
                    Avsluttes når som helst
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="ob-cta-row">
            <button className="ob-btn-outline" onClick={tilbake} disabled={pending}>
              <ChevronLeft size={15} />
              Tilbake
            </button>
            <button className="ob-btn-lime" onClick={neste} disabled={pending}>
              {pending ? "Lagrer…" : "Neste — Siste sjekk"}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="ob-step-body">
          <IllustFerdig />
          <h2 className="ob-step-title">
            Nesten <em>ferdig</em> — siste sjekk.
          </h2>
          <p className="ob-ingress">
            Bekreft at du godtar vilkårene for å fullføre registreringen.
          </p>

          <div className="ob-summary">
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "#5E5C57",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 10,
              }}
            >
              Du har valgt
            </span>
            <div className="ob-summary-row">
              <span className="ob-summary-key">Coach</span>
              <span className="ob-summary-val">{selectedCoach}</span>
            </div>
            <div className="ob-summary-row">
              <span className="ob-summary-key">Abonnement</span>
              <span className="ob-summary-val" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                {selectedTier === "PRO" ? "PRO · 300 kr/mnd" : "GRATIS"}
              </span>
            </div>
            {homeClub && (
              <div className="ob-summary-row">
                <span className="ob-summary-key">Hjemmebane</span>
                <span className="ob-summary-val">{homeClub}</span>
              </div>
            )}
            {hcp && (
              <div className="ob-summary-row">
                <span className="ob-summary-key">HCP</span>
                <span className="ob-summary-val" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                  {hcp}
                </span>
              </div>
            )}
            {seasonGoals.length > 0 && (
              <div className="ob-summary-row">
                <span className="ob-summary-key">Mål</span>
                <span className="ob-summary-val" style={{ fontSize: 13 }}>
                  {seasonGoals.join(" · ")}
                </span>
              </div>
            )}
          </div>

          <div className="ob-agree-list">
            <button
              type="button"
              className={`ob-agree-item${acceptedTerms ? " checked" : ""}`}
              onClick={() => setAcceptedTerms(!acceptedTerms)}
            >
              <div className="ob-agree-checkbox">
                {acceptedTerms && <Check size={12} color="#fff" />}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-inter-tight)",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  Jeg har lest og godtar AK Golf Academy sine vilkår
                </div>
                <div style={{ fontSize: 12, color: "#5E5C57", marginTop: 2 }}>
                  Inkluderer personvernerklæring og treningsfilosofi.
                </div>
              </div>
            </button>
            <button
              type="button"
              className={`ob-agree-item${acceptedPrivacy ? " checked" : ""}`}
              onClick={() => setAcceptedPrivacy(!acceptedPrivacy)}
            >
              <div className="ob-agree-checkbox">
                {acceptedPrivacy && <Check size={12} color="#fff" />}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-inter-tight)",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  Jeg samtykker til datadeling mellom coach og meg
                </div>
                <div style={{ fontSize: 12, color: "#5E5C57", marginTop: 2 }}>
                  Trenings- og helsedata. Du kan trekke tilbake samtykket når
                  som helst.
                </div>
              </div>
            </button>
          </div>

          <div className="ob-cta-row">
            <button className="ob-btn-outline" onClick={tilbake} disabled={pending}>
              <ChevronLeft size={15} />
              Tilbake
            </button>
            <button
              className="ob-btn-lime big"
              onClick={fullfor}
              disabled={pending || !acceptedTerms || !acceptedPrivacy}
            >
              {pending ? "Lagrer…" : "Fullfør registrering"}
              <Flag size={15} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="ob-error" style={{ margin: "0 40px 24px" }} role="alert">
          {error}
        </div>
      )}

      {step > 1 && step < 7 && (
        <div style={{ textAlign: "center", paddingBottom: 24 }}>
          <button
            type="button"
            onClick={hopp}
            disabled={pending}
            className="ob-skip-link"
          >
            Hopp over og gå til portalen
          </button>
        </div>
      )}
    </div>
  );
}
