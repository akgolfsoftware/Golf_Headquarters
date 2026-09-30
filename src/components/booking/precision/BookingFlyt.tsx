"use client";

/**
 * BK-01 og BK-02: offentlig booking i Precision Athletics, fire steg på én
 * adresse (tjeneste, tid, deg, bekreft og betal). Tegning: Claude Design
 * 7d7c2994, ui_kits/booking/screens/BK.jsx.
 *
 * Datalogikk er uendret fra MarkedBookingV2: ledige dager fra `hentLedigeDager`,
 * betaling via `createBookingCheckout` (Stripe Checkout). Ingen ventestatus:
 * bookingen bekreftes automatisk når tiden er ledig og betalingen er gjennomført
 * (beslutninger.md §BOOKING BEKREFTES AUTOMATISK).
 *
 * Avvik fra tegningen står i PR-beskrivelsen: betalingsmåte og kortfelt tegnes
 * ikke (Stripe Checkout tar betalingen på neste side), telefon er påkrevd
 * (Booking krever den), og abonnementene har et eget kort med kontaktlenke.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarX, ListChecks, Lock, RefreshCw } from "lucide-react";
import { Knapp, KnappLenke, Meta, FeilTilstand, LasterTilstand, TomTilstand } from "@/components/precision/pa";
import { hentLedigeDager, type LedigDag } from "@/app/(marketing)/booking/ledige-tider";
import { createBookingCheckout, type BookingFormInput, type BookingResult } from "@/app/(marketing)/booking/[slug]/bekreft/actions";
import { BookingRamme } from "./BookingRamme";
import { Avkryssing, Nokkelverdi, Segment, Skjemafelt, Tekstinput, Varsel } from "./felt";

export type BkTjeneste = {
  slug: string;
  navn: string;
  coach: string | null;
  pris: number;
  varighetMin: number;
  beskrivelse: string | null;
};

export type BkAbonnement = {
  slug: string;
  navn: string;
  pris: number;
  beskrivelse: string | null;
};

/** Forhåndsvalg. Brukes av `?tjeneste=` (avbrutt betaling) og av skjermprøven. */
export type BkStart = {
  steg?: 0 | 1 | 2 | 3;
  slug?: string;
  dag?: string;
  kl?: string;
  dager?: LedigDag[];
  dagerStatus?: "ok" | "laster" | "feil";
  navn?: string;
  epost?: string;
  tlf?: string;
  barn?: boolean;
  spiller?: string;
  vilkar?: boolean;
  sendefeil?: string;
};

export interface BookingFlytProps {
  tjenester: BkTjeneste[];
  abonnement: BkAbonnement[];
  lokasjon: string;
  startSlug?: string | null;
  start?: BkStart;
  hentDager?: (slug: string) => Promise<LedigDag[]>;
  betal?: (input: BookingFormInput) => Promise<BookingResult>;
}

const STEG = ["Tjeneste", "Tid", "Deg", "Bekreft og betal"] as const;
const TITLER = ["Velg tjeneste", "Velg tid", "Om deg", "Bekreft og betal"] as const;

/** Tusenskille med hardt mellomrom. */
const kr = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} kr`;
const okEpost = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

export function BookingFlyt({
  tjenester, abonnement, lokasjon, startSlug, start,
  hentDager = hentLedigeDager, betal = createBookingCheckout,
}: BookingFlytProps) {
  const forvalgt = start?.slug ?? (startSlug && tjenester.some((t) => t.slug === startSlug) ? startSlug : null);
  const [steg, setSteg] = useState<number>(start?.steg ?? (forvalgt ? 1 : 0));
  const [slug, setSlug] = useState<string | null>(forvalgt);
  const [dager, setDager] = useState<LedigDag[]>(start?.dager ?? []);
  const [status, setStatus] = useState<"ok" | "laster" | "feil">(start?.dagerStatus ?? (forvalgt && !start?.dager ? "laster" : "ok"));
  const [visning, setVisning] = useState<"Uke" | "Dag">("Uke");
  const [dd, setDd] = useState<string | null>(start?.dag ?? null);
  const [kl, setKl] = useState<string | null>(start?.kl ?? null);
  const [navn, setNavn] = useState(start?.navn ?? "");
  const [epost, setEpost] = useState(start?.epost ?? "");
  const [tlf, setTlf] = useState(start?.tlf ?? "");
  const [barn, setBarn] = useState(start?.barn ?? false);
  const [spiller, setSpiller] = useState(start?.spiller ?? "");
  const [vilkar, setVilkar] = useState(start?.vilkar ?? false);
  const [feil, setFeil] = useState<Record<string, string>>({});
  const [sender, setSender] = useState(false);
  const [sendefeil, setSendefeil] = useState<string | null>(start?.sendefeil ?? null);
  const [beskjed, setBeskjed] = useState("");

  const tittelRef = useRef<HTMLHeadingElement | null>(null);
  const forsteGang = useRef(true);
  const oppslag = useRef(0);

  const tj = useMemo(() => tjenester.find((t) => t.slug === slug) ?? null, [tjenester, slug]);
  const dag = useMemo(() => dager.find((d) => d.dd === dd) ?? null, [dager, dd]);
  const tid = useMemo(() => dag?.tider.find((t) => t.kl === kl) ?? null, [dag, kl]);
  const harTider = dager.some((d) => d.tider.length > 0);
  const tidTekst = dag && kl ? `${dag.dw} ${dag.dd} · ${kl}` : null;

  const lastDager = useCallback(async (s: string) => {
    const mitt = ++oppslag.current;
    setStatus("laster");
    setBeskjed("Henter ledige tider.");
    try {
      const d = await hentDager(s);
      if (mitt !== oppslag.current) return;
      setDager(d);
      setStatus("ok");
      setBeskjed("Velg tid.");
    } catch {
      if (mitt !== oppslag.current) return;
      setDager([]);
      setStatus("feil");
    }
  }, [hentDager]);

  // Avbrutt betaling sender kunden hit med ?tjeneste=slug: last tidene for den.
  const startet = useRef(false);
  useEffect(() => {
    if (startet.current) return;
    startet.current = true;
    if (forvalgt && !start?.dager && start?.dagerStatus !== "feil") void lastDager(forvalgt);
  }, [forvalgt, start, lastDager]);

  useEffect(() => {
    if (forsteGang.current) { forsteGang.current = false; return; }
    tittelRef.current?.focus();
    window.scrollTo?.({ top: 0 });
  }, [steg]);

  function velgTjeneste(s: string) {
    if (s !== slug) { setDd(null); setKl(null); setDager([]); }
    setSlug(s);
    setFeil({});
  }

  async function neste() {
    const x: Record<string, string> = {};
    if (steg === 0 && !tj) x.svc = "Velg en tjeneste.";
    if (steg === 1 && !tid) x.slot = "Velg et ledig tidspunkt.";
    if (steg === 2) {
      if (!navn.trim()) x.navn = "Skriv fullt navn.";
      if (!okEpost(epost.trim())) x.epost = "Skriv en gyldig e-postadresse. Kvitteringen sendes dit.";
      if (tlf.trim().length < 5) x.tlf = "Skriv et telefonnummer vi kan nå deg på.";
      if (barn && !spiller.trim()) x.spiller = "Skriv navnet på spilleren du booker for.";
    }
    if (steg === 3 && !vilkar) x.vilkar = "Du må godta vilkårene for å betale.";
    setFeil(x);
    if (Object.keys(x).length) { setBeskjed(Object.values(x)[0]); return; }

    if (steg === 0 && tj) {
      setSteg(1);
      if (dager.length === 0 || status === "feil") void lastDager(tj.slug);
      return;
    }
    if (steg < 3) { setSteg(steg + 1); return; }

    if (!tj || !tid) return;
    setSender(true);
    setSendefeil(null);
    const res = await betal({
      slug: tj.slug,
      start: tid.startIso,
      coachId: tid.coachId,
      name: navn.trim(),
      email: epost.trim(),
      phone: tlf.trim(),
      notes: barn ? `Booking for barn: ${spiller.trim()}` : "",
    });
    if (res.ok) { window.location.href = res.url; return; }
    setSender(false);
    setSendefeil(res.error);
    setBeskjed(res.error);
  }

  const sammendrag = (
    <div className="pa-card bk-sammendrag">
      <span className="kicker">Din booking</span>
      <Nokkelverdi items={[
        ["Tjeneste", tj ? `${tj.navn} · ${tj.varighetMin} min` : null, { mono: false }],
        ["Tid", tidTekst],
        ["Pris", tj ? kr(tj.pris) : null],
      ]} />
    </div>
  );

  let innhold: React.ReactNode;
  if (steg === 0) {
    innhold = tjenester.length === 0 ? (
      <TomTilstand icon={ListChecks} title="Ingen tjenester er åpne for booking akkurat nå"
        text="Send en e-post til post@akgolf.no, så finner vi en tid." />
    ) : (
      <>
        <div role="radiogroup" aria-label="Tjeneste" className="bk-tjenester">
          {tjenester.map((t) => (
            <button key={t.slug} type="button" role="radio" aria-checked={t.slug === slug} className="bk-valg" onClick={() => velgTjeneste(t.slug)}>
              <span className="bk-valg__topp">
                <span className="bk-valg__navn">{t.navn}{t.coach ? ` · ${t.coach}` : ""}</span>
                <span className="bk-valg__pris">{kr(t.pris)}</span>
              </span>
              <Meta>{t.varighetMin} MIN</Meta>
              {t.beskrivelse && <span className="bk-valg__tekst">{t.beskrivelse}</span>}
            </button>
          ))}
        </div>
        {abonnement.length > 0 && (
          <div className="pa-card pa-card--pad" style={{ gap: 10 }}>
            <span className="kicker">Abonnement</span>
            <span className="bk-tekst">Fast oppfølging hver måned. Du booker ingen tid her: øktene bookes i PlayerHQ.</span>
            <Nokkelverdi items={abonnement.map((a) => [a.navn, `${kr(a.pris)} per måned`, { mono: false, hint: a.beskrivelse ?? undefined }] as const)} />
            <div><KnappLenke variant="secondary" href="/kontakt" iconRight={ArrowRight}>Ta kontakt om abonnement</KnappLenke></div>
          </div>
        )}
      </>
    );
  } else if (steg === 1) {
    if (status === "laster") innhold = <LasterTilstand text="Henter ledige tider …" />;
    else if (status === "feil") {
      innhold = <FeilTilstand icon={RefreshCw} title="Bookingen kunne ikke lastes"
        text="Ingen time er booket og ingenting er trukket. Prøv igjen."
        retry={<Knapp variant="secondary" icon={RefreshCw} onClick={() => slug && void lastDager(slug)}>Prøv igjen</Knapp>} />;
    } else if (!harTider) {
      innhold = <TomTilstand icon={CalendarX} title="Ingen ledige tider de neste sju dagene"
        text="Velg en annen tjeneste, eller prøv igjen senere."
        actions={<Knapp variant="secondary" onClick={() => setSteg(0)}>Velg tjeneste</Knapp>} />;
    } else {
      const førsteDd = dager[0]?.dd, sisteDd = dager[dager.length - 1]?.dd;
      const coachTekst = [tj?.coach, lokasjon].filter(Boolean).join(" · ");
      innhold = (
        <>
          <div className="bk-rad" style={{ gap: 12 }}>
            <Segment label="Visning" valg={["Dag", "Uke"] as const} verdi={visning} onEndre={setVisning} />
            <Meta>NESTE 7 DAGER · {førsteDd}–{sisteDd}</Meta>
          </div>
          {visning === "Uke" ? (
            <div className="bk-uke">
              {dager.map((d) => (
                <div key={d.dd} className="bk-uke__dag">
                  <span className="bk-uke__navn">{d.dw.toUpperCase()} {d.dd}</span>
                  {d.tider.length ? d.tider.map((t) => (
                    <button key={t.startIso} type="button" className="bk-tid" aria-pressed={dd === d.dd && kl === t.kl} onClick={() => { setDd(d.dd); setKl(t.kl); setFeil({}); }}>{t.kl}</button>
                  )) : <Meta>—</Meta>}
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="bk-rad" style={{ gap: 6 }}>
                {dager.map((d) => (
                  <button key={d.dd} type="button" className="pa-choice" aria-pressed={d.dd === (dd ?? dager.find((x) => x.tider.length)?.dd)} onClick={() => { setDd(d.dd); setKl(null); }}>{d.dw} {d.dd}</button>
                ))}
              </div>
              {(() => {
                const aktiv = dager.find((d) => d.dd === (dd ?? dager.find((x) => x.tider.length)?.dd));
                return aktiv && aktiv.tider.length ? (
                  <div className="bk-slots">
                    {aktiv.tider.map((t) => (
                      <button key={t.startIso} type="button" className="bk-slot" aria-pressed={kl === t.kl && dd === aktiv.dd} onClick={() => { setDd(aktiv.dd); setKl(t.kl); setFeil({}); }}>
                        <span className="bk-slot__kl">{t.kl}</span>
                        <span className="bk-slot__meta">{coachTekst}</span>
                      </button>
                    ))}
                  </div>
                ) : <p className="bk-tekst">Ingen ledige tider denne dagen.</p>;
              })()}
            </>
          )}
          {feil.slot && <Varsel tone="warn">{feil.slot}</Varsel>}
        </>
      );
    }
  } else if (steg === 2) {
    innhold = (
      <div className="bk-stabel bk-smalt">
        <Skjemafelt label="Fullt navn" required error={feil.navn}><Tekstinput value={navn} onChange={(e) => setNavn(e.target.value)} autoComplete="name" /></Skjemafelt>
        <Skjemafelt label="E-post" required error={feil.epost}><Tekstinput type="email" value={epost} onChange={(e) => setEpost(e.target.value)} autoComplete="email" /></Skjemafelt>
        <Skjemafelt label="Telefon" required error={feil.tlf} hint="Vi ringer bare hvis timen må flyttes."><Tekstinput mono type="tel" value={tlf} onChange={(e) => setTlf(e.target.value)} autoComplete="tel" /></Skjemafelt>
        <Avkryssing checked={barn} onChange={(e) => setBarn(e.target.checked)} label="Jeg booker for et barn under 18" />
        {barn && <Skjemafelt label="Spillerens navn" required error={feil.spiller}><Tekstinput value={spiller} onChange={(e) => setSpiller(e.target.value)} /></Skjemafelt>}
      </div>
    );
  } else {
    innhold = (
      <div className="bk-stabel bk-smalt">
        <Varsel tone="info">Du betaler på neste side, hos Stripe. Vi ser aldri kortnummeret ditt.</Varsel>
        <Avkryssing checked={vilkar} onChange={(e) => setVilkar(e.target.checked)}
          label={<>Jeg godtar <Link href="/vilkar" target="_blank" rel="noopener" style={{ color: "var(--link)", textDecoration: "underline" }}>vilkårene</Link>. Gratis avbestilling fram til 24 timer før.</>} />
        {feil.vilkar && <Varsel tone="warn">{feil.vilkar}</Varsel>}
        {sendefeil && <Varsel tone="signal">{sendefeil}</Varsel>}
      </div>
    );
  }

  const skjulKnapper = (steg === 0 && tjenester.length === 0) || (steg === 1 && status !== "ok");

  return (
    <BookingRamme>
      <ol aria-label="Steg" className="bk-steg">
        {STEG.map((s, j) => (
          <li key={s} className="bk-steg__punkt" data-naa={j === steg ? "" : undefined} data-ferdig={j < steg ? "" : undefined} aria-current={j === steg ? "step" : undefined}>
            <span className="bk-steg__nr">{j + 1}</span>{s}
          </li>
        ))}
      </ol>
      <h1 ref={tittelRef} tabIndex={-1} className="bk-tittel">{TITLER[steg]}</h1>
      <div className={`bk-kols${steg > 0 && tj ? " bk-kols--sammendrag" : ""}`}>
        <div className="bk-stabel">{innhold}{feil.svc && <Varsel tone="warn">{feil.svc}</Varsel>}</div>
        {steg > 0 && tj && sammendrag}
      </div>
      {!skjulKnapper && (
        <div className="bk-rad">
          {steg > 0 && <Knapp variant="ghost" onClick={() => setSteg(steg - 1)}>Tilbake</Knapp>}
          <Knapp icon={steg === 3 ? Lock : ArrowRight} loading={sender} loadingText="Sender deg til Stripe …" onClick={() => void neste()}>
            {steg === 3 && tj ? `Betal ${kr(tj.pris)}` : "Fortsett"}
          </Knapp>
        </div>
      )}
      <span className="pa-sr" role="status" aria-live="polite">{beskjed}</span>
    </BookingRamme>
  );
}
