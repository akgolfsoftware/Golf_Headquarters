/**
 * Sesongene i profilen regnes på nytt med den felles regelen for brutto snitt (brutto-snitt.ts), så
 * databasens egen snittscore (`v_person_sesong`) aldri vises. Turneringslista brukes, ikke rundelista,
 * fordi rundelista bare har de 60 siste rundene. Ren funksjon.
 */

import { beregnBruttoSnitt } from "@/lib/domain/brutto-snitt";
import { tilTurneringer } from "./til-turneringer";
import type { Spillerprofil } from "./typer";

export function medFellesSesongsnitt<T extends Pick<Spillerprofil, "sesonger" | "turneringer">>(profil: T): T {
  const turneringer = tilTurneringer(profil.turneringer);
  return {
    ...profil,
    sesonger: profil.sesonger.map((s) => {
      const { turnering } = beregnBruttoSnitt({ turneringer, treningsrunder: [], aar: s.year });
      return { ...s, runder: turnering.runder, snitt_score: turnering.snitt };
    }),
  };
}
