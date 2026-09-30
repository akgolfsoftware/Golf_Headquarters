/** Prøvefil for PH-06 Slagteller (natt). Syntetiske data, ingen ekte spillere. */
import { PH06IngenOkt, PH06Slagteller, type PH06Props } from "@/components/portal/precision/PH06Slagteller";

export const sti = "/portal/live/demo/tapper";

const base: PH06Props = {
  tilstand: "data",
  oktLabel: "Innspill ca. 100 m med et langt navn som må brytes pent",
  tilbakeHref: "#",
  totalt: 18,
  omrader: [{ id: "FULL_SVING", label: "Full sving" }, { id: "NAERSPILL", label: "Nærspill" }, { id: "PUTTING", label: "Putting" }],
  omrade: "FULL_SVING",
  onOmrade: () => {},
  repTyper: [{ id: "FULL_SPEED", label: "Full fart" }, { id: "LOW_SPEED", label: "Lav fart" }, { id: "DRY", label: "Tørrsving" }],
  repType: "FULL_SPEED",
  onRepType: () => {},
  elementer: ["Driver", "Fairway", "Hybrid", "Jern", "Wedge", "Putter"].map((n) => ({ id: n, navn: n })),
  valgt: "Wedge",
  onValgt: () => {},
  valgtAntall: 12,
  fordeling: [{ key: "a", navn: "Wedge", antall: 12 }, { key: "b", navn: "Jern · lav fart", antall: 6 }],
  sist: { label: "Wedge", kl: "14:41" },
  enhet: "slag",
  lagreFeil: null,
  onProvIgjen: () => {},
  avsluttFeil: null,
  avslutter: false,
  onLeggTil: () => {},
  onAngre: () => {},
  onAvslutt: () => {},
};

export const natt = ["data", "tom", "laster", "feil", "ingen-okt"];

export const tilstander = {
  data: <PH06Slagteller {...base} />,
  tom: <PH06Slagteller {...base} tilstand="tom" totalt={0} valgtAntall={0} fordeling={[]} sist={null} />,
  laster: <PH06Slagteller {...base} tilstand="laster" />,
  feil: <PH06Slagteller {...base} tilstand="feil" lagreFeil={{ tittel: "Tellingene ble ikke lagret", tekst: "Nettet forsvant under lagringen. De 18 repetisjonene ligger trygt på telefonen og sendes automatisk når nettet er tilbake.", kode: "SYNK · KØET LOKALT" }} />,
  "ingen-okt": <PH06IngenOkt />,
};
