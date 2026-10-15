"use client";

/**
 * Stats › Resultater i nytt design (pakke 6, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html, malen «resultater». Stil: playerhq-ny-statsdybde.css.
 *
 * Avvik:
 *   - Det store tallet er samme snitt som Stats (siste 10 18-hullsrunder registrert i appen, minst 4), og trenden
 *     er mot de 10 før, ikke mot fjoråret.
 *   - Feltstørrelse («av 60») lagres ikke for turneringene; plassering står alene, eller «—» når den ikke er publisert.
 *   - Turneringsrundene fra GolfBox har ingen rundeside; bare runder registrert i appen lenker videre.
 *     En runde som er både registrert i appen og hentet fra GolfBox, kan stå to ganger.
 *   - Banenavn finnes ikke på turneringsresultatene; klassen står der i stedet.
 *   - Turneringer fra Data Golf vises aldri for spilleren (§KODEGJENNOMGANGEN 06.10).
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-16-RES.
 */
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { TmTilbake } from "./PH17TmFelles";
import { formaterDesimal } from "@/lib/portal-analyse/ph16-stats-data";
import { motParTekst, type ResultaterData, type ResultatRunde } from "@/lib/portal-analyse/resultater-data";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";
import "@/styles/playerhq-ny-statsdybde.css";

type Valg = "alle" | "turn" | "egen";
const VALG: { id: Valg; navn: string }[] = [{ id: "alle", navn: "Alle runder" }, { id: "turn", navn: "Turneringer" }, { id: "egen", navn: "Egne runder" }];

export function PH16Resultater({ data, koblet }: { data: ResultaterData; koblet: boolean }) {
  const [valg, setValg] = useState<Valg>("alle");
  const endring = data.snitt != null && data.forrigeSnitt != null ? Math.round((data.forrigeSnitt - data.snitt) * 10) / 10 : null;
  const vis = data.runder.filter((r) => valg === "alle" || r.type === valg);
  const snittVis = vis.length ? vis.reduce((a, r) => a + r.brutto, 0) / vis.length : null;
  const tom = data.runder.length === 0 && data.turneringer.length === 0;

  return (
    <div className="phn">
      <TmTilbake href="/portal/analysere" tekst="Stats" />
      <div className="phn-sd-topp med-bilde">
        <div>
          <div className="phn-dato">Stats · Resultater</div>
          <h1 className="phn-tittel">Resultater</h1>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- statisk bilde fra public, ingen tekst oppå */}
        <img src="/images/playerhq/turn-tee.jpg" alt="" width={1600} height={1067} />
        <div className="phn-hoved">
          <strong>{data.snitt != null ? formaterDesimal(data.snitt, 1) : "—"}<small>brutto</small></strong>
          {endring != null && endring !== 0 && (
            <span className={`phn-trend ${endring > 0 ? "opp" : "ned"}`}>
              {endring > 0 ? <TrendingUp className="phn-ikon" aria-hidden /> : <TrendingDown className="phn-ikon" aria-hidden />}
              {formaterDesimal(Math.abs(endring), 1)} {endring > 0 ? "bedre" : "dårligere"} enn de 10 før
            </span>
          )}
        </div>
      </div>
      <p className="phn-forklar">
        {data.snitt != null
          ? `Snitt av siste ${data.antallSnittRunder} runder, brutto, som i Stats.`
          : "Registrer minst 4 runder på 18 hull, så regnes snittet ut."}
        {data.turneringer.length ? ` ${data.turneringer.length} ${data.turneringer.length === 1 ? "turnering" : "turneringer"}.` : ""}
        {data.bestePlassering ? ` Beste plassering: ${data.bestePlassering.plass}. i ${data.bestePlassering.navn}.` : ""}
      </p>

      {tom ? (
        <section className="phn-kort dempet">
          <h2>Ingen runder ennå</h2>
          <p className="phn-forklar">
            Registrer en runde{koblet ? "" : ", eller be coachen koble profilen din til turneringsresultatene"}. Snittet regnes fra fire runder.
          </p>
          <div className="phn-knapper"><Link className="phn-knapp pri" href="/portal/mal/runder/ny">Registrer runde</Link></div>
        </section>
      ) : (
        <>
          <div className="phn-valg" role="group" aria-label="Vis">
            {VALG.map((v) => <button key={v.id} type="button" aria-pressed={valg === v.id} onClick={() => setValg(v.id)}>{v.navn}</button>)}
          </div>
          <div className="phn-to-kol">
            {valg !== "egen" && (
              <div className="phn-kol">
                <section className="phn-seksjon">
                  <div className="phn-sek-topp"><h2>Turneringer</h2><span className="phn-kilde">{data.turneringer.length} {data.turneringer.length === 1 ? "turnering" : "turneringer"}</span></div>
                  {data.turneringer.length ? (
                    <div className="phn-turn-liste">
                      {data.turneringer.map((t, i) => (
                        <div key={t.id} className="phn-turn-kort phn-inn" style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}>
                          <div className="phn-tk-plass"><b>{t.plass ? `${t.plass}.` : "—"}</b><small>{t.plass ? "Plassering" : t.plassTekst ?? "Ikke publisert"}</small></div>
                          <div className="phn-tk-midt">
                            <strong>{t.navn}</strong>
                            <small>{[t.klasse, t.dato].filter(Boolean).join(" · ")}</small>
                            {t.runder.length > 0 && <span className="phn-tk-runder">{t.runder.map((r) => <span key={r.nr}>R{r.nr} <b>{r.brutto ?? "—"}</b></span>)}</span>}
                          </div>
                          <div className="phn-tk-sum"><b>{t.sum ?? "—"}</b><small>{motParTekst(t.motPar)}</small></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="phn-forklar">{koblet ? "Ingen turneringer med resultat ennå." : "Profilen din er ikke koblet til turneringsresultatene ennå. Coachen din kobler den."}</p>
                  )}
                  <p className="phn-kilde">Brutto · resultater fra GolfBox via AK Golf · plassering slik arrangøren har publisert den</p>
                </section>
              </div>
            )}
            <div className="phn-kol">
              <section className="phn-seksjon">
                <div className="phn-sek-topp">
                  <h2>{valg === "turn" ? "Turneringsrunder" : valg === "egen" ? "Egne runder" : "Alle runder"}</h2>
                  <span className="phn-kilde">{vis.length} runder{snittVis != null ? ` · snitt ${formaterDesimal(snittVis, 1)}` : ""}</span>
                </div>
                {vis.length ? (
                  <div className="phn-runde-liste">{vis.slice(0, 60).map((r) => <RundeRad key={r.id} r={r} />)}</div>
                ) : <p className="phn-forklar">Ingen runder her ennå.</p>}
                {vis.length > 60 && <p className="phn-kilde">Viser de 60 nyeste.</p>}
                <p className="phn-kilde">Brutto · GolfBox og egne registreringer</p>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function RundeRad({ r }: { r: ResultatRunde }) {
  const innhold = (
    <>
      <span><b>{r.tittel}</b><small>{r.sted} · {r.dato}</small></span>
      <span className="phn-rr-h"><b>{r.brutto}</b><small>{motParTekst(r.motPar)}</small></span>
    </>
  );
  return r.href ? (
    <Link className="phn-runde-rad" href={r.href}>{innhold}<ChevronRight className="phn-ikon" aria-hidden /></Link>
  ) : <div className="phn-runde-rad uten-lenke">{innhold}</div>;
}
