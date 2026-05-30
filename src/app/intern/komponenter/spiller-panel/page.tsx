"use client";

import { useState } from "react";
import { TrendingUp, Clock, Flag } from "lucide-react";
import { PlayerDetailPanel, type PlayerDetail } from "@/components/admin/player/player-detail-panel";

const player: PlayerDetail = {
  initials: "MB",
  name: "Markus Berg",
  meta: "WANG · KONK · 12 dg til Srixon #2",
  presence: "online",
  avatarClass: "bg-primary text-accent",
  status: [
    { tone: "behind", label: "2 økter bak" },
    { tone: "active", label: "Aktiv" },
  ],
  kpis: [
    { label: "SG-trend", value: "−0,42", icon: TrendingUp },
    { label: "Timer/uke", value: "6,5", icon: Clock },
    { label: "Neste turn", value: "12d", icon: Flag },
  ],
  pyramid: {
    actual: { fys: 70, tek: 55, slag: 35, spill: 60, turn: 40 },
    plan: { fys: 80, tek: 60, slag: 70, spill: 55, turn: 45 },
  },
  week: [
    { day: "Man", pips: ["fys", "tek"] },
    { day: "Tir", pips: ["slag"] },
    { day: "Ons", pips: [] },
    { day: "Tor", pips: ["spill", "fys"] },
    { day: "Fre", pips: ["slag"] },
    { day: "Lør", pips: ["turn"] },
    { day: "Søn", pips: [] },
  ],
  nextBooking: { day: "FRE", date: "30", title: "Innspill 50–80 m · presisjon", type: "1-til-1 · GFGK TM 3" },
  lastComm: [
    { initials: "MB", name: "Markus", preview: "foreslår å bytte fre-økt til lør", when: "07:42" },
    { initials: "AK", name: "Du", preview: "godkjente plan-endring uke 21", when: "i går" },
  ],
};

export default function PanelDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto w-[900px] max-w-full">
        <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          AgencyOS · panel-demo · spiller-detalj slide-over
        </div>
        <h1 className="mb-6 font-display text-2xl font-bold tracking-tight text-foreground">
          Spiller-detalj — <em className="font-normal italic text-primary">slide-over</em>
        </h1>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 font-mono text-[11px] font-extrabold uppercase tracking-[0.10em] text-accent"
        >
          Åpne spiller-panel
        </button>
      </div>
      <PlayerDetailPanel player={player} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
