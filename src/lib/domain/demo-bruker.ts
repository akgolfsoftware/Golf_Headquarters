import type { Prisma } from "@/generated/prisma/client";

/**
 * Demo- og testkontoer kjennes igjen på e-postadressen (ingen felt i basen;
 * Anders 23.10.2026: «skjul demo i AgencyOS, uten skjemaendring»).
 *
 * Brukes av spillerporten i `src/lib/auth/coached.ts`, så demospillere aldri
 * vises i stall, cockpit, køer eller agenter. Kontoene ligger fortsatt i basen
 * og virker for innlogging og tester.
 */
const DEMO_DOMENER = [
  "@stall.akgolf.test",
  "@akgolf.test",
  "@demo.invalid",
  "@demo-wang.akgolf.test",
  "@demo-tn.akgolf.test",
] as const;

const DEMO_ADRESSER = [
  "oyvind.rohjan@golfforbundet.no",
  "demo.sportssjef@wang.no",
  "demo.trener@golfforbundet.no",
  "demo@wang.no",
  "demo@golfforbundet.no",
  "spiller@akgolf.no",
  "coach@akgolf.no",
  "forelder@akgolf.no",
] as const;

export function erDemoEpost(epost: string): boolean {
  const e = epost.trim().toLowerCase();
  return DEMO_ADRESSER.some((a) => e === a) || DEMO_DOMENER.some((d) => e.endsWith(d));
}

/** Prisma-where-fragment: utelater demo- og testkontoer. Kombineres med AND. */
export function ikkeDemoBrukerWhere(): Prisma.UserWhereInput {
  return {
    NOT: [
      ...DEMO_DOMENER.map((d) => ({ email: { endsWith: d, mode: "insensitive" as const } })),
      { email: { in: [...DEMO_ADRESSER], mode: "insensitive" as const } },
    ],
  };
}
