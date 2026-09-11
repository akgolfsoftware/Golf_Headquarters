/** Syntetisk Plan-prøve. Serverhandlingene erstattes bare i riggens esbuild. */
import { createRoot } from "react-dom/client";
import { PlanLaster } from "@/components/portal/v2/PlanLaster";
import { PlanV2 } from "@/components/portal/v2/PlanV2";
import { TrainLockPlayerCaddie, TrainLockPlayerIsland } from "@/components/train-lock/player-chrome";
import type { TodaySession, WeekDay } from "@/app/portal/actions";
import styles from "@/components/train-lock/player-chrome.module.css";
const params = new URLSearchParams(location.search);
const state = params.get("tilstand") ?? "fylt";
document.documentElement.dataset.trainLock = "4";
if (params.get("tema") === "dark") document.documentElement.dataset.v2Tema = "dark";
const nav = [{ id: "hjem", href: "/portal", label: "I dag" }, { id: "plan", href: "/portal/planlegge", label: "Plan" }, { id: "analyse", href: "/portal/analysere", label: "Analyse" }, { id: "meg", href: "/portal/meg", label: "Meg" }];
const week: WeekDay[] = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((dayLabel, i) => ({ date: new Date(`2026-08-${17 + i}T10:00Z`), dayLabel, dayNumber: 17 + i, isToday: i === 0, sessions: [] }));
const okt: TodaySession = { id: "test-okt", model: "wb", title: state === "lang" ? "En lang treningsoppgave med presisjon og kontroll over ballbanen" : "Innspill 50–80 m", startTime: new Date("2026-08-17T07:00Z"), endTime: new Date("2026-08-17T07:50Z"), status: "PLANNED", practiceType: "RANDOM", pyramidArea: "SLAG", durationMin: 50, sted: "Eksempelbanen", maalsetning: "Treff riktig lengde med en rolig avslutning.", drills: [{ id: "d1", name: "Lengdekontroll", durationMinutes: 30 }, { id: "d2", name: "Målspill", durationMinutes: 20 }], href: "/portal/live/test-okt/brief" };
if (state !== "tom") {
  week[0].sessions = [okt, { ...okt, id: "ferdig", title: "Fys · mobilitet", pyramidArea: "FYS", startTime: new Date("2026-08-17T05:30Z"), endTime: new Date("2026-08-17T06:00Z"), durationMin: 30, status: "COMPLETED", href: "/portal/live/ferdig/summary" }];
  week[2].sessions = [{ ...okt, id: "onsdag", title: "Teknikk", status: "COMPLETED", startTime: new Date("2026-08-19T07:00Z"), endTime: new Date("2026-08-19T08:00Z") }];
  week[4].sessions = [{ ...okt, id: "fredag", title: "Styrke", status: "COMPLETED", startTime: new Date("2026-08-21T07:00Z"), endTime: new Date("2026-08-21T08:00Z") }];
}
if (state === "overlapp") week[0].sessions.push({ ...okt, id: "overlapp", title: "Overlappende økt", startTime: new Date("2026-08-17T07:20Z"), endTime: new Date("2026-08-17T08:00Z") }, { ...okt, id: "sent", title: "Sen kort økt", startTime: new Date("2026-08-17T21:50Z"), endTime: new Date("2026-08-17T21:55Z") });
const forslag = state === "tom" ? [] : [{ coachName: "Test Coach", session: { ...okt, id: "forslag", title: "Nærspill – ekstra", startTime: new Date("2026-08-18T12:00Z"), endTime: new Date("2026-08-18T12:40Z"), durationMin: 40 } }];
Object.assign(window, { tnOppfriskinger: 0, planKall: [], planSvar: async (kind: string, input: {sessionId: string; decision?: string; newDate?: string; newStartMinute?: number}) => {
  (window as unknown as { planKall: unknown[] }).planKall.push({ kind, input });
  await new Promise((r) => setTimeout(r, 150));
  if (state === "feil") return { ok: false, error: "Endringen ble ikke lagret. Prøv igjen." };
  const f = input.sessionId === "forslag" ? forslag[0].session : okt;
  return { ok: true, data: { id: f.id, playerId: "syntetisk", coachId: "syntetisk-coach", date: input.newDate ?? f.startTime.toISOString().slice(0, 10), startMinute: input.newStartMinute ?? 840, durationMinutes: f.durationMin, title: f.title, status: "PUBLISHED", pyramid: f.pyramidArea, location: f.sted, notes: f.maalsetning, drills: f.drills.map((d) => ({ id: d.id, title: d.name, durationMinutes: d.durationMinutes })), needsPlayerApproval: false, hiddenByPlayer: input.decision === "REJECTED" } };
} });
createRoot(document.getElementById("root")!).render(state === "laster" ? <PlanLaster /> : <TrainLockPlayerCaddie aktiv composer={<p>Syntetisk Caddie. Ingen meldinger sendes.</p>}><style>{`body{font-family:var(--tl-font-sans);background:var(--tl-scene);color:var(--tl-text)}.plan-ramme{display:flex;min-height:100dvh}.plan-rail{display:none}@media(min-width:1101px){.plan-rail{display:block;width:64px;flex:none;border-right:1px solid var(--tl-hair)}}`}</style><div className="plan-ramme"><div className="plan-rail" /><div className={styles.innhold} style={{ flex: 1, minWidth: 0 }}><PlanV2 data={{ weekNumber: 34, week }} kalender={[{ id: "skole", lag: "SKOLE", dato: "2026-08-17", tittel: "Skole", startMin: null, sluttMin: null, heldag: true, lesevisning: true }]} forslag={forslag} /></div></div><TrainLockPlayerIsland aktiv="plan" nav={nav} /></TrainLockPlayerCaddie>);
