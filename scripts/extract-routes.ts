#!/usr/bin/env tsx
/**
 * Skann src/app/portal/ og src/app/admin/ for alle page.tsx-filer
 * og produser src/lib/all-routes.ts med komplett rute-katalog.
 */

import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const SRC_APP = join(process.cwd(), "src", "app");

function listPages(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...listPages(full));
    else if (name === "page.tsx") out.push(full);
  }
  return out;
}

function pathToRoute(filePath: string): string {
  const rel = relative(SRC_APP, filePath).replace(/\/page\.tsx$/, "");
  // Fjern route groups (xxx)
  const segments = rel
    .split("/")
    .filter((s) => !s.startsWith("(") || !s.endsWith(")"))
    .filter(Boolean);
  return "/" + segments.join("/");
}

function inferLabel(route: string): string {
  const parts = route.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "";
  if (last.startsWith("[") && last.endsWith("]")) {
    const parent = parts[parts.length - 2] ?? "";
    return `${parent} · detalj`;
  }
  return last
    .replace(/-/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

function inferCategory(route: string): string {
  if (route.startsWith("/portal/planlegge")) return "PlayerHQ · Planlegge";
  if (route.startsWith("/portal/tren")) return "PlayerHQ · Tren";
  if (route.startsWith("/portal/gjennomfore")) return "PlayerHQ · Gjennomføre";
  if (route.startsWith("/portal/analysere")) return "PlayerHQ · Analysere";
  if (route.startsWith("/portal/coach")) return "PlayerHQ · Coach";
  if (route.startsWith("/portal/meg")) return "PlayerHQ · Min profil";
  if (route.startsWith("/portal/booking")) return "PlayerHQ · Booking";
  if (route.startsWith("/portal/talent")) return "PlayerHQ · Talent";
  if (route.startsWith("/portal/mal")) return "PlayerHQ · Mål";
  if (route.startsWith("/portal")) return "PlayerHQ";

  if (route.startsWith("/admin/spillere")) return "CoachHQ · Spillere";
  if (route.startsWith("/admin/planer") || route.startsWith("/admin/plans"))
    return "CoachHQ · Planer";
  if (route.startsWith("/admin/booking")) return "CoachHQ · Booking";
  if (route.startsWith("/admin/godkjenn")) return "CoachHQ · Godkjenning";
  if (route.startsWith("/admin/kalender")) return "CoachHQ · Kalender";
  if (route.startsWith("/admin/messaging") || route.startsWith("/admin/meldinger"))
    return "CoachHQ · Meldinger";
  if (route.startsWith("/admin/services") || route.startsWith("/admin/tjenester"))
    return "CoachHQ · Tjenester";
  if (route.startsWith("/admin/team")) return "CoachHQ · Team";
  if (route.startsWith("/admin/agencyos") || route.startsWith("/admin/agency"))
    return "CoachHQ · AgencyOS";
  if (route.startsWith("/admin")) return "CoachHQ";

  if (route.startsWith("/auth")) return "Auth";
  if (route.startsWith("/booking")) return "Booking (publikum)";
  if (route.startsWith("/forelder")) return "Foreldreportal";
  return "Marketing / annet";
}

type RouteEntry = {
  route: string;
  label: string;
  category: string;
  filePath: string;
};

function main() {
  const portalFiles = listPages(join(SRC_APP, "portal"));
  const adminFiles = listPages(join(SRC_APP, "admin"));
  const authFiles = listPages(join(SRC_APP, "auth"));
  let bookingFiles: string[] = [];
  try {
    bookingFiles = listPages(join(SRC_APP, "booking"));
  } catch {}
  let foreldreFiles: string[] = [];
  try {
    foreldreFiles = listPages(join(SRC_APP, "forelder"));
  } catch {}

  const all = [...portalFiles, ...adminFiles, ...authFiles, ...bookingFiles, ...foreldreFiles];
  const entries: RouteEntry[] = all
    .map((f) => ({
      route: pathToRoute(f),
      label: inferLabel(pathToRoute(f)),
      category: inferCategory(pathToRoute(f)),
      filePath: relative(process.cwd(), f),
    }))
    .sort((a, b) => a.route.localeCompare(b.route));

  const outPath = join(process.cwd(), "src", "lib", "all-routes.ts");
  const lines: string[] = [
    "/**",
    " * Auto-generert komplett rute-katalog (portal + admin + auth + booking + foreldre).",
    " * Generert av scripts/extract-routes.ts. Ikke rediger manuelt.",
    " */",
    "",
    "export type AllRouteEntry = {",
    "  route: string;",
    "  label: string;",
    "  category: string;",
    "  filePath: string;",
    "};",
    "",
    "export const ALL_ROUTES: AllRouteEntry[] = [",
  ];
  for (const e of entries) {
    lines.push(
      `  { route: ${JSON.stringify(e.route)}, label: ${JSON.stringify(e.label)}, category: ${JSON.stringify(e.category)}, filePath: ${JSON.stringify(e.filePath)} },`,
    );
  }
  lines.push("];", "");
  writeFileSync(outPath, lines.join("\n"));
  console.log(`Skrev ${outPath}: ${entries.length} ruter`);

  const byCat: Record<string, number> = {};
  for (const e of entries) byCat[e.category] = (byCat[e.category] ?? 0) + 1;
  console.log("\nKategorier:");
  for (const [k, v] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(28)} ${v}`);
  }
}

main();
