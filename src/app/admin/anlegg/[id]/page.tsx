/**
 * CoachHQ — Anlegg-detalj per lokasjon (KART + KALENDER).
 *
 * URL: /admin/anlegg/[id]
 *   - [id] = Location.id (cuid)
 *
 * To visnings-moduser:
 *   - KART: interaktivt SVG-kart med klikkbare fasilitets-hotspots
 *   - KALENDER: én rad per fasilitet × tidsblokker for valgt dag
 *
 * Refaktorert til DetailShell-mønster (plan Del 7).
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { Building2, MapPin } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { DetailShell } from "@/components/shared/detail-shell";
import { KPICard } from "@/components/ui/kpi-card";
import { AthleticBadge } from "@/components/athletic/badge";
import { AnleggDetailView } from "./anlegg-detail-view";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ dag?: string; tab?: string }>;

export default async function AnleggDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;
  const q = searchParams ? await searchParams : {};

  const naa = new Date();
  const parsed = q.dag ? new Date(q.dag) : null;
  const dag = parsed && !isNaN(parsed.getTime()) ? parsed : new Date(naa);
  dag.setHours(0, 0, 0, 0);
  const dagSlutt = new Date(dag);
  dagSlutt.setDate(dag.getDate() + 1);

  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      facilities: {
        where: { active: true },
        orderBy: [{ mapX: "asc" }, { name: "asc" }],
        include: {
          bookings: {
            where: {
              startAt: { gte: dag, lt: dagSlutt },
              status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
            },
            select: {
              id: true,
              startAt: true,
              endAt: true,
              status: true,
              notes: true,
              user: { select: { id: true, name: true } },
              serviceType: { select: { name: true } },
            },
            orderBy: { startAt: "asc" },
          },
        },
      },
      _count: {
        select: {
          facilities: { where: { active: true } },
        },
      },
    },
  });

  if (!location) notFound();

  // Telle bookinger på tvers av fasiliteter
  let opptattNaa = 0;
  let bookingerIDag = 0;
  let ledigNaa = 0;
  for (const f of location.facilities) {
    bookingerIDag += f.bookings.length;
    const aktiv = f.bookings.find(
      (b) => b.startAt <= naa && b.endAt >= naa && b.status !== "CANCELLED",
    );
    if (aktiv) {
      opptattNaa++;
    } else {
      ledigNaa++;
    }
  }

  const viewData = {
    location: {
      id: location.id,
      name: location.name,
      address: location.address,
    },
    facilities: location.facilities.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      capacity: f.capacity,
      isIndoor: f.isIndoor,
      description: f.description,
      mapX: f.mapX,
      mapY: f.mapY,
      bookings: f.bookings.map((b) => ({
        id: b.id,
        startAt: b.startAt.toISOString(),
        endAt: b.endAt.toISOString(),
        status: b.status,
        notes: b.notes,
        userName: b.user?.name ?? null,
        serviceName: b.serviceType?.name ?? null,
      })),
    })),
    stats: {
      total: location._count.facilities,
      opptattNaa,
      bookingerIDag,
      ledigNaa,
    },
    dagISO: dag.toISOString(),
  };

  const navnFirstWord = location.name.split(" ")[0];

  return (
    <DetailShell
      breadcrumb={[
        { label: "Anlegg", href: "/admin/anlegg" },
        { label: location.name },
      ]}
      backHref="/admin/anlegg"
      title={
        <>
          {navnFirstWord}{" "}
          <em
            className="not-italic"
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontStyle: "italic",
              color: "hsl(var(--primary))",
            }}
          >
            anlegg
          </em>
        </>
      }
      subtitle={location.address ?? undefined}
      statusPill={
        opptattNaa > 0 ? (
          <AthleticBadge variant="warn">
            {opptattNaa} OPPTATT
          </AthleticBadge>
        ) : (
          <AthleticBadge variant="ok">{ledigNaa} LEDIG</AthleticBadge>
        )
      }
      actions={
        <Link
          href={`/admin/bookings/ny?locationId=${location.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-accent hover:brightness-110"
        >
          <Building2 size={14} strokeWidth={1.75} aria-hidden />
          Ny booking
        </Link>
      }
      kpiRow={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KPICard
            eyebrow="Fasiliteter"
            value={String(viewData.stats.total)}
            variant="hero"
            icon={<MapPin size={18} strokeWidth={1.75} aria-hidden />}
          />
          <KPICard
            eyebrow="Opptatt nå"
            value={String(viewData.stats.opptattNaa)}
            variant={viewData.stats.opptattNaa > 0 ? "warn" : "default"}
          />
          <KPICard
            eyebrow="Bookinger i dag"
            value={String(viewData.stats.bookingerIDag)}
          />
          <KPICard
            eyebrow="Ledig nå"
            value={String(viewData.stats.ledigNaa)}
            variant={viewData.stats.ledigNaa === 0 ? "danger" : "default"}
          />
        </div>
      }
    >
      <AnleggDetailView data={viewData} />
    </DetailShell>
  );
}
