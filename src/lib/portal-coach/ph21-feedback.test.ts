import { test } from "node:test";
import assert from "node:assert/strict";
import { byggFeedbackListe } from "./ph21-feedback";

const okt = (o: Partial<Parameters<typeof byggFeedbackListe>[0][number]>) => ({ id: "o1", title: "Svingtrening", notes: null, completedSummary: null, tid: "2. okt", ...o });

test("coachens notat uten coachRatedAt er ikke en tilbakemelding, og får aldri et oppdiktet tall", () => {
  assert.deepEqual(byggFeedbackListe([okt({ notes: "Ankerbeskrivelse fra generatoren" })]), []);
});

test("coachens skrevne tilbakemelding lenker til lesevisningen og har ingen dagsform", () => {
  const [r] = byggFeedbackListe([okt({ notes: "Hold køllen parallell lenger.", completedSummary: { coachRatedAt: "2026-10-02T14:00:00Z" } })]);
  assert.equal(r?.from, "coach");
  assert.equal(r?.rating, null);
  assert.equal(r?.href, "/portal/coach/tilbakemelding/o1");
});

test("spillerens dagsform leses fra spillerOpplevd og kommentaren fra dineOrd", () => {
  const liste = byggFeedbackListe([okt({ notes: "Coachens tekst", completedSummary: { coachRatedAt: "2026-10-02T14:00:00Z", spillerOpplevd: { rating: 4 }, dineOrd: { tekst: "Traff bedre" } } })]);
  assert.deepEqual(liste.map((r) => [r.from, r.rating, r.text]), [["coach", null, "Coachens tekst"], ["me", 4, "Traff bedre"]]);
});

test("eldre «[Dagsform n/5]» i notes vises som spillerens, med tallet som står der", () => {
  const [r] = byggFeedbackListe([okt({ notes: "[Dagsform 2/5] Tungt i dag", completedSummary: { coachRatedAt: "2026-10-02T14:00:00Z" } })]);
  assert.deepEqual([r?.from, r?.rating, r?.text], ["me", 2, "Tungt i dag"]);
});
