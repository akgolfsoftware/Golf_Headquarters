/**
 * AgencyOS · Tester · Foreslåtte tester — v2 (flyttet ut av (legacy)
 * 2026-07-17, samme URL). V2Shell leverer chrome-en,
 * AdminForeslatteTesterV2 rendrer innholds-stacken.
 *
 * Viser custom-tester laget av spillere som ønsker coach-godkjenning
 * (visibility: COACH, isCoachApproved: false). Coach kan godkjenne (gjør
 * testen synlig for hele akademiet) eller avvise. Auth + query er uendret;
 * protokoll-JSON parses her (serverside, samme feltplukk som gamle
 * test-kort.tsx) så klientkomponenten er ren presentasjon.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  AdminForeslatteTesterV2,
  type AdminForeslatteTesterV2Data,
} from "@/components/admin/v2/AdminForeslatteTesterV2";

export const dynamic = "force-dynamic";

/** protocol.steg → string[] (samme feltplukk som gamle test-kort.tsx). */
function protokollSteg(protocol: unknown): string[] {
  if (
    protocol &&
    typeof protocol === "object" &&
    !Array.isArray(protocol) &&
    "steg" in protocol &&
    Array.isArray((protocol as { steg: unknown }).steg)
  ) {
    return ((protocol as { steg: unknown[] }).steg).filter(
      (s): s is string => typeof s === "string",
    );
  }
  return [];
}

/** protocol.malverdi.nivaaer → {nivaa, verdi}[] (samme feltplukk som før). */
function malverdier(protocol: unknown): { nivaa: string; verdi: string }[] {
  if (
    protocol &&
    typeof protocol === "object" &&
    !Array.isArray(protocol) &&
    "malverdi" in protocol
  ) {
    const m = (protocol as { malverdi: unknown }).malverdi;
    if (
      m &&
      typeof m === "object" &&
      !Array.isArray(m) &&
      "nivaaer" in m &&
      typeof (m as { nivaaer: unknown }).nivaaer === "object"
    ) {
      const obj = (m as { nivaaer: Record<string, unknown> }).nivaaer;
      const out: { nivaa: string; verdi: string }[] = [];
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "string") out.push({ nivaa: k, verdi: v });
      }
      return out;
    }
  }
  return [];
}

export default async function ForeslatteTesterPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const foreslåtte = await prisma.testDefinition.findMany({
    where: {
      isCustom: true,
      visibility: "COACH",
      isCoachApproved: false,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      pyramidArea: true,
      scoringRule: true,
      protocol: true,
      createdAt: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const data: AdminForeslatteTesterV2Data = {
    forslag: foreslåtte.map((t) => ({
      id: t.id,
      navn: t.name,
      beskrivelse: t.description,
      akse: t.pyramidArea,
      scoring: t.scoringRule,
      steg: protokollSteg(t.protocol),
      nivaaer: malverdier(t.protocol),
      opprettet: t.createdAt.toLocaleDateString("nb-NO", {
        day: "2-digit",
        month: "short",
      }),
      forfatter: t.createdBy?.name ?? t.createdBy?.email ?? "Ukjent",
    })),
  };

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/admin/tester">Tester</TilbakeLenke>
      <AdminForeslatteTesterV2 data={data} />
    </V2Shell>
  );
}
