/** Prøvefil for PH-04 Live-økt: før start. Syntetiske data, demospiller. */
import { Play, CircleAlert, RotateCw } from "lucide-react";
import { PH04LiveBrief, PH04Lenke, PH04TilbakeIDag, PH04TilbakeTilPlan, type PH04Props, type PH04Ovelse } from "@/components/portal/precision/PH04LiveBrief";
import { LiveBrief } from "@/components/portal/live/LiveBrief";
import type { LiveV2Session } from "@/components/portal/live/types";
import { Ikon, LasterTilstand, FeilTilstand, Knapp } from "@/components/precision/pa";

export const sti = "/portal/live/o1/brief";
export const natt = ["livebrief", "data", "lang", "tom", "sperret", "laster", "feil"];

const ov = (i: number, navn: string, min: number, mengde: string, under: string | null = null, notat: string | null = null): PH04Ovelse => ({ id: `d${i}`, navn, min, mengde, under, notat });
const base: PH04Props = {
  hvem: "Øyvind Rohjan", coach: "Anders Kristiansen", tittel: "Innspill og nærspill", tid: "14:30–15:45", sted: "Range 3 · Fredrikstad GK", min: 75, akser: ["slag", "tek"],
  maal: "Lengdekontroll på innspill mellom 50 og 100 m: innenfor 6 m fra målet.", fokus: "Hendene foran ballen i treff",
  ekstra: [{ label: "Fra coachen", text: "Hold 50 % fart til det sitter." }],
  ovelser: [
    ov(1, "Innspill ca. 100 m · Lengdekontroll", 20, "30 baller", null, "Tre mål på 90, 100 og 110 m. Rutine før hvert slag."),
    ov(2, "Innspill ca. 50 m · Lengdekontroll", 20, "3 × 10"),
    ov(3, "Pitch · Landingspunkt", 15, "30 baller", "Teknisk"),
    ov(4, "Putting 3–5 fot · Ballstart", 20, "50 baller"),
  ],
  melding: null,
  handling: <PH04Lenke href="#" ikon={<Ikon icon={Play} size={22} name="play" />}>Start økt</PH04Lenke>,
};
const Tegn = ({ children }: { children: React.ReactNode }) => <div className="pa-root" data-theme="night" style={{ minHeight: "100dvh", background: "var(--surface-page)", padding: "12px 16px", boxSizing: "border-box" }}><div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>{children}</div></div>;
export const tilstander = {
  data: <PH04LiveBrief {...base} />,
  lang: <PH04LiveBrief {...base} tittel="Et veldig langt øktnavn som må brytes på flere linjer uten å sprenge skjermen" sted="Fredrikstad Golfklubb, Range 3 og puttinggreen" hvem="Et veldig langt spillernavn Og Etternavn"
    maal={"Første linje i målet.\nAndre linje med et veldig_langt_ord_uten_mellomrom_som_må_brytes_riktig_i_kortet"} ovelser={[ov(1, "Øvelse_med_et_veldig_langt_navn_uten_mellomrom_som_må_brytes", 20, "30 baller", "Teknisk", "Notat over\nto linjer")]} />,
  tom: <PH04LiveBrief {...base} ovelser={[]} maal={null} fokus={null} ekstra={[]} handling={<PH04TilbakeIDag />} />,
  sperret: <PH04LiveBrief {...base} melding="Live krever abonnement." handling={<><PH04Lenke href="#">Se abonnement</PH04Lenke><PH04TilbakeTilPlan /></>} />,
  laster: <Tegn><LasterTilstand text="Henter økta …" /></Tegn>,
  feil: <Tegn><FeilTilstand icon={CircleAlert} title="Økta kunne ikke lastes" text="Noe gikk galt da økta skulle hentes. Prøv igjen, eller gå tilbake til I dag." retry={<Knapp variant="secondary" icon={RotateCw}>Prøv igjen</Knapp>} /><PH04Lenke href="#">Tilbake til I dag</PH04Lenke></Tegn>,
};

// Ekte komponenter (LiveBrief) med syntetiske data: beviser kartleggingen fra appens datamodell.
const v2 = {
  sessionId: "o1", title: "Innspill og nærspill", coachComment: "Hold 50 % fart til det sitter.", focus: "Hendene foran ballen i treff", status: "PLANNED",
  scheduledAtISO: "2026-09-30T12:30:00.000Z", endTimeISO: "2026-09-30T13:45:00.000Z", location: "Range 3", maalsetning: "Lengdekontroll på innspill: innenfor 6 m fra målet.",
  coachName: "Anders Kristiansen", publishedAtISO: "2026-09-23T10:00:00.000Z", completed: false, studentName: "Øyvind Rohjan", pyramide: "SLAG", existingLogs: [], completedSummary: null,
  drills: [
    { id: "d1", index: 1, name: "Innspill ca. 100 m", description: "Tre mål på 90, 100 og 110 m.", durationMinutes: 20, actualDurationSec: null, plannedReps: 30, pyramide: "SLAG", lFase: null, notes: null, repType: "BALLER_SLATT", repAntall: 30, repMinutter: null, repSett: null, repReps: null },
    { id: "d2", index: 2, name: "Styrke bein", description: null, durationMinutes: 15, actualDurationSec: null, plannedReps: 0, pyramide: "FYS", lFase: null, notes: null, repType: "SETT_REPS", repAntall: null, repMinutter: null, repSett: 3, repReps: 10 },
  ],
} as unknown as LiveV2Session;
Object.assign(tilstander, {
  livebrief: <LiveBrief data={v2} canStart blockReason={null} />,
});
