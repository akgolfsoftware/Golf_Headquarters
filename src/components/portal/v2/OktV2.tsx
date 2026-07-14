"use client";

/**
 * PlayerHQ Økt (økt-detalj) — v2 (retning C «Presis»). Komponert 1:1 fra
 * ui_kits/v2/phq-kalender.jsx → funksjonen Okt, men med EKTE data fra
 * getOktDetaljData (src/lib/portal-okt/okt-detalj-data.ts). Kun v2-komponenter
 * fra "@/components/v2"; ingen ad-hoc UI. Ingen rå hex (kun T.*-tokens).
 *
 * V2Shell (montert i (v2preview)/v2-okt/page.tsx) eier chrome-en — denne
 * komponenten rendrer bare den indre innholds-stacken.
 */

import { useEffect, useState } from "react";
import type { OktDetaljData, OktDrill } from "@/lib/portal-okt/okt-detalj-data";
import type { AkseKey } from "@/lib/v2/tokens";
import {
  T,
  Caps,
  Tittel,
  CTAPill,
  Kort,
  Rad,
  AkseChip,
  PyramideSyklusChip,
  StatusPill,
  InnsiktChip,
  TomTilstand,
  Icon,
} from "@/components/v2";

/** Skrive-handling for per-drill pyramide (fra siden). Utelatt → skrivebeskyttet. */
export type SettDrillPyramide = (
  drillId: string,
  pyramide: AkseKey,
) => Promise<{ ok: boolean; error?: string }>;

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
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

/** Status-sirkel foran hver øvelse (fullført · nå · gjenstår). */
function DrillPrikk({ status }: { status: OktDrill["status"] }) {
  const done = status === "done";
  const naa = status === "naa";
  const bg = done
    ? `color-mix(in srgb,${T.up} 12%,transparent)`
    : naa
      ? `color-mix(in srgb,${T.lime} 12%,transparent)`
      : T.panel2;
  return (
    <span
      style={{
        width: 26, height: 26, borderRadius: 9999, flex: "none",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: bg, border: `1px solid ${done || naa ? "transparent" : T.border}`,
      }}
    >
      <Icon
        name={done ? "check" : naa ? "play" : "circle"}
        size={13}
        style={{ color: done ? T.up : naa ? T.lime : T.mut }}
      />
    </span>
  );
}

export function OktV2({ data, onSettPyramide }: { data: OktDetaljData; onSettPyramide?: SettDrillPyramide }) {
  const mobile = useMobile();

  // Tom-tilstand: ingen økt funnet for testbrukeren (ærlig, aldri liksom-økt).
  if (!data.found) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div>
          <Caps>Økt</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="økt">Din</Tittel>
          </div>
        </div>
        <Kort>
          <TomTilstand
            icon="calendar"
            title="Ingen økt å vise"
            sub="Når coachen din legger inn en økt, ser du øvelsene og oppsettet her."
          />
        </Kort>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps>{`${data.datoTekst} · ${data.tidTekst} · ${data.sted}`}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em={data.emTittel}>{data.pyramide} ·</Tittel>
          </div>
        </div>
        {data.kanStarte ? (
          <CTAPill icon="play">{data.startLabel}</CTAPill>
        ) : (
          <StatusPill tone={data.statusTone}>{data.statusLabel}</StatusPill>
        )}
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-[3fr_2fr]"
        style={{ gap: T.gap, alignItems: "start" }}
      >
        {/* Venstre: øvelser + endringsforslag */}
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <Kort
            eyebrow={`Øvelser · ${data.antallDrills} i økta`}
            action={data.antallFullfort > 0 ? <Caps size={9}>{data.antallFullfort} fullført</Caps> : undefined}
          >
            {data.drills.length > 0 ? (
              data.drills.map((o, i) => (
                <Rad
                  key={o.id}
                  leading={<DrillPrikk status={o.status} />}
                  title={o.navn}
                  sub={o.beskrivelse ?? undefined}
                  meta={
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <PyramideSyklusChip
                        verdi={o.pyramide}
                        onEndre={onSettPyramide ? (neste) => onSettPyramide(o.id, neste) : undefined}
                      />
                      {o.volum && (
                        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, whiteSpace: "nowrap" }}>{o.volum}</span>
                      )}
                    </span>
                  }
                  naa={o.status === "naa"}
                  trailing={null}
                  last={i === data.drills.length - 1}
                />
              ))
            ) : (
              <TomTilstand icon="target" title="Ingen øvelser ennå" sub="Coachen legger til øvelser før økta starter." />
            )}
          </Kort>
          <InnsiktChip cta="Be om endring" href="/portal/onskeligokt">
            Passer ikke tida? Coachen din ser forslaget ditt med en gang.
          </InnsiktChip>
        </div>

        {/* Høyre: hvorfor + oppsett */}
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          {data.hvorfor && (
            <Kort tint eyebrow="Hvorfor denne økta">
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: 0 }}>
                {data.hvorfor}
              </p>
              <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                <AkseChip a={data.pyramide} />
                <StatusPill tone={data.statusTone}>{data.statusLabel}</StatusPill>
              </div>
            </Kort>
          )}
          {data.oppsett.length > 0 && (
            <Kort eyebrow="Slik er økta satt opp">
              {data.oppsett.map((r, i) => (
                <Rad
                  key={r.label}
                  title={r.value}
                  leading={<span style={{ width: 78, flex: "none" }}><Caps size={8.5}>{r.label}</Caps></span>}
                  trailing={null}
                  last={i === data.oppsett.length - 1}
                />
              ))}
            </Kort>
          )}
        </div>
      </div>
    </div>
  );
}
