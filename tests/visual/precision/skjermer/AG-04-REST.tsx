/**
 * Prøvefil for AG-04-REST: rediger e-postmal, Kø og Kommunikasjon (restfaner).
 * Syntetiske data, ingen ekte spillere. Kø/Kommunikasjon viser innholdet med
 * Precision-komponenter (Train-lock-innholdet i fanene har ingen tegning og
 * måles i sin egen prøve når det portes).
 */
import { ClipboardX, TriangleAlert, CircleCheck } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { FeilTilstand, LasterTilstand, TomTilstand } from "@/components/precision/pa";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { Side } from "@/components/precision/pa-a4";
import { AG04MalRediger, type AG04MalData } from "@/components/admin/precision/AG04MalRediger";
import { AG04RestHode } from "@/components/admin/precision/AG04RestHode";
import { Natt } from "./_natt";

export const sti = "/admin/email-templates/mal1/rediger";

const mal: AG04MalData = {
  id: "mal1", slug: "booking-bekreftelse", name: "Bookingbekreftelse", active: true,
  subject: "Din time {{okt_dato}} kl. {{okt_tid}}",
  body: "Hei {{spillerFornavn}},\n\nDin time er bekreftet {{okt_dato}} kl. {{okt_tid}} på {{okt_lokasjon}}.\n\nMed vennlig hilsen\n{{coachNavn}}",
};
const tomMal: AG04MalData = { ...mal, id: "mal2", slug: "ny-mal", name: "", subject: "", body: "", active: false };
const langMal: AG04MalData = { ...mal, name: "Oppfølging etter coachingtime med et veldig langt navn som må brytes riktig", subject: "Takk for timen {{spillerNavn}} og velkommen til {{klubbNavn}} sin oppfølging", body: "https://akgolf.no/portal/en/veldig/lang/lenke/som/ikke/har/mellomrom/og/må/brytes/riktig/uten/sidelengs/rulling" };

const Skall = (c: React.ReactNode) => <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach">{c}</AgencyOSSkall></AdminRolleProvider>;

const koFaner = [
  { id: "agentko", label: "Agent-kø", href: "/admin/ko?fane=agentko" },
  { id: "agentgodkjenn", label: "Agent-godkjenning", href: "/admin/ko?fane=agentgodkjenn" },
  { id: "tester", label: "Foreslåtte tester", href: "/admin/ko?fane=tester" },
  { id: "dubletter", label: "Dubletter", href: "/admin/ko?fane=dubletter" },
  { id: "moderering", label: "Moderering", href: "/admin/ko?fane=moderering" },
];
const kommFaner = [
  { id: "innboks", label: "Innboks", href: "/admin/kommunikasjon?fane=innboks" },
  { id: "utkast", label: "Utkast", href: "/admin/kommunikasjon?fane=utkast" },
  { id: "sendt", label: "Sendt", href: "/admin/kommunikasjon?fane=sendt" },
  { id: "maler", label: "Maler", href: "/admin/kommunikasjon?fane=maler" },
];
const Ko = (innhold: React.ReactNode, antall = { agentko: 3, dubletter: 2, tester: 1 }) => Skall(<Side>
  <AG04RestHode kicker="Innboks · Kø" title="Kø" sub="Alt som krever deg i dag. Én adresse — fanene bytter innhold, ikke side." faner={koFaner} aktiv="dubletter" antall={antall} />
  {innhold}
</Side>);
const Komm = (innhold: React.ReactNode) => Skall(<Side>
  <AG04RestHode kicker="Innboks · Kommunikasjon" title="Kommunikasjon" sub="E-post, meldinger og maler ett sted. Utkast skrives her — sending krever alltid ditt ja." faner={kommFaner} aktiv="maler" antall={{ maler: 6 }} />
  {innhold}
</Side>);

export const tilstander = {
  data: Skall(<AG04MalRediger mal={mal} testMottaker="coach@eksempel.no" />),
  lang: Skall(<AG04MalRediger mal={langMal} testMottaker="coach@eksempel.no" />),
  tom: Skall(<AG04MalRediger mal={tomMal} testMottaker="coach@eksempel.no" />),
  laster: Skall(<div className="pa-side"><LasterTilstand text="Henter malen …" /></div>),
  feil: Skall(<div className="pa-side"><FeilTilstand icon={TriangleAlert} title="Malen kunne ikke hentes" text="Ingenting er endret eller sendt. Prøv igjen." code="FEIL 500" /></div>),
  "ko-data": Ko(<InlineVarsel tittel="Slik fungerer sammenslåing.">Når du slår sammen en manuell turnering inn i en kanonisk turnering, flyttes alle påmeldinger, resultater og deltakerlister automatisk.</InlineVarsel>),
  "ko-tom": Ko(<TomTilstand icon={CircleCheck} title="Ingen ventende dubletter" text="Når spillere legger til manuelle turneringer som matcher en kjent kilde, vises de her for vurdering." />, {} as never),
  "ko-feil": Ko(<FeilTilstand icon={ClipboardX} title="Køen kunne ikke hentes" text="Ingenting er godkjent eller avvist. Prøv igjen." code="FEIL 500" />),
  "komm-data": Komm(<TomTilstand icon={CircleCheck} title="Maler" text="Malelisten vises her." />),
  "komm-laster": Komm(<LasterTilstand text="Henter kommunikasjon …" />),
  "natt-data": <Natt>{Skall(<AG04MalRediger mal={mal} testMottaker="coach@eksempel.no" />)}</Natt>,
  "natt-ko": <Natt>{Ko(<InlineVarsel tittel="Slik fungerer sammenslåing.">Innhold i nattemaet.</InlineVarsel>)}</Natt>,
};

export const natt: string[] = ["natt-data", "natt-ko"];
