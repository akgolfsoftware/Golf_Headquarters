/**
 * /admin/bookinger/ny — Manuell oppretting av booking for coach/admin.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NyBookingPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [spillere, tjenester] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PLAYER", deletedAt: null },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.serviceType.findMany({
      where: { active: true },
      select: { id: true, name: true, durationMin: true, priceOre: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8">
          <Link
            href="/admin/bookinger"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Tilbake til bookinger
          </Link>
        </div>

        <h1 className="font-display text-2xl font-semibold text-foreground">
          Ny booking
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Opprett en manuell booking for en spiller.
        </p>

        <div className="mt-8 space-y-6 rounded-lg border border-border bg-card p-6">
          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <User className="mr-1 inline h-3.5 w-3.5" />
              Spiller
            </label>
            <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Velg spiller...</option>
              {spillere.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <Calendar className="mr-1 inline h-3.5 w-3.5" />
              Tjeneste
            </label>
            <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Velg tjeneste...</option>
              {tjenester.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.durationMin} min — {Math.round(t.priceOre / 100)} kr
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Dato
              </label>
              <input
                type="date"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                <Clock className="mr-1 inline h-3.5 w-3.5" />
                Starttid
              </label>
              <input
                type="time"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Notat (valgfritt)
            </label>
            <textarea
              rows={3}
              placeholder="Intern merknad om bookingen..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/admin/bookinger"
              className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Avbryt
            </Link>
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Opprett booking
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Manuell booking sender ingen automatisk bekreftelse. Bruk dette for drop-in-timer og ad hoc-justeringer.
        </p>
      </div>
    </div>
  );
}
