"use client";

import { useEffect } from "react";
import { Camera, ChevronLeft, Radio, Target, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type DrillDetailData = {
  id: string;
  title: string;
  skillArea: string;
  pyramidArea: string;
  duration: number;
  intensity: number;
  setsReps: string; // "3×10"
  environment: string; // "Driving range"
  csMal: number;
  csMalNivaa: string; // "D"
  treningsfaser: string[]; // ["Grunnfase", "Spesialfase"]
  fasilitetskrav: { name: string; icon?: string }[]; // [{name: "Driving range", icon: "target"}, ...]
  description: string;
  coachNotes?: string;
  tags: string[];
};

type DrillDetailPanelProps = {
  drill: DrillDetailData;
  onClose: () => void;
};

const facilityIcons: Record<string, LucideIcon> = {
  target: Target,
  radio: Radio,
  camera: Camera,
};

function normalizeIconKey(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("radar") || n.includes("trackman")) return "radio";
  if (n.includes("kamera") || n.includes("video")) return "camera";
  return "target";
}

/**
 * Slide-in detalj-panel for én drill.
 *
 * Layout (per plan Del 6):
 * - 480px bredde, høyre side
 * - Backdrop foreground/40 + blur
 * - Sticky header med tilbake-pil + breadcrumb + tittel + skill/pyramid-badges
 * - Body med 7 seksjoner: CS-mål, meta-grid 2x2, treningsfase, fasilitetskrav,
 *   beskrivelse, coach-notater (lime-tint), tags
 * - Sticky footer: "Be om i neste plan" CTA + "Se full side →" link
 */
export function DrillDetailPanel({ drill, onClose }: DrillDetailPanelProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = orig;
    };
  }, [onClose]);

  return (
    <>
      <div className="drill-panel-backdrop" onClick={onClose} aria-hidden />
      <aside
        className="drill-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drill-panel-title"
      >
        <header className="drill-panel-header">
          <button
            type="button"
            onClick={onClose}
            className="drill-panel-crumb"
          >
            <ChevronLeft size={12} strokeWidth={1.75} aria-hidden />
            Drill-bibliotek
          </button>
          <h2 id="drill-panel-title" className="drill-panel-title">
            {drill.title}
          </h2>
          <div className="drill-panel-badges">
            <span className="drill-panel-mini-badge">{drill.skillArea}</span>
            <span className="drill-panel-mini-badge">{drill.pyramidArea}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="drill-panel-close"
            aria-label="Lukk panel"
          >
            <X size={16} strokeWidth={1.75} aria-hidden />
          </button>
        </header>

        <div className="drill-panel-body">
          {/* 1. CS-mål-blokk */}
          <section className="drill-cs-block">
            <div className="drill-cs-num">{drill.csMal}</div>
            <div className="drill-cs-lbl">
              CS-mål for ditt nivå ({drill.csMalNivaa})
            </div>
          </section>

          {/* 2. Meta-grid 2x2 */}
          <section className="drill-meta-grid">
            <div className="drill-meta-cell">
              <div className="drill-meta-eyebrow">Varighet</div>
              <div className="drill-meta-value">{drill.duration} min</div>
            </div>
            <div className="drill-meta-cell">
              <div className="drill-meta-eyebrow">Intensitet</div>
              <div className="drill-meta-value">{drill.intensity}/10</div>
            </div>
            <div className="drill-meta-cell">
              <div className="drill-meta-eyebrow">Sett × Reps</div>
              <div className="drill-meta-value">{drill.setsReps}</div>
            </div>
            <div className="drill-meta-cell">
              <div className="drill-meta-eyebrow">Miljø</div>
              <div className="drill-meta-value">{drill.environment}</div>
            </div>
          </section>

          {/* 3. Treningsfase */}
          {drill.treningsfaser.length > 0 ? (
            <section>
              <div className="drill-section-eyebrow">Treningsfase</div>
              <div className="drill-phase-row">
                {drill.treningsfaser.map((fase) => (
                  <span key={fase} className="drill-phase-pill">
                    {fase}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {/* 4. Fasilitetskrav */}
          {drill.fasilitetskrav.length > 0 ? (
            <section>
              <div className="drill-section-eyebrow">Fasilitetskrav</div>
              <div className="drill-facility-row">
                {drill.fasilitetskrav.map((f) => {
                  const IconComponent =
                    facilityIcons[normalizeIconKey(f.name)] ?? Target;
                  return (
                    <span key={f.name} className="drill-facility-chip">
                      <IconComponent size={12} strokeWidth={1.75} aria-hidden />
                      {f.name}
                    </span>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* 5. Beskrivelse */}
          <section>
            <div className="drill-section-eyebrow">Beskrivelse</div>
            <p className="drill-desc">{drill.description}</p>
          </section>

          {/* 6. Coach-notater */}
          {drill.coachNotes ? (
            <section className="drill-coach-notes">
              <span className="eyebrow">Coach-notater</span>
              <p>{drill.coachNotes}</p>
            </section>
          ) : null}

          {/* 7. Tags */}
          {drill.tags.length > 0 ? (
            <section>
              <div className="drill-section-eyebrow">Tags</div>
              <div className="drill-tags">
                {drill.tags.map((t) => (
                  <span key={t} className="drill-tag">
                    {t}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <footer className="drill-panel-footer">
          <button type="button" className="drill-panel-cta">
            Be om i neste plan
          </button>
          <a
            href={`/portal/drills/${drill.id}`}
            className="drill-panel-secondary"
          >
            Se full side →
          </a>
        </footer>
      </aside>
    </>
  );
}
