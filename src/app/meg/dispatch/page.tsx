// src/app/meg/dispatch/page.tsx — Dispatch (pause-kortet). Jobben: på 5 sek
// se OM du er ajour, på 3 min VÆRE ajour. Leser pause-kort.json (skrevet av
// den planlagte SLA-vakten hver time) fra ak-brain — finnes filen ikke
// (f.eks. på Vercel, som ikke har tilgang til Mac Mini-filsystemet), vises en
// ærlig tom-tilstand, aldri påfunnet data.
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { hentPauseKort } from "@/lib/meg/dispatch-data";
import { DispatchView } from "./dispatch-view";

export const dynamic = "force-dynamic";

export default async function DispatchPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();

  const data = await hentPauseKort();
  return <DispatchView data={data} />;
}
