import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronLeft, MessageCircle, Quote, Tag } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

type ChatMelding = { role?: string; content?: string; ts?: string };

const TAGS = ["TEK", "SLAG", "pitch-konsistens"];

export default async function NoteDetalj({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const user = await requirePortalUser();
  const { noteId } = await params;

  if (user.tier === "GRATIS") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="PlayerHQ · Coach-notat"
          titleLead="Krever"
          titleItalic="Pro"
          sub="Direkte notater fra coach er en del av Pro-abonnementet."
        />
      </div>
    );
  }

  const sesjon = await prisma.coachingSession.findUnique({
    where: { id: noteId },
    include: { coach: { select: { name: true, email: true } } },
  });
  if (!sesjon) notFound();
  if (
    sesjon.userId !== user.id &&
    user.role !== "ADMIN" &&
    user.role !== "COACH"
  ) {
    notFound();
  }

  const meldinger = Array.isArray(sesjon.messages)
    ? (sesjon.messages as ChatMelding[])
    : [];

  // Hent ut coach-meldinger som "notat-fragmenter"
  const coachFragmenter = meldinger
    .filter((m) => m.role === "coach" && typeof m.content === "string")
    .map((m) => m.content!);

  // Første coach-melding brukes som tittel-utdrag, resten som fokuspunkter
  const tittelFragment = coachFragmenter[0] ?? "";
  const fokusFragmenter = coachFragmenter.slice(1, 4); // max 3
  const ovrigeMeldinger = meldinger.filter((m) => m.role !== "coach");

  const datoFormatert = sesjon.createdAt.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const kortTittel = tittelFragment
    ? tittelFragment.length > 60
      ? `${tittelFragment.slice(0, 57)}…`
      : tittelFragment
    : "Samtale";

  const coachInitialer = sesjon.coach.name
    ? sesjon.coach.name
        .split(" ")
        .map((s) => s[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <Link
        href="/portal/coach/notes"
        className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft size={14} strokeWidth={1.5} />
        Tilbake til notater
      </Link>

      <PageHeader
        eyebrow={`PlayerHQ · Coach-notat · ${datoFormatert}`}
        titleLead={sesjon.kind === "AI" ? "AI-samtale" : "Pitch"}
        titleItalic={kortTittel}
      />

      {coachFragmenter.length === 0 && ovrigeMeldinger.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          titleItalic="Ingen"
          titleTrail="innhold ennå"
          sub="Det er ingen meldinger eller notater i denne samtalen ennå."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Hovedinnhold */}
          <section className="lg:col-span-2">
            <article className="max-w-3xl rounded-lg border border-border bg-card p-8">
              <div className="space-y-4 text-[16px] leading-[1.7] text-foreground">
                {tittelFragment && (
                  <p className="whitespace-pre-wrap">{tittelFragment}</p>
                )}

                {fokusFragmenter.map((f, i) => (
                  <blockquote
                    key={i}
                    className="my-6 border-l-2 border-accent pl-6 font-display text-[18px] italic leading-snug text-foreground"
                  >
                    «{f}»
                  </blockquote>
                ))}

                {ovrigeMeldinger.length > 0 && (
                  <div className="mt-6 space-y-4 border-t border-border pt-6">
                    <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      Samtale-kontekst
                    </div>
                    {ovrigeMeldinger.map((m, i) => (
                      <p
                        key={i}
                        className="whitespace-pre-wrap text-sm text-muted-foreground"
                      >
                        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground">
                          {m.role === "user" ? "Spiller" : m.role ?? "System"}
                        </span>
                        {": "}
                        {m.content ?? ""}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </section>

          {/* Sidebar */}
          <aside className="space-y-4 lg:col-span-1">
            {sesjon.kind === "DIRECT" && (
              <Link
                href="/portal/coach/melding"
                className="block rounded-lg border border-border bg-card p-6 transition-colors hover:bg-secondary/40"
              >
                <div className="flex items-center gap-2">
                  <Quote
                    size={14}
                    strokeWidth={1.5}
                    className="text-muted-foreground"
                  />
                  <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Knyttet til samtale
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-[14px] font-semibold leading-snug">
                    Direkte coach-tråd
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {datoFormatert}
                  </div>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-foreground">
                  Åpne samtalen
                  <ArrowUpRight size={12} strokeWidth={1.5} />
                </span>
              </Link>
            )}

            {/* Coach-info */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary font-mono text-[12px] font-semibold text-primary-foreground">
                  {coachInitialer}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold leading-none">
                    {sesjon.coach.name ?? "Ukjent coach"}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    Hovedcoach
                  </div>
                </div>
              </div>
              {sesjon.kind === "DIRECT" && (
                <Link
                  href="/portal/coach/melding"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Send svar
                </Link>
              )}
            </div>

            {/* Tags */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Tag
                  size={14}
                  strokeWidth={1.5}
                  className="text-muted-foreground"
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Tags
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border bg-secondary px-4 py-1 text-[11px] font-medium text-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Relaterte notater */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <MessageCircle
                  size={14}
                  strokeWidth={1.5}
                  className="text-muted-foreground"
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Relaterte notater
                </span>
              </div>
              <Link
                href="/portal/coach/notes"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-foreground hover:text-primary"
              >
                Se alle notater
                <ArrowUpRight size={12} strokeWidth={1.5} />
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
