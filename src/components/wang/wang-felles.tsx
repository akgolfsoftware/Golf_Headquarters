import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Felles byggeklosser for WANG-trenerflaten, pakke 3–10 (utkast 2, godkjent 16.10.2026).
 * Fasit: docs/design-system/utkast-wang/felles/wang.css (.faner, .baand, .elevrad, .helt).
 * Avvik:
 *   - Ingen egne: byggeklossene viser bare det skjermene sender inn. Avvikene står i hver skjerm.
 */

export type WangAkse = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
export const AKSER: WangAkse[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
export const AKSE_NAVN: Record<WangAkse, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Golfslag",
  SPILL: "Spill",
  TURN: "Turnering",
};

/** Adresse til et område og en underside i trenerflaten. */
export function wangHref(omraade: string, fane?: string, id?: string): string {
  const q = new URLSearchParams({ omraade });
  if (fane) q.set("fane", fane);
  if (id) q.set("id", id);
  return `/team-wang/coach?${q.toString()}`;
}

export function WangTopp({
  dato,
  tittel,
  ingress,
  children,
}: {
  dato?: string;
  tittel: string;
  ingress?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="wg-topp" style={{ gap: 14 }}>
      <div style={{ display: "grid", gap: 4 }}>
        {dato ? <p className="wg-dato">{dato}</p> : null}
        <h1 className="wg-tittel">{tittel}</h1>
        {ingress ? <p className="wg-ingress">{ingress}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** Understrekte faner som lenker, så valget står i adressen. */
export function WangFaner({
  omraade,
  aktiv,
  faner,
  etikett,
}: {
  omraade: string;
  aktiv: string;
  faner: { id: string; tittel: string }[];
  etikett: string;
}) {
  return (
    <nav aria-label={etikett} className="wgf-rad">
      {faner.map((f) => (
        <Link
          key={f.id}
          href={wangHref(omraade, f.id)}
          className={`wgf ${aktiv === f.id ? "wgf-pa" : ""}`}
          aria-current={aktiv === f.id ? "page" : undefined}
        >
          {f.tittel}
        </Link>
      ))}
    </nav>
  );
}

export function WangTilbake({ href, tekst }: { href: string; tekst: string }) {
  return (
    <Link href={href} className="wg-tilbake">
      <ArrowLeft size={18} aria-hidden />
      {tekst}
    </Link>
  );
}

/** Helteflaten: ett hovedtall, kort forklaring og én hvit knapp. «—» når tallet mangler. */
export function WangHelt({
  merke,
  tall,
  enhet,
  tekst,
  forklar,
  knapp,
  bilde,
  etikett,
}: {
  merke: string;
  tall: string;
  enhet?: string;
  tekst: string;
  forklar: string;
  knapp?: { tekst: string; href: string };
  bilde?: string;
  etikett: string;
}) {
  return (
    <section className="wg-helteflate" aria-label={etikett}>
      <div className="wg-helt-tekst">
        <span className="wg-helt-merke">
          <i />
          {merke}
        </span>
        <p className="wg-helt-hoved">
          <strong>
            {tall}
            {enhet && tall !== "—" ? <small style={{ fontSize: "0.45em", marginLeft: 4 }}>{enhet}</small> : null}
          </strong>
          <span>{tekst}</span>
        </p>
        <p className="wg-helt-forklar">{forklar}</p>
        {knapp ? (
          <Link href={knapp.href} className="wg-btn wg-btn-lys">
            {knapp.tekst}
          </Link>
        ) : null}
      </div>
      {bilde ? (
        <Image
          className="wg-helt-bilde"
          src={bilde}
          alt=""
          width={480}
          height={230}
          sizes="(min-width: 1100px) 420px, 100vw"
        />
      ) : null}
    </section>
  );
}

export function WangSmaaTall({ tall, fire }: { tall: { verdi: string; tekst: string }[]; fire?: boolean }) {
  return (
    <div className={`wg-smaa-tall ${fire ? "wg-smaa-fire" : ""}`}>
      {tall.map((t) => (
        <div key={t.tekst}>
          <strong>{t.verdi}</strong>
          <span>{t.tekst}</span>
        </div>
      ))}
    </div>
  );
}

export type WangBaandType = "trenger" | "folger" | "ikke";

/** Ett av de tre båndene: Trenger deg · Følger planen · Ikke delt. */
export function WangBaand({
  type,
  tittel,
  tekst,
  antall,
  tomTekst,
  children,
}: {
  type: WangBaandType;
  tittel: string;
  tekst: string;
  antall: number;
  tomTekst: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={`wg-baand-del wg-baand-${type}`}>
      <div className="wg-baand-hode">
        <h3>{tittel}</h3>
        <span className="wg-antall">{antall}</span>
        <p>{tekst}</p>
      </div>
      <div className="wg-baand-liste">{antall === 0 ? <p className="wg-baand-tom">{tomTekst}</p> : children}</div>
    </section>
  );
}

/** Elevrad med statusmarkør, avatar, navn og plan-stolpe (strek ved 80 %). */
export function WangElevrad({
  type,
  navn,
  linje,
  verdi,
  prosent,
  href,
}: {
  type: WangBaandType;
  navn: string;
  linje: string;
  verdi: string;
  prosent: number | null;
  href: string;
}) {
  return (
    <Link href={href} className={`wg-elevrad wg-elevrad-${type}`}>
      <span className="wg-avatar" aria-hidden>
        {initialer(navn)}
      </span>
      <span className="wg-er-hvem">
        <b>{navn}</b>
        <span>{linje}</span>
      </span>
      <span className="wg-er-plan">
        <b>{verdi}</b>
        <span className="wg-stolpe" aria-hidden>
          {prosent !== null ? <span style={{ width: `${Math.min(100, prosent)}%` }} /> : null}
          <i className="wg-strek" style={{ left: "80%" }} />
        </span>
      </span>
    </Link>
  );
}

export function initialer(navn?: string | null): string {
  if (!navn) return "–";
  return navn
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((del) => del[0]?.toUpperCase() ?? "")
    .join("");
}

/** «2026-10-14» → «Onsdag 14. oktober». Dagstrengen tolkes som UTC-dato, så tidssonen ikke flytter dagen. */
export function langDato(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const tekst = new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
  return tekst.charAt(0).toUpperCase() + tekst.slice(1);
}

/** «2026-10-14» → «14. okt.». */
export function kortDato(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

/** Antall hele dager fra a til b (dagstrenger). */
export function dagerMellom(aIso: string, bIso: string): number {
  const t = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((t(bIso) - t(aIso)) / 86_400_000);
}

/** 150 → «2 t 30 min». */
export function visMinutter(min: number): string {
  const t = Math.floor(min / 60);
  const r = min % 60;
  if (!t) return `${r} min`;
  return r ? `${t} t ${r} min` : `${t} t`;
}
