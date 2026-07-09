import Link from "next/link";
import { notFound } from "next/navigation";
import { Trophy } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { Button, Card, Eyebrow, KpiTile, Tag } from "@/components/athletic/golfdata";
import { EmptyState } from "@/components/shared/empty-state";
import { bliMed, avsluttUtfordring } from "../actions";
import { ScoreForm } from "./score-form";

export default async function UtfordringDetalj({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { id } = await params;

  const utfordring = await prisma.drillChallenge.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      participants: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: [
          { rank: { sort: "asc", nulls: "last" } },
          { score: { sort: "desc", nulls: "last" } },
          { joinedAt: "asc" },
        ],
      },
    },
  });
  if (!utfordring) notFound();

  let drill: { id: string; name: string } | null = null;
  if (utfordring.drillId) {
    drill = await prisma.exerciseDefinition.findUnique({
      where: { id: utfordring.drillId },
      select: { id: true, name: true },
    });
  }

  const erEier = utfordring.ownerId === user.id;
  const minDeltakelse = utfordring.participants.find((p) => p.userId === user.id);
  const erDeltaker = !!minDeltakelse;
  const erAktiv = utfordring.status === "ACTIVE";

  const startStr = utfordring.startAt
    ? utfordring.startAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "long", year: "numeric" })
    : null;
  const sluttStr = utfordring.endAt
    ? utfordring.endAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  async function bliMedAction() {
    "use server";
    await bliMed(id);
  }

  async function avsluttAction() {
    "use server";
    await avsluttUtfordring(id);
  }

  const metaParts: string[] = [];
  metaParts.push(`Eier: ${utfordring.owner.name ?? "(ukjent)"}`);
  if (drill) metaParts.push(`Øvelse: ${drill.name}`);
  metaParts.push(`${utfordring.participants.length} deltakere`);

  return (
    <div className="golfdata-scope mx-auto w-full max-w-[460px] space-y-6 px-4 pb-8 pt-3 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6">
      <Link
        href="/portal/utfordringer"
        className="inline-flex min-h-11 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground"
      >
        ← PlayerHQ · Utfordringer
      </Link>

      {/* Hero */}
      <header>
        <Eyebrow tone="default" className="mb-2.5">
          PlayerHQ · {erAktiv ? "Aktiv utfordring" : "Avsluttet utfordring"}
        </Eyebrow>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-[29px] font-bold leading-[1.05] tracking-[-0.035em] text-foreground">
              <em className="font-medium italic text-primary">{utfordring.name}</em>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{metaParts.join(" · ")}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!erAktiv && <Tag variant="neutral">Avsluttet</Tag>}
            {erAktiv && !erDeltaker && (
              <form action={bliMedAction}>
                <Button type="submit" variant="signal">
                  Bli med
                </Button>
              </form>
            )}
            {erAktiv && erEier && (
              <form action={avsluttAction}>
                <Button type="submit" variant="destructive">
                  Avslutt utfordring
                </Button>
              </form>
            )}
          </div>
        </div>
      </header>

      {utfordring.description && (
        <Card compact>
          <p className="text-sm text-foreground">{utfordring.description}</p>
        </Card>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card compact>
          <KpiTile size="md" label="Deltakere" value={utfordring.participants.length} />
        </Card>
        <Card compact>
          <KpiTile size="md" label="Startet" value={startStr ?? "—"} />
        </Card>
        <Card compact>
          <KpiTile size="md" label={erAktiv ? "Slutter" : "Avsluttet"} value={sluttStr ?? "—"} />
        </Card>
      </section>

      {erAktiv && erDeltaker && (
        <ScoreForm
          challengeId={utfordring.id}
          currentScore={minDeltakelse?.score ?? null}
          currentNotes={minDeltakelse?.notes ?? null}
        />
      )}

      <section aria-labelledby="leaderboard-tittel" className="space-y-4">
        <Eyebrow as="h2" id="leaderboard-tittel">
          Resultatliste
        </Eyebrow>

        {utfordring.participants.length === 0 ? (
          <EmptyState
            icon={Trophy}
            titleItalic="Ingen"
            titleTrail="deltakere ennå"
            sub="Del utfordringen og inviter andre til å bli med."
          />
        ) : (
          <ul className="space-y-2">
            {utfordring.participants.map((p) => {
              const initial = (p.user.name ?? "?").trim().charAt(0).toUpperCase();
              const erMeg = p.userId === user.id;
              return (
                <li
                  key={p.id}
                  className={`flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4 ${
                    erMeg ? "border-primary/40" : "border-border"
                  }`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary font-mono text-sm font-semibold tabular-nums text-foreground">
                    {p.rank ?? "–"}
                  </span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-mono text-[11px] font-semibold text-primary-foreground">
                    {initial}
                  </span>
                  <span className="font-medium text-foreground">
                    {p.user.name ?? "(uten navn)"}
                    {erMeg && (
                      <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                        Deg
                      </span>
                    )}
                  </span>
                  {p.notes && (
                    <span className="text-xs text-muted-foreground">
                      {p.notes}
                    </span>
                  )}
                  <span className="ml-auto font-mono text-lg font-semibold tabular-nums text-foreground">
                    {p.score != null ? p.score : "—"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
