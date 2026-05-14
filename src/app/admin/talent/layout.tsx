/**
 * Layout for /admin/talent — gater hele talent-treet bak FEATURES.TALENT.
 *
 * Når flagget er av returnerer alle ruter under /admin/talent 404. Dette
 * inkluderer /admin/talent, /admin/talent/wagr-benchmark, /admin/talent/wagr-import
 * og evt. fremtidige under-ruter.
 */

import { notFound } from "next/navigation";

import { FEATURES } from "@/lib/features";

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  if (!FEATURES.TALENT) notFound();
  return children;
}
