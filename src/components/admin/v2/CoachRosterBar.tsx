"use client";

import { useRouter } from "next/navigation";
import { Caps, Kort, AvatarInit, Velger, TilbakeLenke } from "@/components/v2";
import { TL } from "@/lib/v2/train-lock";

export function CoachRosterBar({
  players,
  currentPlayerId,
  playerName,
  coachName,
  uke,
}: {
  players: { id: string; navn: string }[];
  currentPlayerId: string;
  playerName: string;
  coachName: string;
  uke: string;
}) {
  const router = useRouter();
  const options = players.map((p) => ({ value: p.id, label: p.navn }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
      <TilbakeLenke href={`/admin/spillere/${currentPlayerId}`}>Tilbake til {playerName}</TilbakeLenke>
      <Kort pad="12px 16px">
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <AvatarInit navn={coachName} size={32} />
            <div style={{ minWidth: 0 }}>
              <Caps size={9}>Coach</Caps>
              <div style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>{coachName}</div>
            </div>
          </div>
          <div style={{ marginLeft: "auto", minWidth: 220, flex: "1 1 260px", maxWidth: 360 }}>
            <Velger
              label="Planlegger for"
              options={options}
              value={currentPlayerId}
              onChange={(id) => {
                if (id && id !== currentPlayerId) router.push(`/admin/workbench/${id}?uke=${encodeURIComponent(uke)}`);
              }}
            />
          </div>
          <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: TL.mute }}>
            {players.length} spillere
          </span>
        </div>
      </Kort>
    </div>
  );
}
