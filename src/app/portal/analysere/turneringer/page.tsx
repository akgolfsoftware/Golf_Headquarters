/**
 * PlayerHQ · Min kurve (`/portal/analysere/turneringer`).
 *
 * Fasit: designsystem/train-lock/PH-21 Min kurve.dc.html (+ PH-21L lys) —
 * portert 05.09.2026 (MASTERPLAN Ø19). Erstatter den rene turneringslisten
 * som lå her (#666) med spillerens egen til-par-kurve, bånd for beste/verste
 * runde, sesongvelger og turneringshistorikk. Listen lever videre i coach-
 * speilet (`TurneringshistorikkTrainLock`), som er uendret.
 *
 * Anders 2026-08-30: spillerens «hvor står jeg» = egen utvikling + egne
 * turneringsresultater. Referansen er spilleren selv — ingen persentil, ingen
 * kullrangering her.
 *
 * Dataene er spillerens egne, offentlige resultater fra turneringsbasen —
 * ingen ny personopplysning oppstår ved å vise dem tilbake til den de gjelder.
 * Koblingen går via `User.publicPlayerId`; er den ikke satt, sier skjermen det
 * i klartekst i stedet for å se tom ut.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { MinKurveTrainLock, type SesongLenke } from "@/components/portal/v2/MinKurveTrainLock";
import { hentMinKurve } from "@/lib/portal/min-kurve-data";
import type { MinKurve } from "@/lib/domain/min-kurve";

export const dynamic = "force-dynamic";
export const metadata = { title: "Min kurve · PlayerHQ" };

const RUTE = "/portal/analysere/turneringer";

/** Fasiten viser de to nyeste sesongene + «Alle sesonger». */
function byggSesongLenker(kurve: MinKurve): SesongLenke[] {
  if (kurve.sesonger.length === 0) return [];
  const nyeste = kurve.sesonger.slice(0, 2);
  return [
    ...nyeste.map((s) => ({ label: String(s), href: `${RUTE}?sesong=${s}`, aktiv: kurve.valgtSesong === s })),
    { label: "Alle sesonger", href: `${RUTE}?sesong=alle`, aktiv: kurve.valgtSesong === "alle" },
  ];
}

export default async function TurneringerPage({ searchParams }: { searchParams: Promise<{ sesong?: string }> }) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const { sesong } = await searchParams;
  const { dataSistHentet, ...kurve } = await hentMinKurve(user.id, sesong);

  return (
    <V2Shell bredde="full" aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <MinKurveTrainLock
        kurve={kurve}
        dataSistHentet={dataSistHentet}
        sesongLenker={byggSesongLenker(kurve)}
        programHref="/portal/tren/turneringer"
        tilbakeHref="/portal/analysere"
      />
    </V2Shell>
  );
}
