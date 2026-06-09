"use client";

// CoachHQ — Ny drill-skjema. Speiler felt-settet i rediger-skjemaet, men
// starter blankt og kaller createDrill. Holder seg til de viktigste feltene;
// resten finjusteres på drill-detaljen etter opprettelse.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  PyramidArea,
  LPhase,
  SkillArea,
  NgfKategori,
  SessionEnvironment,
} from "@/generated/prisma/enums";
import { createDrill, type DrillInput } from "../actions";

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
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
];
const ENVS: SessionEnvironment[] = [
  "RANGE",
  "BANE",
  "STUDIO",
  "HJEM",
  "SIMULATOR",
  "GYM",
];

export function DrillCreateForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coachNotes, setCoachNotes] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [kilde, setKilde] = useState("");
  const [pyramidArea, setPyramidArea] = useState<PyramidArea>("TEK");
  const [skillArea, setSkillArea] = useState<SkillArea | "">("");
  const [minKategori, setMinKategori] = useState<NgfKategori | "">("");
  const [maxKategori, setMaxKategori] = useState<NgfKategori | "">("");
  const [lPhases, setLPhases] = useState<LPhase[]>([]);
  const [environment, setEnvironment] = useState<SessionEnvironment[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [morad, setMorad] = useState(false);
  const [durationMin, setDurationMin] = useState("");
  const [intensitetActive, setIntensitetActive] = useState(false);
  const [intensitet, setIntensitet] = useState(5);
  const [defaultSets, setDefaultSets] = useState("");
  const [defaultReps, setDefaultReps] = useState("");
  const [defaultRepsSets, setDefaultRepsSets] = useState("");

  function toggle<T extends string>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  function leggTilTag() {
    const v = tagDraft.trim();
    if (v && !tags.includes(v)) setTags([...tags, v]);
    setTagDraft("");
  }

  function opprett(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 1) {
      setError("Navn er påkrevd.");
      return;
    }
    const numOrNull = (s: string) =>
      s.trim() === "" ? null : Number(s.replace(",", "."));

    const input: DrillInput = {
      name: name.trim(),
      description: description.trim() || null,
      coachNotes: coachNotes.trim() || null,
      videoUrl: videoUrl.trim() || null,
      kilde: kilde.trim() || null,
      pyramidArea,
      lPhase: null,
      skillArea: skillArea || null,
      minKategori: minKategori || null,
      maxKategori: maxKategori || null,
      minHcp: null,
      maxHcp: null,
      environment,
      utstyr: [],
      intensitet: intensitetActive ? intensitet : null,
      lPhases,
      morad,
      prerequisites: [],
      tags,
      defaultRepsSets: defaultRepsSets.trim() || null,
      csMin: null,
      csMax: null,
      durationMin: numOrNull(durationMin) as number | null,
      defaultSets: numOrNull(defaultSets) as number | null,
      defaultReps: numOrNull(defaultReps) as number | null,
      csTargetByKategori: null,
    };

    startTransition(async () => {
      const res = await createDrill(input);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      if (res.success && res.data) {
        router.push(`/admin/drills/${res.data.drillId}`);
      }
    });
  }

  return (
    <form onSubmit={opprett} className="space-y-6">
      <Section title="Identifikasjon">
        <Field label="Navn" required>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="f.eks. Stige-putting 1-3 m"
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
            placeholder="Hvordan du forklarer drillen til spilleren."
            className={textareaCls}
          />
        </Field>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
              className={inputCls}
            />
          </Field>
        </div>
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

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field label="Min NGF-kategori">
            <select
              value={minKategori}
              onChange={(e) => setMinKategori(e.target.value as NgfKategori | "")}
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
              onChange={(e) => setMaxKategori(e.target.value as NgfKategori | "")}
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
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 font-mono text-[11px]"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Fjern"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </Field>
      </Section>

      <Section title="Intensitet og varighet">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Field label="Varighet (min)">
            <input
              type="number"
              min="1"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              className={inputCls}
            />
          </Field>
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
            placeholder="3 sett · 10 reps, eller 'gjennomfør i 12 min'"
            className={inputCls}
          />
        </Field>

        <Field
          label={`Intensitet ${intensitetActive ? `(${intensitet}/10)` : "(ikke satt)"}`}
        >
          <div className="flex items-center gap-2">
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

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t border-border bg-background/95 p-4 backdrop-blur sm:mx-0 sm:flex-row sm:items-center sm:justify-end sm:rounded-md sm:border">
        <button
          type="button"
          onClick={() => router.push("/admin/drills")}
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
          {pending ? "Oppretter…" : "Opprett drill"}
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
      className={`h-9 rounded-full border px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

const inputCls =
  "w-full h-11 rounded-md border border-input bg-background px-4 text-base outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30 sm:h-9 sm:text-sm";

const textareaCls =
  "w-full rounded-md border border-input bg-background px-4 py-2 text-base outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30 sm:text-sm";
