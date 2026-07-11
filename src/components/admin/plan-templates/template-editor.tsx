"use client";

/**
 * Enkel session-editor for plan-templates.
 *
 * Bevisst valg: ingen drag-drop. I stedet en strukturert formular-tilnærming
 * der hver økt vedlikeholdes via en pop-over-modal. Dette er mer robust på
 * touch-enheter og enklere å holde fri for `any` i streng TypeScript.
 *
 * 3-pane på desktop:
 * - Venstre 220px: drill-bibliotek (info-only, brukes som referanse i modalen)
 * - Midt: ukentlig grid med [+] for å legge til økt
 * - Høyre 280px: innstillinger
 *
 * Mobile: stacker vertikalt.
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type {
  LPhase,
  NgfKategori,
  PyramidArea,
  SessionEnvironment,
  SkillArea,
} from "@/generated/prisma/client";
import {
  addTemplateSession,
  deleteTemplateSession,
  updateTemplate,
  updateTemplateSession,
  type SessionInput,
  type TemplateUpdateInput,
} from "@/app/admin/(legacy)/plan-templates/actions";
import {
  DAG_LABEL,
  ENV_LABEL,
  FASE_ALLE,
  FASE_LABEL,
  KATEGORI_ALLE,
  KATEGORI_LABEL,
  PYR_COLOR,
  PYR_LABEL,
  SKILL_LABEL,
  type DisciplinFordeling,
  type DrillEntry,
} from "./shared";
import { VolumSammendrag, UkeVolumChip } from "./volum-linje";
import { beregnTemplateVolum } from "@/lib/plan-templates/beregn-volum";

export type DrillOption = {
  id: string;
  name: string;
  pyramidArea: PyramidArea;
  skillArea: SkillArea | null;
};

export type EditorSession = {
  id: string;
  ukeNr: number;
  dagNr: number;
  title: string;
  varighetMin: number;
  pyramidArea: PyramidArea;
  skillArea: SkillArea | null;
  environment: SessionEnvironment;
  drills: DrillEntry[];
  focus: string | null;
  notes: string | null;
};

export type EditorTemplate = {
  id: string;
  name: string;
  description: string | null;
  kategori: NgfKategori;
  lPhase: LPhase;
  varighetUker: number;
  ukentligOktAntall: number;
  fordeling: DisciplinFordeling;
  minAlder: number | null;
  maxAlder: number | null;
  approved: boolean;
  sessions: EditorSession[];
};

const PYR_ALLE: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const SKILL_ALLE: SkillArea[] = [
  "TEE_TOTAL",
  "TILNAERMING",
  "AROUND_GREEN",
  "PUTTING",
  "SPILL",
];
const ENV_ALLE: SessionEnvironment[] = [
  "RANGE",
  "BANE",
  "STUDIO",
  "HJEM",
  "SIMULATOR",
  "GYM",
];

type ModalState =
  | { kind: "closed" }
  | { kind: "create"; ukeNr: number; dagNr: number }
  | { kind: "edit"; session: EditorSession };

export function TemplateEditor({
  template,
  drillOptions,
}: {
  template: EditorTemplate;
  drillOptions: DrillOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Settings-state (kan endres lokalt før lagring)
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description ?? "");
  const [kategori, setKategori] = useState<NgfKategori>(template.kategori);
  const [lPhase, setLPhase] = useState<LPhase>(template.lPhase);
  const [varighetUker, setVarighetUker] = useState(template.varighetUker);
  const [ukentligOktAntall, setUkentligOktAntall] = useState(
    template.ukentligOktAntall
  );
  const [fordeling, setFordeling] = useState<DisciplinFordeling>(
    template.fordeling
  );
  const [minAlder, setMinAlder] = useState<string>(
    template.minAlder?.toString() ?? ""
  );
  const [maxAlder, setMaxAlder] = useState<string>(
    template.maxAlder?.toString() ?? ""
  );
  const [approved, setApproved] = useState(template.approved);

  const [modal, setModal] = useState<ModalState>({ kind: "closed" });
  const [drillSok, setDrillSok] = useState("");

  const fordelingSum = useMemo(() => {
    return Math.round(
      (fordeling.FYS +
        fordeling.TEK +
        fordeling.SLAG +
        fordeling.SPILL +
        fordeling.TURN) *
        100
    );
  }, [fordeling]);

  const sessions = template.sessions;

  const volum = useMemo(
    () => beregnTemplateVolum(sessions, varighetUker, fordeling),
    [sessions, varighetUker, fordeling],
  );

  const filtererteDrills = useMemo(() => {
    if (!drillSok.trim()) return drillOptions;
    const q = drillSok.toLowerCase();
    return drillOptions.filter((d) => d.name.toLowerCase().includes(q));
  }, [drillSok, drillOptions]);

  function onSaveSettings() {
    if (fordelingSum !== 100) {
      alert(
        `Discipline-fordelingen må summere til 100% (er nå ${fordelingSum}%).`
      );
      return;
    }
    const input: TemplateUpdateInput = {
      name,
      description: description || null,
      kategori,
      lPhase,
      varighetUker,
      ukentligOktAntall,
      disciplinFordeling: fordeling,
      minAlder: minAlder ? parseInt(minAlder, 10) : null,
      maxAlder: maxAlder ? parseInt(maxAlder, 10) : null,
      approved,
    };
    startTransition(async () => {
      const res = await updateTemplate(template.id, input);
      if (res.ok) {
        router.refresh();
        alert("Lagret.");
      } else {
        alert(`Kunne ikke lagre: ${res.error}`);
      }
    });
  }

  function onDeleteSession(sessionId: string) {
    if (!confirm("Slette denne økten?")) return;
    startTransition(async () => {
      const res = await deleteTemplateSession(sessionId);
      if (res.ok) {
        router.refresh();
      } else {
        alert(res.error);
      }
    });
  }

  function findSession(ukeNr: number, dagNr: number): EditorSession | undefined {
    return sessions.find((s) => s.ukeNr === ukeNr && s.dagNr === dagNr);
  }

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSaveSettings}
          disabled={isPending}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" strokeWidth={1.75} />
          Lagre innstillinger
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr_280px]">
        {/* Venstre: drill-bibliotek */}
        <aside className="order-2 rounded-2xl border border-border bg-card p-4 lg:order-1">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Drill-bibliotek ({drillOptions.length})
          </div>
          <div className="relative mb-2">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
            />
            <input
              type="text"
              value={drillSok}
              onChange={(e) => setDrillSok(e.target.value)}
              placeholder="Søk drill"
              aria-label="Søk drill"
              className="h-9 w-full rounded-md border border-input bg-card pl-8 pr-4 text-xs focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            />
          </div>
          <p className="mb-2 text-[10px] text-muted-foreground">
            Bibliotek-referanse. Drills legges til på en økt via «Legg til» i grid-en.
          </p>
          <ul className="max-h-[420px] space-y-1 overflow-y-auto pr-1">
            {filtererteDrills.slice(0, 50).map((d) => (
              <li
                key={d.id}
                className="rounded-md border border-border/60 bg-background/30 px-2 py-1.5 text-[11px]"
              >
                <div
                  className="mb-0.5 inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: PYR_COLOR[d.pyramidArea] }}
                />{" "}
                {d.name}
              </li>
            ))}
            {filtererteDrills.length > 50 && (
              <li className="text-[10px] text-muted-foreground">
                +{filtererteDrills.length - 50} flere. Avgrens søket.
              </li>
            )}
          </ul>
        </aside>

        {/* Midt: grid */}
        <section className="order-1 rounded-2xl border border-border bg-card p-4 lg:order-2 lg:p-6">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Økt-grid
            </h2>
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              {sessions.length} av {varighetUker * ukentligOktAntall} planlagte
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Dag-header */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 pb-1">
                <div />
                {DAG_LABEL.map((d) => (
                  <div
                    key={d}
                    className="rounded-md bg-secondary px-2 py-1 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-secondary-foreground"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {Array.from({ length: varighetUker }, (_, i) => i + 1).map((uke) => (
                <div
                  key={uke}
                  className="mt-1 grid grid-cols-[60px_repeat(7,1fr)] gap-1"
                >
                  <div className="flex flex-col items-center justify-center rounded-md bg-secondary/60 font-mono text-xs font-semibold">
                    <span>{uke}</span>
                    <UkeVolumChip minutter={volum.minPerUke[uke - 1] ?? 0} />
                  </div>
                  {[1, 2, 3, 4, 5, 6, 7].map((dag) => {
                    const s = findSession(uke, dag);
                    return (
                      <div key={dag} className="min-h-[64px]">
                        {s ? (
                          <button
                            type="button"
                            onClick={() =>
                              setModal({ kind: "edit", session: s })
                            }
                            className="group flex h-full w-full flex-col gap-1 rounded-md border-l-[3px] bg-card p-1.5 text-left transition hover:bg-secondary"
                            style={{
                              borderLeftColor: PYR_COLOR[s.pyramidArea],
                            }}
                          >
                            <div className="line-clamp-2 text-[11px] font-semibold leading-tight">
                              {s.title}
                            </div>
                            <div className="mt-auto font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                              {s.varighetMin}m · {s.drills.length}d
                            </div>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setModal({ kind: "create", ukeNr: uke, dagNr: dag })
                            }
                            className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-border/60 text-muted-foreground/60 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                          >
                            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Høyre: innstillinger */}
        <aside className="order-3 rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Innstillinger
          </div>
          <div className="flex flex-col gap-2">
            <FieldText label="Navn" value={name} onChange={setName} />
            <FieldTextarea
              label="Beskrivelse"
              value={description}
              onChange={setDescription}
              rows={3}
            />
            <FieldSelect
              label="Kategori"
              value={kategori}
              onChange={(v) => setKategori(v as NgfKategori)}
              options={KATEGORI_ALLE.map((k) => ({
                value: k,
                label: KATEGORI_LABEL[k],
              }))}
            />
            <FieldSelect
              label="Fase"
              value={lPhase}
              onChange={(v) => setLPhase(v as LPhase)}
              options={FASE_ALLE.map((f) => ({ value: f, label: FASE_LABEL[f] }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <FieldNumber
                label="Varighet (uker)"
                value={varighetUker}
                onChange={setVarighetUker}
                min={1}
                max={52}
              />
              <FieldNumber
                label="Økt/uke"
                value={ukentligOktAntall}
                onChange={setUkentligOktAntall}
                min={1}
                max={14}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldText
                label="Min alder"
                value={minAlder}
                onChange={setMinAlder}
                placeholder="—"
              />
              <FieldText
                label="Maks alder"
                value={maxAlder}
                onChange={setMaxAlder}
                placeholder="—"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                <span>Discipline-fordeling</span>
                <span
                  className={
                    fordelingSum === 100 ? "text-primary" : "text-destructive"
                  }
                >
                  {fordelingSum}%
                </span>
              </div>
              <div className="space-y-2">
                {PYR_ALLE.map((p) => (
                  <div key={p} className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ background: PYR_COLOR[p] }}
                    />
                    <span className="w-12 text-[11px]">{PYR_LABEL[p]}</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(fordeling[p] * 100)}
                      onChange={(e) =>
                        setFordeling({
                          ...fordeling,
                          [p]: parseInt(e.target.value, 10) / 100,
                        })
                      }
                      className="flex-1 accent-primary"
                    />
                    <span className="w-10 text-right font-mono text-[10px]">
                      {Math.round(fordeling[p] * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <VolumSammendrag
              sessions={sessions}
              varighetUker={varighetUker}
              fordeling={fordeling}
              fordelingSum={fordelingSum}
            />

            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={approved}
                onChange={(e) => setApproved(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              Godkjent (tilgjengelig for AI)
            </label>
          </div>
        </aside>
      </div>

      {modal.kind !== "closed" && (
        <SessionEditModal
          state={modal}
          drillOptions={drillOptions}
          templateId={template.id}
          maxUke={varighetUker}
          isPending={isPending}
          onClose={() => setModal({ kind: "closed" })}
          onSave={(input, sessionId) =>
            startTransition(async () => {
              const res = sessionId
                ? await updateTemplateSession(sessionId, input)
                : await addTemplateSession(template.id, input);
              if (res.ok) {
                setModal({ kind: "closed" });
                router.refresh();
              } else {
                alert(res.error);
              }
            })
          }
          onDelete={
            modal.kind === "edit"
              ? () => {
                  const sid = modal.session.id;
                  setModal({ kind: "closed" });
                  onDeleteSession(sid);
                }
              : undefined
          }
        />
      )}
    </>
  );
}

// --- Form-felt ---------------------------------------------------------------

function FieldText({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 rounded-md border border-input bg-card px-4 text-xs focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      />
    </label>
  );
}

function FieldTextarea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </span>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-input bg-card px-4 py-2 text-xs focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      />
    </label>
  );
}

function FieldNumber({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(parseInt(e.target.value || "0", 10))}
        className="h-9 rounded-md border border-input bg-card px-4 text-xs focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      />
    </label>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-input bg-card px-2 text-xs focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// --- Session-modal -----------------------------------------------------------

function SessionEditModal({
  state,
  drillOptions,
  maxUke,
  isPending,
  onClose,
  onSave,
  onDelete,
}: {
  state: ModalState;
  drillOptions: DrillOption[];
  templateId: string;
  maxUke: number;
  isPending: boolean;
  onClose: () => void;
  onSave: (input: SessionInput, sessionId?: string) => void;
  onDelete?: () => void;
}) {
  const initial: EditorSession =
    state.kind === "edit"
      ? state.session
      : {
          id: "",
          ukeNr: state.kind === "create" ? state.ukeNr : 1,
          dagNr: state.kind === "create" ? state.dagNr : 1,
          title: "",
          varighetMin: 60,
          pyramidArea: "TEK",
          skillArea: null,
          environment: "RANGE",
          drills: [],
          focus: null,
          notes: null,
        };

  const [title, setTitle] = useState(initial.title);
  const [varighetMin, setVarighetMin] = useState(initial.varighetMin);
  const [pyramidArea, setPyramidArea] = useState<PyramidArea>(initial.pyramidArea);
  const [skillArea, setSkillArea] = useState<SkillArea | "">(
    initial.skillArea ?? ""
  );
  const [environment, setEnvironment] = useState<SessionEnvironment>(
    initial.environment
  );
  const [ukeNr, setUkeNr] = useState(initial.ukeNr);
  const [dagNr, setDagNr] = useState(initial.dagNr);
  const [focus, setFocus] = useState(initial.focus ?? "");
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [drills, setDrills] = useState<DrillEntry[]>(initial.drills);
  const [drillSok, setDrillSok] = useState("");

  const filtererteDrills = useMemo(() => {
    if (!drillSok.trim()) return drillOptions;
    const q = drillSok.toLowerCase();
    return drillOptions.filter((d) => d.name.toLowerCase().includes(q));
  }, [drillSok, drillOptions]);

  const navnPerId = useMemo(
    () => new Map(drillOptions.map((d) => [d.id, d.name])),
    [drillOptions]
  );

  function addDrill(exerciseId: string) {
    if (drills.some((d) => d.exerciseId === exerciseId)) return;
    setDrills([...drills, { exerciseId, sets: 3, reps: 10 }]);
  }

  function removeDrill(idx: number) {
    setDrills(drills.filter((_, i) => i !== idx));
  }

  function updateDrill(idx: number, patch: Partial<DrillEntry>) {
    setDrills(
      drills.map((d, i) =>
        i === idx ? { ...d, ...patch } : d
      )
    );
  }

  function submit() {
    if (!title.trim()) {
      alert("Tittel er påkrevd.");
      return;
    }
    const input: SessionInput = {
      ukeNr,
      dagNr,
      title: title.trim(),
      varighetMin,
      pyramidArea,
      skillArea: skillArea || null,
      environment,
      drillsJson: drills,
      focus: focus.trim() || null,
      notes: notes.trim() || null,
    };
    onSave(input, state.kind === "edit" ? state.session.id : undefined);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-semibold tracking-tight">
            {state.kind === "edit" ? "Rediger økt" : "Ny økt"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-secondary"
            aria-label="Lukk"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <FieldNumber
            label="Uke"
            value={ukeNr}
            onChange={setUkeNr}
            min={1}
            max={maxUke}
          />
          <FieldSelect
            label="Dag"
            value={dagNr.toString()}
            onChange={(v) => setDagNr(parseInt(v, 10))}
            options={[1, 2, 3, 4, 5, 6, 7].map((d) => ({
              value: d.toString(),
              label: DAG_LABEL[d - 1],
            }))}
          />
        </div>

        <div className="mt-2">
          <FieldText label="Tittel" value={title} onChange={setTitle} />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <FieldNumber
            label="Varighet (min)"
            value={varighetMin}
            onChange={setVarighetMin}
            min={5}
            max={480}
          />
          <FieldSelect
            label="Pyramide-område"
            value={pyramidArea}
            onChange={(v) => setPyramidArea(v as PyramidArea)}
            options={PYR_ALLE.map((p) => ({ value: p, label: PYR_LABEL[p] }))}
          />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <FieldSelect
            label="Skill-area"
            value={skillArea}
            onChange={(v) => setSkillArea(v as SkillArea | "")}
            options={[
              { value: "", label: "—" },
              ...SKILL_ALLE.map((s) => ({ value: s, label: SKILL_LABEL[s] })),
            ]}
          />
          <FieldSelect
            label="Miljø"
            value={environment}
            onChange={(v) => setEnvironment(v as SessionEnvironment)}
            options={ENV_ALLE.map((e) => ({ value: e, label: ENV_LABEL[e] }))}
          />
        </div>

        <div className="mt-2">
          <FieldText label="Fokus" value={focus} onChange={setFocus} />
        </div>

        <div className="mt-2">
          <FieldTextarea
            label="Notater"
            value={notes}
            onChange={setNotes}
            rows={2}
          />
        </div>

        {/* Drills */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            <span>Drills ({drills.length})</span>
          </div>
          <ul className="space-y-2">
            {drills.map((d, i) => (
              <li
                key={`${d.exerciseId}-${i}`}
                className="rounded-md border border-border bg-background/40 p-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 text-xs font-medium">
                    {navnPerId.get(d.exerciseId) ?? d.exerciseId}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDrill(i)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                    aria-label="Fjern drill"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
                <div className="mt-1 grid grid-cols-3 gap-1.5">
                  <input
                    type="number"
                    placeholder="Sets"
                    value={d.sets ?? ""}
                    onChange={(e) =>
                      updateDrill(i, {
                        sets: e.target.value
                          ? parseInt(e.target.value, 10)
                          : undefined,
                      })
                    }
                    className="h-8 rounded-md border border-input bg-card px-2 text-[11px]"
                  />
                  <input
                    type="number"
                    placeholder="Reps"
                    value={d.reps ?? ""}
                    onChange={(e) =>
                      updateDrill(i, {
                        reps: e.target.value
                          ? parseInt(e.target.value, 10)
                          : undefined,
                      })
                    }
                    className="h-8 rounded-md border border-input bg-card px-2 text-[11px]"
                  />
                  <input
                    type="number"
                    placeholder="CS-target"
                    value={d.csTarget ?? ""}
                    onChange={(e) =>
                      updateDrill(i, {
                        csTarget: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    className="h-8 rounded-md border border-input bg-card px-2 text-[11px]"
                  />
                </div>
              </li>
            ))}
            {drills.length === 0 && (
              <li className="text-xs text-muted-foreground">
                Ingen drills lagt til ennå.
              </li>
            )}
          </ul>

          {/* Drill-picker */}
          <div className="mt-2 rounded-md border border-border bg-background/30 p-2">
            <div className="relative mb-2">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
              />
              <input
                type="text"
                value={drillSok}
                onChange={(e) => setDrillSok(e.target.value)}
                placeholder="Søk drill å legge til"
                aria-label="Søk drill å legge til"
                className="h-9 w-full rounded-md border border-input bg-card pl-8 pr-4 text-xs"
              />
            </div>
            <ul className="max-h-40 space-y-1 overflow-y-auto">
              {filtererteDrills.slice(0, 30).map((d) => {
                const valgt = drills.some((dr) => dr.exerciseId === d.id);
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => addDrill(d.id)}
                      disabled={valgt}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] hover:bg-secondary disabled:opacity-50"
                    >
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: PYR_COLOR[d.pyramidArea] }}
                      />
                      <span className="flex-1 truncate">{d.name}</span>
                      {valgt && (
                        <Check
                          className="h-3 w-3 text-primary"
                          strokeWidth={1.75}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={isPending}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-destructive/30 px-4 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Slett økt
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center rounded-full border border-border bg-card px-4 text-xs font-medium hover:bg-secondary"
            >
              Avbryt
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={isPending}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" strokeWidth={1.75} />
              {state.kind === "edit" ? "Lagre endring" : "Opprett økt"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
