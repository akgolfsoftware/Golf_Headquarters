/**
 * PH-17 TrackMan: alle køller — nytt design (pakke 6, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html, skjerm «koller».
 * Avvik:
 *   - Avvikene mot utkastet står øverst i PH17TmKoller.tsx.
 * Erstatter fanene Gapping og Utstyr. Samme filter som TrackMan-økter (i adressen).
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH17TmKoller } from "@/components/portal/precision/PH17TmKoller";
import { hentTmOkter } from "@/lib/portal-analyse/load-trackman-stats";
import {
  filtrerOkter, gapping, kolleOppsummering, lesTmFilter, periodeFra, sorterKoller, utstyrsEndringer, utviklingPunkter,
} from "@/lib/portal-analyse/trackman-stats";
import { getUnreadNotifications } from "@/app/portal/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Alle køller · TrackMan · PlayerHQ" };

export default async function TrackManKollerPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const filter = lesTmFilter(searchParams ? await searchParams : {});
  const naa = new Date();
  const [alle, uleste] = await Promise.all([hentTmOkter(user.id, periodeFra(filter.periode, naa)), getUnreadNotifications(user.id, 1)]);
  const iPerioden = filtrerOkter(alle, filter, naa, true);
  const okter = filtrerOkter(alle, filter, naa);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH17TmKoller
        data={{
          filter,
          rader: kolleOppsummering(okter, filter),
          gapping: gapping(okter, filter),
          utstyr: utstyrsEndringer(utviklingPunkter(okter, filter)),
          kolleValg: sorterKoller(iPerioden.flatMap((o) => o.slag.map((s) => s.kolle))),
        }}
      />
    </PlayerHQSkall>
  );
}
