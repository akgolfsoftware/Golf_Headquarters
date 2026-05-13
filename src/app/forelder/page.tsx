// Foreldreportal — Oversikt. Hero + barn-kort.

import Link from "next/link";
import { CalendarDays, TrendingUp, Star } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";

const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
  weekday: "short",
});

export default async function ForelderHjem() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);

  if (barn.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Foreldreportal"
          titleLead="Velkommen,"
          titleItalic={user.name.split(" ")[0] ?? user.name}
          sub="Du er ikke koblet til noen barn ennå."
        />
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Be spilleren sende en ny invitasjon, eller kontakt support.
        </div>
      </div>
    );
  }

  // For hvert barn: hent neste planlagte økt og siste rating.
  const barnMedKontekst = await Promise.all(
    barn.map(async (b) => {
      const nesteOkt = await prisma.trainingPlanSession.findFirst({
        where: {
          plan: { userId: b.child.id },
          status: { in: ["PLANNED", "ACTIVE"] },
          scheduledAt: { gte: new Date() },
        },
        orderBy: { scheduledAt: "asc" },
        select: { title: true, scheduledAt: true },
      });
      const sisteLogg = await prisma.trainingPlanSessionLog.findFirst({
        where: {
          completedAt: { not: null },
          session: { plan: { userId: b.child.id } },
        },
        orderBy: { completedAt: "desc" },
        select: { rating: true, completedAt: true },
      });
      return { ...b, nesteOkt, sisteLogg };
    })
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Foreldreportal · Oversikt"
        titleLead="Hei"
        titleItalic={user.name.split(" ")[0] ?? user.name}
        sub={`Du følger ${barn.length === 1 ? "ett barn" : `${barn.length} barn`} i AK Golf.`}
      />

      <div className={`grid gap-4 ${barn.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
        {barnMedKontekst.map((b) => (
          <Link
            key={b.child.id}
            href={`/forelder/barn/${b.child.id}`}
            className="block rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {b.relationship} · HCP {b.child.hcp ?? "—"}
            </div>
            <h2 className="mt-1 font-display text-2xl">
              <em className="italic">{b.child.name.split(" ")[0]}</em>{" "}
              {b.child.name.split(" ").slice(1).join(" ")}
            </h2>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  <CalendarDays className="h-3 w-3" strokeWidth={1.5} />
                  Neste økt
                </dt>
                <dd className="mt-1 font-semibold">
                  {b.nesteOkt
                    ? `${NB_DATO.format(b.nesteOkt.scheduledAt)} · ${b.nesteOkt.title}`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  <Star className="h-3 w-3" strokeWidth={1.5} />
                  Siste rating
                </dt>
                <dd className="mt-1 font-semibold">
                  {b.sisteLogg?.rating != null ? `${b.sisteLogg.rating}/5` : "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.5} />
              Se full profil →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
