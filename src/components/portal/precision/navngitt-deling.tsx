"use client";

/**
 * PlayerHQ · Meg · Deling · Del med trener (/portal/meg/deling) i nytt design.
 * Fasit: docs/design-system/utkast-playerhq/meg.html, skjermen «PH-27 Deling» og arket «Del med trener».
 * Stil: src/styles/playerhq-ny.css og playerhq-ny-meg.css (samme flate som PH27Deling). Skrå-drakten (R7): SkraTopp og SkraFlyt som PH27Deling,
 * bare når siden vises i PlayerHQSkall (`skra`); trener og foresatt uten spillermeny beholder den enkle toppen.
 *
 * Funksjonene er de samme som før (Precision 7d7c2994, deling-navngitt): velg miljø, trenerens e-post
 * med domenesjekk, samtykketekst, aktiv avkrysning, lenke som vises én gang, trekk tilbake og eldre delinger.
 *
 * Avvik:
 *   - Knappen heter «Opprett delingslenke», ikke «Send lenke»: appen sender ingen e-post, spilleren kopierer lenken.
 *   - Miljøvalget står med, fordi en spiller kan være i både WANG og Team Norway.
 *   - «Venter på deg» (forespørsel fra trener) finnes ikke i datamodellen og vises ikke.
 */
import { useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, Link2 } from "lucide-react";
import { initialer } from "@/lib/portal/initialer";
import { NAVNGITT_PROFIL_TEKST, NAVNGITT_PROFIL_TEKST_VERSJON, NyTrenerInvitasjonSchema } from "@/lib/deling/navngitt-regler";
import type { hentEgenTrenerdeling } from "@/lib/deling/navngitt";
import { opprettNavngittDelingAction, trekkNavngittDelingAction, hentNavngittDelingAction } from "@/app/portal/meg/deling/actions";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke5-skra.css";

type Oversikt = NonNullable<Awaited<ReturnType<typeof hentEgenTrenerdeling>>>;
type Rad = Oversikt["invitasjoner"][number];
const statusNavn = { VENTER: "Ikke åpnet", AKTIV: "Ser profilen", UTLOPT: "Lenke utløpt", TRUKKET: "Trukket", STENGT: "Tilgang stengt" };
const statusKlasse = { VENTER: "noy", AKTIV: "ok", UTLOPT: "noy", TRUKKET: "noy", STENGT: "noy" };
const dato = (s: string) => new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Oslo" }).format(new Date(s));
const erTn = (navn: string) => /team norway/i.test(navn);

export function NavngittDeling({ initial, erTrener = false, skra = false }: { initial: Oversikt; erTrener?: boolean; skra?: boolean }) {
  const [oversikt, setOversikt] = useState(initial);
  const [grupperad, setGruppe] = useState(initial.grupper[0]?.id ?? "");
  const [epost, setEpost] = useState("");
  const [godkjent, setGodkjent] = useState(false);
  const [lenke, setLenke] = useState<string | null>(null);
  const [feil, setFeil] = useState("");
  const [kvittering, setKvittering] = useState("");
  const [trekker, setTrekker] = useState<Rad | null>(null);
  const [pending, start] = useTransition();
  const forsok = useRef<{ signatur: string; id: string } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const gruppe = oversikt.grupper.find((g) => g.id === grupperad);
  const aktive = oversikt.invitasjoner.filter((r) => r.status === "AKTIV");
  const venter = oversikt.invitasjoner.filter((r) => r.status === "VENTER");
  const tidligere = oversikt.invitasjoner.filter((r) => r.status !== "AKTIV" && r.status !== "VENTER");

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

  const tilgang = (r: Rad) => <article key={r.id} className="tilgang">
    <div className="tilgang-topp">
      <span className={`avatar ${erTn(r.gruppeNavn) ? "tn" : "wang"}`} aria-hidden>{initialer(r.epost.split("@")[0]?.replace(/[._-]/g, " ") ?? "")}</span>
      <span><b>{r.epost}</b><span className="phn-kilde">{r.gruppeNavn} · {r.gittAvRolle === "FORESATT" ? "gitt av foresatt" : "gitt av spiller"} · {dato(r.opprettet)}</span></span>
      <span className={`phn-pille ${statusKlasse[r.status]}`}><i />{statusNavn[r.status]}</span>
    </div>
    {r.status === "VENTER" && <p className="phn-kilde">Lenken gjelder til {dato(r.utlop)}.</p>}
    {r.status === "AKTIV" && <p className="phn-forklar">Treneren sender forslag. Ingenting endres før du godtar.</p>}
    {r.status !== "TRUKKET" && <div className="phn-knapper">
      <button type="button" className="phn-knapp sek" disabled={pending} onClick={() => { setTrekker(r); dialog.current?.showModal(); }}>Trekk tilbake</button>
    </div>}
  </article>;

  const tilbakeHref = oversikt.foresattVisning ? "/forelder/samtykke" : "/portal/meg/innstillinger/personvern/deling";
  const tilbakeTekst = oversikt.foresattVisning ? "Foreldresamtykke" : "Deling";
  const overlinje = oversikt.foresattVisning ? `Foresatt for ${oversikt.spiller.name}` : "Meg · deling";

  return <div className={skra ? "phn phn-meg phn-skra" : "phn phn-meg"}>
    {skra && <SkraTopp
      lav
      etikett="Plan"
      bilde="/images/playerhq/tek-video.jpg" bildePosisjon="50% 50%"
      overlinje={overlinje}
      tittel="Del med trener"
      handling={<span className="skra-tilbake"><Link className="tilbake" href={tilbakeHref}><ChevronLeft size={18} aria-hidden />{tilbakeTekst}</Link></span>}
    />}
    <Flyt skra={skra}><div className="side">
    {!skra && <div className="topp">
      <Link className="tilbake" href={tilbakeHref}><ChevronLeft size={18} aria-hidden />{tilbakeTekst}</Link>
      <div>
        <div className="phn-dato">{overlinje}</div>
        <h1 className="phn-tittel">Del med trener</h1>
      </div>
    </div>}

    <div className="to-del">
      <div>
        <div className="phn-kort">
          <div className="phn-hoved"><strong>{aktive.length}</strong><span className="phn-forklar">{aktive.length === 1 ? "trener ser" : "trenere ser"} profilen din</span></div>
          <p className="phn-kilde">Del med én navngitt WANG- eller Team Norway-trener. Du beholder eierskapet til opplysningene dine.</p>
        </div>
        <div className="innsyn-alt">
          <b>{NAVNGITT_PROFIL_TEKST.tittel}</b>
          <span style={{ fontSize: 14.5 }}>{NAVNGITT_PROFIL_TEKST.forklaring}</span>
          <ul>{NAVNGITT_PROFIL_TEKST.punkter.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>

        <div className="phn-meldinger" aria-live="polite">
          {feil && <p className="feilboks" role="alert">{feil}</p>}
          {kvittering && <p className="kvittering" role="status">{kvittering}</p>}
        </div>

        {lenke && <section className="phn-kort" aria-labelledby="del-lenke">
          <h2 id="del-lenke" className="phn-undertittel">Delingslenken</h2>
          <p className="phn-forklar">Kopier lenken og gi den til den navngitte treneren. Den vises bare i denne fanen.</p>
          <label className="phn-felt">Delingslenke<input readOnly value={lenke} /></label>
          <div className="phn-knapper"><button type="button" className="phn-knapp pri" onClick={async () => {
            try { await navigator.clipboard.writeText(lenke); setKvittering("Lenken er kopiert."); } catch { setFeil("Kopiering ble avvist. Marker og kopier lenken i feltet."); }
          }}><Link2 size={18} aria-hidden />Kopier lenke</button></div>
        </section>}

        <section className="phn-seksjon" aria-labelledby="del-ny">
          <div className="phn-sek-topp"><h2 id="del-ny">Ny deling</h2></div>
          {!oversikt.kanGi
            ? <div className="phn-kort dempet"><p className="phn-forklar">{oversikt.grupper.length ? "En godkjent foresatt må opprette delingen når spilleren er under 16 år. Du kan selv trekke tidligere deling." : "Nye delinger krever aktiv spillertilknytning til WANG eller Team Norway. Tidligere delinger kan fortsatt trekkes."}</p></div>
            : <form className="phn-kort" onSubmit={(e) => { e.preventDefault(); opprett(); }}>
              <label className="phn-felt">Miljø<select value={grupperad} disabled={pending} onChange={(e) => setGruppe(e.target.value)}>{oversikt.grupper.map((g) => <option key={g.id} value={g.id}>{g.navn}</option>)}</select></label>
              <label className="phn-felt">Trenerens e-post
                <input type="email" autoComplete="off" placeholder={`navn@${gruppe?.domene ?? "wang.no"}`} value={epost} disabled={pending} onChange={(e) => setEpost(e.target.value)} required maxLength={254} />
                <span className="hjelp">Bruk adressen på @{gruppe?.domene} som treneren logger inn med.</span>
              </label>
              <p className="phn-kilde">Dette innsynet viser foreløpig leverte utviklingssjekker og sesongevalueringer. Øvrige profildeler er ikke tilgjengelige her ennå.</p>
              <label className="avkryss"><input type="checkbox" checked={godkjent} disabled={pending} onChange={(e) => setGodkjent(e.target.checked)} /><span>Jeg har lest omfanget og godkjenner delingen med denne treneren.</span></label>
              <button type="submit" className="phn-knapp pri stor" disabled={pending || !godkjent}>{pending ? "Oppretter …" : "Opprett delingslenke"}</button>
            </form>}
        </section>
      </div>

      <div>
        {venter.length > 0 && <section className="phn-seksjon" aria-labelledby="del-venter">
          <div className="phn-sek-topp"><h2 id="del-venter">Venter på treneren</h2></div>
          {venter.map(tilgang)}
        </section>}
        <section className="phn-seksjon" aria-labelledby="del-tilgang">
          <div className="phn-sek-topp"><h2 id="del-tilgang">Har tilgang</h2></div>
          {aktive.length ? aktive.map(tilgang) : <div className="phn-kort dempet"><p className="phn-forklar">Du har ingen navngitte delinger ennå.</p></div>}
        </section>
        {(tidligere.length > 0 || oversikt.nesteSide) && <section className="phn-seksjon" aria-labelledby="del-tidligere">
          <div className="phn-sek-topp"><h2 id="del-tidligere">Tidligere</h2></div>
          {tidligere.map(tilgang)}
          {oversikt.nesteSide && <div className="phn-knapper"><button type="button" className="phn-knapp sek" disabled={pending} onClick={() => start(async () => {
            try { const mer = await hentNavngittDelingAction({ spillerId: oversikt.spiller.id, ...oversikt.nesteSide }); if (!mer) throw new Error(); setOversikt((o) => ({ ...mer, invitasjoner: [...o.invitasjoner, ...mer.invitasjoner] })); }
            catch { setFeil("Tidligere delinger kunne ikke hentes. Prøv igjen."); }
          })}>Vis tidligere delinger</button></div>}
        </section>}
        {erTrener && <Link className="lenke" href="/portal/meg/deling/innsyn">Spillere som deler med meg</Link>}
        <p className="phn-kilde">Navngitt trenerdeling er et eget samtykke. Tidligere deling med grupper er uendret.</p>
      </div>
    </div>

    <dialog ref={dialog} className="phn-ark dialog" role="alertdialog" aria-labelledby="trekk-tittel" onClose={() => setTrekker(null)}>
      <div className="phn-ark-kropp">
        <h2 id="trekk-tittel">Trekke tilgangen til {trekker?.epost ?? "treneren"}?</h2>
        <p className="phn-forklar">Alle delingslenker til denne treneren i {trekker?.gruppeNavn ?? "miljøet"} stenges, med en gang. Forslag treneren har sendt, blir liggende i innboksen din.</p>
        <div className="phn-knapper">
          <button type="button" className="phn-knapp rust stor" disabled={pending} onClick={() => { if (trekker) trekk(trekker.id); dialog.current?.close(); }}>Trekk tilgang</button>
          <button type="button" className="phn-knapp sek stor" onClick={() => dialog.current?.close()}>Avbryt</button>
        </div>
      </div>
    </dialog>
  </div></Flyt>
  </div>;
}

const Flyt = ({ skra, children }: { skra: boolean; children: ReactNode }) => skra ? <SkraFlyt lav>{children}</SkraFlyt> : <>{children}</>;
