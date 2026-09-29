"use client";

/**
 * AG-06 Booking, Precision Athletics (tegning: designsystem/precision-athletics/
 * ui_kits/agencyos/screens/AG-06.jsx). Faner: Uten betaling · Bookinger ·
 * Ny booking · Tjenester og pris.
 *
 * Detaljvisning bruker Ark (pa-sheet--auto), som CSS gjør om til et fast
 * høyre panel fra 1025 px og bunn-ark under — det dekker tegningens
 * to-kolonners skrivebordsvisning uten egen grid-layout.
 *
 * Avvik fra tegningen (se PR/rapport):
 * - Ingen «utkast i Innboks» ved avvisning/avlysning — den koblingen finnes
 *   ikke i kodebasen ennå (parkert, krever egen innboks-datamodell).
 * - Tjenester har ikke et «trekker klipp»-felt i ServiceType; det er derfor
 *   ikke tegnet inn i tjeneste-arket (ingen data å vise).
 * - «Timepris»-fallback i tegningen er demodata; pris er alltid ServiceType.priceOre.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Knapp, StatusPille, TomTilstand, Sidehode } from "@/components/precision/pa";
import {
  Faner, Ark, Dialogboks, Skjemafelt, Nedtrekk, Tekstfelt, TekstOmrade, Nokkelverdi,
  Tabell, Side, Kolonner, Stabel, Kort, type TabellKolonne,
} from "@/components/precision/pa-a4";
import { bekreftBooking, avvisBooking } from "@/app/admin/(legacy)/bookinger/actions";
import { bookIKalender, type BookingValg } from "@/app/admin/kalender/booking-actions";
import type { AG06Booking } from "@/app/admin/bookinger/data";
import "@/styles/precision-a4.css";

const TONE: Record<AG06Booking["st"], "warn" | "ok" | "neutral"> = { Venter: "warn", Bekreftet: "ok", Avvist: "neutral" };

function kr(ore: number): string {
  return (ore / 100).toLocaleString("nb-NO", { maximumFractionDigits: 0 }) + " kr";
}

export type AG06Props = {
  navn: string;
  bookinger: AG06Booking[];
  valg: BookingValg;
  fane?: "foresp" | "alle" | "ny" | "tj";
};

export function AG06Booking({ navn, bookinger, valg, fane: initialFane }: AG06Props) {
  const [fane, setFane] = useState(initialFane ?? "foresp");
  const [sel, setSel] = useState<string | null>(null);
  const [rej, setRej] = useState<AG06Booking | null>(null);
  const [why, setWhy] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  const pend = bookinger.filter((b) => b.st === "Venter");
  const rows = fane === "foresp" ? pend : bookinger;
  const cur = bookinger.find((b) => b.id === sel) ?? null;

  const kjor = (fn: (id: string) => Promise<void>) => {
    if (!sel) return;
    start(async () => { await fn(sel); setSel(null); router.refresh(); });
  };
  const doReject = () => {
    if (!rej) return;
    start(async () => { await avvisBooking(rej.id); setRej(null); setWhy(""); setSel(null); router.refresh(); });
  };

  const kolonner: TabellKolonne<AG06Booking>[] = [
    { key: "tid", label: "Tid", mono: true, render: (b) => `${b.date} ${b.t}` },
    { key: "hvem", label: "Hvem", render: (b) => <span>{b.who} · {b.svcNavn}<br /><span className="a4-meta">{kr(b.priceOre)} · {(b.src ?? "—").toUpperCase()}</span></span> },
    { key: "status", label: "Status", render: (b) => <StatusPille tone={TONE[b.st]}>{b.st === "Venter" ? "Venter på deg" : b.st}</StatusPille> },
  ];

  let body: React.ReactNode;
  if (fane === "foresp" || fane === "alle") {
    body = rows.length === 0
      ? <TomTilstand icon={CalendarCheck} title={fane === "foresp" ? "Ingen bookinger uten betaling venter" : "Ingen bookinger"} text="Spillere og foreldre booker fra PlayerHQ når du har satt tilgjengelighet." actions={<Knapp icon={CalendarCheck} iconName="calendar-check" onClick={() => setFane("ny")}>Ny booking</Knapp>} />
      : <Tabell columns={kolonner} rows={rows} onSelect={setSel} selectedId={sel} />;
  } else if (fane === "ny") {
    body = <NyBookingSkjema valg={valg} onOpprettet={() => { setFane("alle"); router.refresh(); }} />;
  } else {
    body = <TjenestePanel tjenester={valg.tjenester} />;
  }

  return (
    <AgencyOSSkall navn={navn}>
      <Side>
        <Sidehode
          kicker="Booking"
          title="Booking"
          sub="Betalte bookinger (offentlig og PlayerHQ) bekreftes automatisk når tiden er ledig. Du bekrefter eller avviser bare bookinger uten betaling. Alle kan avlyses."
        />
        <Knapp variant="secondary" icon={CalendarCheck} iconName="calendar-plus" onClick={() => setFane("ny")}>Ny booking</Knapp>
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

      <Ark
        open={!!cur}
        onClose={() => setSel(null)}
        kicker="Booking"
        title={cur ? `${cur.who} · ${cur.svcNavn}` : ""}
        footer={cur && (
          cur.st === "Venter" ? (
            <>
              <Knapp fullWidth icon={CalendarCheck} iconName="check" disabled={pending} onClick={() => kjor(bekreftBooking)}>Bekreft booking</Knapp>
              <Knapp variant="secondary" fullWidth disabled={pending} onClick={() => setRej(cur)}>Avvis</Knapp>
            </>
          ) : cur.st === "Bekreftet" ? (
            <Knapp variant="ghost" fullWidth disabled={pending} onClick={() => setRej(cur)}>Avlys med begrunnelse</Knapp>
          ) : (
            <Knapp variant="ghost" fullWidth onClick={() => setSel(null)}>Lukk</Knapp>
          )
        )}
      >
        {cur && (
          <Nokkelverdi items={[
            ["Kilde", cur.src, {}],
            ["Tjeneste", `${cur.svcNavn} · ${cur.min} min`, {}],
            ["Tid", `${cur.date} ${cur.t}`, { mono: true }],
            ["Sted", cur.where, {}],
            ["Pris", kr(cur.priceOre), { mono: true }],
            ["Betaling", cur.pay, {}],
            ["Kontakt", cur.guardian, {}],
            ["Beskjed", cur.note, {}],
            ["Bestilt", cur.at, { mono: true }],
          ]} />
        )}
      </Ark>

      <Dialogboks
        open={!!rej}
        onClose={() => setRej(null)}
        title={rej?.st === "Bekreftet" ? "Avlyse bookingen?" : "Avvise bookingen?"}
        footer={<>
          <Knapp variant="ghost" onClick={() => setRej(null)}>Avbryt</Knapp>
          <Knapp variant="signal" disabled={why.trim().length < 8 || pending} onClick={doReject}>{rej?.st === "Bekreftet" ? "Avlys" : "Avvis"}</Knapp>
        </>}
      >
        {rej && (
          <Stabel gap={12}>
            <p style={{ margin: 0 }}>{rej.who} · {rej.date} {rej.t}. Begrunnelsen lagres ikke automatisk til kunden ennå — send den selv i Innboks.</p>
            <Skjemafelt label="Kort begrunnelse" required hint="Minst 8 tegn." error={why && why.trim().length < 8 ? "Skriv en kort begrunnelse på minst 8 tegn." : undefined}>
              <TekstOmrade value={why} onChange={setWhy} placeholder="Studio 1 er stengt for service tirsdag." />
            </Skjemafelt>
          </Stabel>
        )}
      </Dialogboks>
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
    start(async () => {
      const res = await bookIKalender({ spillerId, serviceTypeId, locationId, start: `${dato}T${tid}` });
      if (!res.ok) { setFeil(res.feil); return; }
      setFeil(null);
      onOpprettet();
    });
  };

  return (
    <Kolonner mal="minmax(0,1.2fr) minmax(0,1fr)">
      <Kort>
        <Skjemafelt label="Spiller"><Nedtrekk value={spillerId} onChange={setSpillerId} options={valg.spillere.map((s) => ({ value: s.id, label: s.navn }))} /></Skjemafelt>
        <Skjemafelt label="Tjeneste"><Nedtrekk value={serviceTypeId} onChange={setServiceTypeId} options={valg.tjenester.map((t) => ({ value: t.id, label: `${t.navn} · ${t.varighetMin} min · ${kr(t.prisOre)}` }))} /></Skjemafelt>
        <Skjemafelt label="Sted"><Nedtrekk value={locationId} onChange={setLocationId} options={valg.steder.map((s) => ({ value: s.id, label: s.navn }))} /></Skjemafelt>
        <Kolonner mal="repeat(2,minmax(0,1fr))">
          <Skjemafelt label="Dato"><Tekstfelt mono value={dato} onChange={setDato} placeholder="ÅÅÅÅ-MM-DD" /></Skjemafelt>
          <Skjemafelt label="Tid"><Tekstfelt mono value={tid} onChange={setTid} placeholder="16:00" /></Skjemafelt>
        </Kolonner>
        <Skjemafelt label="Notat (valgfritt)"><TekstOmrade value={notater} onChange={setNotater} placeholder="—" /></Skjemafelt>
        {feil && <p style={{ color: "var(--signal-ink)", margin: 0 }}>{feil}</p>}
      </Kort>
      <Kort>
        <Nokkelverdi items={[
          ["Tjeneste", tjeneste ? `${tjeneste.navn} · ${tjeneste.varighetMin} min` : null, {}],
          ["Tid", dato ? `${dato} ${tid}` : null, { mono: true }],
          ["Pris", tjeneste ? kr(tjeneste.prisOre) : null, { mono: true, hint: "FRA SERVICETYPE" }],
        ]} />
        <Knapp icon={CalendarCheck} iconName="check" disabled={pending} onClick={opprett}>Opprett booking</Knapp>
      </Kort>
    </Kolonner>
  );
}

function TjenestePanel({ tjenester }: { tjenester: BookingValg["tjenester"] }) {
  const kolonner: TabellKolonne<{ id: string; navn: string; varighetMin: number; prisOre: number; maxDeltakere: number }>[] = [
    { key: "navn", label: "Tjeneste", render: (r) => r.navn },
    { key: "min", label: "Varighet", mono: true, align: "right", render: (r) => `${r.varighetMin} min` },
    { key: "p", label: "Pris", mono: true, align: "right", render: (r) => kr(r.prisOre) },
    { key: "delt", label: "Maks deltakere", mono: true, align: "right", render: (r) => String(r.maxDeltakere) },
  ];
  return (
    <Stabel>
      <Tabell caption="Tjenester · kilde ServiceType. Endre pris og varighet under Mer › Oppsett." columns={kolonner} rows={tjenester} tomTekst="Ingen tjenester" />
    </Stabel>
  );
}
