/**
 * PH-17 TrackMan: alle økter — nytt design (pakke 6, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html, skjerm «trackman».
 * Avvik:
 *   - Avvikene mot utkastet står øverst i PH17TmOkter.tsx.
 * Filteret lever i adressen og gjelder også Alle køller og én økt.
 * Gamle faner: Gapping og Utstyr er Alle køller, Stasjon er Data Golf-stasjonen.
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH17TmOkter, type TmOktKort } from "@/components/portal/precision/PH17TmOkter";
import { hentTmOkter } from "@/lib/portal-analyse/load-trackman-stats";
import {
  TM_HAST_NAVN, filtrerOkter, lesTmFilter, oktHast, oktKoller, oktNavn, periodeFra, sorterKoller, tellende, tmFilterSok, utviklingPunkter,
} from "@/lib/portal-analyse/trackman-stats";
import { getUnreadNotifications } from "@/app/portal/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "TrackMan · PlayerHQ" };

type Sok = Record<string, string | string[] | undefined>;

export default async function TrackManPage({ searchParams }: { searchParams?: Promise<Sok> }) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const sok = searchParams ? await searchParams : {};
  const filter = lesTmFilter(sok);
  const fane = sok.fane ?? sok.tab;
  if (fane === "gap" || fane === "utstyr") redirect(`/portal/analysere/trackman/koller${tmFilterSok(filter)}`);
  if (fane === "stasjon") redirect("/portal/analysere/datagolf/stasjon");

  const naa = new Date();
  // Sesong er det lengste valget, og den eneste perioden som kan gå lenger tilbake enn 90 dager.
  const fra = new Date(Math.min(periodeFra("sesong", naa).getTime(), periodeFra("90d", naa).getTime()));
  const [alle, uleste] = await Promise.all([hentTmOkter(user.id, fra), getUnreadNotifications(user.id, 1)]);

  const iPerioden = filtrerOkter(alle, filter, naa, true);
  const okter = filtrerOkter(alle, filter, naa);
  const kort: TmOktKort[] = okter.map((o) => {
    const h = oktHast(o.slag);
    return {
      id: o.id, dato: o.dato, navn: oktNavn(o), akse: o.plan ? "tek" : "slag",
      antall: tellende(o.slag, filter).length, koller: oktKoller(o), sted: o.sted, hast: h ? TM_HAST_NAVN[h] : null,
    };
  });

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH17TmOkter
        data={{
          filter,
          okter: kort,
          slag: kort.reduce((a, o) => a + o.antall, 0),
          koller: new Set(okter.flatMap((o) => o.slag.map((s) => s.kolle))).size,
          kolleValg: sorterKoller(iPerioden.flatMap((o) => o.slag.map((s) => s.kolle))),
          utvikling: utviklingPunkter(iPerioden, filter),
          harOkter: alle.length > 0,
        }}
      />
    </PlayerHQSkall>
  );
}
