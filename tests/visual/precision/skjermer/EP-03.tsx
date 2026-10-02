/** Prøvefil for EP-03 Påminnelse dagen før. Oppdiktede navn, e-posten bygges av selve malen. */
import { byggPaaminnelse, type PaaminnelseData } from "@/lib/email/templates/paaminnelse-mal";

export const sti = "/";

const base: PaaminnelseData = {
  mottaker: "gjest",
  betalingstype: "betalt",
  iMorgen: true,
  fornavn: "Mari",
  tjeneste: "Privattime",
  varighetMin: 60,
  dag: "Tirsdag 29.09.2026",
  start: "17:00",
  klokke: "17:00–18:00",
  sted: "Studio 1 · Borregaard GK",
  coach: "Anders Kristiansen",
  pris: "950 kr",
  betaling: { tekst: "pi_3QdE7x2LkP9aKG26", mono: true },
  referanse: "BK-2026-0917",
  frist: "mandag 28.09.2026 kl. 17:00",
  fristPassert: true,
  lenker: { veibeskrivelse: "#kart", bookingIApp: "#app", endre: "#endre" },
};

function Epost({ d, mork }: { d: PaaminnelseData; mork?: boolean }) {
  const { html } = byggPaaminnelse(d, { mork });
  const stil = /<style>([\s\S]*?)<\/style>/.exec(html)?.[1] ?? "";
  const innhold = /<body[^>]*>([\s\S]*)<\/body>/.exec(html)?.[1] ?? "";
  const bg = mork ? "#0c0d0c" : "#e6e3dd";
  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      <style>{stil.replace(/body\{[^}]*\}/, "")}</style>
      <div dangerouslySetInnerHTML={{ __html: innhold }} />
    </div>
  );
}

export const tilstander = {
  gjest: <Epost d={base} />,
  app: <Epost d={{ ...base, mottaker: "app", betalingstype: "klipp", pris: "Inkludert i abonnement", betaling: { tekst: "1 klipp · Performance Pro", mono: false } }} />,
  "frist-igjen": <Epost d={{ ...base, fristPassert: false }} />,
  "mangler-verdier": <Epost d={{ ...base, coach: null, betaling: { tekst: null, mono: true }, fornavn: "" }} />,
  "lang-tekst": <Epost d={{ ...base, sted: "Studio 1 · Et veldig langt stedsnavn som må brytes pent uten å sprenge skjermen", referanse: "BK-2026-0917-EKSTRA-LANG-REFERANSE-UTEN-MELLOMROM-1234567890" }} />,
  "natt-gjest": <Epost d={base} mork />,
  "natt-app": <Epost d={{ ...base, mottaker: "app", betalingstype: "klipp", pris: "Inkludert i abonnement", betaling: { tekst: "1 klipp", mono: false } }} mork />,
};
export const natt = ["natt-gjest", "natt-app"];
