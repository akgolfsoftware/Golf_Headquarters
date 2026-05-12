import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";

const KIND_LABEL: Record<string, string> = {
  CONTRACT: "Kontrakt",
  GUIDE: "Veiledning",
  RECEIPT: "Kvittering",
  OTHER: "Annet",
};

export default async function DokumenterPage() {
  const user = await requirePortalUser();

  const documents = await prisma.document.findMany({
    where: {
      OR: [{ userId: null }, { userId: user.id }],
    },
    orderBy: [{ kind: "asc" }, { createdAt: "desc" }],
  });

  const grupper = documents.reduce<Record<string, typeof documents>>((acc, d) => {
    const key = d.kind;
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PlayerHQ · Meg · Dokumenter"
        titleLead="Det som er"
        titleItalic="signert"
        sub="Kontrakter, kvitteringer og veiledninger som er knyttet til din konto."
      />

      {documents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Ingen dokumenter ennå.
        </div>
      ) : (
        Object.entries(grupper).map(([kind, items]) => (
          <section key={kind}>
            <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {KIND_LABEL[kind] ?? kind} ({items.length})
            </h3>
            <ul className="space-y-2">
              {items.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {d.title}
                    </a>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {d.createdAt.toLocaleDateString("nb-NO", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                      {d.userId === null && " · global"}
                    </div>
                  </div>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-md border border-input bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-border"
                  >
                    Åpne →
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
