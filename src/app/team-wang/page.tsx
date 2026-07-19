import { WangFellesside, type Fane } from "./_components/wang-fellesside";

// Fellesside for WANG Toppidrett Fredrikstad – golfgruppa. Hardkodet sesongplan
// fra Claude Design (AK Golf HQ er master; kobling til DB er et senere steg).
// Ingen DB-kall → bygg krever aldri nåbar database.
export const dynamic = "force-static";

const FANER: Fane[] = ["oversikt", "plan", "skole", "foreldre"];

export default async function TeamWangPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string }>;
}) {
  const { fane } = await searchParams;
  const start: Fane = FANER.includes(fane as Fane) ? (fane as Fane) : "oversikt";
  return <WangFellesside startFane={start} />;
}
