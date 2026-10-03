"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { RundeRow, RunderKpis } from "@/lib/portal-runder/runder-list-data";
import { RUNDE_DATAQUALITY_META, RUNDE_STATUS_META } from "@/lib/runde-logg/kontrakt";
import { FortsettRundeCta, useHarRundeKladd } from "@/components/portal/runde-logg/fortsett-runde-cta";
import { fmtSg } from "@/lib/v2/format";

export type RunderV2Data = {
  navn: string;
  hcp: number | null;
  rows: RundeRow[];
  kpis: RunderKpis;
};

const RUTE_NY = "/portal/mal/runder/ny";
const RUTE_LIVE = "/portal/runde/live";
const RUTE_ETTERREGISTRER = "/portal/runde/logg";
const ruteDetalj = (id: string) => `/portal/mal/runder/${id}`;

const MND_LANG = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];
const UKEDAG = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];

function radSub(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${UKEDAG[d.getDay()]} ${dd}.${mm}`;
}

function komma(n: number): string {
  return n.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function tilParTxt(v: number): string {
  if (v === 0) return "E";
  return v > 0 ? `+${v}` : `−${Math.abs(v)}`;
}

export function RunderV2({ data }: { data: RunderV2Data }) {
  const router = useRouter();
  const harKladd = useHarRundeKladd();
  const { rows, kpis } = data;
  const tom = rows.length === 0;
  const naa = new Date();
  const iMnd = rows.filter(
    (r) => r.playedAt.getMonth() === naa.getMonth() && r.playedAt.getFullYear() === naa.getFullYear(),
  ).length;
  const sub = tom
    ? null
    : [
        iMnd > 0 ? `${iMnd} runde${iMnd === 1 ? "" : "r"} i ${MND_LANG[naa.getMonth()]}` : `${kpis.total} runder`,
        kpis.snittScore != null ? `snitt ${komma(kpis.snittScore)}` : null,
      ].filter(Boolean).join(" · ");

  return (
    <div className="ph18r" data-od-id="runder-root">
      <h1>Runder</h1>
      {sub && <p>{sub}</p>}
      {harKladd && <FortsettRundeCta />}
      {tom ? (
        <p className="ph18r-tom">Ingen runder logget ennå. Loggfør din første runde — live-føring er raskest.</p>
      ) : (
        <div className="pa-card ph18r-liste">
          {rows.map((r) => (
            <button key={r.id} type="button" onClick={() => router.push(ruteDetalj(r.id))}>
              <span>
                <strong>{r.courseName}</strong>
                <small>{radSub(r.playedAt)} · {RUNDE_DATAQUALITY_META[r.dataQuality].label}</small>
              </span>
              <span>
                <strong>{r.score} <b>{tilParTxt(r.vsPar)}</b></strong>
                <small>{RUNDE_STATUS_META[r.status].label} · SG {r.sgTotal == null ? "–" : fmtSg(r.sgTotal)}</small>
              </span>
              <ChevronRight size={16} aria-hidden />
            </button>
          ))}
        </div>
      )}
      <Link href={RUTE_LIVE} className="pa-btn pa-btn--primary pa-btn--full">Start live-føring</Link>
      <div className="ph18r-sek">
        <Link href={RUTE_ETTERREGISTRER}>Etterregistrer score</Link>
        <Link href={RUTE_NY}>Score, detaljer og SG</Link>
      </div>
    </div>
  );
}
