"use client";

/**
 * EnrollmentPanel — viser og administrerer program-enrolleringer for én spiller.
 *
 * Aktive enrolleringer vises med grønn prikk, avsluttede er grå med dato.
 * Coach kan legge til ny enrollering eller avslutte en aktiv.
 * Spiller slettes aldri — kun enrolleringen avsluttes (endedAt settes).
 */

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import type { PlayerProgram } from "@/generated/prisma/client";
import {
  addEnrollment,
  endEnrollment,
} from "./enrollment-actions";

const PROGRAM_LABEL: Record<PlayerProgram, string> = {
  WANG_TOPPIDRETT:   "WANG Toppidrett Fredrikstad",
  WANG_UNG:          "WANG Ung Fredrikstad",
  GFGK_MINI:         "GFGK — Mini",
  GFGK_BREDDE:       "GFGK — Bredde/Utvikling",
  GFGK_JENTER:       "GFGK — Jenter",
  GFGK_ELITE:        "GFGK — Elite",
  AK_ACADEMY:        "AK Golf Academy",
  AK_ACADEMY_JUNIOR: "AK Golf Academy Junior",
  PLATFORM_ONLY:     "Selvbetjent (ingen coach)",
};

const ALL_PROGRAMS: PlayerProgram[] = [
  "WANG_TOPPIDRETT", "WANG_UNG",
  "GFGK_MINI", "GFGK_BREDDE", "GFGK_JENTER", "GFGK_ELITE",
  "AK_ACADEMY", "AK_ACADEMY_JUNIOR",
  "PLATFORM_ONLY",
];

type Enrollment = {
  id: string;
  program: PlayerProgram;
  coachId: string | null;
  coachName: string | null;
  enrolledAt: Date;
  endedAt: Date | null;
  notes: string | null;
};

type Coach = { id: string; name: string };

const NB = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", year: "numeric" });

export function EnrollmentPanel({
  playerId,
  enrollments,
  coaches,
}: {
  playerId: string;
  enrollments: Enrollment[];
  coaches: Coach[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<PlayerProgram>("AK_ACADEMY");
  const [selectedCoach, setSelectedCoach] = useState(coaches[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const active = enrollments.filter((e) => e.endedAt === null);
  const historical = enrollments.filter((e) => e.endedAt !== null);

  const needsCoach = selectedProgram !== "PLATFORM_ONLY";

  function handleAdd() {
    startTransition(async () => {
      await addEnrollment({
        playerId,
        program: selectedProgram,
        coachId: needsCoach && selectedCoach ? selectedCoach : null,
        notes: notes.trim() || null,
      });
      setShowForm(false);
      setNotes("");
    });
  }

  function handleEnd(enrollmentId: string) {
    startTransition(async () => {
      await endEnrollment(enrollmentId);
    });
  }

  return (
    <section className="mb-4 rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div>
          <h2 className="font-display text-[14px] font-semibold text-foreground">
            Program-tilhørighet
          </h2>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            {active.length} aktive · {historical.length} historiske
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 font-mono text-[11px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus size={12} strokeWidth={2} />
          Legg til
        </button>
      </div>

      {/* Legg-til-skjema */}
      {showForm && (
        <div className="border-b border-border bg-secondary/30 px-4 py-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                Program
              </label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value as PlayerProgram)}
                className="w-full rounded-md border border-border bg-card px-4 py-2 text-[13px] text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                {ALL_PROGRAMS.map((p) => (
                  <option key={p} value={p}>
                    {PROGRAM_LABEL[p]}
                  </option>
                ))}
              </select>
            </div>

            {needsCoach && (
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  Coach
                </label>
                <select
                  value={selectedCoach}
                  onChange={(e) => setSelectedCoach(e.target.value)}
                  className="w-full rounded-md border border-border bg-card px-4 py-2 text-[13px] text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                >
                  {coaches.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                Notat (valgfritt)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="f.eks. Høst 2026"
                className="w-full rounded-md border border-border bg-card px-4 py-2 text-[13px] text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="mt-2 flex gap-2">
            <button
              onClick={handleAdd}
              disabled={isPending}
              className="rounded-full bg-primary px-4 py-1.5 font-mono text-[11px] font-semibold text-primary-foreground disabled:opacity-50"
            >
              {isPending ? "Lagrer..." : "Bekreft"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-full border border-border bg-card px-4 py-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      {/* Aktive enrolleringer */}
      {active.length === 0 && !showForm ? (
        <div className="px-4 py-6 text-center font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          Ingen aktive program-tilknytninger
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {active.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-4 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" aria-label="Aktiv" />
                <div>
                  <div className="font-medium text-[13px] text-foreground">
                    {PROGRAM_LABEL[e.program]}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {e.coachName ? `Coach: ${e.coachName}` : "Ingen coach"}
                    {" · "}
                    Fra {NB.format(e.enrolledAt)}
                    {e.notes && ` · ${e.notes}`}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleEnd(e.id)}
                disabled={isPending}
                title="Avslutt enrollering"
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
              >
                <X size={13} strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Historiske enrolleringer (sammenslått) */}
      {historical.length > 0 && (
        <details className="border-t border-border">
          <summary className="cursor-pointer px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground">
            {historical.length} historiske enrolleringer
          </summary>
          <ul className="divide-y divide-border">
            {historical.map((e) => (
              <li key={e.id} className="flex items-center gap-2 px-4 py-2 opacity-60">
                <span className="h-2 w-2 rounded-full bg-muted-foreground" aria-label="Avsluttet" />
                <div>
                  <div className="font-medium text-[13px] text-foreground">
                    {PROGRAM_LABEL[e.program]}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {e.coachName ?? "Ingen coach"}
                    {" · "}
                    {NB.format(e.enrolledAt)} – {e.endedAt ? NB.format(e.endedAt) : "—"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
