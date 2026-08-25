/**
 * Standard tema per rute — ÉN kilde, delt av server og klient.
 *
 * Bakgrunn: temaet settes to steder. Rot-layout stamper `data-v2-tema` på
 * `<html>` før paint (SSR), og `V2Shell` synker attributtet ved client-side
 * rutebytte. Sier de to noe forskjellig, blinker flaten — eller den snus
 * tilbake i det du navigerer. Begge leser derfor denne fila.
 *
 * BESLUTNING (Anders 25.08.2026, i økt): PlayerHQ (`/portal`) og AgencyOS
 * (`/admin`) er MØRKE som standard — Train-lock sier «mørk er default», og
 * Train-lock er designfasit for alle skjermer i begge produktene (CLAUDE.md
 * invariant 2). Lys er fortsatt ett trykk unna: bryteren skriver
 * `ak-v2-tema=light`, og den vinner over standarden.
 *
 * Dette supererer «alle v2-flater er lyse som standard» (25.07.2026) for
 * NØYAKTIG disse to prefiksene. Uendret ellers:
 * - `/auth` er LYS (beslutning 13.08 + PP-A A4 16.08 — innlogging er lys).
 * - `/forelder` er LYS (Forelder-portalens omfang er uavklart, spør Anders).
 * - Landingssidene er alltid lyse, uansett cookie (se rot-layout).
 * - Resten (stats, team-flatene, interne) er mørke med lys-cookie-unntak.
 */
export type V2Tema = "dark" | "light";

/** Rutene der Train-lock-standarden (mørk) gjelder. */
const TRAIN_LOCK_PREFIKS = ["/portal", "/admin"] as const;

/** Er dette en flate der mørk er standard (Train-lock)? */
export function erTrainLockFlate(path: string): boolean {
  return TRAIN_LOCK_PREFIKS.some((p) => path === p || path.startsWith(`${p}/`));
}

/**
 * Temaet flaten skal ha uten cookie. Kall med `document.location.pathname`
 * på klienten og `x-pathname` på serveren.
 */
export function standardTema(path: string): V2Tema {
  return erTrainLockFlate(path) ? "dark" : "light";
}
