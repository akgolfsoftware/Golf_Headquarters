import type { ReactNode } from "react";
import { PH04LiveBrief, type PH04Ovelse } from "@/components/portal/precision/PH04LiveBrief";
import { akseFra } from "@/components/precision/pa-workbench";
import type { Akse } from "@/components/precision/pa";

export type BriefDrill = PH04Ovelse & { pyramide?: string | null };
export type SessionBriefProps = {
  title: string;
  durationMin: number;
  scheduledAtISO: string;
  location?: string | null;
  /** Aksen (FYS/TEK/SLAG/SPILL/TURN) økta hører til. */
  pyramide: string;
  drills: BriefDrill[];
  hvem?: string | null;
  coach?: string | null;
  maal?: string | null;
  fokus?: string | null;
  sections: { label: string; text: string }[];
  action: ReactNode;
  message?: string | null;
};
const clock = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });

/** Felles innhold for V2-, plan- og Workbench-økter. Modellenes handlinger
 * beholdes hos kalleren; bare presentasjonen deles (Precision Athletics PH-04). */
export function SessionBrief({ title, durationMin, scheduledAtISO, location, pyramide, drills, hvem, coach, maal, fokus, sections, action, message }: SessionBriefProps) {
  const start = new Date(scheduledAtISO);
  const validDate = Number.isFinite(start.getTime());
  const end = new Date(start.getTime() + Math.max(0, durationMin) * 60_000);
  const tid = validDate ? `${clock.format(start)}${durationMin > 0 ? `–${clock.format(end)}` : ""}` : null;
  const akser = [...new Set([akseFra(pyramide), ...drills.map((d) => akseFra(d.pyramide))].filter((a): a is Akse => a !== null))];
  return <PH04LiveBrief hvem={hvem ?? null} coach={coach ?? null} tittel={title} tid={tid} sted={location ?? null} min={durationMin} akser={akser}
    maal={maal ?? null} fokus={fokus ?? null} ekstra={sections} ovelser={drills.map(({ pyramide: _p, ...o }) => o)} melding={message ?? null} handling={action} />;
}
