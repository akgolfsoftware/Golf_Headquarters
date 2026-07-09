/**
 * v2-forhåndsvisning — PlayerHQ Coach Meldinger (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell
 * leverer chrome-en (IkonRail/BunnNav), CoachMeldingerV2 rendrer stacken.
 *
 * Auth + dataloading gjenskaper den ekte /portal/coach/melding-siden 1:1:
 * tier-gate + coach-liste + CoachingSession-innboks (kind DIRECT). I tillegg
 * hentes én ekte tråd (nyeste med innhold) til forhåndsvisning av bobler.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { CoachMeldingerV2, type CoachMeldingerData } from "@/components/portal/v2/CoachMeldingerV2";
import type { Melding } from "@/components/v2";

export const dynamic = "force-dynamic";

type ChatMelding = { role?: string; content?: string; ts?: string };

function tidFra(ts: string | undefined, fallback: Date): string {
  const d = ts ? new Date(ts) : fallback;
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default async function V2CoachMeldingPreviewPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "PARENT"] });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  if (user.tier === "GRATIS") {
    const data: CoachMeldingerData = { gratis: true, hovedcoach: null, traader: [], valgt: null };
    return (
      <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name}>
        <CoachMeldingerV2 data={data} />
      </V2Shell>
    );
  }

  const [coacher, sesjoner] = await Promise.all([
    prisma.user.findMany({
      where: { role: "COACH" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.coachingSession.findMany({
      where: { userId: user.id, kind: "DIRECT" },
      include: { coach: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ]);

  const parsed = sesjoner.map((s) => {
    const meldinger = Array.isArray(s.messages) ? (s.messages as ChatMelding[]) : [];
    const siste = meldinger.at(-1);
    const snippet =
      typeof siste?.content === "string"
        ? siste.content.slice(0, 80) + (siste.content.length > 80 ? "…" : "")
        : "Ingen meldinger";
    return {
      id: s.id,
      coachNavn: s.coach.name,
      antall: meldinger.length,
      snippet,
      datoKort: s.updatedAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" }),
      raw: meldinger,
      createdAt: s.createdAt,
    };
  });

  const traader = parsed.map((p) => ({
    id: p.id,
    coachNavn: p.coachNavn,
    antall: p.antall,
    snippet: p.snippet,
    datoKort: p.datoKort,
  }));

  // Én ekte tråd for boble-forhåndsvisning: nyeste med faktisk innhold.
  const kilde = parsed.find((p) => p.raw.length > 0) ?? parsed[0] ?? null;
  const valgt = kilde
    ? {
        id: kilde.id,
        coachNavn: kilde.coachNavn,
        meldinger: kilde.raw.map<Melding>((m) => ({
          meg: m.role === "user",
          fra: m.role === "user" ? undefined : kilde.coachNavn,
          tekst: m.content ?? "",
          tid: tidFra(m.ts, kilde.createdAt),
        })),
      }
    : null;

  const data: CoachMeldingerData = {
    gratis: false,
    hovedcoach: coacher[0] ? { navn: coacher[0].name } : null,
    traader,
    valgt,
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name}>
      <CoachMeldingerV2 data={data} />
    </V2Shell>
  );
}
