/**
 * PlayerHQ DataGolf-stasjon.
 *
 * Fasit: designsystem/train-lock/DG-14 Stasjon.dc.html
 * Avvik:
 *   - Se StasjonTrainLock.tsx — 14 slag, carry-felt, ferdig-tilstand på samme rute.
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { StasjonTrainLock } from "@/components/portal/v2/StasjonTrainLock";
import { hentStasjonSide } from "@/lib/datagolf/stasjon-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stasjon · DataGolf · PlayerHQ" };

export default async function DatagolfStasjonPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const sp = await searchParams;
  const en = (v: string | string[] | undefined) => (typeof v === "string" ? v : null);

  const data = await hentStasjonSide({
    takParam: en(sp.tak),
    slagParam: en(sp.slag),
    carryParam: en(sp.carry),
    lieParam: en(sp.lie),
  });

  return (
    <V2Shell bredde="full" aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <StasjonTrainLock
        key={
          data.stasjon
            ? `${data.stasjon.slag.id}-${data.valgtTak?.dgPlayerId ?? "ingen"}-${data.carryMeter}-${en(sp.lie)}`
            : "tom"
        }
        stasjon={data.stasjon}
        taker={data.taker.map((t) => ({ dgPlayerId: t.dgPlayerId, name: t.name }))}
        valgtTakId={data.valgtTak?.dgPlayerId ?? null}
        carryMeter={data.carryMeter}
        lie={en(sp.lie) === "rough" ? "rough" : "fairway"}
        andreSirkler={data.andreSirkler}
      />
    </V2Shell>
  );
}
