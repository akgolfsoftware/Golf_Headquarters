"use client";

/**
 * Oppgave-modal — implementering av "AK Golf Oppgave-modal.html" + ny
 * Hit-rate-seksjon (Mekanisme 7) som ikke fantes i HTML-prototypen.
 *
 * Seksjoner:
 *   1. Beskrivelse
 *   2. Kategorisering (Pyramide, SG-bucket, Køllevalg)
 *   3. Trenings-modalitet (L/CS/M/PR — MORAD)
 *   4. Bilde / video
 *   5. Rep-mål per hastighet (Dry/Lav/Full)
 *   6. TM-mål per oppgave (Mekanisme 6 — spredning, verdi, kausal)
 *   7. Hit-rate-mål (Mekanisme 7 — pass/fail)
 *   8. Linkede drills + forhåndsvisning
 */

import { useState, type FormEvent } from "react";
import { X, Check, Camera, Play, Sparkles, Search, GripVertical, Plus, Trash2 } from "lucide-react";
import {
  KOLLER,
  L_PHASES,
  CS_LEVELS,
  M_LEVELS,
  PR_LEVELS,
  SG_BUCKETS,
  HIT_RATE_PROTOCOLS,
  type HitRateProtocol,
  type PyramidArea,
} from "./constants";
import "./oppgave-modal.css";

const PYRAMIDES: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

const SG_TAB_LABEL: Record<keyof typeof SG_BUCKETS, string> = {
  Tee: "Tee",
  "Approach (m)": "Approach",
  "Around Green": "Around Green",
  "Putt (m)": "Putt",
};

type SGTab = keyof typeof SG_BUCKETS;

export interface TmGoalDraft {
  id: string;
  metric: string;
  klubb: string;
  baselineValue: number | "";
  targetValue: number | "";
  targetType: "PRIMARY" | "SECONDARY" | "CAUSAL";
  comparison: "LESS_THAN" | "GREATER_THAN" | "RANGE" | "EQUAL";
}

export interface HitRateGoalDraft {
  id: string;
  metric: string;
  klubb: string;
  protocol: HitRateProtocol;
  corridorMin: number | "";
  corridorMax: number | "";
  requiredHits: number | "";
  windowSize: number | "";
  currentHits?: number;
  currentBatchSize?: number;
  bestHits?: number;
  currentStreak?: number;
  inTarget?: boolean;
}

export interface OppgaveDraft {
  id?: string;
  pNummer: string;
  pName: string;
  tittel: string;
  beskrivelse: string;
  pyramide: PyramidArea;
  omraadeTab: SGTab;
  omraade: string;
  koller: string[];
  lFase?: typeof L_PHASES[number];
  cs?: typeof CS_LEVELS[number];
  m?: typeof M_LEVELS[number];
  pr?: typeof PR_LEVELS[number];
  bildeUrl?: string;
  videoUrl?: string;
  repsMaalDry: number;
  repsMaalLav: number;
  repsMaalFull: number;
  tmGoals: TmGoalDraft[];
  hitRateGoals: HitRateGoalDraft[];
  drillIds: string[];
}

interface OppgaveModalProps {
  open: boolean;
  onClose: () => void;
  initial: OppgaveDraft;
  onSubmit: (draft: OppgaveDraft) => void | Promise<void>;
  isEditing?: boolean;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function OppgaveModal({ open, onClose, initial, onSubmit, isEditing }: OppgaveModalProps) {
  const [draft, setDraft] = useState<OppgaveDraft>(initial);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const totalReps = (draft.repsMaalDry || 0) + (draft.repsMaalLav || 0) + (draft.repsMaalFull || 0);

  function patch(p: Partial<OppgaveDraft>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function toggleKolle(k: string) {
    setDraft((d) => {
      if (k === "Alle køller") {
        return { ...d, koller: d.koller.includes(k) ? [] : ["Alle køller"] };
      }
      const withoutAll = d.koller.filter((x) => x !== "Alle køller");
      return {
        ...d,
        koller: withoutAll.includes(k) ? withoutAll.filter((x) => x !== k) : [...withoutAll, k],
      };
    });
  }

  function addTmGoal() {
    setDraft((d) => ({
      ...d,
      tmGoals: [
        ...d.tmGoals,
        {
          id: uid(),
          metric: "dispersion_m_std",
          klubb: d.koller[0] ?? "7-jern",
          baselineValue: "",
          targetValue: "",
          targetType: "PRIMARY",
          comparison: "LESS_THAN",
        },
      ],
    }));
  }
  function updateTmGoal(id: string, p: Partial<TmGoalDraft>) {
    setDraft((d) => ({
      ...d,
      tmGoals: d.tmGoals.map((g) => (g.id === id ? { ...g, ...p } : g)),
    }));
  }
  function removeTmGoal(id: string) {
    setDraft((d) => ({ ...d, tmGoals: d.tmGoals.filter((g) => g.id !== id) }));
  }

  function addHitRateGoal() {
    setDraft((d) => ({
      ...d,
      hitRateGoals: [
        ...d.hitRateGoals,
        {
          id: uid(),
          metric: "face_angle_hit_rate",
          klubb: d.koller[0] ?? "7-jern",
          protocol: "ROLLING_WINDOW",
          corridorMin: -2,
          corridorMax: 2,
          requiredHits: 8,
          windowSize: 10,
        },
      ],
    }));
  }
  function updateHitRateGoal(id: string, p: Partial<HitRateGoalDraft>) {
    setDraft((d) => ({
      ...d,
      hitRateGoals: d.hitRateGoals.map((g) => (g.id === id ? { ...g, ...p } : g)),
    }));
  }
  function removeHitRateGoal(id: string) {
    setDraft((d) => ({ ...d, hitRateGoals: d.hitRateGoals.filter((g) => g.id !== id) }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(draft);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="tp-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tp-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form className="tp-modal tp-scope" onSubmit={handleSubmit}>
        <header className="m-head">
          <div>
            <div className="eyebrow">
              <span className="pyr-dot" />
              {draft.pNummer} · {draft.pName}
              <span className="sep">·</span>
              {isEditing ? "Rediger oppgave" : "Ny oppgave"}
            </div>
            <h2 id="tp-modal-title">
              {draft.tittel || "Ny oppgave"}
            </h2>
            <div className="sub">
              <span>Pyramide <strong>{draft.pyramide}</strong></span>
              <span className="pip" />
              <span>Område <strong>{draft.omraade}</strong></span>
              <span className="pip" />
              <span>Totalt <strong>{totalReps.toLocaleString("nb-NO")}</strong> reps</span>
            </div>
          </div>
          <button type="button" className="m-close" onClick={onClose} aria-label="Lukk">
            <X size={18} aria-hidden />
          </button>
        </header>

        <div className="m-body">

          {/* 1. BESKRIVELSE */}
          <section className="section">
            <div className="section-head">
              <span className="num"><b>1</b> Beskrivelse</span>
            </div>
            <div className="section-row">
              <div className="field-stack">
                <label className="field-label" htmlFor="f-title">Tittel</label>
                <input
                  id="f-title"
                  type="text"
                  className="input"
                  placeholder="F.eks. «Venstre håndledd flat på toppen»"
                  value={draft.tittel}
                  onChange={(e) => patch({ tittel: e.target.value })}
                />
              </div>
              <div className="field-stack">
                <label className="field-label" htmlFor="f-desc">Beskrivelse</label>
                <textarea
                  id="f-desc"
                  className="textarea"
                  placeholder="Hva skal spilleren fokusere på? Cue + sjekkpunkt."
                  value={draft.beskrivelse}
                  onChange={(e) => patch({ beskrivelse: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* 2. KATEGORISERING */}
          <section className="section">
            <div className="section-head">
              <span className="num"><b>2</b> Kategorisering</span>
            </div>

            <div className="section-row">
              <div className="field-stack">
                <span className="field-label">Pyramide-område</span>
                <div className="seg cols-5">
                  {PYRAMIDES.map((py) => (
                    <button
                      type="button"
                      key={py}
                      className={py === draft.pyramide ? "active" : ""}
                      onClick={() => patch({ pyramide: py })}
                    >
                      <span className="dot" />{py}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-stack">
                <span className="field-label">
                  Område{" "}
                  <span style={{ color: "hsl(var(--muted-foreground))", fontWeight: 500 }}>· Strokes Gained</span>
                </span>
                <p className="field-helper">
                  Matcher SG-buckets. Velg én hoved-kategori, deretter sub-område.
                </p>
                <div className="area-tabs">
                  {(Object.keys(SG_BUCKETS) as SGTab[]).map((tab) => (
                    <button
                      type="button"
                      key={tab}
                      className={`area-tab ${tab === draft.omraadeTab ? "active" : ""}`}
                      onClick={() => {
                        const buckets = SG_BUCKETS[tab];
                        patch({ omraadeTab: tab, omraade: buckets[0] });
                      }}
                    >
                      {SG_TAB_LABEL[tab]}
                      <span className="meta">
                        {SG_BUCKETS[tab].length === 1
                          ? SG_BUCKETS[tab][0]
                          : `${SG_BUCKETS[tab].length} sub`}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="area-sub">
                  <span className="area-sub-label">{SG_TAB_LABEL[draft.omraadeTab]} · velg sub-område</span>
                  <div className="chip-row">
                    {SG_BUCKETS[draft.omraadeTab].map((sub) => (
                      <button
                        type="button"
                        key={sub}
                        className={`chip ${sub === draft.omraade ? "active" : ""}`}
                        onClick={() => patch({ omraade: sub })}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="field-stack">
                <span className="field-label">
                  Køllevalg{" "}
                  <span style={{ color: "hsl(var(--muted-foreground))", fontWeight: 500 }}>· multi-select</span>
                </span>
                <div className="chip-row">
                  {KOLLER.map((k) => (
                    <button
                      type="button"
                      key={k}
                      className={`chip ${draft.koller.includes(k) ? "active club" : ""}`}
                      onClick={() => toggleKolle(k)}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 3. MODALITET */}
          <section className="section">
            <div className="section-head">
              <span className="num">
                <b>3</b> Trenings-modalitet{" "}
                <span style={{ color: "hsl(var(--muted-foreground))" }}>· MORAD</span>
              </span>
            </div>

            <div className="modality-grid">
              <ModalitySeg
                label="L-fase"
                helper="Kropp → Arm → Kølle → Ball → Auto."
                options={L_PHASES}
                value={draft.lFase}
                onChange={(v) => patch({ lFase: v })}
                cols={5}
              />
              <ModalitySeg
                label="CS-nivå · hastighet"
                helper="CS50 ≈ halv-tempo, CS100 ≈ full."
                options={CS_LEVELS}
                value={draft.cs}
                onChange={(v) => patch({ cs: v })}
                cols={6}
              />
              <ModalitySeg
                label="M · miljø"
                helper="M0 = ingen distraksjon, M5 = full press."
                options={M_LEVELS}
                value={draft.m}
                onChange={(v) => patch({ m: v })}
                cols={6}
              />
              <ModalitySeg
                label="PR · press"
                helper="Konsekvens om mislykket. PR5 = turnering."
                options={PR_LEVELS}
                value={draft.pr}
                onChange={(v) => patch({ pr: v })}
                cols={5}
              />
            </div>
          </section>

          {/* 4. MEDIA */}
          <section className="section">
            <div className="section-head">
              <span className="num">
                <b>4</b> Bilde / video{" "}
                <span style={{ color: "hsl(var(--muted-foreground))" }}>· valgfritt</span>
              </span>
            </div>
            <div className="media-grid">
              <button type="button" className={`media-slot ${draft.videoUrl ? "has-file" : ""}`}>
                <span className="ic" aria-hidden><Play size={14} /></span>
                <span className="copy">
                  <span className="nm">{draft.videoUrl ? draft.videoUrl : "Legg til video"}</span>
                  <span className="meta">MP4 / MOV · max 200 MB</span>
                </span>
              </button>
              <button type="button" className={`media-slot ${draft.bildeUrl ? "has-file" : ""}`}>
                <span className="ic" aria-hidden><Camera size={14} /></span>
                <span className="copy">
                  <span className="nm">{draft.bildeUrl ? draft.bildeUrl : "Legg til bilde"}</span>
                  <span className="meta">JPG / PNG · max 5 MB</span>
                </span>
              </button>
            </div>
          </section>

          {/* 5. REP-MÅL */}
          <section className="section">
            <div className="section-head">
              <span className="num"><b>5</b> Rep-mål per hastighet</span>
              <span className="helper">Total · {totalReps.toLocaleString("nb-NO")} reps</span>
            </div>
            <div className="rep-grid">
              {([
                { key: "repsMaalDry" as const, label: "Dry-swing", italic: "uten ball", desc: "Uten ball — posisjon og tempo.", klass: "dry" },
                { key: "repsMaalLav" as const, label: "Lav", italic: "CS50–70", desc: "Med ball, halv-tempo.", klass: "lav" },
                { key: "repsMaalFull" as const, label: "Full", italic: "CS80–100", desc: "Med ball, full hastighet.", klass: "full" },
              ]).map((r) => (
                <div key={r.key} className={`rep-card ${r.klass}`}>
                  <div className="head">
                    <span className="dot" />
                    <span className="nm">{r.label} <em>{r.italic}</em></span>
                  </div>
                  <input
                    className="num-input"
                    type="number"
                    min={0}
                    value={draft[r.key]}
                    onChange={(e) => patch({ [r.key]: Number(e.target.value) })}
                  />
                  <p className="desc">{r.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 6. TM-MÅL (Mekanisme 6) */}
          <section className="section">
            <div className="section-head">
              <span className="num"><b>6</b> TM-mål per oppgave <span style={{ color: "hsl(var(--muted-foreground))" }}>· spredning</span></span>
              <button type="button" className="tp-btn outline" onClick={addTmGoal}>
                <Plus size={12} aria-hidden /> Legg til måling
              </button>
            </div>
            {draft.tmGoals.length === 0 ? (
              <p className="field-helper">
                Ingen TM-mål satt enda. Spredningsmål er anbefalt — disp, axis-avvik, smash σ.
              </p>
            ) : (
              <div className="tp-tm-table">
                <div className="h">Måling</div>
                <div className="h">Kølle</div>
                <div className="h">Baseline → Mål</div>
                <div className="h">Type</div>
                <div className="h" />
                {draft.tmGoals.map((g) => (
                  <TmGoalRow
                    key={g.id}
                    goal={g}
                    onChange={(p) => updateTmGoal(g.id, p)}
                    onRemove={() => removeTmGoal(g.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* 7. HIT-RATE-MÅL (Mekanisme 7 — NY) */}
          <section className="section">
            <div className="section-head">
              <span className="num">
                <b>7</b> Hit-rate-mål{" "}
                <span style={{ color: "hsl(var(--muted-foreground))" }}>· pass/fail</span>
              </span>
              <button type="button" className="tp-btn outline" onClick={addHitRateGoal}>
                <Plus size={12} aria-hidden /> Legg til hit-rate
              </button>
            </div>
            <p className="field-helper" style={{ marginBottom: 12 }}>
              Hit-rate måler kontroll i øyeblikket — som biathlon. Eks: «8 av 10 face
              angle innenfor ±2°». Sammen med TM-målene over måles både kontroll og
              langtidsspredning.
            </p>
            {draft.hitRateGoals.map((g) => (
              <HitRateRow
                key={g.id}
                goal={g}
                onChange={(p) => updateHitRateGoal(g.id, p)}
                onRemove={() => removeHitRateGoal(g.id)}
              />
            ))}
          </section>

          {/* 8. DRILLS + PREVIEW */}
          <section className="section">
            <div className="section-head">
              <span className="num"><b>8</b> Linkede drills fra øvelsesbanken</span>
              <span className="helper">{draft.drillIds.length} valgt</span>
            </div>
            <div className="chip-row">
              {draft.drillIds.map((id) => (
                <span key={id} className="drill-chip selected">
                  <span className="id">#{id}</span>
                </span>
              ))}
              <button type="button" className="drill-chip action">
                <Search size={11} aria-hidden /> Søk i drill-bibliotek
              </button>
            </div>
            <p className="field-helper" style={{ marginTop: 10 }}>
              Når disse drillene loggføres i en treningsøkt, telles reps automatisk mot oppgaven.
            </p>

            {/* Forhåndsvisning */}
            <div
              style={{
                marginTop: 16,
                padding: 14,
                background: "hsl(var(--secondary))",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "hsl(var(--muted-foreground))",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                <Sparkles size={11} aria-hidden /> Forhåndsvisning
              </div>
              <div className="tp-task">
                <span className="grip"><GripVertical size={12} aria-hidden /></span>
                <span className="prio-num">·</span>
                <div className="body">
                  <div className="title-row">
                    <span className="title">{draft.tittel || "Ny oppgave"}</span>
                  </div>
                  <div className="tp-tag-row">
                    <span className={`tp-tag pyr-${draft.pyramide.toLowerCase()}`}>{draft.pyramide}</span>
                    <span className="tp-tag area">{draft.omraade.toUpperCase()}</span>
                    {draft.koller.length === 1 ? (
                      <span className="tp-tag club">{draft.koller[0].toUpperCase()}</span>
                    ) : draft.koller.length > 1 ? (
                      <span className="tp-tag club">{draft.koller.length} KØLLER</span>
                    ) : null}
                    {draft.lFase ? <span className="tp-tag lphase">{draft.lFase}</span> : null}
                    {draft.cs ? <span className="tp-tag cs">{draft.cs}</span> : null}
                    {draft.m ? <span className="tp-tag">{draft.m}</span> : null}
                    {draft.pr ? <span className="tp-tag">{draft.pr}</span> : null}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="m-foot">
          {isEditing ? (
            <button
              type="button"
              className="tp-btn ghost"
              style={{ color: "hsl(var(--destructive))" }}
            >
              <Trash2 size={13} aria-hidden /> Slett oppgave
            </button>
          ) : null}
          <div className="spacer" />
          <button type="button" className="tp-btn outline" onClick={onClose}>
            Avbryt
          </button>
          <button type="submit" className="tp-btn primary" disabled={submitting}>
            <Check size={13} aria-hidden />
            {submitting ? "Lagrer…" : "Lagre oppgave"}
          </button>
        </footer>
      </form>
    </div>
  );
}

// ---- Sub-components ----------------------------------------------------------

interface ModalitySegProps<T extends string> {
  label: string;
  helper: string;
  options: readonly T[];
  value: T | undefined;
  onChange: (v: T) => void;
  cols: 5 | 6;
}

function ModalitySeg<T extends string>({
  label,
  helper,
  options,
  value,
  onChange,
  cols,
}: ModalitySegProps<T>) {
  return (
    <div className="modality-cell">
      <span className="field-label">{label}</span>
      <p className="field-helper">{helper}</p>
      <div className={`seg cols-${cols}`}>
        {options.map((o) => (
          <button
            type="button"
            key={o}
            className={o === value ? "active" : ""}
            onClick={() => onChange(o)}
          >
            <span className="dot" />{o}
          </button>
        ))}
      </div>
    </div>
  );
}

interface TmGoalRowProps {
  goal: TmGoalDraft;
  onChange: (p: Partial<TmGoalDraft>) => void;
  onRemove: () => void;
}

function TmGoalRow({ goal, onChange, onRemove }: TmGoalRowProps) {
  return (
    <>
      <input
        className="v input"
        value={goal.metric}
        onChange={(e) => onChange({ metric: e.target.value })}
        placeholder="dispersion_m_std"
        aria-label="TM-måling"
      />
      <select
        className="v input"
        value={goal.klubb}
        onChange={(e) => onChange({ klubb: e.target.value })}
        aria-label="Kølle"
      >
        {KOLLER.map((k) => (
          <option key={k}>{k}</option>
        ))}
      </select>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <input
          className="v input"
          type="number"
          step="0.1"
          style={{ width: 60 }}
          value={goal.baselineValue === "" ? "" : goal.baselineValue}
          onChange={(e) => onChange({ baselineValue: e.target.value === "" ? "" : Number(e.target.value) })}
          placeholder="Base"
          aria-label="Baseline-verdi"
        />
        <span style={{ color: "hsl(var(--muted-foreground))" }} aria-hidden>→</span>
        <input
          className="v input"
          type="number"
          step="0.1"
          style={{ width: 60 }}
          value={goal.targetValue === "" ? "" : goal.targetValue}
          onChange={(e) => onChange({ targetValue: e.target.value === "" ? "" : Number(e.target.value) })}
          placeholder="Mål"
          aria-label="Mål-verdi"
        />
      </div>
      <select
        className="v input"
        value={goal.targetType}
        onChange={(e) => onChange({ targetType: e.target.value as TmGoalDraft["targetType"] })}
        aria-label="Måltype"
      >
        <option value="PRIMARY">Primær</option>
        <option value="SECONDARY">Sekundær</option>
        <option value="CAUSAL">Kausal</option>
      </select>
      <button
        type="button"
        className="tp-btn ghost"
        onClick={onRemove}
        aria-label="Fjern måling"
        style={{ padding: 6, justifyContent: "center" }}
      >
        <Trash2 size={12} aria-hidden />
      </button>
    </>
  );
}

interface HitRateRowProps {
  goal: HitRateGoalDraft;
  onChange: (p: Partial<HitRateGoalDraft>) => void;
  onRemove: () => void;
}

function HitRateRow({ goal, onChange, onRemove }: HitRateRowProps) {
  const inTarget =
    typeof goal.currentHits === "number" &&
    typeof goal.requiredHits === "number" &&
    goal.currentHits >= goal.requiredHits;

  return (
    <div className="tp-hit-row">
      <label className="field-stack">
        <span className="field-label">Måling</span>
        <input
          className="input"
          value={goal.metric}
          onChange={(e) => onChange({ metric: e.target.value })}
        />
      </label>
      <label className="field-stack">
        <span className="field-label">Kølle</span>
        <select
          className="input"
          value={goal.klubb}
          onChange={(e) => onChange({ klubb: e.target.value })}
        >
          {KOLLER.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </label>
      <div className="field-stack" role="group" aria-label="Korridor">
        <span className="field-label">Korridor</span>
        <div className="corridor-row">
          <input
            className="input"
            type="number"
            step="0.1"
            value={goal.corridorMin === "" ? "" : goal.corridorMin}
            onChange={(e) =>
              onChange({ corridorMin: e.target.value === "" ? "" : Number(e.target.value) })
            }
            aria-label="Korridor min"
          />
          <span className="sep" aria-hidden>til</span>
          <input
            className="input"
            type="number"
            step="0.1"
            value={goal.corridorMax === "" ? "" : goal.corridorMax}
            onChange={(e) =>
              onChange({ corridorMax: e.target.value === "" ? "" : Number(e.target.value) })
            }
            aria-label="Korridor maks"
          />
        </div>
      </div>
      <label className="field-stack">
        <span className="field-label">Protokoll</span>
        <select
          className="input"
          value={goal.protocol}
          onChange={(e) => onChange({ protocol: e.target.value as HitRateProtocol })}
        >
          {(Object.entries(HIT_RATE_PROTOCOLS) as [HitRateProtocol, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </label>
      <div className="field-stack" role="group" aria-label="Krav">
        <span className="field-label">Krav</span>
        <div className="req-row">
          <input
            className="input"
            type="number"
            min={1}
            value={goal.requiredHits === "" ? "" : goal.requiredHits}
            onChange={(e) =>
              onChange({ requiredHits: e.target.value === "" ? "" : Number(e.target.value) })
            }
            aria-label="Antall treff"
          />
          <span className="of" aria-hidden>av</span>
          <input
            className="input"
            type="number"
            min={1}
            value={goal.windowSize === "" ? "" : goal.windowSize}
            onChange={(e) =>
              onChange({ windowSize: e.target.value === "" ? "" : Number(e.target.value) })
            }
            aria-label="Antall slag"
          />
        </div>
      </div>
      <div className={`tp-hit-status ${inTarget ? "in-target" : ""}`}>
        {typeof goal.currentHits === "number"
          ? `${goal.currentHits}/${goal.currentBatchSize ?? goal.windowSize ?? "?"}`
          : "—"}
      </div>
      <button
        type="button"
        className="tp-btn ghost"
        onClick={onRemove}
        aria-label="Fjern hit-rate"
        style={{ padding: 6, justifyContent: "center" }}
      >
        <Trash2 size={12} aria-hidden />
      </button>

      <div className="tp-hit-row-tail">
        {typeof goal.bestHits === "number" ? (
          <span>Best i økt: <b>{goal.bestHits}/{goal.windowSize ?? "?"}</b></span>
        ) : null}
        {typeof goal.currentStreak === "number" ? (
          <span>Streak: <b>{goal.currentStreak}</b></span>
        ) : null}
        {typeof goal.currentHits !== "number" ? (
          <span>Ingen TM-data koblet ennå.</span>
        ) : null}
      </div>
    </div>
  );
}
