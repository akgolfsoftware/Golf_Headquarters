/** Legacy HQ writer. DataGolf proffiler må ikke kopieres til appdatabasen. */

export async function syncDatagolfTak(): Promise<{
  roster: number;
  upserted: number;
  manglerSkill: number[];
  manglerApproach: number[];
  asOf: string;
}> {
  throw new Error(
    "DataGolf-synk blokkert i HQ. Bruk kun isolert pipeline etter dokumentert rettighetskontroll.",
  );
}
