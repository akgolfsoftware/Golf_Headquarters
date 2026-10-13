const WANG_APP_ROOT = "/team-wang/app";
const WANG_APP_LOGIN = `${WANG_APP_ROOT}/logg-inn`;

export function erBeskyttetWangAppSti(path: string): boolean {
  if (path === WANG_APP_LOGIN || path.startsWith(`${WANG_APP_LOGIN}/`)) return false;
  return path === WANG_APP_ROOT || path.startsWith(`${WANG_APP_ROOT}/`);
}

export function tryggWangAppRetursti(value: string | string[] | undefined): string {
  if (typeof value !== "string" || value.length === 0) return WANG_APP_ROOT;
  if (/[\\\u0000-\u001f\u007f]/.test(value) || !value.startsWith("/")) {
    return WANG_APP_ROOT;
  }

  try {
    const url = new URL(value, "https://wang-app.invalid");
    if (url.origin !== "https://wang-app.invalid") return WANG_APP_ROOT;
    if (url.pathname !== WANG_APP_ROOT && !url.pathname.startsWith(`${WANG_APP_ROOT}/`)) {
      return WANG_APP_ROOT;
    }
    if (url.pathname === WANG_APP_LOGIN || url.pathname.startsWith(`${WANG_APP_LOGIN}/`)) {
      return WANG_APP_ROOT;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return WANG_APP_ROOT;
  }
}
