import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { TN } from "@/lib/v2/team-norway";
import { TN_AKSER, type TnAkse } from "./tn-grunnmur";
import s from "./tn-stall.module.css";

/**
 * Byggeklossene fra utkast 2, retning B «Stall og helteflate» (Anders 16.10.2026).
 * Fasit: docs/design-system/utkast-tn/felles/tn.css §Utkast 2 og grunnmur.html.
 * Helteflate med ett hovedtall, bånd med teller, spillerrad med plan-stolpe,
 * statusmarkør med ord og bildekort. Status har alltid ord ved fargen.
 * Avvik:
 *   - Bildene er next/image fra public/team-norway/bilder, ikke <img>.
 *   - Svar-stolpen (ja / venter / kan ikke) er ikke med: svar på samlinger har ingen datamodell.
 */

export type TnStatus = "trenger" | "folger" | "folgmed" | "ikkedelt";

const komma = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",");

/** Navy helteflate. `venstre` har spørsmål, hovedtall og knapp; `hoyre` aksefordeling, bilde eller tellere. */
export function TnHelt({ venstre, hoyre, etikett }: { venstre: ReactNode; hoyre?: ReactNode; etikett: string }) {
  return (
    <section className={s.helt} aria-label={etikett}>
      <div className={s.heltDel}>{venstre}</div>
      {hoyre ? <div className={s.heltDel}>{hoyre}</div> : null}
    </section>
  );
}

/** Spørsmålet over hovedtallet, eller en liten etikett på navy. */
export function TnHeltSporsmaal({ children }: { children: ReactNode }) {
  return <span className={s.sporsmaal}>{children}</span>;
}

/** Hovedtallet i helteflaten. Manglende tall vises som «—». */
export function TnHeltTall({ verdi, enhet, children }: { verdi: ReactNode; enhet?: string; children?: ReactNode }) {
  return (
    <div className={s.heltTall}>
      <strong>{verdi}{enhet ? <small>{enhet}</small> : null}</strong>
      {children ? <span>{children}</span> : null}
    </div>
  );
}

export function TnHeltTekst({ children }: { children: ReactNode }) {
  return <p className={s.heltTekst}>{children}</p>;
}

export function TnHeltKnapper({ children }: { children: ReactNode }) {
  return <div className={s.heltKnapper}>{children}</div>;
}

/** Tre små tall under en hårstrek i helteflaten. */
export function TnHeltTellere({ tall }: { tall: { verdi: ReactNode; tekst: string }[] }) {
  return (
    <div className={s.tellere}>
      {tall.map((t) => (
        <div key={t.tekst}><b>{t.verdi}</b><span>{t.tekst}</span></div>
      ))}
    </div>
  );
}

/** Aksefordeling i de lyse aksefargene på navy (alle over 7 : 1). Aksenavnet står ved fargen. */
export function TnHeltAkser({ tittel, timer }: { tittel: ReactNode; timer: Partial<Record<TnAkse, number>> }) {
  const sum = TN_AKSER.reduce((a, k) => a + (timer[k] ?? 0), 0);
  return (
    <div className={s.akser}>
      <TnHeltSporsmaal>{tittel}</TnHeltSporsmaal>
      <div className={s.fordelingLys} role="img" aria-label={TN_AKSER.map((k) => `${k} ${timer[k] === undefined ? "—" : `${komma(timer[k] ?? 0)} t`}`).join(", ")}>
        {sum > 0 ? TN_AKSER.map((k) => ((timer[k] ?? 0) > 0 ? <span key={k} style={{ width: `${((timer[k] ?? 0) / sum) * 100}%`, background: TN.akse[k].lys }} /> : null)) : null}
      </div>
      <div className={s.forklaringLys}>
        {TN_AKSER.map((k) => (
          <span key={k}><i style={{ background: TN.akse[k].lys }} />{k} <b>{timer[k] === undefined ? "—" : komma(timer[k] ?? 0)}</b></span>
        ))}
      </div>
    </div>
  );
}

export function TnHeltBilde({ src, alt }: { src: string; alt: string }) {
  return <Image className={s.heltBilde} src={src} alt={alt} width={800} height={300} sizes="(min-width: 900px) 420px, 100vw" />;
}

const MARKOR_KLASSE: Record<TnStatus, string> = { trenger: s.trenger, folger: s.folger, folgmed: s.folgmed, ikkedelt: s.ikkedelt };

/** Status som bilde: farget kvadrat og ordet ved siden. */
export function TnMarkor({ status, children }: { status: TnStatus; children: ReactNode }) {
  return <span className={`${s.markor} ${MARKOR_KLASSE[status]}`}><i aria-hidden="true" />{children}</span>;
}

/** Bånd med tittel, teller og liste. */
export function TnBaand({ id, status, tittel, antall, kilde, children }: { id?: string; status?: TnStatus; tittel: string; antall: number; kilde?: string; children: ReactNode }) {
  return (
    <section id={id} className={[s.baand, status ? MARKOR_KLASSE[status] : ""].filter(Boolean).join(" ")}>
      <div className={s.baandHode}>
        <h2>{tittel}</h2>
        <span className={s.teller}>{antall}</span>
        {kilde ? <span className={s.baandKilde}>{kilde}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function TnBaandListe({ children }: { children: ReactNode }) {
  return <div className={s.baandListe}>{children}</div>;
}

/** Gjennomført mot planlagt, fylt i aksefargen som trenes mest (navy uten kjent akse). */
export function TnPlanstolpe({ andel, akse, venstre, hoyre, etikett }: { andel: number; akse: TnAkse | null; venstre?: ReactNode; hoyre?: ReactNode; etikett: string }) {
  const bredde = `${Math.max(0, Math.min(100, andel * 100))}%`;
  return (
    <span className={s.planstolpe}>
      <span className={s.spor} role="img" aria-label={etikett}>
        <span style={{ width: bredde, background: akse ? TN.akse[akse].fyll : undefined }} />
      </span>
      {venstre || hoyre ? <span className={s.stolpeTekst}><span>{venstre}</span><span>{hoyre}</span></span> : null}
    </span>
  );
}

/** Kategori A–K som navy merke. */
export function TnKategori({ children }: { children: ReactNode }) {
  return <span className={s.kat}>{children}</span>;
}

/**
 * Spillerrad: kvadratisk avatar, navn og fakta, verdi til høyre, plan-stolpe og
 * grunnen i klartekst. Statusen er venstre kant pluss ord (grunnen eller markør).
 */
export function TnSpillerrad({ href, status, initialer, navn, fakta, verdi, verdiTekst, lav, stolpe, grunn }: {
  href?: string;
  status: TnStatus;
  initialer: string;
  navn: string;
  fakta?: ReactNode;
  verdi: ReactNode;
  verdiTekst?: string;
  lav?: boolean;
  stolpe?: ReactNode;
  grunn?: ReactNode;
}) {
  const innhold = (
    <>
      <span className={s.avatar} aria-hidden="true">{initialer}</span>
      <span className={s.hvem}><b>{navn}</b>{fakta ? <span className={s.fakta}>{fakta}</span> : null}</span>
      <span className={s.verdi}><b className={lav ? s.lav : undefined}>{verdi}</b>{verdiTekst ? <span>{verdiTekst}</span> : null}</span>
      {stolpe}
      {grunn ? <span className={s.grunn}>{grunn}</span> : null}
    </>
  );
  const klasse = `${s.sprad} ${MARKOR_KLASSE[status]}`;
  return href ? <Link href={href} className={klasse}>{innhold}</Link> : <div className={klasse}>{innhold}</div>;
}

/** Bildekort: bilde øverst, tekst i eget felt under, aldri tekst oppå bildet. */
export function TnBildekort({ href, bilde, alt, navy = false, side = false, children }: { href?: string; bilde: string; alt: string; navy?: boolean; side?: boolean; children: ReactNode }) {
  const klasse = [s.bildekort, navy ? s.navy : "", side ? s.side : ""].filter(Boolean).join(" ");
  const innhold = (
    <>
      <Image src={bilde} alt={alt} width={800} height={300} sizes="(min-width: 900px) 560px, 100vw" />
      <span className={s.bkTekst}>{children}</span>
    </>
  );
  return href ? <Link href={href} className={klasse}>{innhold}</Link> : <div className={klasse}>{innhold}</div>;
}

export function TnBildekortKilde({ children }: { children: ReactNode }) {
  return <span className={s.bkKilde}>{children}</span>;
}

/** Fylte søyler i aksefargene: timer per akse. Aksenavnet og tallet står alltid ved fargen. */
export function TnAkseSoyler({ timer, etikett }: { timer: Partial<Record<TnAkse, number>>; etikett: string }) {
  const maks = Math.max(0, ...TN_AKSER.map((k) => timer[k] ?? 0));
  return (
    <div className={s.soyler} role="img" aria-label={`${etikett}: ${TN_AKSER.map((k) => `${k} ${timer[k] === undefined ? "—" : `${komma(timer[k] ?? 0)} t`}`).join(", ")}`}>
      {TN_AKSER.map((k) => (
        <div key={k} className={s.soyle}>
          <b>{timer[k] === undefined ? "—" : komma(timer[k] ?? 0)}</b>
          <div className={s.soyleFelt}><i style={{ height: maks > 0 ? `${((timer[k] ?? 0) / maks) * 100}%` : 0, background: TN.akse[k].fyll }} /></div>
          <span>{k}</span>
        </div>
      ))}
    </div>
  );
}
