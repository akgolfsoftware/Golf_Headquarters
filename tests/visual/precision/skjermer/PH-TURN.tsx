/** Prøvefil for pakke 17 Turneringer og Én turnering. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHTurneringer, type PHTurneringRad } from "@/components/portal/precision/PHTurneringer";
import { PHTurnering, type PHTurneringData } from "@/components/portal/precision/PHTurnering";

export const sti = "/portal/tren/turneringer";
const S = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;
const rad = (o: Partial<PHTurneringRad>): PHTurneringRad => ({ id: "t1", navn: "Norgescup 1", dag: "23", mnd: "apr", dato: "23.–25. apr", sted: "Kristiansand GK", tour: "Junior Tour", frist: "1. apr", fristHaster: false, tier: null, status: null, ...o });
const mine = [rad({ id: "m1", tier: "A", status: "På planen" }), rad({ id: "m2", navn: "Et veldig langt turneringsnavn som må brytes pent på smal skjerm", tier: "C", status: "Bekreftet av spiller" })];
const katalog = [rad({ id: "k1", tier: "A" }), rad({ id: "k2", navn: "Østlandstour 3", tour: "Østlandstour" }), rad({ id: "k3", navn: "Klubbmesterskap", tour: null })];
const en = (o: Partial<PHTurneringData> = {}): PHTurneringData => ({
  id: "t1", navn: "Norgescup 1", undertittel: "Turnering · A-turnering · Kommende",
  fakta: [{ k: "Når", v: "23. april 2027" }, { k: "Bane", v: "Kristiansand GK" }, { k: "Påmeldingsfrist", v: "1. april 2027" }],
  arrangorUrl: "https://golfbox.no", entry: { id: "e1", status: "PLANNED", tier: "A" }, kanStarteRunde: false,
  startHjelp: "Kan startes når du er påmeldt.", runde: null,
  historikk: [{ id: "h1", ar: 2026, plass: 12, score: 222 }], ...o,
});
const h = { taUt: async () => {}, startRunde: async () => {} };
export const tilstander = {
  liste: <S><PHTurneringer data={{ neste: { id: "t1", navn: "Norgescup 1", uker: 28, sted: "Kristiansand GK", dato: "23. april 2027", frist: "1. april 2027" }, mine, katalog }} /></S>,
  "liste-tom": <S><PHTurneringer data={{ neste: null, mine: [], katalog: [] }} /></S>,
  en: <S><PHTurnering data={en()} handlinger={h} /></S>,
  "en-paameldt": <S><PHTurnering data={en({ entry: { id: "e1", status: "CONFIRMED", tier: "B" }, kanStarteRunde: true, startHjelp: null })} handlinger={h} /></S>,
  "en-ikke-plan": <S><PHTurnering data={en({ entry: null, historikk: [] })} handlinger={h} /></S>,
};
