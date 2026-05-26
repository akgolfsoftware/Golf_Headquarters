"use client";

import { useState, useTransition } from "react";
import {
  ArrowRight,
  Bell,
  Calendar,
  Check,
  Flag,
  Mail,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";
import { completeOnboarding } from "./actions";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const TOTAL_STEPS = 6;

const GOAL_CHIPS = [
  "Senke HCP",
  "Forberede konkurranse",
  "Spille mer konsekvent",
  "Ha det gøy",
  "Kvalifisere til lag",
  "Bli pro",
];

const YEARS_CHIPS = ["Under 1 år", "1–3 år", "3–5 år", "5+ år"];
const FREQ_CHIPS = ["1–2 økter/uke", "3–4 økter/uke", "5+ økter/uke"];

export function OnboardingClient({ defaultName }: { defaultName: string }) {
  const [step, setStep] = useState<Step>(1);
  const [pending, startTransition] = useTransition();

  const [fullName, setFullName] = useState(defaultName);
  const [birthDate, setBirthDate] = useState("12.04.2008");
  const [gender, setGender] = useState("Gutt");
  const [homeClub, setHomeClub] = useState("Gamle Fredrikstad GK");
  const [hcpSource, setHcpSource] = useState<"golfbox" | "manual">("golfbox");
  const [yearsPlaying, setYearsPlaying] = useState("5+ år");
  const [trainingFreq, setTrainingFreq] = useState("5+ økter/uke");
  const [goals, setGoals] = useState<string[]>(["Senke HCP", "Forberede konkurranse"]);
  const [goalText, setGoalText] = useState(
    "Topp 10 i NM Junior 2026 og senke HCP til +5,0 før august.",
  );
  const [coachSelected, setCoachSelected] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyDaily, setNotifyDaily] = useState(false);

  function toggleGoal(g: string) {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  function next() {
    if (step < TOTAL_STEPS) setStep((s) => (s + 1) as Step);
    else
      startTransition(async () => {
        await completeOnboarding({
          fullName,
          birthDate,
          gender,
          homeClub,
          hcpSource,
          yearsPlaying,
          trainingFrequency: trainingFreq,
          goals,
          goalText,
          coachName: coachSelected ? "Hans Brennum" : null,
          notifyPush,
          notifyEmail,
          notifyDaily,
        });
      });
  }

  function prev() {
    if (step > 1) setStep((s) => (s - 1) as Step);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border bg-card px-8 py-4">
        <span className="font-mono text-[12.5px] font-bold tracking-[0.04em] text-primary">
          AK GOLF · PLAYERHQ
        </span>
        <button
          type="button"
          onClick={() => startTransition(async () => completeOnboarding({}))}
          className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground"
        >
          Hopp over →
        </button>
      </header>

      {/* Progress */}
      <div className="mx-auto mt-8 flex max-w-[680px] items-center gap-4 px-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
          Steg <strong className="text-foreground">{step}</strong> av {TOTAL_STEPS}
        </span>
        <div className="flex flex-1 items-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold ${
                n < step
                  ? "bg-primary text-primary-foreground"
                  : n === step
                    ? "bg-foreground text-accent"
                    : "border border-border bg-card text-muted-foreground"
              }`}
            >
              {n < step ? <Check className="h-3 w-3" strokeWidth={2.5} /> : n}
            </div>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-[640px] px-4 sm:px-6 py-6 sm:py-10">
        <div
          className="space-y-6 rounded-[20px] border border-border bg-card p-6 sm:p-8 md:p-10"
          role="dialog"
          aria-modal="true"
        >
          {/* STEG 1 */}
          {step === 1 && (
            <>
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-accent text-primary">
                <Flag className="h-10 w-10" strokeWidth={1.5} />
              </div>
              <div className="space-y-2 text-center">
                <span className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
                  Onboarding · steg 01
                </span>
                <h1 className="font-display text-3xl sm:text-[36px] font-semibold leading-tight -tracking-[0.02em]">
                  Velkommen til{" "}
                  <em className="font-display italic font-normal text-primary">PlayerHQ</em>
                </h1>
                <p className="text-[14.5px] text-muted-foreground">
                  La oss sette opp profilen din — det tar 90 sekunder, og du kan endre alt
                  senere.
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-6">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
                  Bygd for elite-juniorer · Norsk bokmål
                </span>
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2 text-[13px] font-bold text-foreground shadow-[0_4px_14px_rgba(209,248,67,0.3)] hover:bg-[#C4E933]"
                >
                  Kom i gang
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              </div>
            </>
          )}

          {/* STEG 2 */}
          {step === 2 && (
            <>
              <StepHead
                step="02"
                titleLead="Hvem er du på"
                titleItalic="banen"
                titleTrail="?"
                sub="Grunninfo så vi kan personalisere planen din."
              />
              <Field label="Fullt navn">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-4 py-2 text-[14px] focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Fødselsdato">
                  <input
                    type="text"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-4 py-2 font-mono text-[14px] tabular-nums focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  />
                </Field>
                <Field label="Kjønn">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-4 py-2 text-[14px] focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  >
                    <option>Gutt</option>
                    <option>Jente</option>
                    <option>Annet</option>
                    <option>Foretrekker ikke å svare</option>
                  </select>
                </Field>
              </div>
              <Field label="Hjemmeklubb">
                <select
                  value={homeClub}
                  onChange={(e) => setHomeClub(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-4 py-2 text-[14px] focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                >
                  <option>Gamle Fredrikstad GK</option>
                  <option>Borre GK</option>
                  <option>Oslo GK</option>
                  <option>Bærum GK</option>
                </select>
              </Field>
              <StepFooter onPrev={prev} onNext={next} pending={pending} />
            </>
          )}

          {/* STEG 3 */}
          {step === 3 && (
            <>
              <StepHead
                step="03"
                titleLead="Hva er ditt"
                titleItalic="nivå"
                titleTrail="?"
                sub="Vi tilpasser drills og forventninger til der du er nå."
              />
              <Field label="Handicap">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setHcpSource("golfbox")}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      hcpSource === "golfbox"
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:border-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-foreground">
                      <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
                      Synket fra GolfBox
                    </div>
                    <div className="mt-2 font-mono text-[22px] font-bold tabular-nums text-primary">
                      +3,5
                    </div>
                    <div className="mt-1 text-[11.5px] text-muted-foreground">
                      Oppdatert 17. mai 2026
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHcpSource("manual")}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      hcpSource === "manual"
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:border-muted-foreground"
                    }`}
                  >
                    <div className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-foreground">
                      + Skriv inn manuelt
                    </div>
                    <div className="mt-2 text-[11.5px] text-muted-foreground">
                      Hvis du ikke bruker GolfBox ennå.
                    </div>
                  </button>
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10.5px] text-primary">
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                  HCP synker automatisk når nye runder registreres
                </div>
              </Field>

              <Field label="Hvor lenge har du spilt?">
                <ChipGroup
                  options={YEARS_CHIPS}
                  value={yearsPlaying}
                  onChange={setYearsPlaying}
                />
              </Field>

              <Field label="Treningsfrekvens">
                <ChipGroup
                  options={FREQ_CHIPS}
                  value={trainingFreq}
                  onChange={setTrainingFreq}
                />
              </Field>

              <StepFooter onPrev={prev} onNext={next} pending={pending} />
            </>
          )}

          {/* STEG 4 */}
          {step === 4 && (
            <>
              <StepHead
                step="04"
                titleLead="Hva vil du"
                titleItalic="oppnå"
                titleTrail="?"
                sub="Velg så mange som er relevante. AI bygger en plan rundt det."
              />
              <div className="flex flex-wrap gap-2">
                {GOAL_CHIPS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGoal(g)}
                    className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
                      goals.includes(g)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <Field label="Beskriv ditt viktigste mål for sesongen">
                <textarea
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-4 py-2 text-[14px] focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                />
              </Field>
              <StepFooter onPrev={prev} onNext={next} pending={pending} />
            </>
          )}

          {/* STEG 5 */}
          {step === 5 && (
            <>
              <StepHead
                step="05 · valgfritt"
                titleLead="Har du en"
                titleItalic="coach"
                titleTrail="?"
                sub="Knytt deg til en coach så de kan se planen og sende deg drills direkte."
              />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  defaultValue="Hans Brennum"
                  placeholder="Søk etter coach …"
                  className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-[14px] focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                />
              </div>
              <button
                type="button"
                onClick={() => setCoachSelected(true)}
                className={`grid w-full grid-cols-[44px_minmax(0,1fr)_24px] items-center gap-4 rounded-xl border px-4 py-2 text-left transition-colors ${
                  coachSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background"
                }`}
              >
                <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground">
                  HB
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold">Hans Brennum</div>
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
                    PGA · Gamle Fredrikstad GK · 14 spillere
                  </div>
                </div>
                {coachSelected && (
                  <Check className="h-5 w-5 text-primary" strokeWidth={2.5} />
                )}
              </button>
              <button
                type="button"
                onClick={() => setCoachSelected(false)}
                className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground"
              >
                Jeg har ingen coach ennå
              </button>
              <StepFooter
                onPrev={prev}
                onNext={next}
                pending={pending}
                nextLabel={
                  <>
                    Send forespørsel
                    <Send className="h-3.5 w-3.5" strokeWidth={2} />
                  </>
                }
              />
            </>
          )}

          {/* STEG 6 */}
          {step === 6 && (
            <>
              <StepHead
                step="06"
                titleLead="Hvordan vil du"
                titleItalic="varsles"
                titleTrail="?"
                sub="Du kan endre dette når som helst i innstillingene."
              />
              <div className="space-y-2">
                <Toggle
                  icon={<Bell className="h-5 w-5" strokeWidth={1.75} />}
                  title="Push på telefon"
                  desc="Påminnelser, coach-meldinger, kritiske oppdateringer."
                  on={notifyPush}
                  onChange={setNotifyPush}
                />
                <Toggle
                  icon={<Mail className="h-5 w-5" strokeWidth={1.75} />}
                  title="E-post"
                  desc="Ukentlig oppsummering, fakturaer, viktige varsler."
                  on={notifyEmail}
                  onChange={setNotifyEmail}
                />
                <Toggle
                  icon={<Calendar className="h-5 w-5" strokeWidth={1.75} />}
                  title="Daglig oppsummering"
                  desc="Kort sammendrag av dagens plan, kl. 07:30."
                  on={notifyDaily}
                  onChange={setNotifyDaily}
                />
              </div>
              <StepFooter
                onPrev={prev}
                onNext={next}
                pending={pending}
                nextLabel={
                  <>
                    {pending ? "Lagrer …" : "Fullfør og start utforskning"}
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </>
                }
                nextDark
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function StepHead({
  step,
  titleLead,
  titleItalic,
  titleTrail,
  sub,
}: {
  step: string;
  titleLead: string;
  titleItalic: string;
  titleTrail?: string;
  sub: string;
}) {
  return (
    <div className="space-y-2.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
        Onboarding · steg {step}
      </span>
      <h1 className="font-display text-[32px] font-semibold leading-tight -tracking-[0.02em]">
        {titleLead}{" "}
        <em className="font-display italic font-normal text-primary">{titleItalic}</em>
        {titleTrail}
      </h1>
      <p className="text-[14.5px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
            value === o
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-foreground hover:border-muted-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  icon,
  title,
  desc,
  on,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)_48px] items-center gap-4 rounded-xl border border-border bg-background px-4 py-2">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">
        {icon}
      </span>
      <div>
        <div className="text-[14px] font-semibold">{title}</div>
        <div className="text-[12px] text-muted-foreground">{desc}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!on)}
        aria-pressed={on}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          on ? "bg-primary" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 grid h-5 w-5 place-items-center rounded-full bg-card shadow transition-all ${
            on ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function StepFooter({
  onPrev,
  onNext,
  pending,
  nextLabel,
  nextDark,
}: {
  onPrev: () => void;
  onNext: () => void;
  pending: boolean;
  nextLabel?: React.ReactNode;
  nextDark?: boolean;
}) {
  return (
    <div className="ml-auto flex justify-end gap-2.5 border-t border-border pt-6">
      <button
        type="button"
        onClick={onPrev}
        className="rounded-full border border-border bg-transparent px-4 py-2.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
      >
        Tilbake
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={pending}
        className={`inline-flex items-center gap-2 rounded-full px-6 py-2 text-[13px] font-bold disabled:opacity-50 ${
          nextDark
            ? "bg-primary text-accent hover:opacity-90"
            : "bg-accent text-foreground shadow-[0_4px_14px_rgba(209,248,67,0.3)] hover:bg-[#C4E933]"
        }`}
      >
        {nextLabel ?? (
          <>
            Fortsett
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </>
        )}
      </button>
    </div>
  );
}
