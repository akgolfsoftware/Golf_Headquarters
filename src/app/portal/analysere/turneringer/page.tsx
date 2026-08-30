/**
 * PlayerHQ · Din turneringshistorikk.
 *
 * Anders 2026-08-30: spillerens «hvor står jeg» = egen utvikling + egne
 * turneringsresultater. Dette er den andre halvdelen.
 *
 * Dataene er spillerens egne, offentlige resultater fra turneringsbasen —
 * ingen ny personopplysning oppstår ved å vise dem tilbake til den de gjelder.
 * Koblingen går via `User.publicPlayerId`; er den ikke satt, sier skjermen det
 * i klartekst i stedet for å se tom ut.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { TurneringshistorikkTrainLock } from "@/components/portal/v2/TurneringshistorikkTrainLock";
import { hentTurneringshistorikk } from "@/lib/portal/turneringshistorikk-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Turneringer · PlayerHQ" };

export default async function TurneringerPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const historikk = await hentTurneringshistorikk(user.id);

  return (
    <V2Shell bredde="kolonne" aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TilbakeLenke href="/portal/analysere">Tilbake til Analyse</TilbakeLenke>
        <TurneringshistorikkTrainLock h={historikk} />
      </div>
    </V2Shell>
  );
}
