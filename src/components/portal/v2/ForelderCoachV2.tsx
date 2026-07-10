"use client";

/**
 * Foreldreportal · Coach (Meldinger) — v2 (retning C «Presis»). Komponert kun av
 * v2-komponenter fra "@/components/v2" (ingen ad-hoc UI, ingen rå hex — kun T.*).
 *
 * Faithful port av src/app/forelder/coach/page.tsx: foreldretilkoblet coach-dialog
 * er IKKE ferdig for beta. Sidens hele funksjon er å sette forventning (dialog
 * kommer Q3 2026), forklare personvern (private coach-notater forblir private),
 * og gi tydelig CTA til support. Ingen meldingsdata fabrikeres — det finnes ingen.
 *
 * V2Shell (montert i (v2preview)/v2-forelder-coach/page.tsx) eier chrome-en; denne
 * komponenten rendrer bare den indre innholds-stacken. Mobil-først: alt stabler i
 * én kolonne på 375px, CTA går full bredde på mobil.
 */

import { useEffect, useState } from "react";
import {
  T,
  Caps,
  Tittel,
  Kort,
  StatusPill,
  Rad,
  InnsiktChip,
  Knapp,
  Icon,
} from "@/components/v2";

/** Statisk datakontrakt fra den ekte skjermen — hardkodede beta-verdier, ikke fabrikkert innhold. */
export interface ForelderCoachData {
  /** Kvartal dialogen lanseres (den ekte siden sier «Q3 2026»). */
  lansering: string;
  /** Support-adresse for spørsmål i mellomtiden. */
  supportEpost: string;
}

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

export function ForelderCoachV2({ data }: { data: ForelderCoachData }) {
  const mobile = useMobile();
  const { lansering, supportEpost } = data;

  const skrivSupport = () => {
    window.location.href = `mailto:${supportEpost}?subject=${encodeURIComponent(
      "Spørsmål fra foreldre",
    )}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Caps>Foreldreportal · Coach</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="coach">
              Dialog med
            </Tittel>
          </div>
          <span
            style={{
              fontFamily: T.ui,
              fontSize: 12.5,
              color: T.mut,
              display: "block",
              marginTop: 8,
            }}
          >
            Se meldinger fra coachen og svar direkte. Private notater er ikke
            synlige her.
          </span>
        </div>
        <StatusPill tone="info">{`Kommer ${lansering}`}</StatusPill>
      </div>

      {/* Kommer snart — forventningssetting + CTA */}
      <Kort tint>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <span
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: T.panel3,
              border: `1px solid ${T.border}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <Icon name="message-circle" size={20} style={{ color: T.lime }} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: T.disp,
                fontWeight: 700,
                fontSize: mobile ? 17 : 19,
                letterSpacing: "-0.01em",
                color: T.fg,
                lineHeight: 1.3,
              }}
            >
              Coach-dialog kommer {lansering}
            </div>
            <p
              style={{
                fontFamily: T.ui,
                fontSize: 13,
                color: T.fg2,
                lineHeight: 1.6,
                margin: "8px 0 16px",
              }}
            >
              Du vil snart kunne lese delte meldinger fra coachen og svare
              direkte. Private coach-notater forblir kun synlige for coach og
              spiller.
            </p>
            <Knapp icon="mail" full={mobile} onClick={skrivSupport}>
              Kontakt support i mellomtiden
            </Knapp>
          </div>
        </div>
      </Kort>

      {/* Slik blir det — forhåndsvisning av funksjonen (ingen data, kun forventning) */}
      <Kort eyebrow="Slik blir det">
        <Rad
          leading={<Icon name="message-circle" size={16} style={{ color: T.fg2 }} />}
          title="Delte meldinger fra coach"
          sub="Les det coachen deler med deg om barnets utvikling"
        />
        <Rad
          leading={<Icon name="send" size={16} style={{ color: T.fg2 }} />}
          title="Svar direkte"
          sub="Still spørsmål og svar coachen fra samme sted"
        />
        <Rad
          leading={<Icon name="lock" size={16} style={{ color: T.fg2 }} />}
          title="Personvern er ivaretatt"
          sub="Private coach-notater forblir mellom coach og spiller"
          last
        />
      </Kort>

      {/* Personvern-note — stille påminnelse */}
      <InnsiktChip>
        Private coach-notater vises aldri i foreldreportalen. Du ser kun det
        coachen aktivt deler.
      </InnsiktChip>
    </div>
  );
}
