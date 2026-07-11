"use client";

/* AK Golf HQ v2 — WORKBENCH COMPOSER-BITER (retning C).
   Kun PalettSok gjenstår: AiForslagStrip/AngreStrip (aldri montert) og
   BalanseRail (hardkodede demo-tall — brudd på «ingen fabrikerte tall» om
   montert) ble fjernet 2026-07-10; hent dem fra git-historikken hvis
   AI-forslag/angre bygges ekte senere. Bygger KUN på v2-core (./core). */

import { T } from "./core";
import { Icon } from "./icon";

/* ── PalettSok — ett samlet søkefelt (grep 4) ───────────
   Erstatter de 6 spredte veiene til «legg inn økt». Flate: Begge. */
export interface PalettSokProps {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
}
export function PalettSok({ value = "", onChange, placeholder = "Søk økt, drill, mal…" }: PalettSokProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, height: 38, padding: "0 12px", borderRadius: 11, background: T.panel2, border: `1px solid ${T.border}`, minWidth: 0 }}>
      <Icon name="search" size={14} style={{ color: T.mut, flex: "none" }} />
      <input value={value} onChange={(e) => onChange && onChange(e.target.value)} placeholder={placeholder}
        style={{ flex: 1, minWidth: 0, appearance: "none", background: "transparent", border: "none", outline: "none", color: T.fg, fontFamily: T.ui, fontSize: 12.5 }} />
      {value ? <button onClick={() => onChange && onChange("")} title="Tøm" style={{ appearance: "none", cursor: "pointer", background: "transparent", border: "none", color: T.mut, display: "inline-flex", flex: "none", padding: 0 }}><Icon name="x" size={13} /></button> : null}
    </div>
  );
}
