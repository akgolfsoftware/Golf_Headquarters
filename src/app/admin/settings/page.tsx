/**
 * /admin/settings — AgencyOS Drift (Innstillinger og team) — v10-design.
 *
 * Rendrer <Drift> (v10-fasit fra ag-drift) med EKTE data fra loadDriftData
 * (Prisma: team-brukere + plan-maler). mapDriftData oversetter den eksisterende
 * loaderens shape (LoaderDriftData) til v10-komponentens prop-shape (DriftData).
 * Tom-tilstander bevares: tomt team/maler gir tomme lister, aldri liksom-tall.
 *
 * Server component. Auth-guard via requirePortalUser({ allow: ["COACH","ADMIN"] }).
 *
 * Byttet fra DriftPanel (gammelt design) til Drift (v10) — kobler kun data + adresse.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  loadDriftData,
  type DriftData as LoaderDriftData,
  type TeamMember as LoaderTeamMember,
  type PlanTemplateCard as LoaderTemplate,
} from "@/lib/admin/drift-data";
import {
  Drift,
  type DriftData,
  type TeamMember,
  type PlanTemplate,
  type PyramidDist,
} from "@/components/admin/drift/drift";

export const dynamic = "force-dynamic";

/** Loader avatarTone ("default"|"primary"|"accent") → v10 ("primary"|"lime"|"neutral"). */
function mapTone(tone: LoaderTeamMember["avatarTone"]): TeamMember["avatarTone"] {
  if (tone === "primary") return "primary";
  if (tone === "accent") return "lime";
  return "neutral";
}

/** Loader-segmenter (axis/pct) → v10 fast 5-akse dist-objekt. */
function mapDist(segs: LoaderTemplate["segs"]): PyramidDist {
  const dist: PyramidDist = { fys: 0, tek: 0, slag: 0, spill: 0, turn: 0 };
  for (const s of segs) dist[s.axis] = s.pct;
  return dist;
}

function mapMember(m: LoaderTeamMember): TeamMember {
  return {
    id: m.id,
    initials: m.initials,
    avatarTone: mapTone(m.avatarTone),
    presence: m.presence,
    name: m.name,
    email: m.email,
    role: {
      label: m.roleLabel,
      kind: m.role === "ADMIN" ? "admin" : "instruktor",
    },
    scopes: m.capabilities,
    scopeNote: m.scopeMain,
    seen: m.lastSeen,
    href: m.href,
  };
}

function mapTemplate(t: LoaderTemplate): PlanTemplate {
  return {
    id: t.id,
    periode: { label: t.periodeLabel, kind: t.periode },
    shared: t.shared,
    name: t.name,
    meta: t.meta.toUpperCase(),
    dist: mapDist(t.segs),
    uses: t.usageCount,
    editedBy: t.editedBy,
    href: t.href,
  };
}

/** Oversetter ekte LoaderDriftData → v10 DriftData. Tom-tilstander bevares ([]). */
function mapDriftData(data: LoaderDriftData): DriftData {
  return {
    eyebrow: "DRIFT",
    title: "Innstillinger og team",
    ownerName: data.ownerName,
    createdAt: data.createdLabel,

    team: {
      memberCount: data.team.length,
      summary: `${data.teamActive} aktive · ${data.teamTotalLabel}`,
      members: data.team.map(mapMember),
      rollMatrixHref: "/admin/organisasjon/roller",
      inviteHref: "/admin/organisasjon/inviter",
    },

    templates: {
      count: data.templatesTotal,
      summary: `${data.templatesTotal} ${data.templatesTotal === 1 ? "mal" : "maler"} · sortert på bruk`,
      items: data.templates.map(mapTemplate),
      importHref: "/admin/plan-maler/import",
      newHref: "/admin/plan-maler/ny",
    },

    settingsHref: "/admin/organisasjon/innstillinger",
    availabilityHref: "/admin/anlegg?tab=tilgjengelighet",
    auditHref: "/admin/audit-log",
    wagrHref: "/admin/organisasjon/wagr-import",
  };
}

export default async function SettingsPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const data = await loadDriftData({ id: user.id, name: user.name });
  return <Drift data={mapDriftData(data)} />;
}
