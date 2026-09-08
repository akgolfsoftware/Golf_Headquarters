/**
 * Besøkbare produktruter for den nattlige lys/mørk-røyktesten
 * (tests/visual/lys-morkt-royk.spec.ts) — utledet fra src/app ved kjøring,
 * ikke en statisk liste som ruster.
 *
 * Regler (samme som en shell-pipeline over `find src/app -name page.tsx`):
 *  - et «[param]»-segment kan ikke besøkes uten data → hoppes over
 *  - rutegrupper «(legacy)», «(fullscreen)» er usynlige i URL-en → strippes
 *  - en page.tsx som bare kaller redirect() (ingen JSX) dekkes av målsiden
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type Flate = "portal" | "admin" | "forelder";
export const FLATER: readonly Flate[] = ["portal", "admin", "forelder"];

/** En page.tsx uten JSX som bare kaller redirect() — målsiden dekker den. */
export function erRedirectSide(kilde: string): boolean {
  return kilde.includes("redirect(") && !kilde.includes("return (");
}

/** «/admin/(legacy)/stall/page.tsx» → «/admin/stall»; et [param]-segment → null. */
export function tilRute(relativSti: string): string | null {
  const seg = relativSti.replace(/\/page\.tsx$/, "").split("/").filter(Boolean);
  if (seg.some((s) => s.startsWith("["))) return null;
  return "/" + seg.filter((s) => !s.startsWith("(")).join("/");
}

function* pageFiler(mappe: string): Generator<string> {
  for (const e of readdirSync(mappe, { withFileTypes: true })) {
    const sti = join(mappe, e.name);
    if (e.isDirectory()) yield* pageFiler(sti);
    else if (e.name === "page.tsx") yield sti;
  }
}

/** Besøkbare ruter under src/app/<flate>, sortert. */
export function finnProduktRuter(flate: Flate, appRot = "src/app"): string[] {
  const ut = new Set<string>();
  for (const fil of pageFiler(join(appRot, flate))) {
    const rute = tilRute(fil.slice(appRot.length));
    if (!rute) continue;
    if (erRedirectSide(readFileSync(fil, "utf8"))) continue;
    ut.add(rute);
  }
  return [...ut].sort();
}
