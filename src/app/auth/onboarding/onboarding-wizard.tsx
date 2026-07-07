"use client";

/**
 * Onboarding-wizard (spiller) — MOBIL-FØRST 430px.
 * Chrome portet til fersk fasit (juni 2026): (historisk juni-fasit, fjernet fra repo)
 * AK Golf HQ Design System/playerhq-app/ph-auth.jsx → AOnboarding
 * (steps-rail, TRINN-eyebrow + AHead, opt-card-valg, CTA-rad m/tilbake).
 * NB: fasitens 5 steg ≠ appens låste 7-stegs state-maskin — stegene beholdes.
 *
 * 7-stegs velkomst (state-maskinen i lib/auth/onboarding-state.ts er låst til 7):
 *   1 Velkommen · 2 Om deg + fødselsdato (GDPR <16 gate) · 3 Golf-erfaring ·
 *   4 GolfBox · 5 TrackMan · 6 Coach + abonnement · 7 Siste sjekk (samtykke).
 *
 * VIKTIG: All steg-logikk og lagre-actions er beholdt uendret fra forrige
 * versjon — kun presentasjonen er portet til mobil-først DS-token-komponenter.
 * Ingen hardkodet hex. Ingen emoji — kun lucide-react. Norsk bokmål.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Coffee,
  CircleDot,
  Dumbbell,
  Flag,
  Hexagon,
  Link2,
  Settings,
  Sun,
  Sunrise,
  Sunset,
  Target,
  Trophy,
} from "lucide-react";
import {
  saveSpillerOnboardingStep,
  markStepComplete,
  completeOnboarding,
  setDateOfBirthAndCheckMinor,
  type SpillerOnboardingData,
} from "./actions";
import {
  ProgressDots,
  StepHeading,
  PrimaryCta,
  SecondaryLink,
} from "@/components/auth/onboarding/wizard-chrome";
import {
  Field,
  TextField,
  InfoNote,
  FieldGroupLabel,
  OptionRow,
  PillToggle,
  ProfileCard,
  ImplicationBanner,
  FacilityRow,
  FrequencySegment,
  CoachCard,
  PlanCard,
  SummaryCard,
  SummaryRow,
  AgreeItem,
  SecurityStrip,
} from "@/components/auth/onboarding/wizard-fields";

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
  { initialer: "ES", navn: "Erik Solli", rolle: "PUTTING-SPESIALIST", meta: "Anbefales for nærspill-fokus" },
  { initialer: "MH", navn: "Maja Hagen", rolle: "JUNIOR / UTVIKLING", meta: "Anbefales for nybegynnere og 12–16 år" },
];

const FREKVENS_VALG = [3, 4, 5, 6, 7];

// Profil-type (mosjon / konkurranse) + undertype — påvirker plan-rytmen.
type Profiltype = "MOSJON" | "KONKURRANSE";

const KONKURRANSE_NIVAA = [
  { id: "KLUBB", label: "Klubbgolfer", sub: "turneringer i klubb", icon: Flag },
  { id: "TOUR", label: "Tour-aspirant", sub: "NM, Korn Ferry, sikte mot proff", icon: Trophy },
];

// Fasilitet-valg for steg 4 — speiler design-HTMLs fasilitets-rader.
const FASILITETER = [
  { id: "TRACKMAN", navn: "TrackMan", sub: "launch monitor / radar", icon: Target },
  { id: "MATTE_PUTTING", navn: "Matte / putting", sub: "innendørs vinter", icon: Hexagon },
  { id: "GRESS_BANE", navn: "Gress-bane", sub: "9 eller 18 hull", icon: CircleDot },
  { id: "STUDIO", navn: "Treningsstudio", sub: "fysiske økter", icon: Dumbbell },
];

// Preferanser — ukedager, tid på dagen, hva som driver spilleren.
const UKEDAGER = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];
const TID_PAA_DAGEN = [
  { id: "TIDLIG", label: "Tidlig", icon: Sunrise },
  { id: "DAG", label: "Dag", icon: Sun },
  { id: "ETTER_SKOLE", label: "Etter skole", icon: Sunset },
];
const DRIVKRAFT = ["Resultater", "Konsistens", "Sosialt", "Stillhet", "Konkurranse"];

// ──────────────────────────────────────────────────────────────────────────────
// Hjelpere
// ──────────────────────────────────────────────────────────────────────────────

function toggle<T>(arr: T[], item: T, max: number): T[] {
  if (arr.includes(item)) return arr.filter((x) => x !== item);
  if (arr.length >= max) return arr;
  return [...arr, item];
}

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

export function OnboardingWizard({
  initialStep = 1,
  subscribe,
}: {
  initialStep?: number;
  subscribe?: string;
}) {
  // Mål etter fullført onboarding: gjenoppta checkout hvis besøkende valgte en pakke.
  const ferdigMaal = subscribe
    ? `/auth/checkout-resume?plan=${encodeURIComponent(subscribe)}`
    : "/portal";
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
  const [profiltype, setProfiltype] = useState<Profiltype>("KONKURRANSE");
  const [konkurranseNivaa, setKonkurranseNivaa] = useState("KLUBB");
  const [fasiliteter, setFasiliteter] = useState<string[]>(["TRACKMAN", "MATTE_PUTTING", "GRESS_BANE"]);
  const [traningsdager, setTraningsdager] = useState<string[]>(["man", "ons", "tor", "lør"]);
  const [tidPaaDagen, setTidPaaDagen] = useState("ETTER_SKOLE");
  const [drivkraft, setDrivkraft] = useState<string[]>(["Resultater", "Sosialt"]);

  // Steg 6
  const [selectedCoach, setSelectedCoach] = useState("Anders Kristiansen");
  const [selectedTier, setSelectedTier] = useState<"GRATIS" | "PRO">("PRO");

  // Steg 7
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
        await completeOnboarding(subscribe);
      } catch {
        router.push(ferdigMaal);
        router.refresh();
      }
    });
  }

  // Steg 7 er suksess-skjerm — redirect til portal (eller checkout-resume)
  function fullfor() {
    setError(null);
    startTransition(async () => {
      try {
        await completeOnboarding(subscribe);
      } catch {
        router.push(ferdigMaal);
        router.refresh();
      }
    });
  }

  // Fasit-format: «TRINN N AV M» som mono-caps eyebrow rett over tittelen.
  const eyebrowFor: Record<number, string> = {
    1: "VELKOMMEN",
    2: "TRINN 2 AV 7",
    3: "TRINN 3 AV 7",
    4: "TRINN 4 AV 7",
    5: "TRINN 5 AV 7",
    6: "TRINN 6 AV 7",
    7: "TRINN 7 AV 7",
  };

  return (
    <div className="w-full">
      {/* steps-rail (fasit: skjult på velkomst-steget) */}
      {step > 1 && (
        <div className="mx-auto w-full max-w-[430px] px-4 pt-5">
          <ProgressDots total={TOTAL_STEPS} current={step} />
        </div>
      )}

      {/* ── STEG 1 — Velkommen (fasit: sentrert logo + AHead + CTA) ── */}
      {step === 1 && (
        <StepBody>
          <div className="pt-2">
            <div className="mb-5 flex justify-center">
              <span
                aria-hidden
                className="grid h-14 w-14 place-items-center rounded-[14px] bg-accent font-display text-2xl font-extrabold leading-none text-primary"
              >
                ak
              </span>
            </div>
            <StepHeading
              center
              eyebrow={eyebrowFor[1]}
              title="Vi"
              emphasis="gleder oss"
              titleAfter=" til å jobbe med deg."
              deck="Coach Anders har invitert deg inn i AK Golf Academy. De neste minuttene tar vi en kort gjennomgang for å sette opp profilen din."
            />
          </div>
          <PrimaryCta onClick={neste} disabled={pending}>
            Kom i gang
          </PrimaryCta>
        </StepBody>
      )}

      {/* ── STEG 2 — Om deg + fødselsdato (GDPR-gate) ──────────── */}
      {step === 2 && (
        <StepBody>
          <StepHeading
            eyebrow={eyebrowFor[2]}
            title="La oss bli"
            emphasis="kjent"
            titleAfter="."
            deck="Litt grunninfo så Anders kan tilpasse opplegget ditt. Du kan endre alt senere."
          />
          <Field label="Telefon" htmlFor="ob-phone">
            <TextField
              id="ob-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+47 ..."
              autoComplete="tel"
            />
          </Field>
          <Field label="Handicap" hint="forhåndsvisning" htmlFor="ob-hcp-early">
            <TextField
              id="ob-hcp-early"
              mono
              inputMode="decimal"
              value={hcp}
              onChange={(e) => setHcp(e.target.value)}
              placeholder="f.eks. 18,4"
            />
          </Field>
          <Field label="Fødselsdato" hint="brukes for GDPR-samtykke (under 16 år)" htmlFor="ob-dob">
            <TextField
              id="ob-dob"
              type="date"
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
          </Field>
          {dobIsMinor && (
            <Field label="E-post til foresatt (påkrevd)" htmlFor="ob-guardian-email">
              <TextField
                id="ob-guardian-email"
                type="email"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                placeholder="forelder@example.com"
                autoComplete="email"
              />
              <p className="mt-1 text-[11px] text-warning">
                Vi sender en forespørsel om foreldresamtykke iht. GDPR art. 8.
              </p>
            </Field>
          )}
          {dobIsMinor && (
            <InfoNote>
              Du er under 16. Vi ber en{" "}
              <strong className="font-semibold">foresatt bekrefte kontoen din</strong>. Du kan
              fortsette gjennom alle steg, men booking og logging åpnes først etter bekreftelse.
            </InfoNote>
          )}
          <PrimaryCta
            onClick={nesteSteg2}
            disabled={pending}
            onBack={tilbake}
            backDisabled={pending}
          >
            {pending ? "Lagrer…" : "Neste"}
          </PrimaryCta>
        </StepBody>
      )}

      {/* ── STEG 3 — Golf-erfaring + profil + fasiliteter + preferanser ─ */}
      {step === 3 && (
        <StepBody>
          <StepHeading
            eyebrow={eyebrowFor[3]}
            title="Fortell om"
            emphasis="spillet ditt"
            titleAfter="."
            deck="Dette hjelper Anders med å skreddersy treningsplanen din fra dag én."
          />

          <Field label="Handicap" htmlFor="ob-hcp">
            <TextField
              id="ob-hcp"
              mono
              inputMode="decimal"
              className="text-lg font-bold"
              value={hcp}
              onChange={(e) => setHcp(e.target.value)}
              placeholder="+3,5"
            />
          </Field>
          <Field label="Hjemmebane / klubb" htmlFor="ob-club">
            <TextField
              id="ob-club"
              value={homeClub}
              onChange={(e) => setHomeClub(e.target.value)}
              placeholder="f.eks. Gamle Fredrikstad GK"
            />
          </Field>
          <Field label="Antall år du har spilt" htmlFor="ob-years">
            <TextField
              id="ob-years"
              mono
              type="number"
              min={0}
              max={50}
              value={playingYears}
              onChange={(e) => setPlayingYears(e.target.value)}
              placeholder="f.eks. 11"
            />
          </Field>

          <Field label="Antall økter per uke">
            <FrequencySegment
              options={FREKVENS_VALG}
              value={sessionFrequency}
              onChange={setSessionFrequency}
              unit="økter / uke"
            />
          </Field>

          {/* Profil-bryter — mosjon eller konkurranse */}
          <FieldGroupLabel>Mosjon eller konkurranse</FieldGroupLabel>
          <div className="grid grid-cols-2 gap-2">
            <ProfileCard
              name="Mosjon"
              desc="Spill for moro · ingen test-press"
              icon={Coffee}
              selected={profiltype === "MOSJON"}
              onClick={() => setProfiltype("MOSJON")}
            />
            <ProfileCard
              name="Konkurranse"
              desc="Klubb-/regionsspill · testuker"
              icon={Trophy}
              selected={profiltype === "KONKURRANSE"}
              onClick={() => setProfiltype("KONKURRANSE")}
            />
          </div>
          {profiltype === "KONKURRANSE" && (
            <>
              <ImplicationBanner>
                Dette betyr: periodisert årsplan · testuke · resultatmål
              </ImplicationBanner>
              <div className="flex flex-col gap-2.5">
                {KONKURRANSE_NIVAA.map((n) => (
                  <OptionRow
                    key={n.id}
                    label={n.label}
                    sub={n.sub}
                    icon={n.icon}
                    selected={konkurranseNivaa === n.id}
                    onClick={() => setKonkurranseNivaa(n.id)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Fasiliteter */}
          <FieldGroupLabel>Hvor trener du?</FieldGroupLabel>
          <div className="flex flex-col gap-2.5">
            {FASILITETER.map((f) => (
              <FacilityRow
                key={f.id}
                name={f.navn}
                sub={f.sub}
                icon={f.icon}
                selected={fasiliteter.includes(f.id)}
                onClick={() => setFasiliteter((prev) => toggle(prev, f.id, FASILITETER.length))}
              />
            ))}
          </div>

          {/* Preferanser — ukedager / tid / drivkraft */}
          <FieldGroupLabel>Når passer det å trene?</FieldGroupLabel>
          <div className="flex flex-wrap gap-1.5">
            {UKEDAGER.map((d) => (
              <PillToggle
                key={d}
                label={d}
                selected={traningsdager.includes(d)}
                onClick={() => setTraningsdager((prev) => toggle(prev, d, UKEDAGER.length))}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TID_PAA_DAGEN.map((t) => (
              <PillToggle
                key={t.id}
                label={t.label}
                icon={t.icon}
                selected={tidPaaDagen === t.id}
                onClick={() => setTidPaaDagen(t.id)}
              />
            ))}
          </div>
          <FieldGroupLabel>Hva driver deg</FieldGroupLabel>
          <div className="flex flex-wrap gap-1.5">
            {DRIVKRAFT.map((d) => (
              <PillToggle
                key={d}
                label={d}
                selected={drivkraft.includes(d)}
                onClick={() => setDrivkraft((prev) => toggle(prev, d, DRIVKRAFT.length))}
              />
            ))}
          </div>

          {/* Sesongmål */}
          <FieldGroupLabel>Sesongmål — velg inntil 3</FieldGroupLabel>
          <div className="flex flex-wrap gap-1.5">
            {SESONMAAL.map((maal) => (
              <PillToggle
                key={maal}
                label={maal}
                selected={seasonGoals.includes(maal)}
                onClick={() => setSeasonGoals((prev) => toggle(prev, maal, 3))}
              />
            ))}
          </div>

          <PrimaryCta
            onClick={neste}
            disabled={pending}
            onBack={tilbake}
            backDisabled={pending}
          >
            {pending ? "Lagrer…" : "Neste"}
          </PrimaryCta>
        </StepBody>
      )}

      {/* ── STEG 4 — GolfBox ───────────────────────────────────── */}
      {step === 4 && (
        <StepBody>
          <StepHeading
            eyebrow={eyebrowFor[4]}
            title="Koble til"
            emphasis="GolfBox"
            titleAfter="."
            deck={
              <>
                Når du kobler til GolfBox-kontoen din, henter vi automatisk inn HCP-historikken og
                runde-data dine.{" "}
                <strong className="font-semibold text-foreground">
                  Anders får et komplett bilde fra dag én.
                </strong>
              </>
            }
          />
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-secondary px-4 py-6 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-card text-primary">
              <Link2 className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="font-display text-[22px] font-extrabold tracking-[-0.02em] text-foreground">
              GolfBox
            </span>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Vi henter HCP, runder spilt siste 24 mnd, og turneringshistorikk.
            </p>
            <button
              type="button"
              disabled
              title="Kommer post-BETA"
              className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground opacity-50"
            >
              Koble til GolfBox · kommer snart
            </button>
            <p className="font-mono text-[10px] tracking-[0.06em] text-muted-foreground">
              Krever GolfBox-konto · Vi lagrer aldri passordet ditt
            </p>
          </div>
          <SecurityStrip>
            Vi følger GDPR og lagrer kun det vi trenger for å hjelpe deg utvikle deg som spiller.
          </SecurityStrip>
          <PrimaryCta
            onClick={neste}
            disabled={pending}
            onBack={tilbake}
            backDisabled={pending}
          >
            {pending ? "Lagrer…" : "Neste"}
          </PrimaryCta>
          <SecondaryLink onClick={neste} disabled={pending}>
            Hopp over — jeg kobler til senere
          </SecondaryLink>
        </StepBody>
      )}

      {/* ── STEG 5 — TrackMan ──────────────────────────────────── */}
      {step === 5 && (
        <StepBody>
          <StepHeading
            eyebrow={eyebrowFor[5]}
            title="Koble til"
            emphasis="TrackMan"
            titleAfter="."
            deck="Har du en TrackMan-konto, kobler vi den slik at swing-data og ball-flight automatisk synkes til profilen din."
          />
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-secondary px-4 py-6 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-card text-primary">
              <Settings className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="font-display text-[22px] font-extrabold tracking-[-0.02em] text-foreground">
              TrackMan
            </span>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Vi henter swing-data, ball-flight og distance-data fra alle dine økter.
            </p>
            <button
              type="button"
              disabled
              title="Kommer post-BETA"
              className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground opacity-50"
            >
              Koble til TrackMan · kommer snart
            </button>
            <p className="font-mono text-[10px] tracking-[0.06em] text-muted-foreground">
              Krever TrackMan-konto eller Performance Studio-tilgang
            </p>
          </div>
          <SecurityStrip>
            <strong className="font-semibold">Bruker du Performance Studio på GFGK?</strong> Da er
            TrackMan automatisk koblet på via klubb-abonnementet.
          </SecurityStrip>
          <PrimaryCta
            onClick={neste}
            disabled={pending}
            onBack={tilbake}
            backDisabled={pending}
          >
            {pending ? "Lagrer…" : "Neste"}
          </PrimaryCta>
          <SecondaryLink onClick={neste} disabled={pending}>
            Hopp over — jeg har ikke TrackMan-konto
          </SecondaryLink>
        </StepBody>
      )}

      {/* ── STEG 6 — Coach + abonnement ────────────────────────── */}
      {step === 6 && (
        <StepBody>
          <StepHeading
            eyebrow={eyebrowFor[6]}
            title="Din"
            emphasis="coach"
            titleAfter=" og ditt opplegg."
            deck="Velg coach og abonnement. Du kan endre dette når som helst."
          />

          <FieldGroupLabel>Velg coach</FieldGroupLabel>
          <div className="flex flex-col gap-2">
            {COACHES.map((coach) => (
              <CoachCard
                key={coach.navn}
                initials={coach.initialer}
                name={coach.navn}
                role={coach.rolle}
                meta={coach.meta}
                selected={selectedCoach === coach.navn}
                onClick={() => setSelectedCoach(coach.navn)}
              />
            ))}
          </div>

          <FieldGroupLabel>Velg abonnement</FieldGroupLabel>
          <div className="grid grid-cols-1 gap-2">
            <PlanCard
              tier="Gratis"
              price="0 kr"
              per="/mnd"
              features={["PlayerHQ-profil", "1 økt-logg per uke", "Turneringskalender", "HCP-tracking"]}
              footnote="Ingen booking, drill-bibliotek eller AI-coach"
              selected={selectedTier === "GRATIS"}
              onClick={() => setSelectedTier("GRATIS")}
            />
            <PlanCard
              tier="Pro"
              price="299 kr"
              per="/mnd"
              recommended
              features={[
                "Alt i GRATIS",
                "Booking av økter og turneringer",
                "142-drill bibliotek",
                "AI-coach Anders",
                "Bane-strategier · Foreldre-portal",
              ]}
              footnote="Avsluttes når som helst"
              selected={selectedTier === "PRO"}
              onClick={() => setSelectedTier("PRO")}
            />
          </div>

          <PrimaryCta
            onClick={neste}
            disabled={pending}
            onBack={tilbake}
            backDisabled={pending}
          >
            {pending ? "Lagrer…" : "Neste"}
          </PrimaryCta>
        </StepBody>
      )}

      {/* ── STEG 7 — Siste sjekk (samtykke) ────────────────────── */}
      {step === 7 && (
        <StepBody>
          <StepHeading
            eyebrow={eyebrowFor[7]}
            title="Nesten"
            emphasis="ferdig"
            titleAfter=" — siste sjekk."
            deck="Bekreft at du godtar vilkårene for å fullføre registreringen."
          />

          <SummaryCard>
            <div className="flex flex-col">
              <SummaryRow label="Coach" value={selectedCoach} />
              <SummaryRow
                label="Abonnement"
                value={
                  <span className="font-mono">
                    {selectedTier === "PRO" ? "PRO · 299 kr/mnd" : "GRATIS"}
                  </span>
                }
              />
              {homeClub && <SummaryRow label="Hjemmebane" value={homeClub} />}
              {hcp && <SummaryRow label="HCP" value={<span className="font-mono">{hcp}</span>} />}
              {seasonGoals.length > 0 && (
                <SummaryRow label="Mål" value={seasonGoals.join(" · ")} />
              )}
            </div>
          </SummaryCard>

          <div className="flex flex-col gap-2">
            <AgreeItem
              title="Jeg har lest og godtar AK Golf Academy sine vilkår"
              desc="Inkluderer personvernerklæring og treningsfilosofi."
              checked={acceptedTerms}
              onClick={() => setAcceptedTerms(!acceptedTerms)}
            />
            <AgreeItem
              title="Jeg samtykker til datadeling mellom coach og meg"
              desc="Trenings- og helsedata. Du kan trekke tilbake samtykket når som helst."
              checked={acceptedPrivacy}
              onClick={() => setAcceptedPrivacy(!acceptedPrivacy)}
            />
          </div>

          <PrimaryCta
            onClick={fullfor}
            disabled={pending || !acceptedTerms || !acceptedPrivacy}
            onBack={tilbake}
            backDisabled={pending}
            icon={Check}
          >
            {pending ? "Lagrer…" : "Fullfør"}
          </PrimaryCta>
        </StepBody>
      )}

      {error && (
        <div className="mx-auto mb-4 w-full max-w-[430px] px-4">
          <div
            className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-[13px] text-destructive"
            role="alert"
          >
            {error}
          </div>
        </div>
      )}

      {step > 1 && step < TOTAL_STEPS && (
        <div className="mx-auto w-full max-w-[430px] px-4 pb-6">
          <SecondaryLink onClick={hopp} disabled={pending}>
            Hopp over og gå til portalen
          </SecondaryLink>
        </div>
      )}
    </div>
  );
}
