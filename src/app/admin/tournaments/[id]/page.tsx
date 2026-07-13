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
import { TournamentForm } from "@/app/admin/(legacy)/tournaments/tournament-form";
import { ResultForm } from "./result-form";
import { UnmergeBanner } from "./unmerge-banner";
import { TournamentEnrollModal, PriorityPill } from "@/components/coachhq/tournament-enroll-modal";

const TOUR_LABEL: Record<string, string> = {
  olyo: "Olyo Juniortour",
  srixon: "Srixon Tour",
  ostlandstour: "Titleist Østlandstour",
  garmin: "Garmin Norges Cup",
};

export default async function TurneringDetalj({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

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

  let tourMeta: { tour?: string; krets?: string; categories?: unknown[] } | null = null;
  if (tournament.notes) {
    try {
      const parsed = JSON.parse(tournament.notes);
      if (parsed && typeof parsed === "object" && (parsed.tour || parsed.externalId)) tourMeta = parsed;
    } catch {
      // Ikke JSON — vis som vanlig notat under.
    }
  }

  return (
    <V2Shell aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/admin/tournaments">Turneringer</TilbakeLenke>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <Link href="/admin/tournaments" style={{ textDecoration: "none", alignSelf: "flex-start" }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>← Turneringer</span>
        </Link>

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
