"use client";

/**
 * AgencyOS — Talent · Regional pipeline, v2-port 17. juli 2026. Rekomponerer
 * den gamle /admin/(legacy)/talent/region-skjermen i v2-idiomet med IDENTISK
 * datakontrakt: TalentTracking gruppert per region (pin-kart over Norge +
 * region-tabell med antall/snitt/topp-klubber). Nivå-filteret (?niva=) er
 * flyttet til klienten (alle rader lastes én gang) — samme mønster som
 * discovery. Kartet er samme forenklede SVG-pin-stub som legacy-skjermen
 * (visuell anker, ikke geografisk presist) — ingen ekstern kart-avhengighet.
 */

import { useMemo, useState } from "react";
import { Caps, Tittel, Kort, Rad, PillVelger, TomTilstand, T } from "@/components/v2";
import { HjelpTips } from "@/components/v2/hjelp";

// ── Datakontrakt (rå rader fra ruten — aggregeres her) ──────────
export interface RegionTalentRad {
  region: string | null;
  klubb: string | null;
  niva: string;
  /** De fem radar-verdiene (fysisk/teknikk/taktikk/mental/motivasjon). */
  verdier: (number | null)[];
}
export interface AdminTalentRegionV2Data {
  nivaer: string[];
  rader: RegionTalentRad[];
}

type RegionId = "ost" | "vest" | "sor" | "nord" | "midt" | "innland" | "trondelag";

// Forenklet pin-kart over Norge — én pin per region (samme stub som legacy).
const REGION_PINS: { id: RegionId; label: string; matchKeys: string[]; x: number; y: number }[] = [
  { id: "nord", label: "Nord", matchKeys: ["nord", "troms", "finnmark", "nordland"], x: 220, y: 60 },
  { id: "trondelag", label: "Trøndelag", matchKeys: ["trøndelag", "trondelag", "trondheim"], x: 200, y: 130 },
  { id: "midt", label: "Midt", matchKeys: ["midt", "møre"], x: 145, y: 180 },
  { id: "innland", label: "Innland", matchKeys: ["innland", "hedmark", "oppland"], x: 260, y: 230 },
  { id: "vest", label: "Vest", matchKeys: ["vest", "hordaland", "bergen", "rogaland", "stavanger"], x: 100, y: 265 },
  { id: "ost", label: "Øst", matchKeys: ["øst", "ost", "oslo", "akershus", "østfold", "ostfold"], x: 230, y: 295 },
  { id: "sor", label: "Sør", matchKeys: ["sør", "sor", "vestfold", "telemark", "agder"], x: 175, y: 345 },
];

function tilRegionId(region: string | null): RegionId | null {
  if (!region) return null;
  const q = region.toLowerCase();
  for (const pin of REGION_PINS) {
    if (pin.matchKeys.some((k) => q.includes(k))) return pin.id;
  }
  return null;
}

function avg(values: Array<number | null | undefined>): number | null {
  const tall = values.filter((v): v is number => typeof v === "number");
  if (tall.length === 0) return null;
  return tall.reduce((s, v) => s + v, 0) / tall.length;
}

function kd(v: number | null, d = 1): string {
  return v == null ? "—" : v.toFixed(d).replace(".", ",");
}

type Agg = {
  id: RegionId | "ukjent";
  label: string;
  antall: number;
  snitt: number | null;
  toppKlubber: { navn: string; antall: number }[];
};

export function AdminTalentRegionV2({ data }: { data: AdminTalentRegionV2Data }) {
  const [valgtNiva, setValgtNiva] = useState<string>("alle");

  const filtrert = useMemo(
    () => (valgtNiva === "alle" ? data.rader : data.rader.filter((r) => r.niva === valgtNiva)),
    [data.rader, valgtNiva],
  );

  const { regioner, antallPerPin } = useMemo(() => {
    const map = new Map<RegionId | "ukjent", { rader: RegionTalentRad[]; klubber: Map<string, number> }>();
    for (const r of filtrert) {
      const rid = tilRegionId(r.region) ?? "ukjent";
      const eks = map.get(rid) ?? { rader: [], klubber: new Map<string, number>() };
      eks.rader.push(r);
      if (r.klubb) eks.klubber.set(r.klubb, (eks.klubber.get(r.klubb) ?? 0) + 1);
      map.set(rid, eks);
    }
    const alle: Agg[] = [...REGION_PINS.map((p) => ({ id: p.id as RegionId | "ukjent", label: p.label })), { id: "ukjent" as const, label: "Ukjent" }]
      .map(({ id, label }) => {
        const e = map.get(id);
        if (!e) return { id, label, antall: 0, snitt: null, toppKlubber: [] };
        return {
          id,
          label,
          antall: e.rader.length,
          snitt: avg(e.rader.flatMap((r) => r.verdier)),
          toppKlubber: [...e.klubber.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([navn, antall]) => ({ navn, antall })),
        };
      });
    const antallPerPin = new Map(alle.map((a) => [a.id, a.antall]));
    return { regioner: alle.filter((a) => a.antall > 0), antallPerPin };
  }, [filtrert]);

  const hode = (
    <div>
      <Caps>Talent · Regional pipeline</Caps>
      <div style={{ marginTop: 10 }}>
        <Tittel em={valgtNiva === "alle" ? "regioner." : valgtNiva}>
          {valgtNiva === "alle" ? "Talent per " : "Regioner · "}
        </Tittel>
      </div>
      <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.55, margin: "10px 0 0", maxWidth: 520 }}>
        {filtrert.length} talent fordelt på regioner
        {valgtNiva !== "alle" ? ` (filtrert på ${valgtNiva})` : ""}.
      </p>
    </div>
  );

  const filter = (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <Caps size={9}>Nivå</Caps>
      <PillVelger
        options={[{ v: "alle", l: "Alle" }, ...data.nivaer.map((n) => ({ v: n, l: n }))]}
        value={valgtNiva}
        onChange={setValgtNiva}
      />
    </div>
  );

  if (filtrert.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        {filter}
        <Kort>
          <TomTilstand
            icon="map"
            title={valgtNiva === "alle" ? "Ingen talent registrert" : `Ingen talent på ${valgtNiva}`}
            sub="Talent-spillere må ha region registrert i TalentTracking for å vises her."
          />
        </Kort>
      </div>
    );
  }

  // ── Kart-stub (forenklet SVG-Norge, T-tokens) ──────────────────
  const kart = (
    <Kort eyebrow="Norge · regioner">
      <svg viewBox="0 0 360 420" style={{ width: "100%", height: "auto", display: "block" }}>
        <path
          d="M210 30 L260 50 L240 120 L260 160 L290 200 L300 250 L260 290 L240 330 L200 370 L160 390 L130 380 L110 340 L90 290 L80 240 L100 200 L120 160 L140 130 L160 100 L180 60 Z"
          fill={T.panel2}
          stroke={T.border}
          strokeWidth={1.5}
        />
        {REGION_PINS.map((pin) => {
          const antall = antallPerPin.get(pin.id) ?? 0;
          const r = Math.max(8, Math.min(28, 8 + antall * 2));
          const aktiv = antall > 0;
          return (
            <g key={pin.id}>
              <circle
                cx={pin.x}
                cy={pin.y}
                r={r}
                fill={aktiv ? T.lime : T.panel3}
                opacity={aktiv ? 0.9 : 0.5}
                stroke={T.panel}
                strokeWidth={2}
              />
              <text
                x={pin.x}
                y={pin.y + 3}
                textAnchor="middle"
                fontFamily={T.mono}
                fontSize="11"
                fontWeight={700}
                fill={aktiv ? T.onLime : T.mut}
              >
                {antall}
              </text>
              <text
                x={pin.x}
                y={pin.y + r + 14}
                textAnchor="middle"
                fontFamily={T.mono}
                fontSize="10"
                fill={T.fg2}
              >
                {pin.label}
              </text>
            </g>
          );
        })}
      </svg>
    </Kort>
  );

  // ── Region-liste ───────────────────────────────────────────────
  const liste = (
    <Kort
      eyebrow={`Region-oversikt · ${regioner.length}`}
      action={<HjelpTips k="talentVurdering" align="right" />}
    >
      {regioner.map((r, i) => (
        <Rad
          key={r.id}
          title={r.label}
          sub={
            r.toppKlubber.length === 0
              ? "Ingen klubb registrert"
              : `Topp: ${r.toppKlubber.map((k) => `${k.navn} (${k.antall})`).join(" · ")}`
          }
          meta={
            <span style={{ display: "inline-flex", alignItems: "baseline", gap: 14 }}>
              <span style={{ textAlign: "right" }}>
                <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums", display: "block" }}>
                  {r.antall}
                </span>
                <Caps size={8.5} style={{ marginTop: 2 }}>Talent</Caps>
              </span>
              <span style={{ textAlign: "right" }}>
                <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: r.snitt != null ? T.fg : T.mut, fontVariantNumeric: "tabular-nums", display: "block" }}>
                  {kd(r.snitt)}
                </span>
                <Caps size={8.5} style={{ marginTop: 2 }}>Snitt</Caps>
              </span>
            </span>
          }
          trailing={null}
          last={i === regioner.length - 1}
        />
      ))}
    </Kort>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {filter}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr]" style={{ gap: T.gap, alignItems: "start" }}>
        {kart}
        {liste}
      </div>
    </div>
  );
}
