import { wangHref } from "@/lib/wang/wang-ruter";

/**
 * Lenker til undersidene i Tester og Konkurranse. Bygget på rutekartet
 * (wangHref), slik at stien bare står ett sted. Undersidene står som
 * `undersider` på skjermen i WANG_SKJERMER.
 */
export function testdagHref(testdagId: string): string {
  return `${wangHref("WANG-08")}/${encodeURIComponent(testdagId)}`;
}

export function protokollHref(protokollId: string): string {
  return `${wangHref("WANG-22")}/${encodeURIComponent(protokollId)}`;
}

export function samlingHref(samlingId: string): string {
  return `${wangHref("WANG-09")}/${encodeURIComponent(samlingId)}`;
}

export function turneringHref(turneringId: string): string {
  return wangHref("WANG-11", { turneringId });
}

export function resultaterHref(elevId: string): string {
  return wangHref("WANG-23", {}, { elev: elevId });
}
