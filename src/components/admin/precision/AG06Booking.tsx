"use client";

/**
 * AG-06 Booking i nytt design (designbrevet 13.10.2026). Fasit:
 * docs/design-system/utkast-agencyos/kalender.html, skjermene AG-06 Booking,
 * AG-06-NY og «Bookingen». Faner: Uten betaling · Bookinger · Ny booking ·
 * Tjenester og pris. Detaljen åpnes som ark på mobil og dialog på PC.
 *
 * Avvik fra tegningen (se PR/rapport):
 * - «Flytt» og «Avlys med begrunnelse» på en bekreftet booking finnes ikke:
 *   det finnes ingen handling for å avlyse en bekreftet booking (betalte
 *   bookinger må via Stripe først, gotchas §Betaling). Arket lenker i stedet
 *   til bookingdetaljen (/admin/bookinger/[id]).
 * - Ingen «utkast i Innboks» ved avvisning — den koblingen finnes
 *   ikke i kodebasen ennå (parkert, krever egen innboks-datamodell).
 * - Tjenester har ikke et «trekker klipp»-felt i ServiceType; det er derfor
 *   ikke tegnet inn i tjeneste-arket (ingen data å vise).
 * - «Timepris»-fallback i tegningen er demodata; pris er alltid ServiceType.priceOre.
 *
 * Fanen «Tjenester og pris» (bookingplanen steg 2, 15.10.2026): opprett, endre,
 * slå av og på, og slett tjenester her, med sted, coach, kategori, buffer,
 * minste varsel og maks dager fram. Den gamle siden /admin/services sender hit.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Avatar, Knapp, KnappLenke, Nokkelverdier, Pille, Tom, Topp, Varsel, type PilleTone } from "@/components/admin/agencyos-ny/ny";
import { bekreftBooking, avvisBooking } from "@/app/admin/(legacy)/bookinger/actions";
import { bookIKalender, type BookingValg } from "@/app/admin/kalender/booking-actions";
import type { AG06Booking, AG06Tjeneste, AG06TjenesteValg } from "@/app/admin/bookinger/data";
import { opprettTjeneste, oppdaterTjeneste, settTjenesteAktiv, slettTjeneste, type TjenesteInput } from "@/app/admin/bookinger/tjeneste-actions";
import { TJENESTE_KATEGORIER, kategoriNavn } from "@/lib/booking/tjeneste-kategori";
import "@/styles/agencyos-ny-kalender.css";

const TONE: Record<AG06Booking["st"], PilleTone> = { Venter: "vent", Bekreftet: "ok", Avvist: "noy" };

function kr(ore: number): string {
  return (ore / 100).toLocaleString("nb-NO", { maximumFractionDigits: 0 }) + " kr";
}

export type AG06Props = {
  navn: string;
  bookinger: AG06Booking[];
  valg: BookingValg;
  tjenester: AG06Tjeneste[];
  tjenesteValg: AG06TjenesteValg;
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

export function AG06Booking({ navn, bookinger, valg, tjenester, tjenesteValg, fane: initialFane }: AG06Props) {
  const [fane, setFane] = useState(initialFane ?? "foresp");
  const [sel, setSel] = useState<string | null>(null);
  const [rej, setRej] = useState<AG06Booking | null>(null);
  const [why, setWhy] = useState("");
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
  const doReject = () => {
    if (!rej) return;
    start(async () => {
      try { await avvisBooking(rej.id); setFeil(null); setRej(null); setWhy(""); setSel(null); router.refresh(); }
      catch (e) { setFeil(e instanceof Error ? e.message : "Bookingen kunne ikke avvises."); setRej(null); }
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
    body = <TjenestePanel tjenester={tjenester} valg={tjenesteValg} />;
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
        {body}

        {cur && !rej && <Ark dato="Bookingen" tittel={`${cur.who} · ${cur.svcNavn}`} onClose={() => setSel(null)}
          knapper={cur.st === "Venter" ? <>
            <Knapp stor disabled={pending} onClick={() => kjor(bekreftBooking)}>Bekreft booking</Knapp>
            <Knapp variant="sek" stor disabled={pending} onClick={() => setRej(cur)}>Avvis</Knapp>
          </> : cur.st === "Bekreftet" ? <KnappLenke stor href={`/admin/bookinger/${cur.id}`}>Åpne booking</KnappLenke>
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
          ]} />
        </Ark>}

        {rej && <div className="dialog-lag"><div role="dialog" aria-modal="true" aria-label="Avvise bookingen?" className="dialog">
          <h2>Avvise bookingen?</h2>
          <p className="forklar">{rej.who} · {rej.date} {rej.t}. Begrunnelsen lagres ikke og sendes ikke til kunden — gi beskjed selv.</p>
          <label className="felt"><span className="etikett">Kort begrunnelse</span>
            <textarea rows={3} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Studio 1 er stengt for service tirsdag." />
            <span className={why && why.trim().length < 8 ? "feiltekst" : "hjelp"}>{why && why.trim().length < 8 ? "Skriv en kort begrunnelse på minst 8 tegn." : "Minst 8 tegn."}</span></label>
          <div className="knapper">
            <Knapp variant="rust" disabled={why.trim().length < 8 || pending} onClick={doReject}>Avvis</Knapp>
            <Knapp variant="spok" onClick={() => setRej(null)}>Avbryt</Knapp>
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
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const tjeneste = valg.tjenester.find((t) => t.id === serviceTypeId);

  const opprett = () => {
    if (!spillerId || !serviceTypeId || !locationId || !dato) { setFeil("Fyll ut alle feltene."); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dato) || !/^\d{2}:\d{2}$/.test(tid)) { setFeil("Velg dato og tid."); return; }
    start(async () => {
      const res = await bookIKalender({ spillerId, serviceTypeId, locationId, start: `${dato}T${tid}`, notater: notater.trim() || undefined });
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
      <label className="felt"><span className="etikett">Notat (valgfritt)</span><textarea rows={3} value={notater} onChange={(e) => setNotater(e.target.value)} /></label>
      {feil && <Varsel tone="advarsel">{feil}</Varsel>}
    </div>
    <div className="kort dempet">
      <b className="undertittel">Oppsummering</b>
      <Nokkelverdier rader={[
        ["Tjeneste", tjeneste ? `${tjeneste.navn} · ${tjeneste.varighetMin} min` : "—"],
        ["Tid", dato ? `${dato} ${tid}` : "—"],
        ["Pris", tjeneste ? kr(tjeneste.prisOre) : "—", "fra tjenesten"],
      ]} />
      <Knapp stor disabled={pending} onClick={opprett}>{pending ? "Oppretter …" : "Opprett booking"}</Knapp>
    </div>
  </div>;
}

const NY_TJENESTE: TjenesteInput = {
  name: "", description: "", priceOre: 0, durationMin: 50, maxDeltakere: 1, coachUserId: null, locationId: null,
  kategori: "drop-in", bufferForMin: 0, bufferEtterMin: 0, minVarselTimer: 24, maksDagerFram: 7, active: true,
};

function tilInput(t: AG06Tjeneste): TjenesteInput {
  return {
    name: t.navn, description: t.beskrivelse ?? "", priceOre: t.prisOre, durationMin: t.varighetMin, maxDeltakere: t.maxDeltakere,
    coachUserId: t.coachUserId, locationId: t.locationId, kategori: t.kategori, bufferForMin: t.bufferForMin,
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
      {t.varighetMin} min · maks {t.maxDeltakere} {t.maxDeltakere === 1 ? "deltaker" : "deltakere"} · {t.coachNavn ?? "Felles"} · {t.stedNavn ?? "Sted ikke satt"} · {kategoriNavn(t.kategori)}
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
