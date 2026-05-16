// Norske tallformat-helpers for SG Coaching Hub.
// Komma som desimal, ikke-brytbar mellomrom ( ) som tusenskille.

export function formatNumber(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return "—";
  const fixed = value.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const withThousands = intPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    " ",
  );
  return decPart ? `${withThousands},${decPart}` : withThousands;
}

export function formatM(value: number): string {
  return `${formatNumber(value, 0)} m`;
}

export function formatMOne(value: number): string {
  return `${formatNumber(value, 1)} m`;
}
