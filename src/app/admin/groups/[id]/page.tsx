import Link from "next/link";
import { notFound } from "next/navigation";
import { Users, Calendar } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { GroupForm } from "../group-form";
import { MemberForm, RemoveMemberButton } from "./member-form";
import { ScheduleForm, DeleteScheduleButton } from "./schedule-form";

export default async function GruppeDetalj({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const [group, coaches, alleSpillere, schedules] = await Promise.all([
    prisma.group.findUnique({
      where: { id },
      include: {
        coach: { select: { id: true, name: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ["COACH", "ADMIN"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: { role: "PLAYER" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.groupSchedule.findMany({
      where: { groupId: id },
      orderBy: { startAt: "asc" },
    }),
  ]);

  if (!group) notFound();

  const medlemIds = new Set(group.members.map((m) => m.userId));
  const tilgjengelige = alleSpillere
    .filter((p) => !medlemIds.has(p.id))
    .map((p) => ({ id: p.id, name: p.name ?? "(uten navn)" }));

  const metaParts: string[] = [];
  if (group.coach?.name) metaParts.push(`Coach: ${group.coach.name}`);
  metaParts.push(`${group.members.length} medlemmer`);

  return (
    <div className="space-y-8">
      <Link
        href="/admin/groups"
        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground"
      >
        ← CoachHQ · Grupper
      </Link>

      <PageHeader
        eyebrow="CoachHQ · Gruppe-detalj"
        titleItalic={group.name}
        sub={metaParts.join(" · ")}
        actions={
          <>
            {group.level && (
              <span className="rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
                {group.level}
              </span>
            )}
            <GroupForm
              initial={{
                id: group.id,
                name: group.name,
                level: group.level,
                coachId: group.coachId,
              }}
              coaches={coaches.map((c) => ({ id: c.id, name: c.name ?? "(uten navn)" }))}
              triggerLabel="Endre gruppe"
            />
          </>
        }
      />

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Kpi label="Medlemmer" value={String(group.members.length)} />
        <Kpi
          label="Nivå"
          value={group.level ?? "—"}
        />
        <Kpi
          label="Coach"
          value={group.coach?.name ?? "—"}
          valueSmall
        />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Medlemmer ({group.members.length})
          </h2>
          <MemberForm groupId={group.id} players={tilgjengelige} />
        </div>

        {group.members.length === 0 ? (
          <EmptyState
            icon={Users}
            titleItalic="Ingen"
            titleTrail="medlemmer ennå"
            sub="Klikk «+ Legg til medlem» for å legge til en spiller i gruppen."
          />
        ) : (
          <ul className="space-y-2">
            {group.members.map((m) => {
              const initial = (m.user.name ?? "?").trim().charAt(0).toUpperCase();
              return (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-card p-4"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-mono text-[11px] font-semibold text-primary-foreground">
                    {initial}
                  </span>
                  <Link
                    href={`/admin/elever/${m.userId}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {m.user.name ?? "(uten navn)"}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {m.user.email}
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {m.role === "ASSISTANT" ? "Assistent" : "Spiller"}
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                    Lagt til {m.joinedAt.toLocaleDateString("nb-NO")}
                  </span>
                  <RemoveMemberButton
                    groupId={group.id}
                    memberId={m.id}
                    memberName={m.user.name ?? "medlem"}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Treningsplan ({schedules.length})
          </h2>
          <ScheduleForm groupId={group.id} triggerLabel="+ Ny treningstid" />
        </div>

        {schedules.length === 0 ? (
          <EmptyState
            icon={Calendar}
            titleItalic="Ingen"
            titleTrail="treningstider satt opp"
            sub="Klikk «+ Ny treningstid» for å legge til en fast eller engangs treningsøkt."
          />
        ) : (
          <ul className="space-y-2">
            {schedules.map((s) => {
              const dato = s.startAt.toLocaleDateString("nb-NO", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              });
              const start = s.startAt.toLocaleTimeString("nb-NO", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const slutt = s.endAt.toLocaleTimeString("nb-NO", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <li
                  key={s.id}
                  className="flex flex-wrap items-start gap-4 rounded-md border border-border bg-card p-4"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">{s.title}</span>
                      {s.recurring === "WEEKLY" && (
                        <span className="rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
                          Ukentlig
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {dato} · {start}–{slutt}
                      {s.location && ` · ${s.location}`}
                    </span>
                    {s.description && (
                      <p className="text-sm text-muted-foreground">{s.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <ScheduleForm
                      groupId={group.id}
                      triggerLabel="Rediger"
                      triggerStyle="link"
                      initial={{
                        id: s.id,
                        title: s.title,
                        description: s.description,
                        startAt: s.startAt.toISOString(),
                        endAt: s.endAt.toISOString(),
                        location: s.location,
                        recurring: s.recurring,
                      }}
                    />
                    <DeleteScheduleButton
                      groupId={group.id}
                      scheduleId={s.id}
                      title={s.title}
                    />
                  </div>
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
