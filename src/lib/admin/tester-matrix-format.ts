/**
 * Formaterings- og utlednings-hjelpere for Tester-matrisen (/admin/tester).
 * Flyttet ut av tester-matrix-data.ts (ren mekanisk splitt, samme oppførsel).
 */

export function initials(name: string | null | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** "Gamle Fredrikstad Golfklubb" → "GFGK"-aktig kort form for chip. */
export function shortClub(club: string | null): string | null {
  if (!club) return null;
  const t = club.trim();
  if (!t) return null;
  if (/fredrikstad/i.test(t)) return "GFGK";
  // Initialer av de første ordene (maks 4 tegn).
  const init = t
    .split(/\s+/)
    .filter((w) => /[a-zA-ZæøåÆØÅ]/.test(w))
    .map((w) => w[0].toUpperCase())
    .join("")
    .slice(0, 4);
  return init || t.slice(0, 4).toUpperCase();
}

export function formatScore(n: number): string {
  // Heltall uten desimal, ellers én desimal med komma (norsk).
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1).replace(".", ",");
}

export function formatDelta(diff: number): string {
  const abs = Math.abs(diff);
  const s = Number.isInteger(abs) ? String(abs) : abs.toFixed(1).replace(".", ",");
  if (diff > 0) return `+${s}`;
  if (diff < 0) return `−${s}`;
  return "±0";
}

export function relativeWhen(d: Date, now: Date): string {
  const days = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (days <= 0) return "i dag";
  if (days === 1) return "i går";
  return `${days} d`;
}

type ProtocolShape = { unit?: unknown; scoringMode?: unknown };

/** Utleder enhet + retning ÆRLIG fra protocol-JSON og scoringRule-tekst. */
export function unitAndDirection(
  protocol: unknown,
  scoringRule: string,
): { unit: string; lowerBetter: boolean } {
  const p = (protocol ?? {}) as ProtocolShape;
  const mode = typeof p.scoringMode === "string" ? p.scoringMode.toLowerCase() : "";
  const rule = scoringRule.toLowerCase();

  // Retning fra scoringMode (mest pålitelig).
  let lowerBetter: boolean;
  if (["lowest", "pei", "average"].includes(mode)) lowerBetter = true;
  else if (["max", "hit-rate", "sum", "distance"].includes(mode)) lowerBetter = false;
  else {
    // Fallback: tekst-signaler ("lavere", "tid", "spredning", "avstand til hull").
    lowerBetter = /lavere|tid i sekunder|spredning|avstand til hull|standardavvik/.test(rule);
  }

  let unit = typeof p.unit === "string" && p.unit.trim() ? p.unit.trim() : "";
  if (!unit) {
    const m = rule.match(/\(([^)]+)\)/); // "Maks vekt (kg)" → "kg"
    if (m) unit = m[1].trim();
    else if (/prosent|sink/.test(rule)) unit = "%";
    else if (/sekunder|tid/.test(rule)) unit = "sek";
  }

  return { unit, lowerBetter };
}

export function unitLineFor(unit: string, lowerBetter: boolean): string {
  const dir = lowerBetter ? "LAVERE BEDRE" : "HØYERE BEDRE";
  const u = unit ? unit.toUpperCase() : "VERDI";
  return `${u} · ${dir}`;
}
