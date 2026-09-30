"use client";

/**
 * BK-02 Bekreft og betal — offentlig booking i Precision Athletics (Claude Design
 * 7d7c2994, ui_kits/booking/screens/BK.jsx, stegene «Deg» og «Bekreft og betal»).
 * Rute: /booking/[slug]/bekreft.
 *
 * Bevisste avvik fra tegningen:
 *   - Steg 3 og 4 ligger på én side. Betalingen skjer hos Stripe (nettleseren sendes dit
 *     når du trykker Betal), så siden viser ikke et eget kortfelt.
 *   - Bare kort via Stripe. Vipps finnes ikke i betalingskoden ennå (se PR).
 *   - Telefon er påkrevd, ikke valgfri: serveren avviser bookinger uten telefonnummer.
 *   - «Notater til coach» beholdes fra dagens skjema (tegningen har det ikke).
 *   - «Jeg booker for et barn»: navnet på spilleren legges først i notatet til coach,
 *     siden bookingen ikke har eget felt for det (forslag i PR).
 *   - Ingen ventestatus: bookingen bekreftes automatisk når betalingen er gjennomført.
 */
import { useState, useTransition } from "react";
import { Lock } from "lucide-react";
import { Knapp, KnappLenke, Meta } from "@/components/precision/pa";
import { Kort, Nokkelverdi, Skjemafelt } from "@/components/precision/pa-a4";
import { Avkrysning, Varsel } from "@/components/precision/pa-planhub";
import { createBookingCheckout } from "@/app/(marketing)/booking/[slug]/bekreft/actions";
import { BookingSkall, BookingSteg } from "./BookingSkall";

export type BK02BekreftProps = {
  slug: string;
  start: string;
  coachId: string;
  tjenesteNavn: string;
  durationMin: number;
  /** Ferdig formatert i Europe/Oslo, f.eks. «man. 28. sep. · 17:00». */
  tidTekst: string;
  /** ISO-dato (YYYY-MM-DD) i Oslo, for «Tilbake» til riktig dag. */
  datoIso: string;
  coachNavn: string | null;
  prisTekst: string;
  priceOre: number;
  innloggetEpost: string | null;
  innloggetNavn: string | null;
};

type Feil = Partial<Record<"navn" | "epost" | "telefon" | "spiller" | "vilkar", string>>;

export function BK02Bekreft(p: BK02BekreftProps) {
  const [navn, setNavn] = useState(p.innloggetNavn ?? "");
  const [epost, setEpost] = useState(p.innloggetEpost ?? "");
  const [telefon, setTelefon] = useState("");
  const [barn, setBarn] = useState(false);
  const [spiller, setSpiller] = useState("");
  const [notat, setNotat] = useState("");
  const [vilkar, setVilkar] = useState(false);
  const [feil, setFeil] = useState<Feil>({});
  const [serverFeil, setServerFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function betal() {
    const f: Feil = {};
    if (!navn.trim()) f.navn = "Skriv fullt navn.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(epost.trim())) f.epost = "Skriv en gyldig e-postadresse. Kvitteringen sendes dit.";
    if (telefon.trim().length < 5) f.telefon = "Skriv telefonnummeret ditt.";
    if (barn && !spiller.trim()) f.spiller = "Skriv navnet på spilleren du booker for.";
    if (!vilkar) f.vilkar = "Du må godta vilkårene for å betale.";
    setFeil(f);
    setServerFeil(null);
    if (Object.keys(f).length) return;
    startTransition(async () => {
      const notater = [barn ? `Booker for: ${spiller.trim()}` : null, notat.trim() || null].filter(Boolean).join("\n");
      const r = await createBookingCheckout({ slug: p.slug, start: p.start, coachId: p.coachId, name: navn, email: epost, phone: telefon, notes: notater });
      if (!r.ok) { setServerFeil(r.error); return; }
      window.location.href = r.url;
    });
  }

  return (
    <BookingSkall>
      <BookingSteg na={3} />
      <h1 style={{ margin: 0, font: "600 clamp(22px, 1.2vw + 16px, 28px)/1.2 var(--font-sans)" }}>Bekreft og betal</h1>
      <div className="bk-kols">
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 520, minWidth: 0 }}>
          <Skjemafelt label="Fullt navn" required error={feil.navn}>
            <input className="a4-input" aria-label="Fullt navn" autoComplete="name" value={navn} onChange={(e) => setNavn(e.target.value)} />
          </Skjemafelt>
          <Skjemafelt label="E-post" required error={feil.epost}>
            <input className="a4-input" aria-label="E-post" type="email" autoComplete="email" value={epost} onChange={(e) => setEpost(e.target.value)} />
          </Skjemafelt>
          <Skjemafelt label="Telefon" required error={feil.telefon}>
            <input className="a4-input a4-input--mono" aria-label="Telefon" type="tel" autoComplete="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} />
          </Skjemafelt>
          <Avkrysning checked={barn} onChange={setBarn} label="Jeg booker for et barn under 18" />
          {barn && (
            <Skjemafelt label="Spillerens navn" required error={feil.spiller}>
              <input className="a4-input" aria-label="Spillerens navn" value={spiller} onChange={(e) => setSpiller(e.target.value)} />
            </Skjemafelt>
          )}
          <Skjemafelt label="Notater til coach" hint="Valgfritt.">
            <textarea className="a4-input" aria-label="Notater til coach" rows={3} style={{ height: "auto", padding: "10px 12px", resize: "vertical" }} value={notat} onChange={(e) => setNotat(e.target.value)} />
          </Skjemafelt>
          <div className="pa-card" style={{ padding: "10px 14px", minHeight: 60, gap: 3, borderColor: "var(--border-ink)", boxShadow: "inset 0 0 0 1px var(--border-ink)" }}>
            <span style={{ font: "600 14px/1.2 var(--font-sans)" }}>Kort</span>
            <Meta>VISA, MASTERCARD · VIA STRIPE</Meta>
          </div>
          <Meta>DU SENDES TIL STRIPE FOR Å BETALE. VI SER ALDRI KORTNUMMERET.</Meta>
          <Avkrysning checked={vilkar} onChange={setVilkar} label="Jeg godtar vilkårene. Gratis avbestilling fram til 24 timer før." />
          {feil.vilkar && <Varsel tone="warn">{feil.vilkar}</Varsel>}
          {serverFeil && <Varsel tone="signal">{serverFeil}</Varsel>}
        </div>
        <div className="bk-oppsummering">
          <Kort pad={16} gap={10}>
            <span className="kicker">Din booking</span>
            <Nokkelverdi
              items={[
                ["Tjeneste", `${p.tjenesteNavn} ${p.durationMin} min`],
                ["Tid", p.tidTekst, { mono: true }],
                ["Coach", p.coachNavn ?? "—"],
                ["Pris", p.prisTekst, { mono: true, hint: "FAST PRIS · SERVICETYPE" }],
              ]}
            />
          </Kort>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <KnappLenke variant="ghost" href={`/booking/${p.slug}?dato=${p.datoIso}`}>Tilbake</KnappLenke>
        <Knapp icon={Lock} loading={pending} loadingText="Sender til Stripe …" onClick={betal}>{`Betal ${p.prisTekst}`}</Knapp>
      </div>
      <Meta>TIDEN ER HOLDT FOR DEG I 15 MINUTTER. AVBESTILLING SENEST 24 TIMER FØR GIR FULL REFUSJON.</Meta>
    </BookingSkall>
  );
}
