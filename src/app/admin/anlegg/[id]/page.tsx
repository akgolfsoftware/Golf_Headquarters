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
 * Server Component med Prisma. Tab-toggle og interaksjon i client-child.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
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

  // Velg dag (default: i dag) som 7-radskalenderen rendrer
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

  // Telle bookinger på tvers av fasiliteter (for status-strip)
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

  // Serializer for client-komponenten — Prisma Date → ISO-string
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.10em] text-muted-foreground">
        <Link
          href="/admin/anlegg"
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft size={12} strokeWidth={1.75} />
          Alle anlegg
        </Link>
      </div>

      <PageHeader
        eyebrow={`CoachHQ · ${location.name.toUpperCase()} · ${viewData.stats.total} FASILITETER`}
        titleLead={location.name.split(" ")[0]}
        titleItalic="anlegg"
        titleTrail="— kalender, booking og aktivitet"
        sub={location.address}
        actions={
          <Link
            href={`/admin/bookings/new?locationId=${location.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Building2 size={14} strokeWidth={1.75} />
            Ny booking
          </Link>
        }
      />

      <AnleggDetailView data={viewData} />
    </div>
  );
}
