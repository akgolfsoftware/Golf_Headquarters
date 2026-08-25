"use client";

/**
 * SourcesPanel — venstrekolonnen (natt-plan Loop 2, SKALL).
 *
 * Innholdet (øvelsesbank, maler, tidligere uker) er bevisst utenfor Loop 2 —
 * `loadSources` returnerer tom liste til Loop 2T kobler på kildene. Panelet
 * finnes nå for å låse plassen i layouten og vise ærlig tom tilstand.
 */

import { Icon } from "@/components/v2/icon";
import { T } from "@/lib/v2/tokens";
import { UI } from "@/lib/domain/workbench/labels";
import type { SourceItem } from "@/lib/domain/workbench/types";

type Props = {
  kilder: SourceItem[];
};

export function SourcesPanel({ kilder }: Props) {
  return (
    <aside
      aria-label={UI.sourcesTitle}
      style={{
        background: T.panel,
        border: `1px solid ${T.border}`,
        borderRadius: T.rCard,
        padding: 14,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontFamily: T.mono,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: T.mut,
          marginBottom: 10,
        }}
      >
        {UI.sourcesTitle}
      </div>

      {kilder.length === 0 ? (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <Icon name="layers" size={14} style={{ color: T.mut, marginTop: 2 }} />
          <div>
            <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>
              {UI.emptySourcesTitle}
            </div>
            <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 3 }}>
              {UI.emptySourcesBody}
            </div>
          </div>
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
          {kilder.map((k) => (
            <li
              key={k.id}
              style={{
                fontFamily: T.ui,
                fontSize: 12.5,
                color: T.fg,
                padding: "7px 9px",
                borderRadius: T.rTag,
                background: T.panel2,
              }}
            >
              {k.title}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
