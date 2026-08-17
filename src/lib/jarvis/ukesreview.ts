// Ukesreview (/meg?artefakt=review) — ren aggregat-logikk over allerede
// hentede Sak-rader. Ingen Prisma/nettverk her (se repository.ts for
// selve spørringene mot ukens/forrige ukes vindu + AiCost-aggregatet).
import type { Sak } from "@/generated/prisma/client";
import { osloInstant, OSLO_YMD_FMT } from "@/lib/jarvis/dagen";

/** Mandag 00:00 Oslo-tid for uken `referanse` faller i, DST-korrekt (samme teknikk som osloDagGrenser). */
export function osloUkeGrenser(referanse: Date): { start: Date; slutt: Date } {
  const [aar, maned, dag] = OSLO_YMD_FMT.format(referanse).split("-").map(Number);
  // Ukedag i Oslo-tid: bruk en UTC-hjelpedato på samme kalenderdag for å finne mandag uten DST-fallgruve.
  const ukedagUtc = new Date(Date.UTC(aar, maned - 1, dag)).getUTCDay(); // 0 = søndag
  const dagerSidenMandag = ukedagUtc === 0 ? 6 : ukedagUtc - 1;
  const mandagUtcHjelp = new Date(Date.UTC(aar, maned - 1, dag - dagerSidenMandag));
  const [a1, m1, d1] = OSLO_YMD_FMT.format(mandagUtcHjelp).split("-").map(Number);
  const start = osloInstant(a1, m1, d1, 0, 0);
  const nesteMandagUtcHjelp = new Date(Date.UTC(a1, m1 - 1, d1 + 7));
  const [a2, m2, d2] = OSLO_YMD_FMT.format(nesteMandagUtcHjelp).split("-").map(Number);
  const slutt = osloInstant(a2, m2, d2, 0, 0);
  return { start, slutt };
}

/**
 * SLA-etterlevelse for en liste avgjorte Saker (GODKJENT/AVVIST/UTFORT) MED
 * frist. Prosent = andel der oppdatert (avgjort-tidspunkt) kom før frist —
 * fristen er allerede satt til opprettet+6t ved Sak-opprettelse (se
 * SAKER_SLA_TIMER i scripts/saker-innsamling/env.ts), så ingen ny SLA-
 * konstant trengs her. Saker uten frist er utenfor SLA-målet og telles ikke
 * med. Null = ingen kvalifiserte saker denne perioden — IKKE 0 %, det er en
 * annen påstand.
 */
export function beregnSlaEtterlevelse(avgjorte: Sak[]): { prosentUnderFrist: number | null; antall: number; medianSvartidMin: number | null } {
  const medFrist = avgjorte.filter((s) => s.frist != null);
  if (medFrist.length === 0) return { prosentUnderFrist: null, antall: 0, medianSvartidMin: null };

  const underFrist = medFrist.filter((s) => s.oppdatert.getTime() <= s.frist!.getTime()).length;
  const prosentUnderFrist = Math.round((underFrist / medFrist.length) * 1000) / 10;

  const svartiderMin = medFrist
    .map((s) => (s.oppdatert.getTime() - s.opprettet.getTime()) / 60000)
    .sort((a, b) => a - b);
  const midt = Math.floor(svartiderMin.length / 2);
  const medianSvartidMin =
    svartiderMin.length % 2 === 0 ? Math.round((svartiderMin[midt - 1] + svartiderMin[midt]) / 2) : Math.round(svartiderMin[midt]);

  return { prosentUnderFrist, antall: medFrist.length, medianSvartidMin };
}

export function tellPerKanal(saker: Sak[]): { kanal: Sak["kanal"]; antall: number }[] {
  const map = new Map<Sak["kanal"], number>();
  for (const s of saker) map.set(s.kanal, (map.get(s.kanal) ?? 0) + 1);
  return Array.from(map.entries())
    .map(([kanal, antall]) => ({ kanal, antall }))
    .sort((a, b) => b.antall - a.antall);
}
