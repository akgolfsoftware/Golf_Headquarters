/**
 * Sortering av «Hele stallen» på /admin/spillere.
 * Handicap kommer ferdig formatert («+1,2», «2,1», «—»). Pluss betyr bedre enn scratch,
 * så «+1,2» er −1,2 når det sorteres. Ukjent handicap havner sist, uansett retning.
 */

export type StallSortering = "trenger" | "navn" | "hcp";

export const STALL_SORTERING: readonly { id: StallSortering; label: string }[] = [
  { id: "trenger", label: "Trenger deg" },
  { id: "navn", label: "Navn" },
  { id: "hcp", label: "Handicap" },
];

export function hcpSomTall(hcp: string): number | null {
  const t = hcp.trim().replace(",", ".").replace("−", "-");
  if (!t || t === "—") return null;
  const n = Number.parseFloat(t.replace(/^\+/, ""));
  if (Number.isNaN(n)) return null;
  return t.startsWith("+") ? -n : n;
}

export function sorterNavn<T extends { name: string }>(rader: readonly T[]): T[] {
  return [...rader].sort((a, b) => a.name.localeCompare(b.name, "nb"));
}

export function sorterHcp<T extends { name: string; hcp: string }>(rader: readonly T[]): T[] {
  return [...rader].sort((a, b) => {
    const x = hcpSomTall(a.hcp);
    const y = hcpSomTall(b.hcp);
    if (x == null && y == null) return a.name.localeCompare(b.name, "nb");
    if (x == null) return 1;
    if (y == null) return -1;
    return x - y || a.name.localeCompare(b.name, "nb");
  });
}
