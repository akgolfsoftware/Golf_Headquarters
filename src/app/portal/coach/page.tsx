import Link from "next/link";
import { Calendar, MessageSquare, Plus } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { CoachShell } from "@/components/portal/coach/CoachShell";
import { CoachProfileCard } from "@/components/portal/coach/CoachProfileCard";
import { MessageThread } from "@/components/portal/coach/MessageThread";
import { PlanChangeRequests } from "@/components/portal/coach/PlanChangeRequests";
import { UpcomingSessions } from "@/components/portal/coach/UpcomingSessions";
import { CoachNotes } from "@/components/portal/coach/CoachNotes";
import {
  getCoachProfile,
  getMessages,
  sendMessage,
  getPlanChangeRequests,
  createPlanChangeRequest,
  getUpcomingSessions,
  getCoachNotes,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "GUEST"] });

  const coach = await getCoachProfile();

  const [messages, planChangeRequests, upcomingSessions, coachNotes] = await Promise.all([
    coach ? getMessages(coach.id) : Promise.resolve([]),
    getPlanChangeRequests(),
    getUpcomingSessions(),
    getCoachNotes(),
  ]);

  const meInitials = user.name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const meName = user.name.split(" ")[0] ?? "Deg";

  return (
    <CoachShell>
      {/* Header */}
      <header className="space-y-4">
        <AthleticEyebrow tone="lime">PLAYERHQ · COACH</AthleticEyebrow>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              Din <em className="font-normal italic text-primary">coach</em>
            </h1>
            <p className="mt-2 max-w-2xl text-base text-muted-foreground">
              Kommunikasjon, planendringer og kommende sesjoner med coachen din.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/portal/coach/melding"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-primary bg-transparent px-6 text-sm font-semibold text-primary transition hover:bg-primary/5"
            >
              <MessageSquare size={14} strokeWidth={1.75} />
              Meldinger
            </Link>
            <Link
              href="/portal/booking"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-bold text-primary shadow-lg shadow-accent/25 transition hover:brightness-105"
            >
              <Plus size={14} strokeWidth={2} />
              Book sesjon
            </Link>
          </div>
        </div>
      </header>

      {/* Top: Coach profile */}
      <CoachProfileCard coach={coach} />

      {/* Main grid: messages + side panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-6">
          {coach ? (
            <MessageThread
              coachName={coach.name}
              coachInitials={coach.initials}
              coachAvatarUrl={coach.avatarUrl}
              meName={meName}
              meInitials={meInitials}
              initialMessages={messages}
              onSend={async (body) => {
                "use server";
                await sendMessage({ coachId: coach.id, content: body });
              }}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
              <Calendar className="mx-auto h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
              <h2 className="mt-4 font-display text-lg font-semibold">Ingen coach tildelt ennå</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Når du får tildelt en coach kan du sende meldinger og be om planendringer her.
              </p>
            </div>
          )}

          <PlanChangeRequests
            requests={planChangeRequests}
            onCreate={async (input) => {
              "use server";
              await createPlanChangeRequest(input);
            }}
          />
        </section>

        <aside className="space-y-6">
          <UpcomingSessions sessions={upcomingSessions} />
          <CoachNotes notes={coachNotes} />
        </aside>
      </div>
    </CoachShell>
  );
}
