/**
 * Prøvefil for AG-24 Drift i Precision Athletics.
 * Syntetiske testdata, ingen ekte personer eller produksjonsdatabase.
 */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import {
  AG24Drift,
  type AG24Data,
  type AG24Tilstand,
} from "@/components/admin/precision/AG24Drift";

export const sti = "/admin/drift";

const DATA: AG24Data = {
  gdpr: [
    { id: "g1", who: "Spiller under 16", role: "Spiller", by: "Forelder, bekreftet på e-post", at: "16.10.2026", due: "15.11.2026", scope: "Sletting av konto", st: "Venter" },
    { id: "g2", who: "Forelder A", role: "Forelder", by: "Forelderen selv", at: "14.10.2026", due: "13.11.2026", scope: "Innsyn", st: "Godkjent" },
    { id: "g3", who: "Voksen spiller", role: "Spiller", by: "Spilleren selv", at: "02.10.2026", due: "01.11.2026", scope: "Sletting av konto", st: "Slettet", doneAt: "08.10.2026" },
  ],
  audit: [
    { id: "a1", t: "20.10 10:31", who: "Coach A", what: "Godkjente utkast", obj: "Innboks" },
    { id: "a2", t: "20.10 09:58", who: "Coach A", what: "Endret rolle til Assist Coach", obj: "Coach B" },
    { id: "a3", t: "19.10 17:12", who: "Coach B", what: "Flyttet økt", obj: "Spiller 1" },
  ],
  errors: [
    { id: "f1", t: "20.10 13:41", lvl: "Feil", where: "/api/stripe/webhook", msg: "Stripe-webhook svarte 500", n: 3 },
    { id: "f2", t: "20.10 11:20", lvl: "Advarsel", where: "/oppgaver", msg: "Tidsavbrudd mot Notion", n: 2 },
  ],
};

function Vis({
  tilstand = "data",
  fane = "gdpr",
}: {
  tilstand?: AG24Tilstand;
  fane?: string;
}) {
  return (
    <AdminRolleProvider erAdmin>
      <AgencyOSSkall navn="Jonas Brekke" uleste={3} haster={false}>
        <AG24Drift tilstand={tilstand} startFane={fane} data={DATA} />
      </AgencyOSSkall>
    </AdminRolleProvider>
  );
}

export const tilstander = {
  data: <Vis tilstand="data" fane="gdpr" />,
  tom: <Vis tilstand="tom" fane="gdpr" />,
  laster: <Vis tilstand="laster" />,
  feil: <Vis tilstand="feil" />,
  audit: <Vis tilstand="data" fane="audit" />,
  feillogg: <Vis tilstand="data" fane="feil" />,
  hjelp: <Vis tilstand="data" fane="hjelp" />,
};
