/**
 * Prøvefil for FO-03 Booking for barnet (forelder) i Precision Athletics.
 * Syntetiske testdata, ingen ekte personer eller produksjonsdatabase.
 */
import { ForelderSkall } from "@/components/precision/ForelderSkall";
import { FO03BookingNy } from "@/components/forelder/FO03BookingNy";
import { FO03BookingBekreft } from "@/components/forelder/FO03BookingBekreft";
import { FO03Bekreftet } from "@/components/forelder/FO03Bekreftet";
import type { NyWizardResult } from "@/lib/portal-booking/ny-wizard-data";

export const sti = "/forelder/bookinger/ny/barn-1";

type Data = Extract<NyWizardResult, { ingenTjenester: false }>["data"];
const iMorgen = new Date(Date.now() + 86400000);
const tid = (t: number) => { const d = new Date(iMorgen); d.setHours(t, 0, 0, 0); return d.toISOString(); };

const tjenester = [
  { id: "s1", slug: "coaching-60", navn: "Coaching 60 min", varighetMin: 60, prisOre: 0, beskrivelse: null, stedNavn: "Testklubb Golf" },
  { id: "s2", slug: "coaching-30", navn: "Coaching 30 min", varighetMin: 30, prisOre: 0, beskrivelse: null, stedNavn: "Testklubb Golf" },
  { id: "s3", slug: "banerunde-9-hull-med-lang-tittel", navn: "Banerunde 9 hull med coach og videoanalyse etterpå", varighetMin: 120, prisOre: 65000, beskrivelse: null, stedNavn: null },
];

const base: Data = {
  wizardBase: "/forelder/bookinger/ny/barn-1",
  modus: "credits",
  betalingGrunn: null,
  tjenester,
  valgtServiceId: "s1",
  valgtServiceNavn: "Coaching 60 min",
  valgtServiceVarighetMin: 60,
  valgtServicePrisOre: 0,
  datoParam: null,
  serviceParamSatt: false,
  valgtDatoIso: iMorgen.toISOString(),
  valgtDatoLang: "torsdag 8. oktober",
  aktivtSteg: 1,
  isFree: false,
  slots: [],
  creditsRemaining: 3,
  monthlyCredits: 4,
  fornyerLabel: "01. nov",
  stedNavn: "Testklubb Golf",
  stedId: null,
  saldoEtter: 2,
  sisteCredit: false,
};

const slots = [14, 15, 16, 17, 18].map((t) => ({ startIso: tid(t), coachId: "c1", coachNavn: "Testcoach Hansen" }));

function S({ children }: { children: React.ReactNode }) {
  return <ForelderSkall><div className="pa-side">{children}</div></ForelderSkall>;
}

const bekreft = {
  barnId: "barn-1",
  bekreftetBase: "/forelder/bookinger/bekreftet",
  modus: "credits" as const,
  prisOre: 0,
  serviceTypeId: "s1",
  coachId: "c1",
  startIso: tid(17),
  backHref: "/forelder/bookinger/ny/barn-1?service=coaching-60",
  ledig: true,
  rader: [
    { label: "Tjeneste", verdi: "Coaching 60 min" },
    { label: "Coach", verdi: "Testcoach Hansen" },
    { label: "Tid", verdi: "Torsdag 8. oktober kl. 17:00" },
    { label: "Varighet", verdi: "60 min" },
    { label: "Betaling", verdi: "1 klipp" },
  ],
  creditsRemaining: 3,
  saldoEtter: 2,
};

export const tilstander = {
  tjeneste: <S><FO03BookingNy data={base} barnNavn="Testbarn Nordmann" flereBarn /></S>,
  tid: <S><FO03BookingNy data={{ ...base, aktivtSteg: 2, serviceParamSatt: true, datoParam: "2026-10-08", slots }} barnNavn="Testbarn Nordmann" flereBarn={false} /></S>,
  tomTid: <S><FO03BookingNy data={{ ...base, aktivtSteg: 2, serviceParamSatt: true }} barnNavn="Testbarn Nordmann" flereBarn /></S>,
  gratis: <S><FO03BookingNy data={{ ...base, isFree: true, creditsRemaining: 0, monthlyCredits: 0 }} barnNavn="Testbarn Nordmann" flereBarn /></S>,
  betaling: <S><FO03BookingNy data={{ ...base, modus: "betaling", betalingGrunn: "BRUKT_OPP" }} barnNavn="Testbarn Nordmann" flereBarn /></S>,
  bekreft: <S><FO03BookingBekreft data={bekreft} barnNavn="Testbarn Nordmann" avbestillingTimer={24} /></S>,
  bekreftKort: <S><FO03BookingBekreft data={{ ...bekreft, modus: "betaling", prisOre: 65000, rader: bekreft.rader.map((r) => r.label === "Betaling" ? { ...r, verdi: "Kort · 650 kr" } : r) }} barnNavn="Testbarn Nordmann" avbestillingTimer={24} /></S>,
  bekreftOpptatt: <S><FO03BookingBekreft data={{ ...bekreft, ledig: false }} barnNavn="Testbarn Nordmann" avbestillingTimer={24} /></S>,
  bekreftet: <S><FO03Bekreftet data={{ barnFornavn: "Testbarn", tjeneste: "Coaching 60 min", ukedagKort: "tor", dagTall: "8", maanedKort: "okt", datoLang: "Torsdag 8. oktober", klokkeslett: "17:00", coachNavn: "Testcoach Hansen", sted: "Testklubb Golf", varighetMin: 60, kalenderUrl: "https://calendar.google.com/", avbestillingTimer: 24 }} /></S>,
};
