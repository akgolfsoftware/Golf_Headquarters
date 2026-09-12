/**
 * Sanitering av feilmeldinger og metadata før logging.
 * Hemmeligheter, e-post, telefon og tilkoblingsstrenger skal ikke nå
 * konsoll, ErrorLog, Slack eller Telegram.
 */

const PII_NORMALIZED = new Set([
  "email",
  "mail",
  "phone",
  "telefon",
  "password",
  "passord",
  "secret",
  "token",
  "accesstoken",
  "refreshtoken",
  "apikey",
  "creditcard",
  "cardnumber",
  "cvv",
  "ssn",
  "dateofbirth",
  "dob",
  "guardianemail",
  "guestemail",
  "guestphone",
  "guestname",
  "authorization",
  "databaseurl",
  "directurl",
  "connectionstring",
  "stripesecret",
  "stripesecretkey",
  "webhooksecret",
  "privatekey",
  "servicerolekey",
]);

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+?[\d\s\-()]{8,20})/g;
const POSTGRES_URL_RE = /postgres(?:ql)?:\/\/[^\s"'`]+/gi;
const STRIPE_KEY_RE = /(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]+/g;
const WHSEC_RE = /whsec_[A-Za-z0-9]+/g;
const BEARER_RE = /Bearer\s+[A-Za-z0-9._\-]+/gi;

function normaliserFeltnavn(key: string): string {
  return key.toLowerCase().replace(/[_-]/g, "");
}

export function erHemmeligFelt(key: string): boolean {
  const n = normaliserFeltnavn(key);
  if (PII_NORMALIZED.has(n)) return true;
  if (n.endsWith("password") || n.endsWith("passord")) return true;
  if (n.endsWith("secret") || n.endsWith("apikey")) return true;
  if (n.endsWith("token")) return true;
  return false;
}

export function sanitizeMessage(msg: string): string {
  return msg
    .replace(POSTGRES_URL_RE, "[db-url-fjernet]")
    .replace(STRIPE_KEY_RE, "[nøkkel-fjernet]")
    .replace(WHSEC_RE, "[nøkkel-fjernet]")
    .replace(BEARER_RE, "Bearer [nøkkel-fjernet]")
    .replace(EMAIL_RE, "[e-post-fjernet]")
    .replace(PHONE_RE, (m) =>
      m.replace(/\D/g, "").length >= 8 ? "[tlf-fjernet]" : m,
    );
}

export function sanitizeMeta(obj: unknown, depth = 0): unknown {
  if (depth > 5) return obj;
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return sanitizeMessage(obj);
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeMeta(item, depth + 1));
  }
  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = erHemmeligFelt(key)
        ? "[REDACTED]"
        : sanitizeMeta(value, depth + 1);
    }
    return result;
  }
  return obj;
}
