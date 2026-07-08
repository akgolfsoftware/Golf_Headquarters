"use client";

/**
 * TreningsanalysePanel — pivot/kryss-analyse av treningsloggen.
 * Filtrer på alle parametere (periode · akse · kategori · miljø · type) og
 * SAMMENLIGN segmenter mot hverandre. Bygget mot analyse-fasiten
 * (ui_kits/playerhq/phq-analyse via DesignSync): alt i Card m/ eyebrow+tittel,
 * periode som SegmentedTabs, sammenligningsrader i «etikett · stolpe · verdi»-idiom.
 * Interaksjonsmønstre verifisert mot Mobbin-referanser (The Outsiders, Hevy,
 * Fitbit, adidas Running): KPI-delta vs forrige periode, kolonnehoder + prosent-
 * kolonne i sammenligningen, nullstill-affordance når filtre er aktive.
 * Komponert fra golfdata (Card · SegmentedTabs · FilterPills · KpiTile) + ui/Button.
 */

import { useMemo, useState } from "react";
import type {
  TreningsanalyseData,
  OktLogg,
  AkseKey,
  KatKey,
  OmradeKey,
  TypeKey,
} from "@/lib/portal-analyse/treningsanalyse-data";
import {
  Card,
  SegmentedTabs,
  FilterPills,
  KpiTile,
  Tag,
  type FilterItem,
} from "@/components/athletic/golfdata";
import { Button } from "@/components/ui/button";

type DimKey = "axis" | "kat" | "venue" | "type";

const AKSE: { v: AkseKey; l: string }[] = [
  { v: "fys", l: "FYS" }, { v: "tek", l: "TEK" }, { v: "slag", l: "SLAG" },
  { v: "spill", l: "SPILL" }, { v: "turn", l: "TURN" },
];
const KAT: { v: KatKey; l: string }[] = [
  { v: "ott", l: "Tee" }, { v: "app", l: "Innspill" }, { v: "arg", l: "Nærspill" },
  { v: "putt", l: "Putting" }, { v: "ovrig", l: "Øvrig" },
];
const VENUE: { v: OmradeKey; l: string }[] = [
  { v: "flat", l: "Range" }, { v: "gress", l: "Simulator" }, { v: "bane-tren", l: "Bane (trening)" },
  { v: "bane-scoring", l: "Bane (scoring)" }, { v: "gym", l: "Gym" }, { v: "annet", l: "Annet" },
];
const TYPE: { v: TypeKey; l: string }[] = [
  { v: "egen", l: "Egen" }, { v: "coachet", l: "Coachet" }, { v: "test", l: "Test" }, { v: "turnering", l: "Turnering" },
];
const PERIODE = [
  { value: 7, label: "7 dager" }, { value: 30, label: "30 dager" }, { value: 999, label: "Sesong" },
];

const DIM: { key: DimKey; label: string; verdier: { v: string; l: string }[] }[] = [
  { key: "axis", label: "Akse", verdier: AKSE },
  { key: "kat", label: "Kategori", verdier: KAT },
  { key: "venue", label: "Miljø", verdier: VENUE },
  { key: "type", label: "Type", verdier: TYPE },
];

/**
 * Sammenligningsrad — «etikett · stolpe · % · verdi»-idiomet fra analyse-fasiten,
 * med egen prosentkolonne slik sonetabellene i referansene gjør (Perc. · Duration).
 */
function SammenlignRad({ label, timer, andel, antall }: { label: string; timer: number; andel: number; antall: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0" }}>
      <span style={{ width: 110, flex: "none", fontSize: 13, color: "var(--text-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 6, borderRadius: 9999, background: "var(--track)", overflow: "hidden" }}>
        <div style={{ width: `${Math.max(3, andel)}%`, height: "100%", background: "var(--signal)", borderRadius: 9999 }} />
      </div>
      <span style={{ width: 40, flex: "none", textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-2)", fontVariantNumeric: "tabular-nums" }}>
        {Math.round(andel)}%
      </span>
      <span style={{ width: 88, flex: "none", textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
        {timer.toFixed(1)} t · {antall}
      </span>
    </div>
  );
}

/** Kolonnehoder over sammenligningsradene (mønster: sonetabellenes «Perc. · Days»). */
function SammenlignHode() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 4, borderBottom: "1px solid var(--border)" }}>
      <span style={{ width: 110, flex: "none" }} />
      <span style={{ flex: 1 }} />
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground" style={{ width: 40, flex: "none", textAlign: "right" }}>
        %
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground" style={{ width: 88, flex: "none", textAlign: "right" }}>
        Timer · Økter
      </span>
    </div>
  );
}

export function TreningsanalysePanel({ trening }: { trening: TreningsanalyseData }) {
  const [periode, setPeriode] = useState<number>(30);
  const [akse, setAkse] = useState<AkseKey[]>([]);
  const [kat, setKat] = useState<KatKey[]>([]);
  const [venue, setVenue] = useState<OmradeKey[]>([]);
  const [type, setType] = useState<TypeKey[]>([]);
  const [splitBy, setSplitBy] = useState<DimKey>("venue");

  const matcherFiltre = useMemo(
    () => (o: OktLogg) =>
      (akse.length === 0 || akse.includes(o.axis)) &&
      (kat.length === 0 || kat.includes(o.kat)) &&
      (venue.length === 0 || venue.includes(o.venue)) &&
      (type.length === 0 || type.includes(o.type)),
    [akse, kat, venue, type],
  );

  const filtrert = useMemo(
    () => trening.okter.filter((o) => o.d <= periode && matcherFiltre(o)),
    [trening.okter, periode, matcherFiltre],
  );

  const timer = filtrert.reduce((s, o) => s + o.t, 0);
  const antall = filtrert.length;

  // Forrige periode (samme lengde, samme filtre) — grunnlag for KPI-delta.
  // «Sesong» har ingen forrige periode å måle mot.
  const forrige = useMemo(() => {
    if (periode >= 999) return null;
    const okter = trening.okter.filter((o) => o.d > periode && o.d <= periode * 2 && matcherFiltre(o));
    return { timer: okter.reduce((s, o) => s + o.t, 0), antall: okter.length };
  }, [trening.okter, periode, matcherFiltre]);

  const delta = (naa: number, foer: number, desimaler = 0): string | undefined => {
    const d = naa - foer;
    if (d === 0) return undefined;
    return `${d > 0 ? "+" : "−"}${Math.abs(d).toFixed(desimaler).replace(".", ",")}`;
  };

  const harFiltre = akse.length + kat.length + venue.length + type.length > 0;
  const nullstill = () => {
    setAkse([]);
    setKat([]);
    setVenue([]);
    setType([]);
  };

  const sammenlign = useMemo(() => {
    const dim = DIM.find((d) => d.key === splitBy)!;
    return dim.verdier
      .map((val) => {
        const okter = filtrert.filter((o) => (o[splitBy] as string) === val.v);
        const t = okter.reduce((s, o) => s + o.t, 0);
        return { label: val.l, timer: t, antall: okter.length, andel: timer > 0 ? (t / timer) * 100 : 0 };
      })
      .filter((r) => r.antall > 0)
      .sort((a, b) => b.timer - a.timer);
  }, [filtrert, splitBy, timer]);

  const items = <V extends string>(verdier: { v: V; l: string }[]): FilterItem<V>[] =>
    verdier.map((x) => ({ value: x.v, label: x.l }));

  return (
    <div className="flex flex-col gap-5">
      {/* Periode — SegmentedTabs (fasit) */}
      <SegmentedTabs
        block
        value={String(periode)}
        onChange={(v) => setPeriode(Number(v))}
        options={PERIODE.map((p) => ({ value: String(p.value), label: p.label }))}
      />

      {/* Filtre — i kort, med nullstill-affordance når noe er aktivt */}
      <Card
        eyebrow="Filtre"
        title="Avgrens utvalget"
        compact
        action={
          harFiltre ? (
            <Button variant="ghost-light" size="sm" onClick={nullstill}>
              Nullstill
            </Button>
          ) : undefined
        }
      >
        <div className="flex flex-col gap-3">
          <FilterRad label="Akse">
            <FilterPills
              filters={AKSE.map((x) => ({ value: x.v, label: x.l, axis: x.v }))}
              value={akse}
              multi
              onChange={(v) => setAkse((v as AkseKey[]) ?? [])}
            />
          </FilterRad>
          <FilterRad label="Kategori">
            <FilterPills filters={items(KAT)} value={kat} multi onChange={(v) => setKat((v as KatKey[]) ?? [])} />
          </FilterRad>
          <FilterRad label="Miljø">
            <FilterPills filters={items(VENUE)} value={venue} multi onChange={(v) => setVenue((v as OmradeKey[]) ?? [])} />
          </FilterRad>
          <FilterRad label="Type">
            <FilterPills filters={items(TYPE)} value={type} multi onChange={(v) => setType((v as TypeKey[]) ?? [])} />
          </FilterRad>
        </div>
      </Card>

      {/* Nøkkeltall for utvalget — med delta mot forrige periode (samme filtre) */}
      <Card eyebrow="Utvalget" title="Volum">
        <div className="grid grid-cols-3 gap-3">
          <KpiTile
            label="Økter"
            value={antall}
            size="lg"
            delta={forrige ? delta(antall, forrige.antall) : undefined}
            deltaSuffix={forrige && delta(antall, forrige.antall) ? `vs forrige ${periode} d` : undefined}
          />
          <KpiTile
            label="Timer"
            value={timer.toFixed(1)}
            unit="t"
            size="lg"
            delta={forrige ? delta(timer, forrige.timer, 1) : undefined}
            deltaSuffix={forrige && delta(timer, forrige.timer, 1) ? `vs forrige ${periode} d` : undefined}
          />
          <KpiTile label="Snitt/økt" value={antall > 0 ? (timer / antall).toFixed(1) : "—"} unit="t" size="lg" />
        </div>
      </Card>

      {/* Sammenlign — i kort med dimensjonsvelger som action */}
      <Card
        eyebrow="Sammenlign"
        title="Andel av treningen"
        action={
          <SegmentedTabs
            size="sm"
            value={splitBy}
            onChange={(v) => setSplitBy(v)}
            options={DIM.map((d) => ({ value: d.key, label: d.label }))}
          />
        }
      >
        {sammenlign.length > 0 ? (
          <div className="flex flex-col">
            <SammenlignHode />
            {sammenlign.map((r) => (
              <SammenlignRad key={r.label} label={r.label} timer={r.timer} andel={r.andel} antall={r.antall} />
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-[13px] text-muted-foreground">
            Ingen økter i utvalget. Løsne på filtrene.
          </p>
        )}
        {sammenlign.length > 0 && (
          <div className="mt-2 flex items-center gap-2 pt-2">
            <Tag variant="signal" size="sm">
              {DIM.find((d) => d.key === splitBy)?.label}
            </Tag>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              stolpe = andel av {timer.toFixed(1)} t
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}

function FilterRad({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
