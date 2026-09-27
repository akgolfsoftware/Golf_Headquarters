/** Faktisk PH-01-komponent med syntetiske data. Ingen database eller nettverk. */
import { createRoot } from "react-dom/client";
import { IDagSelected, PH01Loading } from "@/components/portal/v2/idag/IDagSelected";
import { byggMaanedPrikker, type IDagTilstand } from "@/lib/portal/idag-visning";
import type { IDagSelectedProps } from "@/components/portal/v2/idag/IDagSelected";
import type { NaaKort } from "@/components/portal/v2/idag/IDagTrainLock";
import type { PlayerDaySession } from "@/lib/workbench/wb-actions";

const state = new URLSearchParams(location.search).get("state") ?? "normal";
const prikker = byggMaanedPrikker({
  aar: 2026,
  maned: 9,
  idag: 22,
  ferdige: new Set([1, 3, 5, 7, 8, 10, 11, 14, 16, 17, 19, 21]),
});
const weekProgress = {
  plannedMin: 350,
  completedMin: 210,
  plannedByAxis: { FYS: 45, TEK: 60, SLAG: 155, SPILL: 90, TURN: 0 },
  completedByAxis: { FYS: 45, TEK: 30, SLAG: 90, SPILL: 45, TURN: 0 },
};
const agenda = [
  { id: "fys-1", planSessionId: "fys-1", lag: "OEKTER" as const, dato: "2026-09-22", tittel: "Styrke · underkropp", undertekst: "45 min · hjemme", startMin: 450, sluttMin: 495, heldag: false, href: "/portal/live/fys-1/summary", fullfort: true },
  { id: "skole-1", lag: "SKOLE" as const, dato: "2026-09-22", tittel: "Skole", undertekst: "Lesevisning", startMin: 510, sluttMin: 900, heldag: false, lesevisning: true },
  { id: "gruppe-1", planSessionId: "gruppe-1", lag: "OEKTER" as const, dato: "2026-09-22", tittel: "Fellestrening GFGK", undertekst: "Lagt inn av coach", startMin: 1140, sluttMin: 1260, heldag: false, href: "/portal/live/gruppe-1" },
];
const approval: PlayerDaySession = {
  id: "approval-1",
  title: "Innspill 50 m · flyttet til 16.00",
  startMinute: 960,
  durationMinutes: 90,
  pyramid: "SLAG",
  status: "PUBLISHED",
  drillsCount: 3,
  location: "Mulligan Indoor",
  notes: "Flyttet fordi du har fellestrening klokken 19.",
  origin: "COACH",
  needsPlayerApproval: true,
  approvalStatus: "PENDING",
};

function naaFor(tilstand: string): NaaKort | null {
  const base: NaaKort = {
    tittel: "Innspill 50 m",
    tid: "16.00–17.30",
    meta: "Treningsområde · Mulligan Indoor · 1 t 30 min",
    varighetTekst: "1 t 30 min",
    stedTekst: "Treningsområde · Mulligan Indoor",
    ctaTekst: "Start økt",
    ctaHref: "/portal/live/wedge-1",
    fremdriftPst: null,
    fremdriftTekst: null,
    live: false,
    fullfort: false,
    pyramide: "SLAG",
  };
  if (tilstand === "normal" || tilstand === "approval") return base;
  if (tilstand === "ongoing") return { ...base, tid: "42 min igjen · av 1 t 30 min", live: true, fremdriftPst: 53, fremdriftTekst: "42 min igjen · Blokk 2 av 4 · 60–80 m", sekundarHref: "/portal/live/wedge-1" };
  if (tilstand === "completed") return { ...base, fullfort: true, ctaHref: "/portal/live/wedge-1/summary", meta: "86 slag · 58 % i mål · egenvurdering 4 av 5" };
  return null;
}

function visningstilstand(tilstand: string): IDagTilstand {
  if (tilstand === "ongoing") return "pagar";
  if (["normal", "completed", "approval"].includes(tilstand)) return "okt";
  if (tilstand === "rest") return "hvile";
  if (tilstand === "empty-day") return "tom-dag";
  if (tilstand === "error") return "feil";
  return "tom-uke";
}

const props: IDagSelectedProps = {
  planLaast: state === "locked",
  sgVerdi: -0.41,
  weekProgress: state === "empty-week" || state === "locked" ? { plannedMin: 0, completedMin: 0, plannedByAxis: { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 }, completedByAxis: { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 } } : weekProgress,
  datoLinje: "Tirsdag 22. september",
  navn: "Jonas Vik",
  avatarUrl: null,
  hilsen: "God ettermiddag, Jonas",
  valgtOktId: state === "approval" ? approval.id : state === "locked" ? undefined : "wedge-1",
  fullfortMinutter: state === "completed" ? 300 : 210,
  maanedNavn: "September",
  prikker: state === "locked" ? prikker.map((prikk) => ({ ...prikk, fylt: false })) : prikker,
  tilstand: visningstilstand(state),
  naa: state === "locked" ? null : naaFor(state),
  neste: ["normal", "completed"].includes(state) ? { tittel: "Putt 3–5 fot", meta: "I morgen · 08.00–09.00", href: "/portal/planlegge" } : null,
  sgInnspill: "−0,41",
  okterUke: state === "empty-week" || state === "locked" ? 0 : 5,
  fullfortUke: state === "completed" ? 4 : 3,
  ukeNummer: 39,
  ukeFremdrift: state === "empty-week" || state === "locked" ? undefined : 0.6,
  trackman: state === "normal" ? { sessionId: "trackman-1", club: "PW", dateText: "20. sep", sentence: "Carry samlet seg 3,1 m tettere enn forrige økt." } : null,
  testerLive: state === "normal" || state === "locked" ? { testId: "test-1", testNavn: "Putt 3–5 fot", fremdrift: "8 av 20" } : null,
  godkjenninger: state === "approval" ? [approval] : [],
  dagLabel: "Tirsdag 22.",
  hendelser: state === "locked" ? agenda.filter((hendelse) => hendelse.lag !== "OEKTER") : agenda,
  caddie: <p>Syntetisk Caddie-inngang.</p>,
};

const root = createRoot(document.getElementById("root")!);
root.render(state === "loading" ? <PH01Loading /> : <IDagSelected {...props} />);
