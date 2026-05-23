"use client";

// CoachHQ — Drill edit-skjema.
// Stort form med alle 27 felt på ExerciseDefinition.
// Mobile: stack alt vertikalt. Desktop: 2-kol-grid for kompakte felt.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  PyramidArea,
  LPhase,
  SkillArea,
  NgfKategori,
  SessionEnvironment,
} from "@/generated/prisma/enums";
import { updateDrill, type DrillInput } from "../../actions";

type DrillRecord = {
  id: string;
  name: string;
  description: string | null;
  videoUrl: string | null;
  pyramidArea: PyramidArea;
  lPhase: LPhase | null;
  defaultRepsSets: string | null;
  csMin: number | null;
  csMax: number | null;
  durationMin: number | null;
  skillArea: SkillArea | null;
  minKategori: NgfKategori | null;
  maxKategori: NgfKategori | null;
  minHcp: number | null;
  maxHcp: number | null;
  environment: SessionEnvironment[];
  utstyr: string[];
  intensitet: number | null;
  lPhases: LPhase[];
  morad: boolean;
  prerequisites: string[];
  tags: string[];
  coachNotes: string | null;
  kilde: string | null;
  defaultSets: number | null;
  defaultReps: number | null;
  csTargetByKategori: unknown;
};

type Props = {
  drill: DrillRecord;
  andreDrills: { id: string; name: string }[];
};

const DISIPLINER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const L_PHASES: LPhase[] = ["GRUNN", "SPESIAL", "TURNERING"];
const SKILLS: SkillArea[] = [
  "TEE_TOTAL",
  "TILNAERMING",
  "AROUND_GREEN",
  "PUTTING",
  "SPILL",
];
const NGF: NgfKategori[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
];
const ENVS: SessionEnvironment[] = [
  "RANGE",
  "BANE",
  "STUDIO",
  "HJEM",
  "SIMULATOR",
  "GYM",
];

function parseCsTarget(raw: unknown): Partial<Record<NgfKategori, number>> {
  if (!raw || typeof raw !== "object") return {};
  const out: Partial<Record<NgfKategori, number>> = {};
  for (const k of NGF) {
    const v = (raw as Record<string, unknown>)[k];
    if (typeof v === "number") out[k] = v;
  }
  return out;
}

export function DrillEditForm({ drill, andreDrills }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // State for hvert felt
  const [name, setName] = useState(drill.name);
  const [description, setDescription] = useState(drill.description ?? "");
  const [videoUrl, setVideoUrl] = useState(drill.videoUrl ?? "");
  const [pyramidArea, setPyramidArea] = useState<PyramidArea>(drill.pyramidArea);
  const [lPhase, setLPhase] = useState<LPhase | "">(drill.lPhase ?? "");
  const [defaultRepsSets, setDefaultRepsSets] = useState(
    drill.defaultRepsSets ?? "",
  );
  const [csMin, setCsMin] = useState<string>(
    drill.csMin !== null ? String(drill.csMin) : "",
  );
  const [csMax, setCsMax] = useState<string>(
    drill.csMax !== null ? String(drill.csMax) : "",
  );
  const [durationMin, setDurationMin] = useState<string>(
    drill.durationMin !== null ? String(drill.durationMin) : "",
  );
  const [skillArea, setSkillArea] = useState<SkillArea | "">(
    drill.skillArea ?? "",
  );
  const [minKategori, setMinKategori] = useState<NgfKategori | "">(
    drill.minKategori ?? "",
  );
  const [maxKategori, setMaxKategori] = useState<NgfKategori | "">(
    drill.maxKategori ?? "",
  );
  const [minHcp, setMinHcp] = useState<string>(
    drill.minHcp !== null ? String(drill.minHcp) : "",
  );
  const [maxHcp, setMaxHcp] = useState<string>(
    drill.maxHcp !== null ? String(drill.maxHcp) : "",
  );
  const [environment, setEnvironment] = useState<SessionEnvironment[]>(
    drill.environment,
  );
  const [utstyr, setUtstyr] = useState<string[]>(drill.utstyr);
  const [utstyrDraft, setUtstyrDraft] = useState("");
  const [intensitet, setIntensitet] = useState<number>(drill.intensitet ?? 5);
  const [intensitetActive, setIntensitetActive] = useState(
    drill.intensitet !== null,
  );
  const [lPhases, setLPhases] = useState<LPhase[]>(drill.lPhases);
  const [morad, setMorad] = useState(drill.morad);
  const [prerequisites, setPrerequisites] = useState<string[]>(
    drill.prerequisites,
  );
  const [tags, setTags] = useState<string[]>(drill.tags);
  const [tagDraft, setTagDraft] = useState("");
  const [coachNotes, setCoachNotes] = useState(drill.coachNotes ?? "");
  const [kilde, setKilde] = useState(drill.kilde ?? "");
  const [defaultSets, setDefaultSets] = useState<string>(
    drill.defaultSets !== null ? String(drill.defaultSets) : "",
  );
  const [defaultReps, setDefaultReps] = useState<string>(
    drill.defaultReps !== null ? String(drill.defaultReps) : "",
  );
  const [csTarget, setCsTarget] = useState<
    Partial<Record<NgfKategori, number>>
  >(parseCsTarget(drill.csTargetByKategori));

  function toggle<T extends string>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  function leggTilTag() {
    const v = tagDraft.trim();
    if (v && !tags.includes(v)) setTags([...tags, v]);
    setTagDraft("");
  }

  function leggTilUtstyr() {
    const v = utstyrDraft.trim();
    if (v && !utstyr.includes(v)) setUtstyr([...utstyr, v]);
    setUtstyrDraft("");
  }

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const numOrNull = (s: string) =>
      s.trim() === "" ? null : Number(s.replace(",", "."));

    const csTargetClean: Partial<Record<NgfKategori, number>> = {};
    for (const k of NGF) {
      const v = csTarget[k];
      if (typeof v === "number" && !Number.isNaN(v)) csTargetClean[k] = v;
    }

    const input: DrillInput = {
      name: name.trim(),
      description: description.trim() || null,
      videoUrl: videoUrl.trim() || null,
      pyramidArea,
      lPhase: lPhase || null,
      defaultRepsSets: defaultRepsSets.trim() || null,
      csMin: numOrNull(csMin) as number | null,
      csMax: numOrNull(csMax) as number | null,
      durationMin: numOrNull(durationMin) as number | null,
      skillArea: skillArea || null,
      minKategori: minKategori || null,
      maxKategori: maxKategori || null,
      minHcp: numOrNull(minHcp),
      maxHcp: numOrNull(maxHcp),
      environment,
      utstyr,
      intensitet: intensitetActive ? intensitet : null,
      lPhases,
      morad,
      prerequisites,
      tags,
      coachNotes: coachNotes.trim() || null,
      kilde: kilde.trim() || null,
      defaultSets: numOrNull(defaultSets) as number | null,
      defaultReps: numOrNull(defaultReps) as number | null,
      csTargetByKategori:
        Object.keys(csTargetClean).length > 0
          ? (csTargetClean as Record<NgfKategori, number>)
          : null,
    };

    startTransition(async () => {
      const res = await updateDrill(drill.id, input);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      router.push(`/admin/drills/${drill.id}`);
    });
  }

  return (
    <form onSubmit={lagre} className="space-y-6">
      <Section title="Identifikasjon">
        <Field label="Navn" required>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Beskrivelse">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={textareaCls}
          />
        </Field>
        <Field label="Coach-notater">
          <textarea
            value={coachNotes}
            onChange={(e) => setCoachNotes(e.target.value)}
            rows={3}
            className={textareaCls}
            placeholder="Hvordan du forklarer drillen til spilleren."
          />
        </Field>
        <Field label="Video-URL">
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://"
            className={inputCls}
          />
        </Field>
        <Field label="Kilde">
          <input
            type="text"
            value={kilde}
            onChange={(e) => setKilde(e.target.value)}
            placeholder="f.eks. ak-second-brain:morad-drill-bibliotek"
            className={inputCls}
          />
        </Field>
      </Section>

      <Section title="Klassifisering">
        <Field label="Disiplin" required>
          <div className="flex flex-wrap gap-1.5">
            {DISIPLINER.map((d) => (
              <Pill
                key={d}
                active={pyramidArea === d}
                onClick={() => setPyramidArea(d)}
              >
                {d}
              </Pill>
            ))}
          </div>
        </Field>

        <Field label="Skill area">
          <select
            value={skillArea}
            onChange={(e) => setSkillArea(e.target.value as SkillArea | "")}
            className={inputCls}
          >
            <option value="">— Ingen —</option>
            {SKILLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Min NGF-kategori">
            <select
              value={minKategori}
              onChange={(e) =>
                setMinKategori(e.target.value as NgfKategori | "")
              }
              className={inputCls}
            >
              <option value="">—</option>
              {NGF.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Max NGF-kategori">
            <select
              value={maxKategori}
              onChange={(e) =>
                setMaxKategori(e.target.value as NgfKategori | "")
              }
              className={inputCls}
            >
              <option value="">—</option>
              {NGF.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Min HCP">
            <input
              type="number"
              step="0.1"
              value={minHcp}
              onChange={(e) => setMinHcp(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Max HCP">
            <input
              type="number"
              step="0.1"
              value={maxHcp}
              onChange={(e) => setMaxHcp(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="L-faser (multi)">
          <div className="flex flex-wrap gap-1.5">
            {L_PHASES.map((p) => (
              <Pill
                key={p}
                active={lPhases.includes(p)}
                onClick={() => setLPhases(toggle(lPhases, p))}
              >
                {p}
              </Pill>
            ))}
          </div>
        </Field>

        <Field label="L-fase (primary — legacy)">
          <select
            value={lPhase}
            onChange={(e) => setLPhase(e.target.value as LPhase | "")}
            className={inputCls}
          >
            <option value="">—</option>
            {L_PHASES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={morad}
            onChange={(e) => setMorad(e.target.checked)}
            className="accent-primary"
          />
          <span>MORAD — kanonisk drill</span>
        </label>
      </Section>

      <Section title="Kontekst">
        <Field label="Environment (multi)">
          <div className="flex flex-wrap gap-1.5">
            {ENVS.map((e) => (
              <Pill
                key={e}
                active={environment.includes(e)}
                onClick={() => setEnvironment(toggle(environment, e))}
              >
                {e}
              </Pill>
            ))}
          </div>
        </Field>

        <Field label="Utstyr">
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={utstyrDraft}
                onChange={(e) => setUtstyrDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    leggTilUtstyr();
                  }
                }}
                placeholder="legg til, trykk Enter"
                className={`${inputCls} flex-1`}
              />
              <button
                type="button"
                onClick={leggTilUtstyr}
                className="h-11 rounded-md border border-input bg-card px-4 text-sm font-medium sm:h-9"
              >
                Legg til
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {utstyr.map((u) => (
                <Chip
                  key={u}
                  onRemove={() =>
                    setUtstyr(utstyr.filter((x) => x !== u))
                  }
                >
                  {u}
                </Chip>
              ))}
            </div>
          </div>
        </Field>

        <Field label="Tags">
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    leggTilTag();
                  }
                }}
                placeholder="legg til, trykk Enter"
                className={`${inputCls} flex-1`}
              />
              <button
                type="button"
                onClick={leggTilTag}
                className="h-11 rounded-md border border-input bg-card px-4 text-sm font-medium sm:h-9"
              >
                Legg til
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <Chip
                  key={t}
                  onRemove={() => setTags(tags.filter((x) => x !== t))}
                >
                  #{t}
                </Chip>
              ))}
            </div>
          </div>
        </Field>

        <Field label="Prerequisites (multi)">
          <div className="grid max-h-48 grid-cols-1 gap-1 overflow-y-auto rounded-md border border-input bg-background p-2 sm:grid-cols-2">
            {andreDrills.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ingen andre drills.
              </p>
            ) : (
              andreDrills.map((d) => (
                <label
                  key={d.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-secondary"
                >
                  <input
                    type="checkbox"
                    checked={prerequisites.includes(d.id)}
                    onChange={() =>
                      setPrerequisites(toggle(prerequisites, d.id))
                    }
                    className="accent-primary"
                  />
                  <span className="truncate">{d.name}</span>
                </label>
              ))
            )}
          </div>
        </Field>
      </Section>

      <Section title="Intensitet og varighet">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Varighet (min)">
            <input
              type="number"
              min="1"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="csMin">
            <input
              type="number"
              min="0"
              max="100"
              value={csMin}
              onChange={(e) => setCsMin(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="csMax">
            <input
              type="number"
              min="0"
              max="100"
              value={csMax}
              onChange={(e) => setCsMax(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label={`Intensitet ${intensitetActive ? `(${intensitet}/10)` : "(ikke satt)"}`}>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={intensitetActive}
                onChange={(e) => setIntensitetActive(e.target.checked)}
                className="accent-primary"
              />
              <span>Aktiv</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={intensitet}
              onChange={(e) => setIntensitet(Number(e.target.value))}
              disabled={!intensitetActive}
              className="flex-1 accent-primary disabled:opacity-50"
            />
          </div>
        </Field>
      </Section>

      <Section title="Default sets/reps">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Default sets">
            <input
              type="number"
              min="1"
              value={defaultSets}
              onChange={(e) => setDefaultSets(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Default reps">
            <input
              type="number"
              min="1"
              value={defaultReps}
              onChange={(e) => setDefaultReps(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="repsSets-tekst (fri-form)">
          <input
            type="text"
            value={defaultRepsSets}
            onChange={(e) => setDefaultRepsSets(e.target.value)}
            placeholder="3 sets · 10 reps, eller 'gjennomfoer i 12 min'"
            className={inputCls}
          />
        </Field>

        <Field label="csTarget per NGF-kategori">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {NGF.map((k) => (
              <div key={k} className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  {k}
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={csTarget[k] ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCsTarget((prev) => {
                      const next = { ...prev };
                      if (v === "") delete next[k];
                      else next[k] = Number(v);
                      return next;
                    });
                  }}
                  className="h-11 rounded-md border border-input bg-background px-2 text-base tabular-nums outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 sm:h-9 sm:text-sm"
                />
              </div>
            ))}
          </div>
        </Field>
      </Section>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t border-border bg-background/95 p-4 backdrop-blur sm:mx-0 sm:flex-row sm:items-center sm:justify-end sm:rounded-md sm:border">
        <button
          type="button"
          onClick={() => router.push(`/admin/drills/${drill.id}`)}
          disabled={pending}
          className="h-11 rounded-md border border-input bg-card px-4 text-sm font-medium hover:border-border disabled:opacity-60 sm:h-9"
        >
          Avbryt
        </button>
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 sm:h-9"
        >
          {pending ? "Lagrer…" : "Lagre endringer"}
        </button>
      </div>
    </form>
  );
}

// ----------------- Subkomponenter -----------------

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-full border px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Chip({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 font-mono text-[11px]">
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive"
        aria-label="Fjern"
      >
        ×
      </button>
    </span>
  );
}

const inputCls =
  "w-full h-11 rounded-md border border-input bg-background px-3 text-base outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 sm:h-9 sm:text-sm";

const textareaCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 sm:text-sm";
