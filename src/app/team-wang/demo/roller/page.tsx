import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import {
  hentSyntetiskWangProfil,
  lagSyntetiskeWangMaalinger,
} from "@/lib/wang-supabase/synthetic-profiles";
import {
  WANG_ROLES,
} from "@/lib/wang-supabase/types";
import { WangRoleStart } from "../../app/WangRoleStart";

const roleSchema = z.enum(WANG_ROLES);

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rolleforhåndsvisning — WANG Toppidrett",
  description: "Fiktiv forhåndsvisning av rollebaserte WANG-startsider.",
  robots: { index: false, follow: false },
};

export default async function WangRolePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ rolle?: string | string[] }>;
}) {
  const { rolle } = await searchParams;
  const parsedRole = roleSchema.safeParse(typeof rolle === "string" ? rolle : "central_admin");
  if (!parsedRole.success) notFound();

  const profile = hentSyntetiskWangProfil(parsedRole.data);

  return <WangRoleStart profile={profile} metrics={lagSyntetiskeWangMaalinger(profile)} preview />;
}
