"use client";

/**
 * AgencyOS v2 — Talent · WAGR-import (`/admin/talent/wagr-import`,
 * AgencyOS Bølge 3.24, 2026-07-14). Port fra `(legacy)/talent/wagr-import/
 * page.tsx` + `wagr-actions.tsx` — samme `WagrSnapshot`-datamodell
 * (matchede spillere) og samme `synkWagrNaa`-server-action (uendret).
 */

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Caps, Tittel, Kort, Knapp, StatusPill, Icon, T, AvatarInit } from "@/components/v2";
import { synkWagrNaa } from "@/app/admin/(legacy)/talent/wagr-import/actions";

export interface WagrKobletV2 {
  id: string;
  rank: number;
  userId: string;
  userName: string;
}

function SynkNaaKnappV2() {
  const [pending, startTransition] = useTransition();

  function synk() {
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

      if (resultat.feilet.length > 0) toast.error(`Klarte ikke hente ${resultat.feilet.length} spillere (${resultat.feilet.join(", ")}) — prøv igjen senere.`);
      if (resultat.blittProff.length > 0) toast.info(`Blitt proff (ute av WAGR): ${resultat.blittProff.join(", ")} — siste amatørtall beholdes.`);
      if (resultat.tvetydige.length > 0) toast.warning(`Flere spillere deler navn (${resultat.tvetydige.join(", ")}) — koble disse manuelt.`);
    });
  }

  return (
    <Knapp icon={pending ? "loader" : "refresh-cw"} onClick={synk} disabled={pending}>{pending ? "Synker …" : "Synk nå"}</Knapp>
  );
}

export function AdminWagrImportV2({ koblede, antallSpillere, sistSynketTekst }: { koblede: WagrKobletV2[]; antallSpillere: number; sistSynketTekst: string | null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps size={9}>Talent · WAGR-import</Caps>
        <Tittel em="verdensrankingen.">Synk mot</Tittel>
        <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Hent World Amateur Golf Ranking for stallen din. Vi matcher på navn og fødselsdato.</p>
      </div>

      <Kort style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: T.panel2, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <Icon name="globe" size={20} style={{ color: T.lime }} />
        </span>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>{koblede.length} av {antallSpillere} spillere har WAGR-profil</div>
          <div style={{ marginTop: 2, fontFamily: T.mono, fontSize: 11, color: T.mut }}>{sistSynketTekst ? `Sist synket ${sistSynketTekst}` : "Aldri synket"}</div>
        </div>
        <SynkNaaKnappV2 />
      </Kort>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Caps size={9}>Matchede spillere · {koblede.length}</Caps>
          <span style={{ height: 1, flex: 1, background: T.border }} />
        </div>

        <div style={{ borderRadius: T.rCard, border: `1px solid ${T.border}`, overflow: "hidden" }}>
          {koblede.length === 0 ? (
            <div style={{ padding: "40px 16px", textAlign: "center", fontFamily: T.ui, fontSize: 13, color: T.mut }}>Ingen spillere koblet til WAGR ennå — importer fra wagr.com via Talent-modulen.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.ui, fontSize: 13 }}>
              <thead>
                <tr style={{ background: T.panel2, textAlign: "left" }}>
                  <th style={{ padding: "10px 14px" }}><Caps size={9}>Spiller</Caps></th>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}><Caps size={9}>WAGR</Caps></th>
                  <th style={{ padding: "10px 14px" }}><Caps size={9}>Match</Caps></th>
                </tr>
              </thead>
              <tbody>
                {koblede.map((s) => (
                  <tr key={s.id} style={{ borderTop: `1px solid ${T.border}` }}>
                    <td style={{ padding: "10px 14px" }}>
                      <Link href={`/admin/spillere/${s.userId}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                        <AvatarInit navn={s.userName} size={28} />
                        <span style={{ fontWeight: 600, color: T.fg }}>{s.userName}</span>
                      </Link>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: T.mono, color: T.fg }}>#{s.rank.toLocaleString("nb-NO")}</td>
                    <td style={{ padding: "10px 14px" }}><StatusPill tone="up">Sikker match</StatusPill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
