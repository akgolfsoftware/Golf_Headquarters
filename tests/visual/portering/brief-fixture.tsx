/** Syntetiske økter; ingen innlogging, DB-kall eller ekte start i denne riggen. */
import { createRoot } from "react-dom/client";
import { PlanSessionBrief } from "@/components/portal/live/PlanSessionBrief";
import { LiveBrief } from "@/components/portal/live/LiveBrief";
import { mapWbToLiveSessionData, mapWbToLiveSummary, type WbLiveInput } from "@/lib/portal-live/wb-live-map";
import type { BriefBlockReason } from "@/lib/portal-live/brief-state";
const params = new URLSearchParams(location.search);
const state = params.get("tilstand") ?? "fylt";
const model = params.get("modell") ?? "wb";
document.documentElement.dataset.trainLock = "4";
if (params.get("tema") === "dark") document.documentElement.dataset.v2Tema = "dark";
const raw: WbLiveInput = { id: "syntetisk-okt", title: state === "lang" ? "En lang treningsoppgave med presisjon og kontroll over ballbanen og et langt øvelsesnavn" : "Innspill 50–80 m", date: new Date("2026-09-14T00:00Z"), startMinute: 540, durationMinutes: 50, status: state === "ferdig" ? "COMPLETED" : state === "pagar" ? "IN_PROGRESS" : state === "avlyst" ? "CANCELLED" : "PUBLISHED", pyramid: "SLAG", location: "Eksempelbanen", notes: "Hold samme rutine gjennom hele oppgaven.", publishedAt: null, createdAt: new Date("2026-09-10T08:00Z"), drills: state === "tom" ? [] : [
  { id: "d1", title: "Oppvarming", description: "Korte svinger med rolig tempo.", durationMinutes: 10, sortOrder: 0 },
  { id: "d2", title: state === "lang" ? "Hovedoppgavenmedetveldiglangtsammensattnavnsomikkeskalgioverskytendeinnhold" : "Lengdekontroll", description: "Veksle mellom 50 og 80 meter.", durationMinutes: 30, sortOrder: 1 },
  { id: "d3", title: "Avslutning", description: "Samme rutine til siste slag.", durationMinutes: 10, sortOrder: 2 },
] };
const data = mapWbToLiveSessionData(raw);
if (state === "pause") data.status = "PAUSED";
if (model === "plan") { data.planName = "Testplan"; data.maalsetning = "Åtte av tolv i vinduet."; if (data.drills[0]) data.drills[0].repsLabel = "3 × 10"; }
const reason: BriefBlockReason = state === "coach" ? "coach" : state === "gratis" ? "tier" : state === "forslag" ? "approval" : state === "ferdig" ? "completed" : null;
const canStart = !["coach", "gratis", "forslag", "ferdig"].includes(state);
Object.assign(window, { briefKall: 0, briefSvar: async () => {
  (window as unknown as { briefKall: number }).briefKall++;
  await new Promise((resolve) => setTimeout(resolve, 250));
  if (state === "feil") throw new Error("Syntetisk nettfeil");
} });
const v2 = { ...mapWbToLiveSummary(raw), status: state === "ferdig" ? "COMPLETED" as const : state === "pagar" ? "IN_PROGRESS" as const : state === "avlyst" ? "CANCELLED" as const : "PLANNED" as const, completed: state === "ferdig", coachName: "Test Coach", focus: "Lik rutine", drills: mapWbToLiveSummary(raw).drills.map((d) => ({ ...d, repType: "BALLER_SLATT", repAntall: 12 })) };
createRoot(document.getElementById("root")!).render(model === "v2" ? <LiveBrief data={v2} canStart={canStart} blockReason={reason} /> : <PlanSessionBrief data={data} canStart={canStart} blockReason={reason} />);
