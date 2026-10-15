"use client";

/**
 * PH-14 Tester i nytt design (pakke 6, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html, malen «tester». Stil: playerhq-ny-statsdybde.css.
 *
 * Avvik:
 *   - Neste testdag er nærmeste test coachen har tildelt med frist. Testuka (uke 43) finnes ikke som egen
 *     hendelse i basen, så kortet viser testnavnet og fristen, eller at ingen testdag er satt.
 *   - Siste rekord vises i aksefargen til testen og bare når en test har minst to målinger.
 *   - «Kontrollert» og «Egenført» kommer fra hvem som førte resultatet (`recordedById`).
 *   - Nivå mot neste kategori står som «—» fordi A–K-nivåtallene ikke er vedtatt.
 *   - Testene grupperes etter pyramideområdet testen har i basen (Golfslag, Teknikk, Spill, Fysisk, Turnering).
 *     9 hull lengde vises som vanlig rad; sperren står i testen selv (tn-catalog eies av en annen økt).
 *   - Lenkene «Team Norway-tester» og «Lag egen test» er beholdt fra dagens skjerm.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-14.
 */
import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { TmTilbake } from "./PH17TmFelles";
import { SD_AKSE_KODE, SdSpark, type SdAkse } from "./PHStatsDybdeFelles";
import type { PH14Data, PH14Rad } from "@/lib/portal-tester/ph14-tester-data";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";
import "@/styles/playerhq-ny-statsdybde.css";

const GRUPPER: { akse: SdAkse; navn: string }[] = [
  { akse: "slag", navn: "Golfslag" }, { akse: "tek", navn: "Teknikk" }, { akse: "spill", navn: "Spill" },
  { akse: "fys", navn: "Fysisk" }, { akse: "turn", navn: "Turnering" },
];

export function PH14Tester({ data }: { data: PH14Data }) {
  const [valgt, setValgt] = useState<SdAkse | null>(null);
  const grupper = GRUPPER.map((g) => ({ ...g, rader: data.rader.filter((r) => r.akse === g.akse) })).filter((g) => g.rader.length > 0);
  const synlige = grupper.filter((g) => !valgt || g.akse === valgt);
  const rek = data.sisteRekord;

  return (
    <div className="phn">
      <TmTilbake href="/portal/analysere" tekst="Stats" />
      <div className="phn-sd-topp med-bilde">
        <div>
          <div className="phn-dato">Stats · Tester</div>
          <h1 className="phn-tittel">Tester</h1>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- statisk bilde fra public, ingen tekst oppå */}
        <img src="/images/playerhq/naerspill-wedge.jpg" alt="" width={1600} height={1067} />
        <div className="phn-hoved">
          <strong>{data.sammenlignbare ? data.bedre : "—"}</strong>
          <span className="phn-forklar smal">
            {data.sammenlignbare
              ? `av ${data.sammenlignbare} ${data.sammenlignbare === 1 ? "test" : "tester"} bedre enn forrige måling`
              : "Ta en test to ganger, så ser du fremgangen her."}
          </span>
        </div>
      </div>

      {data.totalt === 0 ? (
        <section className="phn-kort dempet">
          <h2>Ingen tester ennå</h2>
          <p className="phn-forklar">Testbatteriet er felles for AK Golf, WANG og Team Norway. Coachen legger tester inn i planen din i Workbench.</p>
          <div className="phn-knapper">
            <Link className="phn-knapp pri" href="/portal/planlegge/workbench">Åpne Workbench</Link>
            <Link className="phn-knapp sek" href="/portal/tren/tester/team-norway">Ta en test</Link>
          </div>
        </section>
      ) : (
        <div className="phn-to-kol">
          <div className="phn-kol">
            <div className="phn-valg" role="group" aria-label="Akse">
              <button type="button" aria-pressed={valgt === null} onClick={() => setValgt(null)}>Alle</button>
              {grupper.map((g) => (
                <button key={g.akse} type="button" aria-pressed={valgt === g.akse} onClick={() => setValgt(g.akse)}>{SD_AKSE_KODE[g.akse]}</button>
              ))}
            </div>
            <div style={{ display: "grid", gap: 24 }}>
              {synlige.map((g) => (
                <section key={g.akse} className="phn-testgruppe" aria-label={g.navn}>
                  <div className="phn-testgruppe-topp">
                    <h3><i className={`akse-${g.akse}`} aria-hidden />{g.navn}</h3>
                    <span className="phn-kilde">{g.rader.filter((r) => r.vis).length} av {g.rader.length} tatt</span>
                  </div>
                  {g.rader.map((r, i) => <TestRad key={r.id} r={r} i={i} />)}
                </section>
              ))}
            </div>
            <p className="phn-kilde">Testbatteri for AK Golf, WANG og Team Norway · {data.totalt} {data.totalt === 1 ? "test" : "tester"} · {data.tatt} tatt</p>
          </div>

          <div className="phn-kol">
            <div className="phn-kort phn-neste">
              {data.nesteTestdag ? (
                <>
                  <span className="phn-dagboks" aria-hidden>{data.nesteTestdag.mnd}<b>{data.nesteTestdag.dag}</b></span>
                  <span>
                    <b className="phn-undertittel">Neste testdag</b>
                    <span className="phn-forklar" style={{ display: "block" }}>{data.nesteTestdag.navn} · frist {data.nesteTestdag.dato} · satt av coachen</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="phn-dagboks" aria-hidden>—</span>
                  <span>
                    <b className="phn-undertittel">Neste testdag</b>
                    <span className="phn-forklar" style={{ display: "block" }}>Ingen testdag er satt. Coachen legger tester inn i planen din.</span>
                  </span>
                </>
              )}
            </div>
            {rek && (
              <Link href={rek.href} className={`phn-fylt ${rek.akse}`} style={{ textDecoration: "none" }}>
                <span className="phn-akse-tekst">{SD_AKSE_KODE[rek.akse]} · SISTE REKORD</span>
                <h2>{rek.navn}<span className="phn-hvit-pille">Personlig rekord</span></h2>
                <div className="phn-rad">
                  <span className="phn-stor">{rek.vis}</span>
                  <HvitLinje verdier={rek.historikk} />
                </div>
                <p>{[rek.dato, rek.kontrollert == null ? null : rek.kontrollert ? "Kontrollert" : "Egenført"].filter(Boolean).join(" · ")}</p>
              </Link>
            )}
            <div className="phn-niva">
              <span className="phn-undertittel">Nivå mot neste kategori</span>
              <b>—</b>
              <span className="phn-forklar">Referanse ikke satt. Nivåtallene for kategori A–K er ikke vedtatt ennå. Når de er det, ser du nivået per test her.</span>
            </div>
            <div className="phn-sd-lenker">
              <Link className="phn-knapp sek" href="/portal/tren/tester/team-norway">Ta en test</Link>
              <Link className="phn-knapp sek" href="/portal/tren/tester/ny/egen">Lag egen test</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TestRad({ r, i }: { r: PH14Rad; i: number }) {
  const under = !r.vis
    ? "Ikke tatt ennå"
    : [r.dato, r.kontrollert == null ? null : r.kontrollert ? "Kontrollert" : "Egenført", r.forste ? "Første måling" : null].filter(Boolean).join(" · ");
  return (
    <Link href={r.href} className={`phn-test-rad ${r.akse}${r.vis ? "" : " ikke"} phn-inn`} style={{ animationDelay: `${i * 30}ms` }}>
      <span>
        <strong>{r.navn}{r.rekord && <span className="phn-pr-merke">Rekord</span>}</strong>
        <small>{under}</small>
      </span>
      <span className="phn-verdi">
        <b>{r.vis ?? "—"}</b>
        {r.vis && <SdSpark verdier={r.historikk} akse={r.akse} />}
      </span>
      <ChevronRight className="phn-ikon" aria-hidden />
    </Link>
  );
}

function HvitLinje({ verdier }: { verdier: number[] }) {
  if (verdier.length < 2) return null;
  const v = verdier.slice(-5);
  const min = Math.min(...v), max = Math.max(...v), sp = max - min || 1;
  const pkt = v.map((x, i) => [Math.round((4 + i * 112 / (v.length - 1)) * 10) / 10, Math.round((34 - (x - min) / sp * 28) * 10) / 10]);
  const siste = pkt[pkt.length - 1]!;
  return (
    <svg viewBox="0 0 120 40" width={120} height={40} aria-hidden="true">
      <path className="phn-tegn" d={`M${pkt.map((p) => p.join(",")).join(" L")}`} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={siste[0]} cy={siste[1]} r={3.5} fill="currentColor" />
    </svg>
  );
}
