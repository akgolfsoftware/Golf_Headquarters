/**
 * Analyse (Innsikt) · fane «spiller» — MASTERPLAN 15.8.
 *
 * Ren spillerliste. Duplikerer BEVISST IKKE `sammenlignMedSegSelv()`/
 * `AdminSpillerAnalyseV2` — hver rad drilner videre til den ferdigbygde
 * per-spiller-innsikten på `/admin/spillere/[id]/analyse` (spørsmål 1 av de
 * fire, «Utvikler hen seg raskt nok?», besvares der). Samme drill-mønster
 * som Turneringes «Dubletter» og Køs kilde-piller.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { AvatarInit, TomTilstand } from "@/components/v2";
import type { InnsiktSpillerRad } from "@/lib/admin/analyse/lastere";

const PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

export function InnsiktSpillerListe({ spillere }: { spillere: InnsiktSpillerRad[] }) {
  if (spillere.length === 0) {
    return (
      <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>
        <TomTilstand icon="users" title="Ingen spillere i stallen" sub="Ingen aktive spillere er koblet til deg ennå." />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 13, color: TL.mute, lineHeight: 1.55, maxWidth: "62ch" }}>
        Velg en spiller for å se utvikling mot seg selv over tid — samme referanse som spilleren
        selv ser, aldri en rangering mot kullet.
      </div>
      <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "4px 20px" }}>
        {spillere.map((s, i) => (
          <Link
            key={s.id}
            href={`/admin/spillere/${s.id}/analyse`}
            className={PRESS}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "15px 0",
              borderBottom: i < spillere.length - 1 ? `1px solid ${TL.hair}` : "none",
              textDecoration: "none",
            }}
          >
            <AvatarInit navn={s.navn} size={32} />
            <div style={{ flex: 1, fontSize: 15, fontWeight: 600, color: TL.text }}>{s.navn}</div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TL.mute} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5 L16 12 L9 19" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
