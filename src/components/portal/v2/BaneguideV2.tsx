"use client";

/**
 * PlayerHQ Baneguide — v2 (retning C «Presis»). Rekomponert fra den ekte
 * skjermen (src/app/portal/baneguide/page.tsx) med EKTE data fra getBaneLibrary.
 * Banebibliotek: baner med kartlagt geometri + baner spilleren har spilt.
 * Kun v2-komponenter fra "@/components/v2"; ingen ad-hoc UI, ingen rå hex (T.*).
 *
 * Ærlighet: ingen fabrikkerte tall — KPI-strimmelen er avledet direkte av
 * bibliotek-radene (antall baner, kartlagte baner, sum spilte runder). Detalj-
 * og hull-visning nås ved klikk på en rad → eksisterende /portal/baneguide/[id].
 *
 * V2Shell (montert i (v2preview)/v2-baneguide/page.tsx) eier chrome-en — denne
 * komponenten rendrer bare den indre innholds-stacken.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BaneLibraryItem } from "@/lib/baneguide/queries";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  KpiFlis,
  StatusPill,
  MikroMeta,
  TomTilstand,
  Icon,
} from "@/components/v2";

/** true på klient etter mount når viewport < 768px (styrer kun tittelstørrelse). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

export function BaneguideV2({ data }: { data: BaneLibraryItem[] }) {
  const mobile = useMobile();
  const router = useRouter();

  const kartlagte = data.filter((b) => b.hasGeometry).length;
  const sumRunder = data.reduce((s, b) => s + b.playerRounds, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div>
        <Caps>Baneguide</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile={mobile} em="dine">Banene</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "10px 0 0" }}>
          Spredningen din på hver bane du spiller.
        </p>
      </div>

      {data.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="map-pin"
            title="Ingen baner ennå"
            sub="Logg en runde for å komme i gang — banene dine dukker opp her."
          />
        </Kort>
      ) : (
        <>
          {/* KPI-strimmel — avledet av bibliotek-radene (ekte tall) */}
          <div className="grid grid-cols-3" style={{ gap: T.gap }}>
            <KpiFlis label="Baner" value={String(data.length)} />
            <KpiFlis label="Kartlagt" value={String(kartlagte)} />
            <KpiFlis label="Spilte runder" value={String(sumRunder)} tint />
          </div>

          {/* Banebibliotek */}
          <Kort eyebrow="Banebibliotek" action={<Caps size={9}>{data.length} baner</Caps>}>
            {data.map((b, i) => (
              <Rad
                key={b.id}
                onClick={() => router.push(`/portal/baneguide/${b.id}`)}
                leading={
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      flex: "none",
                      borderRadius: 9999,
                      background: T.panel2,
                      border: `1px solid ${T.border}`,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="map-pin" size={17} style={{ color: T.lime }} />
                  </span>
                }
                title={b.navn}
                sub={b.klubb}
                meta={
                  <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {b.hasGeometry ? (
                      <StatusPill tone="lime">{b.holesMapped} hull</StatusPill>
                    ) : (
                      <MikroMeta icon="clock">Kommer</MikroMeta>
                    )}
                    <MikroMeta icon="flag">{b.playerRounds} runder</MikroMeta>
                  </span>
                }
                last={i === data.length - 1}
              />
            ))}
          </Kort>
        </>
      )}
    </div>
  );
}
