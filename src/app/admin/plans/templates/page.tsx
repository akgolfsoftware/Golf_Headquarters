import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export default async function PlanTemplates() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const templates = await prisma.planTemplate.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <Link
        href="/admin/plans"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Plans
      </Link>

      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Maler
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Plan</em>-maler
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gjenbrukbare strukturer som kan brukes som utgangspunkt for nye planer.
        </p>
      </header>

      {templates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Ingen maler registrert. Maler opprettes ved å markere en plan som mal i en senere fase.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <article
              key={t.id}
              className="rounded-lg border border-border bg-card p-5"
            >
              <h3 className="font-display text-base font-semibold text-foreground">
                {t.name}
              </h3>
              {t.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.description}
                </p>
              )}
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                {t.weeks} uker
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
