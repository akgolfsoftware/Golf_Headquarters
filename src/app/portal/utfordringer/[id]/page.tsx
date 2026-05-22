import Link from "next/link";
import { notFound } from "next/navigation";
import { Trophy } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
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
    <div className="space-y-8">
      <Link
        href="/portal/utfordringer"
        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground"
      >
        ← PlayerHQ · Utfordringer
      </Link>

      <PageHeader
        eyebrow={`PlayerHQ · ${erAktiv ? "Aktiv utfordring" : "Avsluttet utfordring"}`}
        titleItalic={utfordring.name}
        sub={metaParts.join(" · ")}
        actions={
          <>
            {!erAktiv && (
              <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Avsluttet
              </span>
            )}
            {erAktiv && !erDeltaker && (
              <form action={bliMedAction}>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Bli med
                </button>
              </form>
            )}
            {erAktiv && erEier && (
              <form action={avsluttAction}>
                <button
                  type="submit"
                  className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm font-medium text-destructive hover:border-destructive/50"
                >
                  Avslutt utfordring
                </button>
              </form>
            )}
          </>
        }
      />

      {utfordring.description && (
        <section className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-foreground">{utfordring.description}</p>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi label="Deltakere" value={String(utfordring.participants.length)} />
        <Kpi label="Startet" value={startStr ?? "—"} valueSmall />
        <Kpi label={erAktiv ? "Slutter" : "Avsluttet"} value={sluttStr ?? "—"} valueSmall />
      </section>

      {erAktiv && erDeltaker && (
        <ScoreForm
          challengeId={utfordring.id}
          currentScore={minDeltakelse?.score ?? null}
          currentNotes={minDeltakelse?.notes ?? null}
        />
      )}

      <section aria-labelledby="leaderboard-tittel" className="space-y-4">
        <h2
          id="leaderboard-tittel"
          className="font-display text-lg font-semibold tracking-tight"
        >
          Resultatliste
        </h2>

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
                  className={`flex flex-wrap items-center gap-4 rounded-md border bg-card p-4 ${
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

function Kpi({
  label,
  value,
  valueSmall = false,
}: {
  label: string;
  value: string;
  valueSmall?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-2 font-mono font-semibold leading-none tabular-nums ${
          valueSmall ? "text-[18px]" : "text-[28px]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
