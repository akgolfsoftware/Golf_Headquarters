"use client";

import { useState } from "react";
import { Lock, Users, Globe, Flag, Target, Award, Trophy, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Level = "privat" | "coach" | "offentlig";

type Omrade = {
  id: string;
  navn: string;
  beskrivelse: string;
  ikon: LucideIcon;
  level: Level;
};

const INITIELL: Omrade[] = [
  {
    id: "runder",
    navn: "Mine runder",
    beskrivelse: "Score, statistikk, baner",
    ikon: Flag,
    level: "coach",
  },
  {
    id: "mal",
    navn: "Mine mål",
    beskrivelse: "Pågående og fullførte målsetninger",
    ikon: Target,
    level: "coach",
  },
  {
    id: "milepaeler",
    navn: "Milepæler",
    beskrivelse: "PRer, oppnådde merker",
    ikon: Award,
    level: "offentlig",
  },
  {
    id: "turneringer",
    navn: "Turnerings-historikk",
    beskrivelse: "Plasseringer, klubb-turneringer",
    ikon: Trophy,
    level: "coach",
  },
  {
    id: "trening",
    navn: "Treningstimer",
    beskrivelse: "Total øvelses-tid og frekvens",
    ikon: Clock,
    level: "privat",
  },
];

const LEVELS: { id: Level; navn: string; ikon: LucideIcon; tone: string }[] = [
  {
    id: "privat",
    navn: "Privat",
    ikon: Lock,
    tone: "border-border bg-secondary text-foreground",
  },
  {
    id: "coach",
    navn: "Coach",
    ikon: Users,
    tone: "border-primary bg-primary/10 text-primary",
  },
  {
    id: "offentlig",
    navn: "Offentlig",
    ikon: Globe,
    tone: "border-accent bg-accent/30 text-foreground",
  },
];

export function ReachPrivacyClient() {
  const [omrader, setOmrader] = useState<Omrade[]>(INITIELL);

  function settLevel(id: string, level: Level) {
    setOmrader((prev) =>
      prev.map((o) => (o.id === id ? { ...o, level } : o)),
    );
  }

  return (
    <ul className="space-y-3">
      {omrader.map((o) => {
        const Ikon = o.ikon;
        return (
          <li
            key={o.id}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-secondary text-foreground">
                <Ikon size={16} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold leading-none">
                  {o.navn}
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {o.beskrivelse}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {LEVELS.map((l) => {
                const valgt = o.level === l.id;
                const LevelIkon = l.ikon;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => settLevel(o.id, l.id)}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                      valgt
                        ? l.tone
                        : "border-border bg-card text-muted-foreground hover:bg-secondary/40"
                    }`}
                  >
                    <LevelIkon size={11} strokeWidth={1.75} />
                    {l.navn}
                  </button>
                );
              })}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
