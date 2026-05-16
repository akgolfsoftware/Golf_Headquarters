import { redirect } from "next/navigation";

/**
 * /admin er nå sammenslått med /admin/agencyos.
 * AgencyOS-utseendet er valgt som hovedhub for coach Anders — derfra får han
 * morgenbrief, KPIer, Til godkjenning, Dagens flyt og connectors i ett blikk.
 *
 * Hub-spesifikke widgets (aktive spillere, snitt SG-trend, belegg %, spillere
 * uten plan, tester forfaller, utestående faktura) sluses inn på AgencyOS-siden
 * i etterfølgende PR.
 */
export default function AdminHubRedirect(): never {
  redirect("/admin/agencyos");
}
