/** Rutene som er Innboks-faner (PH-21) under /portal/coach. Resten av /portal/coach er andre flater. */
const INNBOKS_STIER = ["/portal/coach", "/portal/coach/sporsmal", "/portal/coach/tilbakemelding", "/portal/coach/videoer", "/portal/coach/plans", "/portal/coach/melding"];

export function erInnboksSti(pathname: string | null): boolean {
  if (!pathname) return false;
  return INNBOKS_STIER.some((s) => pathname === s || pathname.startsWith(`${s}/`)) && !/^\/portal\/coach\/(ai|ovelser|sg-hub)(\/|$)/.test(pathname);
}
