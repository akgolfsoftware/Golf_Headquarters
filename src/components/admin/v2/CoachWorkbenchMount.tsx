"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Caps, Kort, TomTilstand, AvatarInit, Velger, TilbakeLenke, type VelgerIdValg } from "@/components/v2";
import { TL } from "@/lib/v2/train-lock";
import { WorkbenchV2, type WorkbenchV2Actions } from "@/components/portal/v2/WorkbenchV2";
import type { WorkbenchData } from "@/lib/workbench/load-workbench";
import type { WorkbenchInsights } from "@/lib/workbench/types";
import type { PlanStatus } from "@/generated/prisma/client";
import type { SpillerStedValg } from "@/components/portal/v2/WorkbenchV2Sheets";
import "@/styles/workbench-lov.css";

export interface CoachRosterPlayer {
  id: string;
  navn: string;
}

export interface CoachWorkbenchMountProps {
  groups?: { id: string; name: string }[];
  players: CoachRosterPlayer[];
  currentPlayerId: string | null;
  playerName: string;
  coachName: string;
  data?: WorkbenchData;
  insights?: WorkbenchInsights | null;
  planStatus?: PlanStatus | null;
  actions?: WorkbenchV2Actions;
  wbMode?: "standard" | "pro";
  steder?: SpillerStedValg[];
}

function byggValg(players: CoachRosterPlayer[]): VelgerIdValg[] {
  const antallPerNavn = new Map<string, number>();
  for (const p of players) antallPerNavn.set(p.navn, (antallPerNavn.get(p.navn) ?? 0) + 1);
  return players.map((p) => ({
    value: p.id,
    label: (antallPerNavn.get(p.navn) ?? 0) > 1 ? `${p.navn} · ${p.id.slice(-4)}` : p.navn,
  }));
}

export function CoachWorkbenchMount({
  players,
  groups,
  currentPlayerId,
  playerName,
  coachName,
  data,
  insights,
  planStatus,
  actions,
  wbMode,
  steder,
}: CoachWorkbenchMountProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (players.length === 0 || currentPlayerId === null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Caps>Coach-workbench · {coachName}</Caps>
        <Kort>
          <TomTilstand icon="users" title="Ingen spillere i stallen" sub="Legg til spillere for å planlegge trening i Workbench." />
        </Kort>
      </div>
    );
  }

  const options = byggValg(players);
  const bytt = (id: string) => {
    if (id && id !== currentPlayerId) {
      const uke = searchParams.get("uke");
      const query = uke ? `?uke=${encodeURIComponent(uke)}` : "";
      router.push(`/admin/workbench/${id}${query}`);
    }
  };

  return (
    <div data-wb-lov="1" style={{ display: "flex", flexDirection: "column", gap: 16, background: "#F2F1ED", color: "#111111" }}>
      <TilbakeLenke href={`/admin/spillere/${currentPlayerId}`}>Tilbake til {playerName}</TilbakeLenke>
      <Kort pad="12px 16px">
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <AvatarInit navn={coachName} size={32} />
            <div style={{ minWidth: 0 }}>
              <Caps size={9}>Coach</Caps>
              <div style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {coachName}
              </div>
            </div>
          </div>
          <div style={{ marginLeft: "auto", minWidth: 220, flex: "1 1 260px", maxWidth: 360 }}>
            <Velger label="Planlegger for" options={options} value={currentPlayerId} onChange={bytt} />
          </div>
          {groups && groups.length > 0 && (
            <div style={{ minWidth: 180, flex: "0 1 220px" }}>
              <Velger
                label="Gruppe"
                options={[{ value: "", label: "Velg gruppe…" }, ...groups.map((g) => ({ value: g.id, label: g.name }))]}
                value=""
                onChange={(id) => {
                  if (id) router.push(`/admin/grupper/${id}/workbench`);
                }}
              />
            </div>
          )}
          <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: TL.mute, flex: "none" }}>
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
        actions={actions}
        wbMode={wbMode}
        steder={steder}
      />
    </div>
  );
}
