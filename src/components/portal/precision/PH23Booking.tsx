"use client";

/**
 * PH-23 Booking — nytt design (pakke 7 Kommunikasjon, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/kommunikasjon.html, malene «booking», «ny», «bekreftet» og «detalj».
 * Stil: src/styles/playerhq-ny.css og src/styles/playerhq-ny-kommunikasjon.css.
 *
 * Samme handlinger som før: «Bekreft booking» går til klipp-flyten eller Stripe Checkout (kort),
 * «Flytt time» til rescheduleBooking (bare ledige tider innenfor coachens tilgjengelighet) og
 * «Avbestill» til cancelBooking. Betalingslogikken er uendret.
 *
 * Avvik:
 *   - Coach velges ikke for seg: hver tjeneste har sin coach, og coachen står på hver ledige tid.
 *   - Klippekortet viser brukt og igjen. «Booket» (reservert klipp) er ikke med: dataene skiller ikke
 *     reserverte klipp fra brukte.
 *   - Avbestillingsfristen står som regel («inntil 24 timer før»), ikke som dato og klokkeslett.
 *   - Raden «Tema» på bookingen er ikke med: bookingen har ikke tema fra teknisk plan.
 *   - Bekreftet-visningen sier ikke at økta ligger i Plan: bookinger legges ikke i planen i dag.
 *   - Alle bookinger har samme bilde (simulator). Bildet per sted er ikke avklart.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-23.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  type PH23BekreftResultat,
  type PH23BekreftValg,
  type PH23BookingData,
  type PH23Service,
  type PH23MyBooking,
  type PH23SlotDetalj,
  formatKr,
  beregnTjenestePris,
  getSyntheticPH23Data,
  slotNokkel,
} from "@/lib/portal-booking/ph23-booking-data";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-kommunikasjon.css";
import "@/styles/playerhq-ny-lister-skra.css";

type PH23SlotData = Pick<PH23BookingData, "days" | "slots"> & { slotDetails?: PH23BookingData["slotDetails"] };
type Visning = "oversikt" | "ny" | "detalj";

export type PH23BookingProps = {
  initialData?: PH23BookingData;
  state?: "data" | "tom" | "laster" | "feil";
  /** Retur fra Stripe Checkout (?betalt=1 / ?avbrutt=1). */
  betaling?: "betalt" | "avbrutt";
  /** Hvilken visning siden åpner med: oversikten (Bookinger) eller Book time. */
  start?: "oversikt" | "ny";
  /** Betalingsvalget Book time åpner med (?betaling=1 fra drop-in-lenken gir Kort). */
  startBetaling?: "Klipp" | "Kort";
  /** Ekte bookingflyt. Mangler den, kan ingenting bookes. */
  onConfirmBooking?: (valg: PH23BekreftValg) => Promise<PH23BekreftResultat>;
  /** Henter ekte ledige tider for en tjeneste. */
  onHentSlots?: (serviceTypeId: string) => Promise<PH23SlotData>;
  onCancelBooking?: (bookingId: string) => Promise<boolean>;
  /** Ekte flytting. Mangler den, vises ikke «Flytt time». */
  onRescheduleBooking?: (bookingId: string, slot: PH23SlotDetalj) => Promise<{ ok: true } | { ok: false; grunn: string }>;
};

const TOM_SLOTDATA: PH23SlotData = { days: [], slots: {}, slotDetails: {} };
const BILDE = "/images/playerhq/slag-simulator.jpg";
/** Første dag med ledige tider (0 hvis ingen). */
const forsteLedig = (sd: PH23SlotData) => Math.max(0, sd.days.findIndex((_, i) => (sd.slots[i] || []).length > 0));
const statusTekst = (s: PH23MyBooking["status"]) => (s === "Venter" ? "Venter på betaling" : s);

function KlippStolpe({ total, left }: { total: number; left: number }) {
  const brukt = Math.max(0, total - left);
  return <div className="phn-k-klipp" aria-label={`${brukt} brukt, ${left} igjen av ${total}`}>
    {Array.from({ length: total }, (_, i) => <i key={i} className={i < brukt ? "brukt" : undefined} />)}
  </div>;
}

/** Datoruta i listene: dagnummer over kort måned. Eldre data uten `dato` faller tilbake til dagteksten. */
function DatoRute({ m }: { m: { day: string; dato?: { nr: string; mnd: string } } }) {
  return m.dato
    ? <span className="phn-k-d"><b>{m.dato.nr}</b><span>{m.dato.mnd}</span></span>
    : <span className="phn-k-d"><b>{m.day.split(" ")[1]?.slice(0, 2) ?? "—"}</b><span>{m.day.split(" ")[0]}</span></span>;
}

function BookingKort({ m, bred = false, onClick }: { m: PH23MyBooking; bred?: boolean; onClick?: () => void }) {
  const innhold = <>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={BILDE} alt="" />
    <div className="phn-k-bt">
      <span className={`phn-pille ${m.status === "Bekreftet" ? "ok" : m.status === "Avbestilt" ? "noy" : "vent"}`}>{statusTekst(m.status)}</span>
      <span className="phn-k-bt-dag">{m.day}</span>
      <span className="phn-k-bt-tid">{m.t || "—"}</span>
      <span className="phn-k-navn">{m.svcName}</span>
      <span className="phn-k-info"><span>{m.place || "—"}</span>{m.coachName && <span>{m.coachName}</span>}<span>{m.pay === "Klipp" ? "1 klipp" : "Kort"}</span></span>
    </div>
  </>;
  return onClick
    ? <button type="button" className={`phn-k-booking-helt${bred ? " bred" : ""}`} onClick={onClick}>{innhold}</button>
    : <div className={`phn-k-booking-helt${bred ? " bred" : ""}`}>{innhold}</div>;
}

export function PH23Booking({
  initialData,
  state = "data",
  betaling,
  start = "oversikt",
  startBetaling = "Klipp",
  onConfirmBooking,
  onHentSlots,
  onCancelBooking,
  onRescheduleBooking,
}: PH23BookingProps) {
  const router = useRouter();
  const isTom = state === "tom";
  const defaultData = initialData ?? getSyntheticPH23Data(isTom);

  const [visning, setVisning] = useState<Visning>(betaling ? "oversikt" : start);
  const [detaljId, setDetaljId] = useState<string | null>(null);
  const [svcId, setSvcId] = useState<string | null>(defaultData.startServiceId ?? defaultData.services[0]?.id ?? null);
  const [slotData, setSlotData] = useState<PH23SlotData>(defaultData);
  const [henterSlots, setHenterSlots] = useState(false);
  const [dayIndex, setDayIndex] = useState(() => forsteLedig(defaultData));
  const [slot, setSlot] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<"Klipp" | "Kort">(startBetaling);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Lokale endringer oppå serverdata; router.refresh() gir ny sannhet fra serveren.
  const [lokaleEndringer, setLokaleEndringer] = useState<Record<string, Partial<PH23MyBooking>>>({});
  const mineTimer: PH23MyBooking[] = isTom ? [] : defaultData.mine.map((b) => ({ ...b, ...lokaleEndringer[b.id] }));
  const [doneBooking, setDoneBooking] = useState<(PH23MyBooking & { bookingId: string }) | null>(null);

  // Ark for flytting — tider hentes for bookingens egen tjeneste.
  const [mvBooking, setMvBooking] = useState<PH23MyBooking | null>(null);
  const [mvSlotData, setMvSlotData] = useState<PH23SlotData>(TOM_SLOTDATA);
  const [mvHenter, setMvHenter] = useState(false);
  const [mvDayIndex, setMvDayIndex] = useState(0);
  const [mvSlot, setMvSlot] = useState<string | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Dialog for avbestilling
  const [cxBooking, setCxBooking] = useState<PH23MyBooking | null>(null);
  /** Over avbestillingsfristen ved åpning av dialogen; null = ukjent start. */
  const [cxFoerFrist, setCxFoerFrist] = useState<boolean | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flyttArk = useRef<HTMLDialogElement>(null);
  const avbDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => { if (mvBooking) flyttArk.current?.showModal(); else flyttArk.current?.close(); }, [mvBooking]);
  useEffect(() => { if (cxBooking) avbDialog.current?.showModal(); else avbDialog.current?.close(); }, [cxBooking]);

  const showToast = (title: string) => {
    setToast(title);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const selectedService: PH23Service | undefined = defaultData.services.find((s) => s.id === svcId);
  const currentCard = isTom ? { ...defaultData.card, left: 0, total: 0 } : defaultData.card;
  const canUseClip = Boolean(selectedService?.clip && currentCard.left > 0);
  const servicePrice = selectedService ? beregnTjenestePris(selectedService, defaultData.rate) : null;
  const valgtSlot: PH23SlotDetalj | undefined = slot ? slotData.slotDetails?.[slotNokkel(dayIndex, slot)] : undefined;
  const betalesMedKlipp = canUseClip && payMethod === "Klipp";
  const detalj = mineTimer.find((m) => m.id === detaljId) ?? null;

  const velgTjeneste = async (id: string) => {
    setSvcId(id);
    setSlot(null);
    setDayIndex(0);
    if (!onHentSlots || id === svcId) return;
    setHenterSlots(true);
    try {
      const ny = await onHentSlots(id);
      setSlotData(ny);
      setDayIndex(forsteLedig(ny));
    } catch {
      setSlotData(TOM_SLOTDATA);
      showToast("Ledige tider kunne ikke hentes. Prøv igjen senere.");
    } finally {
      setHenterSlots(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedService || !slot || !valgtSlot || !onConfirmBooking) return;
    setIsConfirming(true);
    setConfirmError(null);
    const dayStr = slotData.days[dayIndex] ? slotData.days[dayIndex].join(" ") : "—";
    try {
      const res = await onConfirmBooking({
        serviceTypeId: selectedService.id,
        slot: valgtSlot,
        betaling: betalesMedKlipp ? "Klipp" : "Kort",
      });
      if (res.type === "betaling") {
        // Kortbetaling: timen er ikke booket før Stripe og webhooken har bekreftet.
        window.location.assign(res.url);
        return;
      }
      if (res.type === "feil") {
        setConfirmError(res.grunn);
        return;
      }
      setDoneBooking({
        id: res.bookingId,
        bookingId: res.bookingId,
        svc: selectedService.name,
        serviceTypeId: selectedService.id,
        svcName: `${selectedService.name} · ${selectedService.min} min`,
        day: dayStr,
        t: slot,
        place: "—",
        status: "Bekreftet",
        pay: "Klipp",
        coachName: valgtSlot.coachNavn,
      });
      router.refresh();
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : "Booking feilet. Prøv igjen.");
    } finally {
      setIsConfirming(false);
    }
  };

  const nyBooking = () => {
    setDoneBooking(null);
    setSlot(null);
    setConfirmError(null);
    setVisning("ny");
  };

  const apneFlytt = async (m: PH23MyBooking) => {
    setMvBooking(m);
    setMvSlot(null);
    setMvDayIndex(0);
    setMvSlotData(TOM_SLOTDATA);
    if (!onHentSlots || !m.serviceTypeId) return;
    setMvHenter(true);
    try {
      const ny = await onHentSlots(m.serviceTypeId);
      setMvSlotData(ny);
      setMvDayIndex(forsteLedig(ny));
    } catch {
      showToast("Ledige tider kunne ikke hentes. Prøv igjen senere.");
    } finally {
      setMvHenter(false);
    }
  };

  const handleDoReschedule = async () => {
    if (!mvBooking || !mvSlot || !onRescheduleBooking) return;
    const detaljSlot = mvSlotData.slotDetails?.[slotNokkel(mvDayIndex, mvSlot)];
    if (!detaljSlot) return;
    setIsRescheduling(true);
    const dayStr = mvSlotData.days[mvDayIndex] ? mvSlotData.days[mvDayIndex].join(" ") : "—";
    try {
      const res = await onRescheduleBooking(mvBooking.id, detaljSlot);
      if (!res.ok) {
        showToast(`Timen ble ikke flyttet: ${res.grunn}`);
        return;
      }
      setLokaleEndringer((prev) => ({ ...prev, [mvBooking.id]: { day: dayStr, t: mvSlot } }));
      showToast(`Timen er flyttet til ${dayStr} kl. ${mvSlot}. Coachen får beskjed.`);
      setMvBooking(null);
      setMvSlot(null);
      router.refresh();
    } catch {
      showToast("Timen ble ikke flyttet. Prøv igjen senere.");
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleDoCancel = async () => {
    if (!cxBooking || !onCancelBooking) return;
    setIsCancelling(true);
    try {
      await onCancelBooking(cxBooking.id);
      setLokaleEndringer((prev) => ({ ...prev, [cxBooking.id]: { status: "Avbestilt" } }));
      showToast("Timen er avbestilt. Detaljer om klipp og refusjon kommer på e-post.");
      setCxBooking(null);
      router.refresh();
    } catch (err) {
      showToast(`Timen ble ikke avbestilt: ${err instanceof Error ? err.message : "prøv igjen senere"}.`);
    } finally {
      setIsCancelling(false);
    }
  };

  /** Åpner avbestilling og avgjør fristen nå (ukjent start gir null — vi lover ingenting). */
  const apneAvbestill = (m: PH23MyBooking) => {
    const ms = m.startIso ? new Date(m.startIso).getTime() : NaN;
    setCxFoerFrist(Number.isNaN(ms) ? null : ms - Date.now() > defaultData.cancelHours * 3_600_000);
    setCxBooking(m);
  };

  const tilbake = (tekst: string, onClick?: () => void, href?: string) => href
    ? <Link href={href} className="phn-k-tilbake"><ChevronLeft className="phn-ikon" aria-hidden />{tekst}</Link>
    : <button type="button" className="phn-k-tilbake" style={{ border: 0, background: "none", cursor: "pointer" }} onClick={onClick}><ChevronLeft className="phn-ikon" aria-hidden />{tekst}</button>;

  /** Oversikten, laster og feil står i Skrå-drakten: bilde i toppen, tilbakelenke på bildet. */
  const skraHode = (overlinje = "Meg · booking", tittel = "Bookinger", tilbakeLenke: ReactNode = tilbake("Meg", undefined, "/portal/meg")) => <SkraTopp
    lav
    etikett={tittel}
    bilde="/images/playerhq/green-25m.jpg" bildePosisjon="50% 50%"
    overlinje={overlinje}
    tittel={tittel}
    handling={<span className="skra-tilbake">{tilbakeLenke}</span>}
  />;

  if (state === "laster") {
    return <div className="phn phn-skra" aria-busy="true">
      {skraHode()}
      <SkraFlyt lav>
      <div className="phn-k-booking-grid">
        <div><span className="phn-skjelett" style={{ height: 180 }} /><span className="phn-skjelett" style={{ height: 52 }} /></div>
        <div><span className="phn-skjelett" style={{ height: 260 }} /></div>
      </div>
      <p className="phn-kilde" role="status">Henter bookingene og ledige tider …</p>
      </SkraFlyt>
    </div>;
  }

  if (state === "feil") {
    return <div className="phn phn-skra">
      {skraHode()}
      <SkraFlyt lav>
      <section className="phn-kort" role="alert">
        <h2 className="phn-k-undertittel">Ledige tider kunne ikke hentes</h2>
        <p className="phn-forklar">Ingen timer er booket eller endret. Prøv igjen senere.</p>
        <div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={() => router.refresh()}>Prøv igjen</button></div>
      </section>
      </SkraFlyt>
    </div>;
  }

  const toastEl = toast && <div className="phn-k-toast" role="status">{toast}</div>;

  /* ---------- Bekreftet ---------- */
  if (doneBooking) {
    return <div className="phn phn-skra">
      <SkraTopp
        lav
        etikett="Booking bekreftet"
        bilde="/images/playerhq/green-25m.jpg" bildePosisjon="50% 50%"
        overlinje="Booking · bekreftet"
        tittel="Timen er bekreftet"
        ingress={`Bekreftelsen er sendt til ${defaultData.playerEmail || "e-posten din"}.`}
      />
      <SkraFlyt lav>
      <div className="phn-k-skra-grid">
        <div>
        <BookingKort m={doneBooking} />
        </div>
        <div>
        <div className="phn-kort">
          {currentCard.total > 0 && <>
            <div className="phn-hoved"><strong>{Math.max(0, currentCard.left - 1)}</strong><span className="phn-forklar">av {currentCard.total} klipp igjen etter timen</span></div>
            <KlippStolpe total={currentCard.total} left={Math.max(0, currentCard.left - 1)} />
          </>}
          <div className="phn-k-vilkaar"><b>Gratis avbestilling inntil {defaultData.cancelHours} timer før</b><span>Etter det trekkes klippet.</span></div>
        </div>
        <div className="phn-knapper">
          <a href={`/portal/booking/bekreftet?bookingId=${encodeURIComponent(doneBooking.bookingId)}`} className="phn-knapp pri">Legg i kalender</a>
          <button type="button" className="phn-knapp sek" onClick={() => { setDoneBooking(null); setVisning("oversikt"); }}>Mine bookinger</button>
          <button type="button" className="phn-knapp sek" onClick={nyBooking}>Book en til</button>
        </div>
        </div>
      </div>
      </SkraFlyt>
      {toastEl}
    </div>;
  }

  /* ---------- Book time ---------- */
  if (visning === "ny") {
    const dagSlots = slotData.slots[dayIndex] || [];
    const pris = (x: PH23Service) => (x.clip && currentCard.left > 0 ? "1 klipp" : formatKr(beregnTjenestePris(x, defaultData.rate)));
    return <div className="phn phn-skra">
      {skraHode("Booking · ny time", "Book time", tilbake("Bookinger", () => setVisning("oversikt")))}
      <SkraFlyt lav>
      {betaling === "avbrutt" && <p className="phn-k-feil" role="status">Betalingen ble avbrutt. Ingen time er booket.</p>}
      <div className="phn-k-ny-grid">
        <div style={{ display: "grid", gap: 24, alignContent: "start" }}>
          <section className="phn-seksjon">
            <div className="phn-sek-topp"><h2>Tjeneste</h2></div>
            {defaultData.services.length === 0 ? <p className="phn-forklar">Ingen tjenester kan bookes nå.</p>
              : <div className="phn-k-tjenester" role="radiogroup" aria-label="Tjeneste">
                {defaultData.services.map((x) => <button key={x.id} type="button" role="radio" aria-checked={x.id === svcId} className="phn-k-tjeneste" onClick={() => void velgTjeneste(x.id)}>
                  <b>{x.name}</b><span className="phn-k-pris">{pris(x)}</span>
                  <span className="phn-k-kildetekst">{x.min} min · {x.coach ?? "uten coach"}{x.note ? ` · ${x.note}` : ""}{x.clip ? "" : " · trekker ikke klipp"}</span>
                </button>)}
              </div>}
          </section>
          <section className="phn-seksjon">
            <div className="phn-sek-topp"><h2>Dag</h2><span className="phn-kilde">Prikk = ledig tid</span></div>
            {slotData.days.length === 0 ? <p className="phn-forklar">{henterSlots ? "Henter ledige tider …" : "Ingen ledige tider de neste 14 dagene for denne tjenesten."}</p>
              : <div className="phn-k-dager" role="group" aria-label="Dag">
                {slotData.days.map(([d, dt], i) => {
                  const ant = (slotData.slots[i] || []).length;
                  return <button key={dt} type="button" aria-pressed={i === dayIndex} disabled={!ant}
                    aria-label={`${d} ${dt}${ant ? `, ${ant} ledige` : ", ingen ledige tider"}`} onClick={() => { setDayIndex(i); setSlot(null); }}>
                    {d}<b>{dt.slice(0, 2)}</b><i />
                  </button>;
                })}
              </div>}
          </section>
          <section className="phn-seksjon">
            <div className="phn-sek-topp"><h2>Tid</h2><span className="phn-kilde">{dagSlots.length} ledige{selectedService ? ` · ${selectedService.min} min` : ""}</span></div>
            {henterSlots ? <p className="phn-forklar">Henter ledige tider …</p>
              : dagSlots.length ? <div className="phn-k-tider" role="group" aria-label="Tid">
                {dagSlots.map((t) => <button key={t} type="button" aria-pressed={slot === t} onClick={() => setSlot(t)}>{t}</button>)}
              </div>
                : <p className="phn-forklar">{slotData.days.length ? `Ingen ledige tider ${slotData.days[dayIndex]?.join(" ") ?? ""}. Velg en annen dag.` : "—"}</p>}
          </section>
        </div>
        <aside>
          <div className="phn-kort">
            <b className="phn-k-undertittel">Din booking</b>
            <ul className="phn-k-oppsummering">
              <li><span>Tjeneste</span><b>{selectedService ? `${selectedService.name} · ${selectedService.min} min` : "—"}</b></li>
              <li><span>Coach</span><b>{valgtSlot?.coachNavn ?? selectedService?.coach ?? "—"}</b></li>
              <li><span>Tid</span><b>{slot ? `${slotData.days[dayIndex]?.join(" ")} kl. ${slot}` : "—"}</b></li>
              <li><span>Betaling</span><b>{betalesMedKlipp ? `1 klipp · ${currentCard.left} av ${currentCard.total} igjen` : `Kort · ${formatKr(servicePrice)}`}</b></li>
            </ul>
            {selectedService?.clip && currentCard.left > 0 && <div className="phn-valg" role="group" aria-label="Betaling">
              {(["Klipp", "Kort"] as const).map((o) => <button key={o} type="button" aria-pressed={payMethod === o} onClick={() => setPayMethod(o)}>{o}</button>)}
            </div>}
            <div className="phn-k-vilkaar"><b>Gratis avbestilling inntil {defaultData.cancelHours} timer før</b>
              <span>{betalesMedKlipp ? "Etter det trekkes klippet." : "Du betaler med kort før timen, i en sikker betaling."}</span></div>
          </div>
          {confirmError && <p className="phn-k-feil" role="alert">Timen ble ikke booket: {confirmError}</p>}
          <div className="phn-k-festet">
            <button type="button" className="phn-knapp pri phn-k-stor" disabled={!valgtSlot || !onConfirmBooking || isConfirming} onClick={() => void handleConfirm()}>
              {isConfirming ? "Booker …" : betalesMedKlipp ? "Bekreft booking" : "Gå til betaling"}
            </button>
          </div>
        </aside>
      </div>
      </SkraFlyt>
      {toastEl}
    </div>;
  }

  const mvDaySlots = mvSlotData.slots[mvDayIndex] || [];
  const coachFornavn = (m: PH23MyBooking | null) => m?.coachName?.split(" ")[0] ?? "coachen";

  const flyttOgAvbestill = <>
    <dialog ref={flyttArk} className="phn-ark" aria-labelledby="ph23-flytt-tittel" onClose={() => setMvBooking(null)}>
      {mvBooking && <div className="phn-ark-kropp">
        <div className="phn-ark-topp"><h2 id="ph23-flytt-tittel">Flytt time</h2>
          <button type="button" className="phn-lukk" aria-label="Lukk" onClick={() => setMvBooking(null)}><X className="phn-ikon" aria-hidden /></button></div>
        <p className="phn-forklar">Ledige tider hos {coachFornavn(mvBooking)}. Du ser bare tider coachen har åpnet for booking, og kan flytte fram til {defaultData.cancelHours} timer før timen.</p>
        {mvHenter ? <p className="phn-forklar">Henter ledige tider …</p> : mvSlotData.days.length === 0 ? <p className="phn-forklar">Ingen ledige tider de neste dagene.</p> : <>
          <div className="phn-k-dager" role="group" aria-label="Ny dag">
            {mvSlotData.days.map(([d, dt], i) => {
              const ant = (mvSlotData.slots[i] || []).length;
              return <button key={dt} type="button" aria-pressed={mvDayIndex === i} disabled={!ant} aria-label={`${d} ${dt}${ant ? "" : ", ingen ledige tider"}`}
                onClick={() => { setMvDayIndex(i); setMvSlot(null); }}>{d}<b>{dt.slice(0, 2)}</b><i /></button>;
            })}
          </div>
          {mvDaySlots.length ? <div className="phn-k-tider" role="group" aria-label="Ny tid">
            {mvDaySlots.map((t) => <button key={t} type="button" aria-pressed={mvSlot === t} onClick={() => setMvSlot(t)}>{t}</button>)}
          </div> : <p className="phn-forklar">Ingen ledige tider denne dagen.</p>}
        </>}
        <div className="phn-k-fra-til">
          <div className="phn-okt phn-k-mini gml" style={{ background: "var(--phn-g800)" }}><div className="phn-okt-tekst"><span className="phn-k-okt-tid">{mvBooking.t}</span><span className="phn-navn">{mvBooking.day}</span></div></div>
          <ArrowRight className="phn-ikon phn-k-pil" aria-label="blir" />
          <div className="phn-okt phn-k-mini" style={{ background: "var(--phn-g900)" }}><div className="phn-okt-tekst"><span className="phn-k-okt-tid">{mvSlot ?? "—"}</span><span className="phn-navn">{mvSlot ? mvSlotData.days[mvDayIndex]?.join(" ") : "Velg ny tid"}</span></div></div>
        </div>
        <p className="phn-k-kildetekst">{coachFornavn(mvBooking)} får beskjed om den nye tiden. Ingen klipp trekkes for flyttingen.</p>
        <button type="button" className="phn-knapp pri phn-k-stor" disabled={!mvSlot || isRescheduling} onClick={() => void handleDoReschedule()}>
          {isRescheduling ? "Flytter …" : "Flytt til ny tid"}
        </button>
      </div>}
    </dialog>
    <dialog ref={avbDialog} className="phn-k-dialog" role="alertdialog" aria-labelledby="ph23-avb-tittel" aria-describedby="ph23-avb-tekst" onClose={() => setCxBooking(null)}>
      {cxBooking && <div className="phn-k-dialog-kropp">
        <h2 id="ph23-avb-tittel">Avbestille timen {cxBooking.day} kl. {cxBooking.t}?</h2>
        <p className="phn-forklar" id="ph23-avb-tekst">
          {cxFoerFrist === true
            ? `Du avbestiller mer enn ${defaultData.cancelHours} timer før, så klippet eller betalingen kommer tilbake. Coachen får beskjed.`
            : cxFoerFrist === false
              ? `Det er mindre enn ${defaultData.cancelHours} timer til timen. Klipp eller betaling kommer ikke tilbake.`
              : `Gratis avbestilling inntil ${defaultData.cancelHours} timer før.`}
        </p>
        <div className="phn-k-vilkaar"><b>{cxBooking.svcName}</b><span>{cxBooking.place || "—"} · betalt med {cxBooking.pay === "Klipp" ? "klipp" : "kort"}</span></div>
        <div className="phn-k-knapper-stablet">
          <button type="button" className="phn-knapp rust phn-k-stor" disabled={isCancelling} onClick={() => void handleDoCancel()}>{isCancelling ? "Avbestiller …" : "Avbestill timen"}</button>
          <button type="button" className="phn-knapp sek phn-k-stor" onClick={() => setCxBooking(null)}>Behold timen</button>
        </div>
      </div>}
    </dialog>
  </>;

  /* ---------- Bookingen ---------- */
  if (visning === "detalj" && detalj) {
    const aktiv = detalj.status !== "Avbestilt";
    return <div className="phn phn-skra">
      {skraHode("Booking", detalj.svcName, tilbake("Bookinger", () => setVisning("oversikt")))}
      <SkraFlyt lav>
      <div className="phn-k-skra-grid">
        <div>
        <BookingKort m={detalj} />
        </div>
        <div>
        <ul className="phn-k-oppsummering">
          <li><span>Coach</span><b>{detalj.coachName ?? "—"}</b></li>
          <li><span>Sted</span><b>{detalj.place || "—"}</b></li>
          <li><span>Betaling</span><b>{detalj.pay === "Klipp" ? `1 klipp${currentCard.pkg !== "Ingen pakke" ? `, ${currentCard.pkg}` : ""}` : "Kort"}</b></li>
          <li><span>Avbestilling</span><b>Gratis inntil {defaultData.cancelHours} timer før</b></li>
        </ul>
        {aktiv && <div className="phn-knapper">
          {onRescheduleBooking && detalj.serviceTypeId && <button type="button" className="phn-knapp pri" onClick={() => void apneFlytt(detalj)}>Flytt time</button>}
          {onCancelBooking && <button type="button" className="phn-knapp sek" onClick={() => apneAvbestill(detalj)}>Avbestill</button>}
          <Link href="/portal/coach" className="phn-knapp sek">Skriv til {coachFornavn(detalj)}</Link>
        </div>}
        </div>
      </div>
      </SkraFlyt>
      {flyttOgAvbestill}
      {toastEl}
    </div>;
  }

  /* ---------- Bookinger (oversikt) ---------- */
  const aktive = mineTimer.filter((m) => m.status !== "Avbestilt");
  const neste = aktive[0] ?? null;
  const resten = mineTimer.filter((m) => m !== neste);
  const harPakke = currentCard.total > 0;
  const apne = (m: PH23MyBooking) => { setDetaljId(m.id); setVisning("detalj"); };

  return <div className="phn phn-skra">
    {skraHode()}
    <SkraFlyt lav>
    {betaling && <p className={betaling === "betalt" ? "phn-k-vilkaar" : "phn-k-feil"} role="status">
      {betaling === "betalt"
        ? "Betalingen er mottatt. Timen bekreftes når betalingen er registrert, og bekreftelsen kommer på e-post."
        : "Betalingen ble avbrutt. Ingen time er booket."}
    </p>}
    <div className="phn-k-booking-grid">
      <div>
        <div className="phn-kort">
          <div className="phn-sek-topp"><b className="phn-k-undertittel">{harPakke ? `Klippekort · ${currentCard.pkg}` : "Klippekort"}</b>
            <span className="phn-kilde">{harPakke ? `Nye klipp ${currentCard.resets}` : "—"}</span></div>
          <div className="phn-hoved"><strong>{harPakke ? currentCard.left : "—"}</strong><span className="phn-forklar">{harPakke ? `av ${currentCard.total} klipp igjen` : "ingen klipp"}</span></div>
          {harPakke && <>
            <KlippStolpe total={currentCard.total} left={currentCard.left} />
            <div className="phn-lg-rad">
              <span className="phn-lg"><i style={{ background: "var(--phn-g900)" }} />Brukt {currentCard.total - currentCard.left}</span>
              <span className="phn-lg"><i style={{ background: "var(--phn-sand-150)", border: "1px solid var(--phn-sand-300)" }} />Igjen {currentCard.left}</span>
            </div>
          </>}
          <p className="phn-k-kildetekst">{harPakke ? "Én coachet økt trekker ett klipp." : "Klipp følger coaching-pakkene Performance (2 i måneden) og Performance Pro (4 i måneden)."}</p>
        </div>
        <button type="button" className="phn-knapp pri phn-k-stor" onClick={nyBooking}>Book time</button>
      </div>
      <div>
        <section className="phn-seksjon">
          <div className="phn-sek-topp"><h2>Neste time</h2></div>
          {neste ? <BookingKort m={neste} bred onClick={() => apne(neste)} />
            : <div className="phn-kort"><b className="phn-k-undertittel">Ingen bookede timer</b><p className="phn-forklar">Book en time med coachen din. Den dukker opp her.</p></div>}
        </section>
        {resten.length > 0 && <section className="phn-seksjon">
          <div className="phn-sek-topp"><h2>Kommende</h2></div>
          <div className="phn-k-booking-liste">
            {resten.map((m) => <button key={m.id} type="button" onClick={() => apne(m)}>
              <DatoRute m={m} />
              <span className="phn-k-t"><b>{m.svcName}</b><span>{m.day} kl. {m.t || "—"} · {statusTekst(m.status)}</span></span>
              <ChevronRight className="phn-ikon" aria-hidden />
            </button>)}
          </div>
        </section>}
        {!isTom && defaultData.past.length > 0 && <section className="phn-seksjon">
          <div className="phn-sek-topp"><h2>Tidligere</h2></div>
          <div className="phn-k-booking-liste">
            {defaultData.past.map((m) => <div key={m.id}>
              <DatoRute m={m} />
              <span className="phn-k-t"><b>{m.svcName}</b><span>{m.status ? `${m.status} · ` : ""}kl. {m.t} · {m.src}</span></span>
              <span className="phn-k-kildetekst">{m.ref}</span>
            </div>)}
          </div>
        </section>}
      </div>
    </div>
    {flyttOgAvbestill}
    </SkraFlyt>
    {toastEl}
  </div>;
}
