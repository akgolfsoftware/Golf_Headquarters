import { KommandoPalett } from "akgolf-hq-komponenter";

/**
 * ⌘K-palett, rendret statisk åpen i egen demo-ramme: søkerad med ESC, grupper med caps-etikett,
 * aktiv rad med fill-strek og dim-flate, snarveier i Kbd (mono). Sidene under «Alle sider» er
 * PlayerHQs fire faner (I dag · Plan · Analyse · Meg) og AgencyOS' destinasjoner — ikke den utgåtte «Gjør».
 */

/** Spillerens palett: handlinger, sist brukt og de fire fanene. */
export function Spiller() {
  return (
    <KommandoPalett
      h={540}
      sok="Søk eller hopp til …"
      grupper={[
        {
          l: "Handlinger",
          items: [
            { i: "plus", t: "Logg ny økt", k: "⌘ N", aktiv: true },
            { i: "calendar", t: "Planlegg uke 39 i Workbench", k: "⌘ P" },
          ],
        },
        {
          l: "Sist brukt",
          items: [
            { i: "bar-chart", t: "SG-analyse · Nærspill" },
            { i: "play", t: "Wedge 60–100 m · torsdag 16:00" },
          ],
        },
        {
          l: "Alle sider",
          items: [
            { i: "home", t: "I dag", k: "G I" },
            { i: "calendar", t: "Plan", k: "G P" },
            { i: "bar-chart", t: "Analyse", k: "G A" },
            { i: "user", t: "Meg", k: "G M" },
          ],
        },
      ]}
    />
  );
}

/** Coachens palett i AgencyOS: stallen først; sidene er Cockpit · Innboks · Stall · Workbench. */
export function Coach() {
  return (
    <KommandoPalett
      h={540}
      sok="Søk i stallen eller hopp til …"
      grupper={[
        {
          l: "Handlinger",
          items: [
            { i: "user-plus", t: "Legg til spiller i stallen", k: "⌘ N", aktiv: true },
            { i: "calendar", t: "Planlegg gruppeuke · WANG Toppidrett", k: "⌘ P" },
          ],
        },
        {
          l: "Sist brukt",
          items: [
            { i: "user", t: "Øyvind Rohjan — Spillerkort" },
            { i: "inbox", t: "Innboks · 3 venter på svar" },
          ],
        },
        {
          l: "Alle sider",
          items: [
            { i: "layout-dashboard", t: "Cockpit", k: "G C" },
            { i: "inbox", t: "Innboks", k: "G I" },
            { i: "users", t: "Stall", k: "G S" },
            { i: "columns-3", t: "Workbench", k: "G W" },
          ],
        },
      ]}
    />
  );
}

const skrevet = { color: "var(--tl-text)" };

/** Søk skrevet inn: treffene er filtrert, første treff er aktivt. */
export function Sok() {
  return (
    <KommandoPalett
      h={320}
      sok={<span style={skrevet}>wedge</span>}
      grupper={[
        {
          l: "Treff",
          items: [
            { i: "play", t: "Wedge 60–100 m · torsdag 16:00", aktiv: true },
            { i: "file-text", t: "Wedge-økt · mal fra uke 35" },
            { i: "bar-chart", t: "SG approach 80–120 m · siste 8 runder" },
          ],
        },
      ]}
    />
  );
}
