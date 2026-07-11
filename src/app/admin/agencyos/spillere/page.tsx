/**
 * AgencyOS Spillere (stall-liste) — v2. Prisma-loader og filter/søk-logikk
 * bevart 1:1 fra legacy-skjermen (admin/(legacy)/agencyos/spillere).
 * Lenket fra AdminSpillerProfilV2 ("Alle spillere").
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  SpillereListeV2,
  type SpillerRadData,
  type SpillereFilter,
  type SpillereListeV2Data,
} from "@/components/admin/v2/SpillereListeV2";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; filter?: string }>;

export default async function SpillereTabPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { q: qRaw, filter: filterRaw } = await searchParams;
  const q = (qRaw ?? "").trim().toLowerCase();
  const filter: SpillereFilter =
    filterRaw === "aktiv" || filterRaw === "abonnent" || filterRaw === "skylder" ? filterRaw : "alle";

  // 90 dager tilbake = "aktiv"
  const aktivCutoff = new Date();
  aktivCutoff.setDate(aktivCutoff.getDate() - 90);

  const spillere = await prisma.user.findMany({
    where: { role: "PLAYER" },
    include: {
      subscription: true,
      bookings: {
        orderBy: { startAt: "desc" },
        take: 1,
      },
      // Siste 8 SG-registreringer → trend-sparkline + nyeste SG total.
      sgInputs: {
        orderBy: { dato: "desc" },
        take: 8,
        select: { sgTotal: true },
      },
      // «Skylder» = minst én feilet betaling (charge gikk ikke gjennom).
      _count: { select: { bookings: true, payments: { where: { status: "FAILED" } } } },
    },
    orderBy: { name: "asc" },
    take: 200,
  });

  const rader: SpillerRadData[] = spillere.map((s) => {
    const navn = s.name || "Ukjent";
    const initialer = navn
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    const pakke = s.subscription?.tier ?? "Drop-in";
    const pakkeAktiv = s.subscription?.status === "ACTIVE";
    // sgInputs er desc (nyeste først). Trend skal være eldste → nyeste.
    const sgVerdier = s.sgInputs.map((i) => i.sgTotal).filter((v): v is number => v != null);
    const sgTrend = [...sgVerdier].reverse();
    return {
      id: s.id,
      navn,
      initialer,
      hcp: s.hcp,
      pakke,
      pakkeAktiv,
      sistMott: s.bookings[0]?.startAt?.toISOString() ?? null,
      totaltOkter: s._count.bookings,
      skylder: s._count.payments > 0,
      sgTotal: sgVerdier[0] ?? null,
      sgTrend,
    };
  });

  const filtrert = rader.filter((r) => {
    if (q && !r.navn.toLowerCase().includes(q)) return false;
    if (filter === "aktiv") return r.sistMott && new Date(r.sistMott) > aktivCutoff;
    if (filter === "abonnent") return r.pakkeAktiv;
    if (filter === "skylder") return r.skylder;
    return true;
  });

  const data: SpillereListeV2Data = {
    rader,
    filtrert,
    q,
    filter,
    filtere: [
      { key: "alle", label: "Alle", count: rader.length },
      {
        key: "aktiv",
        label: "Aktiv",
        count: rader.filter((r) => r.sistMott && new Date(r.sistMott) > aktivCutoff).length,
      },
      { key: "abonnent", label: "Abonnent", count: rader.filter((r) => r.pakkeAktiv).length },
      { key: "skylder", label: "Skylder", count: rader.filter((r) => r.skylder).length },
    ],
  };

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <SpillereListeV2 data={data} />
    </V2Shell>
  );
}
