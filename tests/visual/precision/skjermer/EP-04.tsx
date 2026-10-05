/** Prøvefil for EP-04 Avbestilling. Oppdiktede navn, e-posten bygges av selve malen. */
import { byggAvbestilling, type AvbestillingData } from "@/lib/email/templates/avbestilling-mal";

export const sti = "/";

const base: AvbestillingData = {
  mottaker: "gjest",
  fornavn: "Mari",
  tjeneste: "Privattime 60 min",
  dag: "Tirsdag 29.09.2026",
  klokke: "17:00–18:00",
  avbestiltTidspunkt: "Mandag 28.09.2026 kl. 09:14",
  refusjon: { type: "penger", belop: "950 kr" },
  referanse: "re_3QdF1a2LkP9aKG26",
  lenker: { bookNy: "#booking", playerhq: "#playerhq" },
};
const app: AvbestillingData = {
  ...base,
  mottaker: "app",
  fornavn: "Tobias",
  refusjon: { type: "klipp", igjen: 4, av: 4 },
  referanse: "BK-2026-0917",
};

function Epost({ d, mork }: { d: AvbestillingData; mork?: boolean }) {
  const { html } = byggAvbestilling(d, { mork });
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
  app: <Epost d={app} />,
  "ingen-refusjon": <Epost d={{ ...base, refusjon: { type: "ingen" } }} />,
  "refusjon-feilet": <Epost d={{ ...base, refusjon: { type: "feilet" } }} />,
  "mangler-verdier": <Epost d={{ ...base, referanse: null, fornavn: "", refusjon: { type: "klipp", igjen: null, av: null }, mottaker: "app" }} />,
  "lang-tekst": <Epost d={{ ...base, tjeneste: "Privattime med et veldig langt navn som må brytes pent uten å sprenge skjermen 60 min", referanse: "re_3QdF1a2LkP9aKG26-EKSTRA-LANG-REFERANSE-UTEN-MELLOMROM-1234567890" }} />,
  "natt-gjest": <Epost d={base} mork />,
  "natt-app": <Epost d={app} mork />,
};
export const natt = ["natt-gjest", "natt-app"];
