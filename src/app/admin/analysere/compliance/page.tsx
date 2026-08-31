/**
 * `/admin/analysere/compliance` — MASTERPLAN 15.8: slått sammen inn i
 * `/admin/analyse` som fanen «etterlevelse». Ren redirect (bevarer
 * ?periode/?studentId), ingen innhold flyttet ut av appen — se
 * `src/lib/admin/analyse/faner.ts` og `AdminComplianceV2` (uendret,
 * kun ny `somFane`-prop).
 */

import { redirect } from "next/navigation";
import { analyseHref } from "@/lib/admin/analyse/faner";

type SearchParams = Promise<{ periode?: string; studentId?: string }>;

export default async function AdminAnalysereComplianceRedirect({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = new URLSearchParams();
  if (params.periode) q.set("periode", params.periode);
  if (params.studentId) q.set("studentId", params.studentId);
  const bunn = q.toString();
  const base = analyseHref("etterlevelse");
  const skille = base.includes("?") ? "&" : "?";
  redirect(bunn ? `${base}${skille}${bunn}` : base);
}
