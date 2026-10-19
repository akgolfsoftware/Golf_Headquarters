"use client";

import React, { useState, useTransition } from "react";
import { WangTomTilstand } from "./WangIkkeKoblet";
import { WangSmaaTall, initialer, kortDato } from "./wang-felles";
import {
  KANDIDAT_STATUS,
  KANDIDAT_STATUS_TEKST,
  kontaktTekst,
  type WangKandidatStatus,
  type WangKontaktMottaker,
  type WangOpptakData,
} from "@/app/team-wang/_data/wang-opptak-visning";
import {
  fjernKandidat,
  leggTilKandidat,
  loggKontakt,
  settKandidatStatus,
  settPlasser,
  settStjerne,
  type OpptakResultat,
} from "@/app/team-wang/coach/opptak-actions";

/**
 * Opptak (WANG-31, -32) og Koordinering mellom skolene (WANG-33), bare for sportssjef.
 * Fasit: docs/design-system/utkast-wang/administrasjon.html (utkast 2).
 * Avvik:
 *   - Ingen samlet poeng og ingen vurderingspunkter: punktene (D1) er ikke avgjort. Lista sorteres med
 *     stjernemerkede først, deretter navn.
 *   - Ingen notatfelt. Vurderinger av navngitte mindreårige lagres ikke før punktene er bestemt.
 *   - Kontaktloggen fører bare sportssjefens egne kontakter (personen som er logget inn).
 */

function Stjerne({ fylt }: { fylt: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden
      style={{ fill: fylt ? "var(--wg-gul)" : "none", stroke: fylt ? "var(--wg-gul-tekst)" : "var(--wg-n400)", strokeWidth: 1.5, flex: "none" }}>
      <path d="M12 2l3 7h7l-5.5 4.5 2 7.5-6.5-4.5-6.5 4.5 2-7.5L2 9h7z" />
    </svg>
  );
}

function useHandling() {
  const [venter, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const kjor = (fn: () => Promise<OpptakResultat>, ok?: () => void) =>
    start(async () => {
      setFeil(null);
      try {
        const r = await fn();
        if (r.ok) ok?.();
        else setFeil(r.feil);
      } catch {
        setFeil("Det ble ikke lagret. Prøv igjen.");
      }
    });
  return { venter, feil, kjor };
}

function Feil({ tekst }: { tekst: string | null }) {
  return tekst ? <p className="wg-hjelp" role="alert" style={{ color: "var(--wg-rosa-tekst)" }}>{tekst}</p> : null;
}

export function WangAdminLukket() {
  return (
    <div className="wg-kort wg-fyll" role="status" style={{ maxWidth: 560 }}>
      <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden style={{ fill: "none", stroke: "var(--wg-navy)", strokeWidth: 1.8 }}>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
      <b className="wg-undertittel">Denne siden er lukket</b>
      <p className="wg-forklar">Administrasjon er bare for sportssjef. Trenger du tilgang, kontakt sportssjefen.</p>
    </div>
  );
}

export function WangOpptak({ opptak }: { opptak?: WangOpptakData }) {
  const [visNy, setVisNy] = useState(false);
  if (!opptak) return <WangTomTilstand tittel="Opptaket kunne ikke hentes" tekst="Last siden på nytt." />;
  const venteliste = opptak.kandidater.filter((k) => k.status === "VENTELISTE").length;

  return (
    <>
      <WangSmaaTall
        tall={[
          { verdi: opptak.plasser === null ? "—" : String(opptak.plasser), tekst: "Plasser i VG1" },
          { verdi: String(opptak.kandidater.length), tekst: "Kandidater" },
          { verdi: String(venteliste), tekst: "På venteliste" },
        ]}
      />
      <p className="wg-merknad">
        <span>Bare du ser denne siden. Kandidatene er mindreårige: ikke skriv om dem andre steder, og del aldri listen.</span>
      </p>
      <div className="wg-to-kol">
        <div className="wg-kort wg-fyll">
          <div className="wg-sek-topp">
            <b className="wg-undertittel">Kandidater · {opptak.skoleaar}</b>
            <button type="button" className="wg-btn wg-btn-primary" onClick={() => setVisNy((v) => !v)} aria-expanded={visNy}>
              Ny kandidat
            </button>
          </div>
          {visNy && <NyKandidat onFerdig={() => setVisNy(false)} />}
          {opptak.kandidater.length === 0 ? (
            <p className="wg-kilde">Ingen kandidater for {opptak.skoleaar} ennå.</p>
          ) : (
            <div className="wg-rader" style={{ padding: 0 }}>
              {opptak.kandidater.map((k) => (
                <Kandidat key={k.id} kandidat={k} />
              ))}
            </div>
          )}
          <p className="wg-kilde">Status er underlag, ikke vedtak. Vedtaket tar skolen.</p>
        </div>
        <Plasser plasser={opptak.plasser} />
      </div>
    </>
  );
}

function NyKandidat({ onFerdig }: { onFerdig: () => void }) {
  const { venter, feil, kjor } = useHandling();
  const [navn, setNavn] = useState("");
  const [klubb, setKlubb] = useState("");
  const [aar, setAar] = useState("");
  return (
    <form
      className="wg-skjema"
      style={{ display: "grid", gap: 12, padding: "12px 0" }}
      onSubmit={(e) => {
        e.preventDefault();
        kjor(
          () => leggTilKandidat({ navn, klubb, fodselsaar: aar.trim() ? Number(aar) : null }),
          () => {
            setNavn("");
            setKlubb("");
            setAar("");
            onFerdig();
          },
        );
      }}
    >
      <label className="wg-lbl">
        Navn
        <input className="wg-field" value={navn} onChange={(e) => setNavn(e.target.value)} required minLength={2} maxLength={120} autoComplete="off" />
      </label>
      <label className="wg-lbl">
        Klubb
        <input className="wg-field" value={klubb} onChange={(e) => setKlubb(e.target.value)} maxLength={120} autoComplete="off" />
      </label>
      <label className="wg-lbl">
        Fødselsår
        <input className="wg-field" value={aar} onChange={(e) => setAar(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="F.eks. 2011" />
        <span className="wg-hjelp">Bare det opptaket trenger. Ikke skriv helse, karakterer eller vurderinger her.</span>
      </label>
      <Feil tekst={feil} />
      <div className="wg-knapper">
        <button type="submit" className="wg-btn wg-btn-primary" disabled={venter}>{venter ? "Lagrer …" : "Lagre kandidat"}</button>
        <button type="button" className="wg-btn wg-btn-ghost" onClick={onFerdig}>Avbryt</button>
      </div>
    </form>
  );
}

function Kandidat({ kandidat: k }: { kandidat: WangOpptakData["kandidater"][number] }) {
  const { venter, feil, kjor } = useHandling();
  const [bekreft, setBekreft] = useState(false);
  const detaljer = [k.klubb, k.fodselsaar ? `født ${k.fodselsaar}` : null].filter(Boolean).join(" · ") || "—";
  return (
    <div className="wg-rad" style={{ gridTemplateColumns: "minmax(0, 1fr) auto" }}>
      <span style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
        <span className="wg-avatar" aria-hidden>{initialer(k.navn)}</span>
        <span style={{ display: "grid", gap: 2, minWidth: 0 }}>
          <b style={{ overflowWrap: "anywhere" }}>{k.navn}</b>
          <span className="wg-kilde">{detaljer}</span>
        </span>
      </span>
      <button
        type="button"
        className="wg-btn wg-btn-ghost"
        aria-pressed={k.stjerneEgen}
        aria-label={k.stjerneEgen ? `Fjern stjerne fra ${k.navn}` : `Stjernemerk ${k.navn}`}
        disabled={venter}
        onClick={() => kjor(() => settStjerne({ kandidatId: k.id, merket: !k.stjerneEgen }))}
        style={{ minWidth: 44, minHeight: 44, padding: 0 }}
      >
        <Stjerne fylt={k.stjerneEgen} />
      </button>
      <div className="wg-knapper" style={{ gridColumn: "1 / -1", alignItems: "flex-end" }}>
        <label className="wg-lbl" style={{ flex: "1 1 180px" }}>
          <span className="wg-kilde">Status</span>
          <select
            className="wg-field"
            value={k.status}
            disabled={venter}
            onChange={(e) => kjor(() => settKandidatStatus({ kandidatId: k.id, status: e.target.value as WangKandidatStatus }))}
          >
            {KANDIDAT_STATUS.map((s) => (
              <option key={s} value={s}>{KANDIDAT_STATUS_TEKST[s]}</option>
            ))}
          </select>
        </label>
        {bekreft ? (
          <>
            <button type="button" className="wg-btn wg-btn-fare" disabled={venter} onClick={() => kjor(() => fjernKandidat({ kandidatId: k.id }))}>
              Fjern for godt
            </button>
            <button type="button" className="wg-btn wg-btn-ghost" onClick={() => setBekreft(false)}>Avbryt</button>
          </>
        ) : (
          <button type="button" className="wg-btn wg-btn-ghost" onClick={() => setBekreft(true)}>Fjern</button>
        )}
      </div>
      {bekreft && <p className="wg-hjelp" style={{ gridColumn: "1 / -1" }}>Kandidaten, stjernene og kontaktloggen slettes.</p>}
      {feil && <div style={{ gridColumn: "1 / -1" }}><Feil tekst={feil} /></div>}
    </div>
  );
}

function Plasser({ plasser }: { plasser: number | null }) {
  const { venter, feil, kjor } = useHandling();
  const [verdi, setVerdi] = useState(plasser === null ? "" : String(plasser));
  return (
    <form
      className="wg-kort wg-fyll wg-skjema"
      onSubmit={(e) => {
        e.preventDefault();
        kjor(() => settPlasser({ plasser: verdi.trim() ? Number(verdi) : null }));
      }}
    >
      <b className="wg-undertittel">Plasser</b>
      <label className="wg-lbl">
        Plasser i VG1
        <input className="wg-field" value={verdi} onChange={(e) => setVerdi(e.target.value.replace(/\D/g, "").slice(0, 2))} inputMode="numeric" />
        <span className="wg-hjelp">Tomt felt betyr at tallet ikke er satt.</span>
      </label>
      <Feil tekst={feil} />
      <div className="wg-knapper">
        <button type="submit" className="wg-btn wg-btn-secondary" disabled={venter}>{venter ? "Lagrer …" : "Lagre plasser"}</button>
      </div>
    </form>
  );
}

export function WangKoordinering({ opptak }: { opptak?: WangOpptakData }) {
  if (!opptak) return <WangTomTilstand tittel="Koordineringen kunne ikke hentes" tekst="Last siden på nytt." />;
  return (
    <>
      <p className="wg-forklar">
        Hvem som har stjernemerket en kandidat, og hvem som har snakket med kandidaten eller foresatte, og når.
        Aldri innhold, aldri vurderinger. En kandidat kommer hit når en skole stjernemerker eller logger kontakt.
      </p>
      {opptak.koordinering.length === 0 ? (
        <WangTomTilstand
          tittel="Ingen felles kandidater"
          tekst="Stjernemerk en kandidat i Opptak, så ser de andre WANG-skolene at dere følger kandidaten."
        />
      ) : (
        <div style={{ display: "grid", gap: 20, alignItems: "start", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))" }}>
          {opptak.koordinering.map((k) => (
            <KoordineringKort key={k.id} kandidat={k} />
          ))}
        </div>
      )}
      <p className="wg-kilde">Kandidaten og foresatte ser aldri denne siden.</p>
    </>
  );
}

function KoordineringKort({ kandidat: k }: { kandidat: WangOpptakData["koordinering"][number] }) {
  const { venter, feil, kjor } = useHandling();
  const [visLogg, setVisLogg] = useState(false);
  const [mottaker, setMottaker] = useState<WangKontaktMottaker>("KANDIDAT");
  const [dato, setDato] = useState(() => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date()));
  const detaljer = [k.klubb, k.fodselsaar ? `født ${k.fodselsaar}` : null].filter(Boolean).join(" · ");
  return (
    <div className="wg-kort wg-fyll">
      <div className="wg-sek-topp">
        <b className="wg-undertittel" style={{ overflowWrap: "anywhere" }}>{k.navn}</b>
        <button
          type="button"
          className="wg-btn wg-btn-ghost"
          aria-pressed={k.stjerneEgen}
          disabled={venter}
          onClick={() => kjor(() => settStjerne({ kandidatId: k.id, merket: !k.stjerneEgen }))}
        >
          <Stjerne fylt={k.stjerneEgen} /> {k.stjerneEgen ? "Stjernemerket" : "Stjernemerk"}
        </button>
      </div>
      {detaljer && <p className="wg-kilde">{detaljer}</p>}
      <p className="wg-forklar"><b>Stjernemerket av:</b> {k.stjernerFra.length ? k.stjernerFra.join(", ") : "—"}</p>
      {k.kontakter.length === 0 ? (
        <p className="wg-kilde">Ingen kontakt logget.</p>
      ) : (
        <div className="wg-rader" style={{ padding: 0 }}>
          {k.kontakter.map((c) => (
            <div key={c.id} className="wg-rad" style={{ gridTemplateColumns: "auto minmax(0, 1fr)", alignItems: "start" }}>
              <time className="wg-kilde" dateTime={c.kontaktetAt} style={{ whiteSpace: "nowrap" }}>{kortDato(c.kontaktetAt.slice(0, 10))}</time>
              <span>{kontaktTekst(c)}</span>
            </div>
          ))}
        </div>
      )}
      {visLogg ? (
        <form
          className="wg-skjema"
          style={{ display: "grid", gap: 12 }}
          onSubmit={(e) => {
            e.preventDefault();
            kjor(() => loggKontakt({ kandidatId: k.id, mottaker, dato }), () => setVisLogg(false));
          }}
        >
          <div className="wg-lbl" role="group" aria-label="Snakket med">
            Snakket med
            <div className="wg-valg wg-valg-to">
              <button type="button" aria-pressed={mottaker === "KANDIDAT"} onClick={() => setMottaker("KANDIDAT")}>Kandidaten</button>
              <button type="button" aria-pressed={mottaker === "FORESATTE"} onClick={() => setMottaker("FORESATTE")}>Foresatte</button>
            </div>
          </div>
          <label className="wg-lbl">
            Dato
            <input className="wg-field" type="date" value={dato} onChange={(e) => setDato(e.target.value)} required />
            <span className="wg-hjelp">Bare hvem og når lagres. Ikke hva dere snakket om.</span>
          </label>
          <Feil tekst={feil} />
          <div className="wg-knapper">
            <button type="submit" className="wg-btn wg-btn-primary" disabled={venter}>{venter ? "Lagrer …" : "Lagre kontakt"}</button>
            <button type="button" className="wg-btn wg-btn-ghost" onClick={() => setVisLogg(false)}>Avbryt</button>
          </div>
        </form>
      ) : (
        <>
          <Feil tekst={feil} />
          <div className="wg-knapper">
            <button type="button" className="wg-btn wg-btn-secondary" onClick={() => setVisLogg(true)}>Logg kontakt</button>
          </div>
        </>
      )}
    </div>
  );
}
