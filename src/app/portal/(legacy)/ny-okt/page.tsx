/**
 * PlayerHQ · Ny økt — wizard
 *
 * Migrert fra public/design/batch3/ny-okt-wizard.html.
 * 4-stegs wizard: type → drills → tid/sted → bekreft.
 */
import Link from "next/link";
import { Lock } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { prisma } from "@/lib/prisma";
import { NyOktWizard, type WizardDrill, type WizardTemplate } from "./wizard";
import type { SkillArea } from "@/generated/prisma/client";

/** Skill-område → visnings-kategori + malnavn (samme kategori-følelse som de
 * gamle hardkodede malene, men bygget fra ekte ExerciseDefinition-rader). */
const SKILL_LABEL: Partial<Record<SkillArea, { cat: string; name: string }>> = {
  TEE_TOTAL: { cat: "OTT", name: "Driver-dag" },
  TILNAERMING: { cat: "APP", name: "Innspill-fokus" },
  AROUND_GREEN: { cat: "ARG", name: "Wedge-fokus" },
  PUTTING: { cat: "PUTT", name: "Putting-serie" },
};

async function hentMalerOgOvelser(): Promise<{
  templates: WizardTemplate[];
  alleOvelser: WizardDrill[];
}> {
  const ovelser = await prisma.exerciseDefinition.findMany({
    orderBy: [{ skillArea: "asc" }, { name: "asc" }],
  });

  function tilDrill(e: (typeof ovelser)[number]): WizardDrill {
    return {
      id: e.id,
      name: e.name,
      meta: `${e.durationMin ?? 20} min`,
      cat: (e.skillArea && SKILL_LABEL[e.skillArea]?.cat) ?? "MIX",
      durationMin: e.durationMin ?? 20,
    };
  }

  const alleOvelser: WizardDrill[] = ovelser.map(tilDrill);

  const ovelserPerSkill = new Map<SkillArea, WizardDrill[]>();
  for (const e of ovelser) {
    if (!e.skillArea) continue;
    const liste = ovelserPerSkill.get(e.skillArea) ?? [];
    liste.push(tilDrill(e));
    ovelserPerSkill.set(e.skillArea, liste);
  }

  const templates: WizardTemplate[] = [];
  for (const [skillArea, label] of Object.entries(SKILL_LABEL) as [SkillArea, { cat: string; name: string }][]) {
    const drills = (ovelserPerSkill.get(skillArea) ?? []).slice(0, 3);
    if (drills.length === 0) continue;
    templates.push({
      cat: label.cat,
      name: label.name,
      meta: `${drills.length} drills · ${drills.reduce((s, d) => s + d.durationMin, 0)} min`,
      drills,
    });
  }

  if (templates.length >= 2) {
    const mixDrills = templates.map((t) => t.drills[0]).filter(Boolean);
    templates.push({
      cat: "MIX",
      name: "Full økt",
      meta: `${mixDrills.length} drills · ${mixDrills.reduce((s, d) => s + d.durationMin, 0)} min`,
      drills: mixDrills,
    });
  }

  return { templates, alleOvelser };
}

export default async function NyOktPage() {
  const user = await requirePortalUser();

  if (user.tier === "GRATIS") {
    return (
      <div className="mx-auto max-w-[1240px] space-y-6 px-4 sm:px-6">
        <PageHeader
          eyebrow="PlayerHQ · Ny økt"
          titleLead="Lag din"
          titleItalic="egen"
          titleTrail="økt"
          sub="Bygg dine egne treningsøkter med valgfrie drills — en av Pro-fordelene."
        />
        <EmptyState
          icon={Lock}
          titleItalic="Krever Pro"
          sub="Egendefinerte økter er en del av Pro-abonnementet (299 kr/mnd). Oppgrader for å designe dine egne treningsøkter med valgfrie drills."
          cta={
            <Link
              href="/portal/meg/abonnement"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Se Pro-fordeler
            </Link>
          }
        />
      </div>
    );
  }

  const { templates, alleOvelser } = await hentMalerOgOvelser();

  return (
    <div className="mx-auto max-w-[1240px] space-y-8 px-4 pb-32 sm:px-6">
      <PageHeader
        eyebrow="PlayerHQ · Ny økt"
        titleLead="Lag din"
        titleItalic="egen"
        titleTrail="økt"
        sub="Sett sammen en økt utenfor coach-planen din — på 4 raske steg."
      />
      <NyOktWizard templates={templates} alleOvelser={alleOvelser} />
    </div>
  );
}
