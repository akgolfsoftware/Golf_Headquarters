/** Syntetiske handlinger; ekte komponent, klokke og IndexedDB. Ingen DB/AI-kall. */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LiveActive } from "@/components/portal/live/LiveActive";
import { mapWbToLiveSummary } from "@/lib/portal-live/wb-live-map";
import * as queue from "@/lib/offline-queue/live-drill-queue";
const params = new URLSearchParams(location.search);
const state = params.get("tilstand") ?? "fylt";
document.documentElement.dataset.trainLock = "4";
if (params.get("tema") === "dark") document.documentElement.dataset.v2Tema = "dark";
const data = mapWbToLiveSummary({ id: params.get("id") ?? "syntetisk-live", title: state === "lang" ? "Presisjonoglengdekontrollmedetveldiglangtnavnsomskalombrytes" : "Innspill 50–80 m", date: new Date("2026-09-14T00:00Z"), startMinute: 540, durationMinutes: 50, status: "IN_PROGRESS", pyramid: "SLAG", location: "Eksempelbanen", notes: "Hold samme rutine gjennom økta.", publishedAt: null, createdAt: new Date("2026-09-10T08:00Z"), drills: state === "tom" ? [] : [
  { id: "d1", title: state === "lang" ? "Lengdekontrollmedetveldiglangtsammenhengendenavn" : "Lengdekontroll", description: "Veksle mellom 50 og 80 meter.", durationMinutes: 30, sortOrder: 0 },
  { id: "d2", title: "Oppvarming", description: "Korte svinger med rolig tempo.", durationMinutes: 10, sortOrder: 1 },
  { id: "d3", title: "Avslutning", description: "Samme rutine til siste slag.", durationMinutes: 10, sortOrder: 2 },
] });
data.drills = data.drills.map((d) => ({ ...d, plannedReps: 12, repType: "BALLER_SLATT", repAntall: 12 }));
const controls = { startDelay: state === "lasting" ? 60000 : 30, startFail: state === "startfeil", saveDelay: 0, saveFail: state === "lagrefeil", finishDelay: 0, finishFail: state === "sluttfeil", loseFinishReply: false, serverState: state === "ferdig" ? "completed" : state === "avlyst" ? "unavailable" : "active", events: [] as { kind: string; args: unknown[] }[], navigation: "", logs: {} as Record<string, { repsTotal: number }>, finishedIds: [] as string[] };
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
Object.assign(window, { liveControls: controls, liveQueue: queue, liveNavigate: (url: string) => { controls.navigation = url; }, liveAction: async (kind: string, ...args: unknown[]) => {
  controls.events.push({ kind, args });
  if (kind === "start") {
    await wait(controls.startDelay);
    if (controls.startFail) throw new Error("Syntetisk startfeil");
    return { state: controls.serverState, redirectTo: controls.serverState === "completed" ? `/portal/live/${data.sessionId}/summary` : "/portal/planlegge" };
  }
  if (kind === "save") {
    await wait(controls.saveDelay);
    if (controls.saveFail) throw new Error("Syntetisk lagringsfeil");
    const input = args[0] as { drillId: string; repsTotal: number };
    controls.logs[input.drillId] = { repsTotal: input.repsTotal };
    return { ok: true };
  }
  await wait(controls.finishDelay);
  if (controls.finishFail) throw new Error("Syntetisk fullføringsfeil");
  controls.serverState = "completed";
  controls.finishedIds = args[2] as string[];
  if (controls.loseFinishReply) throw new Error("Syntetisk tapt svar");
  return { href: `/portal/live/${data.sessionId}/summary` };
} });
createRoot(document.getElementById("root")!).render(<StrictMode><LiveActive data={data} coachPanel={{ sessionId: data.sessionId, kind: "session-v2", tier: "PRO", userId: "syntetisk-spiller", fornavn: "Test", initialer: "TS", initialMessages: [] }} /></StrictMode>);
