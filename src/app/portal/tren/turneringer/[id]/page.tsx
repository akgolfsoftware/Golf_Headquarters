/**
 * PlayerHQ · Trening · Turnering — Detalj (/portal/tren/turneringer/[id]) — v10-design.
 *
 * Rendrer <TurneringDetalj> (v10-fasit fra pl-turnering) med EKTE data fra
 * loadTurneringDetalj (Prisma: Tournament + spillerens TournamentEntry +
 * TournamentResult-historikk). mapTurneringData oversetter den eksisterende
 * TurneringDetalj-loader-shapen til v10-komponentens TurneringDetaljData.
 *
 * Tom-tilstander bevares (null/[]) — aldri liksom-tall:
 *  - `starttid`: ingen tee/starttid-felt i schemaet → utelates (undefined).
 *  - `dinStatus`: kun når påmeldt og felt finnes (kategori/status).
 *  - `forberedelse`: ingen persisteringsmodell for huskelista → [] (komponenten
 *    viser "0 / 0 klart", ingen fabrikerte punkter).
 *  - `tidligere`: fra spillerens TournamentResult — [] når ingen historikk.
 *
 * Server component. Auth-guard via requirePortalUser (PLAYER/COACH/ADMIN).
 * Not-found-branch beholdt (EmptyState).
 *
 * Bolk (3. juni): byttet fra TurneringDetaljScreen (gammelt design) til
 * TurneringDetalj (v10).
 */

import Link from "next/link";
import { ChevronLeft, Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  loadTurneringDetalj,
  type TurneringDetalj as TurneringDetaljLoad,
} from "@/lib/portal-turnering/turnering-detalj-data";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { EmptyState } from "@/components/shared/empty-state";
import {
  TurneringDetalj,
  type TurneringDetaljData,
  type DinStatusFelt,
  type TidligereResultat,
} from "@/components/portal/turneringer/turnering-detalj";

export const dynamic = "force-dynamic";

/** Oversetter ekte TurneringDetalj (loader) → v10 TurneringDetaljData. */
function mapTurneringData(
  data: TurneringDetaljLoad,
  id: string,
): TurneringDetaljData {
  const pameldt = data.entry?.state.active === true;

  // Din status — kun ekte felt. Kategori (Klasse) + status-label når de finnes.
  const dinStatus: DinStatusFelt[] = [];
  if (data.entry?.category) {
    dinStatus.push({ key: "Klasse", value: data.entry.category });
  }
  if (data.status) {
    dinStatus.push({ key: "Status", value: data.status.label });
  }

  // Historikk → tidligere år. Plassering hvis registrert, ellers score.
  const tidligere: TidligereResultat[] = data.history.map((h) => {
    if (h.position != null) {
      return { ar: String(h.year), label: "plass", value: String(h.position) };
    }
    if (h.score != null) {
      return { ar: String(h.year), label: "score", value: String(h.score) };
    }
    return { ar: String(h.year), label: "spilt", value: "—" };
  });

  const detaljHref = `/portal/tren/turneringer/${id}`;

  return {
    eyebrow: data.tour ?? "Turnering",
    tittel: data.name,
    meta: data.dateCompact,
    pameldt,
    // Ingen starttid-felt i schemaet → utelates (aldri falsk verdi).
    dinStatus: dinStatus.length > 0 ? dinStatus : undefined,
    // Ingen persisteringsmodell for forberedelse-huskelista → tom-tilstand.
    forberedelse: [],
    tidligere,
    hrefs: {
      tilbake: "/portal/tren/turneringer",
      plan: detaljHref,
      starttid: detaljHref,
      avmeld: detaljHref,
    },
  };
}

export default async function TurneringDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const data = await loadTurneringDetalj(user.id, id);

  if (!data) {
    return (
      <div className="space-y-6 pb-20">
        <Link
          href="/portal/tren/turneringer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
          Tilbake til turneringer
        </Link>
        <PageHeader
          eyebrow="PlayerHQ · Tren · Turnering"
          titleLead="Turnering"
          titleItalic="ikke funnet"
          sub="Vi fant ingen turnering med denne ID-en."
        />
        <EmptyState
          icon={Trophy}
          titleItalic="Ingen"
          titleTrail="turnering tilgjengelig"
          sub="Turneringen ble ikke funnet eller du har ikke tilgang."
          cta={
            <Link
              href="/portal/tren/turneringer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-[13px] font-semibold text-primary-foreground hover:opacity-90"
            >
              Se alle turneringer
            </Link>
          }
        />
      </div>
    );
  }

  return <TurneringDetalj data={mapTurneringData(data, id)} />;
}
