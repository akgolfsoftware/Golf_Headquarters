/**
 * PlayerHQ · Meg · Dokumenter (/portal/meg/dokumenter). Mobil-først (430px).
 *
 * Dokument-liste fra Document-modellen (global + egne). Gruppert per kind med
 * mono-caps gruppe-header + ikon-chip per rad. Ekte Prisma-data — tomstate når
 * brukeren ikke har dokumenter. Server component, behold auth-guard.
 *
 * Stil matchet mot profil-oversikt.tsx / innstillinger-accordion.tsx:
 * max-w-[480px], rounded-[14px] kort, DS-tokens, lucide-ikoner, ingen hex.
 */
import Link from "next/link";
import {
  BookOpen,
  ChevronLeft,
  ExternalLink,
  FileQuestion,
  FileSignature,
  FileText,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/empty-state";

const KIND_LABEL: Record<string, string> = {
  CONTRACT: "Kontrakter",
  RECEIPT: "Kvitteringer",
  GUIDE: "Veiledninger",
  OTHER: "Annet",
};

const KIND_ICON: Record<string, LucideIcon> = {
  CONTRACT: FileSignature,
  RECEIPT: Receipt,
  GUIDE: BookOpen,
  OTHER: FileQuestion,
};

const ORDER: string[] = ["CONTRACT", "RECEIPT", "GUIDE", "OTHER"];

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function DokumenterPage() {
  const user = await requirePortalUser();

  const documents = await prisma.document.findMany({
    where: { OR: [{ userId: null }, { userId: user.id }] },
    orderBy: [{ kind: "asc" }, { createdAt: "desc" }],
  });

  const grupper = documents.reduce<Record<string, typeof documents>>((acc, d) => {
    (acc[d.kind] ??= []).push(d);
    return acc;
  }, {});

  return (
    <div className="mx-auto w-full max-w-[480px] pb-8">
      {/* topbar — tilbake + tittel */}
      <div className="flex items-center gap-3 border-b border-border px-2 py-3">
        <Link
          href="/portal/meg"
          className="inline-flex items-center gap-1.5 px-1 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
          Profil
        </Link>
        <h1 className="font-display text-[17px] font-bold tracking-[-0.015em] text-foreground">
          Dokumenter
        </h1>
        {documents.length > 0 && (
          <span className="ml-auto font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
            {documents.length}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-5 px-2 pb-4 pt-4">
        {documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            titleItalic="Ingen dokumenter"
            titleTrail="ennå"
            sub="Kontrakter, kvitteringer og veiledninger dukker opp her når de signeres eller utstedes."
          />
        ) : (
          ORDER.map((kind) => {
            const items = grupper[kind];
            if (!items || items.length === 0) return null;
            const Icon = KIND_ICON[kind] ?? FileText;
            const label = KIND_LABEL[kind] ?? kind;

            return (
              <section key={kind} className="flex flex-col gap-2.5">
                <header className="flex items-baseline gap-2 px-1">
                  <h2 className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
                    {label}
                  </h2>
                  <span className="font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
                    {items.length}
                  </span>
                </header>

                <div className="divide-y divide-border overflow-hidden rounded-[14px] border border-border bg-card">
                  {items.map((d) => (
                    <a
                      key={d.id}
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid grid-cols-[34px_1fr_auto] items-center gap-x-3 px-3.5 py-3.5 transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                    >
                      <span className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-primary/[0.08] text-primary">
                        <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[14px] font-semibold leading-tight tracking-[-0.005em] text-foreground">
                            {d.title}
                          </span>
                          {d.userId === null && (
                            <span className="inline-flex shrink-0 items-center rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                              Felles
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
                          {formatDato(d.createdAt)}
                        </span>
                      </span>
                      <ExternalLink
                        className="h-4 w-4 shrink-0 text-muted-foreground/60"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </a>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
