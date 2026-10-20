/**
 * Øvelsesbanken i AgencyOS (/admin/ovelser): mest brukt først. Ren funksjon, testet.
 * «Brukt» teller øvelsens forekomster i Workbench-øktene til spillerne coachen har tilgang til
 * (ikke et tidsvindu, beslutninger.md §WORKBENCH FÅR SØK I ALLE ØVELSER, 16.10.2026).
 */
import type { OvelseVisning } from "@/lib/portal-drills/ovelser-visning";

export function medBrukSortert(ovelser: readonly OvelseVisning[], bruk: ReadonlyMap<string, number>): OvelseVisning[] {
  return ovelser
    .map((o) => ({ ...o, brukt: bruk.get(o.id) ?? 0 }))
    .sort((a, b) => b.brukt - a.brukt || a.navn.localeCompare(b.navn, "nb"));
}
