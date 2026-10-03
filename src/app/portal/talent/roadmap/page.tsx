/**
 * PH14Veikart — sesongveikart i PlayerHQSkall.
 * Feature-gate, sesongplan, turneringer og milepæler er uendret.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { FEATURES } from "@/lib/features";
import { prisma } from "@/lib/prisma";
import type { LPhase } from "@/generated/prisma/client";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { KnappLenke, TomTilstand } from "@/components/precision/pa";
import {
  TalentRoadmapV2,
  type TalentRoadmapData,
} from "@/components/portal/v2/TalentRoadmapV2";

export const dynamic = "force-dynamic";

type Milepael = {
  tittel: string;
  dato: string;
  beskrivelse?: string;
  oppnadd?: boolean;
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
  return json.filter(
    (m): m is Milepael =>
      typeof m === "object" &&
      m !== null &&
      typeof (m as Milepael).tittel === "string",
  );
}

const LPHASE_NAVN: Record<LPhase, string> = {
  GRUNN: "Grunnperiode",
  SPESIAL: "Spesialperiode",
  TURNERING: "Turneringsperiode",
  EVALUERING: "Evaluering",
  TESTUKE: "Testuke",
  FERIE: "Ferie",
  TRENINGSSAMLING: "Treningssamling",
  HELDAGSSAMLING: "Heldagssamling",
  RESTITUSJON: "Restitusjon",
};

const MND_KORT = [
  "jan", "feb", "mar", "apr", "mai", "jun",
  "jul", "aug", "sep", "okt", "nov", "des",
];

function periodeTekst(start: Date, end: Date): string {
  const a = MND_KORT[start.getMonth()];
  const b = MND_KORT[end.getMonth()];
  return a === b ? a : `${a} – ${b}`;
}

function datoTekst(d: Date): string {
  return `${d.getDate()}. ${MND_KORT[d.getMonth()]}`;
}

export default async function RoadmapPage() {
  if (!FEATURES.TALENT) notFound();

  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER"] });

  const ar = new Date().getFullYear();

  const [tracking, sesongplan, ulest] = await Promise.all([
    prisma.talentTracking.findUnique({
      where: { userId: user.id },
      select: { niva: true, milepaeler: true },
    }),
    prisma.seasonPlan.findFirst({
      where: { userId: user.id, year: ar },
      include: {
        periodBlocks: { orderBy: { startDate: "asc" } },
        tournamentEntries: {
          where: { entryStatus: { not: "WITHDRAWN" } },
          include: { tournament: { select: { name: true, startDate: true } } },
        },
      },
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

  const milepaeler = parseMilepaeler(tracking.milepaeler);

  const faser = (sesongplan?.periodBlocks ?? []).map((b) => ({
    id: b.id,
    navn: LPHASE_NAVN[b.lPhase],
    periode: periodeTekst(b.startDate, b.endDate),
    fokus: b.focus ?? null,
  }));

  const turneringer = (sesongplan?.tournamentEntries ?? [])
    .map((e) => {
      const navn = e.tournament?.name ?? e.manualName ?? null;
      const dato = e.tournament?.startDate ?? e.manualDate ?? null;
      return navn ? { id: e.id, navn, dato } : null;
    })
    .filter((t): t is { id: string; navn: string; dato: Date | null } => t !== null)
    .sort((a, b) => (a.dato?.getTime() ?? 0) - (b.dato?.getTime() ?? 0));

  const data: TalentRoadmapData = {
    niva: tracking.niva,
    ar,
    faser,
    turneringer: turneringer.map((t) => ({
      id: t.id,
      navn: t.navn,
      datoTekst: t.dato ? datoTekst(t.dato) : null,
    })),
    milepaeler: milepaeler.map((m) => ({
      tittel: m.tittel,
      datoTekst: m.dato ?? null,
      beskrivelse: m.beskrivelse ?? null,
      oppnadd: m.oppnadd ?? false,
    })),
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <div className="ph-flate">
          <Link href="/portal/meg" className="ph-tilbake">Meg</Link>
          <TalentValg aktiv="roadmap" />
          <TalentRoadmapV2 data={data} />
        </div>
      </div>
    </PlayerHQSkall>
  );
}
