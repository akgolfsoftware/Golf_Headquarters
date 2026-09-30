/**
 * Prøvefil for AG-04-REST: rediger e-postmal. Syntetiske data, ingen ekte
 * spillere. Kø og Kommunikasjon er ikke med (utenfor denne PR-en).
 */
import { TriangleAlert } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { FeilTilstand, LasterTilstand } from "@/components/precision/pa";
import { AG04MalRediger, type AG04MalData } from "@/components/admin/precision/AG04MalRediger";
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

export const tilstander = {
  data: Skall(<AG04MalRediger mal={mal} testMottaker="coach@eksempel.no" />),
  lang: Skall(<AG04MalRediger mal={langMal} testMottaker="coach@eksempel.no" />),
  tom: Skall(<AG04MalRediger mal={tomMal} testMottaker="coach@eksempel.no" />),
  laster: Skall(<div className="pa-side"><LasterTilstand text="Henter malen …" /></div>),
  feil: Skall(<div className="pa-side"><FeilTilstand icon={TriangleAlert} title="Malen kunne ikke hentes" text="Ingenting er endret eller sendt. Prøv igjen." code="FEIL 500" /></div>),
  "natt-data": <Natt>{Skall(<AG04MalRediger mal={mal} testMottaker="coach@eksempel.no" />)}</Natt>,
};

export const natt: string[] = ["natt-data"];
