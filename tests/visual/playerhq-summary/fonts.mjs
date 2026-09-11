import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

/** Samme lokale fontfiler som Next-bygget. Manglende fonter stopper prøven. */
export function appFonts(root) {
  const candidates = [process.env.PH06_NEXT_DIR, resolve(root, ".next"), resolve(root, ".worktrees/portering-kontroll-2026-09-10/.next")].filter(Boolean);
  for (const dir of candidates) {
    const chunks = resolve(dir, "static/chunks");
    if (!existsSync(chunks)) continue;
    const faces = readdirSync(chunks).filter((f) => f.endsWith(".css")).flatMap((file) =>
      [...readFileSync(resolve(chunks, file), "utf8").matchAll(/@font-face\{[^}]*font-family:Geist[^}]+\}/g)].map(([face]) =>
        face.replace(/url\(([^)]+)\)/g, (_, url) => `url(data:font/woff2;base64,${readFileSync(resolve(chunks, url.replace(/["']/g, ""))).toString("base64")})`)
      )
    );
    if (faces.length) return [...new Set(faces)].join("\n") + '\n:root{--font-geist-sans:Geist;--font-geist-mono:"Geist Mono"}';
  }
  throw new Error("Mangler appens Geist-filer. Kjør isolert Next-bygg eller sett PH06_NEXT_DIR til byggets .next-mappe.");
}
