/**
 * AG-02 Kø — kobling fra knapp til server action.
 *
 * Hver handling i køen kaller den SAMME server actionen som de gamle
 * kø-komponentene brukte før portingen til Precision Athletics (PR #1173):
 *   - PlanAction (agent):      acceptPlanAction / rejectPlanAction
 *     (AdminGodkjenningerV2, AdminAgenticosGodkjenn)
 *   - Caddie-utkast:           godkjennCaddieDraft / avvisProaktivtForslag
 *     (AdminGodkjenningerV2)
 *   - Økt-forespørsel:         markerSomPlanlagt / avslaaForespørsel
 *     (AdminGodkjenningerV2)
 *   - Foreslått test:          godkjennForslag / avvisForslag
 *     (AdminForeslatteTesterV2)
 *   - Turneringsdublett:       mergeTurneringer (MergeDubletterListe)
 *   - Moderering/GDPR:         godkjennSak / avvisSak / utforGdprSletting
 *     (ModeringClientV2)
 *
 * Ingen ny forretningslogikk her — bare ett felles resultatformat, slik at
 * skjermen viser suksess først når serveren har svart ok, og feil ellers.
 */

import { acceptPlanAction, rejectPlanAction } from "@/lib/agents/actions";
import { avvisProaktivtForslag, godkjennCaddieDraft } from "@/app/admin/agencyos/caddie/dashbord/actions";
import { avslaaForespørsel, markerSomPlanlagt } from "@/app/admin/(legacy)/foresporsler/actions";
import { avvisForslag, godkjennForslag } from "@/app/admin/tester/foreslatte/actions";
import { mergeTurneringer } from "@/app/admin/tournaments/actions";
import { avvisSak, godkjennSak, utforGdprSletting } from "@/app/admin/(legacy)/stats/moderering/actions";

export type KoHandling =
  | { type: "plan-godkjenn"; id: string }
  | { type: "plan-avvis"; id: string }
  | { type: "caddie-send"; id: string }
  | { type: "caddie-forkast"; id: string }
  | { type: "foresporsel-planlagt"; id: string }
  | { type: "foresporsel-avslaa"; id: string }
  | { type: "test-godkjenn"; id: string }
  | { type: "test-avvis"; id: string }
  | { type: "dublett-slaa-sammen"; kildeId: string; malId: string }
  | { type: "moderering-godkjenn"; id: string }
  | { type: "moderering-avvis"; id: string }
  | { type: "moderering-gdpr-utfor"; id: string };

export type KoResultat = { ok: true; meta?: string } | { ok: false; feil: string };

const FALLBACK_FEIL = "Handlingen ble ikke lagret. Prøv igjen.";

export async function utforKoHandling(h: KoHandling): Promise<KoResultat> {
  try {
    switch (h.type) {
      case "plan-godkjenn":
        await acceptPlanAction(h.id);
        return { ok: true };
      case "plan-avvis":
        await rejectPlanAction(h.id);
        return { ok: true };
      case "caddie-send": {
        const res = await godkjennCaddieDraft(h.id);
        return res.ok ? { ok: true } : { ok: false, feil: res.summary || FALLBACK_FEIL };
      }
      case "caddie-forkast": {
        const res = await avvisProaktivtForslag(h.id);
        return res.ok ? { ok: true } : { ok: false, feil: "Utkastet kunne ikke forkastes." };
      }
      case "foresporsel-planlagt":
        await markerSomPlanlagt(h.id);
        return { ok: true };
      case "foresporsel-avslaa":
        await avslaaForespørsel(h.id);
        return { ok: true };
      case "test-godkjenn":
        await godkjennForslag({ id: h.id });
        return { ok: true };
      case "test-avvis":
        await avvisForslag({ id: h.id });
        return { ok: true };
      case "dublett-slaa-sammen": {
        const res = await mergeTurneringer({ sourceId: h.kildeId, targetId: h.malId });
        if (!res.ok) return { ok: false, feil: res.feil };
        const { entries, results, participants } = res.flyttet;
        return {
          ok: true,
          meta: `FLYTTET ${entries} PÅMELDINGER, ${results} RESULTATER, ${participants} DELTAKERE`,
        };
      }
      case "moderering-godkjenn":
        await godkjennSak(h.id);
        return { ok: true };
      case "moderering-avvis":
        await avvisSak(h.id);
        return { ok: true };
      case "moderering-gdpr-utfor":
        await utforGdprSletting(h.id);
        return { ok: true };
    }
  } catch (err) {
    return { ok: false, feil: err instanceof Error && err.message ? err.message : FALLBACK_FEIL };
  }
}
