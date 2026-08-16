import { NextResponse } from "next/server";

/**
 * Delt cron-autentisering (steg 5 i `docs/plan-testdekning.md`).
 *
 * Sjekken var håndkopiert i åtte rutefiler og testet ingen steder. Det er den
 * eneste sperren mellom åpent internett og agent-kjøring, så en kopi som driver
 * fra de andre er en reell åpning — og nettopp det har skjedd før: `notion-sync`
 * bar en kommentar om en original bug der `if (process.env.CRON_SECRET && ...)`
 * slapp ALLE gjennom når env-variabelen manglet (tom streng er falsy, så
 * betingelsen ble hoppet over). Fail-open i den retningen er verst tenkelige
 * utfall for en cron-port.
 *
 * Regelen her er derfor eksplisitt fail-CLOSED: mangler `CRON_SECRET`, avvises
 * alt. En konfigurasjonsfeil skal stenge døra, ikke åpne den.
 */

/**
 * Ren predikat uten Next-avhengighet, så den kan enhetstestes direkte.
 *
 * @param authHeader Rå `Authorization`-header (null hvis fraværende).
 * @param secret     Forventet hemmelighet, typisk `process.env.CRON_SECRET`.
 */
export function erGyldigCronAuth(
  authHeader: string | null | undefined,
  secret: string | undefined,
): boolean {
  // Fail-closed: uten konfigurert secret finnes det ingen gyldig header.
  if (!secret) return false;
  if (!authHeader) return false;
  return authHeader === `Bearer ${secret}`;
}

/**
 * Rutebruk: returnerer et ferdig 401-svar hvis forespørselen skal avvises,
 * ellers `null` slik at ruten kan fortsette.
 *
 *   const avvist = avvisUgyldigCron(req);
 *   if (avvist) return avvist;
 */
export function avvisUgyldigCron(req: Request): NextResponse | null {
  const ok = erGyldigCronAuth(
    req.headers.get("authorization"),
    process.env.CRON_SECRET,
  );
  if (ok) return null;
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
