"use client";

// AI-modaler for workbench v2 — drill-forslag og turnerings-forslag.
// Holdes adskilt fra workbench-modaler.tsx for å holde fil-størrelse håndterlig.
// Bruker samme `.modal-backdrop` / `.modal` CSS-klasser fra workbench-v2.css.

import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
};

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

type DrillSuggestion = {
  id: string;
  discipline: "tek" | "slag" | "fys";
  title: string;
  meta: string[];
  desc: string;
  reasons: string[];
  match: number;
  effect: string;
  top?: boolean;
};

const DRILL_SUGGESTIONS: DrillSuggestion[] = [
  {
    id: "driver-face",
    discipline: "tek",
    title: "Driver — face-control gateways",
    meta: ["TEK", "60 min", "120 reps", "Anbefales 3×/uke"],
    desc: "Bygg tee-vinduer 8 yards bredt mellom alignment-stenger. Foreldelse av klubbflate gjennom impact — start halv-fart, eskalér til full swing.",
    reasons: [
      "Adresserer venstre-miss direkte med vinduer på begge sider.",
      "3 A1-spillere har +9 % FIR etter 4 uker med denne drillen.",
      "Passer i workbench-en din — ledig tid på range 22.05 og 24.05.",
    ],
    match: 95,
    effect: "+4 % FIR",
    top: true,
  },
  {
    id: "9shot",
    discipline: "slag",
    title: "Tee til mål — 9-shot matrise",
    meta: ["SLAG", "45 min", "81 reps", "2×/uke"],
    desc: "9 kombinasjoner av høyde × form (low/mid/high · fade/straight/draw). Tving deg til å eie hvert ball-flight — særlig low-draw som motvirker den åpne klubbflaten din.",
    reasons: [
      "Lærer deg kontrollert draw — direkte motgift for venstre-miss.",
      "Du gjorde denne sist 14.03.2026 — score 5,2/9.",
    ],
    match: 87,
    effect: "+2,5 % FIR",
  },
  {
    id: "trail-rot",
    discipline: "fys",
    title: "Trail-side rotasjon — fluidity",
    meta: ["FYS", "20 min", "Mobilitet", "Daglig"],
    desc: "Hofte- og bryst-rotasjon på trail-siden. Bedre mobilitet her gjør at klubbflaten kan lukkes naturlig gjennom impact — uten å manipulere hender.",
    reasons: [
      "Stivhet i trail-hofte er ofte den fysiske rotårsaken til åpen flate.",
      "FYS-balansen din ligger −12 % under pyramide-mål.",
    ],
    match: 76,
    effect: "Indirekte",
  },
];

export function AiDrillModal({
  open,
  onClose,
  onSubmit,
}: ModalProps & { onSubmit?: (msg: string) => void }) {
  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <div className="modal" role="document" style={{ maxWidth: 880 }}>
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
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
            </svg>
            <div>
              <h2>AI har funnet din svake flanke</h2>
              <div className="caption">KI-FORSLAG · DRILLS · 30 DAGER</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Lukk">
            <CloseIcon />
          </button>
        </header>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Weakness analysis */}
          <div
            style={{
              background:
                "linear-gradient(160deg, rgba(209,248,67,0.20), rgba(209,248,67,0.06))",
              border: "1px solid var(--accent)",
              borderLeft: "4px solid var(--accent)",
              borderRadius: 16,
              padding: "18px 20px",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  marginBottom: 6,
                }}
              >
                Vi ser en{" "}
                <em style={{ color: "var(--primary)", fontStyle: "italic", fontWeight: 400 }}>
                  FIR-bekymring
                </em>{" "}
                i tee-spillet ditt
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                Fairway-treff har sunket fra <strong>78 %</strong> til <strong>71 %</strong> de
                siste fire ukene. 62 % av missene går mot venstre.
              </p>
            </div>
            <div
              style={{
                textAlign: "right",
                paddingLeft: 18,
                borderLeft: "1px solid rgba(0,88,64,0.2)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9.5,
                  color: "var(--muted)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                FIR · 30 dager
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--danger, #A32D2D)",
                }}
              >
                −7,0 %
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  color: "var(--muted)",
                }}
              >
                78 % → 71 %
              </div>
            </div>
          </div>

          {/* Drill list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {DRILL_SUGGESTIONS.map((d) => (
              <DrillCard
                key={d.id}
                drill={d}
                onAdd={() => {
                  onSubmit?.(`Drill lagt til: ${d.title}`);
                  onClose();
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
}

function DrillCard({
  drill,
  onAdd,
}: {
  drill: DrillSuggestion;
  onAdd: () => void;
}) {
  return (
    <article
      style={{
        background: "var(--card)",
        border: drill.top ? "1.5px solid var(--primary)" : "1px solid var(--border)",
        borderRadius: 16,
        padding: 20,
        display: "grid",
        gridTemplateColumns: "1fr 180px",
        gap: 18,
        boxShadow: drill.top ? "0 0 0 4px rgba(0,88,64,0.08)" : undefined,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>{drill.title}</h3>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            color: "var(--muted)",
            letterSpacing: "0.04em",
          }}
        >
          {drill.meta.map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>{drill.desc}</p>
        <div
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border-soft)",
            borderRadius: 10,
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9.5,
              color: "var(--muted)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            HVORFOR DENNE
          </span>
          {drill.reasons.map((r, i) => (
            <div
              key={i}
              style={{ fontSize: 12, lineHeight: 1.4, color: "var(--fg)" }}
            >
              ✓ {r}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          paddingLeft: 16,
          borderLeft: "1px solid var(--border-soft)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9.5,
              color: "var(--muted)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Match
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700 }}>
            {drill.match}
            <small style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>%</small>
          </div>
          <div
            style={{
              height: 6,
              background: "var(--bg)",
              border: "1px solid var(--border-soft)",
              borderRadius: 999,
              overflow: "hidden",
              marginTop: 4,
            }}
          >
            <div
              style={{
                width: `${drill.match}%`,
                height: "100%",
                background: "var(--accent)",
              }}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10.5,
            color: "var(--muted)",
            paddingTop: 6,
            borderTop: "1px dashed var(--border-soft)",
          }}
        >
          <span>Estimert effekt</span>
          <strong style={{ color: "var(--fg)" }}>{drill.effect}</strong>
        </div>
        <button
          type="button"
          onClick={onAdd}
          style={{
            background: "var(--primary)",
            color: "var(--accent)",
            border: 0,
            padding: "9px 14px",
            borderRadius: 999,
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
            marginTop: "auto",
          }}
        >
          + Legg til i plan
        </button>
        <button
          type="button"
          style={{
            background: "transparent",
            color: "var(--fg)",
            border: "1px solid var(--border)",
            padding: "9px 14px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Forhåndsvis
        </button>
      </div>
    </article>
  );
}

/* ─── AI Foreslå Turnering Modal ────────────────────────────────────── */

type TournamentSuggestion = {
  id: string;
  name: string;
  italicName: string;
  badges: string[];
  date: string;
  venue: string;
  daysAway: string;
  reasons: string[];
  stats: { påmeldte: number; snittHcp: string; format: string; pris: string };
  match: number;
  top?: boolean;
};

const TOURNAMENT_SUGGESTIONS: TournamentSuggestion[] = [
  {
    id: "nm-junior",
    name: "NM",
    italicName: "Junior 2026",
    badges: ["★ Topp-prioritet", "A1 · Elite", "3 dager"],
    date: "12.–14. juni 2026",
    venue: "Bogstad GK, Oslo",
    daysAway: "23 dager unna",
    reasons: [
      "Topp-prioritet mål: NM Junior topp 10.",
      "Innen aldersklasse: U18 Gutter med snitt-HCP +2,8.",
      "Østland: 1 t 20 min med bil fra Fredrikstad.",
    ],
    stats: { påmeldte: 112, snittHcp: "+2,8", format: "Slag · 54", pris: "1 850 kr" },
    match: 96,
    top: true,
  },
  {
    id: "ostfold-open",
    name: "Østfold",
    italicName: "Open",
    badges: ["Junior Tour", "2 dager"],
    date: "28.–29. mai 2026",
    venue: "Borre GK",
    daysAway: "9 dager unna",
    reasons: [
      "Konkurranse-eksponering før NM — perfekt oppvarming.",
      "40 min kjøring — kortest reisetid av alle forslag.",
    ],
    stats: { påmeldte: 68, snittHcp: "3,2", format: "Slag · 36", pris: "850 kr" },
    match: 88,
  },
  {
    id: "kongsberg",
    name: "Kongsberg",
    italicName: "Junior Trophy",
    badges: ["Regional", "1 dag"],
    date: "05. juni 2026",
    venue: "Kongsberg GK",
    daysAway: "16 dager unna",
    reasons: [
      "Ny bane i karrieren — bra for vurdering under press.",
      "Smal og tee-shot-krevende — match med driver-mål.",
    ],
    stats: { påmeldte: 52, snittHcp: "5,1", format: "Slag · 18", pris: "450 kr" },
    match: 82,
  },
];

export function AiTurneringModal({
  open,
  onClose,
  onSubmit,
}: ModalProps & { onSubmit?: (msg: string) => void }) {
  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <div className="modal" role="document" style={{ maxWidth: 880 }}>
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
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
            </svg>
            <div>
              <h2>Foreslåtte turneringer for deg</h2>
              <div className="caption">KI-FORSLAG · TURNERINGER · 4 KANDIDATER</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Lukk">
            <CloseIcon />
          </button>
        </header>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              background: "rgba(0,88,64,0.04)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "12px 14px",
              fontSize: 12.5,
              lineHeight: 1.5,
              color: "var(--fg)",
            }}
          >
            Basert på HCP <strong>+3,5</strong>, alder 18, Østfold-region og dine 3 aktive mål. AI
            fant 12 kandidater og rangerte de 4 mest passende.
          </div>

          {TOURNAMENT_SUGGESTIONS.map((t) => (
            <TournamentCard
              key={t.id}
              t={t}
              onRegister={() => {
                onSubmit?.(`Påmeldt: ${t.name} ${t.italicName}`);
                onClose();
              }}
            />
          ))}
        </div>
      </div>
    </ModalBackdrop>
  );
}

function TournamentCard({
  t,
  onRegister,
}: {
  t: TournamentSuggestion;
  onRegister: () => void;
}) {
  return (
    <article
      style={{
        background: "var(--card)",
        border: t.top ? "1.5px solid var(--primary)" : "1px solid var(--border)",
        borderRadius: 16,
        padding: 18,
        display: "grid",
        gridTemplateColumns: "1fr 160px",
        gap: 18,
        boxShadow: t.top ? "0 0 0 4px rgba(0,88,64,0.08)" : undefined,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {t.badges.map((b, i) => (
            <span
              key={i}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 999,
                background: i === 0 && t.top ? "var(--accent)" : "var(--bg)",
                border: "1px solid var(--border-soft)",
                color: "var(--fg)",
                letterSpacing: "0.04em",
              }}
            >
              {b}
            </span>
          ))}
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em" }}>
          {t.name}{" "}
          <em style={{ color: "var(--primary)", fontStyle: "italic", fontWeight: 400 }}>
            {t.italicName}
          </em>
        </h3>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          <span>
            <strong style={{ color: "var(--fg)" }}>{t.date}</strong>
          </span>
          <span>{t.venue}</span>
          <span>{t.daysAway}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {t.reasons.map((r, i) => (
            <div key={i} style={{ fontSize: 12, lineHeight: 1.4, color: "var(--fg)" }}>
              ✓ {r}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
            paddingTop: 6,
            borderTop: "1px dashed var(--border-soft)",
          }}
        >
          <Stat k="Påmeldte" v={String(t.stats.påmeldte)} />
          <Stat k="Snitt-HCP" v={t.stats.snittHcp} />
          <Stat k="Format" v={t.stats.format} />
          <Stat k="Pris" v={t.stats.pris} />
        </div>
      </div>

      <div
        style={{
          paddingLeft: 16,
          borderLeft: "1px solid var(--border-soft)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9.5,
              color: "var(--muted)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Match
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700 }}>
            {t.match}
            <small style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>%</small>
          </div>
          <div
            style={{
              height: 6,
              background: "var(--bg)",
              border: "1px solid var(--border-soft)",
              borderRadius: 999,
              overflow: "hidden",
              marginTop: 4,
            }}
          >
            <div
              style={{ width: `${t.match}%`, height: "100%", background: "var(--accent)" }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onRegister}
          style={{
            marginTop: "auto",
            background: "var(--primary)",
            color: "var(--accent)",
            border: 0,
            padding: "10px 14px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Meld på →
        </button>
        <button
          type="button"
          style={{
            background: "transparent",
            color: "var(--fg)",
            border: "1px solid var(--border)",
            padding: "9px 14px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Mer info
        </button>
      </div>
    </article>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9.5,
          color: "var(--muted)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {k}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700 }}>{v}</div>
    </div>
  );
}
