"use client";

/** Coachinnsikt med eksisterende datakilder. Visningsruten avgrenser Precision-stilen; eldre V2-navn er beholdt for importene. */

import { useEffect, useState } from "react";
import Link from "next/link";
import { TL, TL_BREKK } from "@/lib/v2/train-lock";
import { ANALYSE_STALL_TREND_HREF } from "@/lib/admin/analyse/faner";

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

function CapsLabel({ children, size = 13 }: { children: React.ReactNode; size?: number }) {
  return (
    <span
      style={{
        fontSize: Math.max(13, size),
        fontWeight: TL.vekt.caps,
        letterSpacing: 0,
        textTransform: "none",
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

/** Lik skala og lesbarhet på begge sider av null. */
function KategoriBar({ k, hoyde }: { k: InnsiktHubV2Kategori; hoyde: number }) {
  const barHoyde = Math.max(4, Math.round((Math.min(Math.abs(k.pct), 100) / 100) * (hoyde / 2)));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: TL.text, fontVariantNumeric: "tabular-nums", opacity: 1 }}>
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
              opacity: 1,
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

export function InnsiktHubV2({ data, somFane }: { data: InnsiktHubV2Data; somFane?: boolean }) {
  const storrelse = useSkjermStorrelse();
  const wide = storrelse === "wide";
  const regular = storrelse === "regular";

  const spiller360Rad: PushRad = { navn: "Spiller 360", verdi: String(data.nSpillere), href: "/admin/spillere" };
  const trackmanRad: PushRad = {
    navn: "TrackMan",
    verdi: data.trackmanOkter > 0 ? `${data.trackmanOkter} økter` : "—",
    href: "/admin/trackman",
  };
  const fysRad: PushRad = { navn: "Fysisk trening", verdi: "Registreringer", href: "/admin/spillere" };
  const testerRad: PushRad = { navn: "Tester", verdi: "Protokoller og resultater", href: "/admin/tester" };
  const stallInnsiktRad: PushRad = { navn: "Stall-innsikt", verdi: "SG per kategori", href: ANALYSE_STALL_TREND_HREF };

  const dypereRader: PushRad[] = wide
    ? [spiller360Rad, trackmanRad, fysRad, testerRad]
    : [stallInnsiktRad, spiller360Rad, trackmanRad, fysRad, testerRad];

  const kpis = wide
    ? [
        { verdi: data.sgSnitt, label: "SG snitt" },
        { verdi: String(data.okterDenneUken), label: "Økter denne uken" },
        { verdi: String(data.udekket), label: "Uten planlagt økt" },
        { verdi: String(data.trackmanOkter), label: "TrackMan-økter" },
      ]
    : regular
      ? [
          { verdi: data.sgSnitt, label: "SG snitt" },
          { verdi: String(data.okterDenneUken), label: "Økter denne uken" },
          { verdi: String(data.udekket), label: "Uten planlagt økt" },
        ]
      : [
          { verdi: data.sgSnitt, label: "SG snitt" },
          { verdi: String(data.okterDenneUken), label: "Økter denne uken" },
        ];

  const motorTekst = "SG er beregnet fra spillernes registrerte runder. TrackMan og testresultater vises separat med eget målegrunnlag.";

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
      {!somFane && <CapsLabel>Academy · stallen</CapsLabel>}
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
        {!somFane && (
          <h1 style={{ margin: "6px 0 0", fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", color: TL.text }}>Innsikt</h1>
        )}
        <span style={{ fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
          {data.nSpillere} spillere · {data.periodeLabel}
        </span>
        {wide && (
          <Link
            href={ANALYSE_STALL_TREND_HREF}
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
            href={ANALYSE_STALL_TREND_HREF}
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
