import { Mail } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TemplateForm } from "./template-form";

export default async function EmailTemplatesAdmin() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const templates = await prisma.emailTemplate.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  const aktive = templates.filter((t) => t.active).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · E-postmaler"
        titleLead="Mal"
        titleItalic="-bibliotek"
        sub={
          templates.length > 0
            ? `${aktive} aktiv${aktive === 1 ? "" : "e"} · ${templates.length} totalt · brukes av agent-pipeline for automatiske e-poster.`
            : "Slug-baserte maler brukes av agent-pipeline for automatiske e-poster."
        }
        actions={<TemplateForm triggerLabel="+ Ny mal" />}
      />

      {templates.length === 0 ? (
        <EmptyState
          icon={Mail}
          titleItalic="Ingen"
          titleTrail="maler registrert"
          sub="Opprett en mal for å la agent-pipeline sende automatiske e-poster — velkomst, ukentlige rapporter, faktura-påminnelser."
        />
      ) : (
        <ul className="space-y-3">
          {templates.map((t) => (
            <li
              key={t.id}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-semibold text-foreground">
                      {t.name}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                        t.active
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {t.active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </div>
                  <code className="mt-2 inline-block rounded-sm bg-secondary px-2 py-1 font-mono text-[11px] text-muted-foreground">
                    {t.slug}
                  </code>
                </div>
                <TemplateForm
                  initial={{
                    id: t.id,
                    slug: t.slug,
                    name: t.name,
                    subject: t.subject,
                    body: t.body,
                    active: t.active,
                  }}
                  triggerLabel="Endre"
                />
              </div>

              <div className="mt-4 text-sm">
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Subject
                </span>
                <p className="mt-1 text-foreground">{t.subject}</p>
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground">
                  Vis innhold
                </summary>
                <pre className="mt-2 whitespace-pre-wrap rounded-md border border-border bg-secondary/40 p-4 text-xs leading-relaxed text-foreground">
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
