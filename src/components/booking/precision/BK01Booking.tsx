"use client";

/**
 * BK-01 Velg tjeneste, med resten av offentlig booking (tid, deg, betal) i samme flyt.
 * Fasit: Claude Design 7d7c2994, ui_kits/booking/screens/BK.jsx (Flow, start = 0).
 * Data og handlinger er de samme som før: `hentLedigeDager` og `createBookingCheckout`.
 *
 * Avvik fra tegningen (se PR-beskrivelsen):
 *  - Betaling går til Stripe Checkout (omdirigering). Kortfelt og Vipps-valg finnes ikke i koden.
 *  - Telefon er påkrevd, som før: bookingen trenger den for å varsle ved kollisjon.
 *  - «Neste uke» finnes ikke: `hentLedigeDager` henter sju dager fram.
 */
import { useCallback, useMemo, useState } from "react";
import { ArrowRight, CalendarX, CircleAlert, Lock, LogIn, RotateCw } from "lucide-react";
import { hentLedigeDager, type LedigDag } from "@/app/(marketing)/booking/ledige-tider";
import { createBookingCheckout } from "@/app/(marketing)/booking/[slug]/bekreft/actions";
import { FeilTilstand, KnappLenke, LasterTilstand, Meta, TomTilstand } from "@/components/precision/pa";
import { Knapp } from "@/components/precision/pa";
import { SegmentertValg } from "@/components/precision/pa-a2";
import { Nokkelverdi, Skjemafelt } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import "@/styles/precision-athletics.css";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-a4.css";
import "@/styles/precision-bk.css";

export type BookingTjeneste = {
  slug: string;
  navn: string;
  coachNavn: string | null;
  pris: number;
  varighetMin: number;
  beskrivelse: string | null;
};

export type BookingAbonnement = { slug: string; navn: string; coachNavn: string | null; pris: number; beskrivelse: string | null };

export interface BK01Props {
  tjenester: BookingTjeneste[];
  abonnement: BookingAbonnement[];
  lokasjon: string;
  /** Kun for skjermprøven: starter flyten midt i (steg, valg og tilstand). Ikke brukt i appen. */
  forhandsvis?: { steg: number; slug: string; dager: LedigDag[]; dag?: string; kl?: string; tilstand?: "laster" | "feil"; skjema?: Partial<Felter>; feil?: Record<string, string> };
}

const STEG = ["Tjeneste", "Tid", "Deg", "Bekreft og betal"] as const;
const TITTEL = ["Velg tjeneste", "Velg tid", "Om deg", "Bekreft og betal"] as const;

/** Samme tallformat som tegningen: mellomrom som tusenskille. */
const kr = (v: number) => `${Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} kr`;
/** «Privattime» + 60 gir «Privattime 60 min». Navn som allerede bærer minuttene beholdes. */
const tittel = (t: BookingTjeneste) => (/\bmin\b/i.test(t.navn) ? t.navn : `${t.navn} ${t.varighetMin} min`);
const okMail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

function Ramme({ maks = 960, children }: { maks?: number; children: React.ReactNode }) {
  return <div className="pa-root bk" data-design="precision-athletics">
    <header className="bk__topp"><div className="bk__toppin" style={{ maxWidth: maks }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="bk__logo" src="/logos/logo-ak-golf-academy.svg" alt="AK Golf Academy" />
      <span style={{ flex: 1 }} /><Meta>BOOKING</Meta>
    </div></header>
    <main className="bk__innhold" style={{ maxWidth: maks }}>{children}</main>
  </div>;
}

function Steg({ i }: { i: number }) {
  return <ol className="bk__steg" aria-label="Steg">{STEG.map((s, j) =>
    <li key={s} aria-current={j === i ? "step" : undefined} data-naa={j === i ? "" : undefined} data-ferdig={j < i ? "" : undefined}>
      <span>{j + 1}</span>{s.toUpperCase()}
    </li>)}</ol>;
}

type Felter = { navn: string; epost: string; tlf: string; barn: boolean; spiller: string };

export function BK01Booking({ tjenester, abonnement, lokasjon, forhandsvis: f }: BK01Props) {
  const [steg, setSteg] = useState(f?.steg ?? 0);
  const [slug, setSlug] = useState<string | null>(f?.slug ?? null);
  const [visning, setVisning] = useState<"Dag" | "Uke">("Uke");
  const [dager, setDager] = useState<LedigDag[]>(f?.dager ?? []);
  const [laster, setLaster] = useState(f?.tilstand === "laster");
  const [lastefeil, setLastefeil] = useState(f?.tilstand === "feil");
  const [dag, setDag] = useState<string | null>(f?.dag ?? null);
  const [kl, setKl] = useState<string | null>(f?.kl ?? null);
  const [meg, setMeg] = useState<Felter>({ navn: "", epost: "", tlf: "", barn: false, spiller: "", ...f?.skjema });
  const [vilkar, setVilkar] = useState(false);
  const [feil, setFeil] = useState<Record<string, string>>(f?.feil ?? {});
  const [sender, setSender] = useState(false);
  const [betalfeil, setBetalfeil] = useState<string | null>(null);

  const tj = useMemo(() => tjenester.find((t) => t.slug === slug) ?? null, [tjenester, slug]);
  const valgtDag = useMemo(() => dager.find((d) => d.dd === dag) ?? null, [dager, dag]);
  const tid = useMemo(() => valgtDag?.tider.find((t) => t.kl === kl) ?? null, [valgtDag, kl]);
  const harTider = dager.some((d) => d.tider.length > 0);

  const hentDager = useCallback(async (s: string) => {
    setLaster(true); setLastefeil(false);
    try { setDager(await hentLedigeDager(s)); } catch { setDager([]); setLastefeil(true); } finally { setLaster(false); }
  }, []);

  const velg = (s: string) => { setSlug(s); setDag(null); setKl(null); setFeil({}); };

  const send = async () => {
    if (!tj || !tid) return;
    setSender(true); setBetalfeil(null);
    const res = await createBookingCheckout({
      slug: tj.slug, start: tid.startIso, coachId: tid.coachId,
      name: meg.navn.trim(), email: meg.epost.trim(), phone: meg.tlf.trim(),
      notes: meg.barn ? `Booker for barn: ${meg.spiller.trim()}` : "",
    });
    if (res.ok) { window.location.href = res.url; return; }
    setSender(false); setBetalfeil(res.error);
  };

  const neste = async () => {
    const x: Record<string, string> = {};
    if (steg === 0 && !tj) x.svc = "Velg en tjeneste.";
    if (steg === 1 && !tid) x.slot = "Velg et ledig tidspunkt.";
    if (steg === 2) {
      if (!meg.navn.trim()) x.navn = "Skriv fullt navn.";
      if (!okMail(meg.epost)) x.epost = "Skriv en gyldig e-postadresse. Bekreftelsen sendes dit.";
      if (meg.tlf.trim().length < 5) x.tlf = "Skriv et telefonnummer vi kan nå deg på.";
      if (meg.barn && !meg.spiller.trim()) x.spiller = "Skriv navnet på spilleren du booker for.";
    }
    if (steg === 3 && !vilkar) x.vilkar = "Du må godta vilkårene for å betale.";
    setFeil(x);
    if (Object.keys(x).length) return;
    if (steg === 3) { await send(); return; }
    if (steg === 0) { setSteg(1); await hentDager(tj!.slug); return; }
    setSteg(steg + 1);
  };

  const tilbake = () => { setBetalfeil(null); setSteg(steg - 1); };

  if (tjenester.length === 0) {
    return <Ramme maks={640}>
      <TomTilstand icon={CalendarX} title="Ingen tjenester å booke akkurat nå" text="Er du allerede spiller, booker du i PlayerHQ." actions={<KnappLenke icon={LogIn} href="/auth/login">Logg inn</KnappLenke>} />
    </Ramme>;
  }

  if (steg === 1 && laster) return <Ramme><LasterTilstand text="Henter ledige tider …" /></Ramme>;
  if (steg === 1 && lastefeil && tj) {
    return <Ramme><FeilTilstand icon={CircleAlert} title="Bookingen kunne ikke lastes" text="Ingen time er booket og ingenting er trukket. Prøv igjen."
      code="FEIL · BOOKING" retry={<Knapp variant="secondary" icon={RotateCw} onClick={() => void hentDager(tj.slug)}>Prøv igjen</Knapp>} /></Ramme>;
  }

  const oppsummering = <>
    <span className="kicker">Din booking</span>
    <Nokkelverdi items={[
      ["Tjeneste", tj ? tittel(tj) : null, { mono: false }],
      ["Tid", tid && valgtDag ? `${valgtDag.dw} ${valgtDag.dd} · ${tid.kl}` : null],
      ["Pris", tj ? kr(tj.pris) : null, tj ? { hint: "FAST PRIS · SERVICETYPE" } : undefined],
    ]} />
  </>;

  let innhold: React.ReactNode = null;
  if (steg === 0) {
    innhold = <>
      <div role="radiogroup" aria-label="Tjeneste" className="bk__tjenester">
        {tjenester.map((x) => <button key={x.slug} type="button" role="radio" aria-checked={x.slug === slug} className="bk__valg" onClick={() => velg(x.slug)}>
          <span className="bk__valg-rad"><span className="bk__valg-navn">{tittel(x)}</span><span className="bk__valg-pris">{kr(x.pris)}</span></span>
          {x.beskrivelse && <span className="bk__valg-tekst">{x.beskrivelse}</span>}
        </button>)}
      </div>
      <Meta>PRISER FRA TJENESTELISTEN</Meta>
      {abonnement.length > 0 && <div className="bk__abo">
        <span className="kicker">Fast oppfølging</span>
        <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{abonnement.map((a) => `${a.navn} ${kr(a.pris)}`).join(" · ")}. Abonnement avtales med coachen.</span>
        <div><KnappLenke variant="secondary" href="/kontakt">Ta kontakt om abonnement</KnappLenke></div>
      </div>}
    </>;
  }
  if (steg === 1) {
    innhold = !harTider
      ? <TomTilstand icon={CalendarX} title="Ingen ledige tider denne uka" text="Velg en annen tjeneste, eller prøv igjen senere." actions={<Knapp variant="secondary" onClick={() => setSteg(0)}>Velg tjeneste</Knapp>} />
      : <>
        <div className="bk__rad">
          <SegmentertValg label="Visning" value={visning} options={[{ id: "Dag", label: "Dag" }, { id: "Uke", label: "Uke" }]} onChange={setVisning} />
          <Meta>{dager[0]?.dd} – {dager[dager.length - 1]?.dd}</Meta>
        </div>
        {visning === "Uke"
          ? <div className="bk__uke">{dager.map((d) => <div key={d.dd} className="bk__dag">
            <span className="bk__dag-navn">{d.dw.toUpperCase()} {d.dd}</span>
            {d.tider.length ? d.tider.map((t) => <button key={t.startIso} type="button" className="bk__tid" aria-pressed={dag === d.dd && kl === t.kl} onClick={() => { setDag(d.dd); setKl(t.kl); }}>{t.kl}</button>) : <Meta>—</Meta>}
          </div>)}</div>
          : <>
            <div className="bk__pills">{dager.map((d) => <button key={d.dd} type="button" className="pa-choice" aria-pressed={d.dd === dag} onClick={() => { setDag(d.dd); setKl(null); }}>{d.dw} {d.dd}</button>)}</div>
            {valgtDag ? (valgtDag.tider.length
              ? <div className="bk__dagliste">{valgtDag.tider.map((t) => <button key={t.startIso} type="button" className="bk__tidrad" aria-pressed={kl === t.kl} onClick={() => setKl(t.kl)}>
                <span style={{ font: "600 15px/1 var(--font-mono)" }}>{t.kl}</span>
                <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{tj?.coachNavn ? `${tj.coachNavn} · ` : ""}{lokasjon}</span>
              </button>)}</div>
              : <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen ledige tider denne dagen.</p>)
              : <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Velg en dag.</p>}
          </>}
        {feil.slot && <InlineVarsel tone="warn">{feil.slot}</InlineVarsel>}
      </>;
  }
  if (steg === 2) {
    innhold = <div className="bk__skjema">
      <Skjemafelt label="Fullt navn" required error={feil.navn}><input className="a4-input bk__input" aria-label="Fullt navn" value={meg.navn} autoComplete="name" onChange={(e) => setMeg({ ...meg, navn: e.target.value })} /></Skjemafelt>
      <Skjemafelt label="E-post" required error={feil.epost}><input className="a4-input bk__input" aria-label="E-post" type="email" value={meg.epost} autoComplete="email" onChange={(e) => setMeg({ ...meg, epost: e.target.value })} /></Skjemafelt>
      <Skjemafelt label="Telefon" required error={feil.tlf}><input className="a4-input a4-input--mono bk__input" aria-label="Telefon" type="tel" value={meg.tlf} autoComplete="tel" onChange={(e) => setMeg({ ...meg, tlf: e.target.value })} /></Skjemafelt>
      <label className="pa-check"><input type="checkbox" checked={meg.barn} onChange={(e) => setMeg({ ...meg, barn: e.target.checked })} />
        <span className="pa-check__box" aria-hidden>{meg.barn && <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>}</span>
        <span>Jeg booker for et barn under 18</span></label>
      {meg.barn && <Skjemafelt label="Spillerens navn" required error={feil.spiller}><input className="a4-input bk__input" aria-label="Spillerens navn" value={meg.spiller} onChange={(e) => setMeg({ ...meg, spiller: e.target.value })} /></Skjemafelt>}
    </div>;
  }
  if (steg === 3) {
    innhold = <div className="bk__skjema">
      <Meta>DU SENDES TIL STRIPE FOR Å BETALE MED KORT</Meta>
      <label className="pa-check"><input type="checkbox" checked={vilkar} onChange={(e) => setVilkar(e.target.checked)} />
        <span className="pa-check__box" aria-hidden>{vilkar && <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>}</span>
        <span>Jeg godtar vilkårene. Avbestilling senere enn 24 timer før refunderes ikke.</span></label>
      {feil.vilkar && <InlineVarsel tone="warn">{feil.vilkar}</InlineVarsel>}
      {betalfeil && <InlineVarsel tone="signal">{betalfeil}</InlineVarsel>}
    </div>;
  }

  return <Ramme>
    <Steg i={steg} />
    <h1 className="bk__h1">{TITTEL[steg]}</h1>
    <div className="bk__kolonner">
      <div className="bk__stabel">{innhold}{feil.svc && <InlineVarsel tone="warn">{feil.svc}</InlineVarsel>}</div>
      <div className="pa-card bk__sammendrag" style={{ display: "flex", flexDirection: "column" }}>{oppsummering}</div>
    </div>
    <div className="bk__knapper">
      {steg > 0 && <Knapp variant="ghost" onClick={tilbake}>Tilbake</Knapp>}
      <Knapp icon={steg === 3 ? Lock : ArrowRight} loading={sender || (steg === 0 && laster)} loadingText="Sender deg til betaling …" onClick={() => void neste()}>
        {steg === 3 && tj ? `Betal ${kr(tj.pris)}` : "Fortsett"}
      </Knapp>
    </div>
  </Ramme>;
}

