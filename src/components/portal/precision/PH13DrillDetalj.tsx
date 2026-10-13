"use client";

/**
 * PH-13 Drill-detalj — Precision Athletics.
 * Kilde: Claude Design ui_kits/playerhq/screens/PH-13.jsx
 *
 * Brukes både i høyre kolonne på desktop, i mobil modal/sheet,
 * og på dedikert side /portal/drills/[id].
 */

import Link from "next/link";
import { useState } from "react";
import { Check, Layers, Plus, Trash2 } from "lucide-react";
import { AkseMerke, Ikon, Meta, StatusPille } from "@/components/precision/pa";
import type { PH13Drill } from "@/lib/portal-drills/ph13-drills-data";
import { PH13LeggTilOkt } from "./PH13LeggTilOkt";

export type PH13DrillDetaljProps = {
  drill: PH13Drill;
  onClose?: () => void;
  onAcceptDraft?: (drill: PH13Drill) => void;
  onDiscardDraft?: (drill: PH13Drill) => void;
  onAddToSession?: (drill: PH13Drill) => void;
};

export function PH13DrillDetalj({
  drill,
  onAcceptDraft,
  onDiscardDraft,
  onAddToSession,
}: PH13DrillDetaljProps) {
  const parts = drill.code ? drill.code.split("_") : [];
  const [velgOkt, setVelgOkt] = useState(false);

  const kvItems: { label: string; value: string | null; isMono?: boolean }[] = [
    { label: "Pyramide", value: drill.axis.toUpperCase() },
    { label: "Område", value: drill.area, isMono: false },
    { label: "Læringssteg", value: drill.mot, isMono: false },
    { label: "Teknisk dimensjon", value: drill.dim, isMono: false },
    { label: "Treningsmiljø", value: drill.bel, isMono: false },
    { label: "Press", value: drill.press, isMono: false },
    { label: "P-posisjoner", value: drill.p, isMono: true },
    { label: "Mengde", value: drill.qty, isMono: true },
    { label: "Tid", value: `${drill.min} min`, isMono: true },
    { label: "Mål", value: drill.goal && drill.goal !== "—" ? drill.goal : null, isMono: false },
    { label: "Bruk", value: drill.bruktTekst ?? null, isMono: false },
  ].filter((item) => item.value !== null && item.value !== undefined);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
      {/* Akse- og statuslinje */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <AkseMerke axis={drill.axis} />
        {drill.draft ? (
          <StatusPille tone="neutral">Utkast</StatusPille>
        ) : (
          <Meta>{drill.src === "mine" ? "Laget av deg" : "Fra øvelsesbanken"}</Meta>
        )}
      </div>

      <section className="ph13-oppskrift" aria-label="Oppskrift">
        <h3>Slik gjennomfører du øvelsen</h3>
        <p>{drill.desc || "Ingen instruksjon er lagt til for denne øvelsen ennå."}</p>
        <p className="ph13-mengde">{drill.qty} · {drill.min} min</p>
        {drill.goal && drill.goal !== "—" && <p><strong>Mål:</strong> {drill.goal}</p>}
      </section>

      {/* AK-formelen chips */}
      {parts.length > 0 && (
        <details className="ph13-formeldetaljer">
          <summary>AK-formelen og kildekode</summary>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
            {parts.map((p, i) => (
              <span
                key={i}
                style={{
                  font: "600 12px/1 var(--font-mono)",
                  padding: "6px 8px",
                  borderRadius: 4,
                  background:
                    i === 0
                      ? `var(--axis-${drill.axis}-bg)`
                      : "var(--surface-sunken)",
                  color:
                    i === 0
                      ? `var(--axis-${drill.axis}-fg)`
                      : "var(--text-primary)",
                  overflowWrap: "anywhere",
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </details>
      )}

      {/* Nøkkelfakta (KeyValue dl) */}
      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 8,
          margin: 0,
          padding: 0,
          borderTop: "1px solid var(--border-hairline)",
          borderBottom: "1px solid var(--border-hairline)",
          paddingTop: 12,
          paddingBottom: 12,
        }}
      >
        {kvItems.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 12,
            }}
          >
            <dt
              style={{
                font: "var(--type-body-s)",
                color: "var(--text-secondary)",
              }}
            >
              {item.label}
            </dt>
            <dd
              style={{
                margin: 0,
                textAlign: "right",
                font: item.isMono
                  ? "600 13px/1.3 var(--font-mono)"
                  : "var(--type-body-s)",
                color: "var(--text-primary)",
                overflowWrap: "anywhere",
              }}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Hvorfor Caddie foreslår denne (hvis utkast) */}
      {drill.why && (
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            background: "var(--surface-sunken)",
          }}
        >
          <Meta>HVORFOR CADDIE FORESLÅR DENNE</Meta>
          <p
            style={{
              margin: "6px 0 0",
              font: "var(--type-body-s)",
              color: "var(--text-primary)",
              textWrap: "pretty",
            }}
          >
            {drill.why}
          </p>
        </div>
      )}

      {/* Handlingsknapper */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
        {drill.draft ? (
          <>
            <button
              type="button"
              onClick={() => onAcceptDraft?.(drill)}
              className="pa-btn pa-btn--primary pa-btn--full"
            >
              <Ikon icon={Check} size={16} name="check" />
              <span>Legg i banken</span>
            </button>
            <button
              type="button"
              onClick={() => onDiscardDraft?.(drill)}
              className="pa-btn pa-btn--ghost pa-btn--full"
            >
              <Ikon icon={Trash2} size={16} name="trash" />
              <span>Forkast utkast</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onAddToSession ? onAddToSession(drill) : setVelgOkt(true)}
              className="pa-btn pa-btn--primary pa-btn--full"
            >
              <Ikon icon={Plus} size={16} name="plus" />
              <span>Legg til i økt</span>
            </button>
            <Link
              href="/portal/planlegge/workbench"
              className="pa-btn pa-btn--secondary pa-btn--full"
            >
              <Ikon icon={Layers} size={16} name="layers" />
              <span>Åpne Workbench</span>
            </Link>
          </>
        )}
      </div>
      {velgOkt && <PH13LeggTilOkt exerciseId={drill.id} title={drill.name} onClose={() => setVelgOkt(false)} />}
    </div>
  );
}
