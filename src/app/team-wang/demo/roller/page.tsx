import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { WANG_ROLE_DEFINITIONS } from "@/lib/wang-supabase/roles";
import {
  WANG_ROLES,
  type WangAuthenticatedProfile,
  type WangRole,
  type WangStartMetric,
} from "@/lib/wang-supabase/types";
import { WangRoleStart } from "../../app/WangRoleStart";

const roleSchema = z.enum(WANG_ROLES);

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rolleforhåndsvisning — WANG Toppidrett",
  description: "Fiktiv forhåndsvisning av rollebaserte WANG-startsider.",
  robots: { index: false, follow: false },
};

function previewMetrics(role: WangRole): WangStartMetric[] {
  return [
    { label: "Rolle", value: WANG_ROLE_DEFINITIONS[role].label, detail: "Fiktiv forhåndsvisning" },
    { label: "Datagrunnlag", value: "Demo", detail: "Ingen ekte elevdata" },
    { label: "Tilgang", value: "Ikke gitt", detail: "Viser bare skjermstruktur" },
  ];
}

export default async function WangRolePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ rolle?: string | string[] }>;
}) {
  const { rolle } = await searchParams;
  const parsedRole = roleSchema.safeParse(typeof rolle === "string" ? rolle : "central_admin");
  if (!parsedRole.success) notFound();

  const profile: WangAuthenticatedProfile = {
    id: "00000000-0000-4000-8000-000000000001",
    displayName: "Fiktiv demobruker",
    role: parsedRole.data,
    schoolId: parsedRole.data === "central_admin" ? null : "00000000-0000-4000-8000-000000000002",
    schoolName: parsedRole.data === "central_admin" ? null : "WANG Toppidrett Fredrikstad",
  };

  return <WangRoleStart profile={profile} metrics={previewMetrics(profile.role)} preview />;
}
