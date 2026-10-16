/**
 * Hvilke /admin-sider under (legacy) som er portert til Precision Athletics.
 * (legacy)/layout.tsx gir disse sidene ingen V2Shell, fordi sida selv legger
 * innholdet i AgencyOSSkall. Sider utenfor (legacy) bytter skall direkte.
 */
import { A1 } from "./precision-portert/a1";
import { A2 } from "./precision-portert/a2";
import { A3 } from "./precision-portert/a3";
import { A4 } from "./precision-portert/a4";
import { A5 } from "./precision-portert/a5";

export const PORTERT: readonly string[] = [...A1, ...A2, ...A3, ...A4, ...A5];

export function passerMonster(path: string, monster: string): boolean {
  const a = path.replace(/\/+$/, "").split("/"), b = monster.replace(/\/+$/, "").split("/");
  return a.length === b.length && b.every((ledd, i) => (/^\[[^\]]+\]$/.test(ledd) ? a[i] !== "" : ledd === a[i]));
}

export function erPortert(path: string, liste: readonly string[] = PORTERT): boolean {
  return liste.some((m) => passerMonster(path, m));
}
