/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/meg/briefs.test.ts
 *
 * Tester kun byggWangAgendaMarkdown — den rene malbyggeren bak
 * runWangAgenda(). Selve runWangAgenda() krever connectorer (Notion/Google)
 * + Telegram/Supabase og testes derfor ikke her.
 *
 * Viktig arkitekturpunkt denne testen indirekte dokumenterer: malen bygges
 * med ren strengsammensetning — INGEN kall til komponer()/Anthropic. Se
 * PII-kommentaren over byggWangAgendaMarkdown i briefs.ts.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { byggWangAgendaMarkdown } from "./briefs";

test("byggWangAgendaMarkdown inkluderer alle tre seksjoner", () => {
  const md = byggWangAgendaMarkdown("- Sak A [id1]", "- 22.07.2026: Trening @ Fredrikstad");
  assert.match(md, /## Aksjonspunkter fra forrige møte/);
  assert.match(md, /## Ukas hendelser/);
  assert.match(md, /## Uavklarte saker/);
});

test("byggWangAgendaMarkdown setter kildene inn rått, uendret", () => {
  const oppgaver = "- Elev X: følg opp skade [id1]";
  const kalender = "- 22.07.2026 09:00: Fysisk test @ WANG";
  const md = byggWangAgendaMarkdown(oppgaver, kalender);
  assert.ok(md.includes(oppgaver));
  assert.ok(md.includes(kalender));
});

test("byggWangAgendaMarkdown forklarer uavklarte saker uten å late som det finnes et eget filter", () => {
  const md = byggWangAgendaMarkdown("- Sak A", "- Hendelse A");
  assert.match(md, /Anders markerer selv uavklarte elevsaker/);
});

test("byggWangAgendaMarkdown er deterministisk (samme input gir samme output)", () => {
  const a = byggWangAgendaMarkdown("- Sak A", "- Hendelse A");
  const b = byggWangAgendaMarkdown("- Sak A", "- Hendelse A");
  assert.equal(a, b);
});
