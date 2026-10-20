import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import s from "./skra.module.css";

/**
 * Felles byggeklosser for Skrå-drakten i PlayerHQ og AgencyOS
 * (beslutninger.md §PLAYERHQ OG AGENCYOS FÅR SKRÅ-DRAKTEN, 20.10.2026).
 * Fasit: docs/design-system/utkast-skra/index.html.
 * Avvik:
 *   - Ingen Train-lock-skjerm. Klossene måles gjennom PH-01 og AG-01 i tests/visual/precision/maal.mjs (390 og 1280 px).
 *
 * - SkraTopp: ekte AK Golf-bilde i grafitt øverst, kuttet nedover mot høyre, med tittel og tall i glass.
 * - SkraStat: ett tall i glass (lenke når `href` er satt). Mangler tallet, sendes «—».
 * - SkraFlyt: innholdet under toppen. Første rad ligger over den skrå kanten.
 * - SkraKort: hvitt kort med skygge, tittel og valgfri lenke eller meta.
 * - SkraTom: tom tilstand inni et kort.
 * - SkraHelt: hovedkortet over begge kolonnene, fylt i aksefargen (det som gjelder nå). Uten bilde.
 *
 * Bildene er AK Golfs egne (public/images/playerhq), aldri Team Norway-bildene.
 */

export function SkraTopp({
  bilde,
  bildePosisjon,
  overlinje,
  tittel,
  ingress,
  handling,
  tall,
  kantfarge,
  etikett,
  lav,
}: {
  /** Sti under public, f.eks. «/images/playerhq/spill-bane.jpg». Uten bilde står toppen i flat grafitt. */
  bilde?: string;
  /** Hvor i bildet utsnittet skal ligge, som CSS object-position. */
  bildePosisjon?: string;
  overlinje?: ReactNode;
  tittel: ReactNode;
  ingress?: ReactNode;
  /** Snarvei eller knapp under ingressen. */
  handling?: ReactNode;
  /** SkraStat-er; to i bredden på mobil, fire på PC. */
  tall?: ReactNode;
  /** Kanten under kuttet: aksefargen for det viktigste i dag, ellers nøytral sand. */
  kantfarge?: string;
  etikett?: string;
  /** Lav topp for undersider og detaljsider: mindre luft og mindre tittel, og ingen tall. Bruk `lav` også på SkraFlyt. */
  lav?: boolean;
}) {
  const stil = kantfarge ? ({ "--skra-kantfarge": kantfarge } as CSSProperties) : undefined;
  return (
    <section className={`${s.topp}${lav ? ` ${s.lav}` : ""}`} style={stil} aria-label={etikett}>
      <div className={s.kant} aria-hidden="true" />
      <div className={s.foto} aria-hidden="true">
        {bilde ? <Image src={bilde} alt="" fill priority sizes="100vw" style={bildePosisjon ? { objectPosition: bildePosisjon } : undefined} /> : null}
      </div>
      <div className={`${s.innhold}${tall && !lav ? "" : ` ${s.utenTall}`}`}>
        <div className={s.hode}>
          {overlinje ? <div className={s.overlinje}>{overlinje}</div> : null}
          <h1 className={s.tittel}>{tittel}</h1>
          {ingress ? <p className={s.ingress}>{ingress}</p> : null}
          {handling ? <div className={s.handling}>{handling}</div> : null}
        </div>
        {tall && !lav ? <div className={s.statrad}>{tall}</div> : null}
      </div>
    </section>
  );
}

export function SkraStat({ verdi, enhet, etikett, href, ariaLabel }: { verdi: ReactNode; enhet?: ReactNode; etikett: string; href?: string; ariaLabel?: string }) {
  const innhold = <>
    <strong className={s.statVerdi}>{verdi}{enhet ? <small>{enhet}</small> : null}</strong>
    <span className={s.statEtikett}>{etikett}</span>
  </>;
  return href
    ? <Link href={href} className={s.stat} aria-label={ariaLabel}>{innhold}</Link>
    : <div className={s.stat} aria-label={ariaLabel}>{innhold}</div>;
}

export function SkraFlyt({ children, className, lav }: { children: ReactNode; className?: string; lav?: boolean }) {
  return <div className={`${s.flyt}${lav ? ` ${s.flytLav}` : ""}${className ? ` ${className}` : ""}`}>{children}</div>;
}

export function SkraKort({
  tittel,
  meta,
  lenke,
  etikett,
  className,
  children,
}: {
  tittel?: ReactNode;
  meta?: ReactNode;
  lenke?: { href: string; tekst: string };
  etikett?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`${s.kort}${className ? ` ${className}` : ""}`} aria-label={etikett ?? (typeof tittel === "string" ? tittel : undefined)}>
      {tittel ? (
        <div className={s.kortTopp}>
          <h2>{tittel}</h2>
          {lenke ? <Link className={s.kortLenke} href={lenke.href}>{lenke.tekst}</Link> : meta ? <span className={s.kortMeta}>{meta}</span> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export type SkraHandling = { tekst: string; href?: string; onClick?: () => void; ikon?: ReactNode; sekundaer?: boolean };

export function SkraHelt({
  farge,
  overlinje,
  tid,
  tidEtter,
  tittel,
  meta,
  handlinger = [],
  etikett,
}: {
  /** Aksefargen (mørk variant, så hvit tekst leses). */
  farge?: string;
  overlinje: ReactNode;
  tid: ReactNode;
  tidEtter?: ReactNode;
  tittel: ReactNode;
  meta?: ReactNode;
  handlinger?: SkraHandling[];
  etikett: string;
}) {
  const stil = farge ? ({ "--helt-farge": farge } as CSSProperties) : undefined;
  return (
    <section className={s.helt} style={stil} aria-label={etikett}>
      <div className={s.heltTekst}>
        <span className={s.heltOver}>{overlinje}</span>
        <strong className={s.heltTid}>{tid}{tidEtter ? <small>{tidEtter}</small> : null}</strong>
        <h2>{tittel}</h2>
        {meta ? <p className={s.heltMeta}>{meta}</p> : null}
      </div>
      {handlinger.length > 0 ? (
          <div className={s.heltKnapper}>
            {handlinger.map((h) => {
              const kl = `${s.heltKnapp}${h.sekundaer ? ` ${s.sek}` : ""}`;
              return h.href
                ? <Link key={h.tekst} href={h.href} className={kl}>{h.ikon}{h.tekst}</Link>
                : <button key={h.tekst} type="button" className={kl} onClick={h.onClick}>{h.ikon}{h.tekst}</button>;
            })}
          </div>
        ) : null}
    </section>
  );
}

export function SkraTom({ children, handling }: { children: ReactNode; handling?: ReactNode }) {
  return <div className={s.tom}><p>{children}</p>{handling}</div>;
}
