/**
 * Felles byggeklosser for AgencyOS i nytt design (designbrevet 13.10.2026).
 * Tynne omslag rundt klassene i src/styles/agencyos-ny.css, så skjermene
 * skrives likt utkastene i docs/design-system/utkast-agencyos/.
 * Brukes inni <div className="agn-s">.
 *
 * Grafitt primærknapp. Rust bare som signal: det som haster, sletter eller avslutter.
 */
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { SkraTopp } from "@/components/precision/skra/Skra";

export type KnappVariant = "pri" | "sek" | "rust" | "spok";
const kl = (v: KnappVariant, stor?: boolean, ekstra?: string) => ["knapp", v, stor && "stor", ekstra].filter(Boolean).join(" ");

export function Knapp({ variant = "pri", stor, className, type = "button", ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: KnappVariant; stor?: boolean }) {
  return <button type={type} className={kl(variant, stor, className)} {...p} />;
}

export function KnappLenke({ variant = "sek", stor, className, href, ...p }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: KnappVariant; stor?: boolean }) {
  return <Link href={href} className={kl(variant, stor, className)} {...p} />;
}

export type PilleTone = "ok" | "vent" | "noy" | "feil";
export function Pille({ tone = "noy", children }: { tone?: PilleTone; children: ReactNode }) {
  return <span className={`pille ${tone}`}><i aria-hidden />{children}</span>;
}

export function HasterPille({ children = "Haster" }: { children?: ReactNode }) {
  return <span className="haster-pille">{children}</span>;
}

export function initialer(navn: string) {
  return navn.split(/\s+/).filter(Boolean).slice(0, 2).map((d) => d[0]!.toUpperCase()).join("") || "—";
}

export function Avatar({ navn, liten, stor, lys }: { navn: string; liten?: boolean; stor?: boolean; lys?: boolean }) {
  return <span className={["avatar", liten && "liten", stor && "stor", lys && "lys"].filter(Boolean).join(" ")} aria-hidden>{initialer(navn)}</span>;
}

/** Toppbildene fra public/images/playerhq. Siden velger bilde etter tittelen, så naboer i menyen får ulike bilder. */
const TOPPBILDER = ["slag-simulator", "slag-utslag", "tek-video", "slag-putting", "stats-topp", "spill-bane", "naerspill-wedge", "turn-tee"] as const;
function toppBilde(nokkel: string) {
  let h = 0;
  for (const c of nokkel) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `/images/playerhq/${TOPPBILDER[h % TOPPBILDER.length]}.jpg`;
}

/**
 * Sidehodet i Skrå-drakten (type 4–6 i skjermtypene, 21.10.2026): lav topp med bilde, kontekstlinje, tittel og handlinger.
 * Siden etter toppen ligger litt over kanten (agencyos-ny.css §Skrå-topp). `bilde` overstyrer valget.
 */
export function Topp({ dato, tittel, ingress, handlinger, tilbake, bilde }: {
  dato?: ReactNode; tittel: ReactNode; ingress?: ReactNode; handlinger?: ReactNode; tilbake?: { href: string; tekst: string }; bilde?: string;
}) {
  const nokkel = typeof tittel === "string" ? tittel : typeof dato === "string" ? dato : "AgencyOS";
  return <div className="agn-topp-lav">
    <SkraTopp
      lav
      bilde={bilde ?? toppBilde(nokkel)}
      bildePosisjon="50% 45%"
      overlinje={dato}
      tittel={tittel}
      ingress={ingress}
      handling={tilbake || handlinger ? <div className="agn-topp-handl">
        {tilbake && <Link href={tilbake.href} className="ag-tilbake"><ChevronLeft className="ikon" aria-hidden />{tilbake.tekst}</Link>}
        {handlinger && <div className="knapper">{handlinger}</div>}
      </div> : undefined}
    />
  </div>;
}

export function Seksjon({ tittel, kilde, hoyre, id, children }: { tittel: ReactNode; kilde?: ReactNode; hoyre?: ReactNode; id?: string; children: ReactNode }) {
  return <section className="seksjon" id={id} aria-label={typeof tittel === "string" ? tittel : undefined}>
    <div className="sek-topp"><h2>{tittel}</h2>{hoyre ?? (kilde ? <span className="kilde">{kilde}</span> : null)}</div>
    {children}
  </section>;
}

/** Melding i flaten: info (nøytral), ok (grønn kant) eller advarsel (rust kant). */
export function Varsel({ tone = "info", tittel, children }: { tone?: "info" | "ok" | "advarsel"; tittel?: ReactNode; children?: ReactNode }) {
  return <div className={`varsel ${tone}`} role={tone === "advarsel" ? "alert" : "status"}>
    {tittel && <b className="undertittel">{tittel}</b>}{children && <p className="forklar">{children}</p>}
  </div>;
}

export function Tom({ tittel, tekst, handling }: { tittel: ReactNode; tekst?: ReactNode; handling?: ReactNode }) {
  return <div className="kort dempet"><b className="undertittel">{tittel}</b>{tekst && <p className="forklar">{tekst}</p>}{handling && <div className="knapper">{handling}</div>}</div>;
}

export function Laster({ tekst = "Henter …", hoyder = [120, 72, 72] }: { tekst?: string; hoyder?: number[] }) {
  return <div className="tilstand-blokk" aria-busy="true"><p className="forklar">{tekst}</p>
    {hoyder.map((h, i) => <i key={i} className="skjelett" style={{ height: h }} />)}
  </div>;
}

export function Feil({ tittel = "Kunne ikke hentes", tekst = "Ingenting er endret. Sjekk nettet og prøv igjen.", kode, onProv }: { tittel?: ReactNode; tekst?: ReactNode; kode?: string; onProv?: () => void }) {
  return <div className="kort dempet" role="alert"><b className="undertittel">{tittel}</b><p className="forklar">{tekst}</p>
    {kode && <p className="kilde mono">{kode}</p>}
    {onProv && <div className="knapper"><Knapp onClick={onProv}>Prøv igjen</Knapp></div>}
  </div>;
}

/** Nøkkel og verdi i to kolonner. Manglende verdi vises som «—». */
export function Nokkelverdier({ rader }: { rader: ReadonlyArray<readonly [ReactNode, ReactNode, ReactNode?]> }) {
  return <dl className="nv">{rader.map(([k, v, s], i) => <div key={i}><dt>{k}</dt><dd>{v ?? "—"}{s ? <span className="kilde"> {s}</span> : null}</dd></div>)}</dl>;
}
