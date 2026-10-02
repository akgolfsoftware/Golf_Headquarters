"use client";

/**
 * PH-23 Booking (spiller) — Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-23.jsx, etag 1790520214001258).
 *
 * Tegningen samler hele booking i én skjerm (tre steg, «Mine timer», klippekort). Appen har
 * URL-styrte steg som serveren kontrollerer (ledig tid, betaling, klipptrekk), så samme
 * innhold er delt på sidene under /portal/booking. Alle sidene bruker delene i denne fila.
 *
 * Bevisste avvik fra tegningen:
 *   - Steg 1 og 2 er lenker (?service=&dato=) i stedet for lokal state, og «Bekreft» er egen side.
 *   - Dagene viser måned, ikke «N ledig»: antall ledige tider per dag hentes ikke for alle 14 dager.
 *   - «Flytt time» er egen side (bytte krever ny tid mot coachens kalender), ikke ark.
 *   - Klippekortet viser «—» for det appen ikke lagrer per kunde (bruk i forrige måned e.l.).
 *   - «SENDT TIL {e-post}» er ikke med på kvitteringen: kvitteringssiden vet ikke om e-posten gikk.
 */
import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, CalendarPlus, Check, CircleAlert, CreditCard, MapPin, Move, Lock, Mail } from "lucide-react";
import { Ikon, Knapp, KnappLenke, Meta, StatusPille, TomTilstand, FeilTilstand } from "@/components/precision/pa";
import { Ark, Dialogboks, Nokkelverdi, SideHode, Side, Stabel, Tilstandsvakt, TekstOmrade, Skjemafelt, Faner } from "@/components/precision/pa-a4";
import { Initialer } from "@/components/precision/pa-a3";
import { createCreditBooking } from "@/lib/booking/credit-booking";
import { opprettBookingMedKort } from "@/app/portal/booking/actions";
import { cancelBooking, rescheduleBooking } from "@/app/portal/meg/bookinger/actions";
import type { BookingNyV2Data } from "@/components/portal/v2/BookingNyV2";
import type { BookingNyBekreftV2Data } from "@/components/portal/v2/BookingNyBekreftV2";
import { isoKlokke, type PH23Dag } from "@/lib/portal-booking/ph23-format";
import type { HubCoach, HubForsteLedige } from "@/lib/portal-booking/hub-data";
import "@/styles/precision-a2300.css";

const kort = (style?: React.CSSProperties) => ({ padding: 16, gap: 12, display: "flex", flexDirection: "column", minWidth: 0, ...style }) as const;
const muted = { margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" } as const;
const upper = (s: string) => s.toLocaleUpperCase("nb-NO");

/* ---------- Deler ---------- */

function Tilbake({ href, tekst }: { href: string; tekst: string }) {
  return <div><KnappLenke variant="ghost" size="sm" icon={ArrowLeft} iconName="arrow-left" href={href}>{tekst}</KnappLenke></div>;
}

const STEG = ["Tjeneste", "Tid", "Bekreft"] as const;

export function PH23Trinn({ steg }: { steg: 0 | 1 | 2 }) {
  return (
    <ol className="ph23-trinn" aria-label="Steg">
      {STEG.map((n, i) => (
        <li key={n} data-ferdig={i <= steg} aria-current={i === steg ? "step" : undefined}>
          <span className="ph23-trinn__strek" />
          <span className="ph23-trinn__navn">{i + 1} · {n}</span>
        </li>
      ))}
    </ol>
  );
}

function Varsel({ tone, children }: { tone?: "signal" | "ok"; children: ReactNode }) {
  return <div className="ph23-varsel" data-tone={tone} role={tone === "signal" ? "alert" : undefined}>{children}</div>;
}

export type PH23Klipp = { total: number; igjen: number; pakke: string | null; fornyesTekst: string | null };

export function PH23Klippkort({ klipp }: { klipp: PH23Klipp }) {
  const tom = klipp.total <= 0;
  return (
    <div className="pa-card" style={kort({ gap: 10 })}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <span className="kicker">{tom ? "Klipp" : `Klipp · ${klipp.pakke ?? "Coaching"}`}</span>
        <Meta>{tom || !klipp.fornyesTekst ? "—" : `NYE KLIPP ${upper(klipp.fornyesTekst)}`}</Meta>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ font: "var(--type-metric-l)", color: "var(--text-primary)" }}>{tom ? "—" : klipp.igjen}</span>
        <span style={{ font: "var(--type-num)", color: "var(--text-muted)" }}>{tom ? "ingen klipp" : `av ${klipp.total} klipp igjen`}</span>
      </div>
      {!tom && (
        <div className="ph23-klipp" style={{ gridTemplateColumns: `repeat(${klipp.total},minmax(0,1fr))` }} aria-hidden>
          {Array.from({ length: klipp.total }, (_, i) => <span key={i} data-brukt={i < klipp.total - klipp.igjen} />)}
        </div>
      )}
      <Meta>
        {tom
          ? "KLIPP FØLGER COACHING-PAKKENE PERFORMANCE (2 PER MÅNED) OG PERFORMANCE PRO (4 PER MÅNED)"
          : `ÉN COACHET ØKT TREKKER ETT KLIPP · ${klipp.total} PER MÅNED · BRUKT ${klipp.total - klipp.igjen} DENNE PERIODEN · GJELDER PERFORMANCE OG PERFORMANCE PRO`}
      </Meta>
    </div>
  );
}

const STATUS: Record<string, { tekst: string; tone: "neutral" | "ok" | "warn" }> = {
  CONFIRMED: { tekst: "Bekreftet", tone: "ok" },
  PENDING: { tekst: "Behandler", tone: "warn" },
  CANCELLED: { tekst: "Avbestilt", tone: "neutral" },
  COMPLETED: { tekst: "Gjennomført", tone: "neutral" },
};

/* ---------- Avbestill (dialog) ---------- */

export function AvbestillDialog({ bookingId, tittel, tid, kanRefusjon, open, onClose }: {
  bookingId: string; tittel: string; tid: string; kanRefusjon: boolean; open: boolean; onClose: () => void;
}) {
  const router = useRouter();
  const [venter, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const utfor = () => {
    setFeil(null);
    start(async () => {
      try { await cancelBooking(bookingId); onClose(); router.refresh(); }
      catch (e) { setFeil(e instanceof Error ? e.message : "Kunne ikke avbestille."); }
    });
  };
  return (
    <Dialogboks open={open} onClose={onClose} title="Avbestille timen?" footer={<>
      <Knapp variant="secondary" onClick={onClose} disabled={venter}>Behold timen</Knapp>
      <Knapp variant="signal" onClick={utfor} loading={venter} loadingText="Avbestiller …">Avbestill</Knapp>
    </>}>
      <p style={{ margin: 0 }}>
        {tittel} {tid}. {kanRefusjon ? "Mer enn 24 timer til timen: timen frigis og betalingen refunderes." : "Mindre enn 24 timer til timen: ingen refusjon."}
      </p>
      {feil && <p role="alert" style={{ margin: "8px 0 0", color: "var(--signal-ink)" }}>{feil}</p>}
    </Dialogboks>
  );
}

/* ---------- Timer (rader) ---------- */

export type PH23Rad = {
  id: string; tjeneste: string; dato: string; kl: string; varighetMin: number; sted: string; coach: string | null;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"; betaling: string;
  kanBytte: boolean; kanAvbestille: boolean; kanRefusjon: boolean; href: string; byttHref: string;
};

export function PH23Timer({ rader, handlinger = true, detaljHref = true }: { rader: readonly PH23Rad[]; handlinger?: boolean; detaljHref?: boolean }) {
  const [avbestill, setAvbestill] = useState<PH23Rad | null>(null);
  return (
    <>
      {rader.map((r) => {
        const s = STATUS[r.status]!;
        return (
          <div key={r.id} className="ph23-rad">
            <div className="ph23-rad__topp">
              {detaljHref
                ? <Link href={r.href} className="ph23-rad__tittel" style={{ textDecoration: "none", display: "flex", alignItems: "center", minHeight: 44, margin: "-8px 0" }}>{r.tjeneste} · {r.varighetMin} min</Link>
                : <span className="ph23-rad__tittel">{r.tjeneste} · {r.varighetMin} min</span>}
              <StatusPille tone={s.tone}>{s.tekst}</StatusPille>
            </div>
            <Meta>{upper(r.dato)} KL. {r.kl} · {upper(r.sted)}</Meta>
            <Meta>{upper(r.betaling)}{r.coach ? ` · ${upper(r.coach)}` : ""}</Meta>
            {handlinger && r.kanAvbestille && (
              <div className="ph23-handlinger">
                {r.kanBytte && <KnappLenke size="sm" variant="secondary" icon={Move} iconName="move" href={r.byttHref}>Flytt time</KnappLenke>}
                <Knapp size="sm" variant="ghost" onClick={() => setAvbestill(r)}>Avbestill</Knapp>
                {!r.kanBytte && <Meta>UNDER 24 TIMER: INGEN FLYTTING ELLER REFUSJON</Meta>}
              </div>
            )}
          </div>
        );
      })}
      {avbestill && <AvbestillDialog open bookingId={avbestill.id} tittel={avbestill.tjeneste} tid={`${avbestill.dato} kl. ${avbestill.kl}`} kanRefusjon={avbestill.kanRefusjon} onClose={() => setAvbestill(null)} />}
    </>
  );
}

/* ---------- /portal/booking (oversikt) ---------- */

export type PH23HubProps = {
  tilstand: "data" | "feil";
  klipp: PH23Klipp; kommende: readonly PH23Rad[]; tidligere: readonly PH23Rad[];
  forsteLedige: HubForsteLedige | null; coaches: readonly HubCoach[];
  melding: "betalt" | "avbrutt" | null; tomForKlipp: boolean; feilKode?: string;
};

export function PH23Hub({ tilstand, klipp, kommende, tidligere, forsteLedige, coaches, melding, tomForKlipp, feilKode }: PH23HubProps) {
  const harPakke = klipp.total > 0;
  return (
    <Side max={1200}>
      <Tilbake href="/portal/meg" tekst="Meg" />
      <SideHode kicker="Meg · Booking" title="Book time" sub={coaches[0] ? `Privattime med ${coaches[0].name}.` : "Privattime hos AK Golf Academy."} />
      <Tilstandsvakt tilstand={tilstand} laster="Henter timer …" feil={{ title: "Timene kunne ikke hentes", text: "Ingen timer er booket eller endret. Prøv igjen.", code: feilKode ?? "FEIL 502 · BOOKING" }}>
        {melding === "betalt" && <Varsel tone="ok"><Ikon icon={Check} size={16} /><span>Betalingen er mottatt. Timen bekreftes automatisk og vises under «Mine timer». Du får også e-post.</span></Varsel>}
        {melding === "avbrutt" && <Varsel><Ikon icon={CircleAlert} size={16} /><span>Betalingen ble avbrutt. Tiden er ikke reservert. Velg gjerne en ny tid.</span></Varsel>}
        <div className="ph23-kolonner">
          <Stabel>
            <div className="pa-card" style={kort({ padding: 20, gap: 12 })}>
              <span className="kicker">Neste ledige tid</span>
              {forsteLedige ? (
                <>
                  <div style={{ font: "var(--type-title-m)", color: "var(--text-primary)" }}>{forsteLedige.ukedagKort} kl. {forsteLedige.kl}</div>
                  <p style={muted}>
                    {forsteLedige.serviceName} med {forsteLedige.coachNavn}.{" "}
                    {harPakke ? (tomForKlipp ? "Klippene er brukt opp denne perioden, så timen betales med kort." : `Du har ${klipp.igjen} ${klipp.igjen === 1 ? "klipp" : "klipp"} igjen denne perioden.`) : "Uten coaching-pakke betales timen med kort."}
                  </p>
                  <div><KnappLenke size="lg" iconRight={ArrowRight} href="/portal/booking/ny">Ta {forsteLedige.ukedagKort} {forsteLedige.kl}</KnappLenke></div>
                </>
              ) : (
                <>
                  <p style={muted}>Velg tjeneste og tid. Timen bekreftes automatisk når tiden er ledig og betalingen er gjennomført.</p>
                  <div><KnappLenke size="lg" iconRight={ArrowRight} href="/portal/booking/ny">Book time</KnappLenke></div>
                </>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {forsteLedige && <KnappLenke variant="secondary" href="/portal/booking/ny">Se alle ledige tider</KnappLenke>}
                <KnappLenke variant="ghost" href="/portal/booking/ny?betaling=1">Kjøp ekstra time med kort</KnappLenke>
              </div>
              <Meta>GRATIS AVBESTILLING FRAM TIL 24 TIMER FØR</Meta>
            </div>
            {coaches.length > 0 && (
              <div className="pa-card" style={kort({ padding: "12px 16px", gap: 0 })}>
                <span className="kicker" style={{ paddingBottom: 4 }}>Coacher</span>
                {coaches.map((c) => (
                  <Link key={c.id} href={`/portal/booking/coach/${c.id}`} className="ph23-lenkerad">
                    <Initialer navn={c.name} size={36} />
                    <span style={{ flex: 1, minWidth: 0, font: "500 14px/1.3 var(--font-sans)", overflowWrap: "anywhere" }}>{c.name}</span>
                    <Meta>{c.fromPrice ? `FRA ${upper(c.fromPrice)}` : "KLIPP"}</Meta>
                    <Ikon icon={ArrowRight} size={16} />
                  </Link>
                ))}
              </div>
            )}
          </Stabel>
          <Stabel>
            <PH23Klippkort klipp={klipp} />
            <div className="pa-card" style={kort({ padding: "12px 16px", gap: 0 })}>
              <span className="kicker" style={{ paddingBottom: 4 }}>Mine timer</span>
              {kommende.length ? <PH23Timer rader={kommende} /> : <p style={{ ...muted, margin: "4px 0 8px" }}>Ingen bookede timer.</p>}
              {kommende.length > 0 && <Link href="/portal/meg/bookinger" className="ph23-lenkerad" style={{ font: "500 14px/1.3 var(--font-sans)" }}>Se alle bookinger <Ikon icon={ArrowRight} size={16} /></Link>}
            </div>
            {tidligere.length > 0 && (
              <div className="pa-card" style={kort({ padding: "12px 16px", gap: 0 })}>
                <span className="kicker" style={{ paddingBottom: 4 }}>Tidligere bookinger</span>
                <PH23Timer rader={tidligere} handlinger={false} />
              </div>
            )}
          </Stabel>
        </div>
      </Tilstandsvakt>
    </Side>
  );
}

/* ---------- /portal/booking/ny (steg 1 og 2) ---------- */

export function PH23Ny({ data, dager, klipp }: { data: BookingNyV2Data; dager: readonly PH23Dag[]; klipp: PH23Klipp }) {
  const { wizardBase, modus, betalingGrunn, tjenester, valgtServiceId, serviceParamSatt, datoParam, valgtDatoLang, aktivtSteg, isFree, slots } = data;
  const erBetaling = modus === "betaling";
  const betalingQ = erBetaling ? "&betaling=1" : "";
  const valgt = tjenester.find((t) => t.id === valgtServiceId);
  const detaljLenker = wizardBase.startsWith("/portal/");
  const perCoach = new Map<string, { navn: string; tider: string[] }>();
  for (const s of slots) {
    const g = perCoach.get(s.coachId) ?? { navn: s.coachNavn, tider: [] };
    g.tider.push(s.startIso);
    perCoach.set(s.coachId, g);
  }
  const sub = erBetaling
    ? betalingGrunn === "BRUKT_OPP" ? "Klippene er brukt opp denne perioden, så timen betales med kort." : betalingGrunn === "VALGT" ? "Ekstra time mot betaling. Klippene dine røres ikke." : "Timen betales med kort. Ingen coaching-pakke kreves."
    : `${klipp.igjen} av ${klipp.total} klipp igjen denne perioden.`;
  const pris = (ore: number) => (erBetaling || ore > 0 ? `${new Intl.NumberFormat("nb-NO").format(ore / 100).replace(/ /g, " ")} kr` : "1 klipp");
  return (
    <Side max={1200}>
      <Tilbake href="/portal/booking" tekst="Booking" />
      <SideHode kicker="Meg · Booking" title="Book time" sub={sub} />
      <div className="ph23-kolonner">
        <Stabel>
          <PH23Trinn steg={serviceParamSatt ? 1 : 0} />
          {isFree && !erBetaling && (
            <div className="pa-card" style={kort()}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Ikon icon={Lock} size={18} /><span style={{ font: "600 15px/1.3 var(--font-sans)" }}>Booking krever coaching-pakke</span></div>
              <p style={muted}>Uten pakke kan du fortsatt booke og betale per time med kort.</p>
              <div className="ph23-handlinger"><KnappLenke href="/portal/meg/abonnement">Se abonnement</KnappLenke><KnappLenke variant="secondary" href={`${wizardBase}?betaling=1`}>Betal per time</KnappLenke></div>
            </div>
          )}
          {!serviceParamSatt || aktivtSteg === 1 ? (
            <div className="ph23-tjenester" role="list" aria-label="Tjeneste">
              {tjenester.map((t) => (
                <Link key={t.id} role="listitem" href={`${wizardBase}?service=${t.slug}${datoParam ? `&dato=${datoParam}` : ""}${betalingQ}`} scroll={false} className="ph23-tjeneste" aria-current={t.id === valgtServiceId && serviceParamSatt}>
                  <span style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                    <span style={{ font: "600 15px/1.3 var(--font-sans)", flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{t.navn}</span>
                    <span style={{ font: "600 15px/1 var(--font-mono)" }}>{pris(t.prisOre)}</span>
                  </span>
                  <Meta>{t.varighetMin} MIN{t.stedNavn ? ` · ${upper(t.stedNavn)}` : ""}{!erBetaling && t.prisOre <= 0 ? " · 1 KLIPP" : ""}</Meta>
                  {t.beskrivelse && <span style={muted}>{t.beskrivelse}</span>}
                </Link>
              ))}
            </div>
          ) : (
            <>
              <div className="pa-card" style={kort({ padding: "12px 16px", gap: 8 })}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ font: "500 14px/1.3 var(--font-sans)", flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{valgt?.navn ?? data.valgtServiceNavn} · {data.valgtServiceVarighetMin} min</span>
                  <KnappLenke size="sm" variant="ghost" icon={ArrowLeft} href={`${wizardBase}${erBetaling ? "?betaling=1" : ""}`}>Endre tjeneste</KnappLenke>
                </div>
              </div>
              <div className="pa-card" style={kort()}>
                <div className="ph23-dager" role="group" aria-label="Dag">
                  {dager.map((d) => (
                    <Link key={d.iso} href={`${wizardBase}?service=${valgt?.slug ?? ""}&dato=${d.iso}${betalingQ}`} scroll={false} className="ph23-dag" aria-current={d.aktiv}>
                      <span>{d.ukedag}</span><span>{d.dag}</span><span>{upper(d.mnd.replace(".", ""))}</span>
                    </Link>
                  ))}
                </div>
                <Meta>{upper(valgtDatoLang)}</Meta>
                {slots.length === 0 ? (
                  <p style={muted}>Ingen ledige tider {valgtDatoLang}. Velg en annen dag.</p>
                ) : (
                  Array.from(perCoach.entries()).map(([coachId, g]) => (
                    <div key={coachId} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {detaljLenker ? <Link href={`/portal/booking/coach/${coachId}`} style={{ textDecoration: "none", minHeight: 44, display: "flex", alignItems: "center" }}><Meta>{upper(g.navn)} →</Meta></Link> : <Meta>{upper(g.navn)}</Meta>}
                      <div className="ph23-tider">
                        {g.tider.map((iso) => (
                          <Link key={iso} className="pa-choice pa-choice--mono" href={`${wizardBase}/bekreft?service=${valgt?.slug ?? ""}&start=${encodeURIComponent(iso)}&coach=${coachId}${betalingQ}`}>
                            {isoKlokke(iso)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </Stabel>
        {!erBetaling && <PH23Klippkort klipp={klipp} />}
      </div>
    </Side>
  );
}

/* ---------- /portal/booking/ny/bekreft (steg 3) ---------- */

export function PH23Bekreft({ data, klipp }: { data: BookingNyBekreftV2Data; klipp: PH23Klipp }) {
  const { barnId, bekreftetBase = "/portal/booking/bekreftet", modus, prisOre, serviceTypeId, coachId, startIso, backHref, ledig, rader, creditsRemaining, saldoEtter } = data;
  const erBetaling = modus === "betaling";
  const router = useRouter();
  const [notat, setNotat] = useState("");
  const [venter, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  const bekreft = () => {
    setFeil(null);
    start(async () => {
      try {
        if (erBetaling) {
          const res = await opprettBookingMedKort({ serviceTypeId, coachId, startIso, notes: notat.trim() || undefined, barnId, retururlBase: barnId ? "/forelder/bookinger" : undefined });
          if (!res.ok) { setFeil(res.grunn); return; }
          window.location.href = res.url;
          return;
        }
        const r = await createCreditBooking({ serviceTypeId, coachId, start: startIso, notes: notat.trim() || undefined, barnId });
        router.push(`${bekreftetBase}?bookingId=${r.bookingId}`);
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Noe gikk galt.");
      }
    });
  };

  return (
    <Side max={1200}>
      <Tilbake href="/portal/booking" tekst="Booking" />
      <SideHode kicker="Meg · Booking" title="Book time" sub="Kontroller og bekreft. Timen bekreftes automatisk når tiden er ledig og betalingen er gjennomført." />
      <div className="ph23-kolonner">
        <Stabel>
          <PH23Trinn steg={2} />
          {!ledig && <Varsel tone="signal"><Ikon icon={CircleAlert} size={16} /><span>Tiden ble booket av noen andre. Gå tilbake og velg en annen tid.</span></Varsel>}
          <div className="pa-card" style={kort()}>
            <Nokkelverdi items={[
              ...rader.filter((r) => r.label !== "Kostnad" && r.label !== "Pris").map((r) => [r.label, r.verdi, { mono: r.label === "Dato/tid" || r.label === "Varighet" }] as const),
              erBetaling
                ? (["Pris", `${new Intl.NumberFormat("nb-NO").format(prisOre / 100).replace(/\u00a0/g, " ")} kr`, { hint: "BETALES MED KORT I NESTE STEG" }] as const)
                : (["Betaling", "1 klipp", { mono: false, hint: `SALDO ${creditsRemaining} → ${saldoEtter} KLIPP` }] as const),
            ]} />
            {ledig && (
              <Skjemafelt label="Notat til coachen (valgfritt)">
                <TekstOmrade value={notat} onChange={setNotat} placeholder="Hva vil du jobbe med? Spesielle ønsker?" />
              </Skjemafelt>
            )}
            <Meta>GRATIS AVBESTILLING FRAM TIL 24 TIMER FØR</Meta>
            {feil && <Varsel tone="signal"><Ikon icon={CircleAlert} size={16} /><span>{feil}</span></Varsel>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "space-between" }}>
            <KnappLenke variant="ghost" icon={ArrowLeft} href={backHref}>Velg annen tid</KnappLenke>
            {ledig && <Knapp icon={erBetaling ? CreditCard : Check} loading={venter} loadingText={erBetaling ? "Åpner betaling …" : "Bekrefter …"} onClick={bekreft}>{erBetaling ? "Til betaling" : "Bekreft booking"}</Knapp>}
          </div>
        </Stabel>
        {!erBetaling && <PH23Klippkort klipp={klipp} />}
      </div>
    </Side>
  );
}

/* ---------- /portal/booking/bekreftet (kvittering) ---------- */

export type PH23KvitteringData = {
  linje: string; coachNavn: string | null; sted: string; varighetMin: number; betaling: string; kalenderUrl: string;
  mineBookingerHref?: string; nyHref?: string;
};

export function PH23Kvittering({ data }: { data: PH23KvitteringData }) {
  return (
    <Side max={720}>
      <Tilbake href="/portal/booking" tekst="Booking" />
      <SideHode kicker="Meg · Booking" title="Timen er booket" />
      <div className="pa-card" style={kort({ padding: 20, gap: 16 })}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}><StatusPille tone="ok">Bekreftet</StatusPille></div>
        <div style={{ font: "var(--type-title-m)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{data.linje}</div>
        <Nokkelverdi items={[
          ["Varighet", `${data.varighetMin} min`],
          ["Sted", data.sted, { mono: false }],
          ["Coach", data.coachNavn ?? "—", { mono: false }],
          ["Betaling", data.betaling, { mono: false }],
        ]} />
        <div className="ph23-handlinger">
          <a className="pa-btn pa-btn--secondary pa-btn--icon-l" href={data.kalenderUrl} target="_blank" rel="noopener noreferrer"><Ikon icon={CalendarPlus} size={18} name="calendar-plus" />Legg i kalender</a>
          <KnappLenke variant="ghost" href={data.nyHref ?? "/portal/booking/ny"}>Book en til</KnappLenke>
          <KnappLenke variant="ghost" href={data.mineBookingerHref ?? "/portal/meg/bookinger"}>Se alle bookinger</KnappLenke>
        </div>
      </div>
    </Side>
  );
}

/* ---------- /portal/booking/[bookingId] (detalj) ---------- */

export type PH23DetaljData = {
  bookingId: string; tjeneste: string; status: PH23Rad["status"]; dato: string; tid: string; varighetMin: number;
  sted: string; stedId: string; coachNavn: string | null; coachId: string | null; notat: string | null;
  kanAvbestille: boolean; kanRefusjon: boolean; betaling: string;
};

export function PH23Detalj({ data }: { data: PH23DetaljData }) {
  const [dialog, setDialog] = useState(false);
  const s = STATUS[data.status]!;
  return (
    <Side max={720}>
      <Tilbake href="/portal/meg/bookinger" tekst="Mine bookinger" />
      <SideHode kicker="Meg · Booking" title={data.tjeneste} actions={<StatusPille tone={s.tone}>{s.tekst}</StatusPille>} />
      <div className="pa-card" style={kort({ padding: 20, gap: 16 })}>
        <Nokkelverdi items={[
          ["Dato", data.dato, { mono: false }],
          ["Tid", `${data.tid} · ${data.varighetMin} min`],
          ["Sted", <Link key="s" href={`/portal/booking/anlegg/${data.stedId}`} className="ph23-lenke">{data.sted}</Link>, { mono: false }],
          ["Coach", data.coachNavn && data.coachId ? <Link key="c" href={`/portal/booking/coach/${data.coachId}`} className="ph23-lenke">{data.coachNavn}</Link> : (data.coachNavn ?? "—"), { mono: false }],
          ["Betaling", data.betaling, { mono: false }],
        ]} />
        {data.notat && <div><span className="kicker">Notat</span><p style={{ ...muted, marginTop: 4, color: "var(--text-primary)" }}>{data.notat}</p></div>}
        <Meta>GRATIS AVBESTILLING FRAM TIL 24 TIMER FØR</Meta>
        <div className="ph23-handlinger">
          {data.kanAvbestille && data.kanRefusjon && <KnappLenke variant="secondary" icon={Move} iconName="move" href={`/portal/meg/bookinger/reschedule/${data.bookingId}`}>Flytt time</KnappLenke>}
          {data.kanAvbestille && <Knapp variant="ghost" onClick={() => setDialog(true)}>Avbestill</Knapp>}
        </div>
      </div>
      <AvbestillDialog open={dialog} onClose={() => setDialog(false)} bookingId={data.bookingId} tittel={data.tjeneste} tid={`${data.dato} kl. ${data.tid.split("–")[0]}`} kanRefusjon={data.kanRefusjon} />
    </Side>
  );
}

/* ---------- /portal/meg/bookinger (liste) ---------- */

export function PH23Bookinger({ kommende, historikk, feilTekst, tilstand }: { kommende: readonly PH23Rad[]; historikk: readonly PH23Rad[]; feilTekst?: string; tilstand: "data" | "feil" }) {
  const [fane, setFane] = useState("kommende");
  const rader = fane === "kommende" ? kommende : historikk;
  return (
    <Side max={720}>
      <Tilbake href="/portal/meg" tekst="Meg" />
      <SideHode kicker="Meg · Booking" title="Mine bookinger" sub={kommende.length ? `${kommende.length} kommende.` : "Ingen planlagte timer."} actions={<KnappLenke icon={CalendarPlus} iconName="calendar-plus" href="/portal/booking/ny">Ny booking</KnappLenke>} />
      {feilTekst && <Varsel tone="signal"><Ikon icon={CircleAlert} size={16} /><span>{feilTekst}</span></Varsel>}
      <Tilstandsvakt tilstand={tilstand} laster="Henter bookinger …" feil={{ title: "Bookingene kunne ikke hentes", text: "Ingen timer er endret. Prøv igjen.", code: "FEIL 502 · BOOKING" }}>
        <Faner faner={[{ verdi: "kommende", navn: "Kommende", antall: kommende.length }, { verdi: "historikk", navn: "Historikk", antall: historikk.length }]} valgt={fane} onEndre={setFane} />
        <div className="pa-card" style={kort({ padding: "4px 16px", gap: 0 })}>
          {rader.length ? <PH23Timer rader={rader} handlinger={fane === "kommende"} /> : (
            <TomTilstand icon={Calendar} title={fane === "kommende" ? "Ingen kommende bookinger" : "Ingen historikk"} text={fane === "kommende" ? "Book en coachingtime for å komme i gang." : "Gjennomførte og avbestilte timer vises her."} actions={fane === "kommende" ? <KnappLenke href="/portal/booking/ny">Book time</KnappLenke> : undefined} />
          )}
        </div>
      </Tilstandsvakt>
    </Side>
  );
}

/* ---------- /portal/meg/bookinger/reschedule/[bookingId] (flytt time) ---------- */

export type PH23ByttSlot = { start: string; coachId: string; coachName: string; kl: string; datoTid: string };

export function PH23Bytt({ bookingId, tjeneste, naaTekst, sted, varighetMin, dager, slots, tilstand }: {
  bookingId: string; tjeneste: string; naaTekst: string; sted: string; varighetMin: number; dager: readonly PH23Dag[]; slots: readonly PH23ByttSlot[]; tilstand: "data" | "feil";
}) {
  const router = useRouter();
  const [venter, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [valgt, setValgt] = useState<PH23ByttSlot | null>(null);
  const perCoach = new Map<string, PH23ByttSlot[]>();
  for (const s of slots) perCoach.set(s.coachId, [...(perCoach.get(s.coachId) ?? []), s]);
  const bekreft = () => {
    if (!valgt) return;
    setFeil(null);
    start(async () => {
      try {
        await rescheduleBooking({ bookingId, newStartIso: valgt.start, newCoachId: valgt.coachId });
        router.push("/portal/meg/bookinger?ny=1");
      } catch (e) { setFeil(e instanceof Error ? e.message : "Noe gikk galt."); }
    });
  };
  return (
    <Side max={1200}>
      <Tilbake href="/portal/meg/bookinger" tekst="Mine bookinger" />
      <SideHode kicker="Meg · Booking" title="Flytt time" sub={`${tjeneste}. Velg ny dag og tid.`} />
      <Tilstandsvakt tilstand={tilstand} laster="Henter ledige tider …" feil={{ title: "Ledige tider kunne ikke hentes", text: "Timen er ikke flyttet. Prøv igjen.", code: "FEIL 502 · KALENDER" }}>
        <div className="ph23-kolonner">
          <Stabel>
            <div className="pa-card" style={kort()}>
              <div className="ph23-dager" role="group" aria-label="Dag">
                {dager.map((d) => (
                  <Link key={d.iso} href={`/portal/meg/bookinger/reschedule/${bookingId}?dato=${d.iso}`} scroll={false} className="ph23-dag" aria-current={d.aktiv}>
                    <span>{d.ukedag}</span><span>{d.dag}</span><span>{upper(d.mnd.replace(".", ""))}</span>
                  </Link>
                ))}
              </div>
              {slots.length === 0 ? <p style={muted}>Ingen ledige tider denne dagen. Velg en annen dag.</p> : Array.from(perCoach.entries()).map(([id, liste]) => (
                <div key={id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Meta>{upper(liste[0]!.coachName)}</Meta>
                  <div className="ph23-tider">
                    {liste.map((s) => <button key={s.start} type="button" className="pa-choice pa-choice--mono" aria-pressed={valgt?.start === s.start} onClick={() => setValgt(s)}>{s.kl}</button>)}
                  </div>
                </div>
              ))}
              {feil && <Varsel tone="signal"><Ikon icon={CircleAlert} size={16} /><span>{feil}</span></Varsel>}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "space-between" }}>
              <KnappLenke variant="ghost" icon={ArrowLeft} href="/portal/meg/bookinger">Tilbake</KnappLenke>
              <Knapp icon={Check} disabled={!valgt} loading={venter} loadingText="Flytter …" onClick={bekreft}>{valgt ? `Flytt til ${valgt.datoTid}` : "Velg en tid"}</Knapp>
            </div>
          </Stabel>
          <div className="pa-card" style={kort()}>
            <span className="kicker">Nåværende tid</span>
            <Nokkelverdi items={[["Time", tjeneste, { mono: false }], ["Tid", naaTekst], ["Varighet", `${varighetMin} min`], ["Sted", sted, { mono: false }]]} />
            <Meta>FLYTTING ER GRATIS FRAM TIL 24 TIMER FØR START</Meta>
          </div>
        </div>
      </Tilstandsvakt>
    </Side>
  );
}

/* ---------- /portal/booking/coach/[coachId] ---------- */

export type PH23CoachData = {
  navn: string; ambition: string | null; epost: string; fellesOkter: number; visProKrav: boolean;
  tjenester: { id: string; navn: string; varighetMin: number; beskrivelse: string | null; prisTekst: string; href: string }[];
  wizardHref: string; meldingHref: string;
};

export function PH23Coach({ data }: { data: PH23CoachData }) {
  const fornavn = data.navn.split(" ")[0];
  return (
    <Side max={1200}>
      <Tilbake href="/portal/booking" tekst="Booking" />
      <SideHode kicker="Booking · Coach" title={data.navn} sub={data.ambition ?? undefined} />
      <div className="ph23-kolonner">
        <div className="pa-card" style={kort({ padding: "12px 16px", gap: 0 })}>
          <span className="kicker" style={{ paddingBottom: 4 }}>Velg type økt</span>
          {data.tjenester.length === 0 ? (
            <TomTilstand icon={Calendar} title="Ingen bookbare tjenester" text={`${fornavn} har ingen bookbare tjenester akkurat nå. Send en melding for å avtale en time.`} />
          ) : data.tjenester.map((t) => (
            <Link key={t.id} href={t.href} className="ph23-lenkerad">
              <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ font: "500 14px/1.3 var(--font-sans)", overflowWrap: "anywhere" }}>{t.navn} · {t.varighetMin} min</span>
                {t.beskrivelse && <span style={muted}>{t.beskrivelse}</span>}
              </span>
              <span style={{ font: "600 14px/1 var(--font-mono)", whiteSpace: "nowrap" }}>{t.prisTekst}</span>
              <Ikon icon={ArrowRight} size={16} />
            </Link>
          ))}
        </div>
        <Stabel>
          <div className="pa-card" style={kort()}>
            <span className="kicker">Book med {fornavn}</span>
            <p style={muted}>Velg type økt, eller gå rett til booking for å se ledige tider.</p>
            <KnappLenke fullWidth href={data.wizardHref}>Velg tid og bekreft</KnappLenke>
            <KnappLenke fullWidth variant="secondary" icon={Mail} href={data.meldingHref}>Send melding i stedet</KnappLenke>
            <Meta>GRATIS AVBESTILLING FRAM TIL 24 TIMER FØR</Meta>
          </div>
          <div className="pa-card" style={kort({ gap: 4 })}>
            <span className="kicker">Felles økter</span>
            <div style={{ font: "var(--type-metric-l)", color: "var(--text-primary)" }}>{data.fellesOkter}</div>
            <Meta>MELLOM DEG OG {upper(fornavn ?? "")}</Meta>
          </div>
          {data.visProKrav && (
            <div className="pa-card" style={kort()}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Ikon icon={Lock} size={18} /><span style={{ font: "600 15px/1.3 var(--font-sans)" }}>Klipp krever coaching-pakke</span></div>
              <p style={muted}>Uten pakke betaler du per time med kort.</p>
              <KnappLenke variant="secondary" href="/portal/meg/abonnement">Se abonnement</KnappLenke>
            </div>
          )}
          <div className="pa-card" style={kort({ gap: 4 })}>
            <span className="kicker">Kontakt</span>
            <span style={{ font: "500 14px/1.3 var(--font-sans)", overflowWrap: "anywhere" }}>{data.epost}</span>
          </div>
        </Stabel>
      </div>
    </Side>
  );
}

/* ---------- /portal/booking/anlegg/[anleggId] ---------- */

export type PH23AnleggData = {
  navn: string; adresse: string;
  fasiliteter: { id: string; navn: string; typeLabel: string; inne: boolean; beskrivelse: string | null }[];
};

export function PH23Anlegg({ data }: { data: PH23AnleggData }) {
  return (
    <Side max={1200}>
      <Tilbake href="/portal/booking" tekst="Booking" />
      <SideHode kicker="Booking · Anlegg" title={data.navn} sub={data.adresse} />
      <div className="ph23-kolonner">
        {data.fasiliteter.length === 0 ? (
          <div className="pa-card" style={kort()}><TomTilstand icon={MapPin} title="Ingen fasiliteter ennå" text="Ingen fasiliteter er registrert på dette anlegget." /></div>
        ) : (
          <div className="ph23-tjenester">
            {data.fasiliteter.map((f) => (
              <div key={f.id} className="pa-card" style={kort({ gap: 6 })}>
                <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                  <span style={{ font: "600 15px/1.3 var(--font-sans)", minWidth: 0, overflowWrap: "anywhere" }}>{f.navn}</span>
                  <StatusPille>{f.inne ? "Inne" : "Ute"}</StatusPille>
                </div>
                <Meta>{upper(f.typeLabel)}</Meta>
                {f.beskrivelse && <span style={muted}>{f.beskrivelse}</span>}
              </div>
            ))}
          </div>
        )}
        <div className="pa-card" style={kort()}>
          <span className="kicker">Book på dette anlegget</span>
          <p style={muted}>Velg tjeneste og en ledig tid. Ledige tider hentes fra coachens kalender.</p>
          <KnappLenke fullWidth href="/portal/booking/ny">Velg tid i booking</KnappLenke>
        </div>
      </div>
    </Side>
  );
}

export { FeilTilstand as PH23Feil, Ark as PH23Ark };
