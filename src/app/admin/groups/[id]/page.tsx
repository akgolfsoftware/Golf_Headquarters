import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { GroupForm } from "../group-form";
import { MemberForm, RemoveMemberButton } from "./member-form";

export default async function GruppeDetalj({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const [group, coaches, alleSpillere] = await Promise.all([
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
  ]);

  if (!group) notFound();

  const medlemIds = new Set(group.members.map((m) => m.userId));
  const tilgjengelige = alleSpillere
    .filter((p) => !medlemIds.has(p.id))
    .map((p) => ({ id: p.id, name: p.name ?? "(uten navn)" }));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/admin/groups"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground"
          >
            ← Grupper
          </Link>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">{group.name}</em>
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {group.level && (
              <span className="rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
                {group.level}
              </span>
            )}
            {group.coach?.name && <span>Coach: {group.coach.name}</span>}
            <span>· {group.members.length} medlemmer</span>
          </div>
        </div>
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
      </header>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Medlemmer
          </h2>
          <MemberForm groupId={group.id} players={tilgjengelige} />
        </div>

        {group.members.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            Ingen medlemmer ennå. Klikk «+ Legg til medlem».
          </div>
        ) : (
          <ul className="space-y-2">
            {group.members.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4"
              >
                <Link
                  href={`/admin/elever/${m.userId}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {m.user.name ?? "(uten navn)"}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {m.user.email}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
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
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
