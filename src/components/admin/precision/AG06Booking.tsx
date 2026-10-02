"use client";

/**
 * AG-06 Booking, Precision Athletics (tegninger: designsystem/precision-athletics/
 * ui_kits/agencyos/screens/AG-06.jsx og AG-mer.jsx). Faner: Uten betaling ·
 * Bookinger · Ny booking · Tjenester og pris.
 *
 * - Liste og detalj i to kolonner fra 1100 px; ark under.
 * - Venter: bekreft (bekreftBooking) eller avvis med begrunnelse — begrunnelsen
 *   blir et utkast i Innboks, ingenting sendes automatisk.
 * - Bekreftet: foreslå ny tid (spilleren godtar i PlayerHQ) eller avlys med full
 *   refusjon / klippet tilbake (Stripe før egen database).
 * - Ny booking: hele veiviseren med betalingsvalg (AG06NyBooking).
 * - Tjenester: redigeres i et ark; «Slett» deaktiverer en tjeneste med bookinger.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, CalendarPlus, Check, MousePointerClick, Move, Plus, Tag, Trash2, X } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Knapp, KnappLenke, Meta, StatusPille, TomTilstand } from "@/components/precision/pa";
import {
  Faner, Ark, Bryter, Dialogboks, Skjemafelt, Nedtrekk, Tekstfelt, TekstOmrade, Nokkelverdi,
  Tabell, Side, SideHode, Stabel, Kort, type TabellKolonne,
} from "@/components/precision/pa-a4";
import { AngreToast, Datofelt, tidsvalg } from "@/components/precision/pa-booking";
import { bekreftBooking } from "@/app/admin/(legacy)/bookinger/actions";
import { avlysBookingSomCoach, avvisBookingMedBegrunnelse, fjernTjeneste } from "@/app/admin/bookinger/actions";
import { createService, updateService } from "@/app/admin/(legacy)/services/actions";
import { foreslaaNyBookingtid, trekkTilbakeForslag } from "@/app/admin/kalender/flytt-actions";
import { AG06NyBooking } from "./AG06NyBooking";
import type { AG06Booking, AG06Tjeneste } from "@/app/admin/bookinger/data";
import type { NyBookingData } from "@/app/admin/bookinger/ny-data";
import "@/styles/precision-a4.css";

const TONE: Record<AG06Booking["st"], "warn" | "ok" | "neutral"> = { Venter: "warn", Bekreftet: "ok", Gjennomført: "neutral", Avvist: "neutral" };

function kr(ore: number): string {
  return (ore / 100).toLocaleString("nb-NO", { maximumFractionDigits: 0 }) + " kr";
}

export type AG06Props = {
  navn: string;
  bookinger: AG06Booking[];
  tjenester: AG06Tjeneste[];
  nyBooking: NyBookingData;
  fane?: "foresp" | "alle" | "ny" | "tj";
  /** Prøvefilen åpner en booking direkte for å måle detaljpanelet. */
  valgtId?: string;
};

/* ---------- Handlinger på én booking (delt med /admin/bookinger/[id]) ---------- */

export type BookingForHandling = Pick<AG06Booking, "id" | "who" | "date" | "t" | "dato" | "st" | "pay" | "harSpiller" | "forslag" | "guardian">;

export function BookingHandlinger({ b, etter, kompakt }: { b: BookingForHandling; etter?: () => void; kompakt?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [avvis, setAvvis] = useState(false);
  const [avlys, setAvlys] = useState(false);
  const [flytt, setFlytt] = useState(false);
  const [why, setWhy] = useState("");
  const [dato, setDato] = useState(b.dato);
  const [tid, setTid] = useState(b.t);
  const [kvittering, setKvittering] = useState<{ melding: string; meta: string } | null>(null);

  const ferdig = (k: { melding: string; meta: string }) => {
    setFeil(null);
    setKvittering(k);
    etter?.();
    router.refresh();
  };

  const bekreft = () => start(async () => {
    try { await bekreftBooking(b.id); ferdig({ melding: "Bookingen er bekreftet", meta: `${b.who} · ${b.date} ${b.t}`.toUpperCase() }); }
    catch (e) { setFeil(e instanceof Error ? e.message : "Bookingen kunne ikke bekreftes."); }
  });
  const gjorAvvis = () => start(async () => {
    try {
    const res = await avvisBookingMedBegrunnelse({ bookingId: b.id, begrunnelse: why });
    if (!res.ok) { setFeil(res.feil); return; }
    setAvvis(false); setWhy("");
    ferdig({ melding: "Bookingen er avvist", meta: res.utkast ? "UTKAST MED BEGRUNNELSEN LIGGER I INNBOKS · IKKE SENDT" : "INGEN E-POST PÅ BOOKINGEN · GI BESKJED SELV" });
    } catch { setFeil("Bookingen kunne ikke avvises. Prøv igjen."); }
  });
  const gjorAvlys = () => start(async () => {
    try {
    const res = await avlysBookingSomCoach({ bookingId: b.id, begrunnelse: why || undefined });
    if (!res.ok) { setFeil(res.feil); return; }
    setAvlys(false); setWhy("");
    ferdig({ melding: "Bookingen er avlyst", meta: res.refusjonVenter ? "REFUSJON VENTER PÅ BEHANDLING · BETALINGEN FØLGES OPP" : res.refundert ? "HELE BELØPET REFUNDERES I STRIPE" : res.klippTilbake ? "KLIPPET ER FØRT TILBAKE" : "BOOKINGEN ER OPPDATERT" });
    } catch { setFeil("Bookingen kunne ikke avlyses. Prøv igjen."); }
  });
  const gjorForslag = () => start(async () => {
    try {
    const res = await foreslaaNyBookingtid({ bookingId: b.id, dato, tid });
    if (!res.ok) { setFeil(res.feil); return; }
    setFlytt(false);
    ferdig({ melding: "Forslaget er sendt", meta: "TIDEN STÅR TIL SPILLEREN GODTAR I PLAYERHQ" });
    } catch { setFeil("Forslaget kunne ikke lagres. Prøv igjen."); }
  });
  const trekk = () => start(async () => {
    try {
    const res = await trekkTilbakeForslag(b.id);
    if (!res.ok) { setFeil(res.feil); return; }
    ferdig({ melding: "Forslaget er trukket tilbake", meta: "BOOKINGEN STÅR PÅ OPPRINNELIG TID" });
    } catch { setFeil("Forslaget kunne ikke trekkes tilbake. Prøv igjen."); }
  });

  const refusjonTekst = b.pay === "Betalt"
    ? "Hele beløpet refunderes i Stripe, uansett hvor nær timen er. AK Golf dekker gebyret."
    : b.pay === "Klipp"
      ? "Klippet føres tilbake til spillerens coaching-pakke."
      : b.pay === "Faktura"
        ? "Bookingen var merket for faktura. Husk å ikke fakturere den."
        : "Det er ingen betaling å refundere.";

  return (
    <>
      <div style={{ display: "flex", flexDirection: kompakt ? "row" : "column", flexWrap: "wrap", gap: 8 }}>
        {b.st === "Venter" && (
          <>
            <Knapp fullWidth={!kompakt} icon={CalendarCheck} iconName="check" loading={pending} onClick={bekreft}>Bekreft booking</Knapp>
            <Knapp fullWidth={!kompakt} variant="secondary" icon={X} iconName="x" disabled={pending} onClick={() => { setFeil(null); if (b.pay === "Betalt" || b.pay === "Klipp") setAvlys(true); else setAvvis(true); }}>{b.pay === "Betalt" || b.pay === "Klipp" ? "Avlys booking" : "Avvis"}</Knapp>
          </>
        )}
        {b.st === "Bekreftet" && (
          <>
            {b.forslag ? (
              <Knapp fullWidth={!kompakt} variant="secondary" disabled={pending} onClick={trekk}>Trekk tilbake forslaget</Knapp>
            ) : (
              <Knapp fullWidth={!kompakt} variant="secondary" icon={Move} iconName="move" disabled={!b.harSpiller || pending} onClick={() => { setFeil(null); setFlytt(true); }}>Foreslå ny tid</Knapp>
            )}
            <Knapp fullWidth={!kompakt} variant="ghost" disabled={pending} onClick={() => { setFeil(null); setAvlys(true); }}>Avlys booking</Knapp>
          </>
        )}
      </div>
      {b.st === "Bekreftet" && !b.harSpiller && !b.forslag && <Meta>GJESTEBOOKING · KUNDEN HAR IKKE PLAYERHQ · AVTAL NY TID DIREKTE</Meta>}
      {b.forslag && <Meta>FORESLÅTT {b.forslag} · VENTER PÅ SPILLEREN</Meta>}
      {feil && !avvis && !avlys && !flytt && <p role="alert" className="a4-feil">{feil}</p>}

      <Dialogboks
        open={avvis}
        onClose={() => setAvvis(false)}
        title="Avvise bookingen?"
        footer={<>
          <Knapp variant="ghost" onClick={() => setAvvis(false)}>Avbryt</Knapp>
          <Knapp variant="signal" disabled={why.trim().length < 8} loading={pending} loadingText="Avviser …" onClick={gjorAvvis}>Avvis og lag utkast</Knapp>
        </>}
      >
        <Stabel gap={12}>
          <p style={{ margin: 0 }}>{b.who} · {b.date} {b.t}. Begrunnelsen blir et utkast i Innboks{b.guardian ? ` til ${b.guardian}` : ""}. Du sender det selv.</p>
          <Skjemafelt label="Kort begrunnelse" required hint="Minst 8 tegn." error={why && why.trim().length < 8 ? "Skriv en kort begrunnelse på minst 8 tegn." : undefined}>
            <TekstOmrade value={why} onChange={setWhy} placeholder="Studio er stengt for service tirsdag." />
          </Skjemafelt>
          {feil && <p role="alert" className="a4-feil">{feil}</p>}
        </Stabel>
      </Dialogboks>

      <Dialogboks
        open={avlys}
        onClose={() => setAvlys(false)}
        title="Avlyse bookingen?"
        footer={<>
          <Knapp variant="ghost" onClick={() => setAvlys(false)}>Behold</Knapp>
          <Knapp variant="signal" icon={X} iconName="x" loading={pending} loadingText="Avlyser …" onClick={gjorAvlys}>Avlys booking</Knapp>
        </>}
      >
        <Stabel gap={12}>
          <p style={{ margin: 0 }}>{b.who} · {b.date} {b.t}. {refusjonTekst} Avlysningen blir synlig i PlayerHQ.</p>
          <Skjemafelt label="Notat (valgfritt)" hint="Lagres i loggen. Sendes ikke.">
            <TekstOmrade value={why} onChange={setWhy} placeholder="—" />
          </Skjemafelt>
          {feil && <p role="alert" className="a4-feil">{feil}</p>}
        </Stabel>
      </Dialogboks>

      <Ark
        open={flytt}
        onClose={() => setFlytt(false)}
        kicker={`Foreslå ny tid · ${b.who}`}
        title="Velg nytt tidspunkt"
        footer={<>
          <Knapp fullWidth icon={Move} iconName="move" loading={pending} disabled={!dato || !tid} onClick={gjorForslag}>Send forslag</Knapp>
          <Knapp fullWidth variant="ghost" onClick={() => setFlytt(false)}>Avbryt</Knapp>
        </>}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 12 }}>
          <Skjemafelt label="Dato"><Datofelt value={dato} onChange={setDato} /></Skjemafelt>
          <Skjemafelt label="Klokkeslett"><Nedtrekk value={tid} onChange={setTid} options={tidsvalg()} /></Skjemafelt>
        </div>
        {feil && <p role="alert" className="a4-feil">{feil}</p>}
        <Meta>TIDEN ENDRES IKKE FØR SPILLEREN GODTAR OG SER FORSLAGET I PLAYERHQ</Meta>
      </Ark>

      {kvittering && <AngreToast melding={kvittering.melding} meta={kvittering.meta} onFerdig={() => setKvittering(null)} ms={6000} />}
    </>
  );
}

/* ---------- Detaljinnhold ---------- */

function Detalj({ b }: { b: AG06Booking }) {
  return (
    <>
      <Nokkelverdi items={[
        ["Kilde", b.src, {}],
        ["Tjeneste", `${b.svcNavn} · ${b.min} min`, {}],
        ["Tid", `${b.date} ${b.t}`, { mono: true }],
        ["Sted", b.where, {}],
        ["Pris", kr(b.priceOre), { mono: true, hint: "FRA SERVICETYPE" }],
        ["Betaling", b.pay, {}],
        ["Kontakt", b.guardian, {}],
        ["Beskjed", b.note, {}],
        ["Bestilt", b.at, { mono: true }],
        ["Foreslått ny tid", b.forslag ?? undefined, { mono: true, hint: "VENTER PÅ SPILLEREN" }],
      ]} />
      <Meta>/ADMIN/BOOKINGER/{b.id.toUpperCase()}</Meta>
    </>
  );
}

/* ---------- Siden ---------- */

export function AG06Booking({ navn, bookinger, tjenester, nyBooking, fane: initialFane, valgtId }: AG06Props) {
  const [fane, setFane] = useState(initialFane ?? "foresp");
  const [sel, setSel] = useState<string | null>(valgtId ?? null);

  const pend = bookinger.filter((b) => b.st === "Venter");
  const rows = fane === "foresp" ? pend : bookinger;
  const cur = rows.find((b) => b.id === sel) ?? null;

  const liste = (
    <div className="pa-card" style={{ padding: 0, overflow: "hidden" }} role="group" aria-label="Bookinger">
      {rows.map((b) => (
        <button key={b.id} type="button" className="a4-bkrad" aria-pressed={sel === b.id} onClick={() => setSel(b.id)}>
          <span className="a4-bkrad__tid">{b.date} {b.t}</span>
          <span className="a4-bkrad__hoved">
            <span className="a4-bkrad__tittel">{b.who} · {b.svcNavn}</span>
            <Meta>{kr(b.priceOre)} · {b.pay.toUpperCase()} · {(b.src ?? "—").toUpperCase()}{b.forslag ? " · FORSLAG SENDT" : ""}</Meta>
          </span>
          <StatusPille tone={TONE[b.st]}>{b.st === "Venter" ? "Venter på deg" : b.st}</StatusPille>
        </button>
      ))}
    </div>
  );

  let body: React.ReactNode;
  if (fane === "foresp" || fane === "alle") {
    body = rows.length === 0
      ? <TomTilstand icon={CalendarCheck} title={fane === "foresp" ? "Ingen bookinger uten betaling venter" : "Ingen bookinger"} text="Spillere og foreldre booker fra PlayerHQ når du har satt tilgjengelighet." actions={<Knapp icon={CalendarPlus} iconName="calendar-plus" onClick={() => setFane("ny")}>Ny booking</Knapp>} />
      : (
        <div className="a4-todel">
          {liste}
          <div className="a4-bare-bred">
            {cur ? (
              <Kort>
                <div>
                  <span className="kicker">Booking</span>
                  <div style={{ font: "var(--type-title-s)", marginTop: 4 }}>{cur.who} · {cur.svcNavn}</div>
                </div>
                <Detalj b={cur} />
                <BookingHandlinger b={cur} etter={() => setSel(null)} />
                <KnappLenke variant="ghost" href={`/admin/bookinger/${cur.id}`}>Åpne booking</KnappLenke>
              </Kort>
            ) : (
              <Kort><TomTilstand icon={MousePointerClick} title="Velg en booking" text="Bekreft, avvis, flytt eller avlys herfra." /></Kort>
            )}
          </div>
        </div>
      );
  } else if (fane === "ny") {
    body = <AG06NyBooking data={nyBooking} />;
  } else {
    body = <TjenestePanel tjenester={tjenester} />;
  }

  return (
    <AgencyOSSkall navn={navn}>
      <Side>
        <SideHode
          kicker="Booking"
          title="Booking"
          sub="Betalte bookinger (offentlig og PlayerHQ) bekreftes automatisk når tiden er ledig. Du bekrefter eller avviser bare bookinger uten betaling. Alle kan avlyses."
          actions={<Knapp variant="secondary" icon={CalendarPlus} iconName="calendar-plus" onClick={() => { setFane("ny"); setSel(null); }}>Ny booking</Knapp>}
        />
        <Faner
          faner={[
            { verdi: "foresp", navn: "Uten betaling", antall: pend.length },
            { verdi: "alle", navn: "Bookinger" },
            { verdi: "ny", navn: "Ny booking" },
            { verdi: "tj", navn: "Tjenester og pris" },
          ]}
          valgt={fane}
          onEndre={(v) => { setFane(v as typeof fane); setSel(null); }}
        />
        {body}
      </Side>

      <div className="a4-bare-smal">
        <Ark
          open={!!cur && (fane === "foresp" || fane === "alle")}
          onClose={() => setSel(null)}
          kicker="Booking"
          title={cur ? `${cur.who} · ${cur.svcNavn}` : ""}
          footer={cur && <KnappLenke variant="ghost" fullWidth href={`/admin/bookinger/${cur.id}`}>Åpne booking</KnappLenke>}
        >
          {cur && (
            <>
              <Detalj b={cur} />
              <BookingHandlinger b={cur} etter={() => setSel(null)} />
            </>
          )}
        </Ark>
      </div>
    </AgencyOSSkall>
  );
}

/* ---------- Tjenester og pris ---------- */

type TjSkjema = { id: string | null; navn: string; beskrivelse: string; min: string; kr: string; aktiv: boolean };

export function TjenestePanel({ tjenester }: { tjenester: AG06Tjeneste[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [skjema, setSkjema] = useState<TjSkjema | null>(null);
  const [slett, setSlett] = useState<AG06Tjeneste | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [kvittering, setKvittering] = useState<string | null>(null);

  const kolonner: TabellKolonne<AG06Tjeneste>[] = [
    { key: "navn", label: "Tjeneste", render: (r) => r.navn },
    { key: "min", label: "Varighet", mono: true, align: "right", render: (r) => `${r.varighetMin} min` },
    { key: "p", label: "Pris", mono: true, align: "right", render: (r) => kr(r.prisOre) },
    { key: "delt", label: "Plasser", mono: true, align: "right", render: (r) => String(r.maksDeltakere) },
    { key: "st", label: "Status", render: (r) => <StatusPille tone={r.aktiv ? "ok" : "neutral"}>{r.aktiv ? "Aktiv" : "Skjult"}</StatusPille> },
  ];

  const apne = (t: AG06Tjeneste | null) => {
    setFeil(null);
    setSkjema(t
      ? { id: t.id, navn: t.navn, beskrivelse: t.beskrivelse ?? "", min: String(t.varighetMin), kr: String(Math.round(t.prisOre / 100)), aktiv: t.aktiv }
      : { id: null, navn: "", beskrivelse: "", min: "60", kr: "", aktiv: true });
  };

  const lagre = () => {
    if (!skjema) return;
    const min = Number(skjema.min);
    const pris = Number(skjema.kr);
    if (skjema.navn.trim().length < 2) { setFeil("Skriv et navn."); return; }
    if (!Number.isInteger(min) || min < 5 || min > 600) { setFeil("Varighet må være mellom 5 og 600 minutter."); return; }
    if (skjema.kr === "" || !Number.isFinite(pris) || pris < 0) { setFeil("Skriv pris i kroner (0 for gratis)."); return; }
    const input = { name: skjema.navn, description: skjema.beskrivelse, durationMin: min, priceOre: Math.round(pris * 100), active: skjema.aktiv };
    start(async () => {
      try {
        if (skjema.id) await updateService(skjema.id, input);
        else await createService(input);
        setSkjema(null);
        setKvittering("Tjenesten er lagret · nye priser gjelder nye bookinger");
        router.refresh();
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Tjenesten kunne ikke lagres.");
      }
    });
  };

  const gjorSlett = () => {
    const t = slett;
    if (!t) return;
    start(async () => {
      const res = await fjernTjeneste(t.id);
      if (!res.ok) { setFeil(res.feil); return; }
      setSlett(null);
      setSkjema(null);
      setKvittering(res.deaktivert ? "Tjenesten har bookinger og er skjult i stedet for slettet" : "Tjenesten er slettet");
      router.refresh();
    });
  };

  return (
    <Stabel>
      {tjenester.length === 0 ? (
        <TomTilstand icon={Tag} title="Ingen tjenester" text="Legg inn første tjeneste med varighet og pris." actions={<Knapp icon={Plus} iconName="plus" onClick={() => apne(null)}>Ny tjeneste</Knapp>} />
      ) : (
        <>
          <Tabell caption="Tjenester · kilde ServiceType · trykk en rad for å endre" columns={kolonner} rows={tjenester} onSelect={(id) => apne(tjenester.find((t) => t.id === id) ?? null)} />
          <div><Knapp variant="secondary" icon={Plus} iconName="plus" onClick={() => apne(null)}>Ny tjeneste</Knapp></div>
        </>
      )}

      <Ark
        open={!!skjema}
        onClose={() => setSkjema(null)}
        kicker="Tjeneste · ServiceType"
        title={skjema?.id ? skjema.navn || "Tjeneste" : "Ny tjeneste"}
        footer={<>
          <Knapp fullWidth icon={Check} iconName="check" loading={pending} onClick={lagre}>Lagre tjeneste</Knapp>
          {skjema?.id && <Knapp fullWidth variant="ghost" icon={Trash2} iconName="trash-2" onClick={() => setSlett(tjenester.find((t) => t.id === skjema.id) ?? null)}>Slett</Knapp>}
          <Knapp fullWidth variant="ghost" onClick={() => setSkjema(null)}>Avbryt</Knapp>
        </>}
      >
        {skjema && (
          <>
            <Skjemafelt label="Navn" required><Tekstfelt value={skjema.navn} onChange={(v) => setSkjema({ ...skjema, navn: v })} placeholder="Privattime" /></Skjemafelt>
            <Skjemafelt label="Beskrivelse (valgfritt)"><TekstOmrade value={skjema.beskrivelse} onChange={(v) => setSkjema({ ...skjema, beskrivelse: v })} placeholder="—" /></Skjemafelt>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
              <Skjemafelt label="Varighet (min)"><Tekstfelt mono inputMode="numeric" value={skjema.min} onChange={(v) => setSkjema({ ...skjema, min: v.replace(/\D/g, "") })} /></Skjemafelt>
              <Skjemafelt label="Pris (kr)"><Tekstfelt mono inputMode="numeric" value={skjema.kr} onChange={(v) => setSkjema({ ...skjema, kr: v.replace(/[^\d]/g, "") })} placeholder="—" /></Skjemafelt>
            </div>
            <Bryter checked={skjema.aktiv} onChange={(v) => setSkjema({ ...skjema, aktiv: v })} label={skjema.aktiv ? "Synlig for spillere" : "Skjult for spillere"} />
            {feil && <p role="alert" className="a4-feil">{feil}</p>}
            <Meta>NYE PRISER GJELDER NYE BOOKINGER · EKSISTERENDE BOOKINGER BEHOLDER PRISEN</Meta>
          </>
        )}
      </Ark>

      <Dialogboks
        open={!!slett}
        onClose={() => setSlett(null)}
        title="Slette tjenesten?"
        footer={<>
          <Knapp variant="ghost" onClick={() => setSlett(null)}>Avbryt</Knapp>
          <Knapp variant="signal" icon={Trash2} iconName="trash-2" loading={pending} loadingText="Sletter …" onClick={gjorSlett}>Slett</Knapp>
        </>}
      >
        {slett && <p style={{ margin: 0 }}>{slett.navn}. Har tjenesten bookinger, skjules den i stedet for å slettes, så historikken står.</p>}
      </Dialogboks>

      {kvittering && <AngreToast melding={kvittering} onFerdig={() => setKvittering(null)} ms={5000} />}
    </Stabel>
  );
}
