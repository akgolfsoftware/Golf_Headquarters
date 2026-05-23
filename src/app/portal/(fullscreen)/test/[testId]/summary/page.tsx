/**
 * /portal/test/[testId]/summary — pixel-perfekt port av Claude Design.
 * Viser PR-celebrasjon hvis spilleren satte ny PR, ellers progress-variant.
 *
 * For nå rendrer vi pixel-perfekt mockup. Live PR/progress-deteksjon kan
 * legges på topp senere.
 */

import { TesterSummaryScreen } from "@/components/test-modul-v2/tester-summary-screen";

export default async function TestSummaryPage({
  searchParams,
}: {
  params: Promise<{ testId: string }>;
  searchParams: Promise<{ variant?: string }>;
}) {
  const sp = await searchParams;
  const variant = sp.variant === "progress" ? "progress" : "pr";
  return <TesterSummaryScreen variant={variant} />;
}
