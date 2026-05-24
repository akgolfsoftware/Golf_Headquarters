import { FileText, FileSignature, Receipt, BookOpen, FileQuestion, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { EmptyState } from "@/components/shared/empty-state";

const KIND_LABEL: Record<string, string> = {
  CONTRACT: "Kontrakter",
  GUIDE: "Veiledninger",
  RECEIPT: "Kvitteringer",
  OTHER: "Annet",
};

const KIND_ICON: Record<string, LucideIcon> = {
  CONTRACT: FileSignature,
  GUIDE: BookOpen,
  RECEIPT: Receipt,
  OTHER: FileQuestion,
};

const KIND_SUB: Record<string, string> = {
  CONTRACT: "Signerte avtaler",
  GUIDE: "Brukerveiledninger",
  RECEIPT: "Betalingskvitteringer",
  OTHER: "Øvrig",
};

export default async function DokumenterPage() {
  const user = await requirePortalUser();

  const documents = await prisma.document.findMany({
    where: {
      OR: [{ userId: null }, { userId: user.id }],
    },
    orderBy: [{ kind: "asc" }, { createdAt: "desc" }],
  });

  const grupper = documents.reduce<Record<string, typeof documents>>(
    (acc, d) => {
      const key = d.kind;
      if (!acc[key]) acc[key] = [];
      acc[key].push(d);
      return acc;
    },
    {},
  );

  const totalCount = documents.length;
  const order: string[] = ["CONTRACT", "RECEIPT", "GUIDE", "OTHER"];

  return (
    <div className="mx-auto max-w-[1240px] space-y-8 px-4 sm:px-6">
      <PageHeader
        eyebrow="PlayerHQ · Meg · Dokumenter"
        titleLead="Det som er"
        titleItalic="signert"
        sub="Kontrakter, kvitteringer og veiledninger som er knyttet til din konto."
      />

      {totalCount === 0 ? (
        <EmptyState
          icon={FileText}
          titleItalic="Ingen dokumenter"
          titleTrail="ennå"
          sub="Kontrakter, kvitteringer og veiledninger dukker opp her når de signeres eller utstedes."
        />
      ) : (
        <>
          {/* Søk/filter-felt — TODO: kobles til faktisk søk senere */}
          <div className="flex items-center gap-4 rounded-md border border-border bg-card px-4 py-4">
            <Search
              className="h-4 w-4 text-muted-foreground"
              strokeWidth={1.5}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Søk
            </span>
            <input
              className="flex-1 border-none bg-transparent text-sm outline-none"
              placeholder="Tittel eller type…"
              aria-label="Søk i dokumenter"
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {totalCount} dokumenter
            </span>
          </div>

          {order.map((kind) => {
            const items = grupper[kind];
            if (!items || items.length === 0) return null;
            const Icon = KIND_ICON[kind] ?? FileText;
            const label = KIND_LABEL[kind] ?? kind;
            const sub = KIND_SUB[kind] ?? "";

            return (
              <section key={kind} className="space-y-4">
                <header className="flex items-baseline justify-between">
                  <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
                    {label}
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {sub} · {items.length}
                  </span>
                </header>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((d) => (
                    <a
                      key={d.id}
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary"
                    >
                      <div className="flex items-center justify-between">
                        <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                        {d.userId === null && (
                          <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                            Global
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display text-base font-semibold leading-tight tracking-tight text-foreground group-hover:text-primary">
                          {d.title}
                        </h4>
                        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                          {d.createdAt.toLocaleDateString("nb-NO", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-medium text-primary">
                        Åpne →
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
