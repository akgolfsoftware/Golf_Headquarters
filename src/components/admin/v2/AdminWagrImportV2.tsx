"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * AgencyOS — Talent · WAGR-import, v2-port 16. juli 2026. Erstatter
 * AgPage/AgTable/AgChip-familien med v2-primitiver. Samme datakilde
 * (WagrSnapshot) og samme «Synk nå»-action (synkWagrNaa) uendret.
 */

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Caps, Kort, Knapp, StatusPill, AvatarInit, TomTilstand } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { synkWagrNaa } from "@/app/admin/talent/wagr-import/actions";

export interface WagrKobletRad {
  id: string;
  spillerId: string;
  navn: string;
  rank: number;
}
export interface AdminWagrImportV2Data {
  koblede: WagrKobletRad[];
  antallSpillere: number;
  sistSynketLabel: string | null;
}

function SynkNaaKnapp() {
  const [pending, startTransition] = useTransition();
  return (
    <Knapp
      icon="refresh-cw"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await synkWagrNaa();
          if (!res.ok) {
            toast.error(`Synk feilet: ${res.feil}`);
            return;
          }
          const { resultat } = res;
          const antallForsokt = resultat.hentet + resultat.blittProff.length + resultat.feilet.length;
          const deler: string[] = [`${resultat.oppdatert} av ${antallForsokt} rankinger oppdatert fra wagr.com`];
          deler.push(resultat.nyKoblet > 0 ? `${resultat.nyKoblet} nye spillere koblet` : "ingen nye spillere å koble");
          toast.success(`Synk fullført: ${deler.join(", ")}.`);
          if (resultat.feilet.length > 0) {
            toast.error(`Klarte ikke hente ${resultat.feilet.length} spillere (${resultat.feilet.join(", ")}) — prøv igjen senere.`);
          }
          if (resultat.blittProff.length > 0) {
            toast.info(`Blitt proff (ute av WAGR): ${resultat.blittProff.join(", ")} — siste amatørtall beholdes.`);
          }
          if (resultat.tvetydige.length > 0) {
            toast.warning(`Flere spillere deler navn (${resultat.tvetydige.join(", ")}) — koble disse manuelt.`);
          }
        })
      }
    >
      {pending ? "Synker …" : "Synk nå"}
    </Knapp>
  );
}

export function AdminWagrImportV2({ data }: { data: AdminWagrImportV2Data }) {
  const statusTone = data.koblede.length === 0 ? "info" as const : data.koblede.length < data.antallSpillere ? "warn" as const : "lime" as const;
  const statusTekst =
    data.koblede.length === 0
      ? "Ingen koblet ennå"
      : `${data.koblede.length} av ${data.antallSpillere} koblet`;

  return (
    <div data-paper-wave-h="wagrimport" data-paper-pattern  style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
        <div>
          <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>WAGR-import</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>AgencyOS</span>
        </div>
          <p style={{ fontFamily: TL.font.sans, fontSize: 13, lineHeight: 1.55, color: TL.mute, margin: "10px 0 0", maxWidth: 560 }}>
            Hent World Amateur Golf Ranking for stallen din. Vi matcher på navn og fødselsdato.
          </p>
        </div>
        <StatusPill tone={statusTone}>{statusTekst}</StatusPill>
      </div>

      {/* B: én primær CTA */}
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        <SynkNaaKnapp />
      </div>

      <Kort>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 10, background: TL.dock, color: TL.fill, flex: "none" }}>
            <Icon name="globe" size={20} />
          </span>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 15, color: TL.text }}>
              {data.koblede.length} av {data.antallSpillere} spillere har WAGR-profil
            </div>
            <div style={{ marginTop: 3, fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>
              {data.sistSynketLabel ? `Sist synket ${data.sistSynketLabel}` : "Aldri synket"}
            </div>
          </div>
        </div>
      </Kort>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Caps>{`Matchede spillere · ${data.koblede.length}`}</Caps>
        <span style={{ flex: 1, height: 1, background: TL.hair }} />
      </div>

      <Kort pad="0">
        {data.koblede.length === 0 ? (
          <TomTilstand
            icon="globe"
            title="Ingen spillere koblet til WAGR ennå"
            sub="Trykk «Synk nå» for å hente ranking fra wagr.com og matche stallen."
          />
        ) : (
          data.koblede.map((s, i) => (
            <Link
              key={s.id}
              href={`/admin/spillere/${s.spillerId}`}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderTop: i ? `1px solid ${TL.hair}` : "none", textDecoration: "none" }}
            >
              <AvatarInit navn={s.navn} size={28} />
              <span style={{ flex: 1, minWidth: 0, fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>{s.navn}</span>
              <span style={{ fontFamily: TL.font.mono, fontSize: 12, fontWeight: 700, color: TL.text }}>#{s.rank.toLocaleString("nb-NO")}</span>
              <StatusPill tone="up">Sikker match</StatusPill>
            </Link>
          ))
        )}
      </Kort>
    </div>
  );
}
