/** Prøvefil for BK-02 Velg tid og betal. Syntetiske data (demo: Anders Kristiansen). */
import { BK02VelgTid, type BK02Props } from "@/components/booking/precision/BK02VelgTid";
import { BK02Bekreft, type BK02BekreftProps } from "@/components/booking/precision/BK02Bekreft";
import { BookingFeil, BookingLaster } from "@/components/booking/precision/BookingSkall";

export const sti = "/booking/privattime-60";

const tjeneste = { slug: "privattime-60", name: "Privattime", description: null, prisTekst: "1 200 kr", durationMin: 60 };
const dager = Array.from({ length: 14 }, (_, i) => ({
  iso: `2026-09-${String(29 + i > 30 ? 29 + i - 30 : 29 + i).padStart(2, "0")}`,
  dagsnavn: ["tir.", "ons.", "tors.", "fre.", "lør.", "søn.", "man."][i % 7]!,
  datotekst: `${(29 + i) > 30 ? 29 + i - 30 : 29 + i}. ${(29 + i) > 30 ? "okt." : "sep."}`,
  valgt: i === 1,
}));
const slot = (t: string) => ({ start: `2026-09-30T${t}:00.000Z`, end: `2026-09-30T${t}:00.000Z`, coachId: "c1", coachName: "Anders Kristiansen" });
const tid: BK02Props = { tjeneste, dager, valgtDatoTekst: "onsdag 30. september", slots: ["07:00", "08:00", "15:00", "16:00", "17:00"].map(slot) };
const bekreft: BK02BekreftProps = {
  slug: "privattime-60", start: "2026-09-30T15:00:00.000Z", coachId: "c1", tjenesteNavn: "Privattime", durationMin: 60,
  tidTekst: "ons. 30. sep. · 17:00", datoIso: "2026-09-30", coachNavn: "Anders Kristiansen", prisTekst: "1 200 kr", priceOre: 120000,
  innloggetEpost: null, innloggetNavn: null,
};

export const tilstander = {
  tid: <BK02VelgTid {...tid} />,
  "tid-tom": <BK02VelgTid {...tid} slots={[]} />,
  bekreft: <BK02Bekreft {...bekreft} />,
  laster: <BookingLaster tekst="Henter ledige tider …" />,
  feil: <BookingFeil tittel="Bookingen kunne ikke lastes" tekst="Ingen time er booket og ingenting er trukket. Prøv igjen." kode="FEIL · BOOKING" />,
};
