"use client";

// Workbench v2 — modaler, popovers og drawer.
// Holdes adskilt fra hovedklienten for å holde fil-størrelse håndterlig.
// Modaler kaller server actions internt via `useTransition` —
// `onSubmit(msg)` brukes for å trigge toast i parent etter suksess.

import { useEffect, useState, useTransition } from "react";
import {
  askCoach,
  createGoal,
  editSession,
  requestPlanAdjust,
  logSession,
  importTrackMan,
  aiSuggestWeek,
} from "./actions";

/* ─── Felles ───────────────────────────────────────────────────────── */

export type ModalName =
  | "disc"
  | "tm-import"
  | "plan-adjust"
  | "edit-session"
  | "new-goal"
  | "log-session"
  | "ask-coach"
  | "ny-okt"
  | "ai-foresla"
  | null;

export type DisciplineKey = "fys" | "tek" | "slag" | "spill" | "turn";

export type NyEktPrefill = {
  discipline?: DisciplineKey;
  drill?: string;
  title?: string;
  datetime?: string;
  durationMin?: number;
  place?: string;
};

const Icon = ({ id, className }: { id: string; className?: string }) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <use href={`#${id}`} />
  </svg>
);

const CloseIcon = () => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─── Toast ────────────────────────────────────────────────────────── */

export function Toast({ text, show }: { text: string; show: boolean }) {
  return (
    <div className={`toast${show ? " show" : ""}`} role="status" aria-live="polite">
      <svg
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{text}</span>
    </div>
  );
}

/* ─── Modal wrapper ────────────────────────────────────────────────── */

function ModalBackdrop({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      className={`modal-backdrop${open ? " open" : ""}`}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}

/* ─── Inline error-melding for modal-forms ─────────────────────────── */

function InlineError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      style={{
        background: "rgba(163, 45, 45, 0.08)",
        border: "1px solid rgba(163, 45, 45, 0.35)",
        color: "var(--danger, #A32D2D)",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12.5,
        fontFamily: "var(--font-body)",
        marginTop: 4,
      }}
    >
      {message}
    </div>
  );
}

/* ─── Ask Coach Modal ──────────────────────────────────────────────── */

export function AskCoachModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (msg: string) => void;
}) {
  const [discipline, setDiscipline] = useState<DisciplineKey>("slag");
  const [text, setText] = useState("");
  const [urgency, setUrgency] = useState<"normal" | "7d" | "tour">("normal");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const counterColor =
    text.length === 0
      ? "var(--muted-soft)"
      : text.length >= 10
      ? "var(--success)"
      : "var(--danger)";

  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <div className="modal" role="document">
        <header className="modal-header">
          <div>
            <h2>Be om økt fra coach</h2>
            <div className="caption">Til: Anders Kristiansen · Head coach</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Lukk">
            <CloseIcon />
          </button>
        </header>

        <div className="modal-body">
          <div className="context-card">
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="ctx-body">
              <strong>Approach −0,42 SG mot kategori-snitt</strong> er ditt
              største gap. Anders får dette med automatisk.
            </div>
          </div>

          <div className="field">
            <label className="field-label">
              Tema<span className="req">*</span>
            </label>
            <div className="chip-row" role="radiogroup">
              {(["tek", "slag", "fys", "spill", "turn"] as DisciplineKey[]).map(
                (k) => (
                  <button
                    key={k}
                    type="button"
                    className={`chip${discipline === k ? ` active chip-${k}` : ""}`}
                    onClick={() => setDiscipline(k)}
                  >
                    {k.toUpperCase()}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="ask-text">
              Hva trenger du?<span className="req">*</span>
            </label>
            <textarea
              id="ask-text"
              className="field-input"
              rows={3}
              placeholder="F.eks: Jeg sliter med approach 100—150m. Datagolf viser −0,42 SG mot kategori-snitt."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="field-helper" style={{ color: counterColor }}>
              {text.length} / 280 tegn · minimum 10
            </div>
          </div>

          <div className="field-grid-2">
            <div className="field">
              <label className="field-label" htmlFor="ask-when">
                Foreslått dato/tid
              </label>
              <input
                id="ask-when"
                className="field-input"
                type="datetime-local"
                defaultValue="2026-05-22T14:00"
              />
              <div className="field-helper">Tor 22. mai · første ledige slot</div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="ask-place">
                Sted
              </label>
              <select id="ask-place" className="field-input" defaultValue="GFGK Performance Studio">
                <option>GFGK Performance Studio</option>
                <option>Bossum</option>
                <option>Hjemme</option>
                <option>Annet</option>
              </select>
              <div className="field-helper">Bay 4 om mulig</div>
            </div>
          </div>

          <div className="field">
            <label className="field-label">Hastegrad</label>
            <div className="segmented">
              {(
                [
                  ["normal", "Vanlig"],
                  ["7d", "Innen 7 dager"],
                  ["tour", "Før neste turnering"],
                ] as const
              ).map(([k, lbl]) => (
                <button
                  key={k}
                  type="button"
                  className={urgency === k ? "active" : ""}
                  onClick={() => setUrgency(k)}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <InlineError message={error} />
        </div>

        <footer className="modal-footer">
          <div className="left-meta">Sendes som push + e-post</div>
          <button className="btn-ghost" onClick={onClose} disabled={isPending}>
            Avbryt
          </button>
          <button
            className="btn btn-primary"
            disabled={isPending}
            onClick={() => {
              if (text.trim().length < 10) return;
              setError(null);
              startTransition(async () => {
                const result = await askCoach({
                  subject: `${discipline.toUpperCase()} · ${
                    urgency === "tour"
                      ? "Før turnering"
                      : urgency === "7d"
                      ? "Innen 7 dager"
                      : "Vanlig"
                  }`,
                  message: text.trim(),
                  priority:
                    urgency === "tour" ? "urgent" : urgency === "7d" ? "normal" : "low",
                });
                if ("error" in result) {
                  setError(result.error);
                  return;
                }
                onSubmit("Forespørsel sendt til Anders");
                setText("");
                setDiscipline("slag");
                setUrgency("normal");
              });
            }}
          >
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              style={{ width: 14, height: 14 }}
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            {isPending ? "Sender…" : "Send forespørsel"}
          </button>
        </footer>
      </div>
    </ModalBackdrop>
  );
}

/* ─── Plan Adjustment Modal ────────────────────────────────────────── */

export function PlanAdjustModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (msg: string) => void;
}) {
  const [type, setType] = useState<"more" | "less" | "volume" | "other">("more");
  const [disciplines, setDisciplines] = useState<DisciplineKey[]>(["slag"]);
  const [text, setText] = useState("");
  const [urgency, setUrgency] = useState<"normal" | "24h" | "today">("normal");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleDisc = (k: DisciplineKey) => {
    setDisciplines((prev) =>
      prev.includes(k) ? prev.filter((d) => d !== k) : [...prev, k],
    );
  };

  const counterColor =
    text.length === 0
      ? "var(--muted-soft)"
      : text.length >= 10
      ? "var(--success)"
      : "var(--danger)";

  const showDiscField = type === "more" || type === "less";

  const quickTags = [
    {
      label: "Approach trenger fokus",
      text:
        "Approach 100—150m er mitt største gap (−0,42 SG mot kategori-snitt). Kan vi få inn 2 ekstra approach-økter denne uka?",
    },
    {
      label: "For mye TEK",
      text:
        "TEK-volumet har blitt for høyt — 32 % vs målet på 30. Vurder å bytte én tek-økt mot SLAG eller SPILL.",
    },
    {
      label: "Vil ha mer spill",
      text:
        "Vil ha mer spill-trening — 9-hulls simulering eller ekstra runde. Føler at jeg er rustenløst i kamp-modus.",
    },
    {
      label: "Sliten — kutt belastning",
      text:
        "Jeg har vært sliten siste 3 dager. Kutt totalt volum 20—30 % denne uka, behold fokus på prio-1 (approach).",
    },
    {
      label: "Forbered Sørlandsåpent",
      text:
        "Sørlandsåpent om 21 dager. Vil tilpasse uka mot tournament-prep: mer mental, mer slag-prio, mindre teknisk dypdykk.",
    },
  ];

  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <div className="modal plan-adjust" role="document">
        <header className="modal-header">
          <div>
            <h2>Be om plan-justering</h2>
            <div className="caption">Til: Anders K. · Uke 21 · 19—25 mai</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Lukk">
            <CloseIcon />
          </button>
        </header>

        <div className="modal-body">
          <div className="pyr-preview">
            <div className="head">
              <span className="ttl">Din uke akkurat nå</span>
              <span className="summary">
                5 økter · 195 min · 67% pyramide-treff
              </span>
            </div>
            <div className="pyr-segs">
              {(
                [
                  ["FYS", 67, "var(--fys)", "20 %"],
                  ["TEK", 100, "var(--tek)", "30 %"],
                  ["SLAG", 100, "var(--slag)", "30 %"],
                  ["SPILL", 50, "var(--spill)", "15 %"],
                  ["TURN", 17, "#C8B72A", "5 %"],
                ] as const
              ).map(([nm, h, bg, pct]) => (
                <div className="pyr-seg" key={nm}>
                  <div className="bar">
                    <div
                      className="fill"
                      style={{ height: `${h}%`, background: bg }}
                    />
                  </div>
                  <div className="nm">{nm}</div>
                  <div className="pct">{pct}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field-label">
              Hva ønsker du å endre?<span className="req">*</span>
            </label>
            <div
              className="prio-radio"
              style={{ gridTemplateColumns: "1fr 1fr" }}
            >
              {(
                [
                  ["more", "Mer av disiplin", "F.eks: mer SLAG", "prio-2"],
                  ["less", "Mindre av disiplin", "F.eks: kutt TEK", "prio-3"],
                  ["volume", "Endre totalt volum", "Mer/mindre min", "prio-3"],
                  ["other", "Mer spesifikt", "Annet · forklar", "prio-3"],
                ] as const
              ).map(([k, nm, sub, prio]) => (
                <div
                  key={k}
                  className={`prio-opt ${prio}${type === k ? " active" : ""}`}
                  onClick={() => setType(k)}
                >
                  <span className="radio-dot" />
                  <div className="label-stack">
                    <span
                      className="nm"
                      style={k === "more" ? { color: "var(--success)" } : undefined}
                    >
                      {nm}
                    </span>
                    <span className="sub">{sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showDiscField && (
            <div className="field">
              <label className="field-label">Hvilken disiplin?</label>
              <div className="chip-row multi">
                {(["fys", "tek", "slag", "spill", "turn"] as DisciplineKey[]).map(
                  (k) => {
                    const active = disciplines.includes(k);
                    return (
                      <button
                        key={k}
                        type="button"
                        className={`chip${active ? ` active chip-${k}` : ""}`}
                        onClick={() => toggleDisc(k)}
                      >
                        {k.toUpperCase()}
                      </button>
                    );
                  },
                )}
              </div>
              <div className="field-helper">
                SLAG foreslått pga. approach-gap −0,42
              </div>
            </div>
          )}

          <div className="field">
            <label className="field-label" htmlFor="adj-text">
              Begrunnelse<span className="req">*</span>
            </label>
            <textarea
              id="adj-text"
              className="field-input"
              rows={4}
              placeholder="F.eks: Approach-gap er størst — kan vi få inn 2 ekstra approach-økter denne uka?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="field-helper" style={{ color: counterColor }}>
              {text.length} / 320 tegn · minimum 10
            </div>
          </div>

          <div className="field">
            <label className="field-label">
              Hurtigvalg{" "}
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  color: "var(--muted-soft)",
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                (klikk for å fylle inn)
              </span>
            </label>
            <div className="quick-tags">
              {quickTags.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  className="quick-tag"
                  onClick={() => setText(q.text)}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field-label">Hvor mye haster det?</label>
            <div className="urgency-3">
              {(
                [
                  ["normal", "Når det passer", "urg-mute"],
                  ["24h", "Innen 24 t", "urg-warn"],
                  ["today", "I dag", "urg-danger"],
                ] as const
              ).map(([k, lbl, cls]) => (
                <button
                  key={k}
                  type="button"
                  className={`${cls}${urgency === k ? " active" : ""}`}
                  onClick={() => setUrgency(k)}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <InlineError message={error} />
        </div>

        <footer className="modal-footer">
          <div className="left-meta">Sendes som push + e-post til Anders</div>
          <button className="btn-ghost" onClick={onClose} disabled={isPending}>
            Avbryt
          </button>
          <button
            className="btn btn-primary"
            disabled={isPending}
            onClick={() => {
              if (text.trim().length < 10) return;
              setError(null);
              startTransition(async () => {
                // Mandag i inneværende uke som weekStart.
                const today = new Date();
                const day = (today.getDay() + 6) % 7;
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - day);
                weekStart.setHours(0, 0, 0, 0);

                const areaMap: Record<DisciplineKey, "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN"> = {
                  fys: "FYS",
                  tek: "TEK",
                  slag: "SLAG",
                  spill: "SPILL",
                  turn: "TURN",
                };
                const focusAreas = disciplines.length
                  ? disciplines.map((d) => areaMap[d])
                  : ["SLAG" as const];

                const prefix =
                  type === "more"
                    ? "[MER]"
                    : type === "less"
                    ? "[MINDRE]"
                    : type === "volume"
                    ? "[VOLUM]"
                    : "[ANNET]";
                const urgencyTag =
                  urgency === "today" ? "[I DAG]" : urgency === "24h" ? "[24T]" : "[NÅR PASSER]";

                const result = await requestPlanAdjust({
                  weekStart,
                  description: `${prefix} ${urgencyTag}\n${text.trim()}`,
                  focusAreas,
                });
                if ("error" in result) {
                  setError(result.error);
                  return;
                }
                onSubmit("Plan-justering sendt til Anders");
                setText("");
                setType("more");
                setDisciplines(["slag"]);
                setUrgency("normal");
              });
            }}
          >
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              style={{ width: 14, height: 14 }}
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            {isPending ? "Sender…" : "Send forespørsel"}
          </button>
        </footer>
      </div>
    </ModalBackdrop>
  );
}

/* ─── New Goal Modal ───────────────────────────────────────────────── */

export function NewGoalModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (msg: string) => void;
}) {
  const [type, setType] = useState<"resultat" | "prosess" | "streak">("resultat");
  const [prio, setPrio] = useState<1 | 2 | 3>(2);
  const [disciplines, setDisciplines] = useState<DisciplineKey[]>(["slag"]);
  const [title, setTitle] = useState("Top 10 i Bossum Open");
  const [category, setCategory] = useState<"OUTCOME" | "PROCESS">("OUTCOME");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Synkroniser category med type (resultat → OUTCOME, prosess/streak → PROCESS)
  // når brukeren ikke har overstyrt manuelt.
  const computedCategory: "OUTCOME" | "PROCESS" =
    type === "resultat" ? "OUTCOME" : "PROCESS";
  const effectiveCategory = category || computedCategory;

  const toggleDisc = (k: DisciplineKey) =>
    setDisciplines((p) => (p.includes(k) ? p.filter((d) => d !== k) : [...p, k]));

  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <div className="modal new-goal" role="document">
        <header className="modal-header">
          <div>
            <h2>Nytt mål</h2>
            <div className="caption">3 aktive mål · ingen øvre grense</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Lukk">
            <CloseIcon />
          </button>
        </header>

        <div className="modal-body">
          <div className="field">
            <label className="field-label">
              Mål-kategori<span className="req">*</span>
            </label>
            <div className="segmented">
              {(
                [
                  ["OUTCOME", "Outcome — utfall"],
                  ["PROCESS", "Process — atferd"],
                ] as const
              ).map(([k, lbl]) => (
                <button
                  key={k}
                  type="button"
                  className={effectiveCategory === k ? "active" : ""}
                  onClick={() => setCategory(k)}
                >
                  {lbl}
                </button>
              ))}
            </div>
            <div className="field-helper">
              Outcome = resultat (plassering, HCP). Process = vane (snitt, antall dager).
            </div>
          </div>

          <div className="field">
            <label className="field-label">
              Mål-type<span className="req">*</span>
            </label>
            <div className="type-seg">
              {(
                [
                  ["resultat", "Resultat", "Turnering · HCP", "ic-trophy"],
                  ["prosess", "Prosess", "Snitt · vaner", "ic-target"],
                  ["streak", "Streak", "Dager i strekk", "ic-flame"],
                ] as const
              ).map(([k, lbl, sub, icon]) => (
                <button
                  key={k}
                  type="button"
                  className={type === k ? "active" : ""}
                  onClick={() => {
                    setType(k);
                    setCategory(k === "resultat" ? "OUTCOME" : "PROCESS");
                  }}
                >
                  <Icon id={icon} />
                  {lbl}
                  <span className="sub">{sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="goal-title-input">
              Tittel<span className="req">*</span>
            </label>
            <input
              id="goal-title-input"
              className="field-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="field-helper">Auto-foreslått basert på type</div>
          </div>

          {type === "resultat" && (
            <div className="type-pane active">
              <div className="value-row">
                <div className="field">
                  <label className="field-label" htmlFor="goal-pos">
                    Plassering
                  </label>
                  <input
                    id="goal-pos"
                    className="field-input"
                    type="number"
                    min={1}
                    max={200}
                    defaultValue={10}
                  />
                  <div className="field-helper">Topp X i</div>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="goal-tour">
                    Turnering
                  </label>
                  <select id="goal-tour" className="field-input" defaultValue="bossum">
                    <option value="bossum">Bossum Open · 24. jun</option>
                    <option value="sorlands">Sørlandsåpent · 10. jun</option>
                    <option value="nm">NM Slag · 8. jul</option>
                    <option value="trondheim">Trondheim Open · 22. jul</option>
                    <option value="gfgk">GFGK Mesterskap · 5. aug</option>
                  </select>
                  <div className="field-helper">Frist auto-satt: 24. juni 2026</div>
                </div>
              </div>
            </div>
          )}

          {type === "prosess" && (
            <div className="type-pane active">
              <div className="value-row">
                <div className="field">
                  <label className="field-label" htmlFor="goal-prosess-val">
                    Verdi
                  </label>
                  <input
                    id="goal-prosess-val"
                    className="field-input"
                    type="number"
                    step="0.1"
                    defaultValue={72}
                  />
                  <div className="field-helper">Under denne grensen</div>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="goal-metric">
                    Metric
                  </label>
                  <select id="goal-metric" className="field-input">
                    <option>Snitt-score</option>
                    <option>SG-total</option>
                    <option>Fairways treff (%)</option>
                    <option>Putting (snitt putt/runde)</option>
                    <option>Greens in regulation (%)</option>
                  </select>
                  <div className="field-helper">Hva måles?</div>
                </div>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="goal-deadline">
                  Innen
                </label>
                <input
                  id="goal-deadline"
                  className="field-input"
                  type="date"
                  defaultValue="2026-08-31"
                />
                <div className="field-helper">31. aug 2026 · sesongslutt</div>
              </div>
            </div>
          )}

          {type === "streak" && (
            <div className="type-pane active">
              <div className="value-row">
                <div className="field">
                  <label className="field-label" htmlFor="goal-days">
                    Antall dager
                  </label>
                  <input
                    id="goal-days"
                    className="field-input"
                    type="number"
                    min={1}
                    defaultValue={30}
                  />
                  <div className="field-helper">I strekk</div>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="goal-streak-disc">
                    Disiplin
                  </label>
                  <select id="goal-streak-disc" className="field-input">
                    <option>Hvilken som helst</option>
                    <option>FYS</option>
                    <option>TEK</option>
                    <option>SLAG</option>
                    <option>SPILL</option>
                    <option>TURN</option>
                  </select>
                  <div className="field-helper">Hva skal trenes</div>
                </div>
              </div>
            </div>
          )}

          <div className="field">
            <label className="field-label">Prioritet</label>
            <div className="prio-radio">
              {(
                [
                  [1, "PRIO 1", "Hovedmål", "prio-1"],
                  [2, "PRIO 2", "Viktig", "prio-2"],
                  [3, "PRIO 3", "Bonus", "prio-3"],
                ] as const
              ).map(([k, nm, sub, cls]) => (
                <div
                  key={k}
                  className={`prio-opt ${cls}${prio === k ? " active" : ""}`}
                  onClick={() => setPrio(k)}
                >
                  <span className="radio-dot" />
                  <div className="label-stack">
                    <span className="nm">{nm}</span>
                    <span className="sub">{sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field-label">
              Knytt til disiplin{" "}
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  color: "var(--muted-soft)",
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                (valgfritt)
              </span>
            </label>
            <div className="chip-row multi">
              {(["fys", "tek", "slag", "spill", "turn"] as DisciplineKey[]).map(
                (k) => {
                  const active = disciplines.includes(k);
                  return (
                    <button
                      key={k}
                      type="button"
                      className={`chip${active ? ` active chip-${k}` : ""}`}
                      onClick={() => toggleDisc(k)}
                    >
                      {k.toUpperCase()}
                    </button>
                  );
                },
              )}
            </div>
            <div className="field-helper">SLAG foreslått pga. approach-gap</div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="goal-why">
              Hvorfor er dette viktig?{" "}
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  color: "var(--muted-soft)",
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                (valgfritt)
              </span>
            </label>
            <textarea
              id="goal-why"
              className="field-input"
              rows={2}
              placeholder="F.eks: For å komme inn på laget, må jeg slå Hampus."
            />
          </div>

          <InlineError message={error} />
        </div>

        <footer className="modal-footer">
          <div className="left-meta">Synlig for Anders</div>
          <button className="btn-ghost" onClick={onClose} disabled={isPending}>
            Avbryt
          </button>
          <button
            className="btn btn-primary"
            disabled={isPending}
            onClick={() => {
              if (!title.trim()) return;
              setError(null);
              startTransition(async () => {
                const result = await createGoal({
                  title: title.trim(),
                  category: effectiveCategory,
                  type:
                    type === "resultat"
                      ? "turnering"
                      : type === "prosess"
                      ? "prosess"
                      : "streak",
                  description: `Prioritet ${prio}${
                    disciplines.length
                      ? ` · Disipliner: ${disciplines.map((d) => d.toUpperCase()).join(", ")}`
                      : ""
                  }`,
                });
                if ("error" in result) {
                  setError(result.error);
                  return;
                }
                onSubmit("Mål opprettet");
              });
            }}
          >
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              style={{ width: 14, height: 14 }}
            >
              <use href="#ic-plus" />
            </svg>
            {isPending ? "Oppretter…" : "Opprett mål"}
          </button>
        </footer>
      </div>
    </ModalBackdrop>
  );
}

/* ─── Edit Session Modal ───────────────────────────────────────────── */

export function EditSessionModal({
  open,
  onClose,
  onSubmit,
  sessionId,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (msg: string) => void;
  sessionId?: string;
}) {
  const [duration, setDuration] = useState(90);
  const [dirty, setDirty] = useState(false);
  const [title, setTitle] = useState("Iron-progresjon CS70 → CS80");
  const [startAt, setStartAt] = useState("2026-05-21T14:00");
  const [notes, setNotes] = useState("240 reps · CS70→CS80 · Bay 4");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <div className="modal edit-session" role="document">
        <header className="modal-header">
          <div>
            <h2>Endre økt</h2>
            <div className="caption">
              Iron-progresjon CS70 → CS80 · Ons 21. mai 14:00
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Lukk">
            <CloseIcon />
          </button>
        </header>

        <div className="modal-body">
          <div className="field">
            <label className="field-label" htmlFor="edit-title-input">
              Tittel
            </label>
            <input
              id="edit-title-input"
              className="field-input"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setDirty(true);
              }}
            />
          </div>

          <div className="field-grid-2">
            <div className="field">
              <label className="field-label" htmlFor="edit-when">
                Tid
              </label>
              <input
                id="edit-when"
                className="field-input"
                type="datetime-local"
                value={startAt}
                onChange={(e) => {
                  setStartAt(e.target.value);
                  setDirty(true);
                }}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="edit-duration">
                Varighet
              </label>
              <div className="slider-row">
                <input
                  id="edit-duration"
                  type="range"
                  min={15}
                  max={180}
                  step={5}
                  value={duration}
                  onChange={(e) => {
                    setDuration(Number(e.target.value));
                    setDirty(true);
                  }}
                />
                <span className="val">
                  <span>{duration}</span> min
                </span>
              </div>
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="edit-place">
              Sted
            </label>
            <select
              id="edit-place"
              className="field-input"
              defaultValue="GFGK Performance Studio · Bay 4"
              onChange={() => setDirty(true)}
            >
              <option>GFGK Performance Studio · Bay 4</option>
              <option>GFGK Performance Studio · Bay 1</option>
              <option>Bossum range</option>
              <option>Hjemme</option>
              <option>Annet</option>
            </select>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="edit-focus">
              Reps / fokus
            </label>
            <textarea
              id="edit-focus"
              className="field-input"
              rows={3}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setDirty(true);
              }}
            />
          </div>

          <div className="field">
            <label className="field-label">Bytt drill</label>
            <button
              className="btn btn-outline btn-sm"
              style={{ alignSelf: "flex-start" }}
              type="button"
            >
              <Icon id="ic-refresh" />
              Velg annen drill
            </button>
            <div className="field-helper">
              Bytter til en av dine drills eller en coach-tildelt
            </div>
          </div>

          <div className="assigned-card">
            <div className="avatar">AK</div>
            <div className="body">
              <div className="lbl">Tildelt av</div>
              <div className="nm">Anders Kristiansen</div>
            </div>
            <span className="pill pill-tek">TEK</span>
          </div>

          {dirty && (
            <div className="warn-row" style={{ display: "flex" }}>
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <use href="#ic-alert" />
              </svg>
              <span>
                Coach blir varslet om endringen — den er tildelt av Anders.
              </span>
            </div>
          )}

          <InlineError message={error} />
        </div>

        <footer className="modal-footer">
          <button
            className="btn-danger-ghost footer-left"
            type="button"
            disabled={isPending}
            onClick={() => {
              // TODO Sprint 3: dedikert deleteSession-action. For nå viser vi toast.
              onSubmit("Sletting krever bekreftelse — kontakt coach");
              setDirty(false);
            }}
          >
            <Icon id="ic-trash" />
            Slett økt
          </button>
          <button className="btn-ghost" onClick={onClose} disabled={isPending}>
            Avbryt
          </button>
          <button
            className="btn btn-primary"
            disabled={isPending}
            onClick={() => {
              if (!sessionId) {
                setError("Ingen økt valgt — kan ikke lagre");
                return;
              }
              setError(null);
              startTransition(async () => {
                const result = await editSession({
                  sessionId,
                  startAt: startAt ? new Date(startAt) : undefined,
                  durationMin: duration,
                  notes: notes.trim(),
                });
                if ("error" in result) {
                  setError(result.error);
                  return;
                }
                onSubmit("Økt oppdatert");
                setDirty(false);
              });
            }}
          >
            {isPending ? "Lagrer…" : "Lagre endringer"}
          </button>
        </footer>
      </div>
    </ModalBackdrop>
  );
}

/* ─── Discipline drill-down Modal ──────────────────────────────────── */

type DiscData = {
  name: string;
  full: string;
  kind: DisciplineKey;
  actual: number;
  target: number;
  mins: number;
  plannedTotal: number;
  descr: React.ReactNode;
  tags: string[];
  contribs: {
    dt: string;
    ttl: string;
    meta: string;
    badgeCls: string;
    badgeText: string;
    mins: number;
  }[];
};

const DISC_DATA: Record<DisciplineKey, DiscData> = {
  fys: {
    name: "Fys",
    full: "FYS — Fysisk",
    kind: "fys",
    actual: 20,
    target: 20,
    mins: 30,
    plannedTotal: 195,
    descr:
      "FYS = fysisk trening — styrke, mobilitet, kondisjon. Bygger motoren bak alle slag.",
    tags: ["Beinbøy + core", "Mobilitet rotasjon", "Intervall 4×4", "Skulder-prep"],
    contribs: [
      {
        dt: "TIR 20/5",
        ttl: "Beinbøy + core",
        meta: "11:00 — 11:30 · egen-økt",
        badgeCls: "badge badge-success",
        badgeText: "FULLFØRT",
        mins: 30,
      },
    ],
  },
  tek: {
    name: "Tek",
    full: "TEK — Teknikk",
    kind: "tek",
    actual: 32,
    target: 30,
    mins: 150,
    plannedTotal: 195,
    descr: (
      <>
        TEK = teknisk kvalitetstrening med fokus på{" "}
        <em className="italic-accent">kraftutvikling</em>, swing-mekanikk og
        repetisjon. Skal være langsom og gjentakende — ikke spillsimulering.
      </>
    ),
    tags: [
      "Iron-progresjon",
      "Driver grunntrening",
      "Spin-kontroll",
      "CS-progresjon",
    ],
    contribs: [
      {
        dt: "MAN 19/5",
        ttl: "Iron-progresjon CS70 → CS80",
        meta: "14:00 — 15:30 · 240 reps · av Anders",
        badgeCls: "badge badge-success",
        badgeText: "FULLFØRT",
        mins: 90,
      },
      {
        dt: "FRE 23/5",
        ttl: "Driver grunntrening",
        meta: "11:00 — 12:00 · 120 reps · av Anders",
        badgeCls: "badge badge-forest",
        badgeText: "PLANLAGT",
        mins: 60,
      },
    ],
  },
  slag: {
    name: "Slag",
    full: "SLAG — Slag-spesifikk",
    kind: "slag",
    actual: 28,
    target: 30,
    mins: 90,
    plannedTotal: 195,
    descr: (
      <>
        SLAG = slag-spesifikk presisjonstrening — pitch, chip, putting, bunker.{" "}
        <em className="italic-accent">Approach-fokus</em> i denne perioden pga.
        SG-gapet.
      </>
    ),
    tags: ["Pitch 50—100m", "Putting blokk", "Bunker", "Approach 100—150m"],
    contribs: [
      {
        dt: "MAN 19/5",
        ttl: "Pitch 50—100m, lav",
        meta: "09:00 — 10:00 · 184 reps · 71% mål",
        badgeCls: "badge badge-success",
        badgeText: "FULLFØRT",
        mins: 60,
      },
      {
        dt: "ONS 21/5",
        ttl: "Bunker-eskalering",
        meta: "09:00 — 10:30 · 80 reps · selvplanlagt",
        badgeCls: "badge badge-lime",
        badgeText: "SELVPLAN",
        mins: 90,
      },
    ],
  },
  spill: {
    name: "Spill",
    full: "SPILL — Spill-simulering",
    kind: "spill",
    actual: 15,
    target: 15,
    mins: 240,
    plannedTotal: 195,
    descr:
      "SPILL = simulering av ekte runder — strategi, klubbvalg, mental kapasitet. Ekte hull eller 9-hull-simulering.",
    tags: ["9-hulls sim", "Strategi-runde", "Klubbvalg-drill", "Score-runde"],
    contribs: [
      {
        dt: "LØR 24/5",
        ttl: "Bossum Open · Runde 1",
        meta: "09:00 — 13:00 · 18 hull · turnering",
        badgeCls: "badge badge-danger",
        badgeText: "TURNERING",
        mins: 240,
      },
    ],
  },
  turn: {
    name: "Turn",
    full: "TURN — Turnerings-spesifikk",
    kind: "turn",
    actual: 5,
    target: 5,
    mins: 15,
    plannedTotal: 195,
    descr:
      "TURN = turnerings-forberedelse — mental visualisering, ritualer, pre-shot routine.",
    tags: [
      "Mental visualisering",
      "Pre-shot routine",
      "Pust-øvelser",
      "Score-tracking",
    ],
    contribs: [
      {
        dt: "MAN 19/5",
        ttl: "Mental visualisering",
        meta: "16:00 — 16:15 · pre-Sørlands",
        badgeCls: "badge badge-muted",
        badgeText: "FULLFØRT",
        mins: 15,
      },
    ],
  },
};

export function DisciplineModal({
  open,
  onClose,
  disciplineKey,
  onPlanAdjust,
}: {
  open: boolean;
  onClose: () => void;
  disciplineKey: DisciplineKey;
  onPlanAdjust: () => void;
}) {
  const d = DISC_DATA[disciplineKey];
  const diff = d.actual - d.target;
  const diffStr =
    diff === 0 ? "±0 pp" : `${diff > 0 ? "+" : ""}${diff} pp`;

  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <div className="modal disc" role="document">
        <header className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className={`disc-pill-lg kind-${d.kind}`}>
              {disciplineKey.toUpperCase()}
            </span>
            <div>
              <h2>{d.full}</h2>
              <div className="caption">
                Uke 21 · {d.target}% mål · {d.actual}% faktisk · {diffStr}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Lukk">
            <CloseIcon />
          </button>
        </header>

        <div className="modal-body">
          <div className="disc-hero">
            <div>
              <span className="label-mono lbl">Faktisk denne uka</span>
              <div className="num">{d.actual}%</div>
              <div className="sub">av ukens totale treningstid</div>
            </div>
            <div className="right">
              <span className={`diff${diff >= 0 ? " up" : ""}`}>
                {diff > 0 ? "↑ " : diff < 0 ? "↓ " : ""}
                {diffStr} mot mål
              </span>
              <span className="totals">
                {d.mins} min av {d.plannedTotal} min planlagt
              </span>
            </div>
          </div>

          <div className="disc-section">
            <h4>Hva er {disciplineKey.toUpperCase()}?</h4>
            <div className="descr">{d.descr}</div>
            <div className="disc-tags">
              {d.tags.map((t) => (
                <span key={t} className="equip-tag">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="disc-section">
            <h4>Disse øktene bidro denne uka</h4>
            <div>
              {d.contribs.map((c) => (
                <div className="contrib-row" key={c.ttl}>
                  <span className="dt">{c.dt}</span>
                  <div>
                    <div className="ttl">{c.ttl}</div>
                    <div className="meta">{c.meta}</div>
                  </div>
                  <span className={c.badgeCls}>{c.badgeText}</span>
                  <span className="mins">{c.mins} min</span>
                </div>
              ))}
            </div>
            <div
              className="mono"
              style={{
                fontSize: 10.5,
                color: "var(--muted)",
                marginTop: 8,
                letterSpacing: "0.04em",
              }}
            >
              TOTAL: {d.contribs.reduce((s, c) => s + c.mins, 0)} MIN
            </div>
          </div>

          <div className="disc-section">
            <h4>Forslag for å nå mål</h4>
            <div className="rail-card ai-card" style={{ margin: 0 }}>
              <div className="rail-row">
                <div className="rail-icon">
                  <Icon id="ic-plus" />
                </div>
                <div className="body">
                  <div className="ttl">Legg til 30 min driver-økt fredag</div>
                  <div className="meta">
                    Bryter ikke pyramiden · gir +3 pp TEK
                  </div>
                </div>
                <button className="btn btn-xs btn-primary">Bruk</button>
              </div>
              <div className="rail-row">
                <div className="rail-icon">
                  <Icon id="ic-refresh" />
                </div>
                <div className="body">
                  <div className="ttl">Bytt én SLAG-økt mot iron-progresjon</div>
                  <div className="meta">
                    Bossum R1 lørdag har SLAG-overhead
                  </div>
                </div>
                <button className="btn btn-xs btn-primary">Bruk</button>
              </div>
              <div className="rail-row">
                <div className="rail-icon">
                  <Icon id="ic-msg" />
                </div>
                <div className="body">
                  <div className="ttl">Be Anders om mer TEK neste uke</div>
                  <div className="meta">
                    Periodisering for CS80-progresjon
                  </div>
                </div>
                <button
                  className="btn btn-xs btn-primary"
                  onClick={() => {
                    onClose();
                    onPlanAdjust();
                  }}
                >
                  Be om
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>
            Lukk
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onPlanAdjust();
            }}
          >
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              style={{ width: 14, height: 14 }}
            >
              <use href="#ic-msg" />
            </svg>
            Be om mer {disciplineKey.toUpperCase()} fra coach
          </button>
        </footer>
      </div>
    </ModalBackdrop>
  );
}

/* ─── Log Session Wizard Modal ─────────────────────────────────────── */

export function LogSessionModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (msg: string) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [disciplines, setDisciplines] = useState<DisciplineKey[]>(["slag"]);
  const [duration, setDuration] = useState(60);
  const [source, setSource] = useState<"manual" | "trackman">("manual");
  const [rating, setRating] = useState(4);
  const [title, setTitle] = useState("Egen putting-økt");
  const [reps, setReps] = useState(120);
  const [goals, setGoals] = useState<string[]>(["top10", "srixon"]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // Reset to step 1 when modal closes (sync state derived from prop)
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) setStep(1);
  }

  const toggleDisc = (k: DisciplineKey) =>
    setDisciplines((p) => (p.includes(k) ? p.filter((d) => d !== k) : [...p, k]));

  const toggleGoal = (id: string) =>
    setGoals((p) => (p.includes(id) ? p.filter((g) => g !== id) : [...p, id]));

  const stepLabels: Record<1 | 2 | 3, string> = {
    1: "STEG 1 AV 3 · HVA TRENTE DU?",
    2: "STEG 2 AV 3 · HVORDAN GIKK DET?",
    3: "STEG 3 AV 3 · BEKREFT",
  };

  const ratingLabels: Record<number, string> = {
    1: "1 av 5 · måtte avbryte",
    2: "2 av 5 · slet litt",
    3: "3 av 5 · grei økt",
    4: "4 av 5 · solid økt",
    5: "5 av 5 · toppøkt",
  };

  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <div className="modal wizard" role="document">
        <header className="modal-header">
          <div>
            <h2>Logg gjennomført økt</h2>
            <div className="stepper">
              {[1, 2, 3].map((s) => (
                <span
                  key={s}
                  className={`dot${step === s ? " active" : ""}${
                    s < step ? " done" : ""
                  }`}
                />
              ))}
              <span className="step-label">{stepLabels[step]}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Lukk">
            <CloseIcon />
          </button>
        </header>

        <div className="modal-body">
          {step === 1 && (
            <div className="step-view active">
              <div className="field">
                <label className="field-label">
                  Disipliner<span className="req">*</span>
                </label>
                <div className="chip-row multi">
                  {(["tek", "slag", "fys", "spill", "turn"] as DisciplineKey[]).map(
                    (k) => {
                      const active = disciplines.includes(k);
                      return (
                        <button
                          key={k}
                          type="button"
                          className={`chip${active ? ` active chip-${k}` : ""}`}
                          onClick={() => toggleDisc(k)}
                        >
                          {k.toUpperCase()}
                        </button>
                      );
                    },
                  )}
                </div>
                <div className="field-helper">Velg én eller flere</div>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="log-title-input">
                  Tittel
                </label>
                <input
                  id="log-title-input"
                  className="field-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="field-helper">
                  Auto-foreslått basert på disiplin
                </div>
              </div>

              <div className="field-grid-2">
                <div className="field">
                  <label className="field-label" htmlFor="log-duration">
                    Varighet
                  </label>
                  <div className="slider-row">
                    <input
                      id="log-duration"
                      type="range"
                      min={15}
                      max={180}
                      step={5}
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                    />
                    <span className="val">
                      <span>{duration}</span> min
                    </span>
                  </div>
                  <div className="field-helper">15 — 180 min</div>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="log-place">
                    Sted
                  </label>
                  <select id="log-place" className="field-input">
                    <option>GFGK Performance Studio</option>
                    <option>Bossum</option>
                    <option>Hjemme</option>
                    <option>Range</option>
                    <option>Annet</option>
                  </select>
                  <div className="field-helper">Hvor trente du?</div>
                </div>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="log-when">
                  Dato/tid
                </label>
                <input
                  id="log-when"
                  className="field-input"
                  type="datetime-local"
                  defaultValue="2026-05-19T16:30"
                />
                <div className="field-helper">I dag, 16:30</div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-view active">
              <div className="field">
                <label className="field-label">Type registrering</label>
                <div className="toggle-2">
                  <button
                    type="button"
                    className={source === "manual" ? "active" : ""}
                    onClick={() => setSource("manual")}
                  >
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Manuelt
                  </button>
                  <button
                    type="button"
                    className={source === "trackman" ? "active" : ""}
                    onClick={() => setSource("trackman")}
                  >
                    <Icon id="ic-import" />
                    TrackMan-import
                  </button>
                </div>
              </div>

              {source === "manual" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div className="field-grid-2">
                    <div className="field">
                      <label className="field-label" htmlFor="log-reps">
                        Antall reps
                      </label>
                      <input
                        id="log-reps"
                        className="field-input"
                        type="number"
                        min={0}
                        value={reps}
                        onChange={(e) => setReps(Number(e.target.value))}
                      />
                      <div className="field-helper">Slag, ball-treff, sets</div>
                    </div>
                    <div className="field">
                      <label className="field-label">Hvor godt?</label>
                      <div className="star-row">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <button
                            key={r}
                            type="button"
                            className={`star-btn${r <= rating ? " on" : ""}`}
                            onClick={() => setRating(r)}
                          >
                            <svg viewBox="0 0 24 24">
                              <use href="#ic-star" />
                            </svg>
                          </button>
                        ))}
                      </div>
                      <div className="field-helper">{ratingLabels[rating]}</div>
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="log-note">
                      Notat
                    </label>
                    <textarea
                      id="log-note"
                      className="field-input"
                      rows={4}
                      placeholder="Hva fungerte? Hva må følges opp?"
                    />
                  </div>
                </div>
              )}

              {source === "trackman" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="context-card">
                    <Icon id="ic-import" />
                    <div className="ctx-body">
                      <strong>Importer fra TrackMan Pro.</strong>
                      Reps, club-speed, smash, spinn og dispersjon hentes automatisk.
                    </div>
                  </div>
                  <button
                    className="btn btn-forest"
                    style={{ alignSelf: "flex-start" }}
                    type="button"
                  >
                    <Icon id="ic-import" />
                    Åpne TrackMan-import
                  </button>
                </div>
              )}

              <div className="field">
                <label className="field-label" htmlFor="log-drill">
                  Koble til drill{" "}
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 400,
                      color: "var(--muted-soft)",
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    (valgfritt)
                  </span>
                </label>
                <select id="log-drill" className="field-input">
                  <option value="">— Ingen drill —</option>
                  <optgroup label="Tildelt av Anders">
                    <option>Pitch 50—100m, lav trajectory</option>
                    <option>Iron-progresjon CS70→CS80</option>
                    <option>Driver grunntrening</option>
                  </optgroup>
                  <optgroup label="Favoritter">
                    <option>Putting 0—3m blokk</option>
                    <option>Bunker-eskalering</option>
                  </optgroup>
                </select>
              </div>

              <div className="field">
                <label className="field-label">
                  Koble til mål{" "}
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 400,
                      color: "var(--muted-soft)",
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    (valgfritt)
                  </span>
                </label>
                <div className="goal-checks">
                  {(
                    [
                      ["top10", "Top 10 NM Slag", "Resultatmål · 50 dager"],
                      ["srixon", "Snitt under 72 på Srixon", "Prosessmål · ukentlig"],
                      ["hcp", "HCP under +2,0", "Sesongmål · 82 dager igjen"],
                    ] as const
                  ).map(([id, ttl, meta]) => {
                    const checked = goals.includes(id);
                    return (
                      <div
                        key={id}
                        className={`goal-check${checked ? " checked" : ""}`}
                        onClick={() => toggleGoal(id)}
                      >
                        <span className="box">
                          <svg
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                          >
                            <use href="#ic-check" />
                          </svg>
                        </span>
                        <div className="body">
                          <div className="ttl">{ttl}</div>
                          <div className="meta">{meta}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-view active">
              <div className="summary-card">
                <div className="duration-hero">
                  <span className="big">{duration}</span>
                  <span className="unit">min</span>
                  <div className="right">
                    <div className="lbl">Dato</div>
                    <div className="val">I dag · 16:30</div>
                  </div>
                </div>
                <div className="summary-row">
                  <span className="k">Tittel</span>
                  <span className="v">{title || "—"}</span>
                </div>
                <div className="summary-row">
                  <span className="k">Disipliner</span>
                  <span className="v">
                    {disciplines.length
                      ? disciplines.map((d) => d.toUpperCase()).join(" · ")
                      : "—"}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="k">Sted</span>
                  <span className="v">GFGK Performance Studio</span>
                </div>
                <div className="summary-row">
                  <span className="k">Reps</span>
                  <span className="v">{source === "trackman" ? "Hentes fra TrackMan" : reps}</span>
                </div>
                <div className="summary-row">
                  <span className="k">Vurdering</span>
                  <span className="v">
                    {source === "trackman" ? "—" : `${rating} av 5`}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="k">Mål-kobling</span>
                  <span className="v">
                    {goals.length
                      ? goals
                          .map(
                            (g) =>
                              ({
                                top10: "Top 10 NM Slag",
                                srixon: "Snitt < 72",
                                hcp: "HCP +2,0",
                              })[g] ?? g,
                          )
                          .join(" · ")
                      : "—"}
                  </span>
                </div>
              </div>

              <div className="impact-card">
                <div className="head">
                  <span className="ttl">Pyramide-impact denne uka</span>
                  <span className="sub">+12 % SLAG · Uke 21</span>
                </div>
                <div>
                  {(
                    [
                      ["FYS", "var(--fys)", 20, 0],
                      ["TEK", "var(--tek)", 32, 0],
                      ["SLAG", "var(--slag)", 28, 12],
                      ["SPILL", "var(--spill)", 15, 0],
                      ["TURN", "#C8B72A", 5, 0],
                    ] as const
                  ).map(([nm, bg, before, delta]) => (
                    <div className="impact-bar-row" key={nm}>
                      <span className="label">{nm}</span>
                      <div className="bar">
                        <div
                          className="before"
                          style={{ background: bg, width: `${before}%` }}
                        />
                        {delta > 0 && (
                          <div
                            className="add"
                            style={{ left: `${before}%`, width: `${delta}%` }}
                          />
                        )}
                      </div>
                      <span className={`delta${delta > 0 ? " up" : " flat"}`}>
                        {delta > 0 ? `+${delta} % ↑` : `${before} % →`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <InlineError message={error} />
            </div>
          )}
        </div>

        <footer className="modal-footer">
          <button
            className="btn-ghost"
            type="button"
            disabled={isPending}
            style={{ visibility: step === 1 ? "hidden" : undefined }}
            onClick={() => setStep((step - 1) as 1 | 2 | 3)}
          >
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              style={{
                width: 14,
                height: 14,
                display: "inline-block",
                verticalAlign: -2,
                marginRight: 4,
              }}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Forrige
          </button>
          <button className="btn-ghost" onClick={onClose}>
            Avbryt
          </button>
          <button
            className="btn btn-primary"
            disabled={isPending}
            onClick={() => {
              if (step < 3) {
                setStep((step + 1) as 1 | 2 | 3);
                return;
              }
              setError(null);
              const areaMap: Record<DisciplineKey, "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN"> = {
                fys: "FYS",
                tek: "TEK",
                slag: "SLAG",
                spill: "SPILL",
                turn: "TURN",
              };
              const primaryArea = disciplines[0] ? areaMap[disciplines[0]] : "SLAG";
              startTransition(async () => {
                const result = await logSession({
                  date: new Date(),
                  drillName: title.trim() || "Egen-logget økt",
                  pyramidArea: primaryArea,
                  durationMin: duration,
                  sets:
                    source === "manual" && reps > 0
                      ? [{ setNumber: 1, reps }]
                      : [],
                  notes: `Vurdering ${rating}/5${
                    goals.length ? ` · Mål: ${goals.join(", ")}` : ""
                  }`,
                });
                if ("error" in result) {
                  setError(result.error);
                  return;
                }
                onSubmit("Økt logget — pyramide oppdatert");
              });
            }}
          >
            <span>{step === 3 ? (isPending ? "Logger…" : "Logg økt") : "Neste"}</span>
            {step !== 3 && (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                style={{ width: 14, height: 14 }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
          </button>
        </footer>
      </div>
    </ModalBackdrop>
  );
}

/* ─── TrackMan Import Wizard ───────────────────────────────────────── */

type TmSession = {
  id: number;
  date: string;
  ttl: string;
  metrics: string;
  pill: "tek" | "slag";
};

const TM_SESSIONS: TmSession[] = [
  { id: 1, date: "18. MAI", ttl: "Driver-økt", metrics: "CS 113 mph · Smash 1,49 · 84 reps", pill: "tek" },
  { id: 2, date: "16. MAI", ttl: "Iron 7", metrics: "Carry 160 m · Spinn 6 920 rpm · 96 reps", pill: "tek" },
  { id: 3, date: "14. MAI", ttl: "Pitch 50—100m", metrics: "Landing ±2,8 m · 156 reps · 74% mål", pill: "slag" },
  { id: 4, date: "11. MAI", ttl: "Putting blokk", metrics: "0—3m 89% · 3—6m 55% · 80 putts", pill: "slag" },
  { id: 5, date: "9. MAI", ttl: "Iron 8 · approach", metrics: "Carry 142 m · Dispersjon ±5,2 m · 64 reps", pill: "tek" },
  { id: 6, date: "8. MAI", ttl: "Wedge 60° spinn-test", metrics: "Spinn 9 800 rpm · Apex 22 m · 40 reps", pill: "slag" },
  { id: 7, date: "6. MAI", ttl: "Driver-økt", metrics: "CS 111 mph · Smash 1,46 · 72 reps", pill: "tek" },
  { id: 8, date: "4. MAI", ttl: "Iron 5 · low-trajectory", metrics: "Carry 188 m · Apex 18 m · 48 reps", pill: "tek" },
  { id: 9, date: "2. MAI", ttl: "Pitch fra rough", metrics: "Spinn 8 200 rpm · Landing ±3,5 m · 60 reps", pill: "slag" },
  { id: 10, date: "30. APR", ttl: "Putting 3—6m", metrics: "52% · snitt 0,42m fra hull · 120 putts", pill: "slag" },
];

export function TrackManImportModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (msg: string) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [source, setSource] = useState<"account" | "csv">("account");
  const [checked, setChecked] = useState<number[]>([1, 2, 3, 4, 5]);
  const [replaceManual, setReplaceManual] = useState(false);
  const [goalChips, setGoalChips] = useState<string[]>(["top10"]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setStep(1);
      setChecked([1, 2, 3, 4, 5]);
    }
  }

  const toggleId = (id: number) =>
    setChecked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const toggleGoal = (id: string) =>
    setGoalChips((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const stepLabels: Record<1 | 2 | 3, string> = {
    1: "STEG 1 AV 3 · VELG KILDE",
    2: "STEG 2 AV 3 · MAP DATA",
    3: "STEG 3 AV 3 · BEKREFT",
  };

  const summaryItems = TM_SESSIONS.filter((s) => checked.includes(s.id));

  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <div className="modal tm-import" role="document">
        <header className="modal-header">
          <div>
            <h2>Importer TrackMan-økt</h2>
            <div className="stepper">
              {[1, 2, 3].map((s) => (
                <span
                  key={s}
                  className={`dot${step === s ? " active" : ""}${
                    s < step ? " done" : ""
                  }`}
                />
              ))}
              <span className="step-label">{stepLabels[step]}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Lukk">
            <CloseIcon />
          </button>
        </header>

        <div className="modal-body">
          {step === 1 && (
            <div className="step-view active">
              <div className="source-cards">
                <div
                  className={`source-card${source === "account" ? " active" : ""}`}
                  onClick={() => setSource("account")}
                >
                  <span className="radio-mark" />
                  <div className="icon-wrap">
                    <span className="tm-mono">TM</span>
                  </div>
                  <div>
                    <div className="ttl">TrackMan-konto</div>
                    <div className="sub">Hent siste 10 økter automatisk</div>
                  </div>
                  <span className="status-pill connected">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <use href="#ic-check" />
                    </svg>
                    Tilkoblet
                  </span>
                </div>

                <div
                  className={`source-card${source === "csv" ? " active" : ""}`}
                  onClick={() => setSource("csv")}
                >
                  <span className="radio-mark" />
                  <div className="icon-wrap">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div>
                    <div className="ttl">CSV-fil</div>
                    <div className="sub">
                      Last opp .csv eksportert fra TrackMan Pro
                    </div>
                  </div>
                  <div className="dropzone">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Dra .csv hit eller klikk for å velge
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-view active">
              {source === "account" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        10 nye økter funnet
                      </div>
                      <div
                        className="mono"
                        style={{
                          fontSize: 10,
                          color: "var(--muted)",
                          letterSpacing: "0.06em",
                          marginTop: 2,
                        }}
                      >
                        VELG HVILKE SOM SKAL IMPORTERES
                      </div>
                    </div>
                    <div className="row-flex">
                      <button
                        className="btn btn-outline btn-xs"
                        type="button"
                        onClick={() => setChecked(TM_SESSIONS.map((s) => s.id))}
                      >
                        Velg alle
                      </button>
                      <button
                        className="btn btn-outline btn-xs"
                        type="button"
                        onClick={() => setChecked([])}
                      >
                        Fjern alle
                      </button>
                    </div>
                  </div>
                  <div className="sessions-list">
                    {TM_SESSIONS.map((s) => {
                      const isChecked = checked.includes(s.id);
                      return (
                        <div
                          key={s.id}
                          className={`session-row${isChecked ? " checked" : ""}`}
                          onClick={() => toggleId(s.id)}
                        >
                          <span className="chk">
                            <svg
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              viewBox="0 0 24 24"
                            >
                              <use href="#ic-check" />
                            </svg>
                          </span>
                          <span className="date">{s.date}</span>
                          <div className="body">
                            <span className="ttl">{s.ttl}</span>
                            <span className="metrics">{s.metrics}</span>
                          </div>
                          <span className={`pill pill-${s.pill}`}>
                            {s.pill.toUpperCase()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {source === "csv" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="preview-table-wrap">
                    <table className="preview-table">
                      <thead>
                        <tr>
                          <th>Dato</th>
                          <th>Klubb</th>
                          <th>CS</th>
                          <th>Smash</th>
                          <th>Carry</th>
                          <th>Spinn</th>
                          <th>Apex</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td>18.05.26</td><td>Driver</td><td>113</td><td>1,49</td><td>251 m</td><td>2 240</td><td>34 m</td></tr>
                        <tr><td>18.05.26</td><td>Driver</td><td>112</td><td>1,48</td><td>248 m</td><td>2 310</td><td>33 m</td></tr>
                        <tr><td>18.05.26</td><td>Driver</td><td>113</td><td>1,49</td><td>252 m</td><td>2 180</td><td>34 m</td></tr>
                        <tr><td>16.05.26</td><td>Iron 7</td><td>74</td><td>1,42</td><td>158 m</td><td>6 820</td><td>27 m</td></tr>
                        <tr><td>16.05.26</td><td>Iron 7</td><td>75</td><td>1,43</td><td>160 m</td><td>6 920</td><td>28 m</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: "var(--muted-soft)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Viser 5 av 184 rader i csv-filen
                  </div>
                </div>
              )}

              <div className="field" style={{ marginTop: 18 }}>
                <label className="field-label">Mapping</label>
              </div>
              <div className="field-grid-2">
                <div className="field">
                  <label className="field-label" htmlFor="tm-discipline">
                    Disiplin (auto)
                  </label>
                  <select id="tm-discipline" className="field-input">
                    <option>Auto-detekter fra klubb-data</option>
                    <option>TEK</option>
                    <option>SLAG</option>
                  </select>
                  <div className="field-helper">
                    Driver/Iron → TEK, wedge/putting → SLAG
                  </div>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="tm-drill">
                    Koble til drill
                  </label>
                  <select id="tm-drill" className="field-input">
                    <option value="">— Ingen drill —</option>
                    <option>Iron-progresjon CS70→CS80</option>
                    <option>Driver grunntrening</option>
                    <option>Putting 0—3m blokk</option>
                    <option>Pitch 50—100m, lav</option>
                  </select>
                  <div className="field-helper">Valgfritt</div>
                </div>
              </div>

              <div className="field">
                <label className="field-label">
                  Koble til mål{" "}
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 400,
                      color: "var(--muted-soft)",
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    (valgfritt)
                  </span>
                </label>
                <div className="chip-row multi">
                  {(
                    [
                      ["top10", "Top 10 NM", "slag"],
                      ["srixon", "Snitt < 72", "tek"],
                      ["hcp", "HCP +2,0", "fys"],
                    ] as const
                  ).map(([id, lbl, kind]) => {
                    const active = goalChips.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        className={`chip${active ? ` active chip-${kind}` : ""}`}
                        onClick={() => toggleGoal(id)}
                      >
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="tm-note">
                  Notat
                </label>
                <textarea
                  id="tm-note"
                  className="field-input"
                  rows={2}
                  placeholder="F.eks: Driver-økt på Bossum range, vind sør 4 m/s."
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-view active">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 4,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 15,
                      fontWeight: 600,
                    }}
                  >
                    Klare til import
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: "var(--muted)",
                      marginTop: 2,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {summaryItems.length} ØKTER · 524 REPS · TOTAL 6 T 20 MIN
                  </div>
                </div>
                <span className="badge badge-success">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <use href="#ic-check" />
                  </svg>
                  VALIDERT
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  maxHeight: 280,
                  overflowY: "auto",
                  paddingRight: 4,
                }}
              >
                {summaryItems.map((s) => (
                  <div className="import-summary-card" key={s.id}>
                    <span className="date">{s.date}</span>
                    <div>
                      <div className="ttl">{s.ttl}</div>
                      <div className="metrics">{s.metrics}</div>
                    </div>
                    <span className={`pill pill-${s.pill}`}>
                      {s.pill.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="toggle-row">
                <div className="body">
                  <div className="ttl">
                    Erstatt manuelt-loggede økter med samme dato
                  </div>
                  <div className="meta">
                    2 manuelle økter på 14. mai og 18. mai vil bli overskrevet
                  </div>
                </div>
                <button
                  type="button"
                  className={`toggle-switch${replaceManual ? " on" : ""}`}
                  aria-pressed={replaceManual}
                  onClick={() => setReplaceManual((p) => !p)}
                />
              </div>

              <InlineError message={error} />
            </div>
          )}
        </div>

        <footer className="modal-footer">
          <button
            className="btn-ghost"
            type="button"
            disabled={isPending}
            style={{ visibility: step === 1 ? "hidden" : undefined }}
            onClick={() => setStep((step - 1) as 1 | 2 | 3)}
          >
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              style={{
                width: 14,
                height: 14,
                display: "inline-block",
                verticalAlign: -2,
                marginRight: 4,
              }}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Forrige
          </button>
          <button className="btn-ghost" onClick={onClose} disabled={isPending}>
            Avbryt
          </button>
          <button
            className="btn btn-primary"
            disabled={isPending}
            onClick={() => {
              if (step < 3) {
                if (step === 2 && checked.length === 0) {
                  onSubmit("Velg minst én økt");
                  return;
                }
                setStep((step + 1) as 1 | 2 | 3);
                return;
              }
              setError(null);
              const monthMap: Record<string, number> = {
                JAN: 0, FEB: 1, MAR: 2, APR: 3, MAI: 4, JUN: 5,
                JUL: 6, AUG: 7, SEP: 8, OKT: 9, NOV: 10, DES: 11,
              };
              const sessions = TM_SESSIONS.filter((s) => checked.includes(s.id)).map(
                (s) => {
                  // s.date er "18. MAI" → bygg dato i inneværende år.
                  const [dayStr, monStr] = s.date.split(" ");
                  const day = Number(dayStr.replace(".", ""));
                  const mon = monthMap[monStr] ?? 0;
                  const year = new Date().getFullYear();
                  const recordedAt = new Date(year, mon, day, 12, 0, 0);
                  const repsMatch = s.metrics.match(/(\d+)\s*(?:reps|putts)/i);
                  return {
                    recordedAt,
                    shotCount: repsMatch ? Number(repsMatch[1]) : 0,
                    environment: "RANGE_OUTDOOR_MAT" as const,
                  };
                },
              );
              startTransition(async () => {
                const result = await importTrackMan({
                  source: source === "csv" ? "csv" : "trackman_account",
                  sessions,
                });
                if ("error" in result) {
                  setError(result.error);
                  return;
                }
                onSubmit(
                  `${result.data?.count ?? checked.length} TrackMan-økter importert`,
                );
              });
            }}
          >
            <span>
              {step === 3
                ? isPending
                  ? "Importerer…"
                  : `Importer ${checked.length} økter`
                : "Neste"}
            </span>
            {step !== 3 && (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                style={{ width: 14, height: 14 }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
          </button>
        </footer>
      </div>
    </ModalBackdrop>
  );
}

/* ─── Notifications Popover ────────────────────────────────────────── */

type Notif = {
  id: number;
  type: "coach" | "plan" | "goal" | "tour";
  kind: "coach" | "drill" | "tour" | "streak" | "plan" | "goal";
  who?: string;
  icon?: string;
  eyebrow: string;
  ttl: string;
  snippet: string;
  unread: boolean;
};

const INITIAL_NOTIFS: Notif[] = [
  { id: 1, type: "coach", kind: "coach", who: "AK", eyebrow: "COACH-MELDING · 2 T SIDEN", ttl: "Anders sendte deg en melding", snippet: "\"Du har vært jevn denne uka, Markus. Hold trykket inn mot Sørlandsåpent.\"", unread: true },
  { id: 2, type: "coach", kind: "drill", icon: "ic-target", eyebrow: "NY DRILL · 5 T SIDEN", ttl: "Ny drill tildelt: Bunker-eskalering", snippet: "SLAG · 80 reps · planlagt Tir 20. mai 09:00. Tildelt av Anders.", unread: true },
  { id: 3, type: "tour", kind: "tour", icon: "ic-flag", eyebrow: "TURNERING · 1 D SIDEN", ttl: "Sørlandsåpent om 21 dager", snippet: "Klar for å bygge form? Du har 12 økter på planen som peker mot dette hovedmålet.", unread: true },
  { id: 4, type: "goal", kind: "streak", icon: "ic-flame", eyebrow: "STREAK · 1 D SIDEN", ttl: "Du nådde 11 av 14 dagers streak", snippet: "Lengste streak hittil: 23 dager. Hold gang i FYS på torsdag for å fortsette.", unread: false },
  { id: 5, type: "plan", kind: "plan", icon: "ic-sparkles", eyebrow: "PLAN-JUSTERING · 3 D SIDEN", ttl: "Plan-justering godkjent", snippet: "Anders la til 2 approach-økter denne uka. Begge er nå synlige i kalenderen.", unread: false },
  { id: 6, type: "goal", kind: "goal", icon: "ic-up", eyebrow: "MÅL-FREMGANG · 4 D SIDEN", ttl: "HCP-mål nådde 60% fremgang", snippet: "Du har forbedret deg +0,3 slag siste 30 dager. Sesongmål: under +2,0.", unread: false },
];

export function NotificationsPopover({
  open,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClose: _onClose,
  anchorRect,
  onToast,
}: {
  open: boolean;
  onClose: () => void;
  anchorRect: DOMRect | null;
  onToast: (msg: string) => void;
}) {
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS);
  const [filter, setFilter] = useState<"all" | Notif["type"]>("all");

  const unread = notifs.filter((n) => n.unread).length;
  const filtered = filter === "all" ? notifs : notifs.filter((n) => n.type === filter);

  let left = 16;
  let top = 70;
  if (anchorRect) {
    left = Math.max(16, anchorRect.right - 380);
    top = anchorRect.bottom + 8;
  }

  return (
    <div
      className={`notif-pop${open ? " open" : ""}`}
      role="dialog"
      aria-label="Varsler"
      style={{ left, top }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="notif-head">
        <div>
          <span className="ttl">Varsler</span>
          <span className="unread">
            {unread === 0 ? "ALLE LEST" : `${unread} ULESTE`}
          </span>
        </div>
        <button
          className="notif-mark-read"
          onClick={() => setNotifs((p) => p.map((n) => ({ ...n, unread: false })))}
        >
          Merk alle som lest
        </button>
      </div>
      <div className="notif-tabs">
        {(
          [
            ["all", "Alle"],
            ["coach", "Coach"],
            ["plan", "Plan"],
            ["goal", "Mål"],
            ["tour", "Turnering"],
          ] as const
        ).map(([k, lbl]) => (
          <button
            key={k}
            className={`notif-tab${filter === k ? " active" : ""}`}
            onClick={() => setFilter(k)}
          >
            {lbl}
          </button>
        ))}
      </div>
      <div className="notif-list">
        {filtered.map((n) => (
          <div
            key={n.id}
            className={`notif-row${n.unread ? " unread" : ""}`}
            onClick={() => {
              setNotifs((p) =>
                p.map((x) => (x.id === n.id ? { ...x, unread: false } : x)),
              );
              onToast("Varsel åpnet");
            }}
          >
            {n.kind === "coach" ? (
              <div
                className="avatar"
                style={{ background: "var(--primary)", color: "var(--accent)" }}
              >
                {n.who}
              </div>
            ) : (
              <div className={`ic-wrap ${n.kind}`}>
                <Icon id={n.icon ?? "ic-bell"} />
              </div>
            )}
            <div className="body">
              <div className="eyebrow">{n.eyebrow}</div>
              <div className="ttl">{n.ttl}</div>
              <div className="snippet">{n.snippet}</div>
            </div>
            <span className="dot" />
          </div>
        ))}
      </div>
      <div className="notif-foot">
        <a href="#" onClick={(e) => e.preventDefault()}>
          Se alle varsler →
        </a>
      </div>
    </div>
  );
}

/* ─── Messages Drawer ──────────────────────────────────────────────── */

type ChatMsg =
  | { kind: "sep"; text: string }
  | { kind: "system"; text: string }
  | { kind: "me" | "them"; text: string; ts?: string; unread?: boolean };

type Thread = {
  id: string;
  nm: string;
  role: string;
  avatar: string;
  avatarStyle: React.CSSProperties;
  snip: string;
  ts: string;
  unread: boolean;
  messages: ChatMsg[];
};

const INITIAL_THREADS: Thread[] = [
  {
    id: "anders",
    nm: "Anders Kristiansen",
    role: "HEAD COACH · sist sett for 5 min siden",
    avatar: "AK",
    avatarStyle: { background: "var(--primary)", color: "var(--accent)" },
    snip:
      "\"Du har vært jevn denne uka, Markus. Hold trykket inn mot Sørlandsåpent.\"",
    ts: "2 t siden",
    unread: true,
    messages: [
      { kind: "sep", text: "Søndag 17. mai" },
      { kind: "them", text: "Hei Markus, jeg har satt opp iron-progresjon og driver-grunntrening denne uka.", ts: "17/5 · 14:22" },
      { kind: "me", text: "Takk! Approach-data ser dårlig ut — kan vi få inn noe der?", ts: "17/5 · 15:01" },
      { kind: "them", text: "Helt enig. Jeg ser approach −0,42 SG mot kategori-snitt. Legger inn pitch 50—100m i tillegg.", ts: "17/5 · 15:14" },
      { kind: "sep", text: "Mandag 18. mai" },
      { kind: "me", text: "Bra. Hva med Sørlandsåpent — er Bossum-banen lik Mandal?", ts: "18/5 · 09:42" },
      { kind: "them", text: "Begge er park-links med smale fairways. Bossum har litt færre par-3-utfordringer, men forhøyede greener — så approach-fokus passer perfekt.", ts: "18/5 · 11:10" },
      { kind: "sep", text: "I dag" },
      { kind: "them", text: "Du har vært jevn denne uka, Markus. Hold trykket inn mot Sørlandsåpent.", ts: "14:32", unread: true },
    ],
  },
  {
    id: "hub",
    nm: "AK Golf Hub",
    role: "SYSTEM",
    avatar: "AK",
    avatarStyle: { background: "rgba(0,88,64,0.13)", color: "var(--primary)" },
    snip: "Velkommen til Spesialisering-perioden. Du har 6 uker fokus på CS70→CS80.",
    ts: "5 d siden",
    unread: false,
    messages: [
      { kind: "sep", text: "Søndag 12. mai" },
      { kind: "system", text: "Du startet en ny periode: Spesialisering, uke 17—22. Fokus: CS70 → CS80." },
      { kind: "them", text: "Velkommen til Spesialisering-perioden. Du har 6 uker fokus på CS70→CS80. Bygg på iron-grunntreningen.", ts: "12/5 · 06:00" },
    ],
  },
];

export function MessagesDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setActiveId(null);
      setInput("");
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const active = threads.find((t) => t.id === activeId) ?? null;

  const send = () => {
    if (!active || !input.trim()) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    setThreads((prev) =>
      prev.map((t) =>
        t.id === active.id
          ? {
              ...t,
              messages: [
                ...t.messages,
                { kind: "me", text: input, ts: `${hh}:${mm}` },
              ],
            }
          : t,
      ),
    );
    setInput("");
  };

  return (
    <>
      <div
        className={`drawer-backdrop${open ? " open" : ""}`}
        onClick={onClose}
      />
      <aside
        className={`msg-drawer${open ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Meldinger"
      >
        <header className="msg-drawer-head">
          {!active ? (
            <>
              <div className="title-only">Meldinger</div>
              <button className="back-btn" onClick={onClose} aria-label="Lukk">
                <CloseIcon />
              </button>
            </>
          ) : (
            <>
              <button
                className="back-btn"
                onClick={() => setActiveId(null)}
                aria-label="Tilbake"
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <div className="who">
                <div className="avatar" style={active.avatarStyle}>
                  {active.avatar}
                </div>
                <div>
                  <div className="nm">{active.nm}</div>
                  <div className="role">{active.role}</div>
                </div>
              </div>
              <button className="back-btn" onClick={onClose} aria-label="Lukk">
                <CloseIcon />
              </button>
            </>
          )}
        </header>

        {!active && (
          <div className="thread-list">
            {threads.map((t) => (
              <div
                key={t.id}
                className={`thread-row${t.unread ? " unread" : ""}`}
                onClick={() => {
                  setThreads((prev) =>
                    prev.map((x) => (x.id === t.id ? { ...x, unread: false } : x)),
                  );
                  setActiveId(t.id);
                }}
              >
                <div className="avatar" style={t.avatarStyle}>
                  {t.avatar}
                </div>
                <div className="body">
                  <div className="nm">{t.nm}</div>
                  <div className="role">{t.role}</div>
                  <div className="snip">{t.snip}</div>
                </div>
                <div className="meta">
                  <span className="ts">{t.ts}</span>
                  <span className="lime-dot" />
                </div>
              </div>
            ))}
          </div>
        )}

        {active && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div className="chat-stream">
              {active.messages.map((m, i) => {
                if (m.kind === "sep")
                  return (
                    <div className="day-separator" key={i}>
                      {m.text}
                    </div>
                  );
                if (m.kind === "system")
                  return (
                    <div className="msg-system" key={i}>
                      {m.text}
                    </div>
                  );
                const mine = m.kind === "me";
                return (
                  <div
                    key={i}
                    className={`msg-row${mine ? " mine" : ""}`}
                  >
                    {!mine && (
                      <div className="avatar" style={active.avatarStyle}>
                        {active.avatar}
                      </div>
                    )}
                    <div>
                      <div className="msg-bubble">{m.text}</div>
                      <div className="ts">{m.ts || ""}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="quick-replies">
              {[
                "Ja, høres bra ut!",
                "Kan vi flytte til torsdag?",
                "Takk!",
              ].map((q) => (
                <button
                  key={q}
                  className="qr-pill"
                  onClick={() => setInput(q)}
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="msg-input-wrap">
              <div className="msg-input-row">
                <button className="msg-attach" aria-label="Vedlegg">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>
                <textarea
                  className="msg-input"
                  rows={1}
                  placeholder="Skriv en melding til Anders…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                />
                <button className="msg-send" onClick={send} aria-label="Send">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <span className="msg-input-hint">
                Trykk Enter for å sende · Shift + Enter for ny linje
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

/* ─── Empty-slot popover ───────────────────────────────────────────── */

export function EmptySlotPopover({
  open,
  label,
  position,
  onClose,
  onToast,
  onAskCoach,
}: {
  open: boolean;
  label: string;
  position: { left: number; top: number } | null;
  onClose: () => void;
  onToast: (msg: string) => void;
  onAskCoach: () => void;
}) {
  const [aiResult, setAiResult] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setAiResult("");
      setShowResult(false);
      setShowActions(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const aiText =
    "Forslag: Approach 100—150m blokk · 60 min · SLAG-pill. Møter direkte ditt prio-1-gap (−0,42 SG).";

  const runAI = () => {
    setShowResult(true);
    setShowActions(false);
    setAiResult("");
    let i = 0;
    const tick = () => {
      if (i < aiText.length) {
        setAiResult(aiText.slice(0, i + 1));
        i++;
        setTimeout(tick, 18);
      } else {
        setShowActions(true);
      }
    };
    tick();
  };

  if (!open || !position) return null;

  return (
    <div
      className="slot-pop"
      style={{ display: "block", left: position.left, top: position.top }}
      role="dialog"
      aria-label="Tomt tidspunkt"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="slot-pop-head">
        <span className="lbl">{label}</span>
        <button
          className="slot-pop-close"
          onClick={onClose}
          aria-label="Lukk"
        >
          <CloseIcon />
        </button>
      </div>
      <div className="slot-pop-list">
        <button
          className="slot-action"
          onClick={() => {
            onClose();
            onToast("Åpner ny økt …");
          }}
        >
          <Icon id="ic-plus" className="ic-left" />
          <span className="text">Legg inn ny økt</span>
          <svg
            className="chev"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <button className="slot-action" onClick={runAI}>
          <Icon id="ic-sparkles" className="ic-left" />
          <span className="text">AI-foreslå 1 økt her</span>
          <svg
            className="chev"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <button
          className="slot-action"
          onClick={() => {
            onClose();
            onAskCoach();
          }}
        >
          <Icon id="ic-msg" className="ic-left" />
          <span className="text">Be om økt fra coach</span>
          <svg
            className="chev"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <button
          className="slot-action"
          onClick={() => {
            onClose();
            onToast("Hviledag markert");
          }}
        >
          <Icon id="ic-moon" className="ic-left" />
          <span className="text">Marker som hviledag</span>
          <svg
            className="chev"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
      {showResult && (
        <div className="slot-ai-result" style={{ display: "flex" }}>
          <div className="streaming" style={{ display: "block" }}>
            {aiResult}
          </div>
          {showActions && (
            <div className="actions" style={{ display: "flex" }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  onToast("Økt lagt inn");
                }}
              >
                Aksepter
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setShowResult(false)}
              >
                Avvis
              </button>
            </div>
          )}
        </div>
      )}
      <div className="slot-pop-foot">Klikk + dra for å sette varighet</div>
    </div>
  );
}

/* ─── Event preview popover ────────────────────────────────────────── */

export type UkeEvent = {
  id: string;
  d: number;
  h: number;
  dur: number;
  k: DisciplineKey;
  t: string;
  time: string;
  dayLabel: string;
  reps: number;
  drill: string;
  focus: string;
  assigned: string;
  status: "fullfort" | "planlagt" | "selvplan" | "turnering";
  statusText: string;
  goal: string;
};

const STATUS_BADGE_CLS: Record<UkeEvent["status"], { cls: string; text: string }> = {
  fullfort: { cls: "badge badge-success", text: "FULLFØRT" },
  planlagt: { cls: "badge badge-forest", text: "PLANLAGT" },
  selvplan: { cls: "badge badge-lime", text: "SELVPLAN" },
  turnering: { cls: "badge badge-danger", text: "TURNERING" },
};

export function EventPreviewPopover({
  ev,
  position,
  onClose,
  onEdit,
  onLog,
  onOpenFull,
}: {
  ev: UkeEvent | null;
  position: { left: number; top: number } | null;
  onClose: () => void;
  onEdit: () => void;
  onLog: () => void;
  onOpenFull: () => void;
}) {
  useEffect(() => {
    if (!ev) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ev, onClose]);

  if (!ev || !position) return null;

  const st = STATUS_BADGE_CLS[ev.status];
  const isDone = ev.status === "fullfort";

  return (
    <div
      className="event-pop open"
      role="dialog"
      aria-label="Økt forhåndsvisning"
      style={{ left: position.left, top: position.top }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`head ${ev.k}`}>
        <div className="meta-row">
          <span className={`pill pill-${ev.k}`}>{ev.k.toUpperCase()}</span>
          <span className={st.cls}>{ev.statusText || st.text}</span>
        </div>
        <div className="ttl">{ev.t}</div>
        <div className="when">
          {ev.dayLabel} · {ev.time}
        </div>
        <button className="close-x" onClick={onClose} aria-label="Lukk">
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="body">
        <div className="kv">
          <span className="k">Varighet</span>
          <span className="v mono">{ev.dur} min</span>
        </div>
        <div className="kv">
          <span className="k">Reps</span>
          <span className="v mono">
            {ev.reps ? ev.reps + (ev.k === "spill" ? " hull" : " reps") : "—"}
          </span>
        </div>
        <div className="kv">
          <span className="k">Drill</span>
          <span className="v">{ev.drill || "—"}</span>
        </div>
        <div className="kv">
          <span className="k">Fokus</span>
          <span
            className="v"
            dangerouslySetInnerHTML={{ __html: ev.focus || "—" }}
          />
        </div>
        <div className="kv">
          <span className="k">Tildelt</span>
          <span className="v">{ev.assigned || "—"}</span>
        </div>
        <div
          className="goals-mini"
          dangerouslySetInnerHTML={{ __html: ev.goal || "—" }}
        />
      </div>
      <div className="actions">
        <button className="btn btn-outline" onClick={onEdit}>
          {isDone ? "Se logg" : "Endre"}
        </button>
        {!isDone && (
          <button className="btn btn-outline" onClick={onLog}>
            Logg fullført
          </button>
        )}
        <button className="btn btn-primary full-w" onClick={onOpenFull}>
          Åpne full øktplan →
        </button>
      </div>
    </div>
  );
}

/* ─── Ny økt fra scratch — Modal ───────────────────────────────────── */

const DRILL_LIBRARY: { id: string; title: string; kind: DisciplineKey; mins: number }[] = [
  { id: "pitch-50-100", title: "Pitch 50—100m, lav", kind: "slag", mins: 60 },
  { id: "putt-0-3", title: "Putting 0—3m blokk", kind: "slag", mins: 30 },
  { id: "putt-3-6", title: "Putting 3—6m", kind: "slag", mins: 45 },
  { id: "approach-100-150", title: "Approach 100—150m blokk", kind: "slag", mins: 90 },
  { id: "bunker-esk", title: "Bunker-eskalering", kind: "slag", mins: 45 },
  { id: "iron-cs", title: "Iron-progresjon CS70 → CS80", kind: "tek", mins: 90 },
  { id: "driver-grunn", title: "Driver grunntrening", kind: "tek", mins: 60 },
  { id: "spin-kontroll", title: "Spin-kontroll iron 7", kind: "tek", mins: 60 },
  { id: "bein-core", title: "Beinbøy + core", kind: "fys", mins: 30 },
  { id: "intervall-4x4", title: "Intervall 4×4", kind: "fys", mins: 30 },
  { id: "mobilitet", title: "Mobilitet rotasjon", kind: "fys", mins: 20 },
  { id: "spillsim-9", title: "9-hulls spillsim", kind: "spill", mins: 90 },
  { id: "strategi-runde", title: "Strategi-runde", kind: "spill", mins: 240 },
  { id: "mental-visu", title: "Mental visualisering", kind: "turn", mins: 15 },
  { id: "preshot", title: "Pre-shot routine", kind: "turn", mins: 20 },
];

export function NyEktModal({
  open,
  onClose,
  onSubmit,
  prefilled,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (msg: string) => void;
  prefilled?: NyEktPrefill;
}) {
  const [discipline, setDiscipline] = useState<DisciplineKey>(
    prefilled?.discipline ?? "slag",
  );
  const [title, setTitle] = useState(prefilled?.title ?? "Approach 100—150m blokk");
  const [datetime, setDatetime] = useState(prefilled?.datetime ?? "2026-05-22T11:00");
  const [duration, setDuration] = useState(prefilled?.durationMin ?? 60);
  const [place, setPlace] = useState(prefilled?.place ?? "GFGK Performance Studio · Bay 4");
  const [drillOpen, setDrillOpen] = useState(false);
  const [drill, setDrill] = useState<string>(prefilled?.drill ?? "");
  const [focus, setFocus] = useState("");
  const [linkedGoals, setLinkedGoals] = useState<string[]>([]);
  const [drillQuery, setDrillQuery] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Re-sync state on every open with new prefilled values.
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setDiscipline(prefilled?.discipline ?? "slag");
      setTitle(prefilled?.title ?? "Approach 100—150m blokk");
      setDatetime(prefilled?.datetime ?? "2026-05-22T11:00");
      setDuration(prefilled?.durationMin ?? 60);
      setPlace(prefilled?.place ?? "GFGK Performance Studio · Bay 4");
      setDrill(prefilled?.drill ?? "");
      setFocus("");
      setLinkedGoals([]);
      setDrillQuery("");
      setDrillOpen(false);
    }
  }

  const aiBadge = !prefilled?.discipline;
  const dtLabel = (() => {
    if (!datetime) return "PLANLEGGES";
    const [d, t] = datetime.split("T");
    const [yr, mo, da] = d.split("-").map(Number);
    const dayNames = ["SØN", "MAN", "TIR", "ONS", "TOR", "FRE", "LØR"];
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DES"];
    const date = new Date(yr, mo - 1, da);
    return `PLANLEGGES · ${dayNames[date.getDay()]} ${da}. ${monthNames[mo - 1]} · ${t}`;
  })();
  const ctaTime = (() => {
    if (!datetime) return "";
    const [d, t] = datetime.split("T");
    const [yr, mo, da] = d.split("-").map(Number);
    const dayNames = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];
    const date = new Date(yr, mo - 1, da);
    return `${dayNames[date.getDay()]} ${t}`;
  })();

  const toggleGoal = (g: string) =>
    setLinkedGoals((p) => (p.includes(g) ? p.filter((x) => x !== g) : [...p, g]));

  const filteredDrills = drillQuery.trim()
    ? DRILL_LIBRARY.filter((d) =>
        d.title.toLowerCase().includes(drillQuery.toLowerCase()),
      )
    : DRILL_LIBRARY.filter((d) => d.kind === discipline);

  const selectDrill = (d: (typeof DRILL_LIBRARY)[number]) => {
    setDrill(d.title);
    setTitle(d.title);
    setDuration(d.mins);
    setDiscipline(d.kind);
    setDrillOpen(false);
  };

  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <div className="modal new-goal" role="document" style={{ maxWidth: 560 }}>
        <header className="modal-header">
          <div>
            <h2>Ny økt</h2>
            <div className="caption">{dtLabel}</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Lukk">
            <CloseIcon />
          </button>
        </header>

        <div className="modal-body">
          <div className="field">
            <label className="field-label">
              Tema<span className="req">*</span>
              {aiBadge && (
                <span
                  className="mono"
                  style={{
                    marginLeft: 8,
                    fontSize: 9.5,
                    color: "var(--primary)",
                    background: "var(--accent)",
                    padding: "2px 6px",
                    borderRadius: 4,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  AI-foreslått
                </span>
              )}
            </label>
            <div className="chip-row multi">
              {(["fys", "tek", "slag", "spill", "turn"] as DisciplineKey[]).map(
                (k) => {
                  const active = discipline === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      className={`chip${active ? ` active chip-${k}` : ""}`}
                      onClick={() => setDiscipline(k)}
                    >
                      {k.toUpperCase()}
                    </button>
                  );
                },
              )}
            </div>
            {aiBadge && discipline === "slag" && (
              <div className="field-helper">
                SLAG anbefalt pga. approach-gap −0,42 SG
              </div>
            )}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="ny-okt-title">
              Tittel<span className="req">*</span>
            </label>
            <input
              id="ny-okt-title"
              className="field-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="field-helper">Auto-foreslås når tema endres</div>
          </div>

          <div className="field-grid-2">
            <div className="field">
              <label className="field-label" htmlFor="ny-okt-when">
                Tid<span className="req">*</span>
              </label>
              <input
                id="ny-okt-when"
                className="field-input"
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="ny-okt-duration">
                Varighet
              </label>
              <div className="slider-row">
                <input
                  id="ny-okt-duration"
                  type="range"
                  min={15}
                  max={180}
                  step={5}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
                <span className="val">
                  <span>{duration}</span> min
                </span>
              </div>
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="ny-okt-place">
              Sted
            </label>
            <select
              id="ny-okt-place"
              className="field-input"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
            >
              <option>GFGK Performance Studio · Bay 4</option>
              <option>GFGK Performance Studio · Bay 1</option>
              <option>Bossum range</option>
              <option>Hjemme</option>
              <option>Range</option>
              <option>Annet</option>
            </select>
          </div>

          <div className="field">
            <label className="field-label">Drill</label>
            {drill ? (
              <div
                className="assigned-card"
                style={{ cursor: "pointer" }}
                onClick={() => setDrillOpen(true)}
              >
                <div className="avatar">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ width: 14, height: 14 }}
                  >
                    <use href="#ic-clipboard" />
                  </svg>
                </div>
                <div className="body">
                  <div className="lbl">Valgt drill</div>
                  <div className="nm">{drill}</div>
                </div>
                <span className={`pill pill-${discipline}`}>
                  {discipline.toUpperCase()}
                </span>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ alignSelf: "flex-start" }}
                onClick={() => setDrillOpen((v) => !v)}
              >
                <Icon id="ic-plus" />
                Velg fra mine drills
              </button>
            )}
            {drillOpen && (
              <div
                style={{
                  marginTop: 8,
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: 10,
                  background: "var(--bg)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  className="field-input"
                  type="text"
                  placeholder="Søk drill…"
                  value={drillQuery}
                  onChange={(e) => setDrillQuery(e.target.value)}
                />
                <div
                  style={{
                    maxHeight: 200,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  {filteredDrills.length === 0 && (
                    <div
                      className="mono"
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        padding: 8,
                        textAlign: "center",
                      }}
                    >
                      Ingen treff
                    </div>
                  )}
                  {filteredDrills.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => selectDrill(d)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        border: "1px solid var(--border-soft)",
                        borderRadius: 8,
                        background: "var(--card)",
                        textAlign: "left",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                        fontSize: 12.5,
                      }}
                    >
                      <span className={`pill pill-${d.kind}`}>
                        {d.kind.toUpperCase()}
                      </span>
                      <span style={{ flex: 1 }}>{d.title}</span>
                      <span
                        className="mono"
                        style={{ fontSize: 10, color: "var(--muted)" }}
                      >
                        {d.mins} MIN
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="ny-okt-focus">
              Reps / fokus{" "}
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  color: "var(--muted-soft)",
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                (valgfritt)
              </span>
            </label>
            <textarea
              id="ny-okt-focus"
              className="field-input"
              rows={2}
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="F.eks: 80 reps · landingssone ±3m · spinn lav"
            />
          </div>

          <div className="field">
            <label className="field-label">
              Koble til mål{" "}
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  color: "var(--muted-soft)",
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                (valgfritt)
              </span>
            </label>
            <div className="chip-row multi">
              {(["Top 10 NM", "Snitt < 72", "HCP +2,0"] as const).map((g) => {
                const active = linkedGoals.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    className={`chip${active ? " active chip-slag" : ""}`}
                    onClick={() => toggleGoal(g)}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <footer className="modal-footer">
          <InlineError message={error} />
          <div className="left-meta">Lagres som planlagt i Uke 21</div>
          <button className="btn-ghost" onClick={onClose} disabled={isPending}>
            Avbryt
          </button>
          <button
            className="btn btn-primary"
            disabled={isPending}
            onClick={() => {
              if (!title.trim() || !datetime) return;
              setError(null);
              const areaMap: Record<DisciplineKey, "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN"> = {
                fys: "FYS",
                tek: "TEK",
                slag: "SLAG",
                spill: "SPILL",
                turn: "TURN",
              };
              startTransition(async () => {
                // Ny økt — bruk logSession til å opprette en TrainingSessionV2.
                // editSession krever eksisterende sessionId; her oppretter vi en ny.
                const result = await logSession({
                  date: new Date(datetime),
                  drillName: title.trim(),
                  pyramidArea: areaMap[discipline],
                  durationMin: duration,
                  sets: [],
                  notes: [
                    focus ? `Fokus: ${focus}` : null,
                    place ? `Sted: ${place}` : null,
                    drill ? `Drill: ${drill}` : null,
                    linkedGoals.length
                      ? `Mål: ${linkedGoals.join(", ")}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join("\n"),
                });
                if ("error" in result) {
                  setError(result.error);
                  return;
                }
                onSubmit(
                  ctaTime ? `Økt planlagt · ${ctaTime}` : "Økt opprettet",
                );
              });
            }}
          >
            <Icon id="ic-plus" />
            {isPending
              ? "Lagrer…"
              : `Lagre${ctaTime ? ` · ${ctaTime}` : ""}`}
          </button>
        </footer>
      </div>
    </ModalBackdrop>
  );
}

/* ─── AI-foreslå uke — Modal ───────────────────────────────────────── */

type AiPhase = "generating" | "suggestion" | "confirm";

const AI_DAYS = [
  { day: "Man", date: "19/5", kind: "tek" as DisciplineKey, time: "14:00", title: "Iron CS70→CS80", min: 90, kept: true },
  { day: "Tir", date: "20/5", kind: "fys" as DisciplineKey, time: "11:00", title: "Beinbøy + core", min: 30, kept: false },
  { day: "Tir", date: "20/5", kind: "turn" as DisciplineKey, time: "16:00", title: "Mental Sørlands", min: 15, kept: false },
  { day: "Ons", date: "21/5", kind: "slag" as DisciplineKey, time: "09:00", title: "Approach 100—150m", min: 90, kept: false },
  { day: "Ons", date: "21/5", kind: "spill" as DisciplineKey, time: "17:00", title: "Spillsim Bossum-prep", min: 90, kept: false },
  { day: "Tor", date: "22/5", kind: "slag" as DisciplineKey, time: "15:00", title: "Putting 3—6m", min: 45, kept: false },
  { day: "Lør", date: "24/5", kind: "spill" as DisciplineKey, time: "09:00", title: "Bossum Open R1", min: 240, kept: false },
];

const AI_REASONS = [
  "Approach-gap på <em>−0,42 SG</em> → 3 SLAG-økter prioritert",
  "Du har ikke trent FYS på <em>9 dager</em> → beinbøy tirsdag",
  "Sørlandsåpent om 21 dager → mental tirsdag",
  "Bossum Open lørdag → spillsim onsdag",
  "Anders' tildelte iron-økt <em>beholdt</em> mandag",
];

const AI_CHIPS = ["Mer FYS", "Mindre TEK", "Hvile fredag", "Flere korte økter"];

export function AiForeslaUkeModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (msg: string) => void;
}) {
  const [phase, setPhase] = useState<AiPhase>("generating");
  const [progress, setProgress] = useState(0);
  const [doneSteps, setDoneSteps] = useState(0);
  const [chips, setChips] = useState<string[]>([]);
  const [keepAnders, setKeepAnders] = useState(true);
  const [prevOpen, setPrevOpen] = useState(open);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setPhase("generating");
      setProgress(0);
      setDoneSteps(0);
      setChips([]);
      setKeepAnders(true);
    }
  }

  useEffect(() => {
    if (!open || phase !== "generating") return;
    const start = Date.now();
    const total = 2200;
    const tick = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, (elapsed / total) * 100);
      setProgress(p);
      if (elapsed > total * 0.25) setDoneSteps((s) => Math.max(s, 1));
      if (elapsed > total * 0.55) setDoneSteps((s) => Math.max(s, 2));
      if (elapsed > total * 0.85) setDoneSteps((s) => Math.max(s, 3));
      if (elapsed >= total) {
        window.clearInterval(tick);
        setPhase("suggestion");
      }
    }, 60);

    // Kall aiSuggestWeek best-effort (svar brukes ikke ennå i UI som viser
    // hardkodet AI_DAYS — Sprint 3 vil mappe svaret til prod-data).
    const weekStart = new Date();
    const day = (weekStart.getDay() + 6) % 7;
    weekStart.setDate(weekStart.getDate() - day + 7); // neste uke
    weekStart.setHours(0, 0, 0, 0);
    void aiSuggestWeek({ weekStart }).catch(() => {
      // stille feil — UI viser uansett mock-forslag
    });

    return () => window.clearInterval(tick);
  }, [open, phase]);

  const toggleChip = (c: string) =>
    setChips((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  const regenerate = () => {
    setProgress(0);
    setDoneSteps(0);
    setPhase("generating");
  };

  const sessionCount = AI_DAYS.length;
  const totalMin = AI_DAYS.reduce((acc, d) => acc + d.min, 0);
  const keptCount = AI_DAYS.filter((d) => d.kept).length;
  const replacedCount = sessionCount - keptCount;

  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <div className="modal" role="document" style={{ maxWidth: 640 }}>
        <header className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              style={{ width: 22, height: 22, color: "var(--primary)" }}
            >
              <use href="#ic-sparkles" />
            </svg>
            <div>
              <h2>
                {phase === "generating"
                  ? "AI bygger uken din"
                  : phase === "suggestion"
                  ? "Forslag · Uke 22"
                  : "Bekreft ukeplan"}
              </h2>
              <div className="caption">
                {phase === "generating"
                  ? "ANALYSERER 12 RUNDER · 47 ØKTER · 3 MÅL"
                  : `${sessionCount} ØKTER · ${totalMin} MIN · 72% PYRAMIDE-TREFF`}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Lukk">
            <CloseIcon />
          </button>
        </header>

        <div className="modal-body">
          {phase === "generating" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                style={{
                  height: 8,
                  borderRadius: 999,
                  background: "var(--border-soft)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background:
                      "linear-gradient(90deg, var(--accent), var(--primary))",
                    transition: "width 0.12s linear",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "Lest SG-trender",
                  "Sjekket Anders' coaching-mål",
                  "Hentet Sørlandsåpent-prep-status",
                ].map((step, i) => {
                  const done = doneSteps > i;
                  return (
                    <div
                      key={step}
                      className="mono"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 11.5,
                        letterSpacing: "0.04em",
                        color: done ? "var(--fg)" : "var(--muted)",
                        opacity: done ? 1 : 0.55,
                        transition: "opacity 0.2s, color 0.2s",
                      }}
                    >
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: done ? "var(--accent)" : "var(--border)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--primary)",
                          flexShrink: 0,
                        }}
                      >
                        {done && (
                          <svg
                            width="9"
                            height="9"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      {step}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {phase === "suggestion" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  background: "var(--primary)",
                  color: "var(--accent)",
                  borderRadius: 10,
                  padding: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      opacity: 0.85,
                    }}
                  >
                    UKE 22 · 6 ØKTER · 220 MIN
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 18,
                      fontWeight: 600,
                      marginTop: 4,
                      color: "#fff",
                    }}
                  >
                    72% pyramide-treff
                  </div>
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    textAlign: "right",
                    lineHeight: 1.5,
                  }}
                >
                  +15% SLAG
                  <br />
                  −10% TEK
                </div>
              </div>

              <div>
                <div
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: "var(--muted)",
                    letterSpacing: "0.08em",
                    marginBottom: 8,
                  }}
                >
                  FORESLÅTTE ØKTER
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {AI_DAYS.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        border: "1px solid var(--border)",
                        borderLeft: `3px solid var(--${s.kind})`,
                        borderRadius: 8,
                        background: "var(--card)",
                      }}
                    >
                      <span
                        className="mono"
                        style={{
                          fontSize: 10.5,
                          color: "var(--muted)",
                          letterSpacing: "0.06em",
                          width: 64,
                          flexShrink: 0,
                        }}
                      >
                        {s.day} {s.date}
                      </span>
                      <span
                        className="mono"
                        style={{
                          fontSize: 11,
                          color: "var(--fg)",
                          width: 48,
                          flexShrink: 0,
                        }}
                      >
                        {s.time}
                      </span>
                      <span className={`pill pill-${s.kind}`}>
                        {s.kind.toUpperCase()}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          fontSize: 12.5,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.title}
                      </span>
                      <span
                        className="mono"
                        style={{
                          fontSize: 10,
                          color: "var(--muted)",
                        }}
                      >
                        {s.min} MIN
                      </span>
                      {s.kept && (
                        <span
                          className="mono"
                          style={{
                            fontSize: 9.5,
                            color: "var(--primary)",
                            background: "var(--accent)",
                            padding: "2px 6px",
                            borderRadius: 4,
                            letterSpacing: "0.06em",
                          }}
                        >
                          BEHOLDT
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: "var(--muted)",
                    letterSpacing: "0.08em",
                    marginBottom: 8,
                  }}
                >
                  HVORFOR DENNE PLANEN?
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontSize: 13.5,
                    lineHeight: 1.5,
                  }}
                >
                  {AI_REASONS.map((r, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", gap: 8, alignItems: "baseline" }}
                    >
                      <span style={{ color: "var(--primary)" }}>•</span>
                      <span dangerouslySetInnerHTML={{ __html: r }} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: "var(--muted)",
                    letterSpacing: "0.08em",
                    marginBottom: 8,
                  }}
                >
                  JUSTER
                </div>
                <div className="chip-row multi">
                  {AI_CHIPS.map((c) => {
                    const active = chips.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        className={`chip${active ? " active chip-slag" : ""}`}
                        onClick={() => toggleChip(c)}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
                {chips.length > 0 && (
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: 10, alignSelf: "flex-start" }}
                    onClick={regenerate}
                  >
                    <Icon id="ic-refresh" />
                    Regenerer med justeringer
                  </button>
                )}
              </div>
            </div>
          )}

          {phase === "confirm" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Erstatter {replacedCount} eksisterende økter
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}
                >
                  BEHOLDER {keptCount} FRA ANDERS · LEGGER TIL{" "}
                  {sessionCount - keptCount} NYE
                </div>
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={keepAnders}
                  onChange={(e) => setKeepAnders(e.target.checked)}
                />
                <span style={{ fontSize: 13 }}>
                  Behold Anders&apos; tildelte økter alltid
                </span>
              </label>

              <InlineError message={error} />
            </div>
          )}
        </div>

        <footer className="modal-footer">
          {phase === "generating" && (
            <>
              <div className="left-meta">Generere tar 2—3 sek</div>
              <button className="btn-ghost" onClick={onClose}>
                Avbryt
              </button>
            </>
          )}
          {phase === "suggestion" && (
            <>
              <div className="left-meta">
                {chips.length > 0
                  ? `${chips.length} justering${chips.length === 1 ? "" : "er"}`
                  : "Klar til å aksepteres"}
              </div>
              <button className="btn-ghost" onClick={onClose}>
                Avbryt
              </button>
              <button className="btn btn-outline" onClick={regenerate}>
                <Icon id="ic-refresh" />
                Regenerer
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setPhase("confirm")}
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  style={{ width: 14, height: 14 }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Aksepter {sessionCount} økter
              </button>
            </>
          )}
          {phase === "confirm" && (
            <>
              <div className="left-meta">Refresher ukeplan</div>
              <button
                className="btn-ghost"
                disabled={isPending}
                onClick={() => setPhase("suggestion")}
              >
                Tilbake
              </button>
              <button
                className="btn btn-primary"
                disabled={isPending}
                onClick={() => {
                  setError(null);
                  const areaMap: Record<
                    DisciplineKey,
                    "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN"
                  > = {
                    fys: "FYS",
                    tek: "TEK",
                    slag: "SLAG",
                    spill: "SPILL",
                    turn: "TURN",
                  };
                  // Bygg dato pr. økt med neste mandag som start.
                  const weekStart = new Date();
                  const day = (weekStart.getDay() + 6) % 7;
                  weekStart.setDate(weekStart.getDate() - day + 7);
                  weekStart.setHours(0, 0, 0, 0);
                  const norskDayOffset: Record<string, number> = {
                    Man: 0, Tir: 1, Ons: 2, Tor: 3, Fre: 4, Lør: 5, Søn: 6,
                  };
                  // Hopp over Anders' tildelte (kept) hvis brukeren beholder.
                  const toCreate = AI_DAYS.filter(
                    (s) => !(keepAnders && s.kept),
                  );
                  startTransition(async () => {
                    let createdCount = 0;
                    for (const s of toCreate) {
                      const offset = norskDayOffset[s.day] ?? 0;
                      const d = new Date(weekStart);
                      d.setDate(d.getDate() + offset);
                      const [h, m] = s.time.split(":").map(Number);
                      d.setHours(h, m, 0, 0);
                      const r = await logSession({
                        date: d,
                        drillName: s.title,
                        pyramidArea: areaMap[s.kind],
                        durationMin: s.min,
                        sets: [],
                        notes: "AI-generert ukeplan",
                      });
                      if ("success" in r) createdCount++;
                    }
                    if (createdCount === 0) {
                      setError("Kunne ikke opprette økter — sjekk tilkobling");
                      return;
                    }
                    onSubmit(
                      `Uke 22 oppdatert · ${createdCount} økter lagt til`,
                    );
                  });
                }}
              >
                {isPending ? "Lagrer…" : "Bekreft"}
              </button>
            </>
          )}
        </footer>
      </div>
    </ModalBackdrop>
  );
}
