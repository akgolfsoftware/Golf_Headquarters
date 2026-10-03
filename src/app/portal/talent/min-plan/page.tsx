/**
 * PH14MinPlan — talentplanen i PlayerHQSkall.
 * Feature-gate, TalentTracking og milepæl-parsingen er uendret.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { FEATURES } from "@/lib/features";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { KnappLenke, TomTilstand } from "@/components/precision/pa";
import {
  TalentMinPlanV2,
  type TalentMinPlanData,
} from "@/components/portal/v2/TalentMinPlanV2";
import {
  TALENT_AKSE_KEYS,
  TALENT_AKSE_LABELS,
} from "@/components/portal/v2/TalentFellesV2";

type Milepael = {
  tittel: string;
  dato?: string;
  beskrivelse?: string;
  fullfort?: boolean;
};

const TALENT_FANER = [
  { id: "mitt-niva", l: "Mitt nivå", href: "/portal/talent/mitt-niva" },
  { id: "min-plan", l: "Min plan", href: "/portal/talent/min-plan" },
  { id: "roadmap", l: "Roadmap", href: "/portal/talent/roadmap" },
  { id: "sammenligning", l: "Sammenligning", href: "/portal/talent/sammenligning" },
] as const;

function TalentValg({ aktiv }: { aktiv: (typeof TALENT_FANER)[number]["id"] }) {
  return (
    <nav className="ph-valg" aria-label="Talent">
      {TALENT_FANER.map((f) => (
        <Link key={f.id} href={f.href} aria-current={f.id === aktiv ? "page" : undefined}>
          {f.l}
        </Link>
      ))}
    </nav>
  );
}

function IkkeIProgrammet() {
  return (
    <section className="pa-card ph-kort">
      <TomTilstand
        icon={Star}
        title="Du er ikke i talent-programmet ennå"
        text="Talent-modulen er forbeholdt spillere som er invitert inn i AK Golf sitt talentutviklingsprogram. Når du blir tatt opp får du din egen utviklingsplan, radar mot kohort-snitt og sammenligning med andre på samme nivå. Lurer du på hva som skal til? Ta kontakt med coachen din."
        actions={<KnappLenke href="/portal" icon={ArrowLeft}>Tilbake til PlayerHQ</KnappLenke>}
      />
    </section>
  );
}

function parseMilepaeler(json: unknown): Milepael[] {
  if (!Array.isArray(json)) return [];
  return json
    .filter((m): m is Record<string, unknown> => typeof m === "object" && m !== null)
    .map((m) => ({
      tittel: typeof m.tittel === "string" ? m.tittel : "",
      dato: typeof m.dato === "string" ? m.dato : undefined,
      beskrivelse: typeof m.beskrivelse === "string" ? m.beskrivelse : undefined,
      fullfort: typeof m.fullfort === "boolean" ? m.fullfort : false,
    }))
    .filter((m) => m.tittel.length > 0);
}

function formatDato(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Oslo",
  });
}

export default async function MinPlanPage() {
  if (!FEATURES.TALENT) notFound();

  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER"] });

  const [tracking, ulest] = await Promise.all([
    prisma.talentTracking.findUnique({
      where: { userId: user.id },
    }),
    getUnreadNotifications(user.id, 1),
  ]);

  if (!tracking) {
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
        <div className="pa-side">
          <div className="ph-flate">
            <Link href="/portal/meg" className="ph-tilbake">Meg</Link>
            <IkkeIProgrammet />
          </div>
        </div>
      </PlayerHQSkall>
    );
  }

  const milepaelerRaa = parseMilepaeler(tracking.milepaeler);
  const nesteMalRaa = milepaelerRaa.find((m) => !m.fullfort);

  const iProgrammetSiden = tracking.inkludertFra.toLocaleDateString("nb-NO", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Oslo",
  });

  const data: TalentMinPlanData = {
    niva: tracking.niva,
    status: [
      { label: "Nivå", value: tracking.niva },
      { label: "Klubb", value: tracking.klubb ?? "Ikke registrert" },
      { label: "Region", value: tracking.region ?? "Ikke registrert" },
      { label: "I programmet", value: iProgrammetSiden },
    ],
    akser: TALENT_AKSE_KEYS.map((k) => ({
      label: TALENT_AKSE_LABELS[k],
      verdi: tracking[k],
    })),
    nesteMal: nesteMalRaa
      ? {
          tittel: nesteMalRaa.tittel,
          beskrivelse: nesteMalRaa.beskrivelse ?? null,
          fristTekst: formatDato(nesteMalRaa.dato),
        }
      : null,
    milepaeler: milepaelerRaa.map((m) => ({
      tittel: m.tittel,
      datoTekst: formatDato(m.dato),
      beskrivelse: m.beskrivelse ?? null,
      fullfort: m.fullfort ?? false,
    })),
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <div className="ph-flate">
          <Link href="/portal/meg" className="ph-tilbake">Meg</Link>
          <TalentValg aktiv="min-plan" />
          <TalentMinPlanV2 data={data} />
        </div>
      </div>
    </PlayerHQSkall>
  );
}
