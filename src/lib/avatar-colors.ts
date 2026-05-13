// Delt avatar-palett for deterministiske gradients per navn-hash.
// Bevisst dekorativ palett — kan ikke uttrykkes med 18 semantic tokens fordi
// vi trenger visuell variasjon mellom 6 buckets.
// TODO: konsolider farge — vurder å legge inn som --avatar-1..--avatar-6 tokens i globals.css.
export const AVATAR_GRADIENTS: readonly string[] = [
  "linear-gradient(135deg,#005840,#1A7D56)",
  "linear-gradient(135deg,#A6651E,#7A4910)",
  "linear-gradient(135deg,#7A998C,#56796D)",
  "linear-gradient(135deg,#A32D2D,#7C2020)",
  "linear-gradient(135deg,#1A7D56,#005840)",
  "linear-gradient(135deg,#3b5994,#5b7cb8)",
];

export function avatarBg(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
