const WANG_ROT = "/team-wang";
const WANG_LOGIN = "/team-wang/logg-inn";
// Innlogget trener eller sportssjef lander på dashbordet for sin egen skole.
// Fellessiden /team-wang er for spillere og foreldre og er aldri et mål etter innlogging.
const WANG_DASHBORD = "/team-wang/i-dag";

export function tryggWangRetursti(verdi: string | string[] | undefined): string {
  if (typeof verdi !== "string" || verdi.length === 0) return WANG_DASHBORD;
  if (/[\\\u0000-\u001f\u007f]/.test(verdi) || !verdi.startsWith("/")) {
    return WANG_DASHBORD;
  }

  try {
    const url = new URL(verdi, "https://wang-retur.invalid");
    if (url.origin !== "https://wang-retur.invalid") return WANG_DASHBORD;
    if (url.pathname === WANG_ROT || !url.pathname.startsWith(`${WANG_ROT}/`)) {
      return WANG_DASHBORD;
    }
    if (url.pathname === WANG_LOGIN || url.pathname.startsWith(`${WANG_LOGIN}/`)) {
      return WANG_DASHBORD;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return WANG_DASHBORD;
  }
}
