"use client";

import React from "react";
import Link from "next/link";
import { WangTomTilstand } from "./WangIkkeKoblet";
import {
  WangFaner,
  WangHelt,
  WangSmaaTall,
  WangTilbake,
  WangTopp,
  dagerMellom,
  initialer,
  wangHref,
} from "./wang-felles";
import { visDato, type WangTrenerData, type WangTrenerHendelse } from "@/app/team-wang/_data/wang-trener-data";

interface WangKonkurranseProps {
  data: WangTrenerData;
  /** Underside: kalender · turnering · sesong · samling. */
  aktivFane?: string;
  /** Turneringen eller samlingen undersiden gjelder. */
  id?: string;
  onFaneEndret?: (fane: string) => void;
}

const FANER = [
  { id: "kalender", tittel: "Kalender" },
  { id: "sesong", tittel: "Sesongen" },
  { id: "samling", tittel: "Samlinger" },
];

const datoSpenn = (h: WangTrenerHendelse) =>
  h.sluttIso && h.sluttIso !== h.startIso ? `${visDato(h.startIso)}–${visDato(h.sluttIso)}` : visDato(h.startIso);

/**
 * Pakke 5 Konkurranse for trener og sportssjef: Kalender (WANG-10), Én turnering (WANG-11), Sesongen (WANG-09)
 * og Samling og uttak (WANG-27). Data Golf (WANG-50) er pakke 10.
 * Fasit: docs/design-system/utkast-wang/konkurranse.html (utkast 2, retning B, godkjent av Anders 16.10.2026).
 * Bare ekte gruppedata: turneringer og samlinger fra gruppas kalender.
 * Avvik:
 *   - Påmeldte elever, påmeldingsfrist og ansvarlig trener finnes ikke i kalenderen. De vises ikke.
 *   - Én turnering: resultater og evaluering per elev er ikke koblet til kalenderens turnering. Hver elevs
 *     turneringer (fra GolfBox, med delingssjekk) åpnes fra Sesongen › Per elev. Publiser evaluering er sperret.
 *   - Sesongen: snitt brutto, GIR, fairway, putter og Strokes Gained for gruppa er ikke regnet ut og viser «—».
 *   - Samling: program og kriterium finnes ikke på samlingen, og uttak kan ikke lagres. Uttaket er sperret.
 */
export function WangKonkurranse({ data, aktivFane, id }: WangKonkurranseProps) {
  if (aktivFane === "turnering") return <EnTurnering turnering={data.turneringer.find((t) => t.id === id)} />;
  if (aktivFane === "sesong") return <Sesongen data={data} />;
  if (aktivFane === "samling") return <Samling data={data} samling={data.samlinger.find((s) => s.id === id)} />;
  return <Kalender data={data} />;
}

// ---------------------------------------------------------------------------
// Kalender
// ---------------------------------------------------------------------------

function Kalender({ data }: { data: WangTrenerData }) {
  const kommende = data.turneringer.filter((t) => !t.passert);
  const spilt = data.turneringer.filter((t) => t.passert).reverse();
  const neste = kommende[0];
  const dager = neste ? dagerMellom(data.idagIso, neste.startIso) : null;

  return (
    <>
      <WangTopp dato={`${data.gruppeNavn} · turneringer`} tittel="Konkurranse">
        <WangFaner omraade="konkurranse" aktiv="kalender" faner={FANER} etikett="Konkurranse" />
      </WangTopp>

      <WangHelt
        etikett="Neste turnering"
        merke={neste ? datoSpenn(neste) : "Ingen kommende turneringer"}
        tall={dager === null ? "—" : String(dager)}
        tekst={neste ? `${dager === 1 ? "dag" : "dager"} til ${neste.tittel}` : "dager til neste turnering"}
        forklar={
          neste
            ? `${neste.sted ? `${neste.sted}. ` : ""}Påmeldingen skjer hos arrangøren. Påmeldte elever vises ikke her ennå.`
            : "Legg turneringene inn i gruppas kalender, så står de her."
        }
        knapp={neste ? { tekst: "Se turneringen", href: wangHref("konkurranse", "turnering", neste.id) } : undefined}
        bilde="/team-wang/hero/trening-golf.jpg"
      />

      <WangSmaaTall
        tall={[
          { verdi: String(kommende.length), tekst: "Kommende turneringer" },
          { verdi: "—", tekst: "Påmeldinger totalt" },
          { verdi: String(spilt.length), tekst: "Spilt i kalenderen" },
        ]}
      />

      <Liste tittel="Kommende" kilde="Kilde: gruppas kalender" turneringer={kommende} tom="Ingen kommende turneringer i kalenderen." />
      <Liste tittel="Spilt" turneringer={spilt} tom="Ingen spilte turneringer i kalenderen." />
    </>
  );
}

function Liste({
  tittel,
  kilde,
  turneringer,
  tom,
}: {
  tittel: string;
  kilde?: string;
  turneringer: WangTrenerHendelse[];
  tom: string;
}) {
  return (
    <section className="wg-seksjon" aria-label={tittel}>
      <div className="wg-sek-topp">
        <h2>{tittel}</h2>
        {kilde ? <span className="wg-kilde">{kilde}</span> : null}
      </div>
      {turneringer.length === 0 ? (
        <p className="wg-baand-tom">{tom}</p>
      ) : (
        <div className="wg-rutenett">
          {turneringer.map((t) => (
            <Link key={t.id} href={wangHref("konkurranse", "turnering", t.id)} className="wg-kort wg-turnkort">
              <span className="wg-dato">{datoSpenn(t)}</span>
              <h3>{t.tittel}</h3>
              <p className="wg-kilde">{t.sted ?? "Sted ikke satt"}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Én turnering
// ---------------------------------------------------------------------------

function EnTurnering({ turnering }: { turnering?: WangTrenerHendelse }) {
  if (!turnering) {
    return (
      <>
        <WangTilbake href={wangHref("konkurranse")} tekst="Kalender" />
        <WangTomTilstand tittel="Fant ikke turneringen" tekst="Turneringen finnes ikke i gruppas kalender." />
      </>
    );
  }
  return (
    <>
      <WangTilbake href={wangHref("konkurranse")} tekst="Kalender" />
      <WangTopp
        dato={`${datoSpenn(turnering)}${turnering.sted ? ` · ${turnering.sted}` : ""}`}
        tittel={turnering.tittel}
        ingress="Alle tall er brutto."
      />
      <WangSmaaTall
        tall={[
          { verdi: "—", tekst: "WANG snitt per runde" },
          { verdi: "—", tekst: "Feltet snitt" },
          { verdi: "—", tekst: "Evaluert" },
        ]}
      />
      <section className="wg-seksjon" aria-labelledby="wg-res-tittel">
        <div className="wg-sek-topp">
          <h2 id="wg-res-tittel">Resultater og evaluering</h2>
        </div>
        <WangTomTilstand
          tittel={turnering.passert ? "Resultatene er ikke koblet til turneringen" : "Turneringen er ikke spilt ennå"}
          tekst="Turneringen i kalenderen er ikke koblet til resultatlista fra GolfBox. Hver elevs turneringer finner du under Sesongen › Per elev."
        />
        <div className="wg-knapper">
          <button type="button" className="wg-btn wg-btn-primary" disabled>Publiser evalueringene</button>
          <Link href={wangHref("konkurranse", "sesong")} className="wg-btn wg-btn-secondary">Per elev</Link>
        </div>
        <p className="wg-kilde">Evaluering per elev kan ikke lagres ennå. Ingenting er publisert.</p>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sesongen
// ---------------------------------------------------------------------------

function Sesongen({ data }: { data: WangTrenerData }) {
  const aar = data.idagIso.slice(0, 4);
  return (
    <>
      <WangTopp dato={`${data.gruppeNavn} · sesongen ${aar}`} tittel="Sesongen">
        <WangFaner omraade="konkurranse" aktiv="sesong" faner={FANER} etikett="Konkurranse" />
      </WangTopp>

      <WangSmaaTall
        fire
        tall={[
          { verdi: "—", tekst: "Snitt brutto" },
          { verdi: "—", tekst: "GIR" },
          { verdi: "—", tekst: "Fairway" },
          { verdi: "—", tekst: "Putter per runde" },
        ]}
      />

      <div className="wg-to-kol">
        <section className="wg-seksjon" aria-labelledby="wg-sg-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-sg-tittel">Strokes Gained mot neste kategori</h2>
            <span className="wg-pille wg-pille-vent"><i />Estimat</span>
          </div>
          <WangTomTilstand
            tittel="Ikke regnet ut for gruppa"
            tekst="Snitt per runde for gruppa mot neste kategori (Broadie per HCP). Tee og innspill er sikre fra 12 runder, nærspill og putting fra 24."
          />
        </section>
        <section className="wg-seksjon" aria-labelledby="wg-perelev-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-perelev-tittel">Per elev</h2>
            <span className="wg-kilde">Turneringer fra GolfBox, brutto</span>
          </div>
          {data.elever.length === 0 ? (
            <WangTomTilstand tittel="Ingen elever i gruppa" tekst="Elevene vises her når de er lagt inn i gruppa." />
          ) : (
            <div className="wg-kort wg-rader">
              {data.elever.map((e) => (
                <Link key={e.id} href={`/team-wang/coach/turneringer/${e.id}`} className="wg-rad wg-rad-lenke">
                  <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className="wg-avatar" aria-hidden>{initialer(e.navn)}</span>
                    <b>{e.navn}</b>
                  </span>
                  <span className="wg-kilde">Turneringene</span>
                </Link>
              ))}
              <p className="wg-kilde" style={{ padding: "10px 0 14px" }}>
                Eleven må ha delt med deg. Uten deling åpnes ikke siden.
              </p>
            </div>
          )}
        </section>
      </div>

      <section className="wg-seksjon" aria-labelledby="wg-pga-tittel">
        <div className="wg-sek-topp">
          <h2 id="wg-pga-tittel">Mot PGA Tour</h2>
          <span className="wg-kilde">Powered by Data Golf</span>
        </div>
        <div className="wg-kort wg-fyll">
          <p className="wg-forklar">Bare for trenere. Elevene ser ikke denne sammenligningen.</p>
          <Link className="wg-lenke" href={wangHref("konkurranse", "datagolf")}>Data Golf</Link>
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Samling og uttak
// ---------------------------------------------------------------------------

function Samling({ data, samling }: { data: WangTrenerData; samling?: WangTrenerHendelse }) {
  const valgt = samling ?? data.samlinger.find((s) => !s.passert) ?? data.samlinger[data.samlinger.length - 1];

  return (
    <>
      <WangTopp
        dato={valgt ? `${datoSpenn(valgt)}${valgt.sted ? ` · ${valgt.sted}` : ""}` : data.gruppeNavn}
        tittel={valgt ? valgt.tittel : "Samlinger"}
      >
        <WangFaner omraade="konkurranse" aktiv="samling" faner={FANER} etikett="Konkurranse" />
        {data.samlinger.length > 1 ? (
          <div className="wg-filter">
            {data.samlinger.map((s) => (
              <Link
                key={s.id}
                href={wangHref("konkurranse", "samling", s.id)}
                className={`wg-chip ${s.id === valgt?.id ? "wg-chip-pa" : ""}`}
                aria-current={s.id === valgt?.id ? "page" : undefined}
              >
                {s.tittel} {visDato(s.startIso).slice(0, 5)}
              </Link>
            ))}
          </div>
        ) : null}
      </WangTopp>

      {!valgt ? (
        <WangTomTilstand tittel="Ingen samlinger" tekst="Gruppas kalender har ingen samlinger ennå." />
      ) : (
        <div className="wg-to-kol">
          <div className="wg-kort wg-fyll">
            <b className="wg-undertittel">Kriterium</b>
            <p className="wg-forklar">—</p>
            <b className="wg-undertittel">Program</b>
            <p className="wg-forklar">—</p>
            <p className="wg-kilde">Kriterium og program er ikke lagt inn på samlingen i kalenderen.</p>
          </div>
          <div className="wg-kort wg-fyll">
            <div className="wg-sek-topp">
              <b className="wg-undertittel">Uttak</b>
              <span className="wg-kilde">— plasser</span>
            </div>
            {data.elever.length === 0 ? (
              <p className="wg-kilde">Ingen elever i gruppa.</p>
            ) : (
              <div className="wg-rader" style={{ padding: 0 }}>
                {data.elever.map((e) => (
                  <div key={e.id} className="wg-rad">
                    <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span className="wg-avatar" aria-hidden>{initialer(e.navn)}</span>
                      <b>{e.navn}</b>
                    </span>
                    <span className="wg-pille"><i />Ikke vurdert</span>
                  </div>
                ))}
              </div>
            )}
            <div className="wg-knapper">
              <button type="button" className="wg-btn wg-btn-primary" disabled>Publiser uttaket</button>
            </div>
            <p className="wg-kilde">
              Uttak kan ikke lagres ennå. Grunnen skal skrives per elev og bare vises til eleven selv og foresatte.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
