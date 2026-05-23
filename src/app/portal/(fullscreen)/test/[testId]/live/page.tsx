/**
 * Fullscreen live-scoring — pixel-perfekt Claude Design-port.
 *
 * Bruker query-param ?step=1|2|4 for å vise riktig steg-variant.
 * Eksisterende session-actions.ts står klar for å koble til ekte data,
 * men denne første versjonen viser pixel-perfekt mockup-innhold.
 */

import { TesterLiveScreen } from "@/components/test-modul-v2/tester-live-screen";

export default async function LiveTestPage({
  searchParams,
}: {
  params: Promise<{ testId: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const sp = await searchParams;
  const step = sp.step === "2" ? 2 : sp.step === "4" || sp.step === "final" ? 4 : 1;
  return <TesterLiveScreen step={step} />;
}
