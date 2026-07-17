/**
 * AgencyOS Turnering-detalj — v2. Auth/Prisma-loader bevart 1:1 fra legacy.
 * TournamentForm (../tournament-form, delt med listesiden), ResultForm,
 * UnmergeBanner og TournamentEnrollModal/PriorityPill er tailwind-only og
 * gjenbrukes uendret.
 */

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort, Rad, KpiFlis, StatusPill, TomTilstand, AvatarInit, HjelpTips, TilbakeLenke } from "@/components/v2";
import { TournamentForm } from "@/app/admin/tournaments/tournament-form";
import { ResultForm } from "./result-form";
import { UnmergeBanner } from "./unmerge-banner";
import { FellesmeldingPanel, type FellesmeldingDeltaker } from "./fellesmelding-panel";
import { TournamentEnrollModal, PriorityPill } from "@/components/coachhq/tournament-enroll-modal";

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

  // D1 Fellesmelding — mottakere fra TournamentEntry (trukkede ekskluderes)
  const fellesmeldingDeltakere: FellesmeldingDeltaker[] = entries
    .filter((e) => e.entryStatus !== "WITHDRAWN")
    .map((e) => ({
      userId: e.userId,
      navn: e.user.name ?? "(uten navn)",
      status: e.entryStatus === "CONFIRMED" ? ("BEKREFTET" as const) : ("PAMELDT" as const),
    }));
  const fellesmeldingKontekst = `${tournament.name}${tournament.course ? ` · ${tournament.course.name}` : ""}`;

  return (
    <V2Shell aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/admin/tournaments">Turneringer</TilbakeLenke>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {/* Hode */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Caps>AgencyOS · Turneringer</Caps>
              <StatusPill tone="info">{tournament.format}</StatusPill>
            </div>
            <div style={{ marginTop: 10 }}>
              <Tittel>{tournament.name}</Tittel>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0" }}>
              {periodStr}
              {tournament.course ? ` · ${tournament.course.name}` : ""} · {tournament.format}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <FellesmeldingPanel
              tournamentId={tournament.id}
              turneringNavn={tournament.name}
              kontekst={fellesmeldingKontekst}
              coachNavn={user.name ?? "Coach"}
              deltakere={fellesmeldingDeltakere}
              autoApen={fellesmelding === "1"}
            />
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
              triggerLabel={entries.length === 0 ? "+ Meld på" : "+ Legg til"}
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
          </div>
        </div>

        {/* KPI-rad */}
        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: T.gap }}>
          <KpiFlis label="Påmeldte" value={String(entries.length)} delta="spillere" />
          <KpiFlis label="Resultater" value={String(tournament.results.length)} delta="registrert" />
          <KpiFlis label="Format" value={tournament.format} />
          <KpiFlis label="Dato" value={periodStr} />
        </div>

        {tournament.mergedIntoId && <UnmergeBanner sourceId={tournament.id} targetName={mergedInto?.name ?? null} />}

        {tournament.notes &&
          (tourMeta ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {tourMeta.tour && <StatusPill tone="lime">{TOUR_LABEL[tourMeta.tour] ?? tourMeta.tour}</StatusPill>}
              {tourMeta.krets && <StatusPill tone="info">Krets · {tourMeta.krets}</StatusPill>}
              {Array.isArray(tourMeta.categories) && tourMeta.categories.length > 0 && (
                <StatusPill tone="info">
                  {tourMeta.categories.length} kategori{tourMeta.categories.length === 1 ? "" : "er"}
                </StatusPill>
              )}
            </div>
          ) : wizardMeta ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {wizardMeta.priority && <StatusPill tone="lime">{PRIO_LABEL[wizardMeta.priority] ?? wizardMeta.priority}</StatusPill>}
                {wizardMeta.rounds != null && <StatusPill tone="info">{wizardMeta.rounds} runde{wizardMeta.rounds === 1 ? "" : "r"}</StatusPill>}
                {wizardMeta.teeOptions && wizardMeta.teeOptions.length > 0 && <StatusPill tone="info">Tee · {wizardMeta.teeOptions.join(", ")}</StatusPill>}
                {wizardMeta.hcpAdjust && <StatusPill tone="info">{HCP_LABEL[wizardMeta.hcpAdjust] ?? wizardMeta.hcpAdjust}</StatusPill>}
                {wizardMeta.hasCut && <StatusPill tone="warn">Cut etter runde 2</StatusPill>}
                {wizardMeta.maxParticipants != null && <StatusPill tone="info">Maks {wizardMeta.maxParticipants} deltakere</StatusPill>}
                {wizardMeta.feeOre != null && wizardMeta.feeOre > 0 && (
                  <StatusPill tone="info">{new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", minimumFractionDigits: 0 }).format(wizardMeta.feeOre / 100)}</StatusPill>
                )}
                {wizardMeta.registrationDeadline && (
                  <StatusPill tone="info">Frist · {new Date(wizardMeta.registrationDeadline).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}</StatusPill>
                )}
              </div>
              {wizardMeta.description && (
                <Kort>
                  <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, whiteSpace: "pre-wrap", margin: 0 }}>{wizardMeta.description}</p>
                </Kort>
              )}
            </div>
          ) : (
            <Kort>
              <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, whiteSpace: "pre-wrap", margin: 0 }}>{tournament.notes}</p>
            </Kort>
          ))}

        {/* Påmeldte spillere */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Caps>Påmeldte ({entries.length})</Caps>
          {entries.length === 0 ? (
            <Kort>
              <TomTilstand icon="users" title="Ingen påmeldte spillere" sub="Klikk «Meld på spillere» øverst for rask multi-select-påmelding." />
            </Kort>
          ) : (
            <Kort pad="6px 18px">
              {entries.map((e, i) => {
                const navn = e.user.name ?? "(uten navn)";
                return (
                  <Link key={e.id} href={`/admin/spillere/${e.userId}`} style={{ textDecoration: "none", display: "block" }}>
                    <Rad
                      last={i === entries.length - 1}
                      leading={<AvatarInit navn={navn} size={34} />}
                      title={navn}
                      sub={`HCP ${e.user.hcp ?? "—"} · ${e.user.tier}`}
                      meta={
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <PriorityPill priority={e.priority} />
                          <HjelpTips k="turneringPrioritet" size={11} />
                        </span>
                      }
                    />
                  </Link>
                );
              })}
            </Kort>
          )}
        </div>

        {/* Resultater */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Caps>Resultater ({tournament.results.length})</Caps>
            <ResultForm
              tournamentId={tournament.id}
              players={players.map((p) => ({ id: p.id, name: p.name ?? "(uten navn)" }))}
              triggerLabel="+ Nytt resultat"
            />
          </div>

          {tournament.results.length === 0 ? (
            <Kort>
              <TomTilstand icon="list" title="Ingen resultater registrert" sub="Klikk «+ Nytt resultat» øverst for å legge til en spillerplassering og score." />
            </Kort>
          ) : (
            tournament.results.map((r) => (
              <Kort key={r.id} pad="12px 18px">
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
                  {r.position != null ? (
                    <span
                      style={{
                        display: "grid",
                        placeItems: "center",
                        width: 40,
                        height: 32,
                        borderRadius: 8,
                        background: T.panel2,
                        fontFamily: T.mono,
                        fontSize: 12,
                        fontWeight: 700,
                        color: T.fg,
                      }}
                    >
                      #{r.position}
                    </span>
                  ) : (
                    <AvatarInit navn={r.user.name ?? "?"} size={32} />
                  )}
                  <span style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{r.user.name ?? "(uten navn)"}</span>
                  {r.score != null && (
                    <span style={{ fontFamily: T.mono, fontSize: 12.5, color: T.mut }}>Score: {r.score}</span>
                  )}
                  {r.notes && <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>{r.notes}</span>}
                  <span style={{ marginLeft: "auto" }}>
                    <ResultForm
                      tournamentId={tournament.id}
                      players={players.map((p) => ({ id: p.id, name: p.name ?? "(uten navn)" }))}
                      initial={{ id: r.id, userId: r.userId, position: r.position, score: r.score, notes: r.notes }}
                      triggerLabel="Endre"
                    />
                  </span>
                </div>
              </Kort>
            ))
          )}
        </div>
      </div>
    </V2Shell>
  );
}
