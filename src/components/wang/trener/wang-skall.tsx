"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Ellipsis, House, LogOut, X } from "lucide-react";

import { loggUtWang } from "@/lib/auth/logout";
import { WANG_FELLESSIDE, WANG_ROLLE_NAVN, byggWangMeny, type WangRolle } from "@/lib/wang/wang-ruter";
import { WangIkonTegn } from "./wang-ikon";
import s from "./wang-skall.module.css";

/**
 * WANG-trenerskallet: navy sidemeny med hovedpunktene, fanene inne i hvert
 * hovedpunkt, og på mobil en bunnrad (I dag, Trening, Tester, Elever) med
 * «Mer»-ark. Rendres én gang av src/app/team-wang/(trener)/layout.tsx.
 * Skjermene rendrer bare innholdet sitt — aldri eget skall, meny eller faner.
 *
 * Fasit: «WANG Golf Skjermoversikt.dc.html» i Claude Design 6cfa623c.
 * Avvik:
 *   - Systemlenkene er Fellessiden og Logg ut (tegningens Skjermoversikt og
 *     Gjennomgang er prototypeverktøy). Innlogget bruker og rolle står nederst.
 *   - Logoen er WANG-merket fra public/team-wang i hvit utgave; tegningens PNG
 *     kan ikke hentes ut av prosjektet.
 *   - Demogruppen merkes «Demo» i topplinjen.
 */
export function WangSkall({
  rolle,
  brukerNavn,
  sted,
  erDemo,
  children,
}: {
  rolle: WangRolle;
  brukerNavn: string;
  /** Etiketten under logoen, f.eks. «Golf · Fredrikstad». */
  sted: string;
  erDemo: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const meny = byggWangMeny(rolle, pathname);
  // Arket huskes per sti, så det lukker seg av seg selv når brukeren navigerer.
  const [merApenPaa, settMerApenPaa] = useState<string | null>(null);
  const merApen = merApenPaa === pathname;
  const settMerApen = (apen: boolean) => settMerApenPaa(apen ? pathname : null);
  const merKnapp = useRef<HTMLButtonElement>(null);
  const arkId = useId();

  useEffect(() => {
    if (!merApen) return;
    const lukk = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        settMerApenPaa(null);
        merKnapp.current?.focus();
      }
    };
    window.addEventListener("keydown", lukk);
    return () => window.removeEventListener("keydown", lukk);
  }, [merApen]);

  const aktivFane = meny.faner.find((f) => f.aktiv);
  const merAktiv = merApen || !meny.mobil.some((h) => h.aktiv);
  const tittel = meny.aktivtHovedpunkt?.navn ?? "WANG Golf";

  return (
    <div className={s.skall}>
      <aside className={s.side} aria-label="WANG Golf">
        <div className={s.logo}>
          {/* eslint-disable-next-line @next/next/no-img-element -- statisk SVG, ingen optimalisering å hente */}
          <img src="/team-wang/wang-logo-horisontal-hvit.svg" alt="WANG Toppidrett" width={176} height={59} />
        </div>
        <p className={s.sted}>{sted}</p>
        <nav className={s.nav} aria-label="Hovedmeny">
          {meny.hovedpunkter.map((h) => (
            <Link key={h.id} href={h.href} className={s.navpunkt} aria-current={h.aktiv ? "page" : undefined}>
              <WangIkonTegn navn={h.ikon} />
              <span>{h.navn}</span>
            </Link>
          ))}
          <div className={s.system}>
            <Link href={WANG_FELLESSIDE} className={`${s.navpunkt} ${s.navSystem}`}>
              <House size={16} strokeWidth={1.5} aria-hidden="true" />
              <span>Fellessiden</span>
            </Link>
            <form action={loggUtWang}>
              <button type="submit" className={`${s.navpunkt} ${s.navSystem}`}>
                <LogOut size={16} strokeWidth={1.5} aria-hidden="true" />
                <span>Logg ut</span>
              </button>
            </form>
            <p className={s.bruker}>
              <strong>{brukerNavn}</strong>
              {WANG_ROLLE_NAVN[rolle]}
            </p>
          </div>
        </nav>
      </aside>

      <div className={s.hoved}>
        <header className={s.dtop}>
          <p className={s.dtopSti}>
            {pathname}
            {meny.aktivSkjerm ? `  ·  ${meny.aktivSkjerm.id}` : ""}
          </p>
          {erDemo ? <span className={s.demo}>Demo · oppdiktede elever</span> : null}
        </header>
        <header className={s.mtop}>
          {/* eslint-disable-next-line @next/next/no-img-element -- statisk SVG */}
          <img src="/team-wang/wang-crest.svg" alt="WANG" width={22} height={28} />
          <div className={s.mtopTekst}>
            <p className={s.mtopSted}>{sted}</p>
            <p className={s.mtopTittel}>{tittel}</p>
          </div>
        </header>

        <main className={s.innhold} id="innhold">
          {meny.faner.length > 0 && meny.aktivtHovedpunkt ? (
            <nav className={s.faner} aria-label={`Faner i ${meny.aktivtHovedpunkt.navn}`}>
              <div className={s.fanerad}>
                {meny.faner.map((f) => (
                  <FaneLenke key={f.id} del={f.del} href={f.href} aktiv={f.aktiv} etikett={f.etikett} />
                ))}
              </div>
              <label className={s.faneValg}>
                <span>{meny.aktivtHovedpunkt.navn}</span>
                <select
                  value={aktivFane?.id ?? ""}
                  onChange={(e) => {
                    const valgt = meny.faner.find((f) => f.id === e.target.value);
                    if (valgt?.href) router.push(valgt.href);
                  }}
                >
                  {aktivFane ? null : <option value="">Velg</option>}
                  {meny.faner.map((f) => (
                    <option key={f.id} value={f.id} disabled={!f.href && !f.aktiv}>
                      {f.valgEtikett}
                    </option>
                  ))}
                </select>
              </label>
            </nav>
          ) : null}
          {children}
        </main>
      </div>

      <nav className={s.mbar} aria-label="Hovedmeny mobil">
        {meny.mobil.map((h) => (
          <Link key={h.id} href={h.href} className={s.mtab} aria-current={h.aktiv && !merApen ? "page" : undefined}>
            <WangIkonTegn navn={h.ikon} storrelse={22} />
            <span>{h.kort}</span>
          </Link>
        ))}
        <button
          ref={merKnapp}
          type="button"
          className={`${s.mtab} ${merAktiv ? s.mtabAktiv : ""}`}
          aria-expanded={merApen}
          aria-controls={arkId}
          onClick={() => settMerApen(!merApen)}
        >
          <Ellipsis size={22} strokeWidth={1.5} aria-hidden="true" />
          <span>Mer</span>
        </button>
      </nav>

      {merApen ? (
        <div className={s.overlegg} onClick={() => settMerApen(false)}>
          <div id={arkId} className={s.ark} role="dialog" aria-modal="true" aria-label="Mer" onClick={(e) => e.stopPropagation()}>
            <div className={s.arkHode}>
              <h2>Mer</h2>
              <button type="button" className={s.lukk} aria-label="Lukk" onClick={() => { settMerApen(false); merKnapp.current?.focus(); }}>
                <X size={22} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
            {meny.mer.map((h) => (
              <Link key={h.id} href={h.href} className={s.arkPunkt} aria-current={h.aktiv ? "page" : undefined}>
                <WangIkonTegn navn={h.ikon} />
                <span>{h.navn}</span>
              </Link>
            ))}
            <p className={s.arkGruppe}>Annet</p>
            <Link href={WANG_FELLESSIDE} className={s.arkPunkt}>
              <House size={20} strokeWidth={1.5} aria-hidden="true" />
              <span>Fellessiden</span>
            </Link>
            <form action={loggUtWang}>
              <button type="submit" className={s.arkPunkt}>
                <LogOut size={20} strokeWidth={1.5} aria-hidden="true" />
                <span>Logg ut · {brukerNavn} ({WANG_ROLLE_NAVN[rolle]})</span>
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FaneLenke({ del, href, aktiv, etikett }: { del?: string; href: string | null; aktiv: boolean; etikett: string }) {
  return (
    <>
      {del ? <span className={s.faneDel}>{del}</span> : null}
      {href ? (
        <Link href={href} className={s.fane} aria-current={aktiv ? "page" : undefined}>
          {etikett}
        </Link>
      ) : (
        <span className={s.fane} aria-current={aktiv ? "page" : undefined}>
          {etikett}
        </span>
      )}
    </>
  );
}
