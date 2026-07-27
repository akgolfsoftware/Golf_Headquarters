"use client";

/**
 * Widget-pakke — «Stallen i dag» (AgencyOS cockpit).
 *
 * Dagens treningsøkter på tvers av stallen (begge økt-spor) — utfyller
 * «Dagens timer», som kun viser bookinger. Rad-klikk går til spillerens
 * side i stallen. Data fra getStallOkterData (src/lib/widgets/).
 */

import { useRouter } from "next/navigation";
import type { StallOkterData } from "@/lib/widgets/stall-okter-data";
import {
  T,
  Caps,
  Kort,
  Rad,
  StatusPill,
  AkseChip,
  TomTilstand,
  AvatarInit,
} from "@/components/v2";

export function StallOkterWidget({ data }: { data: StallOkterData }) {
  const router = useRouter();
  const { antall, fullfort, paagaar, okter } = data;

  return (
    <Kort
      eyebrow="Stallen i dag"
      action={
        antall > 0 ? <Caps size={9}>{`${fullfort}/${antall} fullført`}</Caps> : undefined
      }
    >
      {antall === 0 ? (
        <TomTilstand
          icon="users"
          title="Ingen treningsøkter i stallen i dag"
          sub="Planlegg neste uke i Workbench."
        />
      ) : (
        <>
          {paagaar > 0 && (
            <div style={{ marginBottom: 8 }}>
              <StatusPill tone="lime">{paagaar === 1 ? "1 økt pågår nå" : `${paagaar} økter pågår nå`}</StatusPill>
            </div>
          )}
          {okter.map((o, i) => (
            <Rad
              key={`${o.kilde}-${o.id}`}
              leading={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flex: "none" }}>
                  <span style={{ width: 40, fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: o.status === "now" ? T.lime : T.mut }}>
                    {o.tid}
                  </span>
                  <AvatarInit navn={o.spillerNavn} size={26} />
                </span>
              }
              title={o.spillerNavn}
              sub={`${o.tittel} · ${o.varighet} min`}
              meta={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <AkseChip a={o.pyramidArea} />
                  {o.status === "done" ? (
                    <StatusPill tone="up">Fullført</StatusPill>
                  ) : o.status === "now" ? (
                    <StatusPill tone="lime">Live</StatusPill>
                  ) : null}
                </span>
              }
              naa={o.status === "now"}
              onClick={() => router.push(o.href)}
              last={i === okter.length - 1}
            />
          ))}
        </>
      )}
    </Kort>
  );
}
