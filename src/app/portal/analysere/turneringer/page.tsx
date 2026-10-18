/**
 * Turneringer er en del av Stats › Resultater (vedtak 16.10.2026, beslutninger.md §STATS-RESTEN punkt 1).
 * Gamle lenker sendes dit, med sesongvalget med.
 */
import { redirect } from "next/navigation";

export default async function TurneringerPage({ searchParams }: { searchParams: Promise<{ sesong?: string }> }) {
  const { sesong } = await searchParams;
  const s = sesong && /^(\d{4}|alle)$/.test(sesong) ? `&sesong=${sesong}` : "";
  redirect(`/portal/analysere/resultater?vis=turneringer${s}`);
}
