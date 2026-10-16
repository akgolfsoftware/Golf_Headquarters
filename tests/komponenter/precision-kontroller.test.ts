import assert from "node:assert/strict";
import { describe, mock, test } from "node:test";
import { createElement, type KeyboardEvent } from "react";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/link", { defaultExport: "a" });
describe("Precision-kontroller", async () => {
const { Knapp } = await import("@/components/precision/pa");
const { SegmentertValg } = await import("@/components/precision/pa-a2");

test("lagring sperrer knappen selv om kallet sender disabled=false", () => {
  const html = renderToStaticMarkup(Knapp({
    loading: true, disabled: false, children: "Lagre øvelse",
  }));
  assert.match(html, /disabled=""/);
  assert.match(html, /aria-busy="true"/);
});

test("lokal klasse bevarer knappens variant, størrelse og native attributter", () => {
  const html = renderToStaticMarkup(Knapp({
    className: "lokal-handling", variant: "secondary", size: "lg", type: "submit",
    name: "handling", value: "lagre", children: "Lagre",
  }));
  assert.match(html, /class="pa-btn pa-btn--secondary pa-btn--lg lokal-handling"/);
  assert.match(html, /type="submit"/);
  assert.match(html, /name="handling"/);
  assert.match(html, /value="lagre"/);
  assert.ok(!html.includes("Lagrer"), "knapper uten lagringstilstand reserverer ikke plass til ventetekst");
});

test("bare ett valg er valgt og i Tab-rekkefølgen", () => {
  const html = renderToStaticMarkup(createElement(SegmentertValg, {
    label: "Periode", value: "uke", onChange() {},
    options: [{ id: "dag", label: "Dag" }, { id: "uke", label: "Uke" }, { id: "maaned", label: "Måned" }],
  }));
  assert.match(html, /role="radiogroup" aria-label="Periode"/);
  assert.equal((html.match(/role="radio"/g) ?? []).length, 3);
  assert.equal((html.match(/aria-checked="true"/g) ?? []).length, 1);
  assert.equal((html.match(/tabindex="0"/g) ?? []).length, 1);
});

test("manglende verdi gir en inngang med Tab uten å velge data automatisk", () => {
  const html = renderToStaticMarkup(createElement(SegmentertValg, {
    label: "Periode", value: "ukjent", onChange() { assert.fail("skal ikke endre data ved rendering"); },
    options: [{ id: "dag", label: "Dag" }, { id: "uke", label: "Uke" }],
  }));
  assert.equal((html.match(/tabindex="0"/g) ?? []).length, 1);
  assert.ok(!html.includes('aria-checked="true"'));
});

test("piltasthåndtereren flytter fokus og verdi sammen, også rundt endene", () => {
  const options = [{ id: "dag", label: "Dag" }, { id: "uke", label: "Uke" }, { id: "maaned", label: "Måned" }];
  for (const [fra, key, til] of [[0, "ArrowLeft", 2], [2, "ArrowRight", 0], [0, "ArrowDown", 1], [2, "ArrowUp", 1], [1, "Home", 0], [1, "End", 2]] as const) {
    let endret = "";
    let fokus = -1;
    let stoppet = false;
    const radios = options.map((_, i) => ({ focus() { fokus = i; } }));
    const tree = SegmentertValg({ label: "Periode", value: options[fra].id, options, onChange(v) { endret = v; } });
    tree.props.children[fra].props.onKeyDown({
      key, preventDefault() { stoppet = true; },
      currentTarget: { parentElement: { querySelectorAll() { return radios; } } },
    } as unknown as KeyboardEvent<HTMLButtonElement>);
    assert.equal(endret, options[til].id, key);
    assert.equal(fokus, til, key);
    assert.equal(stoppet, true, key);
  }
});

test("Tab og native aktivering overlates til nettleseren", () => {
  const tree = SegmentertValg({ label: "Periode", value: "dag", options: [{ id: "dag", label: "Dag" }], onChange() { assert.fail("uventet verdiendring"); } });
  for (const key of ["Tab", "Enter", " "]) {
    tree.props.children[0].props.onKeyDown({ key, preventDefault() { assert.fail("tasten skal ikke fanges"); } } as unknown as KeyboardEvent<HTMLButtonElement>);
  }
});
});
