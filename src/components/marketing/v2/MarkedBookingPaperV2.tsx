"use client";

/* AK Golf HQ — MARKEDSSIDE: offentlig booking (/booking), PP-1.7.
   Fasit: `designsystem/paper/fase1/booking.html`. Stilene er portert dit
   («booking-paper.css»), markupen her følger fasitens struktur og rekkefølge:
   topp → hero med fakta → steg 1 tjeneste → steg-flyt (tid/deg/bekreft) →
   spørsmål → sticky dokk.

   ÉN AVVIK FRA FASITEN, bestilt av Anders 10.08.2026: fasiten avslutter med en
   forespørsel («du betaler ikke nå»). Appen beholder Stripe, så siste steg går
   til betaling. All tekst som lovet det motsatte er skrevet om — teksten her er
   fasiten sin, tilpasset at kunden faktisk betaler før timen.

   LÅST (Anders 01.08.2026): kun coachingtjenester. Simulatortid selges ikke. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { hentLedigeDager, type LedigDag } from "@/app/(marketing)/booking/ledige-tider";
import { createBookingCheckout } from "@/app/(marketing)/booking/[slug]/bekreft/actions";
import "./booking-paper.css";

/* ── Datakontrakter (serialisert i page.tsx) ───────────── */
export type PaperTjeneste = {
  slug: string;
  navn: string;
  coachNavn: string | null;
  pris: number;
  enhet: string;
  varighetMin: number;
  beskrivelse: string | null;
};

export type PaperAbonnement = {
  slug: string;
  navn: string;
  coachNavn: string | null;
  pris: number;
  beskrivelse: string | null;
};

export interface MarkedBookingPaperV2Props {
  tjenester: PaperTjeneste[];
  abonnement: PaperAbonnement[];
  lokasjon: string;
}

type Steg = "tjeneste" | "tid" | "deg" | "bekreft";

const STEG: { k: Steg; n: string }[] = [
  { k: "tjeneste", n: "Tjeneste" },
  { k: "tid", n: "Tid" },
  { k: "deg", n: "Deg" },
  { k: "bekreft", n: "Bekreft" },
];

/* Tusenskille med hardt mellomrom, som fasiten. */
function kr(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function MarkedBookingPaperV2({
  tjenester,
  abonnement,
  lokasjon,
}: MarkedBookingPaperV2Props) {
  const [steg, setSteg] = useState<Steg>("tjeneste");
  const [valgtSlug, setValgtSlug] = useState<string | null>(null);
  const [dager, setDager] = useState<LedigDag[]>([]);
  const [lasterDager, setLasterDager] = useState(false);
  const [valgtDag, setValgtDag] = useState<string | null>(null);
  const [valgtTid, setValgtTid] = useState<string | null>(null);

  const [navn, setNavn] = useState("");
  const [epost, setEpost] = useState("");
  const [tlf, setTlf] = useState("");
  const [alder, setAlder] = useState("");
  const [hcp, setHcp] = useState("");
  const [notat, setNotat] = useState("");
  const [foresatt, setForesatt] = useState(false);
  const [vilkar, setVilkar] = useState(false);

  const [feil, setFeil] = useState<Record<string, string>>({});
  const [sender, setSender] = useState(false);
  const [sendefeil, setSendefeil] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [beskjed, setBeskjed] = useState("");

  const bookRef = useRef<HTMLElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const visToast = useCallback((t: string) => {
    setToast(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const tj = useMemo(
    () => tjenester.find((t) => t.slug === valgtSlug) ?? null,
    [tjenester, valgtSlug],
  );
  const dag = useMemo(() => dager.find((d) => d.dd === valgtDag) ?? null, [dager, valgtDag]);
  const tid = useMemo(
    () => dag?.tider.find((t) => t.kl === valgtTid) ?? null,
    [dag, valgtTid],
  );

  const erUngdom = useMemo(() => {
    const a = parseInt(alder, 10);
    return !isNaN(a) && a < 18;
  }, [alder]);

  /* Fra-pris regnes, ikke skrives. Legges det inn en billigere økt i basen,
     endrer heroen seg uten at noen rører denne fila. */
  const fraPris = useMemo(
    () => (tjenester.length ? Math.min(...tjenester.map((t) => t.pris)) : null),
    [tjenester],
  );

  /* Neste ledige er ukjent før en tjeneste er valgt — ledigheten er coachens,
     og coachen følger tjenesten. Fasiten viser «—» i samme situasjon. */
  const nesteLedig = useMemo(() => {
    const d = dager.find((x) => x.tider.length);
    if (!d) return null;
    return { tekst: `${d.dw} ${d.tider[0].kl}`, sted: lokasjon };
  }, [dager, lokasjon]);

  const rullTilBook = useCallback(() => {
    bookRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const velgTjeneste = useCallback(
    async (t: PaperTjeneste) => {
      setValgtSlug(t.slug);
      setValgtDag(null);
      setValgtTid(null);
      setSendefeil(null);
      setSteg("tid");
      setLasterDager(true);
      setBeskjed(`${t.navn} valgt. Henter ledige tider.`);
      try {
        const d = await hentLedigeDager(t.slug);
        setDager(d);
        setBeskjed(`${t.navn} valgt. Velg tid.`);
      } catch {
        setDager([]);
        setSendefeil("Klarte ikke hente ledige tider. Prøv igjen, eller ta kontakt på post@akgolf.no.");
      } finally {
        setLasterDager(false);
        rullTilBook();
      }
    },
    [rullTilBook],
  );

  const send = useCallback(async () => {
    if (!tj || !tid) return;
    setSender(true);
    setSendefeil(null);
    // Alder og handicap har ingen egne kolonner på Booking — de følger med
    // som notat i stedet for å bli borte mellom skjermen og databasen.
    const ekstra = [
      alder ? `Alder: ${alder}` : null,
      hcp ? `Handicap: ${hcp}` : null,
      erUngdom ? "Foresatt har bekreftet samtykke i skjemaet" : null,
    ].filter(Boolean);
    const notatSamlet = [notat.trim(), ekstra.join(" · ")].filter(Boolean).join("\n");

    const res = await createBookingCheckout({
      slug: tj.slug,
      start: tid.startIso,
      coachId: tid.coachId,
      name: navn.trim(),
      email: epost.trim(),
      phone: tlf.trim(),
      notes: notatSamlet,
    });

    if (res.ok) {
      window.location.href = res.url;
      return;
    }
    setSender(false);
    setSendefeil(res.error);
    setBeskjed(res.error);
  }, [tj, tid, navn, epost, tlf, notat, alder, hcp, erUngdom]);

  /* ── Handlingslinje: Én ting nå ────────────────────────
     Én clay om gangen. Hero-knappen er «den ene handlingen» helt til dokken
     dukker opp; fra da av er dokken det. */
  const dokkSynlig = steg !== "tjeneste";

  const dokkTekst = useMemo(() => {
    const deler: string[] = [];
    if (tj) deler.push(tj.navn);
    if (valgtDag && valgtTid) deler.push(`${dag?.dw ?? ""} ${valgtDag} ${valgtTid}`.trim());
    else if (valgtDag) deler.push(`${dag?.dw ?? ""} ${valgtDag}`.trim());
    return deler.join(" · ") || "—";
  }, [tj, dag, valgtDag, valgtTid]);

  const dokkKnapp = useMemo(() => {
    if (steg === "tid") {
      // Aldri deaktivert. En grå primærknapp forteller deg at du ikke kommer
      // videre, men ikke hvorfor. Knappen sier i stedet hva som mangler.
      if (valgtTid) return "Videre til dine opplysninger";
      return valgtDag ? "Velg et klokkeslett" : "Velg en dag";
    }
    if (steg === "deg") return "Se over før du betaler";
    return sender ? "Sender deg til betaling …" : "Gå til betaling";
  }, [steg, valgtDag, valgtTid, sender]);

  const dokkTrykk = useCallback(() => {
    if (steg === "tid") {
      if (!valgtDag) {
        visToast("Velg en dag først.");
        setBeskjed("Velg en dag i rekka over.");
        return;
      }
      if (!valgtTid) {
        visToast("Velg et klokkeslett.");
        setBeskjed(`Velg et klokkeslett for ${dag?.navn ?? "dagen"}.`);
        return;
      }
      setSteg("deg");
      rullTilBook();
      setBeskjed("Fyll ut opplysningene dine.");
      return;
    }

    if (steg === "deg") {
      const f: Record<string, string> = {};
      if (!navn.trim()) f.navn = "Skriv inn navnet ditt.";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(epost)) f.epost = "Skriv en e-postadresse jeg kan svare på.";
      // Telefon er påkrevd av bookingen (kollisjon samme dag må kunne varsles).
      if (tlf.trim().length < 5) f.tlf = "Skriv et telefonnummer jeg kan nå deg på.";
      if (erUngdom && !foresatt) f.foresatt = "Kryss av, så sender jeg samtykkelenken til foresatt.";
      if (!vilkar) f.vilkar = "Du må godta vilkårene for å booke timen.";
      const n = Object.keys(f).length;
      if (n) {
        setFeil(f);
        setBeskjed(n === 1 ? "Ett felt mangler." : `${n} felt mangler.`);
        visToast(n === 1 ? "Ett felt mangler" : `${n} felt mangler`);
        return;
      }
      setFeil({});
      setSteg("bekreft");
      rullTilBook();
      setBeskjed("Se over før du betaler.");
      return;
    }

    void send();
  }, [
    steg, valgtDag, valgtTid, dag, navn, epost, tlf, erUngdom, foresatt, vilkar,
    visToast, rullTilBook, send,
  ]);

  const stegIndeks = STEG.findIndex((s) => s.k === steg);

  return (
    <div className="bkp" data-paper-slug="booking" data-od-id="bk-side">
      <header className="topp">
        <div className="wrap toppin">
          <Link className="logo" href="/" data-od-id="bk-logo">
            AK&nbsp;Golf<span>.</span>
          </Link>
          <nav aria-label="Meny">
            <a className="btn sm skjul" href="#priser" data-od-id="bk-nav-priser">Priser</a>
            <a className="btn sm skjul" href="#sporsmal" data-od-id="bk-nav-faq">Spørsmål</a>
            <Link className="btn sm" href="/auth/login" data-od-id="bk-nav-logginn">Logg inn</Link>
          </nav>
        </div>
      </header>

      <main id="hoved">
        <section className="hero">
          <div className="wrap">
            <span className="eyebrow">AK Golf Academy · Fredrikstad</span>
            <h1>Book en time med Anders Kristiansen</h1>
            <p className="ingress prose">
              Personlig coaching for spillere som vil ned i score. Første time er en kartlegging:
              vi måler, ser på hva som faktisk koster deg slag, og du går derfra med en plan —
              uansett om du fortsetter eller ikke.
            </p>
            <a
              className={`btn${dokkSynlig ? "" : " now"}`}
              href="#book"
              data-od-id="bk-hero-cta"
            >
              Se ledige tider
            </a>
            <div className="herofakta">
              <div>
                <span className="k">Første time</span>
                <span className="v">{fraPris === null ? "—" : `fra ${kr(fraPris)} kr`}</span>
                <span className="w">kartlegging med TrackMan</span>
              </div>
              <div>
                <span className="k">Neste ledige</span>
                <span className="v">{nesteLedig?.tekst ?? "—"}</span>
                <span className="w">
                  {nesteLedig?.sted ?? (valgtSlug ? "ingen ledige tider" : "velg en tjeneste først")}
                </span>
              </div>
              <div>
                <span className="k">Bekreftelse</span>
                <span className="v">straks</span>
                <span className="w">på e-post når betalingen er gjennomført</span>
              </div>
            </div>
          </div>
        </section>

        <section className="seksjon" id="priser">
          <div className="wrap">
            <span className="eyebrow">steg 1</span>
            <h2>Hva vil du booke?</h2>
            <p className="prose">
              Alle prisene gjelder coaching med meg. Jeg leier ikke ut simulatortid — anlegget er
              der vi jobber, ikke et produkt du kjøper.
            </p>

            {tjenester.length === 0 ? (
              <div className="merk">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16h.01" />
                </svg>
                <p>
                  Ingen tjenester er åpne for booking akkurat nå. Send en e-post til
                  post@akgolf.no, så finner vi en tid.
                </p>
              </div>
            ) : (
              <div className="tjenester" role="group" aria-label="Velg tjeneste">
                {tjenester.map((t) => (
                  <button
                    key={t.slug}
                    type="button"
                    className="tj"
                    data-od-id={`bk-tj-${t.slug}`}
                    aria-pressed={valgtSlug === t.slug}
                    onClick={() => void velgTjeneste(t)}
                  >
                    <h3>{t.navn}{t.coachNavn ? ` · ${t.coachNavn}` : ""}</h3>
                    <span className="pris num">{kr(t.pris)} {t.enhet}</span>
                    <span className="varighet">{t.varighetMin} min</span>
                    {t.beskrivelse && <p className="prose">{t.beskrivelse}</p>}
                  </button>
                ))}
              </div>
            )}

            {/* Abonnementene står under engangsøktene, ikke ved siden av dem. De er
                ikke et dyrere alternativ til én time — de er en annen avtale, og de
                booker ingen luke her. Derfor egen overskrift og egen handling. */}
            {abonnement.length > 0 && (
              <div className="kort">
                <span className="eyebrow">Abonnement</span>
                <h2>Eller fast oppfølging hver måned</h2>
                <p>
                  Du booker ingen tid nå. Øktene ligger som saldo du bruker når det passer, og de
                  bookes i PlayerHQ.
                </p>
                {abonnement.map((a) => (
                  <div className="rad" key={a.slug}>
                    <div>
                      {a.navn}{a.coachNavn ? ` · ${a.coachNavn}` : ""}
                      {a.beskrivelse && <small>{a.beskrivelse}</small>}
                    </div>
                    <span className="v num">{kr(a.pris)} kr/mnd</span>
                  </div>
                ))}
                <Link
                  className="btn full"
                  href="/kontakt"
                  data-od-id="bk-abonnement"
                  style={{ marginTop: "var(--p-s3)" }}
                >
                  Ta kontakt om abonnement
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="seksjon" id="book" ref={bookRef}>
          <div className="wrap">
            <ul className="steg" aria-label="Framdrift">
              {STEG.map((s, n) => (
                <li
                  key={s.k}
                  className={n < stegIndeks ? "ferdig" : undefined}
                  data-n={String(n + 1)}
                  aria-current={s.k === steg ? "step" : undefined}
                >
                  {s.n}
                </li>
              ))}
            </ul>

            {steg === "tjeneste" && (
              <>
                <h2>Velg tjeneste først</h2>
                <p className="prose">Velg et av kortene over, så viser jeg deg de ledige tidene.</p>
                <div className="merk">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v5M12 16h.01" />
                  </svg>
                  <p>
                    Er du usikker, velg Flex 50 min. Det er den økta som gir nok tid til å måle, se
                    på tallene og legge en plan — og du er ikke bundet til noe etterpå.
                  </p>
                </div>
              </>
            )}

            {steg === "tid" && tj && (
              <>
                <h2>Velg tid</h2>
                <p className="prose">
                  {tj.navn} · {tj.varighetMin} minutter · ledige tider de neste sju dagene.
                </p>

                {lasterDager ? (
                  <div className="merk">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    <p>Henter ledige tider …</p>
                  </div>
                ) : (
                  <>
                    <div className="dager" role="group" aria-label="Velg dag">
                      {dager.map((d) => (
                        <button
                          key={d.dd}
                          type="button"
                          className="dag"
                          data-od-id={`bk-dag-${d.dd}`}
                          aria-pressed={valgtDag === d.dd}
                          aria-disabled={d.tider.length === 0}
                          aria-label={`${d.navn} · ${d.tider.length ? `${d.tider.length} ledige tider` : "ingen ledige tider"}`}
                          onClick={() => {
                            if (!d.tider.length) {
                              visToast(`Ingen ledige tider ${d.navn}.`);
                              return;
                            }
                            setValgtDag(d.dd);
                            setValgtTid(null);
                            setBeskjed(`${d.navn} valgt.`);
                          }}
                        >
                          <span className="dw">{d.dw}</span>
                          <span className="dd">{d.dd}</span>
                          <span className="n">{d.tider.length ? `${d.tider.length} ledig` : "opptatt"}</span>
                        </button>
                      ))}
                    </div>

                    {!valgtDag && (
                      <div className="merk">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <rect x="3" y="5" width="18" height="16" rx="2" />
                          <path d="M3 10h18M8 3v4M16 3v4" />
                        </svg>
                        <p>
                          {dager.some((d) => d.tider.length)
                            ? "Velg en dag over. Grå dager er fullbooket."
                            : "Ingen ledige tider de neste sju dagene. Ta kontakt på post@akgolf.no, så finner vi noe."}
                        </p>
                      </div>
                    )}

                    {valgtDag && dag && dag.tider.length > 0 && (
                      <div className="tider" role="group" aria-label={`Velg klokkeslett ${dag.navn}`}>
                        {dag.tider.map((t) => (
                          <button
                            key={t.startIso}
                            type="button"
                            className="tid"
                            data-od-id={`bk-tid-${t.kl.replace(":", "")}`}
                            aria-pressed={valgtTid === t.kl}
                            onClick={() => {
                              setValgtTid(t.kl);
                              setBeskjed(`${t.kl} valgt på ${lokasjon}.`);
                            }}
                          >
                            {t.kl}
                            <small>{lokasjon}</small>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {steg === "deg" && (
              <>
                <h2>Om deg</h2>
                <p className="prose">Fire felt. Resten tar vi på timen.</p>
                <div className="skjema">
                  <div className={`felt${feil.navn ? " feil" : ""}`}>
                    <label htmlFor="f-navn">Navn</label>
                    <input
                      id="f-navn"
                      type="text"
                      value={navn}
                      data-od-id="bk-felt-navn"
                      aria-invalid={feil.navn ? true : undefined}
                      onChange={(e) => setNavn(e.target.value)}
                    />
                    {feil.navn && <span className="feilmelding">{feil.navn}</span>}
                  </div>

                  <div className="duo">
                    <div className={`felt${feil.epost ? " feil" : ""}`}>
                      <label htmlFor="f-epost">E-post</label>
                      <input
                        id="f-epost"
                        type="email"
                        value={epost}
                        data-od-id="bk-felt-epost"
                        aria-invalid={feil.epost ? true : undefined}
                        onChange={(e) => setEpost(e.target.value)}
                      />
                      {feil.epost
                        ? <span className="feilmelding">{feil.epost}</span>
                        : <span className="hjelp">Kvitteringen kommer hit.</span>}
                    </div>
                    <div className={`felt${feil.tlf ? " feil" : ""}`}>
                      <label htmlFor="f-tlf">Telefon</label>
                      <input
                        id="f-tlf"
                        type="tel"
                        value={tlf}
                        data-od-id="bk-felt-tlf"
                        aria-invalid={feil.tlf ? true : undefined}
                        onChange={(e) => setTlf(e.target.value)}
                      />
                      {feil.tlf
                        ? <span className="feilmelding">{feil.tlf}</span>
                        : <span className="hjelp">Kun ved endringer samme dag.</span>}
                    </div>
                  </div>

                  <div className="duo">
                    <div className="felt">
                      <label htmlFor="f-alder">Alder</label>
                      <input
                        id="f-alder"
                        type="number"
                        value={alder}
                        data-od-id="bk-felt-alder"
                        onChange={(e) => setAlder(e.target.value)}
                      />
                      <span className="hjelp">Under 18 krever samtykke fra foresatt.</span>
                    </div>
                    <div className="felt">
                      <label htmlFor="f-hcp">Handicap</label>
                      <input
                        id="f-hcp"
                        type="text"
                        value={hcp}
                        data-od-id="bk-felt-hcp"
                        onChange={(e) => setHcp(e.target.value)}
                      />
                      <span className="hjelp">Vet du det ikke, la det stå tomt.</span>
                    </div>
                  </div>

                  <div className="felt">
                    <label htmlFor="f-notat">Hva vil du jobbe med?</label>
                    <textarea
                      id="f-notat"
                      value={notat}
                      data-od-id="bk-felt-notat"
                      onChange={(e) => setNotat(e.target.value)}
                    />
                    <span className="hjelp">
                      Valgfritt. Skriver du noe her, har jeg lest det før du kommer.
                    </span>
                  </div>

                  {erUngdom && (
                    <div className="avkryss">
                      <input
                        type="checkbox"
                        id="f-foresatt"
                        checked={foresatt}
                        data-od-id="bk-foresatt"
                        onChange={(e) => setForesatt(e.target.checked)}
                      />
                      <label htmlFor="f-foresatt">
                        <span>
                          Jeg er under 18, og en foresatt får samtykkelenke på e-post før første time.
                        </span>
                      </label>
                      {feil.foresatt && <span className="feilmelding">{feil.foresatt}</span>}
                    </div>
                  )}

                  <div className="avkryss">
                    <input
                      type="checkbox"
                      id="f-vilkar"
                      checked={vilkar}
                      data-od-id="bk-vilkar"
                      onChange={(e) => setVilkar(e.target.checked)}
                    />
                    <label htmlFor="f-vilkar">
                      <span>
                        Jeg godtar at opplysningene lagres for å gjennomføre timen, og at
                        avbestilling senere enn 24 timer før ikke refunderes.
                      </span>
                    </label>
                    {feil.vilkar && <span className="feilmelding">{feil.vilkar}</span>}
                  </div>
                </div>
              </>
            )}

            {steg === "bekreft" && tj && dag && valgtTid && (
              <>
                <h2>Se over</h2>
                <p className="prose">Ingenting er betalt før du trykker nederst.</p>
                <div className="oppsum">
                  <div className="rad"><span>Tjeneste</span><span className="v">{tj.navn}</span></div>
                  <div className="rad"><span>Tid</span><span className="v">{dag.navn} kl. {valgtTid}</span></div>
                  <div className="rad"><span>Sted</span><span className="v">{lokasjon}</span></div>
                  <div className="rad"><span>Varighet</span><span className="v">{tj.varighetMin} min</span></div>
                  <div className="rad"><span>Navn</span><span className="v">{navn}</span></div>
                  <div className="rad"><span>E-post</span><span className="v">{epost}</span></div>
                  {hcp && <div className="rad"><span>Handicap</span><span className="v">{hcp}</span></div>}
                  {notat && <div className="rad"><span>Ønske</span><span className="v">{notat}</span></div>}
                  <div className="sum">
                    <span>Å betale nå</span>
                    <span className="v">{kr(tj.pris)} {tj.enhet}</span>
                  </div>
                </div>

                <div className="merk">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                  <p>
                    Du betaler med kort nå, og timen er din med en gang betalingen er gjennomført.
                    Avbestiller du senest 24 timer før, får du pengene tilbake.
                  </p>
                </div>

                {erUngdom && (
                  <div className="merk">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M5 10l7-7 7 7" /></svg>
                    <p>
                      Foresatt får en samtykkelenke på e-post. Timen kan ikke gjennomføres før den
                      er signert.
                    </p>
                  </div>
                )}
              </>
            )}

            {sendefeil && (
              <div className="merk feil" role="alert">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16h.01" />
                </svg>
                <p>{sendefeil}</p>
              </div>
            )}
          </div>
        </section>

        <section className="seksjon" id="sporsmal">
          <div className="wrap">
            <span className="eyebrow">før du booker</span>
            <h2>Spørsmål</h2>
            <div className="faq">
              <details data-od-id="bk-faq-1">
                <summary>Kan jeg leie simulatoren uten coaching?</summary>
                <p>
                  Nei. Mulligan Indoor er stedet vi jobber, ikke et produkt jeg selger. Booking hos
                  meg er alltid coachingtid.
                </p>
              </details>
              <details data-od-id="bk-faq-2">
                <summary>Hva skjer på første time?</summary>
                <p>
                  Vi måler på TrackMan, går gjennom de siste rundene dine hvis du har dem, og finner
                  ut hvilket område som faktisk koster deg flest slag. Du går derfra med en plan
                  skrevet ned — ikke en følelse.
                </p>
              </details>
              <details data-od-id="bk-faq-3">
                <summary>Er dette for juniorer?</summary>
                <p>
                  Ja. Er spilleren under 18 år, må en foresatt bekrefte bookingen og signere
                  samtykke før første time. Du får lenken på e-post.
                </p>
              </details>
              <details data-od-id="bk-faq-4">
                <summary>Kan jeg avbestille?</summary>
                <p>
                  Ja, fram til 24 timer før. Da får du pengene tilbake. Senere enn det refunderes
                  ikke timen.
                </p>
              </details>
            </div>
            <div className="bunnlinje">
              <p className="prose">AK Golf Academy · en del av AK Golf Group AS · Fredrikstad</p>
              <span style={{ flex: 1 }} />
              <Link className="btn sm" href="/auth/login" data-od-id="bk-bunn-logginn">
                Allerede spiller? Logg inn
              </Link>
            </div>
          </div>
        </section>
      </main>

      {dokkSynlig && (
        <div className="dokk">
          <div className="wrap dokkin">
            <span className="oppsum-mini">{dokkTekst}</span>
            <button
              type="button"
              className="btn now"
              data-od-id="bk-one-thing-now"
              aria-disabled={sender}
              onClick={dokkTrykk}
            >
              {dokkKnapp}
            </button>
          </div>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
      <div className="sr" aria-live="polite">{beskjed}</div>
    </div>
  );
}
