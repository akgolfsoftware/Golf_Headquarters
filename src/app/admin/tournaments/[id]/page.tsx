/**
 * AgencyOS Turnering-detalj i nytt design (19.10.2026). Auth/Prisma-loader
 * bevart 1:1. Hode, tellere, påmeldte og resultater bruker byggeklossene i
 * agencyos-ny; Endre (TournamentForm), Nytt resultat (ResultForm), Opphev
 * sammenslåing (UnmergeBanner) og Fellesmelding (AG17Fellesmelding) er
 * skrevet om til samme design med de samme server-handlingene.
 * Påmelding (TournamentEnrollModal) er felles med andre flater og er urørt.
 */

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Avatar, Pille, Seksjon, Tom, Topp } from "@/components/admin/agencyos-ny/ny";
import { TournamentForm } from "@/app/admin/tournaments/tournament-form";
import { ResultForm } from "./result-form";
import { UnmergeBanner } from "./unmerge-banner";
import { TournamentEnrollModal, PriorityPill } from "@/components/agencyos/tournament-enroll-modal";
import { AG17Fellesmelding } from "@/components/admin/precision/AG17Fellesmelding";
import "@/styles/agencyos-ny-mer.css";

const TOUR_LABEL: Record<string, string> = {
  olyo: "Olyo Juniortour",
  srixon: "Srixon Tour",
  ostlandstour: "Titleist Østlandstour",
  garmin: "Garmin Norges Cup",
};

export default async function TurneringDetalj({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fellesmelding?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;
  const { fellesmelding } = await searchParams;

  const [tournament, courses, players, entries] = await Promise.all([
    prisma.tournament.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, name: true } },
        results: { include: { user: { select: { id: true, name: true } } }, orderBy: [{ position: "asc" }, { score: "asc" }] },
      },
    }),
    prisma.courseDefinition.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: coachScopedPlayerWhere(user),
      orderBy: { name: "asc" },
      select: { id: true, name: true, hcp: true, tier: true },
    }),
    prisma.tournamentEntry.findMany({
      where: { tournamentId: id },
      include: { user: { select: { id: true, name: true, hcp: true, tier: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (!tournament) notFound();

  const mergedInto = tournament.mergedIntoId
    ? await prisma.tournament.findUnique({ where: { id: tournament.mergedIntoId }, select: { name: true } })
    : null;

  const startStr = tournament.startDate.toLocaleDateString("nb-NO", { day: "2-digit", month: "long", year: "numeric" });
  const endStr = tournament.endDate
    ? tournament.endDate.toLocaleDateString("nb-NO", { day: "2-digit", month: "long", year: "numeric" })
    : null;
  const periodStr = endStr ? `${startStr} – ${endStr}` : startStr;

  type WizardMeta = {
    createdVia: "wizard";
    priority?: string;
    rounds?: number;
    teeOptions?: string[];
    hcpAdjust?: string;
    hasCut?: boolean;
    maxParticipants?: number;
    feeOre?: number;
    registrationDeadline?: string | null;
    description?: string | null;
  };
  let tourMeta: { tour?: string; krets?: string; categories?: unknown[] } | null = null;
  let wizardMeta: WizardMeta | null = null;
  if (tournament.notes) {
    try {
      const parsed = JSON.parse(tournament.notes);
      if (parsed && typeof parsed === "object" && (parsed.tour || parsed.externalId)) tourMeta = parsed;
      else if (parsed && typeof parsed === "object" && parsed.createdVia === "wizard") wizardMeta = parsed;
    } catch {
      // Ikke JSON — vis som vanlig notat under.
    }
  }
  const HCP_LABEL: Record<string, string> = { FULL: "Full HCP", P90: "90 % HCP", P75: "75 % HCP", SCRATCH: "Scratch" };
  const PRIO_LABEL: Record<string, string> = { MAJOR: "Major", NORMAL: "Normal", LOCAL: "Lokal" };

  const spillervalg = players.map((p) => ({ id: p.id, name: p.name ?? "(uten navn)" }));

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <div className="agn-s">
        <Topp tilbake={{ href: "/admin/turnering", tekst: "Turneringer" }}
          dato={`Turnering · ${tournament.format}`}
          tittel={tournament.name}
          ingress={`${periodStr}${tournament.course ? ` · ${tournament.course.name}` : ""}`}
          handlinger={<>
            <TournamentEnrollModal
              tournamentId={tournament.id}
              tournamentName={tournament.name}
              tournamentDate={periodStr}
              players={players.map((p) => ({ id: p.id, name: p.name ?? "(uten navn)", hcp: p.hcp, tier: p.tier }))}
              existing={entries.map((e) => ({
                entryId: e.id,
                userId: e.userId,
                name: e.user.name ?? "(uten navn)",
                hcp: e.user.hcp,
                tier: e.user.tier,
                priority: e.priority,
              }))}
              triggerLabel={entries.length === 0 ? "Meld på" : "Legg til"}
              triggerClass="knapp pri"
            />
            <AG17Fellesmelding
              turneringId={tournament.id}
              turneringNavn={tournament.name}
              deltakere={entries.map((e) => ({ userId: e.userId, navn: e.user.name ?? "(uten navn)", status: e.entryStatus }))}
              autoApen={fellesmelding === "1"}
            />
            <TournamentForm
              initial={{
                id: tournament.id,
                name: tournament.name,
                startDate: tournament.startDate,
                endDate: tournament.endDate,
                courseId: tournament.courseId,
                format: tournament.format,
                notes: tournament.notes,
              }}
              courses={courses.map((c) => ({ id: c.id, name: c.name }))}
              triggerLabel="Endre"
            />
          </>} />

        <div className="teller-rad">
          <div className="teller"><span className="e">Påmeldte</span><b className="t">{entries.length}</b><span className="s">spillere</span></div>
          <div className="teller"><span className="e">Resultater</span><b className="t">{tournament.results.length}</b><span className="s">registrert</span></div>
        </div>

        {tournament.mergedIntoId && <UnmergeBanner sourceId={tournament.id} targetName={mergedInto?.name ?? null} />}

        {tournament.notes &&
          (tourMeta ? (
            <div className="chips" aria-label="Kilde">
              {tourMeta.tour && <Pille>{TOUR_LABEL[tourMeta.tour] ?? tourMeta.tour}</Pille>}
              {tourMeta.krets && <Pille>Krets · {tourMeta.krets}</Pille>}
              {Array.isArray(tourMeta.categories) && tourMeta.categories.length > 0 && (
                <Pille>{tourMeta.categories.length} {tourMeta.categories.length === 1 ? "klasse" : "klasser"}</Pille>
              )}
            </div>
          ) : wizardMeta ? (
            <>
              <div className="chips" aria-label="Oppsett">
                {wizardMeta.priority && <Pille>{PRIO_LABEL[wizardMeta.priority] ?? wizardMeta.priority}</Pille>}
                {wizardMeta.rounds != null && <Pille>{wizardMeta.rounds} {wizardMeta.rounds === 1 ? "runde" : "runder"}</Pille>}
                {wizardMeta.teeOptions && wizardMeta.teeOptions.length > 0 && <Pille>Tee · {wizardMeta.teeOptions.join(", ")}</Pille>}
                {wizardMeta.hcpAdjust && <Pille>{HCP_LABEL[wizardMeta.hcpAdjust] ?? wizardMeta.hcpAdjust}</Pille>}
                {wizardMeta.hasCut && <Pille>Cut etter runde 2</Pille>}
                {wizardMeta.maxParticipants != null && <Pille>Maks {wizardMeta.maxParticipants} deltakere</Pille>}
                {wizardMeta.feeOre != null && wizardMeta.feeOre > 0 && (
                  <Pille>{new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", minimumFractionDigits: 0 }).format(wizardMeta.feeOre / 100)}</Pille>
                )}
                {wizardMeta.registrationDeadline && (
                  <Pille>Frist · {new Date(wizardMeta.registrationDeadline).toLocaleDateString("nb-NO", { day: "numeric", month: "short", timeZone: "Europe/Oslo" })}</Pille>
                )}
              </div>
              {wizardMeta.description && <div className="kort"><p style={{ whiteSpace: "pre-wrap" }}>{wizardMeta.description}</p></div>}
            </>
          ) : (
            <div className="kort"><p style={{ whiteSpace: "pre-wrap" }}>{tournament.notes}</p></div>
          ))}

        <div className="to-del">
          <div>
            <Seksjon tittel={`Påmeldte · ${entries.length}`}>
              {entries.length === 0 ? (
                <Tom tittel="Ingen påmeldte" tekst="Trykk «Meld på» øverst for å melde på flere spillere samtidig." />
              ) : (
                <div className="kort rader">
                  {entries.map((e) => {
                    const navn = e.user.name ?? "(uten navn)";
                    return (
                      <Link key={e.id} href={`/admin/spillere/${e.userId}`} className="mer-rad">
                        <Avatar navn={navn} liten />
                        <span><b>{navn}</b><span className="kilde">HCP {e.user.hcp ?? "—"} · {e.user.tier === "GRATIS" ? "Gratis" : "Full"}</span></span>
                        <span className="hoyre"><PriorityPill priority={e.priority} /></span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Seksjon>
          </div>
          <div>
            <Seksjon tittel={`Resultater · ${tournament.results.length}`} hoyre={<ResultForm tournamentId={tournament.id} players={spillervalg} triggerLabel="Nytt resultat" />}>
              {tournament.results.length === 0 ? (
                <Tom tittel="Ingen resultater" tekst="Trykk «Nytt resultat» for å legge inn plassering og score." />
              ) : (
                <div className="kort rader">
                  {tournament.results.map((r) => (
                    <div key={r.id} className="mer-rad">
                      <b className="mono">{r.position != null ? `#${r.position}` : "—"}</b>
                      <span><b>{r.user.name ?? "(uten navn)"}</b>
                        <span className="kilde">{r.score != null ? `Score ${r.score}` : "Ingen score"}{r.notes ? ` · ${r.notes}` : ""}</span></span>
                      <span className="hoyre">
                        <ResultForm tournamentId={tournament.id} players={spillervalg}
                          initial={{ id: r.id, userId: r.userId, position: r.position, score: r.score, notes: r.notes }} triggerLabel="Endre" />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Seksjon>
          </div>
        </div>
      </div>
    </AgencyOSSkall>
  );
}
