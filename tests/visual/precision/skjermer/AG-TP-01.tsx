/** Prøvefil for AG-TP-01 Oppgaveskjema. Syntetiske data. */
import { AG10TekniskPlan } from "@/components/admin/precision/AG10TekniskPlan";
import { TOMT_SKJEMA, oppgaveVisning, skjemaFraOppgave } from "@/lib/teknisk-plan/tp-visning";
import { t1, tpPlan } from "./_tp-data";

export const sti = "/admin/spillere/u1/plan/plan1";
const spiller = { id: "u1", navn: "Testspiller" };

export const tilstander = {
  rediger: <AG10TekniskPlan coachNavn="Testcoach" spiller={spiller} plan={tpPlan} planAktiv={false}
    skjema={{ skjema: skjemaFraOppgave(t1, "P7.0"), base: oppgaveVisning(t1, "P7.0") }} />,
  ny: <AG10TekniskPlan coachNavn="Testcoach" spiller={spiller} plan={tpPlan} planAktiv skjema={{ skjema: TOMT_SKJEMA, base: null }} />,
};
