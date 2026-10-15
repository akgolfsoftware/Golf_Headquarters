/** Prøvefil for PH-04 Live-brief i nytt design (pakke 2). Syntetiske data: mandag 5. oktober 2026 kl. 15:30. */
import { SessionBrief, type BriefDrill } from "@/components/portal/live/SessionBrief";

export const sti = "/portal/live/o1/brief";

const DRILLS: BriefDrill[] = [
  { id: "d1", name: "Oppvarming · Halv swing fra 50 m", meta: ["10 min", "10 slag", "Golfslag"], notes: "Rolig rytme. Full gjennomføring, halv baksving." },
  { id: "d2", name: "Innspill 100–150 m · Lengdekontroll", meta: ["20 min", "30 slag", "Golfslag"] },
  { id: "d3", name: "Innspill 50–100 m · Lengdekontroll", meta: ["20 min", "40 slag", "Golfslag"] },
  { id: "d4", name: "Pitch · Landingspunkt", meta: ["15 min", "30 slag", "Golfslag"] },
  { id: "d5", name: "Putting 3–5 fot · Ballstart", meta: ["10 min", "50 putter", "Golfslag"] },
];
const start = <a className="pa-btn pa-btn--primary pa-btn--xl pa-btn--full" href="#">Start økten</a>;

const Vis = ({ drills = DRILLS, mal = true, melding = null as string | null }) => <SessionBrief odId="prove" title="Innspill og nærspill" durationMin={75} scheduledAtISO="2026-10-05T13:30:00Z"
  location="Range 3 · Fredrikstad GK" context="Golfslag" drills={drills} action={start} message={melding}
  sections={mal ? [{ label: "Mål for økta", text: "7 av 10 innspill 50–100 m innenfor 4 m" }, { label: "Fra coachen", text: "Hold samme rytme på alle lengder." }] : []}
  provenance="Fra Anders Kristiansen · Lagt i planen 3. oktober" />;

export const tilstander = {
  data: <Vis />,
  tom: <Vis drills={[]} mal={false} />,
  sperret: <Vis melding="Økten venter på at du godkjenner den." />,
};
