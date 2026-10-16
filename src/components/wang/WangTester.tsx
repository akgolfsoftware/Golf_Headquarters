"use client";

import { WangIkkeKoblet, IKKE_KOBLET_KNAPP_STIL } from './WangIkkeKoblet';
import React, { useState } from "react";
import {
  WANG_ELEVER,
  WANG_FYSISKE_TESTER,
  WANG_TEST_RESULTATER,
  WangFysiskTest,
  WangTestResultat,
} from "./wang-data";

interface WangTesterProps {
  valgtFane?: string;
  aktivFane?: string;
  onFaneEndret?: (fane: string) => void;
  campus?: string;
}

const FANER = [
  { id: "fysisk", tittel: "Testbatteri" },
  { id: "ko", tittel: "Til kontroll" },
  { id: "scorekort", tittel: "Før test" },
  { id: "rangering", tittel: "Rangering" },
] as const;

/** Fysisk del av testbatteriet (Anders 28.09.2026). id peker på testen i kilden når den finnes. */
const BATTERI = [
  { navn: "Benkpress", id: "benkpress" },
  { navn: "Markløft trapbar", id: "trapbar" },
  { navn: "Lengdehopp", id: null },
  { navn: "Rotasjonskast", id: "medball" },
  { navn: "Club Speed", id: null },
] as const;

const tall = (v: number | string) => String(v).replace(".", ",");

/**
 * WANG-48 Tester for trener og sportssjef.
 * Fasit: docs/design-system/utkast-wang/tester.html (pakke 4, utkast 1, 14.10.2026).
 * Avvik:
 *   - Golftestene fra 6-årsløpet, 8-ball slag for slag, én test og én elev er ikke med.
 *     Kilden har bare de fysiske testene.
 *   - Lengdehopp og Club Speed finnes ikke i kilden og står med «—».
 *   - Rangeringen viser markløft trapbar, bare egne elever.
 */
export function WangTester({
  valgtFane = "fysisk",
  aktivFane,
  onFaneEndret,
  campus: _campus = "Fredrikstad",
}: WangTesterProps) {
  const [fane, setFane] = useState(aktivFane === "fokus" || aktivFane === "oversikt" ? "fysisk" : aktivFane || valgtFane);
  const [fysiskeTester] = useState<WangFysiskTest[]>(WANG_FYSISKE_TESTER);
  const testKo: WangTestResultat[] = WANG_TEST_RESULTATER;

  // Skjemafelt (ingen lagring er koblet ennå)
  const [valgtElevId, setValgtElevId] = useState(WANG_ELEVER[0]?.id || "");
  const [valgtTestId, setValgtTestId] = useState(WANG_FYSISKE_TESTER[0]?.id || "");
  const [innsendtVerdi, setInnsendtVerdi] = useState("");

  const tilKontroll = testKo.filter((t) => t.status === "Ført");
  const kontrollert = testKo.filter((t) => t.status === "Kontrollert").length;
  const trapbar = fysiskeTester.find((t) => t.id === "trapbar");
  const toppliste = trapbar
    ? WANG_ELEVER.filter((e) => trapbar.resultater[e.id] !== undefined).sort(
        (a, b) => trapbar.resultater[b.id] - trapbar.resultater[a.id]
      )
    : [];

  const velgFane = (id: string) => {
    setFane(id);
    onFaneEndret?.(id);
  };

  return (
    <>
      <section className="wg-helt">
        <div>
          <p className="wg-dato">WANG Golf · testbatteriet</p>
          <h1 className="wg-tittel">Tester</h1>
          <p className="wg-ingress">
            Elevene fører selv, du kontrollerer. Fysisk test hver sjette uke i grunnperioden.
          </p>
        </div>
        <div className="wg-helt-tall">
          <div className={tilKontroll.length > 0 ? "wg-signal" : undefined}>
            <span>Til kontroll</span>
            <strong>{tilKontroll.length}</strong>
            <span className="wg-kilde">Egenført</span>
          </div>
          <div>
            <span>Kontrollert</span>
            <strong>{kontrollert}</strong>
            <span className="wg-kilde">Siste fire uker</span>
          </div>
          <div>
            <span>Fysiske tester</span>
            <strong>{BATTERI.length}</strong>
            <span className="wg-kilde">I batteriet</span>
          </div>
          <div>
            <span>Neste testdag</span>
            <strong>—</strong>
            <span className="wg-kilde">Ikke koblet ennå</span>
          </div>
        </div>
      </section>

      <nav aria-label="Visning" className="wgf-rad">
        {FANER.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={fane === f.id}
            onClick={() => velgFane(f.id)}
            className={`wgf ${fane === f.id ? "wgf-pa" : ""}`}
          >
            {f.id === "ko" ? `${f.tittel} (${tilKontroll.length})` : f.tittel}
          </button>
        ))}
      </nav>

      {(fane === "ko" || fane === "fysisk") && (
        <section className="wg-seksjon" aria-labelledby="wg-ko-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-ko-tittel">Til kontroll</h2>
            <span className="wg-kilde">{tilKontroll.length} venter</span>
          </div>
          <div className="wg-kort wg-saker">
            {testKo.length === 0 ? (
              <p className="wg-kilde" style={{ padding: "14px 0" }}>Ingen resultater er ført ennå.</p>
            ) : (
              testKo.map((item) => (
                <div key={item.id} className="wg-sak">
                  <span
                    className={`wg-pille ${
                      item.status === "Kontrollert" ? "wg-pille-ok" : item.status === "Avvist" ? "wg-pille-haster" : "wg-pille-vent"
                    }`}
                  >
                    <i />
                    {item.status === "Ført" ? "Egenført" : item.status}
                  </span>
                  <b>{item.elevNavn} · {item.testNavn}: {tall(item.verdi)} {item.enhet}</b>
                  <p>
                    {item.dato}, ført av {item.registrertAv}. {item.protokoll}.
                    {item.notat ? ` ${item.notat}` : ""}
                  </p>
                  {item.status === "Ført" ? (
                    <div className="wg-knapper">
                      <button type="button" disabled className="wg-btn wg-btn-primary" style={IKKE_KOBLET_KNAPP_STIL}>
                        Kontroller
                      </button>
                      <button type="button" disabled className="wg-btn wg-btn-secondary" style={IKKE_KOBLET_KNAPP_STIL}>
                        Avvis
                      </button>
                      <WangIkkeKoblet />
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {fane === "fysisk" && (
        <section className="wg-seksjon" aria-labelledby="wg-batteri-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-batteri-tittel">Fysiske tester</h2>
            <span className="wg-kilde">Nivå A–K: referanse ikke satt</span>
          </div>
          <div className="wg-rutenett">
            {BATTERI.map((b) => {
              const t = b.id ? fysiskeTester.find((f) => f.id === b.id) : undefined;
              return (
                <div key={b.navn} className="wg-kort">
                  <span className="wg-dato">{t ? `${t.kategori} · ${t.enhet}` : "Ikke i kilden ennå"}</span>
                  <h3>{b.navn}</h3>
                  {t ? <p className="wg-kilde">{t.beskrivelse}</p> : null}
                  <div className="wg-maltall" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                    <div><strong>{t ? tall(t.nasjonaltSnitt) : "—"}</strong><span>Nasjonalt snitt</span></div>
                    <div><strong>{t ? tall(t.nasjonalTopp) : "—"}</strong><span>Nasjonal topp</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {fane === "scorekort" && (
        <section className="wg-seksjon" aria-labelledby="wg-for-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-for-tittel">Før testresultat</h2>
            <span className="wg-kilde">Resultatet lagres som Kontrollert</span>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="wg-kort wg-fyll" style={{ maxWidth: 600 }}>
            <div className="wg-rutenett">
              <label className="wg-lbl">
                <span>Elev</span>
                <select value={valgtElevId} onChange={(e) => setValgtElevId(e.target.value)} className="wg-field">
                  {WANG_ELEVER.map((e) => (
                    <option key={e.id} value={e.id}>{e.navn} ({e.trinn})</option>
                  ))}
                </select>
              </label>
              <label className="wg-lbl">
                <span>Test</span>
                <select value={valgtTestId} onChange={(e) => setValgtTestId(e.target.value)} className="wg-field">
                  {WANG_FYSISKE_TESTER.map((t) => (
                    <option key={t.id} value={t.id}>{t.navn} ({t.enhet})</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="wg-lbl">
              <span>Målt resultat</span>
              <input
                type="text"
                inputMode="decimal"
                value={innsendtVerdi}
                onChange={(e) => setInnsendtVerdi(e.target.value)}
                placeholder="For eksempel 1,85 eller 16,5"
                className="wg-field"
                required
              />
            </label>
            <div className="wg-knapper" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button type="submit" disabled className="wg-btn wg-btn-primary" style={IKKE_KOBLET_KNAPP_STIL}>
                Lagre resultat
              </button>
              <WangIkkeKoblet />
            </div>
          </form>
        </section>
      )}

      {(fane === "rangering" || fane === "fysisk") && (
        <section className="wg-seksjon" aria-labelledby="wg-rang-tittel">
          <div className="wg-sek-topp">
            <h2 id="wg-rang-tittel">Rangering: markløft trapbar</h2>
            <span className="wg-kilde">Bare dine elever</span>
          </div>
          <div className="wg-kort wg-rader">
            {toppliste.length === 0 || !trapbar ? (
              <p className="wg-kilde" style={{ padding: "14px 0" }}>Ingen resultater ennå.</p>
            ) : (
              toppliste.map((elev, idx) => (
                <div key={elev.id} className="wg-rad">
                  <div>
                    <b>{idx + 1}. {elev.navn}</b>
                    <p className="wg-kilde">{elev.trinn} · {elev.klubb}</p>
                  </div>
                  <span className="wg-tall">{trapbar.resultater[elev.id]} kg</span>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </>
  );
}
