"use client";

/**
 * TreningsanalysePanel — pivot/kryss-analyse av treningsloggen.
 * Filtrer på alle parametere (periode · akse · kategori · miljø · type) og
 * SAMMENLIGN segmenter mot hverandre (velg «sammenlign etter» → stolper per verdi,
 * f.eks. TEK på range vs bane). Alt klient-side over den innlastede økt-loggen.
 * Komponert fra golfdata (FilterPills · KpiTile · Progress) — ingen ad-hoc UI.
 */

import { useMemo, useState } from "react";
import type {
  TreningsanalyseData,
  AkseKey,
  KatKey,
  OmradeKey,
  TypeKey,
} from "@/lib/portal-analyse/treningsanalyse-data";
import { FilterPills, KpiTile, Progress, type FilterItem } from "@/components/athletic/golfdata";

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
const PERIODE: { v: number; l: string }[] = [
  { v: 7, l: "7 dager" }, { v: 30, l: "30 dager" }, { v: 999, l: "Sesong" },
];

const DIM: { key: DimKey; label: string; verdier: { v: string; l: string }[] }[] = [
  { key: "axis", label: "Akse", verdier: AKSE },
  { key: "kat", label: "Kategori", verdier: KAT },
  { key: "venue", label: "Miljø", verdier: VENUE },
  { key: "type", label: "Type", verdier: TYPE },
];


export function TreningsanalysePanel({ trening }: { trening: TreningsanalyseData }) {
  const [periode, setPeriode] = useState<number>(30);
  const [akse, setAkse] = useState<AkseKey[]>([]);
  const [kat, setKat] = useState<KatKey[]>([]);
  const [venue, setVenue] = useState<OmradeKey[]>([]);
  const [type, setType] = useState<TypeKey[]>([]);
  const [splitBy, setSplitBy] = useState<DimKey>("venue");

  const filtrert = useMemo(() => {
    return trening.okter.filter(
      (o) =>
        o.d <= periode &&
        (akse.length === 0 || akse.includes(o.axis)) &&
        (kat.length === 0 || kat.includes(o.kat)) &&
        (venue.length === 0 || venue.includes(o.venue)) &&
        (type.length === 0 || type.includes(o.type)),
    );
  }, [trening.okter, periode, akse, kat, venue, type]);

  const timer = filtrert.reduce((s, o) => s + o.t, 0);
  const antall = filtrert.length;

  // Sammenlign: grupper det filtrerte utvalget på valgt dimensjon → timer per verdi.
  // Stolpe = andel av total (av utvalget), så prosenten betyr «hvor stor del av treningen».
  const sammenlign = useMemo(() => {
    const dim = DIM.find((d) => d.key === splitBy)!;
    const rows = dim.verdier.map((val) => {
      const okter = filtrert.filter((o) => (o[splitBy] as string) === val.v);
      return { label: val.l, timer: okter.reduce((s, o) => s + o.t, 0), antall: okter.length };
    });
    return rows.filter((r) => r.antall > 0);
  }, [filtrert, splitBy]);

  const items = <V extends string>(verdier: { v: V; l: string }[]): FilterItem<V>[] =>
    verdier.map((x) => ({ value: x.v, label: x.l }));

  return (
    <div className="flex flex-col gap-4">
      {/* Filtre */}
      <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-4">
        <FilterRad label="Periode">
          <FilterPills
            filters={PERIODE.map((p) => ({ value: p.v, label: p.l }))}
            value={periode}
            onChange={(v) => setPeriode((v as number) ?? 30)}
          />
        </FilterRad>
        <FilterRad label="Akse">
          <FilterPills filters={items(AKSE)} value={akse} multi onChange={(v) => setAkse((v as AkseKey[]) ?? [])} />
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

      {/* Nøkkeltall for utvalget */}
      <div className="grid grid-cols-3 gap-2.5">
        <KpiTile label="Økter" value={antall} size="md" />
        <KpiTile label="Timer" value={timer.toFixed(1)} unit="t" size="md" />
        <KpiTile label="Snitt/økt" value={antall > 0 ? (timer / antall).toFixed(1) : "—"} unit="t" size="md" />
      </div>

      {/* Sammenlign etter dimensjon */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Sammenlign etter
          </p>
          <FilterPills
            filters={DIM.map((d) => ({ value: d.key, label: d.label }))}
            value={splitBy}
            onChange={(v) => setSplitBy((v as DimKey) ?? "venue")}
          />
        </div>
        {sammenlign.length > 0 ? (
          <div className="flex flex-col gap-3">
            {sammenlign.map((r) => (
              <div key={r.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-medium text-foreground">{r.label}</span>
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {r.timer.toFixed(1)} t · {r.antall} økt{r.antall === 1 ? "" : "er"}
                  </span>
                </div>
                <Progress variant="bar" value={r.timer} max={timer || 1} />
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-[13px] text-muted-foreground">
            Ingen økter i utvalget. Løsne på filtrene.
          </p>
        )}
      </div>
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
