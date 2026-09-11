const WANG_ROT = "/team-wang";
const WANG_LOGIN = "/team-wang/logg-inn";

export function tryggWangRetursti(verdi: string | string[] | undefined): string {
  if (typeof verdi !== "string" || verdi.length === 0) return WANG_ROT;
  if (/[\\\u0000-\u001f\u007f]/.test(verdi) || !verdi.startsWith("/")) {
    return WANG_ROT;
  }

  try {
    const url = new URL(verdi, "https://wang-retur.invalid");
    if (url.origin !== "https://wang-retur.invalid") return WANG_ROT;
    if (url.pathname !== WANG_ROT && !url.pathname.startsWith(`${WANG_ROT}/`)) {
      return WANG_ROT;
    }
    if (url.pathname === WANG_LOGIN || url.pathname.startsWith(`${WANG_LOGIN}/`)) {
      return WANG_ROT;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return WANG_ROT;
  }
}
