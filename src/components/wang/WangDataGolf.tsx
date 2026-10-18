"use client";

import React from "react";
import Link from "next/link";
import { WangTomTilstand } from "./WangIkkeKoblet";
import { WangFaner, WangSmaaTall, WangTilbake, WangTopp, wangHref } from "./wang-felles";
import { formaterFortegn, formaterTall } from "@/lib/format-tall";
import type { WangDataGolfData, WangDgProff } from "@/app/team-wang/_data/wang-datagolf-visning";
import { WangDataGolfElev } from "./WangDataGolfElev";

/**
 * Pakke 10 Data Golf for trener og sportssjef, under Konkurranse (WANG-50): DG-01 Oversikt, DG-02 Proffkatalog,
 * DG-03 Proffprofil, DG-04 Topplister, DG-05 Elev mot proff, DG-06 Innspill-tak og DG-07 Fra funn til forslag
 * (WangDataGolfElev), DG-08 Norske proffer og DG-09 Kilde og dekning.
 * Fasit: docs/design-system/utkast-wang/datagolf.html (utkast 1, godkjent av Anders 16.10.2026) og
 * felles/wang.css §Nærmere wang.no. Samme data og regler som AgencyOS pakke 10 (#1398).
 * Bare for coach-rollen (kanSeDataGolf på serveren). «Powered by Data Golf» på hver skjerm. Ingen eksport.
 * Avvik:
 *   - DG-05–07 leser elevens tall bare når eleven har delt med treneren, og forslag går som forslag til
 *     elevens Workbench (nattkjøring 18.–19.10, pakke T3).
 *   - DG-08 viser norske proffers siste resultater og kommende turneringer; live-stilling er ikke koblet.
 *   - Tallene er Data Golfs modellerte ferdighetstall med kildedato, merket som modell.
 *   - Live-prikk og avatar per proff er ikke med: det finnes ingen live-stilling eller proffbilder.
 */
export function WangDataGolf({ d }: { d?: WangDataGolfData }) {
  if (!d) {
    return (
      <>
        <WangTopp dato="Konkurranse · bare trenere" tittel="Data Golf" />
        <WangTomTilstand tittel="Ingen tilgang" tekst="Data Golf vises bare for trenere og sportssjef." />
      </>
    );
  }
  if (d.side === "proffer") return <Katalog d={d} />;
  if (d.side === "proff") return <Proff d={d} />;
  if (d.side === "topp") return <Topplister d={d} />;
  if (d.side === "norske") return <Norske d={d} />;
  if (d.side === "kilde") return <Kilde d={d} />;
  if ("v" in d) {
    return (
      <>
        <WangDataGolfElev side={d.side} v={d.v} idag={d.idag} hode={(tittel, ingress) => <Hode aktiv="dg-spiller" tittel={tittel} ingress={ingress} />} />
        <PoweredBy />
      </>
    );
  }
  return <Oversikt d={d} />;
}

const nb = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short", year: "numeric" });
const dato = (d: Date | string | null | undefined) => (d ? nb.format(new Date(d)) : "—");
const sg = (v: number | null | undefined) => formaterFortegn(v, 2);
const tall = (v: number | null | undefined, d = 1) => formaterTall(v, d, true);
const tilPar = (n: number | null) => (n == null ? "—" : n === 0 ? "E" : n > 0 ? `+${n}` : `−${Math.abs(n)}`);

const FANER = [
  { id: "dg", tittel: "Oversikt" },
  { id: "dg-proffer", tittel: "Proffer" },
  { id: "dg-topp", tittel: "Topplister" },
  { id: "dg-spiller", tittel: "Elev mot proff" },
  { id: "dg-norske", tittel: "Norske proffer" },
  { id: "dg-kilde", tittel: "Kilde" },
];

function Hode({ aktiv, tittel, ingress, dato: d }: { aktiv: string; tittel: string; ingress?: string; dato?: string }) {
  return (
    <>
      <WangTilbake href={wangHref("konkurranse", "sesong")} tekst="Sesongen" />
      <WangTopp dato={d ?? "Konkurranse · Data Golf · bare trenere"} tittel={tittel} ingress={ingress}>
        <WangFaner omraade="konkurranse" aktiv={aktiv} faner={FANER} etikett="Data Golf" />
      </WangTopp>
    </>
  );
}

function PoweredBy() {
  return (
    <p className="wg-kilde">
      Powered by{" "}
      <a href="https://datagolf.com" target="_blank" rel="noopener noreferrer">
        Data Golf
      </a>{" "}
      · ingen eksport · bare for trenere
    </p>
  );
}

const proffHref = (dgId: number) => wangHref("konkurranse", "dg-proff", String(dgId));

function ProffListe({ rader }: { rader: WangDgProff[] }) {
  return (
    <div className="wg-kort wg-rader">
      {rader.map((p) => (
        <Link key={p.dgId} href={proffHref(p.dgId)} className="wg-rad wg-rad-lenke wg-dg-rad">
          <span className="wg-dg-rang">{p.dgRang ?? "—"}</span>
          <span style={{ display: "grid", gap: 2 }}>
            <b>{p.navn}</b>
            <span className="wg-kilde">
              {[p.land, p.tour?.toUpperCase()].filter(Boolean).join(" · ") || "—"}
              {p.norsk ? " · norsk" : ""}
            </span>
          </span>
          <span className="wg-tall">{sg(p.sgTotal)}</span>
        </Link>
      ))}
    </div>
  );
}

function Oversikt({ d }: { d: Extract<WangDataGolfData, { side: "oversikt" }> }) {
  return (
    <>
      <Hode aktiv="dg" tittel="Data Golf" ingress="Proffenes målte og modellerte tall, til å sette elevens gap og trening i sammenheng." />
      {d.antallProffer === 0 ? (
        <WangTomTilstand tittel="Ingen synk ennå" tekst="Data Golf-tallene hentes ukentlig. Når første synk er gjort, vises de her." />
      ) : (
        <>
          <div className="wg-dg-tellere">
          <WangSmaaTall
            fire
            tall={[
              { verdi: String(d.antallProffer), tekst: `Proffer med tall, ${dato(d.kildedato)}` },
              { verdi: dato(d.sistSynk), tekst: d.feiletSynk > 0 ? `Siste synk, ${d.feiletSynk} feilet` : "Siste synk" },
              { verdi: String(d.norske.length), tekst: "Norske proffer" },
              { verdi: d.forsinket ? "Forsinket" : "Oppdatert", tekst: d.forsinket ? "Eldre enn 14 dager" : "Innen 14 dager" },
            ]}
          />
          </div>
          <div className="wg-to-kol">
            <section className="wg-seksjon" aria-labelledby="wg-dg-norske">
              <div className="wg-sek-topp">
                <h2 id="wg-dg-norske">Norske proffer</h2>
                <span className="wg-kilde">SG total, modellert</span>
              </div>
              {d.norske.length === 0 ? (
                <p className="wg-baand-tom">Ingen norske proffer er koblet ennå.</p>
              ) : (
                <ProffListe rader={d.norske} />
              )}
            </section>
            <section className="wg-seksjon" aria-labelledby="wg-dg-gaa">
              <div className="wg-sek-topp"><h2 id="wg-dg-gaa">Gå til</h2></div>
              <div className="wg-kort wg-rader">
                {(
                  [
                    ["dg-proffer", "Proffkatalog", "Søk og filter på tour"],
                    ["dg-topp", "Topplister", "Seks kategorier per tour og år"],
                    ["dg-norske", "Norske proffer", "Resultater og kommende turneringer"],
                    ["dg-kilde", "Kilde og dekning", "Per endepunkt: sist synket og rader"],
                  ] as const
                ).map(([fane, t, k]) => (
                  <Link key={fane} href={wangHref("konkurranse", fane)} className="wg-rad wg-rad-lenke">
                    <span style={{ display: "grid", gap: 2 }}>
                      <b>{t}</b>
                      <span className="wg-kilde">{k}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
      <PoweredBy />
    </>
  );
}

function Katalog({ d }: { d: Extract<WangDataGolfData, { side: "proffer" }> }) {
  return (
    <>
      <Hode aktiv="dg-proffer" tittel="Proffer" />
      <form className="wg-kort wg-fyll wg-dg-filter" action="/team-wang/coach">
        <input type="hidden" name="omraade" value="konkurranse" />
        <input type="hidden" name="fane" value="dg-proffer" />
        <label className="wg-lbl">
          Søk
          <input className="wg-field" name="sok" type="search" defaultValue={d.valg.sok ?? ""} placeholder="Navn" />
        </label>
        <label className="wg-lbl">
          Tour
          <select className="wg-field" name="tour" defaultValue={d.valg.tour ?? ""}>
            <option value="">Alle</option>
            {d.turer.map((t) => (
              <option key={t} value={t}>{t.toUpperCase()}</option>
            ))}
          </select>
        </label>
        <label className="wg-lbl">
          Rekkefølge
          <select className="wg-field" name="norske" defaultValue={d.valg.norskForst ? "1" : ""}>
            <option value="">SG total</option>
            <option value="1">Norske først</option>
          </select>
        </label>
        <button type="submit" className="wg-btn wg-btn-primary">Vis</button>
      </form>
      {d.rader.length === 0 ? (
        <WangTomTilstand tittel="Ingen treff" tekst="Prøv et annet navn eller fjern filteret." />
      ) : (
        <>
          <p className="wg-kilde">{d.rader.length} proffer · sortert på SG total (modellert)</p>
          <ProffListe rader={d.rader} />
        </>
      )}
      <PoweredBy />
    </>
  );
}

const BAND: Record<string, string> = {
  innspill50: "50–100 yds",
  innspill100: "100–150 yds",
  innspill150: "150–200 yds",
  innspill200: "200+ yds",
};

function Proff({ d }: { d: Extract<WangDataGolfData, { side: "proff" }> }) {
  const p = d.proff;
  if (!p) {
    return (
      <>
        <WangTilbake href={wangHref("konkurranse", "dg-proffer")} tekst="Proffer" />
        <WangTomTilstand tittel="Fant ikke proffen" tekst="Proffen finnes ikke i Data Golf-tallene." />
      </>
    );
  }
  const felt: [string, number | null][] = [
    ["Utslag", p.sgOtt],
    ["Innspill", p.sgApp],
    ["Nærspill", p.sgArg],
    ["Putting", p.sgPutt],
  ];
  return (
    <>
      <WangTilbake href={wangHref("konkurranse", "dg-proffer")} tekst="Proffer" />
      <WangTopp
        dato={[p.land, p.tour?.toUpperCase(), `kildedato ${dato(p.asOf)}`].filter(Boolean).join(" · ")}
        tittel={p.navn}
      />
      <div className="wg-to-kol">
        <div style={{ display: "grid", gap: 28, alignContent: "start" }}>
          <section className="wg-kort wg-fyll wg-fylt-slag" aria-label="Strokes Gained">
            <p className="wg-hoved">
              <strong>{sg(p.sgTotal)}</strong>
              <span>SG total per runde, modell</span>
            </p>
            <div className="wg-smaa-tall wg-smaa-fire">
              {felt.map(([l, v]) => (
                <div key={l}>
                  <strong>{sg(v)}</strong>
                  <span>{l}</span>
                </div>
              ))}
            </div>
            <p className="wg-rad-info">
              <span>Driver <b>{p.driverYards == null ? "—" : `${tall(p.driverYards, 0)} yds`}</b></span>
              <span>
                Treff <b>{p.driverTreff == null ? "—" : `${tall(p.driverTreff * (p.driverTreff <= 1 ? 100 : 1), 0)} %`}</b>
              </span>
              <span>DG-rang <b>{p.dgRang ?? "—"}</b></span>
              <span>OWGR <b>{p.owgr ?? "—"}</b></span>
            </p>
          </section>
          <section className="wg-seksjon" aria-labelledby="wg-dg-sesong">
            <div className="wg-sek-topp">
              <h2 id="wg-dg-sesong">Sesongtall</h2>
              <span className="wg-kilde">Per tour og år</span>
            </div>
            {p.sesonger.length === 0 ? (
              <p className="wg-baand-tom">Ingen sesongtall lagret.</p>
            ) : (
              <div className="wg-kort wg-rader">
                {p.sesonger.map((s) => (
                  <div key={`${s.tour}-${s.aar}`} className="wg-rad wg-dg-rad">
                    <span className="wg-dg-rang">{s.aar}</span>
                    <span style={{ display: "grid", gap: 2 }}>
                      <b>{s.tour.toUpperCase()}</b>
                      <span className="wg-kilde">
                        {s.runder ?? "—"} runder · snitt {tall(s.snitt, 2)} · fairway {tall(s.fairway, 0)} % · GIR {tall(s.gir, 0)} %
                      </span>
                    </span>
                    <span className="wg-tall">{sg(s.sgTotal)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        <section className="wg-seksjon" aria-labelledby="wg-dg-innspill">
          <div className="wg-sek-topp">
            <h2 id="wg-dg-innspill">Innspill per avstand</h2>
            <span className="wg-kilde">Nærhet til hullet</span>
          </div>
          {p.innspill.length === 0 ? (
            <p className="wg-baand-tom">Proffen har ingen innspillsdata.</p>
          ) : (
            <div className="wg-kort wg-rader">
              {[...p.innspill]
                .sort((a, b) => a.band.localeCompare(b.band) || a.lie.localeCompare(b.lie))
                .map((b) => (
                  <div key={`${b.band}-${b.lie}`} className="wg-rad wg-dg-rad">
                    <span className="wg-dg-rang">{BAND[b.band] ?? b.band}</span>
                    <span style={{ display: "grid", gap: 2 }}>
                      <b>{b.lie === "fairway" ? "Fairway" : "Rough"}</b>
                      <span className="wg-kilde">
                        {b.slag ?? "—"} slag · GIR {b.gir == null ? "—" : `${tall(b.gir * 100, 0)} %`}
                      </span>
                    </span>
                    <span className="wg-tall">{b.meter == null ? "—" : `${tall(b.meter)} m`}</span>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>
      <PoweredBy />
    </>
  );
}

function Topplister({ d }: { d: Extract<WangDataGolfData, { side: "topp" }> }) {
  const lenke = (k: string, t = d.tour, a = d.aar) =>
    `/team-wang/coach?omraade=konkurranse&fane=dg-topp&kat=${encodeURIComponent(k)}&tour=${encodeURIComponent(t)}&aar=${a}`;
  return (
    <>
      <Hode aktiv="dg-topp" tittel="Topplister" />
      <div className="wg-filter wg-dg-chips" role="group" aria-label="Kategori">
        {d.kategorier.map((k) => (
          <Link key={k.id} href={lenke(k.id)} className={`wg-chip ${k.id === d.aktiv ? "wg-chip-pa" : ""}`} aria-current={k.id === d.aktiv ? "page" : undefined}>
            {k.label}
          </Link>
        ))}
      </div>
      <div className="wg-filter wg-dg-chips" role="group" aria-label="Tour og år">
        {d.turValg.map((t) => (
          <Link key={t} href={lenke(d.aktiv, t)} className={`wg-chip ${t === d.tour ? "wg-chip-pa" : ""}`} aria-current={t === d.tour ? "page" : undefined}>
            {t.toUpperCase()}
          </Link>
        ))}
        {d.aarValg.map((a) => (
          <Link key={a} href={lenke(d.aktiv, d.tour, a)} className={`wg-chip ${a === d.aar ? "wg-chip-pa" : ""}`} aria-current={a === d.aar ? "page" : undefined}>
            {a}
          </Link>
        ))}
      </div>
      {d.rader.length === 0 ? (
        <WangTomTilstand tittel="Ingen tall for valget" tekst="Velg en annen tour eller et annet år." />
      ) : (
        <>
          <p className="wg-kilde">Oppdatert {dato(d.oppdatert)} · minst 20 runder der runder er kjent</p>
          <div className="wg-kort wg-rader">
            {d.rader.map((r, i) => (
              <Link key={r.dgId} href={proffHref(r.dgId)} className="wg-rad wg-rad-lenke wg-dg-rad">
                <span className="wg-dg-rang">{i + 1}</span>
                <span style={{ display: "grid", gap: 2 }}>
                  <b>{r.navn}</b>
                  <span className="wg-kilde">{r.land ?? "—"} · {r.runder ?? "—"} runder</span>
                </span>
                <span className="wg-tall">
                  {d.aktiv === "sgTotal" ? sg(r.verdi) : tall(r.verdi, d.aktiv === "avgScore" || d.aktiv === "puttsPerRound" ? 2 : 1)}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
      <PoweredBy />
    </>
  );
}

function Norske({ d }: { d: Extract<WangDataGolfData, { side: "norske" }> }) {
  return (
    <>
      <Hode aktiv="dg-norske" tittel="Norske proffer" />
      <div className="wg-to-kol">
        <section className="wg-seksjon" aria-labelledby="wg-dg-res">
          <div className="wg-sek-topp">
            <h2 id="wg-dg-res">Siste resultater</h2>
            <span className="wg-kilde">Målt, brutto</span>
          </div>
          {d.spillere.length === 0 ? (
            <p className="wg-baand-tom">Ingen norske proffer er koblet til Data Golf ennå.</p>
          ) : (
            <div className="wg-kort wg-rader">
              {d.spillere.map((s) => (
                <div key={s.id} className="wg-rad wg-dg-rad">
                  <span className="wg-dg-rang">{s.resultater[0]?.plass ?? "—"}</span>
                  <span style={{ display: "grid", gap: 2 }}>
                    <b>{s.navn}</b>
                    <span className="wg-kilde">
                      {s.resultater.length === 0
                        ? "Ingen resultater lagret"
                        : s.resultater.map((e) => `${e.turnering} (${dato(e.dato)}) ${tilPar(e.tilPar)}`).join(" · ")}
                    </span>
                  </span>
                  <span className="wg-tall">{tilPar(s.resultater[0]?.tilPar ?? null)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="wg-seksjon" aria-labelledby="wg-dg-komm">
          <div className="wg-sek-topp"><h2 id="wg-dg-komm">Kommende turneringer</h2></div>
          {d.kommende.length === 0 ? (
            <p className="wg-baand-tom">Ingen kommende turneringer i kalenderen.</p>
          ) : (
            <div className="wg-kort wg-rader">
              {d.kommende.map((t) => (
                <div key={t.id} className="wg-rad">
                  <span style={{ display: "grid", gap: 2 }}>
                    <b>{t.navn}</b>
                    <span className="wg-kilde">{dato(t.dato)} · {t.tour?.toUpperCase() ?? "—"}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <PoweredBy />
    </>
  );
}

function Kilde({ d }: { d: Extract<WangDataGolfData, { side: "kilde" }> }) {
  return (
    <>
      <Hode
        aktiv="dg-kilde"
        tittel="Kilde og dekning"
        ingress="Hva som hentes, når, og hvor mange rader. Modellprognoser og odds hentes ikke og vises ikke."
      />
      {d.rader.length === 0 ? (
        <WangTomTilstand tittel="Ingen synk registrert" tekst="Synkstatus skrives når pipelines henter fra Data Golf." />
      ) : (
        <div className="wg-kort wg-rader">
          {d.rader.map((r, i) => {
            const feilet = r.status != null && r.status >= 400;
            return (
              <div key={`${r.endepunkt}-${i}`} className="wg-rad">
                <span style={{ display: "grid", gap: 2 }}>
                  <b>{r.endepunkt}</b>
                  <span className="wg-kilde">
                    {dato(r.sist)} · {r.rader ?? "—"} rader{r.feil ? ` · ${r.feil}` : ""}
                  </span>
                </span>
                <span className={`wg-pille ${feilet ? "wg-pille-haster" : r.sist ? "wg-pille-ok" : ""}`}>
                  <i />
                  {feilet ? "Feilet" : r.sist ? "OK" : "Ikke kjørt"}
                </span>
              </div>
            );
          })}
        </div>
      )}
      <div className="wg-kort wg-fyll">
        <b className="wg-undertittel">Lisens</b>
        <p className="wg-forklar">
          Data Golf-tall vises bare for coacher i AK Golf, WANG Toppidrett og Team Norway. Aldri for elever, foreldre eller
          uinnloggede. Ingen eksport.
        </p>
      </div>
      <PoweredBy />
    </>
  );
}
