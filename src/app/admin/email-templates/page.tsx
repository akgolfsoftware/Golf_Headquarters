import { Mail, Plus } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { TemplateForm } from "./template-form";

export default async function EmailTemplatesAdmin() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const templates = await prisma.emailTemplate.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  const aktive = templates.filter((t) => t.active).length;

  // Gruppering — bruker slug-prefiks som heuristikk
  const grupper: Record<string, typeof templates> = {};
  for (const t of templates) {
    const key = t.slug.includes("-")
      ? t.slug.split("-")[0]
      : "andre";
    if (!grupper[key]) grupper[key] = [];
    grupper[key].push(t);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Maler"
        titleLead="Maler."
        titleItalic={`${templates.length} e-post${templates.length === 1 ? "" : "er"} du sender ofte.`}
        sub={`Slug-baserte maler brukes av agent-pipeline for automatiske e-poster. ${aktive} aktiv${aktive === 1 ? "" : "e"} · ${templates.length} totalt.`}
      />

      {templates.length === 0 ? (
        <div className="rounded-lg border border-border bg-card">
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
              <Mail size={24} strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-display text-base text-foreground">
                <em className="italic">Ingen</em> maler registrert
              </p>
              <p className="mt-2 max-w-[420px] text-[13px] text-muted-foreground">
                Opprett en mal for å la agent-pipeline sende automatiske
                e-poster — velkomst, ukentlige rapporter, faktura-påminnelser.
              </p>
            </div>
            <TemplateForm triggerLabel="+ Ny mal" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[260px_1fr]">
          <aside className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <h3 className="font-display text-sm font-semibold tracking-tight">
                Maler · {templates.length}
              </h3>
              <TemplateForm triggerLabel="Ny" />
            </div>
            <div className="border-b border-border p-4">
              <input
                type="text"
                placeholder="Søk maler…"
                className="w-full rounded-md border border-input bg-background px-4 py-2 text-[12px] outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div>
              {Object.entries(grupper).map(([gruppe, mal]) => (
                <div key={gruppe}>
                  <div className="flex items-center justify-between bg-secondary/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    <span>{gruppe} · {mal.length}</span>
                  </div>
                  {mal.map((t) => (
                    <div
                      key={t.id}
                      className="flex w-full items-center gap-4 border-b border-border px-4 py-4 last:border-b-0 hover:bg-secondary/30"
                    >
                      <span
                        className={`h-8 w-1 rounded-full ${
                          t.active ? "bg-primary" : "bg-secondary"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12px] font-medium text-foreground">
                          {t.name}
                        </div>
                        <div className="truncate font-mono text-[10px] text-muted-foreground">
                          {t.active ? "Aktiv" : "Inaktiv"} · {t.slug}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </aside>

          <div className="flex flex-col gap-4">
            {templates.map((t) => (
              <section
                key={t.id}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-[20px] font-semibold tracking-tight">
                      {t.name}.{" "}
                      <em className="font-normal italic text-muted-foreground">
                        {t.active ? "Aktiv" : "Inaktiv"}.
                      </em>
                    </h2>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                      Slug: {t.slug} · Sist endret{" "}
                      {t.updatedAt.toLocaleDateString("nb-NO", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] ${
                        t.active
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {t.active ? "Aktiv" : "Inaktiv"}
                    </span>
                    <a
                      href={`/admin/email-templates/${t.id}/rediger`}
                      className="text-xs text-primary hover:underline"
                    >
                      Rediger
                    </a>
                    <TemplateForm
                      initial={{
                        id: t.id,
                        slug: t.slug,
                        name: t.name,
                        subject: t.subject,
                        body: t.body,
                        active: t.active,
                      }}
                      triggerLabel="Slug/slett"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 p-6">
                  <div className="grid grid-cols-[80px_1fr] items-center gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                      Emne
                    </span>
                    <div className="rounded-md border border-input bg-background px-4 py-2 text-[12px] text-foreground">
                      {t.subject}
                    </div>
                  </div>

                  <details className="overflow-hidden rounded-md border border-border">
                    <summary className="cursor-pointer bg-secondary/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground">
                      Vis innhold
                    </summary>
                    <pre className="whitespace-pre-wrap bg-background p-4 font-mono text-[12px] leading-relaxed text-foreground">
                      {t.body}
                    </pre>
                  </details>
                </div>

                <div className="flex items-center justify-between border-t border-border px-6 py-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                    Opprettet{" "}
                    {t.createdAt.toLocaleDateString("nb-NO", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  {/* TODO: Sending-statistikk og forhåndsvisning */}
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md border border-border px-4 py-1.5 text-[12px] font-medium text-muted-foreground"
                    disabled
                  >
                    <Plus className="h-3 w-3" strokeWidth={2} />
                    Send test (kommer)
                  </button>
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
