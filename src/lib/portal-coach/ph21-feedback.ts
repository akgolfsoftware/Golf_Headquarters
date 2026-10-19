/**
 * Lista «Tidligere» under Tilbakemelding i Innboks (PH-21): én rad per tilbakemelding, fra coachen eller fra
 * spilleren, bygget fra ekte felt på økta. Ingen tall gjettes.
 *
 * - Fra coachen: notes, men bare når completedSummary.coachRatedAt finnes (samme regel som lesevisningen
 *   /portal/coach/tilbakemelding/[oktId]); raden lenker dit.
 * - Fra spilleren: completedSummary.spillerOpplevd (dagsform 1–5) med kommentaren i dineOrd.
 * - Eldre data: den forrige lagringen skrev «[Dagsform n/5] tekst» i notes. Slike notater er spillerens
 *   og vises som spillerens tilbakemelding med tallet som står der.
 */
import type { PH21Feedback } from "./ph21-data";

export type FeedbackOkt = { id: string; title: string; notes: string | null; completedSummary: unknown; tid: string };

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const ELDRE = /^\[Dagsform ([1-5])\/5\]\s*([\s\S]*)$/;

export function byggFeedbackListe(okter: readonly FeedbackOkt[]): PH21Feedback[] {
  const ut: PH21Feedback[] = [];
  for (const o of okter) {
    const sum = obj(o.completedSummary);
    const notat = o.notes?.trim() ?? "";
    const eldre = ELDRE.exec(notat);
    if (notat && !eldre && typeof sum.coachRatedAt === "string") {
      ut.push({ id: `fb-coach-${o.id}`, session: o.title, from: "coach", rating: null, text: notat, t: o.tid, href: `/portal/coach/tilbakemelding/${o.id}` });
    }
    const opplevd = obj(sum.spillerOpplevd);
    const rating = typeof opplevd.rating === "number" && opplevd.rating >= 1 && opplevd.rating <= 5 ? opplevd.rating : null;
    const ord = obj(sum.dineOrd);
    const tekst = typeof ord.tekst === "string" ? ord.tekst.trim() : "";
    if (rating != null) {
      ut.push({ id: `fb-meg-${o.id}`, session: o.title, from: "me", rating, text: tekst || "—", t: o.tid });
    } else if (eldre) {
      ut.push({ id: `fb-meg-${o.id}`, session: o.title, from: "me", rating: Number(eldre[1]), text: eldre[2].trim() || "—", t: o.tid });
    }
  }
  return ut;
}
