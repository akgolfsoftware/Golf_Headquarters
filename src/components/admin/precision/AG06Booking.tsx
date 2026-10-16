"use client";

/**
 * AG-06 Booking i nytt design (designbrevet 13.10.2026). Fasit:
 * docs/design-system/utkast-agencyos/kalender.html, skjermene AG-06 Booking,
 * AG-06-NY og «Bookingen». Faner: Uten betaling · Bookinger · Ny booking ·
 * Tjenester og pris. Detaljen åpnes som ark på mobil og dialog på PC.
 *
 * Avlys, Foreslå ny tid og avvisning med utkast i Innboks følger
 * beslutninger.md §COACH SOM AVLYSER GIR ALLTID FULL REFUSJON (15.10.2026):
 * avlysning gir alltid hele beløpet eller klippet tilbake, og en ny tid
 * gjelder først når spilleren har godtatt den i PlayerHQ.
 *
 * Avvik fra tegningen (se PR/rapport):
 * - Tjenester har ikke et «trekker klipp»-felt i ServiceType; det er derfor
 *   ikke tegnet inn i tjeneste-arket (ingen data å vise).
 * - «Timepris»-fallback i tegningen er demodata; pris er alltid ServiceType.priceOre.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Avatar, Knapp, KnappLenke, Nokkelverdier, Pille, Tom, Topp, Varsel, type PilleTone } from "@/components/admin/agencyos-ny/ny";
import { bekreftBooking } from "@/app/admin/(legacy)/bookinger/actions";
import { avlysBookingSomCoach, avvisBookingMedBegrunnelse } from "@/app/admin/bookinger/actions";
import { foreslaaNyBookingtid, trekkTilbakeForslag } from "@/app/admin/kalender/flytt-actions";
import { bookIKalender, type BookingValg } from "@/app/admin/kalender/booking-actions";
import type { AG06Booking } from "@/app/admin/bookinger/data";
import "@/styles/agencyos-ny-kalender.css";

const TONE: Record<AG06Booking["st"], PilleTone> = { Venter: "vent", Bekreftet: "ok", Avvist: "noy" };

function kr(ore: number): string {
  return (ore / 100).toLocaleString("nb-NO", { maximumFractionDigits: 0 }) + " kr";
}

export type AG06Props = {
  navn: string;
  bookinger: AG06Booking[];
  valg: BookingValg;
  fane?: "foresp" | "alle" | "ny" | "tj";
};

function Ark({ tittel, dato, onClose, children, knapper }: { tittel: string; dato?: string; onClose: () => void; children: React.ReactNode; knapper?: React.ReactNode }) {
  return <div className="ark-lag" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-label={tittel} className="ark">
      <div className="ark-topp"><div>{dato && <div className="dato">{dato}</div>}<h2>{tittel}</h2></div>
        <button type="button" className="lukk" aria-label="Lukk" onClick={onClose}><X className="ikon" aria-hidden /></button></div>
      {children}
      {knapper && <div className="knapper">{knapper}</div>}
    </div>
  </div>;
}

export function AG06Booking({ navn, bookinger, valg, fane: initialFane }: AG06Props) {
  const [fane, setFane] = useState(initialFane ?? "foresp");
  const [sel, setSel] = useState<string | null>(null);
  const [rej, setRej] = useState<AG06Booking | null>(null);
  const [avl, setAvl] = useState<AG06Booking | null>(null);
  const [fly, setFly] = useState<AG06Booking | null>(null);
  const [nyDato, setNyDato] = useState("");
  const [nyTid, setNyTid] = useState("");
  const [why, setWhy] = useState("");
  const [melding, setMelding] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const pend = bookinger.filter((b) => b.st === "Venter");
  const rows = fane === "foresp" ? pend : bookinger;
  const cur = bookinger.find((b) => b.id === sel) ?? null;

  const kjor = (fn: (id: string) => Promise<void>) => {
    if (!sel) return;
    start(async () => {
      try { await fn(sel); setFeil(null); setSel(null); router.refresh(); }
      catch (e) { setFeil(e instanceof Error ? e.message : "Bookingen kunne ikke bekreftes."); }
    });
  };
  const ferdig = (tekst: string) => { setFeil(null); setMelding(tekst); setRej(null); setAvl(null); setFly(null); setWhy(""); setSel(null); router.refresh(); };
  const doReject = () => {
    if (!rej) return;
    start(async () => {
      const res = await avvisBookingMedBegrunnelse({ bookingId: rej.id, begrunnelse: why });
      if (!res.ok) { setFeil(res.feil); setRej(null); return; }
      ferdig(res.utkast ? "Bookingen er avvist. Svaret ligger som utkast i Innboks." : "Bookingen er avvist. Kunden har ingen e-post, så det ble ikke laget noe utkast.");
    });
  };
  const doAvlys = () => {
    if (!avl) return;
    start(async () => {
      const res = await avlysBookingSomCoach({ bookingId: avl.id, begrunnelse: why.trim() || undefined });
      if (!res.ok) { setFeil(res.feil); setAvl(null); return; }
      ferdig(res.refusjonVenter ? "Timen er avlyst. Refusjonen venter hos Stripe og følges opp."
        : res.refundert ? "Timen er avlyst og hele beløpet er refundert."
        : res.klippTilbake ? "Timen er avlyst og klippet er ført tilbake." : "Timen er avlyst.");
    });
  };
  const doForslag = () => {
    if (!fly) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nyDato) || !/^\d{2}:\d{2}$/.test(nyTid)) { setFeil("Velg dato og tid."); return; }
    start(async () => {
      const res = await foreslaaNyBookingtid({ bookingId: fly.id, dato: nyDato, tid: nyTid });
      if (!res.ok) { setFeil(res.feil); return; }
      ferdig("Forslaget er sendt. Timen står på den gamle tiden til spilleren har godtatt.");
    });
  };
  const doTrekk = (id: string) => {
    start(async () => {
      const res = await trekkTilbakeForslag(id);
      if (!res.ok) { setFeil(res.feil); return; }
      ferdig("Forslaget er trukket tilbake.");
    });
  };

  let body: React.ReactNode;
  if (fane === "foresp" || fane === "alle") {
    body = rows.length === 0
      ? <Tom tittel={fane === "foresp" ? "Ingen bookinger uten betaling venter" : "Ingen bookinger"} tekst="Spillere og foreldre booker fra PlayerHQ når du har satt tilgjengelighet." handling={<Knapp onClick={() => setFane("ny")}>Ny booking</Knapp>} />
      : <div className="liste">{rows.map((b) => <button key={b.id} type="button" className="bk-rad" aria-pressed={sel === b.id} onClick={() => setSel(b.id)}>
        <Avatar navn={b.who} liten lys />
        <span><b>{b.who} · {b.svcNavn}</b><span className="kilde">{b.date} {b.t} · {kr(b.priceOre)} · {b.pay} · {b.src ?? "—"}</span></span>
        <Pille tone={TONE[b.st]}>{b.st === "Venter" ? "Venter på deg" : b.st}</Pille>
      </button>)}</div>;
  } else if (fane === "ny") {
    body = <NyBookingSkjema valg={valg} onOpprettet={() => { setFane("alle"); router.refresh(); }} />;
  } else {
    body = <TjenestePanel tjenester={valg.tjenester} />;
  }

  const FANER = [
    { verdi: "foresp", navn: "Uten betaling", antall: pend.length },
    { verdi: "alle", navn: "Bookinger" },
    { verdi: "ny", navn: "Ny booking" },
    { verdi: "tj", navn: "Tjenester og pris" },
  ] as const;

  return (
    <AgencyOSSkall navn={navn}>
      <div className="agn-s">
        <Topp dato="Mer · Booking" tittel="Booking"
          ingress="Betalte bookinger (offentlig og PlayerHQ) bekreftes automatisk når tiden er ledig. Du bekrefter eller avviser bare bookinger uten betaling."
          handlinger={<Knapp variant="sek" onClick={() => { setFane("ny"); setSel(null); }}>Ny booking</Knapp>} />
        <div className="faner" role="group" aria-label="Booking">
          {FANER.map((f) => <button key={f.verdi} type="button" aria-pressed={fane === f.verdi} onClick={() => { setFane(f.verdi); setSel(null); }}>
            {f.navn}{"antall" in f && f.antall ? <span className="antall">{f.antall}</span> : null}</button>)}
        </div>
        {feil && <Varsel tone="advarsel">{feil}</Varsel>}
        {melding && !feil && <Varsel tone="ok">{melding}</Varsel>}
        {body}

        {cur && !rej && !avl && !fly && <Ark dato="Bookingen" tittel={`${cur.who} · ${cur.svcNavn}`} onClose={() => setSel(null)}
          knapper={cur.st === "Venter" ? <>
            <Knapp stor disabled={pending} onClick={() => kjor(bekreftBooking)}>Bekreft booking</Knapp>
            <Knapp variant="sek" stor disabled={pending} onClick={() => setRej(cur)}>Avvis</Knapp>
          </> : cur.st === "Bekreftet" ? <>
            <KnappLenke stor href={`/admin/bookinger/${cur.id}`}>Åpne booking</KnappLenke>
            {cur.kommende && cur.harKonto && (cur.forslag
              ? <Knapp variant="sek" stor disabled={pending} onClick={() => doTrekk(cur.id)}>Trekk tilbake forslaget</Knapp>
              : <Knapp variant="sek" stor onClick={() => { setFly(cur); setNyDato(""); setNyTid(cur.t); setFeil(null); }}>Foreslå ny tid</Knapp>)}
            {cur.kommende && <Knapp variant="sek" stor onClick={() => { setAvl(cur); setWhy(""); setFeil(null); }}>Avlys</Knapp>}
          </>
            : <Knapp variant="spok" stor onClick={() => setSel(null)}>Lukk</Knapp>}>
          <Nokkelverdier rader={[
            ["Kilde", cur.src ?? "—"],
            ["Tjeneste", `${cur.svcNavn} · ${cur.min} min`],
            ["Tid", `${cur.date} ${cur.t}`],
            ["Sted", cur.where ?? "—"],
            ["Pris", kr(cur.priceOre)],
            ["Betaling", cur.pay ?? "—"],
            ["Kontakt", cur.guardian ?? "—"],
            ["Beskjed", cur.note ?? "—"],
            ["Bestilt", cur.at ?? "—"],
            ...(cur.forslag ? [["Foreslått ny tid", `${cur.forslag} · venter på spilleren`] as [string, string]] : []),
          ]} />
        </Ark>}

        {rej && <div className="dialog-lag"><div role="dialog" aria-modal="true" aria-label="Avvise bookingen?" className="dialog">
          <h2>Avvise bookingen?</h2>
          <p className="forklar">{rej.who} · {rej.date} {rej.t}. Begrunnelsen blir et svarutkast i Innboks. Ingenting sendes før du sender det selv.</p>
          <label className="felt"><span className="etikett">Kort begrunnelse</span>
            <textarea rows={3} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Studio 1 er stengt for service tirsdag." />
            <span className={why && why.trim().length < 8 ? "feiltekst" : "hjelp"}>{why && why.trim().length < 8 ? "Skriv en kort begrunnelse på minst 8 tegn." : "Minst 8 tegn."}</span></label>
          <div className="knapper">
            <Knapp variant="rust" disabled={why.trim().length < 8 || pending} onClick={doReject}>Avvis</Knapp>
            <Knapp variant="spok" onClick={() => setRej(null)}>Avbryt</Knapp>
          </div>
        </div></div>}

        {avl && <div className="dialog-lag"><div role="dialog" aria-modal="true" aria-label="Avlyse timen?" className="dialog">
          <h2>Avlyse timen?</h2>
          <p className="forklar">{avl.who} · {avl.svcNavn} · {avl.date} {avl.t}. {avl.pay === "Betalt" ? "Kunden får hele beløpet tilbake." : avl.pay === "Klipp" ? "Klippet føres tilbake til pakken." : "Det er ingen betaling å føre tilbake."} Kunden får beskjed på e-post{avl.harKonto ? " og i PlayerHQ" : ""}.</p>
          <label className="felt"><span className="etikett">Begrunnelse (valgfritt, lagres i loggen)</span>
            <textarea rows={3} value={why} onChange={(e) => setWhy(e.target.value)} /></label>
          <div className="knapper">
            <Knapp variant="rust" disabled={pending} onClick={doAvlys}>{pending ? "Avlyser …" : "Avlys timen"}</Knapp>
            <Knapp variant="spok" onClick={() => setAvl(null)}>Avbryt</Knapp>
          </div>
        </div></div>}

        {fly && <div className="dialog-lag"><div role="dialog" aria-modal="true" aria-label="Foreslå ny tid" className="dialog">
          <h2>Foreslå ny tid</h2>
          <p className="forklar">{fly.who} · {fly.svcNavn} · nå {fly.date} {fly.t}. Timen står på den gamle tiden til spilleren godtar i PlayerHQ.</p>
          <div className="to-felt">
            <label className="felt"><span className="etikett">Dato</span><input type="date" value={nyDato} onChange={(e) => setNyDato(e.target.value)} /></label>
            <label className="felt"><span className="etikett">Tid</span><input type="time" value={nyTid} onChange={(e) => setNyTid(e.target.value)} /></label>
          </div>
          <div className="knapper">
            <Knapp disabled={pending || !nyDato || !nyTid} onClick={doForslag}>{pending ? "Sender …" : "Send forslaget"}</Knapp>
            <Knapp variant="spok" onClick={() => setFly(null)}>Avbryt</Knapp>
          </div>
        </div></div>}
      </div>
    </AgencyOSSkall>
  );
}

function NyBookingSkjema({ valg, onOpprettet }: { valg: BookingValg; onOpprettet: () => void }) {
  const [spillerId, setSpillerId] = useState(valg.spillere[0]?.id ?? "");
  const [serviceTypeId, setServiceTypeId] = useState(valg.tjenester[0]?.id ?? "");
  const [locationId, setLocationId] = useState(valg.steder[0]?.id ?? "");
  const [dato, setDato] = useState("");
  const [tid, setTid] = useState("16:00");
  const [notater, setNotater] = useState("");
  const [betaling, setBetaling] = useState<"" | "KLIPP" | "FAKTURA" | "GRATIS">("");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const tjeneste = valg.tjenester.find((t) => t.id === serviceTypeId);

  const opprett = () => {
    if (!spillerId || !serviceTypeId || !locationId || !dato) { setFeil("Fyll ut alle feltene."); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dato) || !/^\d{2}:\d{2}$/.test(tid)) { setFeil("Velg dato og tid."); return; }
    start(async () => {
      const res = await bookIKalender({ spillerId, serviceTypeId, locationId, start: `${dato}T${tid}`, notater: notater.trim() || undefined, betaling: betaling || undefined });
      if (!res.ok) { setFeil(res.feil); return; }
      setFeil(null);
      onOpprettet();
    });
  };

  return <div className="to-del">
    <div className="kort">
      <label className="felt"><span className="etikett">Spiller</span><select value={spillerId} onChange={(e) => setSpillerId(e.target.value)}>{valg.spillere.map((s) => <option key={s.id} value={s.id}>{s.navn}</option>)}</select></label>
      <label className="felt"><span className="etikett">Tjeneste</span><select value={serviceTypeId} onChange={(e) => setServiceTypeId(e.target.value)}>{valg.tjenester.map((t) => <option key={t.id} value={t.id}>{`${t.navn} · ${t.varighetMin} min · ${kr(t.prisOre)}`}</option>)}</select></label>
      <label className="felt"><span className="etikett">Sted</span><select value={locationId} onChange={(e) => setLocationId(e.target.value)}>{valg.steder.map((s) => <option key={s.id} value={s.id}>{s.navn}</option>)}</select></label>
      <div className="to-felt">
        <label className="felt"><span className="etikett">Dato</span><input type="date" value={dato} onChange={(e) => setDato(e.target.value)} /></label>
        <label className="felt"><span className="etikett">Tid</span><input type="time" value={tid} onChange={(e) => setTid(e.target.value)} /></label>
      </div>
      <label className="felt"><span className="etikett">Betaling</span><select value={betaling} onChange={(e) => setBetaling(e.target.value as typeof betaling)}>
        <option value="">Pris fra tjenesten</option>
        <option value="KLIPP">Klipp fra coaching-pakken</option>
        <option value="FAKTURA">Faktura (lages i Tripletex)</option>
        <option value="GRATIS">Gratis</option>
      </select></label>
      <label className="felt"><span className="etikett">Notat (valgfritt)</span><textarea rows={3} value={notater} onChange={(e) => setNotater(e.target.value)} /></label>
      {feil && <Varsel tone="advarsel">{feil}</Varsel>}
    </div>
    <div className="kort dempet">
      <b className="undertittel">Oppsummering</b>
      <Nokkelverdier rader={[
        ["Tjeneste", tjeneste ? `${tjeneste.navn} · ${tjeneste.varighetMin} min` : "—"],
        ["Tid", dato ? `${dato} ${tid}` : "—"],
        ["Pris", !tjeneste ? "—" : betaling === "KLIPP" || betaling === "GRATIS" ? kr(0) : kr(tjeneste.prisOre), betaling === "KLIPP" ? "ett klipp" : betaling === "GRATIS" ? "gratis" : betaling === "FAKTURA" ? "faktureres" : "fra tjenesten"],
      ]} />
      <Knapp stor disabled={pending} onClick={opprett}>{pending ? "Oppretter …" : "Opprett booking"}</Knapp>
    </div>
  </div>;
}

function TjenestePanel({ tjenester }: { tjenester: BookingValg["tjenester"] }) {
  return <div className="seksjon">
    {tjenester.length === 0 ? <Tom tittel="Ingen tjenester" /> : <div className="liste" role="list">
      {tjenester.map((t) => <div key={t.id} role="listitem"><span className="ikonboks" aria-hidden>{t.varighetMin}</span>
        <span><b>{t.navn}</b><span className="kilde">{t.varighetMin} min · maks {t.maxDeltakere} deltakere</span></span>
        <b className="mono">{kr(t.prisOre)}</b></div>)}
    </div>}
    <p className="kilde">Kilde: tjenestene i appen.</p>
    <div className="knapper"><KnappLenke href="/admin/services">Endre tjenester og pris</KnappLenke></div>
  </div>;
}
