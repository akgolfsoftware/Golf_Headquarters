"use client";

/**
 * Felles deler for planmal-sidene i Precision Athletics (AG-14 › maler):
 * /admin/plan-templates/[id], /ny og /[id]/rediger.
 *
 * - UkeRutenett: uke for uke med sju dagsruter som brytes (aldri sidelengs
 *   rulling, i motsetning til det gamle 640 px-rutenettet).
 * - MalMetadata og FordelingGlidere: feltene ny mal og editoren deler.
 */
import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { AkseMerke, Meta } from "@/components/precision/pa";
import { Felt, Glider, Inndata, Nedtrekk, Tekstboks, type PaAkse } from "@/components/precision/pa-planhub";
import type { LPhase, NgfKategori, PyramidArea } from "@/generated/prisma/enums";
import { DAG_LABEL, FASE_ALLE, KATEGORI_ALLE, KATEGORI_LABEL, type DisciplinFordeling } from "@/components/admin/plan-templates/shared";
import { LPHASE_LABEL } from "@/lib/labels/taxonomy";
import "@/styles/agencyos-ny-mal.css";

export const PYR_ALLE: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
export const akseAv = (p: PyramidArea) => p.toLowerCase() as PaAkse;

export function fordelingSum(f: DisciplinFordeling): number {
  return Math.round((f.FYS + f.TEK + f.SLAG + f.SPILL + f.TURN) * 100);
}

/* ---------- Uke for uke ---------- */

export type RutenettOkt = { id: string; ukeNr: number; dagNr: number; title: string; varighetMin: number; pyramidArea: PyramidArea; drillAntall: number };

const AKSE_VAR: Record<PyramidArea, string> = { FYS: "var(--fys-ink)", TEK: "var(--tek-ink)", SLAG: "var(--slag)", SPILL: "var(--spill-ink)", TURN: "var(--turn)" };

export function UkeRutenett({ varighetUker, okter, onVelg, onNy, ukeMeta, ukeHandlinger, deaktivert }: {
  varighetUker: number;
  okter: readonly RutenettOkt[];
  onVelg: (id: string) => void;
  /** Editoren: tom dag åpner «Ny økt». Uten denne vises tom dag som «—». */
  onNy?: (uke: number, dag: number) => void;
  ukeMeta?: (uke: number) => ReactNode;
  ukeHandlinger?: (uke: number) => ReactNode;
  deaktivert?: boolean;
}) {
  const uker = Array.from({ length: Math.max(0, varighetUker) }, (_, i) => i + 1);
  return <div className="mal-uker">
    {uker.map((uke) => <section key={uke} className="mal-uke" aria-label={`Uke ${uke}`}>
      <div className="mal-uke-hode">
        <b>Uke {uke}</b>
        {ukeMeta?.(uke)}
        <span className="mal-uke-handl">{ukeHandlinger?.(uke)}</span>
      </div>
      <div className="mal-dager">
        {[1, 2, 3, 4, 5, 6, 7].map((dag) => {
          const s = okter.find((o) => o.ukeNr === uke && o.dagNr === dag);
          const navn = DAG_LABEL[dag - 1];
          return <div key={dag} className="mal-dag">
            <span className="mal-dag-navn">{navn}</span>
            {s
              ? <button type="button" className="mal-okt" onClick={() => onVelg(s.id)} aria-label={`${s.title}, uke ${uke} ${navn}`}>
                <i aria-hidden style={{ background: AKSE_VAR[s.pyramidArea] }} />
                <span className="mal-okt-tekst"><b>{s.title}</b><span className="kilde mono">{s.pyramidArea} · {s.varighetMin} min · {s.drillAntall} øv.</span></span>
              </button>
              : onNy
                ? <button type="button" className="mal-tom" disabled={deaktivert} onClick={() => onNy(uke, dag)} aria-label={`Ny økt uke ${uke}, ${navn}`}><Plus size={16} aria-hidden /></button>
                : <span className="mal-tom" aria-label={`Ingen økt uke ${uke}, ${navn}`}>—</span>}
          </div>;
        })}
      </div>
    </section>)}
  </div>;
}

export function AkseForklaring() {
  return <div className="a10-aksenokler">{PYR_ALLE.map((p) => <AkseMerke key={p} axis={akseAv(p)} size="sm" />)}</div>;
}

/* ---------- Metadata og fordeling ---------- */

export type MalMetadataVerdier = {
  name: string;
  description: string;
  kategori: NgfKategori;
  lPhase: LPhase;
  varighetUker: number;
  ukentligOktAntall: number;
  minAlder: string;
  maxAlder: string;
};

const heltall = (v: string, min: number) => { const n = parseInt(v || "0", 10); return Number.isFinite(n) ? Math.max(min, n) : min; };

export function MalMetadata({ v, onEndre, navnFeil }: { v: MalMetadataVerdier; onEndre: (p: Partial<MalMetadataVerdier>) => void; navnFeil?: string }) {
  return <div className="a10-stabel">
    <Felt label="Navn" required error={navnFeil}>
      <Inndata value={v.name} onChange={(e) => onEndre({ name: e.target.value })} placeholder="F.eks. E Konkurranse Standard" />
    </Felt>
    <Felt label="Beskrivelse" valgfritt>
      <Tekstboks rows={3} value={v.description} onChange={(e) => onEndre({ description: e.target.value })} style={{ minHeight: 96 }} />
    </Felt>
    <div className="a10-felt2">
      <Felt label="Kategori" hint="Anbefalt fordeling følger kategorien når du lager en ny mal.">
        <Nedtrekk value={v.kategori} onChange={(e) => onEndre({ kategori: e.target.value as NgfKategori })} options={KATEGORI_ALLE.map((k) => ({ value: k, label: KATEGORI_LABEL[k] }))} />
      </Felt>
      <Felt label="Periode">
        <Nedtrekk value={v.lPhase} onChange={(e) => onEndre({ lPhase: e.target.value as LPhase })} options={FASE_ALLE.map((f) => ({ value: f, label: LPHASE_LABEL[f] }))} />
      </Felt>
    </div>
    <div className="a10-felt2">
      <Felt label="Varighet (uker)"><Inndata mono type="number" min={1} max={52} value={v.varighetUker} onChange={(e) => onEndre({ varighetUker: heltall(e.target.value, 0) })} /></Felt>
      <Felt label="Økter per uke"><Inndata mono type="number" min={1} max={14} value={v.ukentligOktAntall} onChange={(e) => onEndre({ ukentligOktAntall: heltall(e.target.value, 0) })} /></Felt>
      <Felt label="Min alder" valgfritt><Inndata mono inputMode="numeric" value={v.minAlder} placeholder="—" onChange={(e) => onEndre({ minAlder: e.target.value })} /></Felt>
      <Felt label="Maks alder" valgfritt><Inndata mono inputMode="numeric" value={v.maxAlder} placeholder="—" onChange={(e) => onEndre({ maxAlder: e.target.value })} /></Felt>
    </div>
  </div>;
}

export function FordelingGlidere({ fordeling, onEndre }: { fordeling: DisciplinFordeling; onEndre: (f: DisciplinFordeling) => void }) {
  return <div className="a10-stabel a10-stabel--tett">
    {PYR_ALLE.map((p) => <div key={p} className="a10-fordelingsrad">
      <AkseMerke axis={akseAv(p)} size="sm" />
      <Glider label={`Andel ${p}`} akse={akseAv(p)} verdi={Math.round(fordeling[p] * 100)} onEndre={(n) => onEndre({ ...fordeling, [p]: n / 100 })} />
      <span className="a10-fordelingsrad__tall">{Math.round(fordeling[p] * 100)} %</span>
    </div>)}
  </div>;
}
