"use client";

/**
 * AgencyOS Kalender — v2 (retning C «Presis»). Komponert 1:1 fra mockup-fasit
 * ui_kits/v2/agencyos.jsx → funksjon Kalender (+ OktBlokk, SerieMerke, SerieMeny),
 * men drevet av EKTE data fra hentAgencyKalenderData
 * (../(v2preview)/v2-agency-kalender/data.ts).
 *
 * Coach-uke med alle spillere: 1-til-1-økter og gruppe-økter fra Booking, pluss
 * GJENTAKENDE SERIER fra GroupSchedule (WEEKLY) merket med SerieMerke. SerieMeny
 * («denne / alle fremtidige», Apple-idiom) bindes til en ekte serie — selve
 * redigeringen er delvis (struktur vises, handlingene er ikke koblet ennå).
 *
 * Kun v2-komponenter fra "@/components/v2" + skjerm-lokale komposisjoner på
 * T.*-tokens (samme mønster som CockpitV2/KalenderV2). Ingen rå hex.
 * V2Shell (montert i page.tsx) eier chrome-en.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  PillVelger,
  CTAPill,
  Kort,
  StatusPill,
  TomTilstand,
  Icon,
} from "@/components/v2";
import { type AkseKey } from "@/lib/v2/tokens";
import type { KalenderData, KalOkt, SerieMenyData } from "@/app/(v2preview)/v2-agency-kalender/data";

/** true på klient etter mount når viewport < 768px (styrer kun layout-tetthet). */
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

const SERIE_KANT = `color-mix(in srgb,${T.lime} 45%,transparent)`;
const SERIE_GLOW = `0 0 0 3px color-mix(in srgb,${T.lime} 10%,transparent)`;
const NAA_KANT = `color-mix(in srgb,${T.lime} 30%,transparent)`;

/* ── MikroMeta — liten mono-etikett m/ ikon (mockup-lokal) ── */
function MikroMeta({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.mut }}>
      <Icon name={icon} size={10} style={{ color: T.mut }} />
      {children}
    </span>
  );
}

/* ── SerieMerke — Apple Kalender-idiom: repeat-ikon + «Gjentas hver …» ── */
function SerieMerke({ tekst }: { tekst: string }) {
  return <MikroMeta icon="repeat">{tekst}</MikroMeta>;
}

/* ── OktBlokk — én økt i uke-grid/dag-liste ── */
function OktBlokk({ okt }: { okt: KalOkt }) {
  const erSerie = Boolean(okt.serie);
  const kant = okt.naa ? NAA_KANT : erSerie ? SERIE_KANT : T.border;
  const inner = (
    <div
      style={{
        background: erSerie || okt.naa ? `${T.tint}, ${T.panel2}` : T.panel2,
        border: `1px solid ${kant}`,
        boxShadow: erSerie ? SERIE_GLOW : "none",
        borderRadius: T.rRow,
        padding: "8px 9px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        cursor: okt.href ? "pointer" : "default",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>{okt.kl}</span>
        <span style={{ width: 5, height: 5, borderRadius: 9999, background: okt.akse ? T.ax[okt.akse as AkseKey] : T.mut, flex: "none" }} />
        {okt.naa && <StatusPill tone="down">Live</StatusPill>}
        {okt.gruppe != null && <MikroMeta icon="users">{okt.gruppe}</MikroMeta>}
      </div>
      <span style={{ fontFamily: T.ui, fontSize: 11.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{okt.navn}</span>
      {okt.sted && <MikroMeta icon="map-pin">{okt.sted}</MikroMeta>}
      {okt.serie && <SerieMerke tekst={okt.serie} />}
    </div>
  );
  return okt.href ? (
    <Link href={okt.href} style={{ textDecoration: "none" }}>
      {inner}
    </Link>
  ) : (
    inner
  );
}

/* ── SerieMeny — «Endre denne / alle fremtidige» (Apple-idiom) ── */
function SerieMeny({ serie, full }: { serie: SerieMenyData; full?: boolean }) {
  const valg = [
    { ikon: "calendar", l: "Endre bare denne økta", farge: T.fg },
    { ikon: "repeat", l: "Endre alle fremtidige", farge: T.fg },
    { ikon: "circle-slash", l: "Avslutt serien", farge: T.down },
  ];
  return (
    <div style={{ background: T.panel3, border: `1px solid ${T.borderS}`, borderRadius: 14, padding: "12px 14px", width: full ? "100%" : 240 }}>
      <Caps size={8.5}>Gjentakende økt</Caps>
      <div style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg, margin: "6px 0 2px" }}>
        {serie.navn} · {serie.dagTid}
      </div>
      {serie.starterLabel && (
        <div style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, color: T.mut, marginBottom: 2 }}>{serie.starterLabel}</div>
      )}
      {valg.map((x, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 0", borderBottom: i < valg.length - 1 ? `1px solid ${T.border}` : "none", cursor: "pointer" }}
        >
          <Icon name={x.ikon} size={13} style={{ color: x.farge }} />
          <span style={{ fontFamily: T.ui, fontSize: 12.5, color: x.farge }}>{x.l}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Dag-kolonne (desktop grid-celle) ── */
function DagKolonne({ dag }: { dag: KalenderData["dager"][number] }) {
  return (
    <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, padding: "2px 2px 6px", borderBottom: `1px solid ${dag.idag ? T.borderS : T.border}` }}>
        <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: dag.idag ? T.fg : T.mut }}>{dag.dag}</span>
        <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: dag.idag ? T.fg : T.fg2, fontVariantNumeric: "tabular-nums" }}>{dag.dato}</span>
        {dag.idag && <StatusPill>Nå</StatusPill>}
      </div>
      {dag.okter.length === 0 ? (
        <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, padding: "8px 2px" }}>Ingen økter</span>
      ) : (
        dag.okter.map((o) => <OktBlokk key={o.id} okt={o} />)
      )}
    </div>
  );
}

export function AgencyKalenderV2({ data }: { data: KalenderData }) {
  const mobile = useMobile();
  const [visning, setVisning] = useState("uke");

  // Nav-piler (ekte uke-navigasjon via ?uke=).
  const pil = (href: string, ikon: string, label: string) => (
    <Link
      href={href}
      aria-label={label}
      style={{ width: 30, height: 30, flex: "none", borderRadius: 9999, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: T.fg2 }}
    >
      <Icon name={ikon} size={14} />
    </Link>
  );

  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>{data.ukeLabel}</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile={mobile} em="uke.">Stallens</Tittel>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <PillVelger
          options={[
            { v: "dag", l: "Dag" },
            { v: "uke", l: "Uke" },
            { v: "maned", l: "Måned" },
          ]}
          value={visning}
          onChange={setVisning}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {!data.nav.erInnevaerende && (
            <Link
              href={data.nav.idag}
              style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg, background: T.panel3, border: `1px solid ${T.borderS}`, borderRadius: 9999, padding: "6px 13px", textDecoration: "none" }}
            >
              I dag
            </Link>
          )}
          {pil(data.nav.forrige, "chevron-left", "Forrige uke")}
          {pil(data.nav.neste, "chevron-right", "Neste uke")}
        </div>
        {!mobile && (
          <Link href="/admin/coach-workbench" style={{ textDecoration: "none" }}>
            <CTAPill icon="plus">Ny økt</CTAPill>
          </Link>
        )}
      </div>
    </div>
  );

  // Serie-hint + meny (ekte serie, delvis redigering).
  const serieSeksjon = data.serieMeny ? (
    <div>
      <Caps size={9} style={{ margin: "0 2px 8px" }}>
        {data.serieOkterAntall > 0
          ? "Trykk på en merket, gjentakende økt åpner denne menyen"
          : "Gjentakende serie · menyen åpnes når du trykker på en serie-økt"}
      </Caps>
      <SerieMeny serie={data.serieMeny} full={mobile} />
    </div>
  ) : null;

  const innsikt = data.innsikt ? (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}` }}>
      <Icon name="sparkles" size={13} style={{ color: T.lime, flex: "none", marginTop: 1 }} />
      <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.5 }}>{data.innsikt}</span>
    </div>
  ) : null;

  // ── Mobil: stablede dag-kort (kun dager med økter) ──
  if (mobile) {
    const dagerMedOkter = data.dager.filter((d) => d.okter.length > 0);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        {dagerMedOkter.length === 0 ? (
          <Kort>
            <TomTilstand icon="calendar" title="Ingen økter denne uka" sub="Uka er åpen — rom for planlegging." />
          </Kort>
        ) : (
          dagerMedOkter.map((d, i) => (
            <Kort key={i} eyebrow={`${d.dag} ${d.dato}${d.idag ? " · i dag" : ""}`}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {d.okter.map((o) => (
                  <OktBlokk key={o.id} okt={o} />
                ))}
              </div>
            </Kort>
          ))
        )}
        {serieSeksjon}
        {innsikt}
      </div>
    );
  }

  // ── Desktop: Dag / Uke / Måned ──
  let kropp: React.ReactNode;
  if (visning === "uke") {
    kropp = (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
        {data.dager.map((d, i) => (
          <DagKolonne key={i} dag={d} />
        ))}
      </div>
    );
  } else if (visning === "dag") {
    const valgt = data.dager.find((d) => d.idag) ?? data.dager[0];
    kropp = (
      <Kort eyebrow={`${valgt.dag} ${valgt.dato}${valgt.idag ? " · i dag" : ""}`}>
        {valgt.okter.length === 0 ? (
          <TomTilstand icon="calendar" title="Ingen økter denne dagen" sub="Dagen er åpen — rom for planlegging." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {valgt.okter.map((o) => (
              <OktBlokk key={o.id} okt={o} />
            ))}
          </div>
        )}
      </Kort>
    );
  } else {
    // Måned: ikke koblet til denne forhåndsvisnings-loaderen ennå (ærlig tom-tilstand).
    kropp = (
      <Kort>
        <TomTilstand icon="calendar" title="Månedsvisning kommer" sub="Denne forhåndsvisningen laster uke-data. Måned kobles i en senere bølge." />
      </Kort>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {kropp}
      {visning === "uke" && serieSeksjon}
      {innsikt}
    </div>
  );
}
