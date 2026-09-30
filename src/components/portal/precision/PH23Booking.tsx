"use client";

/**
 * PH-23 Booking i PlayerHQ — Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-23.jsx, etag 1790520214001258).
 *
 * Tegningen er ett klientflyt med tre steg (Tjeneste · Tid · Bekreft) og en
 * sidekolonne med klipp og «Mine timer». Appen har fra før en adressestyrt flyt
 * med egne sider, og den beholdes: hvert steg er fortsatt sin egen adresse
 * (/portal/booking, /ny, /ny/bekreft, /bekreftet), slik at tilbake-knapp,
 * Stripe-retur og delte lenker virker som før. Denne fila har visningene for alle
 * åtte sidene; serversidene eier data, tilgang og handlinger.
 *
 * Bevisste avvik fra tegningen:
 *   - Valg av tjeneste går rett til neste steg (lenke), uten egen «Neste»-knapp.
 *   - Dagsrekka viser 14 dager som brytende rutenett, uten «N ledig»: antall
 *     ledige tider per dag finnes ikke uten ett oppslag per dag.
 *   - «Sendt til {e-post}» på kvitteringen vises ikke: sendingen er ikke kontrollert her.
 *   - Flytt time er egen side (reschedule) i stedet for ark, fordi tidene hentes
 *     fra samme kalender som appen bruker ellers.
 *   - Sted vises der det er lagret; tegningens faste «Fredrikstad GK» er ikke brukt.
 */
import Link from "next/link";
import { useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CalendarPlus, CreditCard, Move } from "lucide-react";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-a4.css";
import { Knapp, KnappLenke, Meta, StatusPille, Tall, TomTilstand } from "@/components/precision/pa";
import { Dialogboks, Faner, Kolonner, Nokkelverdi, Side, SideHode, Stabel, TekstOmrade } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { Initialer } from "@/components/precision/pa-a3";
import { AVBESTILLING_FRIST_TIMER } from "@/lib/booking/policy";
import { createCreditBooking } from "@/lib/booking/credit-booking";
import { opprettBookingMedKort } from "@/app/portal/booking/actions";
import { cancelBooking, rescheduleBooking } from "@/app/portal/meg/bookinger/actions";
import type { BookingNyV2Data } from "@/components/portal/v2/BookingNyV2";
import type { BookingNyBekreftV2Data } from "@/components/portal/v2/BookingNyBekreftV2";
import type { BookingDetaljV2Data } from "@/components/portal/v2/BookingDetaljV2";
import type { BookingCoachV2Data } from "@/components/portal/v2/BookingCoachV2";
import type { HubBooking, HubCredits, HubForsteLedige } from "@/lib/portal-booking/hub-data";
import { datoKort, datoLang, klokke, kr, type Dagsvalg } from "@/lib/portal-booking/ph23-visning";

const KICKER = "Meg · Booking";
const STEG = ["Tjeneste", "Tid", "Bekreft"] as const;
const muted = { margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" } as const;
const hair = "1px solid var(--border-hairline)";
const STATUS: Record<string, { tekst: string; tone: "neutral" | "ok" | "warn" }> = {
  PENDING: { tekst: "Behandler", tone: "warn" },
  CONFIRMED: { tekst: "Bekreftet", tone: "ok" },
  COMPLETED: { tekst: "Gjennomført", tone: "neutral" },
  CANCELLED: { tekst: "Avbestilt", tone: "neutral" },
};

function useDesk(): boolean {
  return useSyncExternalStore(
    (cb) => { const m = window.matchMedia("(min-width:1024px)"); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => window.matchMedia("(min-width:1024px)").matches,
    () => false,
  );
}

const kol = (desk: boolean) => (desk ? "minmax(0,1fr) 340px" : "minmax(0,1fr)");

function Steg({ aktiv }: { aktiv: number }) {
  return <ol aria-label="Steg" style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 6 }}>
    {STEG.map((n, i) => <li key={n} aria-current={i === aktiv ? "step" : undefined} style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <span style={{ height: 4, background: i <= aktiv ? "var(--primary)" : "var(--surface-sunken)" }} />
      <span style={{ font: `${i === aktiv ? 600 : 500} 13px/1.2 var(--font-sans)`, color: i === aktiv ? "var(--text-primary)" : "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i + 1} · {n}</span>
    </li>)}
  </ol>;
}

export type KlippData = { pakke: string | null; igjen: number; total: number; fornyes: string | null };

export function KlippKort({ klipp }: { klipp: KlippData }) {
  const tom = klipp.total <= 0;
  const brukt = klipp.total - klipp.igjen;
  return <section aria-label="Klipp" className="pa-card" style={{ padding: 16, gap: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
      <span className="kicker">{tom ? "Klipp" : `Klipp${klipp.pakke ? " · " + klipp.pakke : ""}`}</span>
      <Meta>{tom || !klipp.fornyes ? "—" : `NYE KLIPP ${klipp.fornyes.toUpperCase()}`}</Meta>
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span style={{ font: "var(--type-metric-l)", color: "var(--text-primary)" }}>{tom ? "—" : klipp.igjen}</span>
      <Tall style={{ color: "var(--text-muted)" }}>{tom ? "ingen klipp" : `av ${klipp.total} klipp igjen`}</Tall>
    </div>
    {!tom && klipp.total <= 12 && <div style={{ display: "grid", gridTemplateColumns: `repeat(${klipp.total},minmax(0,1fr))`, gap: 3 }} aria-hidden="true">
      {Array.from({ length: klipp.total }, (_, i) => <span key={i} style={{ height: 8, background: i < brukt ? "var(--surface-sunken)" : "var(--primary)" }} />)}
    </div>}
    <Meta>{tom ? "KLIPP FØLGER COACHING-PAKKENE PERFORMANCE (2 PER MÅNED) OG PERFORMANCE PRO (4 PER MÅNED)" : `${klipp.total} PER MÅNED · BRUKT ${brukt} I PERIODEN`}</Meta>
  </section>;
}

function Tittelrad({ tittel, meta }: { tittel: string; meta?: React.ReactNode }) {
  return <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", justifyContent: "space-between" }}>
    <span className="kicker">{tittel}</span>{meta != null && <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>{meta}</span>}
  </div>;
}

function Timerad({ href, tittel, status, meta, forste }: { href?: string; tittel: string; status: string; meta: string; forste: boolean }) {
  const s = STATUS[status] ?? STATUS.PENDING!;
  const innhold = <>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
      <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)", flex: "1 1 160px", minWidth: 0 }}>{tittel}</span>
      <StatusPille tone={s.tone}>{s.tekst}</StatusPille>
    </div>
    <Meta>{meta}</Meta>
  </>;
  const stil = { display: "flex", flexDirection: "column", gap: 6, padding: "12px 0", borderTop: forste ? "none" : hair, minWidth: 0, color: "inherit", textDecoration: "none" } as const;
  return href ? <Link href={href} style={{ ...stil, minHeight: 44 }}>{innhold}</Link> : <div style={stil}>{innhold}</div>;
}

function MineTimer({ timer }: { timer: HubBooking[] }) {
  return <section aria-label="Mine timer" className="pa-card" style={{ padding: "12px 16px" }}>
    <Tittelrad tittel="Mine timer" meta={<Link href="/portal/meg/bookinger" style={{ color: "inherit", display: "inline-flex", minHeight: 44, alignItems: "center" }}>SE ALLE</Link>} />
    {timer.length ? timer.slice(0, 4).map((b, i) => <Timerad key={b.id} href={`/portal/booking/${b.id}`} forste={i === 0} tittel={`${b.serviceName} · ${b.durationMin} min`} status={b.status}
      meta={`${datoKort(b.startIso).toUpperCase()} KL. ${klokke(b.startIso)}${b.locationName ? " · " + b.locationName.toUpperCase() : ""}`} />)
      : <p style={{ ...muted, margin: "4px 0 8px" }}>Ingen bookede timer.</p>}
  </section>;
}

/* ───────────────────────── /portal/booking ───────────────────────── */

export type PH23HubProps = {
  klipp: KlippData;
  credits: HubCredits;
  upcoming: HubBooking[];
  forsteLedige: HubForsteLedige | null;
  melding: "betalt" | "avbrutt" | null;
};

export function PH23Hub({ klipp, credits, upcoming, forsteLedige, melding }: PH23HubProps) {
  const desk = useDesk();
  const harPakke = credits.monthlyCredits > 0;
  const brukt = harPakke && credits.creditsRemaining <= 0;
  return <Side max={1200}>
    <SideHode kicker={KICKER} title="Book time" sub="Privattime eller TrackMan-bay. Velg tjeneste og tid på ett sted." />
    <Stabel>
      {melding === "betalt" && <InlineVarsel tone="ok">Betalingen er mottatt. Timen bekreftes om et øyeblikk og står under Mine timer. Du får også e-post.</InlineVarsel>}
      {melding === "avbrutt" && <InlineVarsel tone="warn">Betalingen ble avbrutt. Tiden er ikke reservert. Velg gjerne en ny tid.</InlineVarsel>}
      <Kolonner mal={kol(desk)}>
        <Stabel>
          <section aria-label="Første ledige time" className="pa-card" style={{ padding: 20, gap: 12 }}>
            <span className="kicker">Første ledige time</span>
            {forsteLedige ? <>
              <div style={{ font: "var(--type-title-m)", color: "var(--text-primary)" }}>{forsteLedige.ukedagKort.charAt(0).toUpperCase() + forsteLedige.ukedagKort.slice(1)} kl. {forsteLedige.kl}</div>
              <p style={muted}>
                {forsteLedige.serviceName} med {forsteLedige.coachNavn} · {datoKort(forsteLedige.datoIso)}. {harPakke
                  ? brukt ? "Klippene dine er brukt opp for perioden, så denne betales per time." : `Du har ${credits.creditsRemaining} klipp igjen.`
                  : "Uten coaching-pakke betales timen per gang."}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <KnappLenke href="/portal/booking/ny" iconRight={ArrowRight}>Velg tid</KnappLenke>
                <KnappLenke variant="ghost" href="/portal/booking/ny?betaling=1">Kjøp ekstra time med kort</KnappLenke>
              </div>
            </> : <TomTilstand icon={Check} title="Ingen ledige tider funnet" text="Prøv igjen senere, eller velg en tjeneste og se kalenderen selv."
              actions={<KnappLenke href="/portal/booking/ny">Book time</KnappLenke>} />}
            <Meta>GRATIS AVBESTILLING FRAM TIL {AVBESTILLING_FRIST_TIMER} TIMER FØR</Meta>
          </section>
        </Stabel>
        <Stabel>
          <KlippKort klipp={klipp} />
          <MineTimer timer={upcoming} />
        </Stabel>
      </Kolonner>
    </Stabel>
  </Side>;
}

/* ───────────────────────── /portal/booking/ny ───────────────────────── */

export type PH23NyProps = { data: BookingNyV2Data; dager: Dagsvalg[]; klipp: KlippData };

function pris(t: BookingNyV2Data["tjenester"][number], betaling: boolean): string {
  return betaling || t.prisOre > 0 ? kr(t.prisOre) : "1 klipp";
}

export function PH23Ny({ data, dager, klipp }: PH23NyProps) {
  const desk = useDesk();
  const betaling = data.modus === "betaling";
  const q = betaling ? "&betaling=1" : "";
  const detaljLenker = data.wizardBase.startsWith("/portal/");
  const valgt = data.tjenester.find((t) => t.id === data.valgtServiceId);
  const slug = valgt?.slug ?? "";
  const steg = data.aktivtSteg === 1 ? 0 : 1;
  const valgtDag = data.valgtDatoIso.slice(0, 10);
  const perCoach = new Map<string, { navn: string; slots: string[] }>();
  for (const s of data.slots) {
    const g = perCoach.get(s.coachId);
    if (g) g.slots.push(s.startIso); else perCoach.set(s.coachId, { navn: s.coachNavn, slots: [s.startIso] });
  }
  const sub = betaling
    ? data.betalingGrunn === "BRUKT_OPP" ? "Klippene er brukt opp for perioden. Denne timen betales med kort."
      : data.betalingGrunn === "VALGT" ? "Ekstra time mot betaling. Klippene dine røres ikke." : "Timen betales med kort. Du trenger ingen coaching-pakke."
    : `${data.creditsRemaining} av ${data.monthlyCredits} klipp igjen. Velg tjeneste og tid.`;

  return <Side max={1200}>
    <SideHode kicker={KICKER} title="Book time" sub={sub} />
    <Kolonner mal={kol(desk)}>
      <Stabel>
        <Steg aktiv={steg} />
        {data.isFree && !betaling && <InlineVarsel tone="warn" tittel="Klipp krever coaching-pakke.">
          Performance eller Performance Pro gir klipp hver måned. Du kan likevel <Link href={`${data.wizardBase}?betaling=1`} style={{ color: "inherit", textDecoration: "underline" }}>betale per time</Link> eller <Link href="/portal/meg/abonnement" style={{ color: "inherit", textDecoration: "underline" }}>se abonnement</Link>.
        </InlineVarsel>}

        {steg === 0 && <div role="group" aria-label="Tjeneste" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,240px),1fr))", gap: 8 }}>
          {data.tjenester.map((t) => {
            const paa = data.serviceParamSatt && t.id === data.valgtServiceId;
            return <Link key={t.id} href={`${data.wizardBase}?service=${t.slug}${data.datoParam ? `&dato=${data.datoParam}` : ""}${q}`} scroll={false} aria-current={paa ? "true" : undefined}
              style={{ textAlign: "left", padding: 16, minHeight: 44, borderRadius: 8, border: `1px solid ${paa ? "var(--border-ink)" : "var(--border-hairline)"}`, boxShadow: paa ? "inset 0 0 0 1px var(--border-ink)" : "none", background: "var(--surface-card)", display: "flex", flexDirection: "column", gap: 6, minWidth: 0, color: "var(--text-primary)", textDecoration: "none" }}>
              <span style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                <span style={{ font: "600 15px/1.3 var(--font-sans)", flex: 1, minWidth: 0 }}>{t.navn}</span>
                <span style={{ font: "600 15px/1 var(--font-mono)" }}>{pris(t, betaling)}</span>
              </span>
              <Meta>{t.varighetMin} MIN{t.stedNavn ? " · " + t.stedNavn.toUpperCase() : ""}{!betaling && t.prisOre <= 0 ? " · 1 KLIPP" : ""}</Meta>
              {t.beskrivelse && <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{t.beskrivelse}</span>}
            </Link>;
          })}
        </div>}

        {steg === 1 && valgt && <>
          <div className="pa-card" style={{ padding: "12px 16px", flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ font: "600 15px/1.3 var(--font-sans)", flex: "1 1 160px", minWidth: 0 }}>{valgt.navn}</span>
            <Meta>{valgt.varighetMin} MIN · {pris(valgt, betaling).toUpperCase()}</Meta>
            <KnappLenke variant="ghost" size="sm" icon={ArrowLeft} href={`${data.wizardBase}${betaling ? "?betaling=1" : ""}`}>Endre</KnappLenke>
          </div>
          <div className="pa-card" style={{ padding: 16, gap: 16 }}>
            <div role="group" aria-label="Dag" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(64px,1fr))", gap: 4 }}>
              {dager.map((d) => {
                const paa = d.iso === valgtDag;
                return <Link key={d.iso} href={`${data.wizardBase}?service=${slug}&dato=${d.iso}${q}`} scroll={false} aria-current={paa ? "date" : undefined}
                  style={{ height: 60, borderRadius: 8, border: `1px solid ${paa ? "var(--border-ink)" : "var(--border-hairline)"}`, background: paa ? "var(--primary)" : "var(--surface-card)", color: paa ? "var(--text-on-primary)" : "var(--text-primary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, minWidth: 0, textDecoration: "none" }}>
                  <span style={{ font: "500 11px/1 var(--font-sans)" }}>{d.ukedag}</span>
                  <span style={{ font: "600 14px/1 var(--font-mono)" }}>{d.dag}</span>
                  <span style={{ font: "500 10px/1 var(--font-mono)", opacity: 0.75 }}>{d.maaned}</span>
                </Link>;
              })}
            </div>
            <Meta>{datoLang(valgtDag).toUpperCase()}</Meta>
            {perCoach.size === 0
              ? <p style={muted}>Ingen ledige tider {datoLang(valgtDag).toLowerCase()}. Velg en annen dag.</p>
              : Array.from(perCoach.entries()).map(([coachId, g]) => <div key={coachId} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {detaljLenker ? <Link href={`/portal/booking/coach/${coachId}`} style={{ color: "inherit", textDecoration: "none", minHeight: 44, display: "inline-flex", alignItems: "center" }}><span className="kicker">{g.navn}</span></Link> : <span className="kicker">{g.navn}</span>}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {g.slots.map((s) => <Link key={s} className="pa-choice" style={{ font: "500 14px/1 var(--font-mono)", minHeight: 44, textDecoration: "none" }}
                    href={`${data.wizardBase}/bekreft?service=${slug}&start=${encodeURIComponent(s)}&coach=${coachId}${q}`}>{klokke(s)}</Link>)}
                </div>
              </div>)}
          </div>
        </>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <KnappLenke variant="ghost" icon={ArrowLeft} href={detaljLenker ? "/portal/booking" : data.wizardBase}>Tilbake</KnappLenke>
        </div>
        <Meta>GRATIS AVBESTILLING FRAM TIL {AVBESTILLING_FRIST_TIMER} TIMER FØR</Meta>
      </Stabel>
      {detaljLenker ? <KlippKort klipp={klipp} /> : null}
    </Kolonner>
  </Side>;
}

export function PH23IngenTjenester() {
  return <Side max={720}><SideHode kicker={KICKER} title="Book time" />
    <TomTilstand icon={Check} title="Ingen tjenester tilgjengelig" text="Ingen coaching-tjenester er aktive akkurat nå. Kontakt support@akgolf.no."
      actions={<KnappLenke variant="secondary" href="/portal/booking">Til booking</KnappLenke>} /></Side>;
}

/* ───────────────────────── /portal/booking/ny/bekreft ───────────────────────── */

export function PH23Bekreft({ data }: { data: BookingNyBekreftV2Data }) {
  const betaling = data.modus === "betaling";
  const router = useRouter();
  const [notat, setNotat] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, start] = useTransition();
  const bekreftetBase = data.bekreftetBase ?? "/portal/booking/bekreftet";

  function send() {
    setFeil(null);
    start(async () => {
      try {
        if (betaling) {
          const res = await opprettBookingMedKort({ serviceTypeId: data.serviceTypeId, coachId: data.coachId, startIso: data.startIso, notes: notat.trim() || undefined, barnId: data.barnId, retururlBase: data.barnId ? "/forelder/bookinger" : undefined });
          if (!res.ok) { setFeil(res.grunn); return; }
          window.location.href = res.url;
          return;
        }
        const r = await createCreditBooking({ serviceTypeId: data.serviceTypeId, coachId: data.coachId, start: data.startIso, notes: notat.trim() || undefined, barnId: data.barnId });
        router.push(`${bekreftetBase}?bookingId=${r.bookingId}`);
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Noe gikk galt.");
      }
    });
  }

  const rader = data.rader.map((r) => [r.label === "Økt-type" ? "Tjeneste" : r.label === "Dato/tid" ? "Tid" : r.label, r.label === "Kostnad" ? "1 klipp" : r.verdi, { mono: r.label === "Dato/tid" || r.label === "Varighet" || r.label === "Pris" || r.label === "Kostnad" }] as const);
  return <Side max={720}>
    <SideHode kicker={KICKER} title="Book time" />
    <Stabel>
      <Steg aktiv={2} />
      {!data.ledig && <InlineVarsel tone="signal" tittel="Tiden er tatt.">Noen andre booket den før deg. Gå tilbake og velg en annen tid.</InlineVarsel>}
      <div className="pa-card" style={{ padding: 16, gap: 16 }}>
        <Nokkelverdi items={rader} />
        <div>
          <div className="kicker" style={{ marginBottom: 8 }}>Betaling</div>
          <Nokkelverdi items={[["Betales med", betaling ? "Kort" : "Klipp", { mono: false, hint: betaling ? "SIKKER BETALING HOS STRIPE" : `${data.creditsRemaining} → ${data.saldoEtter} KLIPP IGJEN` }]]} />
        </div>
        {data.ledig && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label className="kicker" htmlFor="ph23-notat">Notat til coachen (valgfritt)</label>
          <div id="ph23-notat"><TekstOmrade value={notat} onChange={setNotat} placeholder="Hva vil du jobbe med? Spesielle ønsker?" /></div>
        </div>}
        {feil && <InlineVarsel tone="signal">{feil}</InlineVarsel>}
        <Meta>GRATIS AVBESTILLING FRAM TIL {AVBESTILLING_FRIST_TIMER} TIMER FØR</Meta>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "space-between" }}>
        <KnappLenke variant="ghost" icon={ArrowLeft} href={data.backHref}>Endre valg</KnappLenke>
        {data.ledig && <Knapp icon={betaling ? CreditCard : Check} loading={venter} loadingText={betaling ? "Åpner betaling …" : "Bekrefter …"} onClick={send}>{betaling ? "Til betaling" : "Bekreft booking"}</Knapp>}
      </div>
    </Stabel>
  </Side>;
}

/* ───────────────────────── /portal/booking/bekreftet ───────────────────────── */

export type PH23BekreftetProps = { linje: string; coachNavn: string | null; sted: string; varighetMin: number; kalenderUrl: string };

export function PH23Bekreftet({ d }: { d: PH23BekreftetProps }) {
  return <Side max={720}>
    <SideHode kicker={KICKER} title="Timen er booket" />
    <div className="pa-card" style={{ padding: 20, gap: 16 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}><StatusPille tone="ok">Bekreftet</StatusPille></div>
      <div style={{ font: "var(--type-title-m)", color: "var(--text-primary)" }}>{d.linje}</div>
      <Nokkelverdi items={[["Varighet", `${d.varighetMin} min`], ["Sted", d.sted, { mono: false }], ["Coach", d.coachNavn ?? "—", { mono: false }]]} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <a className="pa-btn pa-btn--secondary pa-btn--icon-l" href={d.kalenderUrl} target="_blank" rel="noopener noreferrer"><CalendarPlus size={18} aria-hidden />Legg i kalender</a>
        <KnappLenke variant="ghost" href="/portal/meg/bookinger">Se alle bookinger</KnappLenke>
        <KnappLenke variant="ghost" href="/portal/booking/ny">Book en til</KnappLenke>
      </div>
    </div>
  </Side>;
}

/* ───────────────────────── Avbestilling (delt) ───────────────────────── */

function useAvbestill() {
  const router = useRouter();
  const [venter, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const utfor = (id: string, ferdig: () => void) => {
    setFeil(null);
    start(async () => {
      try { await cancelBooking(id); ferdig(); router.refresh(); }
      catch (e) { setFeil(e instanceof Error ? e.message : "Kunne ikke avbestille."); }
    });
  };
  return { venter, feil, utfor };
}

function AvbestillDialog({ id, tittel, refusjon, apen, lukk }: { id: string; tittel: string; refusjon: boolean; apen: boolean; lukk: () => void }) {
  const { venter, feil, utfor } = useAvbestill();
  return <Dialogboks open={apen} title="Avbestille timen?" onClose={lukk}
    footer={<><Knapp variant="secondary" onClick={lukk} disabled={venter}>Behold timen</Knapp><Knapp variant="signal" loading={venter} loadingText="Avbestiller …" onClick={() => utfor(id, lukk)}>Avbestill</Knapp></>}>
    <p style={{ margin: 0 }}>{tittel}. {refusjon ? `Mer enn ${AVBESTILLING_FRIST_TIMER} timer til timen, så betalingen tilbakeføres.` : `Mindre enn ${AVBESTILLING_FRIST_TIMER} timer til timen, så betalingen tilbakeføres ikke.`}</p>
    {feil && <div style={{ marginTop: 12 }}><InlineVarsel tone="signal">{feil}</InlineVarsel></div>}
  </Dialogboks>;
}

/* ───────────────────────── /portal/booking/[bookingId] ───────────────────────── */

export function PH23Detalj({ data }: { data: BookingDetaljV2Data }) {
  const [apen, setApen] = useState(false);
  const s = STATUS[Object.keys(STATUS).find((k) => STATUS[k]!.tekst === data.statusLabel) ?? "PENDING"]!;
  return <Side max={720}>
    <SideHode kicker="Meg · Booking" title={data.tjeneste} actions={<StatusPille tone={s.tone}>{data.statusLabel}</StatusPille>} />
    <Stabel>
      <div className="pa-card" style={{ padding: 20, gap: 16 }}>
        <Nokkelverdi items={[
          ["Dato", data.dato, { mono: false }],
          ["Tid", data.tid, { hint: `${data.varighetMin} MIN` }],
          ["Sted", <Link key="s" href={`/portal/booking/anlegg/${data.stedId}`} style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>{data.sted}</Link>, { mono: false }],
          ["Coach", data.coachNavn && data.coachId ? <Link key="c" href={`/portal/booking/coach/${data.coachId}`} style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>{data.coachNavn}</Link> : (data.coachNavn ?? "—"), { mono: false }],
        ]} />
        {data.notat && <div><div className="kicker" style={{ marginBottom: 6 }}>Notat</div><p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-body)", textWrap: "pretty", overflowWrap: "anywhere" }}>{data.notat}</p></div>}
        {data.kanAvbestille && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {data.kanFaaRefusjon && <KnappLenke variant="secondary" icon={Move} href={`/portal/meg/bookinger/reschedule/${data.bookingId}`}>Flytt time</KnappLenke>}
          <Knapp variant="ghost" onClick={() => setApen(true)}>Avbestill</Knapp>
        </div>}
        {!data.kanFaaRefusjon && data.kanAvbestille && <Meta>MINDRE ENN {AVBESTILLING_FRIST_TIMER} TIMER IGJEN · INGEN FLYTTING ELLER TILBAKEFØRING</Meta>}
      </div>
      <div><KnappLenke variant="ghost" icon={ArrowLeft} href="/portal/meg/bookinger">Mine bookinger</KnappLenke></div>
    </Stabel>
    <AvbestillDialog id={data.bookingId} tittel={`${data.tjeneste} ${data.dato} ${data.tid}`} refusjon={data.kanFaaRefusjon} apen={apen} lukk={() => setApen(false)} />
  </Side>;
}

/* ───────────────────────── /portal/booking/coach/[coachId] ───────────────────────── */

export function PH23Coach({ data }: { data: BookingCoachV2Data }) {
  const fornavn = data.navn.split(" ")[0];
  return <Side max={720}>
    <SideHode kicker="Coach · AK Golf Academy" title={data.navn} sub={data.ambition ?? undefined} />
    <Stabel>
      <div className="pa-card" style={{ padding: 20, gap: 16 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", minWidth: 0 }}>
          <Initialer navn={data.navn} size={56} />
          <Nokkelverdi items={[["Økter sammen", String(data.fellesOkter)], ["E-post", data.epost, { mono: false }]]} />
        </div>
      </div>
      <section aria-label={`Book med ${fornavn}`} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="kicker">Tjenester</span>
        {data.tjenester.length === 0
          ? <TomTilstand icon={Check} title="Ingen bookbare tjenester" text={`${fornavn} har ingen bookbare tjenester akkurat nå. Send en melding for å avtale en time.`} />
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,240px),1fr))", gap: 8 }}>
            {data.tjenester.map((t) => <Link key={t.id} href={t.href} style={{ padding: 16, minHeight: 44, borderRadius: 8, border: hair, background: "var(--surface-card)", display: "flex", flexDirection: "column", gap: 6, minWidth: 0, color: "var(--text-primary)", textDecoration: "none" }}>
              <span style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span style={{ font: "600 15px/1.3 var(--font-sans)", flex: 1, minWidth: 0 }}>{t.navn}</span><span style={{ font: "600 15px/1 var(--font-mono)" }}>{t.prisTekst === "1 credit" ? "1 klipp" : t.prisTekst}</span></span>
              <Meta>{t.varighetMin} MIN</Meta>
              {t.beskrivelse && <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{t.beskrivelse}</span>}
            </Link>)}
          </div>}
      </section>
      {data.visProKrav && <InlineVarsel tone="warn" tittel="Klipp krever coaching-pakke.">Performance eller Performance Pro gir klipp hver måned. <Link href="/portal/meg/abonnement" style={{ color: "inherit", textDecoration: "underline" }}>Se abonnement</Link>.</InlineVarsel>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <KnappLenke iconRight={ArrowRight} href={data.wizardHref}>Velg tid og bekreft</KnappLenke>
        <KnappLenke variant="secondary" href={data.meldingHref}>Send melding i stedet</KnappLenke>
        <KnappLenke variant="ghost" icon={ArrowLeft} href="/portal/booking">Booking</KnappLenke>
      </div>
      <Meta>GRATIS AVBESTILLING FRAM TIL {AVBESTILLING_FRIST_TIMER} TIMER FØR</Meta>
    </Stabel>
  </Side>;
}

/* ───────────────────────── /portal/meg/bookinger ───────────────────────── */

export type PH23MineRad = {
  id: string; tjeneste: string; varighetMin: number; startIso: string; sted: string; status: string;
  betaling: string; kanFlytte: boolean; kanAvbestille: boolean; kanFaaRefusjon: boolean;
};
export type PH23MineProps = { kommende: PH23MineRad[]; historikk: PH23MineRad[]; feil: string | null; flyttet: boolean };

export function PH23Mine({ kommende, historikk, feil, flyttet }: PH23MineProps) {
  const [fane, setFane] = useState("kommende");
  const [cx, setCx] = useState<PH23MineRad | null>(null);
  const liste = fane === "kommende" ? kommende : historikk.slice(0, 20);
  return <Side max={720}>
    <SideHode kicker="Meg · Booking" title="Mine bookinger" sub={kommende.length > 0 ? `${kommende.length} kommende` : "Ingen planlagt"}
      actions={<KnappLenke icon={CalendarPlus} href="/portal/booking/ny">Ny booking</KnappLenke>} />
    <Stabel>
      {feil && <InlineVarsel tone="warn" tittel="Kunne ikke bytte tid.">{feil}</InlineVarsel>}
      {flyttet && !feil && <InlineVarsel tone="ok">Timen er flyttet.</InlineVarsel>}
      <Faner valgt={fane} onEndre={setFane} faner={[{ verdi: "kommende", navn: "Kommende", antall: kommende.length }, { verdi: "historikk", navn: "Historikk", antall: historikk.length }]} />
      {liste.length === 0
        ? <TomTilstand icon={CalendarPlus} title={fane === "kommende" ? "Ingen kommende bookinger" : "Ingen historikk"} text={fane === "kommende" ? "Book din første coaching-time og kom i gang." : "Gjennomførte og avbestilte bookinger vises her."}
          actions={fane === "kommende" ? <KnappLenke href="/portal/booking/ny">Book ny time</KnappLenke> : undefined} />
        : <div className="pa-card" style={{ padding: "4px 16px" }}>
          {liste.map((b, i) => <div key={b.id} style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: i ? hair : "none", paddingBottom: fane === "kommende" && b.kanAvbestille ? 12 : 0 }}>
            <Timerad href={`/portal/booking/${b.id}`} forste tittel={`${b.tjeneste} · ${b.varighetMin} min`} status={b.status}
              meta={`${datoKort(b.startIso).toUpperCase()} KL. ${klokke(b.startIso)} · ${b.sted.toUpperCase()} · ${b.betaling.toUpperCase()}`} />
            {fane === "kommende" && b.kanAvbestille && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {b.kanFlytte && <KnappLenke size="sm" variant="secondary" icon={Move} href={`/portal/meg/bookinger/reschedule/${b.id}`}>Flytt time</KnappLenke>}
              <Knapp size="sm" variant="ghost" onClick={() => setCx(b)}>Avbestill</Knapp>
              {!b.kanFaaRefusjon && <Meta>MINDRE ENN {AVBESTILLING_FRIST_TIMER} T IGJEN · INGEN FLYTTING</Meta>}
            </div>}
          </div>)}
        </div>}
    </Stabel>
    <AvbestillDialog id={cx?.id ?? ""} tittel={cx ? `${cx.tjeneste} ${datoKort(cx.startIso)} kl. ${klokke(cx.startIso)}` : ""} refusjon={cx?.kanFaaRefusjon ?? false} apen={!!cx} lukk={() => setCx(null)} />
  </Side>;
}

/* ───────────────────────── /portal/meg/bookinger/reschedule/[bookingId] ───────────────────────── */

export type PH23FlyttProps = {
  bookingId: string; tjeneste: string; naaTekst: string; meta: string; valgtDag: string; dager: Dagsvalg[];
  slots: { start: string; kl: string; coachId: string; coachNavn: string }[];
};

export function PH23Flytt({ p }: { p: PH23FlyttProps }) {
  const router = useRouter();
  const [valgt, setValgt] = useState<PH23FlyttProps["slots"][number] | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, start] = useTransition();
  const perCoach = new Map<string, PH23FlyttProps["slots"]>();
  for (const s of p.slots) perCoach.set(s.coachId, [...(perCoach.get(s.coachId) ?? []), s]);

  function flytt() {
    if (!valgt) return;
    setFeil(null);
    start(async () => {
      try {
        await rescheduleBooking({ bookingId: p.bookingId, newStartIso: valgt.start, newCoachId: valgt.coachId });
        router.push("/portal/meg/bookinger?ny=1");
      } catch (e) { setFeil(e instanceof Error ? e.message : "Noe gikk galt."); }
    });
  }

  return <Side max={720}>
    <SideHode kicker="Meg · Booking" title="Flytt time" sub={p.tjeneste} />
    <Stabel>
      <div className="pa-card" style={{ padding: 16, gap: 6 }}>
        <span className="kicker">Nå</span>
        <div style={{ font: "600 15px/1.3 var(--font-sans)" }}>{p.naaTekst}</div>
        <Meta>{p.meta}</Meta>
      </div>
      <InlineVarsel tone="info">Flytting er gratis fram til {AVBESTILLING_FRIST_TIMER} timer før start. Etter det kan tiden ikke endres.</InlineVarsel>
      <div className="pa-card" style={{ padding: 16, gap: 16 }}>
        <div role="group" aria-label="Ny dag" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(64px,1fr))", gap: 4 }}>
          {p.dager.map((d) => {
            const paa = d.iso === p.valgtDag;
            return <Link key={d.iso} href={`/portal/meg/bookinger/reschedule/${p.bookingId}?dato=${d.iso}`} scroll={false} aria-current={paa ? "date" : undefined}
              style={{ height: 60, borderRadius: 8, border: `1px solid ${paa ? "var(--border-ink)" : "var(--border-hairline)"}`, background: paa ? "var(--primary)" : "var(--surface-card)", color: paa ? "var(--text-on-primary)" : "var(--text-primary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, minWidth: 0, textDecoration: "none" }}>
              <span style={{ font: "500 11px/1 var(--font-sans)" }}>{d.ukedag}</span>
              <span style={{ font: "600 14px/1 var(--font-mono)" }}>{d.dag}</span>
              <span style={{ font: "500 10px/1 var(--font-mono)", opacity: 0.75 }}>{d.maaned}</span>
            </Link>;
          })}
        </div>
        <Meta>{datoLang(p.valgtDag).toUpperCase()}</Meta>
        {perCoach.size === 0
          ? <p style={muted}>Ingen ledige tider {datoLang(p.valgtDag).toLowerCase()}. Velg en annen dag.</p>
          : Array.from(perCoach.entries()).map(([id, sl]) => <div key={id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="kicker">{sl[0]!.coachNavn}</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {sl.map((s) => <button key={s.start} type="button" className="pa-choice" aria-pressed={valgt?.start === s.start} onClick={() => setValgt(s)} style={{ font: "500 14px/1 var(--font-mono)", minHeight: 44 }}>{s.kl}</button>)}
            </div>
          </div>)}
      </div>
      {feil && <InlineVarsel tone="signal">{feil}</InlineVarsel>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "space-between" }}>
        <KnappLenke variant="ghost" icon={ArrowLeft} href="/portal/meg/bookinger">Avbryt</KnappLenke>
        <Knapp icon={Check} disabled={!valgt} loading={venter} loadingText="Flytter …" onClick={flytt}>{valgt ? `Flytt til ${datoKort(p.valgtDag)} ${valgt.kl}` : "Velg ny tid"}</Knapp>
      </div>
    </Stabel>
  </Side>;
}
