"use client";

import { TeamRosterList, PlanMalCard, NewPlanMalCard, type TeamMember, type PlanMal } from "@/components/admin/team/team-kit";
import { InlineBookingForm, type AcOption } from "@/components/admin/bookings/booking-form-kit";

// Bolk 2b-demo: Team/Drift-kit + Bookinger-form-kit.

const members: TeamMember[] = [
  { id: "1", initials: "AK", name: "Andreas Kragerud", email: "andreas@akgolf.no", presence: "online", roles: ["EIER", "HEAD_COACH"], scope: "Hele akademiet", lastSeen: "Nå", avatarClass: "bg-primary text-accent" },
  { id: "2", initials: "MH", name: "Maria Holt", email: "maria@akgolf.no", presence: "online", roles: ["FYS"], scope: "GFGK junior", lastSeen: "12 min siden" },
  { id: "3", initials: "TE", name: "Tom Eide", email: "tom@akgolf.no", presence: "away", roles: ["COACH"], scope: "WANG", lastSeen: "2 t siden" },
  { id: "4", initials: "LB", name: "Lisa Berg", email: "lisa@akgolf.no", presence: "offline", roles: ["ASSISTENT", "BILLING"], scope: "Admin", lastSeen: "i går" },
];

const maler: PlanMal[] = [
  { id: "1", name: "Grunntrening vinter", periode: "GRUNN", dist: { fys: 40, tek: 25, slag: 20, spill: 10, turn: 5 }, stats: "12 økter · 8 uker · 24 spillere" },
  { id: "2", name: "Turn-uke Srixon", periode: "TURN", dist: { fys: 10, tek: 15, slag: 25, spill: 30, turn: 20 }, stats: "5 økter · 1 uke · 6 spillere" },
  { id: "3", name: "Innspill-blokk", periode: "SPES", dist: { fys: 15, tek: 20, slag: 45, spill: 15, turn: 5 }, stats: "8 økter · 4 uker · 11 spillere" },
];

const players: AcOption[] = [
  { id: "mb", initials: "MB", name: "Markus Berg", sub: "4 cr.", avatarClass: "bg-primary text-accent" },
  { id: "sk", initials: "SK", name: "Sofie K.", sub: "2 cr." },
  { id: "kl", initials: "KL", name: "Karl Ludvig", sub: "12 cr.", avatarClass: "bg-accent text-primary" },
  { id: "eb", initials: "EB", name: "Emilie B.", sub: "6 cr." },
];

export default function Bolk2bDemo() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto w-[1080px] max-w-full space-y-8">
        <header>
          <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            AgencyOS · Bolk 2b-demo · team + bookinger
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Drift &amp; bookinger — <em className="font-normal italic text-primary">team og maler</em>
          </h1>
        </header>

        {/* TEAM */}
        <section className="overflow-hidden rounded-[12px] border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">Team</span>
            <span className="font-mono text-[10px] font-bold text-muted-foreground">4 MEDLEMMER · CBAC</span>
          </div>
          <TeamRosterList members={members} />
        </section>

        {/* PLAN-MALER */}
        <section>
          <div className="mb-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Plan-maler</div>
          <div className="grid grid-cols-3 gap-3">
            {maler.map((m) => <PlanMalCard key={m.id} mal={m} />)}
            <NewPlanMalCard />
          </div>
        </section>

        {/* BOOKING-FORM */}
        <section>
          <div className="mb-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Ny booking (inline-form)</div>
          <InlineBookingForm
            players={players}
            coaches={["Andreas Kragerud", "Maria Holt", "Tom Eide"]}
            types={["Coaching 1-til-1", "TrackMan", "Gruppe", "Bane-økt"]}
          />
        </section>
      </div>
    </div>
  );
}
