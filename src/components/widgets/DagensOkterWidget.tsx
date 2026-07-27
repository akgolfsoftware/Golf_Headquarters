"use client";

/**
 * Widget-pakke — «Dagens økter» (PlayerHQ).
 *
 * Kompakt kort som viser HELE dagens program fra GjennomforeData — begge
 * økt-spor (coach-plan + egne økter), samme kilde som Gjør-fanen, så Hjem
 * og Gjør aldri viser ulikt antall økter. Neste/pågående økt fremheves med
 * én grønn CTA; øvrige og fullførte listes som rader med hurtigstatus.
 *
 * Lenkene kommer ferdig fra loaderen (session-hrefs) — bygges aldri her.
 */

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markerOktStatus } from "@/lib/portal-gjennomfore/okt-status-actions";
import type { GjennomforeData, GjennomforeOkt } from "@/lib/portal-gjennomfore/gjennomfore-data";
import type { ReactNode } from "react";
import {
  T,
  Caps,
  Kort,
  Rad,
  StatusPill,
  AkseChip,
  CTAPill,
  Icon,
  HjelpTips,
} from "@/components/v2";
import { HurtigStatusKnapper, type HurtigStatusOkt } from "./HurtigStatusKnapper";

export function DagensOkterWidget({
  data,
  tomInnhold,
}: {
  data: GjennomforeData;
  /** Vises når dagen er tom — kalleren eier tom-tilstanden (f.eks. SG-anbefaling). */
  tomInnhold?: ReactNode;
}) {
  const router = useRouter();
  const { antall, nesteOkt, resteAvDagen, fullfortIdag } = data;
  const [oppdaterer, startOppdatering] = useTransition();
  const [oppdatererId, setOppdatererId] = useState<string | null>(null);

  const marker = (o: HurtigStatusOkt, status: "COMPLETED" | "SKIPPED") => {
    setOppdatererId(o.id);
    startOppdatering(async () => {
      await markerOktStatus({ id: o.id, kilde: o.kilde, status });
      router.refresh();
    });
  };

  const live = nesteOkt?.status === "now";

  const oktRad = (o: GjennomforeOkt, last: boolean) => (
    <Rad
      key={o.id}
      leading={
        o.status === "done" ? (
          <span
            style={{
              width: 26, height: 26, borderRadius: 9999, flex: "none",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: T.panel2, border: "1px solid transparent",
            }}
          >
            <Icon name="check" size={13} style={{ color: T.up }} />
          </span>
        ) : (
          <span style={{ width: 44, flex: "none", fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.mut }}>
            {o.tid}
          </span>
        )
      }
      title={o.tittel}
      sub={o.status === "done" ? `${o.tid} · ${o.varighet} min` : o.meta}
      meta={
        o.status === "done" ? (
          o.trengerLogg ? <StatusPill tone="warn">Trenger logg</StatusPill> : <StatusPill tone="up">Logget</StatusPill>
        ) : (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <AkseChip a={o.pyramidArea} />
            <HurtigStatusKnapper
              o={o}
              oppdaterer={oppdaterer && oppdatererId === o.id}
              onMarker={marker}
            />
          </span>
        )
      }
      onClick={() => router.push(o.status === "done" && o.trengerLogg ? `${o.href}?logg=1` : o.href)}
      last={last}
    />
  );

  return (
    <Kort
      eyebrow="Dagens økter"
      action={
        antall > 0 ? (
          <Caps size={9}>{`${fullfortIdag.length}/${antall} fullført`}</Caps>
        ) : undefined
      }
    >
      {antall === 0 ? (
        tomInnhold ?? null
      ) : (
        <>
          {nesteOkt && (
            <>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, lineHeight: 1.3 }}>
                {nesteOkt.tittel}
              </div>
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "8px 0 0" }}>
                {nesteOkt.meta} · {nesteOkt.coachNavn}
              </p>
              <div style={{ display: "flex", gap: 6, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
                <AkseChip a={nesteOkt.pyramidArea} />
                <HjelpTips k="pyramideAkse" size={11} />
                <StatusPill tone={live ? "lime" : "info"}>
                  {live ? "Pågår nå" : nesteOkt.relTidTekst}
                </StatusPill>
              </div>
              <div style={{ marginTop: 14 }}>
                <Link href={nesteOkt.href} style={{ textDecoration: "none", display: "block" }}>
                  <CTAPill icon="play" full>
                    {live ? "Fortsett økt" : "Start økt"}
                  </CTAPill>
                </Link>
              </div>
            </>
          )}

          {(resteAvDagen.length > 0 || fullfortIdag.length > 0) && (
            <div style={{ marginTop: nesteOkt ? 14 : 0 }}>
              {[...resteAvDagen, ...fullfortIdag].map((o, i, arr) => oktRad(o, i === arr.length - 1))}
            </div>
          )}
        </>
      )}
    </Kort>
  );
}
