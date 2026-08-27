/**
 * AgencyOS Turnering-detalj — Train-lock (T10, 27.08.2026). Auth/Prisma-
 * loader bevart 1:1 fra legacy. Skjermens faste innhold (hode, KPI-rad,
 * påmeldte, resultater) er portet til TU-02 Onsøy Open.dc.html-mønsteret
 * (stat-kort-grid + panel-rad, se AdminTurneringerTrainLock-filhodet for
 * begrunnelsen for TU→admin-tilpasningen).
 *
 * TournamentForm (../tournament-form, delt med listesiden), ResultForm,
 * UnmergeBanner, TournamentEnrollModal/PriorityPill og FellesmeldingFlyt er
 * BEVISST IKKE portet i denne runden — de er egne modal-/skjema-komponenter
 * (CLAUDE.md: «Gjenbruk … Modal»), og en full TL-omskriving av dem (5 filer,
 * ~1500 linjer) er utenfor denne oppgavens omfang («ingen refaktor av urørt
 * kode»). Triggerknappene deres beholder derfor sin eksisterende v2/Tailwind-
 * stil inntil en egen økt porter dem — se docs/natt/T10-DONE.md.
 */

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TL } from "@/lib/v2/train-lock";
import { TlKort, TlRad, TlRadGruppe, TlTilbake, TlTomTilstand } from "@/components/admin/v2/oppsett/tl-kit";
import { TlCaps, TlInspektorKpi } from "@/components/admin/v2/godkjenninger/tl-inspektor";
import { TournamentForm } from "@/app/admin/tournaments/tournament-form";
import { ResultForm } from "./result-form";
import { UnmergeBanner } from "./unmerge-banner";
import { TournamentEnrollModal, PriorityPill } from "@/components/coachhq/tournament-enroll-modal";
import { FellesmeldingFlyt } from "@/components/admin/v2/fellesmelding-flyt";

/** Nøytralt merke — ingen fargekoding (train-lock.ts §Signal). */
function TlMerke({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: TL.mute,
        boxShadow: `inset 0 0 0 1px ${TL.hair}`,
        borderRadius: 999,
        padding: "3px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function TlAvatar({ navn, size = 34 }: { navn: string; size?: number }) {
  const bokstav = (navn.trim()[0] ?? "?").toUpperCase();
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: TL.avatar,
        color: TL.onAvatar,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: 700,
        flex: "none",
      }}
    >
      {bokstav}
    </span>
  );
}

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
  // Kort variant for KPI-kortet (TlInspektorKpi §22px mono) — periodStr med
  // spelled-out måned/år brekker stygt i en 2-kolonne-flis (verifisert 390px).
  const kortStart = tournament.startDate.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
  const kortEnd = tournament.endDate ? tournament.endDate.toLocaleDateString("nb-NO", { day: "numeric", month: "short" }) : null;
  const periodStrKort = kortEnd && kortEnd !== kortStart ? `${kortStart} – ${kortEnd}` : kortStart;

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

  return (
    <V2Shell bredde="kolonne" aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TlTilbake href="/admin/tournaments">Turneringer</TlTilbake>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 14 }}>
        {/* Hode */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <TlCaps>AgencyOS · Turneringer</TlCaps>
              <TlMerke>{tournament.format}</TlMerke>
            </div>
            <h1 style={{ margin: "10px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>{tournament.name}</h1>
            <p style={{ fontSize: 13, color: TL.mute, margin: "10px 0 0" }}>
              {periodStr}
              {tournament.course ? ` · ${tournament.course.name}` : ""} · {tournament.format}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <FellesmeldingFlyt
              turneringId={tournament.id}
              turneringNavn={tournament.name}
              deltakere={entries.map((e) => ({
                userId: e.userId,
                navn: e.user.name ?? "(uten navn)",
                status: e.entryStatus,
              }))}
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

        {/* KPI-rad — TU-02-mønsteret (2x2 stat-kort) */}
        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 10 }}>
          <TlInspektorKpi label="Påmeldte" verdi={String(entries.length)} sub="spillere" />
          <TlInspektorKpi label="Resultater" verdi={String(tournament.results.length)} sub="registrert" />
          <TlInspektorKpi label="Format" verdi={tournament.format} sub="turneringstype" />
          <TlInspektorKpi label="Dato" verdi={periodStrKort} sub={String(tournament.startDate.getFullYear())} />
        </div>

        {tournament.mergedIntoId && <UnmergeBanner sourceId={tournament.id} targetName={mergedInto?.name ?? null} />}

        {tournament.notes &&
          (tourMeta ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {tourMeta.tour && <TlMerke>{TOUR_LABEL[tourMeta.tour] ?? tourMeta.tour}</TlMerke>}
              {tourMeta.krets && <TlMerke>Krets · {tourMeta.krets}</TlMerke>}
              {Array.isArray(tourMeta.categories) && tourMeta.categories.length > 0 && (
                <TlMerke>
                  {tourMeta.categories.length} kategori{tourMeta.categories.length === 1 ? "" : "er"}
                </TlMerke>
              )}
            </div>
          ) : wizardMeta ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {wizardMeta.priority && <TlMerke>{PRIO_LABEL[wizardMeta.priority] ?? wizardMeta.priority}</TlMerke>}
                {wizardMeta.rounds != null && <TlMerke>{wizardMeta.rounds} runde{wizardMeta.rounds === 1 ? "" : "r"}</TlMerke>}
                {wizardMeta.teeOptions && wizardMeta.teeOptions.length > 0 && <TlMerke>Tee · {wizardMeta.teeOptions.join(", ")}</TlMerke>}
                {wizardMeta.hcpAdjust && <TlMerke>{HCP_LABEL[wizardMeta.hcpAdjust] ?? wizardMeta.hcpAdjust}</TlMerke>}
                {wizardMeta.hasCut && <TlMerke>Cut etter runde 2</TlMerke>}
                {wizardMeta.maxParticipants != null && <TlMerke>Maks {wizardMeta.maxParticipants} deltakere</TlMerke>}
                {wizardMeta.feeOre != null && wizardMeta.feeOre > 0 && (
                  <TlMerke>{new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", minimumFractionDigits: 0 }).format(wizardMeta.feeOre / 100)}</TlMerke>
                )}
                {wizardMeta.registrationDeadline && (
                  <TlMerke>Frist · {new Date(wizardMeta.registrationDeadline).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}</TlMerke>
                )}
              </div>
              {wizardMeta.description && (
                <TlKort>
                  <p style={{ fontSize: 13, color: TL.text, whiteSpace: "pre-wrap", margin: 0 }}>{wizardMeta.description}</p>
                </TlKort>
              )}
            </div>
          ) : (
            <TlKort>
              <p style={{ fontSize: 13, color: TL.text, whiteSpace: "pre-wrap", margin: 0 }}>{tournament.notes}</p>
            </TlKort>
          ))}

        {/* Påmeldte spillere */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TlCaps>Påmeldte ({entries.length})</TlCaps>
          {entries.length === 0 ? (
            <TlRadGruppe>
              <TlTomTilstand icon="users" title="Ingen påmeldte spillere" sub="Klikk «Meld på spillere» øverst for rask multi-select-påmelding." />
            </TlRadGruppe>
          ) : (
            <TlRadGruppe>
              {entries.map((e, i) => {
                const navn = e.user.name ?? "(uten navn)";
                return (
                  <TlRad
                    key={e.id}
                    href={`/admin/spillere/${e.userId}`}
                    last={i === entries.length - 1}
                    title={<span style={{ display: "flex", alignItems: "center", gap: 12 }}><TlAvatar navn={navn} /> {navn}</span>}
                    sub={`HCP ${e.user.hcp ?? "—"} · ${e.user.tier}`}
                    trailing={<PriorityPill priority={e.priority} />}
                  />
                );
              })}
            </TlRadGruppe>
          )}
        </div>

        {/* Resultater */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <TlCaps>Resultater ({tournament.results.length})</TlCaps>
            <ResultForm
              tournamentId={tournament.id}
              players={players.map((p) => ({ id: p.id, name: p.name ?? "(uten navn)" }))}
              triggerLabel="+ Nytt resultat"
            />
          </div>

          {tournament.results.length === 0 ? (
            <TlRadGruppe>
              <TlTomTilstand icon="list" title="Ingen resultater registrert" sub="Klikk «+ Nytt resultat» øverst for å legge til en spillerplassering og score." />
            </TlRadGruppe>
          ) : (
            tournament.results.map((r) => (
              <TlKort key={r.id} pad="12px 18px">
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
                  {r.position != null ? (
                    <span
                      style={{
                        display: "grid",
                        placeItems: "center",
                        width: 40,
                        height: 32,
                        borderRadius: 8,
                        background: TL.dock,
                        fontFamily: TL.font.mono,
                        fontSize: 12,
                        fontWeight: 700,
                        color: TL.text,
                      }}
                    >
                      #{r.position}
                    </span>
                  ) : (
                    <TlAvatar navn={r.user.name ?? "?"} size={32} />
                  )}
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: TL.text }}>{r.user.name ?? "(uten navn)"}</span>
                  {r.score != null && (
                    <span style={{ fontFamily: TL.font.mono, fontSize: 12.5, color: TL.mute }}>Score: {r.score}</span>
                  )}
                  {r.notes && <span style={{ fontSize: 12, color: TL.mute }}>{r.notes}</span>}
                  <span style={{ marginLeft: "auto" }}>
                    <ResultForm
                      tournamentId={tournament.id}
                      players={players.map((p) => ({ id: p.id, name: p.name ?? "(uten navn)" }))}
                      initial={{ id: r.id, userId: r.userId, position: r.position, score: r.score, notes: r.notes }}
                      triggerLabel="Endre"
                    />
                  </span>
                </div>
              </TlKort>
            ))
          )}
        </div>
      </div>
    </V2Shell>
  );
}
