/**
 * VAPID-keys for Web Push.
 *
 * Generer én gang:
 *   npx web-push generate-vapid-keys
 *
 * Sett deretter i .env / .env.local:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
 *   VAPID_PRIVATE_KEY=...
 *   VAPID_SUBJECT=mailto:support@akgolf.no
 *
 * Brukes av:
 *  - src/lib/push/send.ts (server)
 *  - src/components/portal/push-toggle.tsx (klient, kun PUBLIC_KEY)
 */

export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export function getServerVapidConfig(): {
  publicKey: string;
  privateKey: string;
  subject: string;
} | null {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:support@akgolf.no";

  if (!publicKey || !privateKey) {
    return null;
  }
  return { publicKey, privateKey, subject };
}
