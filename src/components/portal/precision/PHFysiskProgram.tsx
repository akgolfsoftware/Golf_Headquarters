"use client";

/**
 * PlayerHQ Fysisk program (/portal/planlegge/fysisk) — nytt design, pakke 17b (utkast 1, 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/plan-hjelpere.html, skjermen «Fysisk program».
 * Data: spillerens aktive FysiskPlan (ellers nyeste), siste fysiske tester. Regler: lib/portal-plan/fysisk-program.ts.
 *
 * Avvik:
 *   - Selve økta føres i Live fysisk for programmets økter (/portal/planlegge/fysisk/okt/[oktId]).
 *   - Belastning står i kilo når den er logget, ellers som prosent av 1RM fra programmet.
 *   - Periodenavnet («Grunnperiode 1») vises ikke på programmet; programmet er ikke knyttet til en periode.
 *   - «Neste fysiske test uke 45» vises ikke: appen lagrer ikke når neste test er.
 *   - Uten program: ingen egen knapp for fri fysisk økt; den lages med hurtigknappen «Ny økt» (vedtak 16.10).
 *   - «Skriv til coach» åpner ny melding; teksten nevner ikke coachens navn når det ikke finnes.
 */
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { FysProgram, FysTestRad } from "@/lib/portal-plan/fysisk-program";
import { fysOktHref } from "@/lib/portal-plan/fysisk-okt";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import "@/styles/playerhq-ny-plan-hjelpere.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke9-skra.css";

export type PHFysiskProgramData = {
  program: FysProgram | null;
  tester: { rader: FysTestRad[]; sist: string | null };
};

const SONER: [string, string][] = [["S1", "rolig"], ["S2", "lett"], ["S3", "moderat"], ["S4", "hardt"], ["S5", "maks"]];

function Tester({ tester }: { tester: PHFysiskProgramData["tester"] }) {
  return <section className="phn-seksjon" aria-labelledby="ph-fys-test">
    <div className="phn-sek-topp"><h2 id="ph-fys-test">Siste fysiske test</h2><span className="phn-kilde">{tester.sist ?? "—"}</span></div>
    {tester.rader.length === 0
      ? <div className="phn-kort dempet"><b className="phn-undertittel">Ingen fysisk test ennå</b><p className="phn-forklar">Fysiske tester føres i Stats › Tester.</p></div>
      : <>
        <ul className="ph-tester">{tester.rader.map((r) => <li key={r.navn}>
          <span>{r.navn}</span><b>{r.verdi}</b>
          <span className="phn-trend">{r.endring ?? "—"}</span>
        </li>)}</ul>
        <p className="phn-kilde">Fra testene dine · endring mot forrige gang samme test ble tatt.</p>
      </>}
  </section>;
}

export function PHFysiskProgram({ data }: { data: PHFysiskProgramData }) {
  const p = data.program;
  const [valgt, setValgt] = useState(0);

  if (!p) {
    return <div className="phn phn-meg phn-ph phn-skra">
      <SkraTopp
        lav
        etikett="Fysisk program"
        bilde="/images/playerhq/fys-styrke.jpg" bildePosisjon="50% 50%"
        overlinje="Plan · fysisk program"
        tittel="Fysisk program"
        handling={<span className="skra-topp-rad"><span className="skra-tilbake"><Link className="tilbake" href="/portal/planlegge"><ChevronLeft size={18} aria-hidden />Plan</Link></span></span>}
      />
      <SkraFlyt lav><div className="side">
      <div className="to-del">
        <div className="phn-kort dempet">
          <b className="phn-undertittel">Ingen fysisk program ennå</b>
          <p className="phn-forklar">Be coachen om et program. Fri fysisk trening legger du inn med hurtigknappen «Ny økt»; den teller i totalen.</p>
          <div className="phn-knapper"><Link className="phn-knapp pri" href="/portal/coach/melding/ny">Skriv til coach</Link></div>
        </div>
        <Tester tester={data.tester} />
      </div>
    </div></SkraFlyt></div>;
  }

  const okt = p.okter[Math.min(valgt, p.okter.length - 1)];
  return <div className="phn phn-meg phn-ph phn-skra">
    <SkraTopp
      lav
      etikett="Fysisk program"
      bilde="/images/playerhq/fys-styrke.jpg" bildePosisjon="50% 50%"
      overlinje={`Plan · fysisk program${p.fra ? ` · fra ${p.fra}` : ""}`}
      tittel={p.navn}
      handling={<span className="skra-topp-rad"><span className="skra-tilbake"><Link className="tilbake" href="/portal/planlegge"><ChevronLeft size={18} aria-hidden />Plan</Link></span></span>}
    />
    <SkraFlyt lav><div className="side">
    <div className="to-del">
      <div>
        <div className="ph-fys-topp">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/playerhq/fys-styrke.jpg" alt="" />
          <div className="ft">
            <span className="phn-dato">{p.tidsrom}</span>
            <b className="navn">{p.okter.length === 1 ? "Én økt i uka" : `${p.okter.length} økter i uka`}</b>
            <span className="info"><span>{p.dager ?? "Dager ikke satt"}</span><span>{p.varighet ?? "—"}</span></span>
          </div>
        </div>
        <section className="phn-seksjon" aria-labelledby="ph-fys-uker">
          <div className="phn-sek-topp"><h2 id="ph-fys-uker">Ukene</h2><span className="phn-kilde">{p.gjort} av {p.totalt} økter gjort{p.ukeNaa ? ` · uke ${p.ukeNaa} av ${p.uker.length}` : ""}</span></div>
          <div className="ph-ukerad" role="img" aria-label={p.uker.map((u) => `uke ${u.iso} ${u.status === "gjort" ? "gjort" : u.status === "del" ? "delvis gjort" : "ikke gjort"}${u.naa ? ", denne uka" : ""}`).join(", ")}>
            {p.uker.map((u, i) => <span key={i}><i className={[u.status === "ingen" ? "" : u.status, u.naa ? "naa" : ""].filter(Boolean).join(" ")} />{u.iso}</span>)}
          </div>
        </section>
        <section className="phn-seksjon" aria-labelledby="ph-fys-okter">
          <div className="phn-sek-topp"><h2 id="ph-fys-okter">Øktene</h2></div>
          {p.okter.length === 0
            ? <p className="phn-forklar">Programmet har ingen økter ennå.</p>
            : <>
              {p.okter.length > 1 && <div className="ph-okt-velg" role="group" aria-label="Velg økt">
                {p.okter.map((o, i) => <button key={o.id} type="button" aria-pressed={i === valgt} onClick={() => setValgt(i)}><b>{o.navn}</b><span>{o.under}</span></button>)}
              </div>}
              {p.okter.length === 1 && <p className="phn-forklar"><b>{okt.navn}</b> · {okt.under}</p>}
              {okt.ovelser.length === 0
                ? <p className="phn-forklar">Økta har ingen øvelser ennå.</p>
                : <ul className="ph-ovelser">{okt.ovelser.map((o, i) => <li key={i}><b>{o.navn}</b><span className="mengde">{o.mengde}</span>{o.kilde && <span className="phn-kilde">{o.kilde}</span>}</li>)}</ul>}
              {okt.sone && <div className="ph-soner" role="img" aria-label={`Pulssone ${okt.sone}`}>
                {SONER.map(([s, t]) => <span key={s} className={s === okt.sone ? "paa" : undefined}><b>{s}</b><small>{t}</small></span>)}
              </div>}
              <p className="phn-kilde">Hver økt kan endres i uka. Endringen teller i uka, måneden og året.</p>
            </>}
        </section>
      </div>
      <div>
        {p.neste
          ? <Link className="phn-okt fys" href={fysOktHref(p.neste.id)}>
            <span className="phn-okt-tekst">
              <span className="phn-okt-s">{[p.neste.dato, "FYS"].filter(Boolean).join(" · ")}</span>
              <span className="phn-navn">Neste: {p.neste.navn}, uke {p.neste.ukeIso}</span>
              <span className="phn-okt-sted">{[p.neste.varighet, `${p.neste.antallOvelser} ${p.neste.antallOvelser === 1 ? "øvelse" : "øvelser"}`].filter(Boolean).join(" · ")}</span>
            </span>
          </Link>
          : <div className="phn-kort dempet"><b className="phn-undertittel">Alle øktene er gjort</b><p className="phn-forklar">Be coachen om neste program.</p></div>}
        <Tester tester={data.tester} />
        <Link className="phn-knapp sek" href="/portal/coach/melding/ny" style={{ justifySelf: "start" }}>Skriv til {p.fra ?? "coach"} om programmet</Link>
      </div>
    </div>
  </div></SkraFlyt></div>;
}
