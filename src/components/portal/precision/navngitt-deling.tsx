"use client";

/** Precision 7d7c2994, iup-komplett/deling-navngitt, eksport 81 (02.10.2026).
 * Reell innlogging og serverlagring erstatter prototypens rollebryter/lokal lagring.
 */
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Knapp, StatusPille } from "@/components/precision/pa";
import { NAVNGITT_PROFIL_TEKST, NAVNGITT_PROFIL_TEKST_VERSJON, NyTrenerInvitasjonSchema } from "@/lib/deling/navngitt-regler";
import type { hentEgenTrenerdeling } from "@/lib/deling/navngitt";
import { opprettNavngittDelingAction, trekkNavngittDelingAction, hentNavngittDelingAction } from "@/app/portal/meg/deling/actions";
import "@/styles/precision-athletics.css";
import "@/styles/navngitt-deling.css";

type Oversikt = NonNullable<Awaited<ReturnType<typeof hentEgenTrenerdeling>>>;
const statusNavn = { VENTER: "Venter på aksept", AKTIV: "Aktiv", UTLOPT: "Lenke utløpt", TRUKKET: "Trukket", STENGT: "Tilgang stengt" };
const dato = (s: string) => new Intl.DateTimeFormat("nb-NO", { dateStyle: "medium", timeZone: "Europe/Oslo" }).format(new Date(s));

export function NavngittDeling({ initial, erTrener = false }: { initial: Oversikt; erTrener?: boolean }) {
  const [oversikt, setOversikt] = useState(initial);
  const [grupperad, setGruppe] = useState(initial.grupper[0]?.id ?? "");
  const [epost, setEpost] = useState("");
  const [godkjent, setGodkjent] = useState(false);
  const [lenke, setLenke] = useState<string | null>(null);
  const [feil, setFeil] = useState("");
  const [kvittering, setKvittering] = useState("");
  const [trekker, setTrekker] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const forsok = useRef<{ signatur: string; id: string } | null>(null);
  const gruppe = oversikt.grupper.find((g) => g.id === grupperad);
  async function oppdater() {
    const ny = await hentNavngittDelingAction({ spillerId: oversikt.spiller.id });
    if (!ny) throw new Error("Ingen tilgang");
    setOversikt(ny);
  }
  function opprett() {
    setFeil(""); setKvittering(""); setLenke(null);
    const signatur = JSON.stringify([grupperad, epost.trim().toLowerCase(), godkjent]);
    if (forsok.current?.signatur !== signatur) forsok.current = { signatur, id: crypto.randomUUID() };
    const input = { requestId: forsok.current.id, spillerId: oversikt.spiller.id, gruppeId: grupperad,
      epost: epost.trim(), tekstVersjon: NAVNGITT_PROFIL_TEKST_VERSJON, godkjent };
    const lest = NyTrenerInvitasjonSchema.safeParse(input);
    if (!lest.success || lest.data.epost.split("@")[1] !== gruppe?.domene) { setFeil("Velg miljø, bruk trenerens riktige e-postadresse og bekreft delingen."); return; }
    start(async () => {
      try {
        const r = await opprettNavngittDelingAction(lest.data);
        if (!r.ok) { setFeil(r.melding); return; }
        forsok.current = null;
        if (r.token) {
          setLenke(`${window.location.origin}/auth/trenerdeling#${r.token}`);
          setKvittering(`Delingslenken er opprettet og gjelder til ${dato(r.expiresAt)}. Ingen e-post er sendt.`);
        } else setKvittering("Delingen er opprettet, men lenken kan ikke vises på nytt. Trekk den ventende delingen og opprett en ny lenke.");
        setGodkjent(false);
        try { await oppdater(); } catch { setFeil("Lenken er opprettet. Oversikten kunne ikke oppdateres; last siden på nytt etter at du har kopiert lenken."); }
      } catch { setFeil("Kvitteringen kunne ikke hentes. Prøv igjen med samme valg før du oppretter en ny deling."); }
    });
  }
  function trekk(id: string) {
    start(async () => {
      setFeil("");
      try {
        const r = await trekkNavngittDelingAction({ spillerId: oversikt.spiller.id, invitasjonId: id });
        if (!r.ok) { setFeil(r.melding); return; }
        setLenke(null); setTrekker(null); setKvittering("Tilgangen er trukket tilbake. Nye oppslag er stengt.");
        await oppdater();
      } catch { setFeil("Tilbaketrekkingen kunne ikke bekreftes. Prøv igjen."); }
    });
  }
  return <div className="pa-root" data-design="precision-athletics"><main className="deling-side">
    <header className="pa-pagehead">
      <Link className="deling-tilbake" href={oversikt.foresattVisning ? "/forelder/samtykke" : "/portal/meg/innstillinger/personvern/deling"}>{oversikt.foresattVisning ? "Foreldresamtykke" : "Meg · Deling"}</Link>
      <span className="kicker">{oversikt.foresattVisning ? `Foresatt for ${oversikt.spiller.name}` : "PlayerHQ · Meg"}</span>
      <h1 className="pa-pagehead__title">Trenerdeling</h1>
      <p>Del med én navngitt WANG- eller Team Norway-trener. Du beholder eierskapet til opplysningene dine.</p>
    </header>
    {erTrener && <Link className="deling-tilbake" href="/portal/meg/deling/innsyn">Spillere som deler med meg</Link>}
    {feil && <p role="alert" className="deling-feil">{feil}</p>}
    {kvittering && <p role="status">{kvittering}</p>}
    {lenke && <section className="deling-panel"><h2>Delingslenken</h2><p>Kopier lenken og gi den til den navngitte treneren. Den vises bare i denne fanen.</p>
      <label className="deling-felt">Delingslenke<input readOnly value={lenke} /></label>
      <Knapp onClick={async () => { try { await navigator.clipboard.writeText(lenke); setKvittering("Lenken er kopiert."); } catch { setFeil("Kopiering ble avvist. Marker og kopier lenken i feltet."); } }}>Kopier lenke</Knapp>
    </section>}
    <div className="deling-grid"><section className="deling-panel"><h2>Dine delinger</h2>
      {oversikt.invitasjoner.length === 0 ? <p>Du har ingen navngitte delinger ennå.</p> : <ul className="deling-liste">{oversikt.invitasjoner.map((r) => <li key={r.id}>
        <strong>{r.epost}</strong><span>{r.gruppeNavn}</span><StatusPille>{statusNavn[r.status]}</StatusPille>
        <small>{r.gittAvRolle === "FORESATT" ? "Gitt av foresatt" : "Gitt av spiller"} · {dato(r.opprettet)}</small>
        {r.status === "VENTER" && <small>Lenken gjelder til {dato(r.utlop)}</small>}
        {r.status !== "TRUKKET" && (trekker === r.id ? <div className="deling-handlinger"><p>Steng alle delingslenker til denne treneren i dette miljøet?</p><Knapp disabled={pending} onClick={() => trekk(r.id)}>Bekreft tilbaketrekking</Knapp><Knapp variant="secondary" disabled={pending} onClick={() => setTrekker(null)}>Behold deling</Knapp></div> : <Knapp variant="secondary" disabled={pending} onClick={() => setTrekker(r.id)}>Trekk tilbake</Knapp>)}
      </li>)}</ul>}
      {oversikt.nesteSide && <Knapp variant="secondary" disabled={pending} onClick={() => start(async () => {
        try { const mer = await hentNavngittDelingAction({ spillerId: oversikt.spiller.id, ...oversikt.nesteSide }); if (!mer) throw new Error(); setOversikt((o) => ({ ...mer, invitasjoner: [...o.invitasjoner, ...mer.invitasjoner] })); }
        catch { setFeil("Tidligere delinger kunne ikke hentes. Prøv igjen."); }
      })}>Vis tidligere delinger</Knapp>}
    </section><section className="deling-panel"><h2>Ny deling</h2>
      {!oversikt.kanGi ? <p>{oversikt.grupper.length ? "En godkjent foresatt må opprette delingen når spilleren er under 16 år. Du kan selv trekke tidligere deling." : "Nye delinger krever aktiv spillertilknytning til WANG eller Team Norway. Tidligere delinger kan fortsatt trekkes."}</p> : <form onSubmit={(e) => { e.preventDefault(); opprett(); }}>
        <label className="deling-felt">Miljø<select value={grupperad} disabled={pending} onChange={(e) => setGruppe(e.target.value)}>{oversikt.grupper.map((g) => <option key={g.id} value={g.id}>{g.navn}</option>)}</select></label>
        <label className="deling-felt">Trenerens e-post<input type="email" autoComplete="off" value={epost} disabled={pending} onChange={(e) => setEpost(e.target.value)} required maxLength={254} /><small>Bruk adressen på @{gruppe?.domene} som treneren logger inn med.</small></label>
        <div className="deling-samtykke"><h3>{NAVNGITT_PROFIL_TEKST.tittel}</h3><p>{NAVNGITT_PROFIL_TEKST.forklaring}</p><ul>{NAVNGITT_PROFIL_TEKST.punkter.map((p) => <li key={p}>{p}</li>)}</ul></div>
        <p>Dette innsynet viser foreløpig leverte utviklingssjekker og sesongevalueringer. Øvrige profildeler er ikke tilgjengelige her ennå.</p>
        <label className="deling-avkrysning"><input type="checkbox" checked={godkjent} disabled={pending} onChange={(e) => setGodkjent(e.target.checked)} />Jeg har lest omfanget og godkjenner delingen med denne treneren.</label>
        <Knapp type="submit" loading={pending} disabled={pending || !godkjent}>Opprett delingslenke</Knapp>
      </form>}
    </section></div>
    <p>Navngitt trenerdeling er et eget samtykke. Tidligere deling med grupper er uendret.</p>
  </main></div>;
}
