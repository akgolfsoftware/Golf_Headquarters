"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * Widget-pakke — «Stallen i dag» (AgencyOS cockpit).
 *
 * Dagens treningsøkter på tvers av stallen (begge økt-spor) — utfyller
 * «Dagens timer», som kun viser bookinger. Rad-klikk går til spillerens
 * side i stallen. Data fra getStallOkterData (src/lib/widgets/).
 */

import { useRouter } from "next/navigation";
import type { StallOkterData } from "@/lib/widgets/stall-okter-data";
import { Caps, Kort, Rad, StatusPill, AkseChip, TomTilstand, AvatarInit, Icon } from "@/components/v2";

export function StallOkterWidget({ data }: { data: StallOkterData }) {
  const router = useRouter();
  const { antall, fullfort, paagaar, antallGruppe, okter } = data;

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
          {(paagaar > 0 || antallGruppe > 0) && (
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              {paagaar > 0 && (
                <StatusPill tone="lime">{paagaar === 1 ? "1 økt pågår nå" : `${paagaar} økter pågår nå`}</StatusPill>
              )}
              {antallGruppe > 0 && (
                <StatusPill tone="info">
                  {antallGruppe === 1 ? "1 gruppeøkt" : `${antallGruppe} gruppeøkter`}
                </StatusPill>
              )}
            </div>
          )}
          {okter.map((o, i) => (
            <Rad
              key={`${o.kilde}-${o.id}`}
              leading={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flex: "none" }}>
                  <span style={{ width: 40, fontFamily: TL.font.mono, fontSize: 11, fontWeight: 700, color: o.status === "now" ? TL.fill : TL.mute }}>
                    {o.tid}
                  </span>
                  {o.erGruppe ? (
                    <span
                      style={{
                        width: 26, height: 26, borderRadius: 9999, flex: "none",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        background: TL.dock, border: `1px solid ${TL.hair}`,
                      }}
                    >
                      <Icon name="users" size={13} style={{ color: TL.mute }} />
                    </span>
                  ) : (
                    <AvatarInit navn={o.deltakerNavn} size={26} />
                  )}
                </span>
              }
              title={o.deltakerNavn}
              sub={
                o.erGruppe
                  ? `${o.tittel} · ${o.varighet} min · ${o.antallMedlemmer ?? 0} i gruppa`
                  : `${o.tittel} · ${o.varighet} min`
              }
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
