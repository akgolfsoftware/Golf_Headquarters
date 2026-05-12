/**
 * CoachHQ — Ny booking (standalone)
 *
 * Standalone-form for å opprette ny booking uten å gå via kalender-modalen.
 * Bruker samme server action (`opprettOktPaaTid`) som kalenderen.
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { NyBookingForm } from "./ny-booking-form";

export default async function NyBookingAdminPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [spillere, services, lokasjoner] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PLAYER" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.serviceType.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        durationMin: true,
        priceOre: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={12} strokeWidth={1.75} />
          Tilbake til bookinger
        </Link>
      </div>

      <PageHeader
        eyebrow="CoachHQ · Ny booking"
        titleLead="Opprett"
        titleItalic="økt"
        sub="Manuell registrering av en booking. Brukes når du legger inn økter utenom det vanlige booking-flow."
      />

      <div className="rounded-2xl border border-border bg-card p-6">
        <NyBookingForm
          spillere={spillere}
          services={services}
          lokasjoner={lokasjoner}
        />
      </div>
    </div>
  );
}
