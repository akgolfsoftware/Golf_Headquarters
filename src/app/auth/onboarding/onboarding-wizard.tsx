"use client";

/**
 * Onboarding-wizard (spiller) — MOBIL-FØRST 430px.
 * Fasit: designsystem/train-lock/PH-19 Onboarding.dc.html — DELVIS:
 * fasiten tegner 3 steg (hvem/hvor/coach-kode) på mørk scene, men /auth er
 * låst LYS (PP-A/A4, beslutninger.md) og steg-maskinen (6 steg, GDPR-gate)
 * er funksjonell fasit. Struktur-krympingen til 3 steg krever Anders'
 * beslutning — flagget som åpent avvik i PIKSELPLAN PX-1.
 * Chrome portet til fersk fasit (juni 2026): (historisk juni-fasit, fjernet fra repo)
 * AK Golf HQ Design System/playerhq-app/ph-auth.jsx → AOnboarding
 * (steps-rail, TRINN-eyebrow + AHead, opt-card-valg, CTA-rad m/tilbake).
 * 6-stegs velkomst (nivåplasserings-quiz lagt til 2026-07-24):
 *   1 Velkommen · 2 Om deg + fødselsdato (GDPR <16 gate) · 3 Golf-erfaring ·
 *   4 Nivåplassering · 5 Coach + abonnement · 6 Siste sjekk (samtykke).
 *
 * VIKTIG: All steg-logikk og lagre-actions er beholdt uendret fra forrige
 * versjon — kun presentasjonen er portet til mobil-først DS-token-komponenter.
 * v2-port 16. juli 2026: primitivfilene (wizard-chrome/wizard-fields) er
 * restylet til v2-tokens; her er KUN inline-presentasjon (steg 1-merke,
 * GolfBox/TrackMan-kort, feilboks) flyttet til T-tokens. Steg-maskin,
 * mindreårig-sjekk (steg 2), resume og alle actions er 100 % uendret.
 * Ingen hardkodet hex. Ingen emoji — kun lucide-react. Norsk bokmål.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Coffee,
  Flag,
  Sun,
  Sunrise,
  Sunset,
  Trophy,
} from "lucide-react";
import { TL } from "@/lib/v2/train-lock";

import {
  byggSgBaseline,
  tolkTall,
  TOMT_SG_SKJEMA,
  type SgSkjema,
} from "@/lib/onboarding/sg-baseline";
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
  PlaceRow,
  AddRowButton,
  NumberRow,
  FrequencySegment,
  CoachCard,
  PlanCard,
  SummaryCard,
  SummaryRow,
  AgreeItem,
} from "@/components/auth/onboarding/wizard-fields";

// ──────────────────────────────────────────────────────────────────────────────
// Konstanter
// ──────────────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 7;

// Hva et treningssted kan tilby — DrillFasilitet-verdier med klarspråk-etikett.
const STED_MULIGHETER = [
  { id: "DRIVING_RANGE", label: "Range" },
  { id: "BANE", label: "Bane" },
  { id: "PUTTING_GREEN_KORT", label: "Putting" },
  { id: "SHORT_GAME_AREA", label: "Nærspill" },
  { id: "BUNKER", label: "Bunker" },
  { id: "RADAR", label: "TrackMan" },
  { id: "SIMULATOR", label: "Simulator" },
  { id: "MAT_NET", label: "Matte/nett" },
  { id: "KAMERA", label: "Video" },
  { id: "VEKTSTANG", label: "Styrke" },
  { id: "LOPEBANE", label: "Løping" },
];

// SG-kategoriene spilleren fyller inn per periode i steg 4.
const SG_FELT = [
  { key: "sgOtt" as const, label: "Fra tee", hint: "OTT" },
  { key: "sgApp" as const, label: "Innspill", hint: "APP" },
  { key: "sgArg" as const, label: "Nærspill", hint: "ARG" },
  { key: "sgPutt" as const, label: "Putting", hint: "PUTT" },
];

type Sted = { id: string; name: string; isIndoor: boolean; capabilities: string[] };

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
  { initialer: "AK", navn: "Anders Kristiansen", rolle: "HEAD COACH", meta: "Trackman og målbar utvikling" },
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

// Bro fra stedenes DrillFasilitet-verdier til de gamle fasilitet-id-ene som
// FacilityPrefs bygges av (src/lib/onboarding/trening-preferanser.ts).
const MULIGHET_TIL_FASILITET: Record<string, string> = {
  RADAR: "TRACKMAN",
  SIMULATOR: "TRACKMAN",
  BANE: "GRESS_BANE",
  VEKTSTANG: "STUDIO",
  LOPEBANE: "STUDIO",
  PUTTING_GREEN_KORT: "MATTE_PUTTING",
  MAT_NET: "MATTE_PUTTING",
};

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

  // Steg 2 — Kontaktinfo + fødselsdato + skole
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(""); // format YYYY-MM-DD
  const [guardianEmail, setGuardianEmail] = useState("");
  const [dobIsMinor, setDobIsMinor] = useState(false);
  const [school, setSchool] = useState("");
  const [schoolYear, setSchoolYear] = useState<"" | "VG1" | "VG2" | "VG3">("");

  // Steg 3
  const [hcp, setHcp] = useState("");
  const [homeClub, setHomeClub] = useState("");
  const [playingYears, setPlayingYears] = useState("5");
  const [sessionFrequency, setSessionFrequency] = useState(5);
  const [seasonGoals, setSeasonGoals] = useState<string[]>([]);
  const [profiltype, setProfiltype] = useState<Profiltype>("KONKURRANSE");
  const [konkurranseNivaa, setKonkurranseNivaa] = useState("KLUBB");
  const [steder, setSteder] = useState<Sted[]>([]);
  const [traningsdager, setTraningsdager] = useState<string[]>(["man", "ons", "tor", "lør"]);
  const [tidPaaDagen, setTidPaaDagen] = useState("ETTER_SKOLE");
  const [drivkraft, setDrivkraft] = useState<string[]>(["Resultater", "Sosialt"]);

  // Steg 4 — Dine tall (snittscore + SG-baseline). Kan hoppes over.
  const [prevSeasonAvgScore, setPrevSeasonAvgScore] = useState("");
  const [sgApen, setSgApen] = useState(false);
  const [sgForrige, setSgForrige] = useState<SgSkjema>(TOMT_SG_SKJEMA);
  const [sgIAar, setSgIAar] = useState<SgSkjema>(TOMT_SG_SKJEMA);

  // Steg 5 — nivåplassering (progressiv dybde)
  const [nivaa, setNivaa] = useState<"nybegynner" | "ovet" | "elite" | "">("");

  // Steg 6
  const [selectedCoach, setSelectedCoach] = useState("Anders Kristiansen");
  const [selectedTier, setSelectedTier] = useState<"GRATIS" | "PRO">("PRO");

  // Steg 7
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [drillDelingGodtatt, setDrillDelingGodtatt] = useState(false);

  function leggTilSted() {
    setSteder((prev) => [
      ...prev,
      { id: `sted-${prev.length + 1}-${prev.length}`, name: "", isIndoor: false, capabilities: [] },
    ]);
  }

  function endreSted(id: string, endring: Partial<Sted>) {
    setSteder((prev) => prev.map((s) => (s.id === id ? { ...s, ...endring } : s)));
  }

  function buildData(): SpillerOnboardingData {
    const snitt = tolkTall(prevSeasonAvgScore);
    const gyldigeSteder = steder.filter((s) => s.name.trim());
    return {
      phone: phone || undefined,
      school: school || undefined,
      schoolYear: schoolYear || undefined,
      hcp: hcp ? parseFloat(hcp.replace(",", ".")) : undefined,
      homeClub: homeClub || undefined,
      playingYears: playingYears ? parseInt(playingYears, 10) : undefined,
      sessionFrequency,
      seasonGoals,
      profiltype,
      konkurranseNivaa,
      // Bakoverkompatibelt: FacilityPrefs bygges fortsatt av de gamle id-ene.
      fasiliteter: [
        ...new Set(
          gyldigeSteder
            .flatMap((s) => s.capabilities)
            .map((c) => MULIGHET_TIL_FASILITET[c])
            .filter((f): f is string => Boolean(f)),
        ),
      ],
      steder: gyldigeSteder.map((s) => ({
        name: s.name.trim(),
        isIndoor: s.isIndoor,
        capabilities: s.capabilities,
      })),
      traningsdager,
      tidPaaDagen,
      drivkraft,
      prevSeasonAvgScore: snitt !== undefined ? Math.round(snitt) : undefined,
      sgForrigeSesong: byggSgBaseline(sgForrige, snitt),
      sgHittilIAar: byggSgBaseline(sgIAar),
      nivaa: nivaa || undefined,
      selectedCoach,
      selectedTier,
      acceptedTerms,
      acceptedPrivacy,
      drillDelingGodtatt,
    };
  }

  // S-13: steg 2 har egen handler som kaller setDateOfBirthAndCheckMinor
  // hvis bruker har lagt inn fødselsdato.
  function nesteSteg2() {
    setError(null);
    if (!dateOfBirth) {
      // GDPR art. 8: fødselsdato er obligatorisk her — uten den kan vi ikke
      // avgjøre om bruker er mindreårig og trenger foreldresamtykke.
      setError("Fødselsdato er påkrevd for å opprette konto.");
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

  // Steg 7 er suksess-skjerm — redirect til portal (eller checkout-resume).
  // Lagrer buildData() først slik at acceptedTerms/acceptedPrivacy og alle
  // steg-3-feltene (fasiliteter, treningsdager osv.) er persistert før
  // completeOnboarding trigger side-effektene (FacilityPrefs, mål, m.m.).
  function fullfor() {
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

  // Fasit-format: «TRINN N AV M» som mono-caps eyebrow rett over tittelen.
  const eyebrowFor: Record<number, string> = {
    1: "VELKOMMEN",
    2: `TRINN 2 AV ${TOTAL_STEPS}`,
    3: `TRINN 3 AV ${TOTAL_STEPS}`,
    4: `TRINN 4 AV ${TOTAL_STEPS}`,
    5: `TRINN 5 AV ${TOTAL_STEPS}`,
    6: `TRINN 6 AV ${TOTAL_STEPS}`,
    7: `TRINN 7 AV ${TOTAL_STEPS}`,
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
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: TL.fill,
                  color: TL.onFill,
                  fontFamily: TL.font.sans,
                  fontSize: 24,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
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
          <Field label="Fødselsdato" hint="påkrevd — brukes for GDPR-samtykke (under 16 år)" htmlFor="ob-dob">
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
              <p className="mt-1 text-[11px]" style={{ color: TL.warn }}>
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
          <Field label="Skole" hint="valgfritt" htmlFor="ob-school">
            <TextField
              id="ob-school"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="f.eks. WANG Toppidrett Fredrikstad"
            />
          </Field>
          {school.trim() && (
            <Field label="Klassetrinn">
              <div className="flex flex-wrap gap-1.5">
                {(["VG1", "VG2", "VG3"] as const).map((trinn) => (
                  <PillToggle
                    key={trinn}
                    label={trinn}
                    selected={schoolYear === trinn}
                    onClick={() => setSchoolYear(schoolYear === trinn ? "" : trinn)}
                  />
                ))}
              </div>
            </Field>
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

          {/* Fasiliteter — navngitte steder med inne/ute og hva stedet har */}
          <FieldGroupLabel>Hvor trener du?</FieldGroupLabel>
          {steder.length === 0 && (
            <InfoNote>
              Legg til stedene du faktisk trener — hjemmebanen, simulatoren, treningssenteret.
              Da foreslår vi bare øvelser du har utstyr til.
            </InfoNote>
          )}
          <div className="flex flex-col gap-2.5">
            {steder.map((sted) => (
              <PlaceRow
                key={sted.id}
                name={sted.name}
                isIndoor={sted.isIndoor}
                capabilities={sted.capabilities}
                capabilityOptions={STED_MULIGHETER}
                onNameChange={(name) => endreSted(sted.id, { name })}
                onIndoorChange={(isIndoor) => endreSted(sted.id, { isIndoor })}
                onToggleCapability={(id) =>
                  endreSted(sted.id, {
                    capabilities: toggle(sted.capabilities, id, STED_MULIGHETER.length),
                  })
                }
                onRemove={() => setSteder((prev) => prev.filter((s) => s.id !== sted.id))}
              />
            ))}
            <AddRowButton label="Legg til sted" onClick={leggTilSted} />
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

      {/* ── STEG 4 — Dine tall (snittscore + SG-baseline, kan hoppes over) ── */}
      {step === 4 && (
        <StepBody>
          <StepHeading
            eyebrow={eyebrowFor[4]}
            title="Hvor står"
            emphasis="tallene dine"
            titleAfter=" i dag?"
            deck="Dette blir utgangspunktet vi måler fremgang mot. Har du ikke tallene nå, hopper du bare over."
          />

          <Field label="Snittscore forrige sesong" hint="brutto" htmlFor="ob-avg">
            <TextField
              id="ob-avg"
              mono
              inputMode="numeric"
              className="text-lg font-bold"
              value={prevSeasonAvgScore}
              onChange={(e) => setPrevSeasonAvgScore(e.target.value)}
              placeholder="f.eks. 76"
            />
          </Field>

          {!sgApen ? (
            <AddRowButton label="Legg til SG-tall" onClick={() => setSgApen(true)} />
          ) : (
            <>
              <InfoNote>
                Strokes gained viser hvor du vinner og taper slag mot ditt eget nivå.
                Fyll inn det du har — tomme felt er helt greit.
              </InfoNote>
              <FieldGroupLabel>Forrige sesong</FieldGroupLabel>
              <div className="flex flex-col gap-2">
                {SG_FELT.map((f) => (
                  <NumberRow
                    key={`forrige-${f.key}`}
                    id={`ob-sg-forrige-${f.key}`}
                    label={f.label}
                    hint={f.hint}
                    value={sgForrige[f.key]}
                    onChange={(v) => setSgForrige((prev) => ({ ...prev, [f.key]: v }))}
                    placeholder="0,0"
                  />
                ))}
              </div>
              <FieldGroupLabel>Hittil i år</FieldGroupLabel>
              <div className="flex flex-col gap-2">
                {SG_FELT.map((f) => (
                  <NumberRow
                    key={`iaar-${f.key}`}
                    id={`ob-sg-iaar-${f.key}`}
                    label={f.label}
                    hint={f.hint}
                    value={sgIAar[f.key]}
                    onChange={(v) => setSgIAar((prev) => ({ ...prev, [f.key]: v }))}
                    placeholder="0,0"
                  />
                ))}
              </div>
            </>
          )}

          <PrimaryCta onClick={neste} disabled={pending} onBack={tilbake} backDisabled={pending}>
            {pending ? "Lagrer…" : "Neste"}
          </PrimaryCta>
        </StepBody>
      )}

      {/* ── STEG 5 — Nivåplassering (ett spørsmål) ─────────────── */}
      {step === 5 && (
        <StepBody>
          <StepHeading
            eyebrow={eyebrowFor[5]}
            title="Hvor"
            emphasis="står du"
            titleAfter=" i golfspillet?"
            deck="Én ting — vi tilpasser dybden i analyser og anbefalinger. Du kan alltid endre dette senere."
          />
          <div className="flex flex-col gap-2">
            <OptionRow
              label="Jeg er i gang"
              sub="Enkelt og konkret — lite fagkode"
              selected={nivaa === "nybegynner"}
              onClick={() => setNivaa("nybegynner")}
            />
            <OptionRow
              label="Jeg trener jevnlig"
              sub="Mer detalj uten fagkode-flom"
              selected={nivaa === "ovet"}
              onClick={() => setNivaa("ovet")}
            />
            <OptionRow
              label="Jeg jakter score og tall"
              sub="Full SG-dekomponering og fagkoder"
              selected={nivaa === "elite"}
              onClick={() => setNivaa("elite")}
            />
          </div>
          <PrimaryCta
            onClick={neste}
            disabled={pending || !nivaa}
            onBack={tilbake}
            backDisabled={pending}
          >
            {pending ? "Lagrer…" : "Neste"}
          </PrimaryCta>
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
              {nivaa ? (
                <SummaryRow
                  label="Nivå"
                  value={
                    nivaa === "nybegynner"
                      ? "Jeg er i gang"
                      : nivaa === "ovet"
                        ? "Jeg trener jevnlig"
                        : "Jeg jakter score og tall"
                  }
                />
              ) : null}
              {homeClub && <SummaryRow label="Hjemmebane" value={homeClub} />}
              {school && <SummaryRow label="Skole" value={schoolYear ? `${school} · ${schoolYear}` : school} />}
              {hcp && <SummaryRow label="HCP" value={<span className="font-mono">{hcp}</span>} />}
              {prevSeasonAvgScore && (
                <SummaryRow
                  label="Snittscore i fjor"
                  value={<span className="font-mono">{prevSeasonAvgScore}</span>}
                />
              )}
              {steder.filter((s) => s.name.trim()).length > 0 && (
                <SummaryRow
                  label="Treningssteder"
                  value={steder.filter((s) => s.name.trim()).map((s) => s.name.trim()).join(" · ")}
                />
              )}
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
            <AgreeItem
              title="Egne øvelser jeg lager kan deles med plattformen"
              desc="Øvelsene dine blir tilgjengelige for andre spillere. Valgfritt — du kan endre dette i Meg senere."
              checked={drillDelingGodtatt}
              onClick={() => setDrillDelingGodtatt(!drillDelingGodtatt)}
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
            className="px-4 py-3 text-[13px]"
            style={{
              borderRadius: 11,
              border: `1px solid color-mix(in srgb, ${TL.danger} 30%, transparent)`,
              background: `color-mix(in srgb, ${TL.danger} 10%, transparent)`,
              color: TL.danger,
            }}
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
