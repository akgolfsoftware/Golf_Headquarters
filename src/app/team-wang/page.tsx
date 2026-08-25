import { WangArsplanShell, type ArsplanFane } from "./_components/arsplan-2026-27/arsplan-shell";

// Fellesside for WANG Toppidrett Fredrikstad – golfgruppa. ÅPEN uten innlogging
// slik at lenken kan deles med elever og foreldre. Trygt fordi siden ikke viser
// elevnavn eller annen PII — kun aggregert gruppeinfo, fag/lærer/rom og skolens
// offentlige datoer (se arsplan-fasit-2026-27.ts).
//
// Bygget etter Årsplan 2026/27-fasiten (levert 25.08.2026, se
// designsystem/wang/fasit/arsplan-2026-27/) — erstatter den forrige
// Oversikt/Plan/Skole/Foreldre-strukturen (wang-fellesside.tsx, fortsatt i
// repoet men ikke lenger koblet til denne ruten) med fire nye faner:
// Trening/Skole/Kalender/Foreldre.
// Fortsatt noindex (layout) — delbar via lenke, ikke via Google.
export const dynamic = "force-static";

const FANER: ArsplanFane[] = ["trening", "skole", "kalender", "foreldre"];

export default async function TeamWangPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string }>;
}) {
  const { fane } = await searchParams;
  const start: ArsplanFane = FANER.includes(fane as ArsplanFane)
    ? (fane as ArsplanFane)
    : "trening";
  return <WangArsplanShell startFane={start} />;
}
