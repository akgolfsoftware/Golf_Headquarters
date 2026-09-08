/**
 * Tak-pakken — navngitte DataGolf-proffer økten sammenlignes mot.
 * Nye navn: legg til en rad. Ingen skjemaendring.
 *
 * formLabel er coaching-setning (formen), ikke et måltall.
 */
export type TakRosterRad = {
  dgId: number;
  sortOrder: number;
  formLabel: string;
  displayName?: string;
};

export const TAK_ROSTER: readonly TakRosterRad[] = [
  { dgId: 18417, sortOrder: 1, formLabel: "Innspill" },
  { dgId: 10091, sortOrder: 2, formLabel: "Tee og 200 m" },
  { dgId: 18841, sortOrder: 3, formLabel: "Innspill" },
  { dgId: 21407, sortOrder: 4, formLabel: "Norsk PGA" },
  { dgId: 23950, sortOrder: 5, formLabel: "Innspill", displayName: "Ludvig Åberg" },
  { dgId: 19195, sortOrder: 6, formLabel: "Tee og innspill" },
];

export const TAK_ROSTER_IDS: ReadonlySet<number> = new Set(
  TAK_ROSTER.map((r) => r.dgId),
);
