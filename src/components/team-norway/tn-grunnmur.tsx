import Link from "next/link";
import type { ReactNode } from "react";

import { TN } from "@/lib/v2/team-norway";
import s from "./tn-grunnmur.module.css";

/**
 * Byggeklosser med Team Norways aksefarger (Anders 14.10.2026): ett stort tall,
 * fremdriftsstolpe, fylte øktkort, aksefordeling og pyramiden.
 * Fasit: docs/design-system/utkast-tn/grunnmur.html. Fargen er aldri alene:
 * aksenavnet står alltid ved fargen. Ingen AK Golf-farger.
 */

export const TN_AKSER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
export type TnAkse = (typeof TN_AKSER)[number];
export const TN_AKSE_NAVN: Record<TnAkse, string> = { FYS: "Fysisk", TEK: "Teknisk", SLAG: "Golfslag", SPILL: "Spill", TURN: "Turnering" };

export function erTnAkse(verdi: string | null | undefined): verdi is TnAkse {
  return !!verdi && (TN_AKSER as readonly string[]).includes(verdi);
}

const komma = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",");

/** Ett stort tall per flate, med enhet. */
export function TnStortTall({ verdi, enhet, paaNavy = false, children }: { verdi: ReactNode; enhet?: string; paaNavy?: boolean; children?: ReactNode }) {
  return (
    <div className={paaNavy ? `${s.hoved} ${s.paaNavy}` : s.hoved}>
      <strong>{verdi}{enhet ? <small>{enhet}</small> : null}</strong>
      {children}
    </div>
  );
}

export function TnFremdrift({ andel, etikett, maks, naa }: { andel: number; etikett: string; maks: number; naa: number }) {
  return (
    <div className={s.fremdrift} role="progressbar" aria-label={etikett} aria-valuemin={0} aria-valuemax={maks} aria-valuenow={naa}>
      <span style={{ width: `${Math.max(0, Math.min(100, andel * 100))}%` }} />
    </div>
  );
}

/** Akseforkortelsen i aksefargen, for tekst på hvit eller lys flate. */
export function TnAkseTekst({ akse }: { akse: TnAkse }) {
  return <span className={s.akseTekst} style={{ color: TN.akse[akse].fyll }}>{akse}</span>;
}

/** Fylt øktkort i aksefargen, kantete og uten bilde. */
export function TnOktkort({ akse, tid, varighet, navn, info = [], href, liten = false }: { akse: TnAkse; tid: string; varighet?: string; navn: string; info?: ReactNode[]; href?: string; liten?: boolean }) {
  const innhold = (
    <>
      <span className={s.oktRad}>
        <span className={s.akseMerke}>{akse}</span>
        <span className={s.oktTid}>{tid}{varighet ? <small>{varighet}</small> : null}</span>
      </span>
      <span className={s.oktNavn}>{navn}</span>
      {info.length ? <span className={s.oktInfo}>{info.map((x, i) => <span key={i}>{x}</span>)}</span> : null}
    </>
  );
  const klasse = liten ? `${s.okt} ${s.liten}` : s.okt;
  const stil = { background: TN.akse[akse].fyll };
  return href ? <Link href={href} className={klasse} style={stil}>{innhold}</Link> : <div className={klasse} style={stil}>{innhold}</div>;
}

/** Stablet stolpe med aksefordelingen og forklaring med navn og tall under. */
export function TnAksefordeling({ verdier, enhet = "t" }: { verdier: Partial<Record<TnAkse, number>>; enhet?: string }) {
  const sum = TN_AKSER.reduce((a, k) => a + (verdier[k] ?? 0), 0);
  return (
    <>
      <div className={s.fordeling} aria-hidden="true">
        {sum > 0 ? TN_AKSER.map((k) => (verdier[k] ? <span key={k} style={{ width: `${((verdier[k] ?? 0) / sum) * 100}%`, background: TN.akse[k].fyll }} /> : null)) : null}
      </div>
      <div className={s.forklaring}>
        {TN_AKSER.map((k) => (
          <span key={k}><i style={{ background: TN.akse[k].fyll }} />{k} {verdier[k] === undefined ? "—" : `${komma(verdier[k] ?? 0)} ${enhet}`}</span>
        ))}
      </div>
    </>
  );
}

/**
 * Pyramiden: FYS nederst og bredest, TURN øverst. Kantete trapeser i
 * aksefargene, verdien i hvitt inne i hver del. Toppen er for smal til tallet,
 * så TURN-tallet står til høyre for den.
 */
export function TnPyramide({ verdier, enhet = "t", etikett }: { verdier: Partial<Record<TnAkse, number>>; enhet?: string; etikett: string }) {
  const h = 42, mellom = 3, topp = 70, bunn = 340, total = 5 * h + 4 * mellom;
  const bredde = (y: number) => topp + (bunn - topp) * (y / total);
  const tekst = (k: TnAkse) => (verdier[k] === undefined ? "—" : `${komma(verdier[k] ?? 0)} ${enhet}`);
  const deler = [...TN_AKSER].reverse().map((k, i) => {
    const y0 = i * (h + mellom), y1 = y0 + h, w0 = bredde(y0), w1 = bredde(y1);
    const p = [[(340 - w0) / 2, y0], [(340 + w0) / 2, y0], [(340 + w1) / 2, y1], [(340 - w1) / 2, y1]].map((q) => `${q[0].toFixed(1)},${q[1]}`).join(" ");
    return (
      <g key={k}>
        <polygon points={p} fill={TN.akse[k].fyll} />
        <text x={170} y={y0 + 26} textAnchor="middle">{k}{i > 0 ? <tspan>{`  ${tekst(k)}`}</tspan> : null}</text>
      </g>
    );
  });
  return (
    <svg className={s.pyramide} viewBox="0 0 340 230" role="img" aria-label={`${etikett}: ${TN_AKSER.map((k) => `${k} ${tekst(k)}`).join(", ")}`}>
      {deler}
      <text className={s.utenfor} x={338} y={26} textAnchor="end">{tekst("TURN")}</text>
    </svg>
  );
}
