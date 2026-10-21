"use client";

/**
 * PH-14 Tester-oversikt i designløftet 20.10.2026 (godkjent av Anders samme dag).
 * Fasit: Claude Design-canvaset «PlayerHQ nøkkelskjermer» (https://claude.ai/artifact/XdsbBEHwJhdrD4YJMMpdK1),
 * «Tester · mobil 390» og «Tester · PC 1280». Stil: src/styles/playerhq-ny-tester.css.
 * Testlista er det felles testbatteriet (src/lib/portal-tester/testbatteri.ts): 19 tester i Golfslag, Teknikk og Fysisk.
 *
 * Avvik:
 *   - «Tatt» teller alle tester som er tatt noen gang. Tegningens «Tatt i år» og «Siden 8. juni» trenger sesongstart, som ikke finnes.
 *   - Sesongvelgeren fra tegningen er ikke med: resultatene er ikke delt på sesong i basen.
 *   - Nivåkolonnen viser «—»: A–K-nivåtallene er ikke vedtatt (ESTIMAT kommer først når de er det).
 *   - Utviklingen i nedtrekket viser de siste fire målingene uten dato: datoen per måling ligger ikke i testlista.
 *   - Fysisk-delen mangler «neste uke 43»: testuka finnes ikke som hendelse i basen.
 */
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Play } from "lucide-react";
import type { BatteriData, BatteriRad } from "@/lib/portal-tester/ph14-batteri-data";
import { SkraFlyt, SkraKort, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-tester.css";
import "@/styles/playerhq-ny-lister-skra.css";

const STATS_FANER = [
  { id: "snitt", tittel: "Snittscore" }, { id: "sg", tittel: "Strokes Gained" },
  { id: "tren", tittel: "Trening" }, { id: "test", tittel: "Tester" },
] as const;

const DEL_KLASSE = { Golfslag: "slag", Teknikk: "tek", Fysisk: "fys" } as const;

export function PH14Tester({ data }: { data: BatteriData }) {
  const [apen, setApen] = useState<string | null>(null);
  const mangler = data.prioriterte.filter((p) => !p.ok).length;

  return (
    <div className="phn phn-tst phn-skra">
      <SkraTopp
        lav
        etikett="Tester"
        bilde="/images/playerhq/stats-topp.jpg" bildePosisjon="50% 50%"
        overlinje={`Stats · Testbatteri · ${data.totalt} tester`}
        tittel="Tester"
        ingress="Team Norways testbatteri, likt for AK Golf, WANG og Team Norway."
      />
      <SkraFlyt lav>
      <SkraKort etikett="Testoversikt">
        <nav className="phn-tst-fane" aria-label="Stats">
          {STATS_FANER.map((f) => (
            <Link key={f.id} href={`/portal/analysere?del=${f.id}`} aria-current={f.id === "test" ? "page" : undefined}>{f.tittel}</Link>
          ))}
        </nav>
        <dl className="phn-tst-tall">
          <div><dt>Prioriterte, nok ganger</dt><dd><b>{data.prioriterteOk}</b> av {data.prioriterte.length}</dd></div>
          <div><dt>Tatt</dt><dd><b>{data.tatt}</b> av {data.totalt}</dd></div>
          <div><dt>Nivå mot neste kategori</dt><dd><b>—</b><small>A–K ikke vedtatt</small></dd></div>
        </dl>
      </SkraKort>

      <div className="phn-tst-kol">
        <div className="phn-tst-liste">
          <div className="phn-tst-hode" aria-hidden>
            <span>Test</span><span>Prioritert</span><span className="r">Siste</span><span className="r">Nivå</span><span />
          </div>
          {data.deler.map((d) => (
            <section key={d.del} className="phn-tst-del phn-inn" aria-label={d.del}>
              <div className="phn-tst-deltopp">
                <i className={`akse-${DEL_KLASSE[d.del]}`} aria-hidden />
                <h2>{d.del}</h2>
                <span>{d.tatt} av {d.rader.length} tatt</span>
              </div>
              {d.rader.map((r) => (
                <Test key={r.id} r={r} apen={apen === r.id} veksle={() => setApen(apen === r.id ? null : r.id)} />
              ))}
            </section>
          ))}
        </div>

        <aside className="phn-tst-side">
          <section className="phn-tst-pri phn-inn" aria-label="Prioriterte tester">
            <span className="phn-tst-merke">Prioriterte tester · Team Norway</span>
            <b>{mangler === 0 ? "Alle prioriterte tester er tatt nok ganger" : `${mangler} ${mangler === 1 ? "test mangler" : "tester mangler"} før testingen i oktober`}</b>
            <ul>
              {data.prioriterte.map((p) => (
                <li key={p.id}>
                  <span>{p.navn}</span>
                  <i aria-hidden><u style={{ width: `${Math.min(100, (p.antall / p.minst) * 100)}%` }} /></i>
                  <b>{Math.min(p.antall, p.minst)}/{p.minst}</b>
                </li>
              ))}
            </ul>
            <small>Tallet viser hvor mange ganger du minst skal ha tatt testen.</small>
          </section>

          <Link href="/portal/tren/tester/team-norway" className="phn-knapp pri phn-tst-ta">Ta en test<Play className="phn-ikon" aria-hidden /></Link>
          <Link href="/portal/tren/tester/ny/egen" className="phn-knapp sek">Lag egen test</Link>

          <section className="phn-tst-niva" aria-label="Nivå">
            <h2>Nivå mot neste kategori</h2>
            <p>Referanse ikke satt. Nivåtallene for kategori A–K er ikke vedtatt ennå. Når de er det, ser du nivået per test i kolonnen «Nivå».</p>
          </section>

          <section className="phn-tst-fore" aria-label="Slik føres testene">
            <h2>Slik føres testene</h2>
            <p><b>Egenført</b> når du fører selv. <b>Kontrollert</b> når treneren har ført testen. Treneren fører bare teknikk- og PEI-tester; putting og fysisk fører du selv.</p>
            <p>En test teller bare når alle slag er registrert.</p>
          </section>
        </aside>
      </div>
      </SkraFlyt>
    </div>
  );
}

function Test({ r, apen, veksle }: { r: BatteriRad; apen: boolean; veksle: () => void }) {
  const under = r.antall === 0
    ? "Ikke tatt"
    : [r.dato, r.kontrollert == null ? null : r.kontrollert ? "Kontrollert" : "Egenført"].filter(Boolean).join(" · ");
  const sist = r.historikk.slice(-4);
  const maks = Math.max(...sist, 0) || 1;
  return (
    <>
      <button type="button" className="phn-tst-rad" aria-expanded={apen} aria-controls={`tst-${r.id}`} onClick={veksle}>
        <span className="navn"><b>{r.navn}</b><small>{under}</small></span>
        <span className="pri">{r.fremdrift && <em className={r.antall >= (r.minst ?? 0) ? "ok" : ""}>Prioritert · {r.fremdrift}</em>}</span>
        <span className="siste">
          <b>{r.vis ?? "—"}</b>
          {r.endring ? <small className={r.endring.tone}>{r.endring.tekst}</small> : r.antall === 1 ? <small>Første måling</small> : null}
        </span>
        <span className="niva">—</span>
        <ChevronDown className="phn-ikon pil" aria-hidden />
      </button>
      {apen && (
        <div id={`tst-${r.id}`} className="phn-tst-panel" role="region" aria-label={`Detaljer for ${r.navn}`}>
          <div className="tekst">
            <p>
              {r.minst != null ? `Prioritert · minst ${r.minst} ${r.minst === 1 ? "gang" : "ganger"} før oktober · ` : ""}
              {r.trenerKanFore ? "treneren kan føre denne" : "du fører denne selv"}
            </p>
            <div className="phn-knapper">
              <Link className="phn-knapp pri" href={r.startHref}>Start testen<Play className="phn-ikon" aria-hidden /></Link>
              {r.resultatHref && <Link className="phn-knapp sek" href={r.resultatHref}>Siste resultat</Link>}
            </div>
          </div>
          {sist.length > 1 && (
            <div className="sok" role="img" aria-label={`Siste ${sist.length} målinger: ${sist.join(", ")}`}>
              {sist.map((v, i) => (
                <span key={i}><i className={i === sist.length - 1 ? "na" : ""} style={{ height: `${Math.max(12, (v / maks) * 40)}px` }} /><b>{v.toLocaleString("nb-NO")}</b></span>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
