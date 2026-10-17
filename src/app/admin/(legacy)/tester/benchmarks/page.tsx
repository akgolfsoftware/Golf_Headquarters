import { redirect } from "next/navigation";

/**
 * /admin/tester/benchmarks (normer fra Data Golf) → AG-15 › Normer.
 * Anders 16.10 (beslutninger.md §PRØVEUKE …, AgencyOS-anbefalingene): normene fra Data Golf venter
 * til A–K-nivåtallene er vedtatt. Synkmotoren (./actions.ts, src/lib/admin/benchmark-sync.ts) er urørt.
 */
export default function BenchmarksRedirect(): never {
  redirect("/admin/tester?fane=normer");
}
