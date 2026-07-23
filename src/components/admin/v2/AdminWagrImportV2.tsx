"use client";

/**
 * AgencyOS — Talent · WAGR-import, v2-port 16. juli 2026. Erstatter
 * AgPage/AgTable/AgChip-familien med v2-primitiver. Samme datakilde
 * (WagrSnapshot) og samme «Synk nå»-action (synkWagrNaa) uendret.
 */

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Caps, Tittel, Kort, Knapp, StatusPill, AvatarInit, TomTilstand, T } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { synkWagrNaa } from "@/app/admin/(legacy)/talent/wagr-import/actions";

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
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
        <div>
          <Caps>Talent · WAGR-import</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="verdensrankingen.">Synk mot</Tittel>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 13, lineHeight: 1.55, color: T.mut, margin: "10px 0 0", maxWidth: 560 }}>
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
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 10, background: T.panel2, color: T.lime, flex: "none" }}>
            <Icon name="globe" size={20} />
          </span>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>
              {data.koblede.length} av {data.antallSpillere} spillere har WAGR-profil
            </div>
            <div style={{ marginTop: 3, fontFamily: T.mono, fontSize: 11, color: T.mut }}>
              {data.sistSynketLabel ? `Sist synket ${data.sistSynketLabel}` : "Aldri synket"}
            </div>
          </div>
        </div>
      </Kort>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Caps>{`Matchede spillere · ${data.koblede.length}`}</Caps>
        <span style={{ flex: 1, height: 1, background: T.border }} />
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
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderTop: i ? `1px solid ${T.border}` : "none", textDecoration: "none" }}
            >
              <AvatarInit navn={s.navn} size={28} />
              <span style={{ flex: 1, minWidth: 0, fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{s.navn}</span>
              <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg }}>#{s.rank.toLocaleString("nb-NO")}</span>
              <StatusPill tone="up">Sikker match</StatusPill>
            </Link>
          ))
        )}
      </Kort>
    </div>
  );
}
