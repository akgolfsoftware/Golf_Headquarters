export type OrgGruppeOppgave = {
  id: string; playerId: string; spillerNavn: string; gruppeOkt: string; date: string; startMinute: number; durationMinutes: number;
  title: string; maalsetning?: string | null; pyramid: string; status: string; actualMinutes: number | null; loggedReps: number | null; updatedAt: string;
};
export type OrgGruppeOkt = { id: string; date: string; startMinute: number; durationMinutes: number; title: string; drills: { id: string; title: string; durationMinutes: number }[] };
export type OrgGruppeOppgaverData = { groupId: string; groupName: string; gruppeOkter?: OrgGruppeOkt[]; oppgaver: OrgGruppeOppgave[] };
/** A group assignment may use less of the group's time, but may not leave the slot. */
export function orgOppgaveInnenGruppetid(kilde: { date: Date; startMinute: number; durationMinutes: number }, oppgave: { date: Date; startMinute: number; durationMinutes: number }) {
  return kilde.date.getTime() === oppgave.date.getTime() && oppgave.durationMinutes > 0 && oppgave.startMinute >= kilde.startMinute && oppgave.startMinute + oppgave.durationMinutes <= kilde.startMinute + kilde.durationMinutes;
}
export function oppsummerOrgBelastning(oppgaver: readonly OrgGruppeOppgave[]) {
  const registrert = oppgaver.filter(o => o.actualMinutes !== null);
  return { planlagtMinutter: oppgaver.reduce((sum, o) => sum + o.durationMinutes, 0), faktiskMinutter: registrert.length ? registrert.reduce((sum, o) => sum + (o.actualMinutes ?? 0), 0) : null, medRegistrertTid: registrert.length, antall: oppgaver.length };
}
