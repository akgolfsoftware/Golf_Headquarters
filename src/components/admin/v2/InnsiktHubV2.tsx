"use client";

/**
 * AgencyOS Innsikt-hub — Train-lock (T11, 27.08.2026).
 *
 * Fasit: `AG-07 Innsikt-hub.dc.html` (AG-07a iPhone / AG-07b iPad / AG-07c
 * Mac). Erstatter `AdminAnalyseV2` (Paper T.*-tokens) på `/admin/analyse`.
 *
 * Tokens: KUN TL (src/lib/v2/train-lock.ts) — se CLAUDE.md invariant 2.
 * Ingen InnsiktHubNav-pillrad her: fasiten viser ingen subnav på AG-07 —
 * navigasjon skjer via V2Shell-railen («Innsikt» er allerede aktiv) og de
 * seks/syv «Gå dypere»-radene under.
 *
 * Motor-skille (harde regel, se fasit-bildetekst «blandes aldri i samme
 * tall»): SG-tallene her er Broadie-SG fra egne runder (Round.sgTotal/sgOtt/
 * sgApp/sgArg/sgPutt). DataGolf, TrackMan og Fys/tester er ALLTID push-rader
 * til egne flater med egne motorer — aldri smeltet inn i disse KPI-ene.
 *
 * Avvik fra fasiten (dokumentert, se docs/natt/T11-DONE.md):
 * - «Udekket» (Mac-KPI 3) er definert som spillere uten planlagt økt inneværende
 *   uke — nærmeste ærlige tolkning appen har data til, ikke fasitens ordrette
 *   kilde (som ikke er spesifisert i fasit-bildeteksten).
 * - DataGolf og Fys og last har ingen egen stall-nivå-flate i appen ennå —
 *   radene lenker til Spiller 360 (`/admin/spillere`) der per-spiller-data
 *   finnes, i påvente av egne flater.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { TL, TL_BREKK } from "@/lib/v2/train-lock";

const PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

type SkjermStorrelse = "compact" | "regular" | "wide";

function useSkjermStorrelse(): SkjermStorrelse {
  const [s, setS] = useState<SkjermStorrelse>("compact");
  useEffect(() => {
    const mqRegular = window.matchMedia(`(min-width: ${TL_BREKK.ipadSmal}px)`);
    const mqWide = window.matchMedia(`(min-width: ${TL_BREKK.macRail}px)`);
    const oppdater = () => setS(mqWide.matches ? "wide" : mqRegular.matches ? "regular" : "compact");
    oppdater();
    mqRegular.addEventListener("change", oppdater);
    mqWide.addEventListener("change", oppdater);
    return () => {
      mqRegular.removeEventListener("change", oppdater);
      mqWide.removeEventListener("change", oppdater);
    };
  }, []);
  return s;
}

export type InnsiktHubV2Kategori = {
  key: string;
  label: string;
  verdi: string;
  pct: number;
  negativ: boolean;
};

export type InnsiktHubV2Data = {
  nSpillere: number;
  periodeLabel: string;
  sgSnitt: string;
  okterDenneUken: number;
  udekket: number;
  trackmanOkter: number;
  kategorier: InnsiktHubV2Kategori[];
  harKategoriData: boolean;
  lekkasjeTekst: string | null;
};

function CapsLabel({ children, size = 11 }: { children: React.ReactNode; size?: number }) {
  return (
    <span
      style={{
        fontSize: size,
        fontWeight: TL.vekt.caps,
        letterSpacing: TL.track.capsSm,
        textTransform: "uppercase",
        color: TL.mute,
      }}
    >
      {children}
    </span>
  );
}

function KpiKort({ verdi, unit, label }: { verdi: string; unit?: string; label: string }) {
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>
      <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", color: TL.text, fontVariantNumeric: "tabular-nums" }}>
        {verdi}
        {unit && <span style={{ fontSize: 20, fontWeight: 600, marginLeft: 2 }}>{unit}</span>}
      </div>
      <div style={{ marginTop: 8 }}>
        <CapsLabel>{label}</CapsLabel>
      </div>
    </div>
  );
}

/** Søylediagram for SG per kategori — negativ verdi er opacity 0.4 på søylen, aldri rødt. */
function KategoriBar({ k, hoyde }: { k: InnsiktHubV2Kategori; hoyde: number }) {
  const barHoyde = Math.max(4, Math.round((Math.min(Math.abs(k.pct), 100) / 100) * (hoyde / 2)));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: TL.text, fontVariantNumeric: "tabular-nums", opacity: k.negativ ? TL.opasitet.negativ : 1 }}>
        {k.verdi}
      </span>
      <div style={{ position: "relative", width: "100%", height: hoyde, marginTop: 8 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: hoyde / 2, height: 1, background: TL.hair }} />
        {k.negativ ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              width: 28,
              top: hoyde / 2 + 1,
              height: barHoyde,
              background: TL.text,
              opacity: 0.4,
              borderRadius: "0 0 4px 4px",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              width: 28,
              bottom: hoyde / 2,
              height: barHoyde,
              background: TL.text,
              borderRadius: "4px 4px 0 0",
            }}
          />
        )}
      </div>
      <div style={{ marginTop: 8 }}>
        <CapsLabel>{k.label}</CapsLabel>
      </div>
    </div>
  );
}

type PushRad = { navn: string; verdi: string; href: string };

function PushListe({ rader }: { rader: PushRad[] }) {
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "4px 20px" }}>
      {rader.map((r, i) => (
        <Link
          key={r.navn}
          href={r.href}
          className={PRESS}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "15px 0",
            borderBottom: i < rader.length - 1 ? `1px solid ${TL.hair}` : "none",
            textDecoration: "none",
          }}
        >
          <div style={{ flex: 1, fontSize: 15, fontWeight: 600, color: TL.text }}>{r.navn}</div>
          <span style={{ fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{r.verdi}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TL.mute} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5 L16 12 L9 19" />
          </svg>
        </Link>
      ))}
    </div>
  );
}

export function InnsiktHubV2({ data }: { data: InnsiktHubV2Data }) {
  const storrelse = useSkjermStorrelse();
  const wide = storrelse === "wide";
  const regular = storrelse === "regular";

  const spiller360Rad: PushRad = { navn: "Spiller 360", verdi: String(data.nSpillere), href: "/admin/spillere" };
  const dataGolfRad: PushRad = { navn: "DataGolf", verdi: "egen motor", href: "/admin/spillere" };
  const trackmanRad: PushRad = {
    navn: "TrackMan",
    verdi: data.trackmanOkter > 0 ? `${data.trackmanOkter} økter` : "—",
    href: "/admin/trackman",
  };
  const fysRad: PushRad = { navn: "Fys og last", verdi: "ACWR", href: "/admin/spillere" };
  const testerRad: PushRad = { navn: "Tester", verdi: "TN-batteri", href: "/admin/tester" };
  const okonomiRad: PushRad = { navn: "Økonomi", verdi: "YTD", href: "/admin/agencyos/okonomi" };
  const stallInnsiktRad: PushRad = { navn: "Stall-innsikt", verdi: "SG per kategori", href: "/admin/analyse/stall" };

  const dypereRader: PushRad[] = wide
    ? [spiller360Rad, dataGolfRad, trackmanRad, fysRad, testerRad, okonomiRad]
    : [stallInnsiktRad, spiller360Rad, dataGolfRad, trackmanRad, fysRad, testerRad];

  const kpis = wide
    ? [
        { verdi: data.sgSnitt, label: "SG snitt" },
        { verdi: String(data.okterDenneUken), label: "Økter denne uken" },
        { verdi: String(data.udekket), label: "Udekket" },
        { verdi: String(data.trackmanOkter), label: "TrackMan-økter" },
      ]
    : regular
      ? [
          { verdi: data.sgSnitt, label: "SG snitt" },
          { verdi: String(data.okterDenneUken), label: "Økter denne uken" },
          { verdi: String(data.udekket), label: "Udekket" },
        ]
      : [
          { verdi: data.sgSnitt, label: "SG snitt" },
          { verdi: String(data.okterDenneUken), label: "Økter denne uken" },
        ];

  const motorTekst =
    storrelse === "wide"
      ? "Fire motorer, fire flater: Broadie-SG · DataGolf · PEI · TrackMan. Aldri samme tall."
      : "Broadie-SG, DataGolf, PEI og TrackMan blandes aldri i samme tall.";

  const kategoriKort = data.harKategoriData ? (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: wide ? 24 : 20, display: "flex", flexDirection: "column" }}>
      <CapsLabel>SG per kategori · stall</CapsLabel>
      <div style={{ marginTop: wide ? 20 : 16, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", flex: wide ? 1 : undefined, alignContent: wide ? "center" : undefined }}>
        {data.kategorier.map((k) => (
          <KategoriBar key={k.key} k={k} hoyde={wide ? 220 : regular ? 130 : 90} />
        ))}
      </div>
      {data.lekkasjeTekst && (
        <div style={{ marginTop: 12, fontSize: 13, color: TL.mute }}>{data.lekkasjeTekst}</div>
      )}
    </div>
  ) : (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>
      <CapsLabel>SG per kategori · stall</CapsLabel>
      <div style={{ marginTop: 10, fontSize: 13, color: TL.mute, lineHeight: 1.45 }}>
        Ingen runder med SG-fordeling logget i perioden ennå.
      </div>
    </div>
  );

  const eyebrow = (
    <>
      <CapsLabel>Academy · stallen</CapsLabel>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
        <h1 style={{ margin: "6px 0 0", fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", color: TL.text }}>Innsikt</h1>
        <span style={{ fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
          {data.nSpillere} spillere · {data.periodeLabel}
        </span>
        {wide && (
          <Link
            href="/admin/analyse/stall"
            className={PRESS}
            style={{
              marginLeft: "auto",
              height: 44,
              padding: "0 22px",
              borderRadius: TL.radius.pill,
              background: TL.fill,
              color: TL.onFill,
              fontSize: 15,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            Åpne stall-innsikt
          </Link>
        )}
      </div>
    </>
  );

  if (wide) {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {eyebrow}
        <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {kpis.map((k) => (
            <KpiKort key={k.label} {...k} />
          ))}
        </div>
        <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 24, alignItems: "start" }}>
          {kategoriKort}
          <div>
            <CapsLabel>Gå dypere</CapsLabel>
            <div style={{ marginTop: 12 }}>
              <PushListe rader={dypereRader} />
            </div>
            <div style={{ marginTop: 16, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>{motorTekst}</div>
          </div>
        </div>
      </div>
    );
  }

  if (regular) {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {eyebrow}
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {kpis.map((k) => (
            <KpiKort key={k.label} {...k} />
          ))}
        </div>
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
          {kategoriKort}
          <PushListe rader={dypereRader} />
        </div>
        <div style={{ marginTop: 18 }}>
          <Link
            href="/admin/analyse/stall"
            className={PRESS}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 48,
              width: 300,
              maxWidth: "100%",
              borderRadius: TL.radius.pill,
              background: TL.fill,
              color: TL.onFill,
              fontSize: 16,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Åpne stall-innsikt
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {eyebrow}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {kpis.map((k) => (
          <KpiKort key={k.label} {...k} />
        ))}
      </div>
      {kategoriKort}
      <div>
        <CapsLabel>Gå dypere</CapsLabel>
        <div style={{ marginTop: 10 }}>
          <PushListe rader={dypereRader} />
        </div>
      </div>
      <div style={{ fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>{motorTekst}</div>
    </div>
  );
}
