"use client";

/**
 * Ny turnering — klient-wizard (5 steg).
 *
 * Steg:
 *  1) Type      — Intern AK / Eksternt event
 *  2) Detaljer  — Navn, dato(er), bane, runder, beskrivelse
 *  3) Format    — Spillformat, tee, HCP-justering, cut
 *  4) Påmelding — Frist, max deltakere, pris, prio
 *  5) Bekreft   — Sammendrag + opprett
 *
 * Validering kjøres per steg før "Neste" blir aktivert. Server-action
 * `createTournament` får hele payload som zod-validerer på nytt.
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ExternalLink,
  Flag,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";

import { createTournament } from "./actions";

const ICON_STROKE = 1.75;

type Course = { id: string; name: string };

type StepKey = 1 | 2 | 3 | 4 | 5;
type TurneringType = "INTERN" | "EKSTERN";
type Format = "STROKE" | "MATCH" | "STABLEFORD" | "SKINS" | "FOURSOME";
type Hcp = "FULL" | "P90" | "P75" | "SCRATCH";
type Prioritet = "MAJOR" | "NORMAL" | "LOCAL";

type State = {
  type: TurneringType;
  name: string;
  startDate: string;
  endDate: string;
  courseId: string;
  manualVenue: string;
  rounds: number;
  description: string;
  format: Format;
  teeOptions: string[];
  hcpAdjust: Hcp;
  hasCut: boolean;
  registrationDeadline: string;
  maxParticipants: number;
  feeKr: number; // wizardens UI bruker kroner — konverteres til øre ved submit
  priority: Prioritet;
  sendInvitations: boolean;
};

const INITIAL: State = {
  type: "INTERN",
  name: "",
  startDate: "",
  endDate: "",
  courseId: "",
  manualVenue: "",
  rounds: 2,
  description: "",
  format: "STROKE",
  teeOptions: ["Gul"],
  hcpAdjust: "FULL",
  hasCut: false,
  registrationDeadline: "",
  maxParticipants: 36,
  feeKr: 450,
  priority: "NORMAL",
  sendInvitations: true,
};

const FORMAT_LABELS: Record<Format, string> = {
  STROKE: "Strokeplay",
  MATCH: "Matchplay",
  STABLEFORD: "Stableford",
  SKINS: "Skins",
  FOURSOME: "Foursome",
};

const HCP_LABELS: Record<Hcp, string> = {
  FULL: "Full HCP",
  P90: "90 %",
  P75: "75 %",
  SCRATCH: "Scratch",
};

const PRIO_LABELS: Record<Prioritet, string> = {
  MAJOR: "Major",
  NORMAL: "Normal",
  LOCAL: "Lokal",
};

const TEE_VALG = ["Hvit", "Gul", "Blå", "Rød", "Sort"];

const STEPS: { key: StepKey; label: string }[] = [
  { key: 1, label: "Type" },
  { key: 2, label: "Detaljer" },
  { key: 3, label: "Format" },
  { key: 4, label: "Påmelding" },
  { key: 5, label: "Bekreft" },
];

function formatNoDate(s: string): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatKr(n: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 2,
  }).format(n);
}

function validateStep(step: StepKey, s: State): string | null {
  if (step === 1) {
    if (s.type !== "INTERN" && s.type !== "EKSTERN") return "Velg type";
    return null;
  }
  if (step === 2) {
    if (s.name.trim().length < 2) return "Navn er påkrevd";
    if (!s.startDate) return "Startdato er påkrevd";
    if (s.endDate && s.endDate < s.startDate)
      return "Sluttdato må være etter startdato";
    if (!s.courseId && !s.manualVenue.trim())
      return "Velg bane eller skriv inn manuelt";
    if (s.rounds < 1) return "Antall runder må være minst 1";
    return null;
  }
  if (step === 3) {
    if (s.teeOptions.length === 0) return "Velg minst én tee";
    return null;
  }
  if (step === 4) {
    if (s.maxParticipants < 1) return "Max deltakere må være minst 1";
    if (s.feeKr < 0) return "Pris kan ikke være negativ";
    if (
      s.registrationDeadline &&
      s.startDate &&
      s.registrationDeadline > s.startDate
    )
      return "Påmeldingsfrist må være før startdato";
    return null;
  }
  return null;
}

export function NyTurneringWizard({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [step, setStep] = useState<StepKey>(1);
  const [state, setState] = useState<State>(INITIAL);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const stepError = useMemo(() => validateStep(step, state), [step, state]);

  function update<K extends keyof State>(key: K, value: State[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function neste() {
    const feil = validateStep(step, state);
    if (feil) {
      setError(feil);
      return;
    }
    setError(null);
    if (step < 5) setStep(((step as number) + 1) as StepKey);
  }

  function tilbake() {
    setError(null);
    if (step > 1) setStep(((step as number) - 1) as StepKey);
  }

  function submit() {
    // Endelig validering (kjør per-steg over alle steg)
    for (const k of [1, 2, 3, 4] as StepKey[]) {
      const feil = validateStep(k, state);
      if (feil) {
        setStep(k);
        setError(feil);
        return;
      }
    }
    setError(null);
    startTransition(async () => {
      const res = await createTournament({
        type: state.type,
        name: state.name,
        startDate: state.startDate,
        endDate: state.endDate || null,
        courseId: state.courseId || null,
        manualVenue: state.manualVenue || null,
        rounds: state.rounds,
        description: state.description || null,
        format: state.format,
        teeOptions: state.teeOptions,
        hcpAdjust: state.hcpAdjust,
        hasCut: state.hasCut,
        registrationDeadline: state.registrationDeadline || null,
        maxParticipants: state.maxParticipants,
        feeOre: Math.round(state.feeKr * 100),
        priority: state.priority,
        sendInvitations: state.sendInvitations,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/admin/tournaments/${res.tournamentId}`);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <StegBar step={step} />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        {step === 1 && <StegType state={state} update={update} />}
        {step === 2 && (
          <StegDetaljer state={state} update={update} courses={courses} />
        )}
        {step === 3 && <StegFormat state={state} update={update} />}
        {step === 4 && <StegPaamelding state={state} update={update} />}
        {step === 5 && (
          <StegBekreft state={state} courses={courses} update={update} />
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}
      </div>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-full border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
        <Link
          href="/admin/tournaments"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-input bg-card px-4 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={ICON_STROKE} aria-hidden />
          Avbryt
        </Link>

        <div className="flex items-center gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={tilbake}
              disabled={pending}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-input bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={ICON_STROKE} aria-hidden />
              Forrige
            </button>
          )}
          {step < 5 ? (
            <button
              type="button"
              onClick={neste}
              disabled={pending || !!stepError}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              Neste
              <ArrowRight className="h-4 w-4" strokeWidth={ICON_STROKE} aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <Check className="h-4 w-4" strokeWidth={ICON_STROKE} aria-hidden />
              {pending ? "Oppretter…" : "Opprett turnering"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Steg-bar ---------- */

function StegBar({ step }: { step: StepKey }) {
  return (
    <ol className="flex w-full items-center justify-between gap-2">
      {STEPS.map((s, i) => {
        const active = s.key === step;
        const done = s.key < step;
        return (
          <li key={s.key} className="flex flex-1 items-center gap-2">
            <span
              className={[
                "grid h-8 w-8 shrink-0 place-items-center rounded-full border font-mono text-xs font-semibold tabular-nums transition-colors",
                done
                  ? "border-primary bg-primary text-primary-foreground"
                  : active
                    ? "border-primary bg-card text-primary"
                    : "border-border bg-card text-muted-foreground",
              ].join(" ")}
              aria-current={active ? "step" : undefined}
            >
              {done ? (
                <Check className="h-4 w-4" strokeWidth={ICON_STROKE} aria-hidden />
              ) : (
                s.key
              )}
            </span>
            <span
              className={[
                "hidden truncate font-mono text-[10px] uppercase tracking-[0.10em] sm:inline",
                active
                  ? "text-foreground"
                  : done
                    ? "text-primary"
                    : "text-muted-foreground",
              ].join(" ")}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className={[
                  "ml-1 hidden h-px flex-1 sm:block",
                  done ? "bg-primary" : "bg-border",
                ].join(" ")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- Steg 1 — Type ---------- */

function StegType({
  state,
  update,
}: {
  state: State;
  update: <K extends keyof State>(k: K, v: State[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <StegHeader title="Hva slags turnering?" sub="Bestem om dette er en intern AK-turnering eller et eksternt event spillerne påmeldes til." />
      <div className="grid gap-4 md:grid-cols-2">
        <TypeKort
          aktiv={state.type === "INTERN"}
          onClick={() => update("type", "INTERN")}
          icon={<Trophy className="h-6 w-6" strokeWidth={ICON_STROKE} aria-hidden />}
          tittel="Intern AK-turnering"
          beskrivelse="Vi arrangerer selv — AK Golf Cup, klubbmesterskap, treningsmatch."
          accent
        />
        <TypeKort
          aktiv={state.type === "EKSTERN"}
          onClick={() => update("type", "EKSTERN")}
          icon={<ExternalLink className="h-6 w-6" strokeWidth={ICON_STROKE} aria-hidden />}
          tittel="Eksternt event"
          beskrivelse="Spillere melder seg på en ekstern turnering (NM, Srixon Tour osv.) — vi tracker resultatene."
        />
      </div>
    </div>
  );
}

function TypeKort({
  aktiv,
  onClick,
  icon,
  tittel,
  beskrivelse,
  accent = false,
}: {
  aktiv: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  tittel: string;
  beskrivelse: string;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktiv}
      className={[
        "flex flex-col gap-3 rounded-xl border p-6 text-left transition-colors",
        aktiv
          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
          : "border-border bg-card hover:bg-secondary/40",
      ].join(" ")}
    >
      <span
        className={[
          "grid h-12 w-12 place-items-center rounded-full",
          accent ? "bg-accent/40 text-foreground" : "bg-secondary text-foreground",
        ].join(" ")}
      >
        {icon}
      </span>
      <span className="font-display text-lg font-semibold leading-tight">
        {tittel}
      </span>
      <span className="text-sm text-muted-foreground">{beskrivelse}</span>
    </button>
  );
}

/* ---------- Steg 2 — Detaljer ---------- */

function StegDetaljer({
  state,
  update,
  courses,
}: {
  state: State;
  update: <K extends keyof State>(k: K, v: State[K]) => void;
  courses: Course[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <StegHeader
        title="Detaljer"
        sub="Navn, datoer og hvor turneringen spilles. Du kan velge bane fra listen eller skrive inn manuelt for eksterne event."
      />
      <div className="grid gap-5 md:grid-cols-2">
        <Felt label="Navn på turnering" required>
          <input
            type="text"
            value={state.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="F.eks. Larvik Open 2026"
            className={inputCls}
            autoFocus
          />
        </Felt>
        <Felt label="Antall runder">
          <input
            type="number"
            min={1}
            max={8}
            value={state.rounds}
            onChange={(e) =>
              update("rounds", Math.max(1, Number(e.target.value) || 1))
            }
            className={inputCls + " tabular-nums"}
          />
        </Felt>
        <Felt label="Startdato" required>
          <input
            type="date"
            value={state.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            className={inputCls}
          />
        </Felt>
        <Felt label="Sluttdato (valgfri)">
          <input
            type="date"
            value={state.endDate}
            onChange={(e) => update("endDate", e.target.value)}
            className={inputCls}
          />
        </Felt>
        <Felt label="Bane (fra biblioteket)">
          <select
            value={state.courseId}
            onChange={(e) => update("courseId", e.target.value)}
            className={inputCls}
          >
            <option value="">— Ingen / skriv inn manuelt —</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Felt>
        <Felt label="Bane (manuelt)">
          <input
            type="text"
            value={state.manualVenue}
            onChange={(e) => update("manualVenue", e.target.value)}
            placeholder="F.eks. Larvik GK"
            className={inputCls}
          />
        </Felt>
      </div>
      <Felt label="Beskrivelse (valgfri)">
        <textarea
          value={state.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          placeholder="Intern info, regler, premier, briefing-tid…"
          className={inputCls}
        />
      </Felt>
    </div>
  );
}

/* ---------- Steg 3 — Format ---------- */

function StegFormat({
  state,
  update,
}: {
  state: State;
  update: <K extends keyof State>(k: K, v: State[K]) => void;
}) {
  function toggleTee(t: string) {
    if (state.teeOptions.includes(t)) {
      update(
        "teeOptions",
        state.teeOptions.filter((x) => x !== t),
      );
    } else {
      update("teeOptions", [...state.teeOptions, t]);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <StegHeader
        title="Spillformat"
        sub="Hvordan turneringen avgjøres. Tee og HCP-justering brukes for å bygge startliste senere."
      />

      <Felt label="Konkurranse-format">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => (
            <Pill
              key={f}
              aktiv={state.format === f}
              onClick={() => update("format", f)}
            >
              {FORMAT_LABELS[f]}
            </Pill>
          ))}
        </div>
      </Felt>

      <Felt label="Tee (multi-select)">
        <div className="flex flex-wrap gap-2">
          {TEE_VALG.map((t) => (
            <Pill
              key={t}
              aktiv={state.teeOptions.includes(t)}
              onClick={() => toggleTee(t)}
            >
              {t}
            </Pill>
          ))}
        </div>
      </Felt>

      <Felt label="HCP-justering">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(HCP_LABELS) as Hcp[]).map((h) => (
            <Pill
              key={h}
              aktiv={state.hcpAdjust === h}
              onClick={() => update("hcpAdjust", h)}
            >
              {HCP_LABELS[h]}
            </Pill>
          ))}
        </div>
      </Felt>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4">
        <input
          type="checkbox"
          checked={state.hasCut}
          onChange={(e) => update("hasCut", e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        <span className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            Cut etter runde 2
          </span>
          <span className="text-xs text-muted-foreground">
            Kun de beste spillerne fortsetter til siste runde(r).
          </span>
        </span>
      </label>
    </div>
  );
}

/* ---------- Steg 4 — Påmelding ---------- */

function StegPaamelding({
  state,
  update,
}: {
  state: State;
  update: <K extends keyof State>(k: K, v: State[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <StegHeader
        title="Påmelding"
        sub="Frist, kapasitet og pris. Du kan invitere spillere fra stallen senere."
      />
      <div className="grid gap-5 md:grid-cols-2">
        <Felt label="Påmeldingsfrist">
          <input
            type="date"
            value={state.registrationDeadline}
            onChange={(e) => update("registrationDeadline", e.target.value)}
            className={inputCls}
          />
        </Felt>
        <Felt label="Max deltakere">
          <input
            type="number"
            min={1}
            max={500}
            value={state.maxParticipants}
            onChange={(e) =>
              update(
                "maxParticipants",
                Math.max(1, Number(e.target.value) || 1),
              )
            }
            className={inputCls + " tabular-nums"}
          />
        </Felt>
        <Felt label="Pris per deltaker (NOK)">
          <input
            type="number"
            min={0}
            step={50}
            value={state.feeKr}
            onChange={(e) =>
              update("feeKr", Math.max(0, Number(e.target.value) || 0))
            }
            className={inputCls + " tabular-nums"}
          />
        </Felt>
        <Felt label="Viktighet">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PRIO_LABELS) as Prioritet[]).map((p) => (
              <Pill
                key={p}
                aktiv={state.priority === p}
                onClick={() => update("priority", p)}
              >
                {PRIO_LABELS[p]}
              </Pill>
            ))}
          </div>
        </Felt>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4">
        <input
          type="checkbox"
          checked={state.sendInvitations}
          onChange={(e) => update("sendInvitations", e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        <span className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            Send invitasjon når turneringen opprettes
          </span>
          <span className="text-xs text-muted-foreground">
            Spillere som inviteres senere får automatisk e-post og in-app push.
          </span>
        </span>
      </label>
    </div>
  );
}

/* ---------- Steg 5 — Bekreft ---------- */

function StegBekreft({
  state,
  courses,
  update,
}: {
  state: State;
  courses: Course[];
  update: <K extends keyof State>(k: K, v: State[K]) => void;
}) {
  const venue =
    courses.find((c) => c.id === state.courseId)?.name ||
    state.manualVenue ||
    "—";

  return (
    <div className="flex flex-col gap-6">
      <StegHeader
        title="Bekreft og opprett"
        sub="Sjekk at alt stemmer. Du kan endre detaljer senere fra turnerings-siden."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Sum label="Type" value={state.type === "INTERN" ? "Intern AK" : "Eksternt event"} icon={<Trophy className="h-4 w-4" strokeWidth={ICON_STROKE} />} />
        <Sum label="Navn" value={state.name || "—"} icon={<Flag className="h-4 w-4" strokeWidth={ICON_STROKE} />} />
        <Sum
          label="Dato"
          value={
            state.endDate && state.endDate !== state.startDate
              ? `${formatNoDate(state.startDate)} – ${formatNoDate(state.endDate)}`
              : formatNoDate(state.startDate)
          }
          icon={<Calendar className="h-4 w-4" strokeWidth={ICON_STROKE} />}
        />
        <Sum label="Bane" value={venue} icon={<MapPin className="h-4 w-4" strokeWidth={ICON_STROKE} />} />
        <Sum
          label="Format"
          value={`${FORMAT_LABELS[state.format]} · ${state.rounds} runde${state.rounds === 1 ? "" : "r"}`}
          icon={<Flag className="h-4 w-4" strokeWidth={ICON_STROKE} />}
        />
        <Sum
          label="Tee · HCP"
          value={`${state.teeOptions.join(", ") || "—"} · ${HCP_LABELS[state.hcpAdjust]}`}
        />
        <Sum
          label="Påmeldingsfrist"
          value={formatNoDate(state.registrationDeadline)}
          icon={<Calendar className="h-4 w-4" strokeWidth={ICON_STROKE} />}
        />
        <Sum
          label="Kapasitet · pris"
          value={`${state.maxParticipants} plasser · ${formatKr(state.feeKr)}`}
          icon={<Users className="h-4 w-4" strokeWidth={ICON_STROKE} />}
        />
        <Sum label="Viktighet" value={PRIO_LABELS[state.priority]} />
        <Sum label="Cut" value={state.hasCut ? "Ja, etter runde 2" : "Nei"} />
      </div>

      {state.description && (
        <div className="rounded-xl border border-border bg-secondary/30 p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Beskrivelse
          </div>
          <p className="mt-2 whitespace-pre-line text-sm text-foreground">
            {state.description}
          </p>
        </div>
      )}

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4">
        <input
          type="checkbox"
          checked={state.sendInvitations}
          onChange={(e) => update("sendInvitations", e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        <span className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            Send invitasjon nå
          </span>
          <span className="text-xs text-muted-foreground">
            Inviterte spillere får varsel med en gang turneringen er opprettet.
          </span>
        </span>
      </label>
    </div>
  );
}

/* ---------- Felles UI-deler ---------- */

function StegHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <header className="flex flex-col gap-2">
      <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">{sub}</p>
    </header>
  );
}

function Felt({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}

function Pill({
  aktiv,
  onClick,
  children,
}: {
  aktiv: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktiv}
      className={[
        "inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
        aktiv
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Sum({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {icon && <span aria-hidden className="text-muted-foreground">{icon}</span>}
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

const inputCls =
  "h-10 w-full rounded-md border border-input bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30";
