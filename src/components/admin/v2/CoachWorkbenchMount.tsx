"use client";

/**
 * COACH-WORKBENCH — v2 (retning C «Presis»). Tynn coach-innpakning rundt den
 * delte WorkbenchV2 (src/components/portal/v2/WorkbenchV2.tsx): den samme
 * tidslinje/bibliotek/balanse-flaten, men med coach-kontekst på toppen —
 * spiller-velger + roster — slik den ekte /admin/spillere/[id]/workbench gir.
 *
 * Ærlighet (prosjekt-regel): kun v2-komponenter fra "@/components/v2"; ingen
 * ad-hoc UI-komponenter (kun layout-divs, som i de andre v2-mountene). EKTE
 * roster fra Prisma — ingen fabrikerte spillere. Velger navigerer via
 * ?spiller=<id> og serveren laster den valgte spillerens EKTE plandata på nytt.
 * Ingen roster → ærlig tom-tilstand.
 */

import { useRouter, usePathname } from "next/navigation";
import { Caps, Kort, TomTilstand, AvatarInit, Velger } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import { WorkbenchV2 } from "@/components/portal/v2/WorkbenchV2";
import type { WorkbenchData } from "@/lib/workbench/load-workbench";
import type { WorkbenchInsights } from "@/lib/workbench/types";
import type { PlanStatus } from "@/generated/prisma/client";

export interface CoachRosterPlayer {
  id: string;
  navn: string;
}

export interface CoachWorkbenchMountProps {
  /** Full roster (EKTE spillere) for velgeren. */
  players: CoachRosterPlayer[];
  /** Aktiv spiller-id (fra ?spiller=, ellers første i roster). Null = tom stall. */
  currentPlayerId: string | null;
  /** Navnet på aktiv spiller (for topp-bar i WorkbenchV2). */
  playerName: string;
  coachName: string;
  /** WorkbenchV2-datakontrakt — uendret fra loadWorkbenchContext. */
  data?: WorkbenchData;
  insights?: WorkbenchInsights | null;
  planStatus?: PlanStatus | null;
}

/**
 * Bygg unike visnings-etiketter for velgeren (Velger er streng-basert). Ved
 * navnekollisjon disambiguer med et kort id-fragment, og hold en etikett→id-map
 * så navigasjonen forblir id-sikker.
 */
function byggValg(players: CoachRosterPlayer[]): {
  options: string[];
  labelTilId: Map<string, string>;
  idTilLabel: Map<string, string>;
} {
  const brukt = new Map<string, number>();
  const options: string[] = [];
  const labelTilId = new Map<string, string>();
  const idTilLabel = new Map<string, string>();
  for (const p of players) {
    const antall = brukt.get(p.navn) ?? 0;
    brukt.set(p.navn, antall + 1);
    const label = antall === 0 ? p.navn : `${p.navn} · ${p.id.slice(0, 4)}`;
    options.push(label);
    labelTilId.set(label, p.id);
    idTilLabel.set(p.id, label);
  }
  return { options, labelTilId, idTilLabel };
}

export function CoachWorkbenchMount({
  players,
  currentPlayerId,
  playerName,
  coachName,
  data,
  insights,
  planStatus,
}: CoachWorkbenchMountProps) {
  const router = useRouter();
  const pathname = usePathname();

  if (players.length === 0 || currentPlayerId === null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <Caps>Coach-workbench · {coachName}</Caps>
        <Kort>
          <TomTilstand
            icon="users"
            title="Ingen spillere i stallen"
            sub="Legg til spillere for å planlegge trening i Workbench."
          />
        </Kort>
      </div>
    );
  }

  const { options, labelTilId, idTilLabel } = byggValg(players);
  const aktivLabel = idTilLabel.get(currentPlayerId) ?? options[0];

  const bytt = (label: string) => {
    const id = labelTilId.get(label);
    if (id && id !== currentPlayerId) {
      router.push(`${pathname}?spiller=${id}`);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Coach-kontekstbar: hvem planlegger + spiller-velger (roster) */}
      <Kort pad="12px 16px">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <AvatarInit navn={coachName} size={32} />
            <div style={{ minWidth: 0 }}>
              <Caps size={9}>Coach</Caps>
              <div
                style={{
                  fontFamily: T.ui,
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.fg,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {coachName}
              </div>
            </div>
          </div>
          <div style={{ marginLeft: "auto", minWidth: 220, flex: "1 1 260px", maxWidth: 360 }}>
            <Velger
              label="Planlegger for"
              options={options}
              value={aktivLabel}
              onChange={bytt}
            />
          </div>
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: T.mut,
              flex: "none",
            }}
          >
            {players.length} spillere
          </span>
        </div>
      </Kort>

      <WorkbenchV2
        data={data}
        insights={insights ?? null}
        role="coach"
        playerName={playerName}
        coachName={coachName}
        planStatus={planStatus ?? null}
      />
    </div>
  );
}
