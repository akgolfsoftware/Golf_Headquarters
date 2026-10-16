/** Prøvefil for Teknisk plan · oversikt (/admin/plan/teknisk). Syntetiske data. */
import { AG10Oversikt } from "@/components/admin/precision/AG10Oversikt";
import type { OversiktRad } from "@/lib/teknisk-plan/tp-oversikt";

export const sti = "/admin/plan/teknisk";
const rader: OversiktRad[] = [
  { id: "a", navn: "Testspiller Med Et Langt Etternavn", planId: "p1", planNavn: "Teknisk plan høst 2026", status: "Aktiv", oppgaver: 4, gjort: 342, maal: 690, sistRegistrert: "26.09.2026", antallPlaner: 2 },
  { id: "b", navn: "Testspiller To", planId: "p2", planNavn: "Vinterplan", status: "Utkast", oppgaver: 1, gjort: 12, maal: 0, sistRegistrert: "—", antallPlaner: 1 },
  { id: "c", navn: "Testspiller Tre", planId: null, planNavn: null, status: null, oppgaver: 0, gjort: 0, maal: 0, sistRegistrert: "—", antallPlaner: 0 },
];
export const tilstander = {
  data: <AG10Oversikt coachNavn="Testcoach" rader={rader} />,
  tom: <AG10Oversikt coachNavn="Testcoach" rader={[]} />,
};
