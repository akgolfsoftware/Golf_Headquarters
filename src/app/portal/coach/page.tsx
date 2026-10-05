// PH21Innboks — Precision Athletics. Data og handlinger er beholdt.
import { redirect } from "next/navigation";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getPH21Data } from "@/lib/portal-coach/ph21-queries";
import { parsePH21Tab } from "@/lib/portal-coach/ph21-data";
import { PH21Innboks } from "@/components/portal/precision/PH21Innboks";

export const dynamic = "force-dynamic";

export default async function PortalCoachPage(props: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const tab = parsePH21Tab(searchParams?.tab);
  const data = await getPH21Data(user.id);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
        <PH21Innboks data={data} initialTab={tab} />
      </div>
    </PlayerHQSkall>
  );
}
