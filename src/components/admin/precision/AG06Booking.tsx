"use client";

/**
 * AG-06 Booking, pakke 3 (bygget natt 17.10 etter
 * docs/design-system/utkast-agencyos/kalender.html, skjermene AG-06 Booking og
 * AG-06-NY). Faner: Bookinger · Ny booking · Tjenester og pris. En booking åpnes
 * på egen side (/admin/bookinger/[id], AG06Bookingen), der avlys, foreslå ny tid,
 * bekreft og avvis ligger (§COACH SOM AVLYSER GIR ALLTID FULL REFUSJON, 15.10).
 *
 * Ny booking går i fire steg: Spiller · Tjeneste · Tid · Bekreft, med
 * betalingsmåte Stripe · Klipp · Faktura · Gratis.
 *
 * Avvik mot utkastet:
 *   - Tid-steget har dato og klokkeslett, ikke ferdige ledige tider; serveren
 *     avviser en tid som kolliderer (kollisjonsvernet i opprettOktPaaTid).
 *   - Stripe lager en betalingslenke (kort og Apple Pay) som vises med kopier-knapp
 *     og sendes i bekreftelsen. Bookingen står «Ikke betalt» til betalt. Knappen heter «Bekreft booking» for alle betalingsmåter.
 *   - Testtime som tildeler testen automatisk finnes ikke i koden.
 *   - Tjenestelista er egen fane (med redigering, bookingplanen steg 2), ikke en
 *     seksjon under bookingene.
 *
 * Bookinglista (bookingplanen steg 4): søk på navn, e-post og telefon, og filter
 * på coach, tjeneste, sted og periode. Filtrene gjelder alle gruppene.
 *
 * Fanen «Tjenester og pris» (bookingplanen steg 2, 15.10.2026): opprett, endre,
 * slå av og på, og slett tjenester, med sted, coach, kategori, buffer, minste
 * varsel og maks dager fram. Den gamle siden /admin/services sender hit.
 */
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Avatar, Knapp, Pille, Tom, Topp, Varsel, type PilleTone } from "@/components/admin/agencyos-ny/ny";
import { BetalingsLenke } from "./BetalingsLenke";
import { bookIKalender, type BookingValg } from "@/app/admin/kalender/booking-actions";
import type { AG06Booking, AG06Tjeneste, AG06TjenesteValg } from "@/app/admin/bookinger/data";
import { opprettTjeneste, oppdaterTjeneste, settTjenesteAktiv, slettTjeneste, type TjenesteInput } from "@/app/admin/bookinger/tjeneste-actions";
import { TJENESTE_KATEGORIER, kategoriNavn } from "@/lib/booking/tjeneste-kategori";
import { ROMTYPER, romtypeNavn } from "@/lib/booking/rom-typer";
import "@/styles/agencyos-ny-kalender.css";

export const STATUS_TONE: Record<AG06Booking["st"], PilleTone> = { Venter: "vent", Bekreftet: "ok", Avlyst: "noy", Gjennomført: "noy" };

function kr(ore: number): string {
  return (ore / 100).toLocaleString("nb-NO", { maximumFractionDigits: 0 }) + " kr";
}

export type AG06Props = {
  navn: string;
  bookinger: AG06Booking[];
  valg: BookingValg;
  tjenester: AG06Tjeneste[];
  tjenesteValg: AG06TjenesteValg;
  fane?: "bookinger" | "ny" | "tj";
  /** Klokka «nå» i ms, satt av serveren så Kommende/Tidligere ikke flakker. */
  naaMs?: number;
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

type Gruppe = "venter" | "kommende" | "tidligere" | "avlyst";

export function grupperBookinger(bookinger: readonly AG06Booking[], naaMs: number): Record<Gruppe, AG06Booking[]> {
  const ut: Record<Gruppe, AG06Booking[]> = { venter: [], kommende: [], tidligere: [], avlyst: [] };
  for (const b of bookinger) {
    if (b.st === "Avlyst") ut.avlyst.push(b);
    else if (b.st === "Venter") ut.venter.push(b);
    else if (b.st === "Bekreftet" && b.startMs >= naaMs) ut.kommende.push(b);
    else ut.tidligere.push(b);
  }
  ut.kommende.sort((a, b) => a.startMs - b.startMs);
  ut.venter.sort((a, b) => a.startMs - b.startMs);
  return ut;
}

export function BookingRad({ b }: { b: AG06Booking }) {
  return <Link href={`/admin/bookinger/${b.id}`} className="bk-rad">
    <span className="d"><b>{b.dag}</b><span>{b.ukedag}</span></span>
    <span><b className="n">{b.who} · {b.svcNavn}</b>
      <span className="kilde">{b.t}–{b.slutt} · {b.where} · {b.coach ?? "—"} · {b.pay === "Klipp" ? "1 klipp" : b.pay === "Betalt" ? "betalt" : b.pay.toLowerCase()}</span></span>
    <Pille tone={STATUS_TONE[b.st]}>{b.st === "Venter" ? "Venter på deg" : b.st}</Pille>
  </Link>;
}

type Filter = { sok: string; coach: string; tjeneste: string; sted: string; fra: string; til: string };
const TOMT_FILTER: Filter = { sok: "", coach: "", tjeneste: "", sted: "", fra: "", til: "" };

export function filtrerBookinger(bookinger: readonly AG06Booking[], f: Filter): AG06Booking[] {
  const sok = f.sok.trim().toLowerCase();
  return bookinger.filter((b) =>
    (!sok || `${b.who} ${b.guardian ?? ""} ${b.kontaktSok}`.toLowerCase().includes(sok)) &&
    (!f.coach || (b.coach ?? "") === f.coach) &&
    (!f.tjeneste || b.svcNavn === f.tjeneste) &&
    (!f.sted || b.where === f.sted) &&
    (!f.fra || b.datoIso >= f.fra) &&
    (!f.til || b.datoIso <= f.til));
}

const unike = (verdier: Array<string | null>) => [...new Set(verdier.filter((v): v is string => !!v && v !== "—"))].sort((a, b) => a.localeCompare(b, "nb"));

export function AG06Booking({ navn, bookinger, valg, tjenester, tjenesteValg, fane: initialFane, naaMs }: AG06Props) {
  const [fane, setFane] = useState(initialFane ?? "bookinger");
  const [melding, setMelding] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>(TOMT_FILTER);
  const naa = naaMs ?? 0;
  const filtrert = useMemo(() => filtrerBookinger(bookinger, filter), [bookinger, filter]);
  const grupper = useMemo(() => grupperBookinger(filtrert, naa), [filtrert, naa]);
  const valgListe = useMemo(() => ({
    coacher: unike(bookinger.map((b) => b.coach)),
    tjenester: unike(bookinger.map((b) => b.svcNavn)),
    steder: unike(bookinger.map((b) => b.where)),
  }), [bookinger]);
  const [visFilter, setVisFilter] = useState(false);
  const harFilter = Object.values(filter).some((v) => v !== "");
  const antallFilter = (["coach", "tjeneste", "sted", "fra", "til"] as const).filter((k) => filter[k] !== "").length;
  const settF = (k: keyof Filter, v: string) => setFilter((f) => ({ ...f, [k]: v }));
  const [gruppe, setGruppe] = useState<Gruppe>(grupper.venter.length > 0 ? "venter" : "kommende");
  const uke = naa + 7 * 86_400_000;
  const denneUka = grupper.kommende.filter((b) => b.startMs < uke).length;

  const GRUPPER: Array<{ id: Gruppe; navn: string }> = [
    ...(grupper.venter.length > 0 ? [{ id: "venter" as const, navn: "Venter på deg" }] : []),
    { id: "kommende", navn: "Kommende" },
    { id: "tidligere", navn: "Tidligere" },
    { id: "avlyst", navn: "Avlyst" },
  ];
  const rader = grupper[gruppe];

  let body: React.ReactNode;
  if (fane === "bookinger") {
    body = <>
      <div className="hoved"><strong>{denneUka}</strong><span className="forklar">kommende bookinger de neste sju dagene</span></div>
      <div className="bk-filter" role="search" aria-label="Søk og filter">
        <label className="felt"><span className="etikett">Søk</span><input type="search" value={filter.sok} onChange={(e) => settF("sok", e.target.value)} placeholder="Navn, e-post eller telefon" autoComplete="off" /></label>
        <div className="knapper"><Knapp variant="sek" aria-expanded={visFilter} onClick={() => setVisFilter((v) => !v)}>{antallFilter > 0 ? `Filter (${antallFilter})` : "Filter"}</Knapp>
          {harFilter && <Knapp variant="spok" onClick={() => setFilter(TOMT_FILTER)}>Nullstill</Knapp>}</div>
        {visFilter && <div className="bk-filter-felt">
          <label className="felt"><span className="etikett">Coach</span><select value={filter.coach} onChange={(e) => settF("coach", e.target.value)}><option value="">Alle</option>{valgListe.coacher.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="felt"><span className="etikett">Tjeneste</span><select value={filter.tjeneste} onChange={(e) => settF("tjeneste", e.target.value)}><option value="">Alle</option>{valgListe.tjenester.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="felt"><span className="etikett">Sted</span><select value={filter.sted} onChange={(e) => settF("sted", e.target.value)}><option value="">Alle</option>{valgListe.steder.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="felt"><span className="etikett">Fra dato</span><input type="date" value={filter.fra} onChange={(e) => settF("fra", e.target.value)} /></label>
          <label className="felt"><span className="etikett">Til dato</span><input type="date" value={filter.til} onChange={(e) => settF("til", e.target.value)} /></label>
        </div>}
      </div>
      <div className="chips" role="group" aria-label="Vis">
        {GRUPPER.map((g) => <button key={g.id} type="button" aria-pressed={gruppe === g.id} onClick={() => setGruppe(g.id)}>
          {g.navn} <b>{grupper[g.id].length}</b></button>)}
      </div>
      {rader.length === 0
        ? harFilter
          ? <Tom tittel="Ingen treff" tekst="Ingen bookinger i denne gruppen passer søket og filtrene." handling={<Knapp variant="sek" onClick={() => setFilter(TOMT_FILTER)}>Nullstill filter</Knapp>} />
          : <Tom tittel="Ingen bookinger her" tekst="Bookinger fra spillere, flexkunder og deg selv kommer hit." handling={<Knapp onClick={() => setFane("ny")}>Ny booking</Knapp>} />
        : <div className="bk-liste">{rader.map((b) => <BookingRad key={b.id} b={b} />)}</div>}
    </>;
  } else if (fane === "ny") {
    body = <NyBooking valg={valg} onOpprettet={() => { setMelding("Booket og bekreftet. Spilleren har fått beskjed."); setFane("bookinger"); setGruppe("kommende"); }} />;
  } else {
    body = <TjenestePanel tjenester={tjenester} valg={tjenesteValg} />;
  }

  const FANER = [
    { verdi: "bookinger", navn: "Bookinger" },
    { verdi: "ny", navn: "Ny booking" },
    { verdi: "tj", navn: "Tjenester og pris" },
  ] as const;

  return (
    <AgencyOSSkall navn={navn}>
      <div className="agn-s">
        <Topp dato="Drift · Booking" tittel="Booking"
          ingress="Betalte bookinger bekreftes automatisk når tiden er ledig. Du bekrefter eller avviser bare bookinger uten betaling."
          handlinger={fane !== "ny" ? <Knapp onClick={() => { setFane("ny"); setMelding(null); }}>Ny booking</Knapp> : undefined} />
        <div className="valg" role="group" aria-label="Booking">
          {FANER.map((f) => <button key={f.verdi} type="button" aria-pressed={fane === f.verdi} onClick={() => { setFane(f.verdi); setMelding(null); }}>{f.navn}</button>)}
        </div>
        {melding && <Varsel tone="ok">{melding}</Varsel>}
        {body}
      </div>
    </AgencyOSSkall>
  );
}

type Betaling = "STRIPE" | "KLIPP" | "FAKTURA" | "GRATIS";
const BETALING: Array<{ id: Betaling; navn: string; tekst: string }> = [
  { id: "STRIPE", navn: "Stripe", tekst: "Tjenestens pris, betales med kort" },
  { id: "KLIPP", navn: "Klipp", tekst: "Ett klipp fra Performance-pakken" },
  { id: "FAKTURA", navn: "Faktura", tekst: "Merkes, fakturaen lages i Tripletex" },
  { id: "GRATIS", navn: "Gratis", tekst: "Ingen betaling" },
];
const STEG = ["Spiller", "Tjeneste", "Tid", "Bekreft"] as const;

/** AG-06-NY: spiller → tjeneste → tid → bekreft. */
export function NyBooking({ valg, onOpprettet }: { valg: BookingValg; onOpprettet: () => void }) {
  const router = useRouter();
  const [steg, setSteg] = useState(0);
  const [sok, setSok] = useState("");
  const [spillerId, setSpillerId] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState("");
  const [locationId, setLocationId] = useState(valg.steder[0]?.id ?? "");
  const [dato, setDato] = useState("");
  const [tid, setTid] = useState("16:00");
  const [betaling, setBetaling] = useState<Betaling>("STRIPE");
  const [notater, setNotater] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [lenke, setLenke] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const spiller = valg.spillere.find((s) => s.id === spillerId);
  const tjeneste = valg.tjenester.find((t) => t.id === serviceTypeId);
  const sted = valg.steder.find((s) => s.id === locationId);
  const treff = valg.spillere.filter((s) => s.navn.toLowerCase().includes(sok.trim().toLowerCase())).slice(0, 8);
  const kanVidere = steg === 0 ? !!spiller : steg === 1 ? !!tjeneste : steg === 2 ? /^\d{4}-\d{2}-\d{2}$/.test(dato) && /^\d{2}:\d{2}$/.test(tid) && !!locationId : true;

  const opprett = () => {
    if (!spiller || !tjeneste || !locationId) return;
    start(async () => {
      const res = await bookIKalender({ spillerId: spiller.id, serviceTypeId: tjeneste.id, locationId, start: `${dato}T${tid}`, notater: notater.trim() || undefined, betaling });
      if (!res.ok) { setFeil(res.feil); return; }
      router.refresh();
      // Stripe: vis lenken så coachen kan kopiere den. Kunden har også fått den på e-post.
      if (res.betalingsUrl) { setFeil(null); setLenke(res.betalingsUrl); return; }
      if (res.betalingsFeil) { setFeil(`Bookingen er lagret, men betalingslenken kunne ikke lages: ${res.betalingsFeil} Lag den fra bookingen.`); return; }
      setFeil(null);
      onOpprettet();
    });
  };

  const datoTekst = dato ? new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${dato}T12:00:00Z`)) : "—";

  if (lenke) return <div className="smal-innhold">
    <Varsel tone="ok">Bookingen er bekreftet. Kunden har fått bekreftelse og betalingslenke på e-post.</Varsel>
    <BetalingsLenke url={lenke} />
    <p className="kildetekst">Bookingen står som «Ikke betalt» til kunden har betalt med kort eller Apple Pay.</p>
    <div className="knapper"><Knapp onClick={onOpprettet}>Ferdig</Knapp></div>
  </div>;

  return <div className="smal-innhold">
    <div className="steg-liste" aria-label="Steg">{STEG.map((s, i) => <span key={s} className={i < steg ? "ferdig" : i === steg ? "aktiv" : ""} aria-current={i === steg ? "step" : undefined}>{s}</span>)}</div>
    {steg === 0 && <>
      <label className="felt"><span className="etikett">Søk spiller</span><input type="search" value={sok} onChange={(e) => setSok(e.target.value)} placeholder="Navn" autoComplete="off" /></label>
      {treff.length === 0 ? <Tom tittel="Ingen spillere" tekst="Ingen spillere du kan booke for passer søket." /> : <div className="valgliste">
        {treff.map((s) => <button key={s.id} type="button" aria-pressed={s.id === spillerId} onClick={() => setSpillerId(s.id)}>
          <Avatar navn={s.navn} liten lys /><span><b>{s.navn}</b></span><span /></button>)}
      </div>}
    </>}
    {steg === 1 && <>
      {valg.tjenester.length === 0 ? <Tom tittel="Ingen aktive tjenester" tekst="Opprett en tjeneste under Tjenester og pris." /> : <div className="valgliste">
        {valg.tjenester.map((t) => <button key={t.id} type="button" aria-pressed={t.id === serviceTypeId} onClick={() => setServiceTypeId(t.id)}>
          <span className="akse-prikk" style={{ background: "var(--graphite-900)" }} aria-hidden /><span><b>{t.navn}</b><span className="kilde">{t.varighetMin} min · maks {t.maxDeltakere}</span></span><span className="pris">{kr(t.prisOre)}</span></button>)}
      </div>}
      <p className="kildetekst">Fra tjenestelista. Pris og varighet leses fra tjenesten.</p>
    </>}
    {steg === 2 && <>
      <div className="to-felt">
        <label className="felt"><span className="etikett">Dato</span><input type="date" value={dato} onChange={(e) => setDato(e.target.value)} /></label>
        <label className="felt"><span className="etikett">Tid</span><input type="time" value={tid} onChange={(e) => setTid(e.target.value)} /></label>
      </div>
      <label className="felt"><span className="etikett">Sted</span><select value={locationId} onChange={(e) => setLocationId(e.target.value)}>{valg.steder.map((s) => <option key={s.id} value={s.id}>{s.navn}</option>)}</select></label>
      <p className="kildetekst">Kolliderer tiden med en annen booking, sier systemet fra før noe lagres.</p>
    </>}
    {steg === 3 && <>
      <div role="group" aria-label="Betaling" className="valgliste">
        {BETALING.map((b) => <button key={b.id} type="button" aria-pressed={betaling === b.id} onClick={() => setBetaling(b.id)}>
          <span className="akse-prikk" style={{ background: "var(--graphite-900)" }} aria-hidden /><span><b>{b.navn}</b><span className="kilde">{b.tekst}</span></span><span className="pris">{tjeneste ? (b.id === "KLIPP" || b.id === "GRATIS" ? kr(0) : kr(tjeneste.prisOre)) : "—"}</span></button>)}
      </div>
      <ul className="oppsummering">
        <li><span>Spiller</span><b>{spiller?.navn ?? "—"}</b></li>
        <li><span>Tjeneste</span><b>{tjeneste ? `${tjeneste.navn} · ${tjeneste.varighetMin} min` : "—"}</b></li>
        <li><span>Tid</span><b>{datoTekst} kl. {tid}</b></li>
        <li><span>Sted</span><b>{sted?.navn ?? "—"}</b></li>
        <li><span>Betaling</span><b>{BETALING.find((b) => b.id === betaling)?.navn}</b></li>
      </ul>
      <label className="felt"><span className="etikett">Notat (valgfritt)</span><textarea rows={2} value={notater} onChange={(e) => setNotater(e.target.value)} /></label>
      <p className="kildetekst">Bekreftes med en gang. Spilleren får beskjed.{betaling === "STRIPE" ? " Kunden får en betalingslenke (kort og Apple Pay) på e-post, og du får lenken her." : ""}</p>
    </>}
    {feil && <Varsel tone="advarsel">{feil}</Varsel>}
    <div className="knapper">
      {steg > 0 && <Knapp variant="sek" onClick={() => { setSteg(steg - 1); setFeil(null); }}>Tilbake</Knapp>}
      {steg < 3
        ? <Knapp disabled={!kanVidere} onClick={() => setSteg(steg + 1)}>Neste</Knapp>
        : <Knapp disabled={pending} onClick={opprett}>{pending ? "Booker …" : "Bekreft booking"}</Knapp>}
    </div>
  </div>;
}

const NY_TJENESTE: TjenesteInput = {
  name: "", description: "", priceOre: 0, durationMin: 50, maxDeltakere: 1, coachUserId: null, locationId: null,
  kategori: "drop-in", facilityType: null, bufferForMin: 0, bufferEtterMin: 0, minVarselTimer: 24, maksDagerFram: 7, active: true,
};

function tilInput(t: AG06Tjeneste): TjenesteInput {
  return {
    name: t.navn, description: t.beskrivelse ?? "", priceOre: t.prisOre, durationMin: t.varighetMin, maxDeltakere: t.maxDeltakere,
    coachUserId: t.coachUserId, locationId: t.locationId, kategori: t.kategori, facilityType: t.facilityType as TjenesteInput["facilityType"], bufferForMin: t.bufferForMin,
    bufferEtterMin: t.bufferEtterMin, minVarselTimer: t.minVarselTimer, maksDagerFram: t.maksDagerFram, active: t.aktiv,
  };
}

type TjenesteSvar = { ok: true; id: string } | { ok: false; feil: string };

function TjenestePanel({ tjenester, valg }: { tjenester: AG06Tjeneste[]; valg: AG06TjenesteValg }) {
  const [redigerer, setRedigerer] = useState<AG06Tjeneste | "ny" | null>(null);
  const [slett, setSlett] = useState<AG06Tjeneste | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const aktive = tjenester.filter((t) => t.aktiv);
  const avslatte = tjenester.filter((t) => !t.aktiv);

  const kjor = (fn: () => Promise<TjenesteSvar>, etter?: () => void) => {
    start(async () => {
      try {
        const res = await fn();
        if (!res.ok) { setFeil(res.feil); return; }
        setFeil(null);
        etter?.();
        router.refresh();
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Endringen kunne ikke lagres.");
      }
    });
  };

  const rad = (t: AG06Tjeneste) => <button key={t.id} type="button" className="bk-rad" onClick={() => { setRedigerer(t); setFeil(null); }}>
    <span className="ikonboks" aria-hidden>{t.varighetMin}</span>
    <span><b>{t.navn}</b><span className="kilde">
      {t.varighetMin} min · maks {t.maxDeltakere} {t.maxDeltakere === 1 ? "deltaker" : "deltakere"} · {t.coachNavn ?? "Felles"} · {t.stedNavn ?? "Sted ikke satt"} · {kategoriNavn(t.kategori)}{t.facilityType ? ` · ${romtypeNavn(t.facilityType)}` : ""}
    </span></span>
    <b className="mono">{kr(t.prisOre)}</b>
  </button>;

  return <div className="seksjon">
    {feil && !redigerer && <Varsel tone="advarsel">{feil}</Varsel>}
    <div className="knapper"><Knapp onClick={() => { setRedigerer("ny"); setFeil(null); }}>Ny tjeneste</Knapp></div>
    {aktive.length === 0 ? <Tom tittel="Ingen aktive tjenester" tekst="Opprett en tjeneste for å kunne ta imot bookinger." /> : <div className="liste" role="list">{aktive.map(rad)}</div>}
    {avslatte.length > 0 && <>
      <b className="undertittel">Avslått ({avslatte.length})</b>
      <div className="liste" role="list">{avslatte.map(rad)}</div>
    </>}
    <p className="kilde">Pris, varighet, sted og bookingregler leses fra tjenesten. Buffer, minste varsel og maks dager fram styrer hvilke tider kundene får tilbudt.</p>

    {redigerer && <TjenesteArk
      key={redigerer === "ny" ? "ny" : redigerer.id}
      tjeneste={redigerer === "ny" ? null : redigerer}
      valg={valg}
      feil={feil}
      pending={pending}
      onClose={() => { setRedigerer(null); setFeil(null); }}
      onLagre={(input) => kjor(
        () => redigerer === "ny" ? opprettTjeneste(input) : oppdaterTjeneste(redigerer.id, input),
        () => setRedigerer(null),
      )}
      onAktiv={(t, aktiv) => kjor(() => settTjenesteAktiv(t.id, aktiv), () => setRedigerer(null))}
      onSlett={(t) => setSlett(t)}
    />}

    {slett && <div className="dialog-lag"><div role="dialog" aria-modal="true" aria-label="Slette tjenesten?" className="dialog">
      <h2>Slette tjenesten?</h2>
      <p className="forklar">{slett.navn} fjernes for godt fra tjenestelisten. Ingen bookinger peker på den.</p>
      <div className="knapper">
        <Knapp variant="rust" disabled={pending} onClick={() => kjor(() => slettTjeneste(slett.id), () => { setSlett(null); setRedigerer(null); })}>Slett</Knapp>
        <Knapp variant="spok" onClick={() => setSlett(null)}>Avbryt</Knapp>
      </div>
    </div></div>}
  </div>;
}

/** Tallfelt: tom streng blir 0, så feltet kan tømmes mens man skriver. Komma godtas. */
function tall(v: string): number {
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function TjenesteArk({ tjeneste, valg, feil, pending, onClose, onLagre, onAktiv, onSlett }: {
  tjeneste: AG06Tjeneste | null;
  valg: AG06TjenesteValg;
  feil: string | null;
  pending: boolean;
  onClose: () => void;
  onLagre: (input: TjenesteInput) => void;
  onAktiv: (t: AG06Tjeneste, aktiv: boolean) => void;
  onSlett: (t: AG06Tjeneste) => void;
}) {
  const [f, setF] = useState<TjenesteInput>(tjeneste ? tilInput(tjeneste) : NY_TJENESTE);
  const [prisKr, setPrisKr] = useState(String(f.priceOre / 100));
  const sett = <K extends keyof TjenesteInput>(k: K, v: TjenesteInput[K]) => setF((x) => ({ ...x, [k]: v }));
  const navnFeil = f.name.trim().length > 0 && f.name.trim().length < 2;

  const lagre = () => onLagre({ ...f, priceOre: Math.round(tall(prisKr) * 100) });

  return <Ark dato={tjeneste ? "Tjeneste" : "Ny tjeneste"} tittel={tjeneste ? tjeneste.navn : "Ny tjeneste"} onClose={onClose}
    knapper={<>
      <Knapp stor disabled={pending || f.name.trim().length < 2} onClick={lagre}>{pending ? "Lagrer …" : tjeneste ? "Lagre" : "Opprett tjeneste"}</Knapp>
      {tjeneste && (tjeneste.aktiv
        ? <Knapp variant="rust" stor disabled={pending} onClick={() => onAktiv(tjeneste, false)}>Slå av</Knapp>
        : <Knapp variant="sek" stor disabled={pending} onClick={() => onAktiv(tjeneste, true)}>Slå på</Knapp>)}
      {tjeneste && tjeneste.antallBookinger === 0 && <Knapp variant="rust" stor disabled={pending} onClick={() => onSlett(tjeneste)}>Slett</Knapp>}
      <Knapp variant="spok" stor onClick={onClose}>Avbryt</Knapp>
    </>}>
    {feil && <Varsel tone="advarsel">{feil}</Varsel>}
    <label className="felt"><span className="etikett">Navn</span>
      <input value={f.name} onChange={(e) => sett("name", e.target.value)} placeholder="Flex 50 min" autoComplete="off" />
      {navnFeil && <span className="feiltekst">Navnet må ha minst 2 tegn.</span>}</label>
    <label className="felt"><span className="etikett">Beskrivelse (valgfritt)</span>
      <textarea rows={2} value={f.description ?? ""} onChange={(e) => sett("description", e.target.value)} /></label>
    <div className="to-felt">
      <label className="felt"><span className="etikett">Varighet (min)</span>
        <input type="number" inputMode="numeric" min={5} max={600} step={5} value={f.durationMin} onChange={(e) => sett("durationMin", tall(e.target.value))} /></label>
      <label className="felt"><span className="etikett">Pris (kr)</span>
        <input type="text" inputMode="decimal" value={prisKr} onChange={(e) => setPrisKr(e.target.value)} />
        <span className="hjelp">{kr(Math.round(tall(prisKr) * 100))} · lagres som {Math.round(tall(prisKr) * 100).toLocaleString("nb-NO")} øre</span></label>
    </div>
    <label className="felt"><span className="etikett">Coach</span>
      <select value={f.coachUserId ?? ""} onChange={(e) => sett("coachUserId", e.target.value || null)}>
        <option value="">Felles (alle coacher)</option>
        {valg.coacher.map((c) => <option key={c.id} value={c.id}>{c.navn}</option>)}
      </select></label>
    <label className="felt"><span className="etikett">Sted</span>
      <select value={f.locationId ?? ""} onChange={(e) => sett("locationId", e.target.value || null)}>
        <option value="">Ikke satt (gjettes fra navnet)</option>
        {valg.steder.map((s) => <option key={s.id} value={s.id}>{s.navn}</option>)}
      </select></label>
    <label className="felt"><span className="etikett">Krever rom</span>
      <select value={f.facilityType ?? ""} onChange={(e) => sett("facilityType", (e.target.value || null) as TjenesteInput["facilityType"])}>
        <option value="">Ingen bestemt romtype</option>
        {ROMTYPER.map((r) => <option key={r.verdi} value={r.verdi}>{r.navn}</option>)}
      </select></label>
    <div className="to-felt">
      <label className="felt"><span className="etikett">Maks deltakere</span>
        <input type="number" inputMode="numeric" min={1} max={20} value={f.maxDeltakere} onChange={(e) => sett("maxDeltakere", tall(e.target.value))} /></label>
      <label className="felt"><span className="etikett">Kategori</span>
        <select value={f.kategori ?? ""} onChange={(e) => sett("kategori", e.target.value || null)}>
          <option value="">Ikke satt</option>
          {TJENESTE_KATEGORIER.map((k) => <option key={k.verdi} value={k.verdi}>{k.navn}</option>)}
        </select></label>
    </div>
    <div className="to-felt">
      <label className="felt"><span className="etikett">Buffer før (min)</span>
        <input type="number" inputMode="numeric" min={0} max={240} step={5} value={f.bufferForMin} onChange={(e) => sett("bufferForMin", tall(e.target.value))} /></label>
      <label className="felt"><span className="etikett">Buffer etter (min)</span>
        <input type="number" inputMode="numeric" min={0} max={240} step={5} value={f.bufferEtterMin} onChange={(e) => sett("bufferEtterMin", tall(e.target.value))} /></label>
    </div>
    <div className="to-felt">
      <label className="felt"><span className="etikett">Minste varsel (timer)</span>
        <input type="number" inputMode="numeric" min={0} max={720} value={f.minVarselTimer} onChange={(e) => sett("minVarselTimer", tall(e.target.value))} /></label>
      <label className="felt"><span className="etikett">Maks dager fram</span>
        <input type="number" inputMode="numeric" min={1} max={365} value={f.maksDagerFram} onChange={(e) => sett("maksDagerFram", tall(e.target.value))} /></label>
    </div>
    <label className="felt avkryss"><input type="checkbox" checked={f.active} onChange={(e) => sett("active", e.target.checked)} /><span className="etikett">Aktiv (kan bookes)</span></label>
    {tjeneste && <p className="kilde">Adresse: /booking/{tjeneste.slug} · {tjeneste.antallBookinger} {tjeneste.antallBookinger === 1 ? "booking" : "bookinger"}{tjeneste.antallBookinger > 0 ? " · kan ikke slettes, bare slås av" : ""}</p>}
  </Ark>;
}
