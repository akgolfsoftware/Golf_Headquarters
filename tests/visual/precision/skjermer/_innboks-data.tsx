/**
 * Felles prøvedata for Innboks (AG-04 og fanene). Oppdiktede navn, ingen ekte
 * spillere og ingen navn fra designets data-filer. Bygges med den ekte
 * byggefunksjonen, så prøven viser det appen viser.
 */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { AG04Innboks, type AG04Godkjenn, type AG04Tilstand } from "@/components/admin/precision/AG04Innboks";
import { apneSaker, byggInnboks, innboksHaster, type InnboksKilder } from "@/lib/admin/innboks/bygg-innboks";
import type { InnboksFilterId, OppfStatus } from "@/lib/admin/innboks/filter";
import type { DatakvalitetData } from "@/lib/admin/innboks/last-datakvalitet";

const now = new Date("2026-09-29T08:14:00Z");
const t = (timer: number) => new Date(now.getTime() - timer * 3_600_000).toISOString();

export function kilder(haster: boolean): InnboksKilder {
  return {
    now,
    sporsmal: [
      { id: "q1", spillerId: "s1", spiller: "Nora Vik", tittel: "Skal jeg spille klubbturneringen lørdag eller hvile før kretsfinalen søndag?", tekst: "Kretsfinalen er søndag. Klubbturneringen er lørdag. Jeg rekker begge, men blir sliten.", opprettetIso: t(haster ? 30 : 20) },
    ],
    epost: [
      { id: "e1", fraEpost: "forelder@example.com", fraNavn: "Siri Dahl", emne: "Høstsamling for juniorene", brodtekst: "Hei. Hva koster samlingen, og når er påmeldingsfristen?", mottattAt: "29. sep. 07:31", mottattIso: t(0.7), status: "UTKAST_KLART", utkastSvar: "Hei Siri. Takk for meldingen. Jeg sender pris og frist i eget svar i løpet av dagen. Hilsen Anders", harUtkast: true },
      { id: "e2", fraEpost: "admin@klubb.example", fraNavn: null, emne: "Baneleie vinter med et svært langt emne som må brytes pent over flere linjer på mobil", brodtekst: "Vi trenger bekreftelse på antall timer innen 01.10.", mottattAt: "28. sep. 14:02", mottattIso: t(18), status: "NY", utkastSvar: null, harUtkast: false },
    ],
    epostSendt: [],
    godkjenn: [
      { id: "p1", actionType: "REDUCE_LOAD", playerId: "s2", who: "Eirik Berge", title: "Gjør uke 40 lettere", detail: "Uke 37 og 38 gjennomførte han 134 % og 131 % av planen.", signalKind: null, signalValue: null, diffPreview: "Uke 40: 14,5 t → 11,5 t", when: "i dag", urgent: false, lowRisk: true, kilde: "agent", opprettetIso: t(2.2), hvorfor: "Planmotor · øktlogg uke 37–38" },
      { id: "c1", actionType: "CADDIE_DRAFT", playerId: "s3", who: "Per Olsen", title: "Melding til spiller", detail: "Hei Per. Bra jobba denne uka. Hold samme rytme neste uke.", signalKind: null, signalValue: null, diffPreview: null, when: "i dag", urgent: false, lowRisk: false, kilde: "caddie", eksternHref: "/admin/agencyos/caddie/dashbord", opprettetIso: t(3) },
      { id: "c2", actionType: "CADDIE_DRAFT", playerId: "s4", who: "Kari Hansen", title: "Justering av plan", detail: "Flytt putteøkta fra tirsdag til torsdag.", signalKind: null, signalValue: null, diffPreview: null, when: "i går", urgent: false, lowRisk: false, kilde: "caddie", eksternHref: "/admin/agencyos/caddie/dashbord", opprettetIso: t(20) },
      { id: "r1", actionType: "SESSION_REQUEST", playerId: "s5", who: "Ola Nordmann", title: "Økt-forespørsel", detail: "Vil jobbe med wedger før regionfinalen · 02.10.2026 · 17:00", signalKind: null, signalValue: null, diffPreview: null, when: "i går", urgent: false, lowRisk: false, kilde: "forespørsel", eksternHref: "/admin/foresporsler", opprettetIso: t(11) },
    ],
    saker: [
      { id: "notification:n1", opprettetIso: t(23), kilde: "notification", type: "varsel", tittel: "Nora Vik er påmeldt Kretsfinale junior", sub: "Søndag 04.10 · tee 09:20.", hvem: "System", frist: "til orientering", snart: false, lost: false, lostTekst: null, kontrakt: null, grunnlag: ["Kilde: TURNERING"], href: "/admin/turnering", hrefTekst: "Åpne", primaer: { label: "Kvitter ut", slag: "godkjenn" }, sekundaer: null },
      { id: "appFeedback:f1", opprettetIso: t(5), kilde: "appFeedback", type: "forespørsel", tittel: "Tilbakemelding · FEIL", sub: "Knappen for å lagre runde reagerer ikke på mobil.", hvem: "Kari Hansen", frist: "5 t siden", snart: false, lost: false, lostTekst: null, kontrakt: null, grunnlag: ["Kilde: appen · /portal/runde"], href: null, hrefTekst: null, primaer: { label: "Kvitter ut", slag: "godkjenn" }, sekundaer: null },
      { id: "planAction:p9", opprettetIso: t(40), kilde: "planAction", type: "forslag", tittel: "Flere wedgeøkter", sub: "Godkjent og sendt.", hvem: "Per Olsen", frist: "i går", snart: false, lost: true, lostTekst: "godkjent i går", kontrakt: null, grunnlag: [], href: null, hrefTekst: null, primaer: null, sekundaer: null },
    ],
    oppfolging: [
      { id: "s6", navn: "Jon Strand", epost: "jon@example.com", signalTekst: "Ingen aktiv plan · Ikke aktiv 21d", stats: [{ k: "Siste innlogg", v: "21d" }], tags: ["uten plan", "stille"], siden: "sist innlogget 21 dager siden", dagerSidenInnlogging: 21, status: haster ? "risk" : "watch" },
      { id: "s7", navn: "Lise Moe", epost: "lise@example.com", signalTekst: "Ingen aktiv plan", stats: [], tags: ["uten plan"], siden: "sist innlogget 3 dager siden", dagerSidenInnlogging: 3, status: "check" },
      { id: "s8", navn: "Tor Lund", epost: "tor@example.com", signalTekst: "Ikke aktiv 16d", stats: [{ k: "SG · siste", v: "−0,8" }], tags: ["stille", "kvittert"], siden: "sist innlogget 16 dager siden", dagerSidenInnlogging: 16, status: "ok" },
    ],
  };
}

export const godkjenn: AG04Godkjenn = {
  venter: 4, lavRisiko: 1, eldste: { dagerLabel: "1 dg", who: "Kari Hansen" }, godkjent7Dager: 6, avvist7Dager: 1,
  ukesrapport: { ukenummer: 39, when: "man 06:00", tall: [{ key: "Økter logget", verdi: "42", nevner: "av 51 planlagte" }, { key: "Runder", verdi: "9", nevner: "brutto, 6 spillere" }], hvorfor: ["Rapportagenten · kjørt man 06:00", "Datagrunnlag: plan, logg, runder og tester"] },
  lostSjekkpunkter: [{ id: "p8", who: "Lise Moe", sjekkpunkt: "Sjekk putting-snitt etter to uker", when: "3 dg siden" }],
  andreKoer: [{ label: "Agent-kø", href: "/admin/ko?fane=agentko" }, { label: "Dubletter", href: "/admin/ko?fane=dubletter" }, { label: "Moderering", href: "/admin/ko?fane=moderering" }],
};

export const datakvalitet: DatakvalitetData = {
  sjekket: 14,
  muligeDubletter: 3,
  runder: [
    { id: "rd1", spillerId: "s2", spiller: "Eirik Berge", runde: "Lør 26.09 · Testbanen GK · 78 slag", hvorfor: "Kun totalscore. Gir brutto score og historikk, men ikke beregnet SG.", trengs: "Scorekort og slag-for-slag med avstand.", spiltIso: t(50) },
    { id: "rd2", spillerId: "s5", spiller: "Ola Nordmann", runde: "Tor 24.09 · Øvingsbanen med et langt navn GK · 81 slag", hvorfor: "Scorekort med detaljer. Gir score, putter/FW/GIR der det finnes, men ikke beregnet SG.", trengs: "Slag-for-slag med avstand på hvert hull.", spiltIso: t(100) },
  ],
};

const tomGodkjenn: AG04Godkjenn = { venter: 0, lavRisiko: 0, eldste: null, godkjent7Dager: 0, avvist7Dager: 0, ukesrapport: null, lostSjekkpunkter: [], andreKoer: [] };
const tomKilder: InnboksKilder = { now, sporsmal: [], epost: [], epostSendt: [], godkjenn: [], saker: [], oppfolging: [] };

export function Vis({ tilstand = "data", filter = "alle", oppf = null, haster = false, tom = false }: {
  tilstand?: AG04Tilstand; filter?: InnboksFilterId; oppf?: OppfStatus | null; haster?: boolean; tom?: boolean;
}) {
  const poster = byggInnboks(tom ? tomKilder : kilder(haster));
  return <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach" uleste={apneSaker(poster)} haster={innboksHaster(poster)}>
      <AG04Innboks tilstand={tilstand} poster={poster} startFilter={filter} startOppf={oppf} dagLabel="tirsdag 29. september"
        visSendt={false} harEpost godkjenn={tom ? tomGodkjenn : godkjenn} oppfolgingSpillere={tom ? 0 : 12}
        datakvalitet={tom ? { sjekket: 0, muligeDubletter: 0, runder: [] } : datakvalitet} />
    </AgencyOSSkall>
  </AdminRolleProvider>;
}
