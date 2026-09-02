import { redirect } from "next/navigation";

/**
 * /portal/meg/utstyrsbag (gammel adresse) → /portal/meg/utstyr#rediger-utstyr.
 * Utstyr-siden er kanonisk (PORTPLAN §A1.9, avgjort av Anders 02.09.2026).
 * Redigeringsskjemaet (MegUtstyrsbagV2) er montert der som egen seksjon —
 * ingen funksjonalitet tapt, kun én adresse igjen.
 */
export const dynamic = "force-dynamic";

export default async function UtstyrsbagRedirect(): Promise<never> {
  redirect("/portal/meg/utstyr#rediger-utstyr");
}
