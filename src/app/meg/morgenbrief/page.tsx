// src/app/meg/morgenbrief/page.tsx — Meldinger → Oppgaver → Kalender →
// Neste steg. Leser morgenbrief-data.json (skrevet av morgenbrief-dispatch
// kl 06:33 hver dag) fra ak-brain. Finnes filen ikke: ærlig tom-tilstand.
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { hentMorgenbrief } from "@/lib/meg/dispatch-data";
import { MorgenbriefView } from "./morgenbrief-view";

export const dynamic = "force-dynamic";

export default async function MorgenbriefPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();

  const data = await hentMorgenbrief();
  return <MorgenbriefView data={data} />;
}
