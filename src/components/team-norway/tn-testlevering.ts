export type TestleveringStatus = 'Planlagt' | 'Fullført' | 'Mangler';
export type Testlevering = {
  id: string; playerId: string; testId: string; testName: string;
  scheduledAt: Date | null; status: TestleveringStatus; source: 'Tildeling' | 'Testdag';
};
/** Fullført krever et faktisk, koblet resultat. Ingen historiske enkelttester matches på navn. */
export function testleveringStatus({ fullfort, harResultat, frist, fravaerende = false, avsluttet = false, naa }: {
  fullfort: boolean; harResultat: boolean; frist: Date | null; fravaerende?: boolean; avsluttet?: boolean; naa: Date;
}): TestleveringStatus {
  if (fullfort && harResultat) return 'Fullført';
  if (fravaerende || avsluttet || (frist !== null && frist.getTime() < naa.getTime())) return 'Mangler';
  return 'Planlagt';
}
export function oppsummerTestlevering(rader: readonly Testlevering[]) {
  const fullfort = rader.filter(r => r.status === 'Fullført').length;
  const planlagt = rader.filter(r => r.status === 'Planlagt').length;
  const mangler = rader.filter(r => r.status === 'Mangler').length;
  return { tildelt: rader.length, fullfort, planlagt, mangler, leveringsgrad: rader.length ? fullfort / rader.length : null };
}
