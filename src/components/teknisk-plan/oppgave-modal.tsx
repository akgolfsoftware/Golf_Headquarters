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
  MOTORIKK_KODER,
  MOTORIKK_LABEL,
  BELASTNING_KODER,
  BELASTNING_LABEL,
  PRESS_KODER,
  PRESS_LABEL,
  MAALEUTSTYR_KODER,
  MAALEUTSTYR_LABEL,
  DIMENSJON_LABEL,
  type MotorikkKode,
  type BelastningKode,
  type PressKode,
  type MaaleutstyrKode,
  type DimensjonKode,
} from "@/lib/domain/ak-formel-v2";
import { dimensjonerFor, relevansFor } from "@/lib/domain/omrade-relevans";
import {
  KOLLER,
  P_POSITIONS,
  hovedP,
  mellomposisjonerFor,
  pNavn,
  OMRAADE_FANER,
  omraadeVisning,
  type OmraadeFane,
  type OmraadeKode,
  HIT_RATE_PROTOCOLS,
  type HitRateProtocol,
  type PyramidArea,
} from "./constants";
import { sokOvelser } from "@/lib/workbench/ovelse-sok";
import { TL } from "@/lib/v2/train-lock";
import "./oppgave-modal.css";

function getEmbedUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === "youtu.be") {
      const v = u.pathname.slice(1);
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const m = /\/(\d+)/.exec(u.pathname);
      if (m) return `https://player.vimeo.com/video/${m[1]}`;
    }
  } catch {}
  return null;
}

const PYRAMIDES: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

type SGTab = OmraadeFane;

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

export const TASK_KATEGORIER = ["TEKNISK", "TAKTISK", "MENTALT", "SOSIALT"] as const;
export type TaskKategori = (typeof TASK_KATEGORIER)[number];

export interface OppgaveDraft {
  id?: string;
  pNummer: string;
  pName: string;
  tittel: string;
  beskrivelse: string;
  pyramide: PyramidArea;
  omraadeTab: SGTab;
  /** Typet område (fasitens liste). `omraade` er visningsetiketten, avledet. */
  omraadeKode: OmraadeKode;
  omraade: string;
  koller: string[];
  /** v2-akser (22.09). L-fase, CS, Miljø og Press er utgått. */
  motorikk?: MotorikkKode;
  belastning?: BelastningKode;
  press?: PressKode;
  /** Teknisk fokus — én per oppgave, valgfritt. */
  dimensjon?: DimensjonKode;
  maaleutstyr?: MaaleutstyrKode;
  kategori?: TaskKategori;
  bildeUrl?: string;
  videoUrl?: string;
  repsMaalDry: number;
  repsMaalLav: number;
  repsMaalFull: number;
  /** Reps logget så langt — kun satt når vi redigerer en lagret oppgave. */
  repsGjortDry?: number;
  repsGjortLav?: number;
  repsGjortFull?: number;
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
  /** Logg reps direkte på oppgaven — kun tilgjengelig når isEditing. */
  onLogReps?: (reps: { dry?: number; lav?: number; full?: number }) => Promise<void>;
  /** Last opp bilde/video — returnerer den nye URL-en. */
  onUploadMedia?: (file: File, kind: "bilde" | "video") => Promise<string>;
}

const AVANSERT_P_NOKKEL = "tp-avansert-p";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const KATEGORI_LABEL: Record<TaskKategori, string> = {
  TEKNISK: "Teknisk",
  TAKTISK: "Taktisk",
  MENTALT: "Mentalt",
  SOSIALT: "Sosialt",
};

export function OppgaveModal({ open, onClose, initial, onSubmit, isEditing, onLogReps, onUploadMedia }: OppgaveModalProps) {
  const [draft, setDraft] = useState<OppgaveDraft>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [logDraft, setLogDraft] = useState({ dry: 0, lav: 0, full: 0 });
  const [loggingReps, setLoggingReps] = useState(false);
  const [uploading, setUploading] = useState<"bilde" | "video" | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Øvelsesbank-søk
  const [drillSearchOpen, setDrillSearchOpen] = useState(false);
  const [drillQuery, setDrillQuery] = useState("");
  const [drillResults, setDrillResults] = useState<
    Array<{ id: string; name: string; pyramidArea: string }>
  >([]);
  const [isSearchingDrills, setIsSearchingDrills] = useState(false);
  const [drillNames, setDrillNames] = useState<Record<string, string>>({});

  async function handleDrillSearch(q: string) {
    setDrillQuery(q);
    setIsSearchingDrills(true);
    try {
      const res = await sokOvelser(q, draft.pyramide);
      setDrillResults(res);
      setDrillNames((prev) => {
        const next = { ...prev };
        for (const item of res) {
          next[item.id] = item.name;
        }
        return next;
      });
    } catch {
      // Ignorer søkefeil
    } finally {
      setIsSearchingDrills(false);
    }
  }

  function toggleDrill(id: string, name?: string) {
    if (name) {
      setDrillNames((prev) => ({ ...prev, [id]: name }));
    }
    setDraft((d) => {
      const exists = d.drillIds.includes(id);
      return {
        ...d,
        drillIds: exists ? d.drillIds.filter((x) => x !== id) : [...d.drillIds, id],
      };
    });
  }
  // Avansert P-velger (mellomposisjoner) — per-nettleser-bekvemmelighet, aldri fasit.
  const [avansertP, setAvansertPState] = useState<boolean>(() => {
    try { return window.localStorage.getItem(AVANSERT_P_NOKKEL) === "1"; } catch { return false; }
  });
  function setAvansertP(v: boolean) {
    setAvansertPState(v);
    try { window.localStorage.setItem(AVANSERT_P_NOKKEL, v ? "1" : "0"); } catch { /* privat modus o.l. */ }
  }
  const relevans = relevansFor(draft.omraadeKode);
  const dimensjoner = dimensjonerFor(draft.omraadeKode);

  function velgOmraade(tab: SGTab, kode: OmraadeKode) {
    setDraft((d) => ({ ...d, omraadeTab: tab, omraadeKode: kode, omraade: omraadeVisning(kode) }));
  }
  function velgP(num: string) {
    setDraft((d) => ({ ...d, pNummer: num, pName: pNavn(num) }));
  }

  if (!open) return null;

  const totalReps = (draft.repsMaalDry || 0) + (draft.repsMaalLav || 0) + (draft.repsMaalFull || 0);

  function sykleKategori() {
    setDraft((d) => {
      const i = d.kategori ? TASK_KATEGORIER.indexOf(d.kategori) : -1;
      const next = i + 1 >= TASK_KATEGORIER.length ? undefined : TASK_KATEGORIER[i + 1];
      return { ...d, kategori: next };
    });
  }

  async function handleLogReps() {
    if (!onLogReps || loggingReps) return;
    const { dry, lav, full } = logDraft;
    if (dry === 0 && lav === 0 && full === 0) return;
    setLoggingReps(true);
    try {
      await onLogReps({ dry: dry || undefined, lav: lav || undefined, full: full || undefined });
      setDraft((d) => ({
        ...d,
        repsGjortDry: (d.repsGjortDry ?? 0) + dry,
        repsGjortLav: (d.repsGjortLav ?? 0) + lav,
        repsGjortFull: (d.repsGjortFull ?? 0) + full,
      }));
      setLogDraft({ dry: 0, lav: 0, full: 0 });
    } finally {
      setLoggingReps(false);
    }
  }

  async function handleMediaPick(e: React.ChangeEvent<HTMLInputElement>, kind: "bilde" | "video") {
    const fil = e.target.files?.[0];
    e.target.value = "";
    if (!fil || !onUploadMedia) return;
    setMediaError(null);
    setUploading(kind);
    try {
      const url = await onUploadMedia(fil, kind);
      patch(kind === "bilde" ? { bildeUrl: url } : { videoUrl: url });
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : "Opplasting feilet.");
    } finally {
      setUploading(null);
    }
  }

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
                <span className="field-label">
                  P-posisjon{" "}
                  <span style={{ color: "hsl(var(--muted-foreground))", fontWeight: 500 }}>· {draft.pNummer} {pNavn(draft.pNummer)}</span>
                </span>
                <div className="seg cols-5" role="group" aria-label="Hovedposisjon P1 til P10">
                  {P_POSITIONS.map((p) => (
                    <button
                      type="button"
                      key={p.num}
                      className={hovedP(draft.pNummer) === p.num ? "active" : ""}
                      title={p.name}
                      onClick={() => velgP(p.num)}
                    >
                      <span className="dot" />{p.num.replace(".0", "")}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className={`chip ${avansertP ? "active" : ""}`}
                  aria-pressed={avansertP}
                  onClick={() => setAvansertP(!avansertP)}
                  style={{ alignSelf: "flex-start" }}
                >
                  {avansertP ? "Avansert: mellomposisjoner vises" : "Avansert: vis mellomposisjoner"}
                </button>
                {avansertP && mellomposisjonerFor(hovedP(draft.pNummer)).length > 0 && (
                  <div className="seg cols-5" role="group" aria-label={`Mellomposisjoner under ${hovedP(draft.pNummer)}`}>
                    {[{ num: hovedP(draft.pNummer), name: pNavn(hovedP(draft.pNummer)) }, ...mellomposisjonerFor(hovedP(draft.pNummer))].map((p) => (
                      <button
                        type="button"
                        key={p.num}
                        className={draft.pNummer === p.num ? "active" : ""}
                        title={p.name}
                        onClick={() => velgP(p.num)}
                      >
                        <span className="dot" />{p.num}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                  Klassifisering{" "}
                  <span style={{ color: "hsl(var(--muted-foreground))", fontWeight: 500 }}>· valgfritt, eget felt</span>
                </span>
                <p className="field-helper">
                  Teknisk/Taktisk/Mentalt/Sosialt — ved siden av pyramide-området, erstatter det ikke.
                </p>
                <button
                  type="button"
                  className={`chip ${draft.kategori ? "active" : ""}`}
                  onClick={sykleKategori}
                  style={{ alignSelf: "flex-start" }}
                >
                  {draft.kategori ? KATEGORI_LABEL[draft.kategori] : "Ikke satt"}
                </button>
              </div>

              <div className="field-stack">
                <span className="field-label">
                  Treningsområde{" "}
                  <span style={{ color: "hsl(var(--muted-foreground))", fontWeight: 500 }}>· Strokes Gained</span>
                </span>
                <p className="field-helper">
                  Velg område, deretter lengde. Putting i fot, meter i parentes.
                </p>
                <div className="area-tabs">
                  {(Object.keys(OMRAADE_FANER) as SGTab[]).map((tab) => (
                    <button
                      type="button"
                      key={tab}
                      className={`area-tab ${tab === draft.omraadeTab ? "active" : ""}`}
                      onClick={() => velgOmraade(tab, OMRAADE_FANER[tab][0])}
                    >
                      {tab}
                      <span className="meta">
                        {OMRAADE_FANER[tab].length === 1
                          ? omraadeVisning(OMRAADE_FANER[tab][0])
                          : `${OMRAADE_FANER[tab].length} valg`}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="area-sub">
                  <span className="area-sub-label">{draft.omraadeTab} · velg lengde eller slag</span>
                  <div className="chip-row">
                    {OMRAADE_FANER[draft.omraadeTab].map((kode) => (
                      <button
                        type="button"
                        key={kode}
                        className={`chip ${kode === draft.omraadeKode ? "active" : ""}`}
                        onClick={() => velgOmraade(draft.omraadeTab, kode)}
                      >
                        {omraadeVisning(kode)}
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

          {/* 3. GJENNOMFØRING */}
          <section className="section">
            <div className="section-head">
              <span className="num">
                <b>3</b> Gjennomføring{" "}
                <span style={{ color: "hsl(var(--muted-foreground))" }}>
                  · {relevans.motorikk ? "full sving" : "ingen læringssteg for dette området"}
                </span>
              </span>
            </div>

            <div className="modality-grid">
              {relevans.motorikk && (
                <ModalitySeg
                  label="Læringssteg"
                  helper="Uten ball → Lav hastighet → Automatikk. Gjelder bare full sving."
                  options={MOTORIKK_KODER}
                  value={draft.motorikk}
                  onChange={(v) => patch({ motorikk: v })}
                  cols={3}
                  labelFor={(k) => MOTORIKK_LABEL[k]}
                />
              )}
              {relevans.dimensjon && dimensjoner.length > 0 && (
                <ModalitySeg
                  label="Teknisk fokus"
                  helper="Én per oppgave. Følger med når oppgaven legges inn i en økt."
                  options={dimensjoner}
                  value={draft.dimensjon}
                  onChange={(v) => patch({ dimensjon: draft.dimensjon === v ? undefined : v })}
                  cols={dimensjoner.length > 3 ? 4 : 3}
                  labelFor={(k) => DIMENSJON_LABEL[k]}
                />
              )}
              <ModalitySeg
                label="Måleutstyr"
                helper="Fast liste. Velges her, aldri gjettet ut fra sted."
                options={MAALEUTSTYR_KODER}
                value={draft.maaleutstyr}
                onChange={(v) => patch({ maaleutstyr: draft.maaleutstyr === v ? undefined : v })}
                cols={3}
                labelFor={(k) => MAALEUTSTYR_LABEL[k]}
              />
              {relevans.belastning && (
                <ModalitySeg
                  label="Sted og miljø"
                  helper="Konteksten treningen skjer i."
                  options={BELASTNING_KODER}
                  value={draft.belastning}
                  onChange={(v) => patch({ belastning: v })}
                  cols={4}
                  labelFor={(k) => BELASTNING_LABEL[k]}
                />
              )}
              {relevans.press && (
                <ModalitySeg
                  label="Press"
                  helper="Hvem ser på, og hvilken situasjon trenes."
                  options={PRESS_KODER}
                  value={draft.press}
                  onChange={(v) => patch({ press: v })}
                  cols={4}
                  labelFor={(k) => PRESS_LABEL[k]}
                />
              )}
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
            {isEditing && onUploadMedia ? (
              <div className="media-grid">
                <label className={`media-slot ${draft.videoUrl ? "has-file" : ""}`}>
                  <span className="ic" aria-hidden>{uploading === "video" ? <Sparkles size={14} /> : <Play size={14} />}</span>
                  <span className="copy">
                    <span className="nm">
                      {uploading === "video" ? "Laster opp …" : draft.videoUrl ? "Video lagt til" : "Last opp video"}
                    </span>
                    <span className="meta">MP4 / MOV · max 50 MB</span>
                  </span>
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime"
                    style={{ display: "none" }}
                    disabled={uploading !== null}
                    onChange={(e) => handleMediaPick(e, "video")}
                  />
                </label>
                <label className={`media-slot ${draft.bildeUrl ? "has-file" : ""}`}>
                  <span className="ic" aria-hidden>{uploading === "bilde" ? <Sparkles size={14} /> : <Camera size={14} />}</span>
                  <span className="copy">
                    <span className="nm">
                      {uploading === "bilde" ? "Laster opp …" : draft.bildeUrl ? "Bilde lagt til" : "Last opp bilde"}
                    </span>
                    <span className="meta">JPG / PNG / WEBP · max 5 MB</span>
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                    disabled={uploading !== null}
                    onChange={(e) => handleMediaPick(e, "bilde")}
                  />
                </label>
              </div>
            ) : null}

            {/* Direkte lenke for video og bilde */}
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label className="field-label" style={{ fontSize: 11, marginBottom: 4, display: "block" }}>
                  Videolenke (YouTube, Vimeo eller MP4):
                </label>
                <input
                  type="url"
                  className="field-input"
                  placeholder="https://www.youtube.com/watch?v=... eller https://..."
                  value={draft.videoUrl ?? ""}
                  onChange={(e) => patch({ videoUrl: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label" style={{ fontSize: 11, marginBottom: 4, display: "block" }}>
                  Bildelenke (URL):
                </label>
                <input
                  type="url"
                  className="field-input"
                  placeholder="https://..."
                  value={draft.bildeUrl ?? ""}
                  onChange={(e) => patch({ bildeUrl: e.target.value })}
                />
              </div>
            </div>

            {mediaError && (
              <p className="field-helper" style={{ color: "hsl(var(--destructive))", marginTop: 8 }}>{mediaError}</p>
            )}
            {draft.bildeUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={draft.bildeUrl}
                alt=""
                style={{ marginTop: 12, maxHeight: 160, borderRadius: 10, display: "block" }}
              />
            )}
            {draft.videoUrl && (
              getEmbedUrl(draft.videoUrl) ? (
                <div style={{ marginTop: 12, borderRadius: 10, overflow: "hidden", aspectRatio: "16 / 9", maxHeight: 240, width: "100%" }}>
                  <iframe
                    src={getEmbedUrl(draft.videoUrl)!}
                    style={{ width: "100%", height: "100%", border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video
                  src={draft.videoUrl}
                  controls
                  style={{ marginTop: 12, maxHeight: 200, borderRadius: 10, display: "block", width: "100%" }}
                />
              )
            )}
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

            {isEditing && onLogReps && (
              <div style={{ marginTop: 14, padding: 14, background: "hsl(var(--secondary))", borderRadius: 12 }}>
                <div className="field-label" style={{ marginBottom: 8 }}>
                  Logg reps nå{" "}
                  <span style={{ color: "hsl(var(--muted-foreground))", fontWeight: 500 }}>
                    · automatisk — teller opp mot oppgaven med én gang
                  </span>
                </div>
                <div className="rep-grid">
                  {([
                    { key: "dry" as const, label: "Dry-swing", gjort: draft.repsGjortDry ?? 0, maal: draft.repsMaalDry, klass: "dry" },
                    { key: "lav" as const, label: "Lav fart", gjort: draft.repsGjortLav ?? 0, maal: draft.repsMaalLav, klass: "lav" },
                    { key: "full" as const, label: "Fullt", gjort: draft.repsGjortFull ?? 0, maal: draft.repsMaalFull, klass: "full" },
                  ]).map((r) => (
                    <div key={r.key} className={`rep-card ${r.klass}`}>
                      <div className="head">
                        <span className="dot" />
                        <span className="nm">{r.label}</span>
                      </div>
                      <p className="desc" style={{ margin: "0 0 6px" }}>
                        {r.gjort.toLocaleString("nb-NO")} / {r.maal.toLocaleString("nb-NO")} gjort
                      </p>
                      <input
                        className="num-input"
                        type="number"
                        min={0}
                        placeholder="0"
                        value={logDraft[r.key] || ""}
                        onChange={(e) =>
                          setLogDraft((d) => ({ ...d, [r.key]: Math.max(0, Number(e.target.value) || 0) }))
                        }
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="tp-btn primary"
                  style={{ marginTop: 10 }}
                  disabled={loggingReps || (logDraft.dry === 0 && logDraft.lav === 0 && logDraft.full === 0)}
                  onClick={handleLogReps}
                >
                  <Check size={13} aria-hidden />
                  {loggingReps ? "Logger…" : "Logg reps"}
                </button>
              </div>
            )}
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
            <div className="chip-row" style={{ flexWrap: "wrap", gap: 8 }}>
              {draft.drillIds.map((id) => (
                <span
                  key={id}
                  className="drill-chip selected"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6 }}
                >
                  <span className="id">{drillNames[id] ?? `#${id.slice(0, 8)}`}</span>
                  <button
                    type="button"
                    onClick={() => toggleDrill(id)}
                    aria-label="Fjern drill"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "inherit",
                      cursor: "pointer",
                      padding: 0,
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    <X size={12} aria-hidden />
                  </button>
                </span>
              ))}
              <button
                type="button"
                className="drill-chip action"
                onClick={() => {
                  const nextState = !drillSearchOpen;
                  setDrillSearchOpen(nextState);
                  if (nextState && drillResults.length === 0) {
                    handleDrillSearch("");
                  }
                }}
              >
                <Search size={11} aria-hidden /> {drillSearchOpen ? "Lukk øvelsessøk" : "Søk i øvelsesbanken"}
              </button>
            </div>

            {drillSearchOpen && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: TL.dim,
                  borderRadius: 8,
                  border: `1px solid ${TL.hair}`,
                }}
              >
                <input
                  type="text"
                  placeholder="Søk i øvelsesbanken …"
                  value={drillQuery}
                  onChange={(e) => handleDrillSearch(e.target.value)}
                  className="field-input"
                  style={{ width: "100%", marginBottom: 8 }}
                />
                {isSearchingDrills ? (
                  <p className="field-helper">Leter i øvelsesbanken …</p>
                ) : drillResults.length === 0 ? (
                  <p className="field-helper">Ingen øvelser funnet for {draft.pyramide}.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
                    {drillResults.map((dr) => {
                      const isSelected = draft.drillIds.includes(dr.id);
                      return (
                        <div
                          key={dr.id}
                          onClick={() => toggleDrill(dr.id, dr.name)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "6px 10px",
                            borderRadius: 6,
                            background: isSelected ? TL.fill : TL.elev,
                            color: isSelected ? TL.onFill : TL.text,
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{dr.name}</span>
                          <span style={{ fontSize: 10, opacity: 0.8 }}>
                            {isSelected ? "Valgt (klikk for å fjerne)" : "Legg til"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

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
                  fontFamily: "var(--tl-font-mono)",
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
                    {draft.motorikk ? <span className="tp-tag lphase">{MOTORIKK_LABEL[draft.motorikk].toUpperCase()}</span> : null}
                    {draft.dimensjon ? <span className="tp-tag cs">{DIMENSJON_LABEL[draft.dimensjon].toUpperCase()}</span> : null}
                    {draft.maaleutstyr ? <span className="tp-tag">{MAALEUTSTYR_LABEL[draft.maaleutstyr].toUpperCase()}</span> : null}
                    {draft.belastning ? <span className="tp-tag">{BELASTNING_LABEL[draft.belastning].toUpperCase()}</span> : null}
                    {draft.press ? <span className="tp-tag">{PRESS_LABEL[draft.press].toUpperCase()}</span> : null}
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
  cols: 3 | 4 | 5 | 6;
  /** Valgfri klarspråk-label per option (ellers vises rå verdi). */
  labelFor?: (o: T) => string;
}

function ModalitySeg<T extends string>({
  label,
  helper,
  options,
  value,
  onChange,
  cols,
  labelFor,
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
            <span className="dot" />{labelFor ? labelFor(o) : o}
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
