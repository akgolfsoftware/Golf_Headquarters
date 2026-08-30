import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/**
 * Pensjonert 2026-08-29. Den nyere 5-stegs byggeren på
 * `/portal/planlegge/bygger` har siden 10. juli vært ment som spillerens
 * inngang — den sier det selv i toppkommentaren sin — men denne adressen ble
 * aldri stengt, så begge levde som fungerende, parallelle innganger.
 *
 * Kjernelogikken deles allerede via `src/lib/plan-builder/`, så ingen
 * funksjonalitet forsvinner med adressen.
 *
 * Etterlater to filer uten referanser: `components/portal/v2/MalByggerV2.tsx`
 * og `app/portal/mal/bygger/actions.ts`. De er bevisst ikke slettet i samme
 * endring — `sendTilGodkjenning` finnes ikke i den nye flyten, og det bør
 * avklares om den skal med før koden fjernes.
 */
export default async function MalByggerRedirect(): Promise<never> {
  await requirePortalUser({ kreverTilgang: "FULL" });
  redirect("/portal/planlegge/bygger");
}
