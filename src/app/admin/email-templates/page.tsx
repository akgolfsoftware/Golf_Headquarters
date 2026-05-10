import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export default async function EmailTemplatesAdmin() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const templates = await prisma.emailTemplate.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          E-postmaler
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Mal</em>-bibliotek
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Slug-basert. Brukes av agent-pipeline for automatiske e-poster.
        </p>
      </header>

      {templates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Ingen maler registrert. CRUD-UI for opprettelse kommer i v2.
        </div>
      ) : (
        <ul className="space-y-3">
          {templates.map((t) => (
            <li
              key={t.id}
              className="rounded-lg border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {t.name}
                  </h3>
                  <code className="mt-1 inline-block rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {t.slug}
                  </code>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                    t.active
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {t.active ? "Aktiv" : "Inaktiv"}
                </span>
              </div>
              <p className="mt-3 text-sm text-foreground">
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Subject:{" "}
                </span>
                {t.subject}
              </p>
              <details className="mt-3">
                <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Vis innhold
                </summary>
                <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-xs text-foreground">
                  {t.body}
                </pre>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
