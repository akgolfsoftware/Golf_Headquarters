"use client";

import React from "react";
import { WangTomTilstand } from "./WangIkkeKoblet";
import {
  fjernTimeplanUnntak,
  lagTimeplanUnntak,
  lagTrenerInvitasjon,
  trekkTrenerInvitasjon,
} from "@/app/team-wang/coach/admin-actions";
import { TOM_ADMINDATA, type WangAdminData } from "@/app/team-wang/_data/wang-admin-visning";
import { MAKS_TEGN_UNNTAK } from "@/app/team-wang/_data/wang-admin-grenser";
import { WangFaner, WangTopp, initialer } from "./wang-felles";
import type { WangTrenerData } from "@/app/team-wang/_data/wang-trener-data";
import { TOM_TESTERDATA, type WangSamtykkeStatus, type WangTesterData } from "@/app/team-wang/_data/wang-tester-visning";

interface WangAdminProps {
  data: WangTrenerData;
  /** Testsamtykket per elev (samtykke) hentes på serveren bare for sportssjef. */
  tester?: WangTesterData;
  /** Invitasjoner og timeplanunntak, hentet på serveren bare for sportssjef. */
  admin?: WangAdminData;
  /** Underside: trenere · samtykke · timeplan · opptak · skolene. */
  aktivFane?: string;
  onFaneEndret?: (fane: string) => void;
}

const FANER = [
  { id: "trenere", tittel: "Trenere" },
  { id: "samtykke", tittel: "Samtykke" },
  { id: "timeplan", tittel: "Timeplan" },
  { id: "opptak", tittel: "Opptak" },
  { id: "skolene", tittel: "Skolene" },
];

const STATUS: Record<WangSamtykkeStatus, { tekst: string; klasse: string; farge: string }> = {
  DELT: { tekst: "Delt", klasse: "wg-pille-ok", farge: "var(--wg-mint)" },
  VENTER_PA_FORELDER: { tekst: "Venter på forelder", klasse: "wg-pille-vent", farge: "var(--wg-gul)" },
  IKKE_DELT: { tekst: "Ikke delt", klasse: "wg-pille-haster", farge: "var(--wg-rosa-tekst)" },
  IKKE_SVART: { tekst: "Ikke svart", klasse: "", farge: "var(--wg-n300)" },
};

/**
 * Pakke 8 Administrasjon, bare for sportssjef (serveren sender trener til I dag): Trenere og roller (WANG-19),
 * Samtykke og deling (WANG-34), Timeplan med kollisjoner (WANG-26), Opptak (WANG-31, -32) og Koordinering mellom
 * skolene (WANG-33).
 * Fasit: docs/design-system/utkast-wang/administrasjon.html (utkast 2, godkjent av Anders 16.10.2026). Lett hånd.
 * Avvik:
 *   - Samtykke viser testdelingen (TEST_RESULTATER), den eneste delingen til WANG som finnes. Utkastet sier «delt data».
 *   - Inviter trener lager en lenke som gjelder i sju dager for én e-postadresse. Ingen e-post sendes: sportssjefen
 *     kopierer lenken og sender den selv. Endre rolle og fjern tilgang er ikke med.
 *   - Nytt unntak lagrer dato og fritekst. Flytt morgentreningen er ikke med (W4, nattkjøring 18.10).
 *   - Timeplanen viser gruppas faste økter. Skolens timeplan og kollisjoner finnes ikke i basen.
 *   - Opptak og Koordinering mellom skolene krever tabeller som ikke finnes (kandidater, stjernemerking, kontaktlogg).
 */
export function WangAdmin({ data, tester = TOM_TESTERDATA, admin = TOM_ADMINDATA, aktivFane }: WangAdminProps) {
  const fane = FANER.some((f) => f.id === aktivFane) ? (aktivFane as string) : "trenere";
  return (
    <>
      <WangTopp dato={`${data.gruppeNavn} · golf`} tittel={TITTEL[fane]}>
        <WangFaner omraade="admin" aktiv={fane} faner={FANER} etikett="Administrasjon" />
      </WangTopp>
      {fane === "trenere" && <Trenere data={data} admin={admin} />}
      {fane === "samtykke" && <Samtykke data={data} tester={tester} />}
      {fane === "timeplan" && <Timeplan data={data} admin={admin} />}
      {fane === "opptak" && (
        <>
          <p className="wg-merknad">
            <span>Bare du ser denne siden. Vurderinger av navngitte mindreårige skrives aldri andre steder og deles aldri.</span>
          </p>
          <WangTomTilstand
            tittel="Ingen kandidater"
            tekst="Plasser, kandidater og venteliste for neste skoleår lagres ikke i basen ennå. Samlet poeng er underlag, aldri vedtak: vedtaket tar skolen."
          />
        </>
      )}
      {fane === "skolene" && (
        <WangTomTilstand
          tittel="Ikke koblet ennå"
          tekst="Den felles siden for WANG-skolene viser hvem som har stjernemerket en kandidat og hvem som har snakket med kandidaten, og når. Aldri innholdet, aldri tall. Stjernemerking og kontaktlogg finnes ikke i basen ennå."
        />
      )}
    </>
  );
}

const TITTEL: Record<string, string> = {
  trenere: "Administrasjon",
  samtykke: "Samtykke og deling",
  timeplan: "Timeplan",
  opptak: "Opptak",
  skolene: "Koordinering mellom skolene",
};

const datoKort = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });
const visDato = (iso: string) => datoKort.format(new Date(iso));

function Feilmelding({ feil }: { feil: string | null }) {
  return feil ? <p className="wg-hjelp" role="alert" style={{ color: "var(--wg-rosa-tekst)" }}>{feil}</p> : null;
}

function Trenere({ data, admin }: { data: WangTrenerData; admin: WangAdminData }) {
  const [aapen, setAapen] = React.useState(false);
  const [feil, setFeil] = React.useState<string | null>(null);
  const [lenke, setLenke] = React.useState<{ url: string; utloper: string } | null>(null);
  const [kopiert, setKopiert] = React.useState(false);
  const [venter, start] = React.useTransition();

  const lag = (form: FormData) =>
    start(async () => {
      setFeil(null);
      const svar = await lagTrenerInvitasjon(form);
      if (!svar.ok) return setFeil(svar.feil);
      setLenke({ url: `${window.location.origin}${svar.sti}`, utloper: svar.utloper });
      setKopiert(false);
      setAapen(false);
    });
  const kopier = async () => {
    if (!lenke) return;
    try {
      await navigator.clipboard.writeText(lenke.url);
      setKopiert(true);
    } catch {
      setFeil("Kunne ikke kopiere. Merk lenken og kopier den selv.");
    }
  };
  const trekk = (id: string) =>
    start(async () => {
      setFeil(null);
      const svar = await trekkTrenerInvitasjon(id);
      if (!svar.ok) setFeil(svar.feil);
    });

  return (
    <>
      <div className="wg-sek-topp">
        <h2 style={{ margin: 0 }}>Trenere og roller</h2>
        {!aapen && (
          <button type="button" className="wg-btn wg-btn-primary" onClick={() => { setAapen(true); setLenke(null); }}>
            Inviter trener
          </button>
        )}
      </div>
      {aapen && (
        <form className="wg-kort wg-fyll wg-skjema" action={lag}>
          <label className="wg-lbl">
            E-post til treneren
            <input className="wg-field" name="epost" type="email" required autoComplete="off" maxLength={254} />
            <span className="wg-hjelp">
              Lenken virker bare for en trenerkonto i AK Golf med denne e-postadressen, og gjelder i sju dager.
            </span>
          </label>
          <div className="wg-knapper">
            <button type="submit" className="wg-btn wg-btn-primary" disabled={venter}>{venter ? "Lager …" : "Lag lenke"}</button>
            <button type="button" className="wg-btn wg-btn-secondary" onClick={() => setAapen(false)}>Avbryt</button>
          </div>
          <Feilmelding feil={feil} />
        </form>
      )}
      {lenke && (
        <div className="wg-kort wg-fyll wg-skjema" aria-live="polite">
          <b className="wg-undertittel">Invitasjonslenken er laget</b>
          <label className="wg-lbl">
            Lenke
            <input className="wg-field" readOnly value={lenke.url} onFocus={(e) => e.currentTarget.select()} />
          </label>
          <div className="wg-knapper">
            <button type="button" className="wg-btn wg-btn-primary" onClick={kopier}>{kopiert ? "Kopiert" : "Kopier lenken"}</button>
          </div>
          <p className="wg-kilde">
            Gjelder til {visDato(lenke.utloper)}. Lenken vises bare nå. Ingen e-post er sendt: send lenken til treneren selv.
          </p>
        </div>
      )}
      {!aapen && <Feilmelding feil={feil} />}
      {data.trenere.length === 0 && admin.invitasjoner.length === 0 ? (
        <WangTomTilstand tittel="Ingen trenere" tekst="Gruppa har ingen trenere registrert ennå." />
      ) : (
        <div className="wg-kort wg-rader">
          {data.trenere.map((t) => (
            <div key={t.id} className="wg-rad">
              <span style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                <span className="wg-avatar" aria-hidden>{initialer(t.navn)}</span>
                <span style={{ display: "grid", gap: 2, minWidth: 0 }}>
                  <b>{t.navn}</b>
                  <span className="wg-kilde">
                    {t.rolle === "Trener" ? "Når elevene i gruppa. Ser bare det elevene har delt." : "Leser gruppa. Skriver ikke i elevenes plan."}
                  </span>
                </span>
              </span>
              <span className="wg-pille"><i />{t.rolle}</span>
            </div>
          ))}
          {admin.invitasjoner.map((i) => (
            <div key={i.id} className="wg-rad" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
              <span style={{ display: "grid", gap: 2, minWidth: 0 }}>
                <b style={{ overflowWrap: "anywhere" }}>{i.epost}</b>
                <span className="wg-kilde">{i.utlopt ? `Utløpt ${visDato(i.utloper)}` : `Lenken gjelder til ${visDato(i.utloper)}`}</span>
              </span>
              <span className="wg-knapper">
                <span className={`wg-pille ${i.utlopt ? "" : "wg-pille-vent"}`}><i />{i.utlopt ? "Utløpt" : "Invitert"}</span>
                {!i.utlopt && (
                  <button type="button" className="wg-btn wg-btn-ghost" disabled={venter} onClick={() => trekk(i.id)}>
                    Trekk tilbake
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="wg-kilde">
        Rollen gjelder bare ved denne skolen. Ingen trener her ser elever ved andre WANG-skoler. En invitert trener får
        tilgang først når lenken er åpnet og godtatt.
      </p>
    </>
  );
}

function Samtykke({ data, tester }: { data: WangTrenerData; tester: WangTesterData }) {
  const status = (id: string): WangSamtykkeStatus =>
    tester.samtykke?.[id] ?? (tester.delerIder.includes(id) ? "DELT" : "IKKE_SVART");
  const antall = (s: WangSamtykkeStatus) => data.elever.filter((e) => status(e.id) === s).length;
  const delt = antall("DELT");
  const rekkefolge: WangSamtykkeStatus[] = ["DELT", "VENTER_PA_FORELDER", "IKKE_DELT", "IKKE_SVART"];

  if (data.elever.length === 0) {
    return <WangTomTilstand tittel="Ingen elever i gruppa" tekst="Samtykket vises per elev når elevene er lagt inn." />;
  }

  return (
    <>
      <div className="wg-to-kol">
        <div className="wg-kort wg-fyll">
          <p className="wg-hoved">
            <strong>{delt}</strong>
            <span>av {data.elever.length} deler testene med WANG</span>
          </p>
          <div className="wg-periodebaand" role="img" aria-label={rekkefolge.map((s) => `${STATUS[s].tekst} ${antall(s)}`).join(", ")}>
            {rekkefolge.map((s) =>
              antall(s) > 0 ? <span key={s} style={{ flex: antall(s), background: STATUS[s].farge }} /> : null,
            )}
          </div>
          <div className="wg-lg-rad">
            {rekkefolge.map((s) => (
              <span key={s} className="wg-lg">
                <i style={{ background: STATUS[s].farge }} />
                {STATUS[s].tekst} {antall(s)}
              </span>
            ))}
          </div>
          <p className="wg-kilde">
            Samtykket gjelder testresultater. Under 16 år må forelder svare. Eleven kan trekke det når som helst; da
            forsvinner tilgangen med en gang.
          </p>
        </div>
        <div className="wg-kort wg-rader">
          {data.elever.map((e) => {
            const s = STATUS[status(e.id)];
            return (
              <div key={e.id} className="wg-rad">
                <b>{e.navn}</b>
                <span className={`wg-pille ${s.klasse}`}><i />{s.tekst}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="wg-kort wg-fyll">
        <b className="wg-undertittel">Team Norway</b>
        <p className="wg-forklar">Delte testresultater deles også med Team Norway, med navn (opptaksavtalen).</p>
      </div>
    </>
  );
}

function Timeplan({ data, admin }: { data: WangTrenerData; admin: WangAdminData }) {
  const [aapen, setAapen] = React.useState(false);
  const [feil, setFeil] = React.useState<string | null>(null);
  const [venter, start] = React.useTransition();

  const lagre = (form: FormData) =>
    start(async () => {
      setFeil(null);
      const svar = await lagTimeplanUnntak(form);
      if (!svar.ok) return setFeil(svar.feil);
      setAapen(false);
    });
  const fjern = (id: string) =>
    start(async () => {
      setFeil(null);
      const svar = await fjernTimeplanUnntak(id);
      if (!svar.ok) setFeil(svar.feil);
    });

  return (
    <div className="wg-to-kol">
      <div className="wg-kort wg-fyll">
        <b className="wg-undertittel">Ukemal</b>
        {data.fasteOkter.length === 0 ? (
          <p className="wg-kilde">Gruppa har ingen faste økter i kalenderen.</p>
        ) : (
          <div className="wg-rader" style={{ padding: 0 }}>
            {data.fasteOkter.map((o) => (
              <div key={`${o.dag}-${o.tid}-${o.tittel}`} className="wg-rad">
                <span style={{ display: "grid", gap: 2 }}>
                  <b>{o.dag} {o.tid}</b>
                  <span className="wg-kilde">{o.tittel}{o.sted ? ` · ${o.sted}` : ""}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="wg-kort wg-fyll">
        <b className="wg-undertittel">Unntak</b>
        {admin.unntak.length === 0 ? (
          <p className="wg-kilde">Ingen kommende unntak.</p>
        ) : (
          <div className="wg-rader" style={{ padding: 0 }}>
            {admin.unntak.map((u) => (
              <div key={u.id} className="wg-rad">
                <span style={{ display: "grid", gap: 2, minWidth: 0 }}>
                  <b>Uke {u.uke}</b>
                  <span className="wg-kilde">
                    {visDato(u.fra)}{u.til ? `–${visDato(u.til)}` : ""}: {u.tekst}
                  </span>
                </span>
                <button type="button" className="wg-btn wg-btn-ghost" disabled={venter} onClick={() => fjern(u.id)}>
                  Fjern
                </button>
              </div>
            ))}
          </div>
        )}
        {aapen ? (
          <form className="wg-skjema" style={{ display: "grid" }} action={lagre}>
            <label className="wg-lbl">
              Fra
              <input className="wg-field" name="fra" type="date" required />
            </label>
            <label className="wg-lbl">
              Til (valgfritt)
              <input className="wg-field" name="til" type="date" />
            </label>
            <label className="wg-lbl">
              Hva gjelder det
              <textarea className="wg-field" name="tekst" rows={3} required maxLength={MAKS_TEGN_UNNTAK} />
              <span className="wg-hjelp">For eksempel heldagsprøve, ferie eller testuke. Skriv aldri elevnavn eller helseopplysninger her.</span>
            </label>
            <div className="wg-knapper">
              <button type="submit" className="wg-btn wg-btn-primary" disabled={venter}>{venter ? "Lagrer …" : "Lagre unntak"}</button>
              <button type="button" className="wg-btn wg-btn-secondary" onClick={() => setAapen(false)}>Avbryt</button>
            </div>
          </form>
        ) : (
          <div className="wg-knapper">
            <button type="button" className="wg-btn wg-btn-primary" onClick={() => setAapen(true)}>Nytt unntak</button>
          </div>
        )}
        <Feilmelding feil={feil} />
        <p className="wg-kilde">Skolens timeplan og prøver finnes ikke i basen, så kollisjoner vises ikke automatisk.</p>
      </div>
    </div>
  );
}
