export type Tilstand = "suksess" | "tom" | "laster" | "feil";

export function frameCandidates(
  id: string,
  opts: { mobile: boolean; tilstand: Tilstand },
): string[] {
  const keys: string[] = [];
  const t = opts.tilstand;
  if (opts.mobile) {
    if (t !== "suksess") keys.push(`${id}-390-${t}.html`);
    keys.push(`${id}-390.html`);
  }
  if (t !== "suksess") keys.push(`${id}-${t}.html`);
  keys.push(`${id}.html`);
  return keys;
}
