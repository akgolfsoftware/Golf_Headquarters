/** Prøvefil for PH-04 Live-økt: før start. Syntetiske data, ingen ekte spillere. */
import { PlanSessionBrief } from "@/components/portal/live/PlanSessionBrief";
import { LiveBrief } from "@/components/portal/live/LiveBrief";
import BriefLaster from "@/app/portal/(fullscreen)/live/[sessionId]/brief/loading";
import BriefFeil from "@/app/portal/(fullscreen)/live/[sessionId]/brief/error";
import { mapWbToLiveSessionData, mapWbToLiveSummary, type WbLiveInput } from "@/lib/portal-live/wb-live-map";

export const sti = "/portal/live/syntetisk-okt/brief";

const drill = (id: string, title: string, min: number, sortOrder: number, description: string) => ({ id, title, description, durationMinutes: min, sortOrder });
const raw = (drills: WbLiveInput["drills"], title = "Innspill og nærspill"): WbLiveInput => ({
  id: "syntetisk-okt", title, date: new Date("2026-09-26T00:00Z"), startMinute: 14 * 60 + 30, durationMinutes: 75, status: "PUBLISHED", pyramid: "SLAG",
  location: "Range 3 · Fredrikstad GK", notes: "Ti lav-hastighetssving uten mål først.", publishedAt: null, createdAt: new Date("2026-09-24T08:00Z"), drills,
});
const fire = [
  drill("d1", "Innspill ca. 100 m · Lengdekontroll", 20, 0, "Tre mål på 90, 100 og 110 m."),
  drill("d2", "Innspill ca. 50 m · Lengdekontroll", 20, 1, "Tjue i lav hastighet mot 50 m."),
  drill("d3", "Pitch · Landingspunkt", 15, 2, "Tretti pitcher fra 20–30 m."),
  drill("d4", "Putting 3–5 fot · Ballstart med et veldig langt øvelsesnavn som må brytes over flere linjer", 20, 3, "Port med to tees."),
];
const data = mapWbToLiveSessionData(raw(fire));
const tom = mapWbToLiveSessionData(raw([]));
const v2 = { ...mapWbToLiveSummary(raw(fire)), status: "PLANNED" as const, completed: false, coachName: "Anders Kristiansen", studentName: "Øyvind Rohjan", focus: "Hendene foran ballen i treff", coachComment: "Hold 50 % fart til det sitter." };

export const tilstander = {
  data: <PlanSessionBrief data={data} canStart blockReason={null} />,
  v2: <LiveBrief data={v2} canStart blockReason={null} />,
  tom: <PlanSessionBrief data={tom} canStart blockReason={null} />,
  sperret: <PlanSessionBrief data={data} canStart={false} blockReason="tier" />,
  laster: <BriefLaster />,
  feil: <BriefFeil error={new Error("x")} reset={() => {}} />,
};
export const natt = Object.keys(tilstander);
