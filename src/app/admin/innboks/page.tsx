/**
 * AgencyOS · Innboks (AG-04) i Precision Athletics — én innboks for alt
 * (beslutninger.md §SKJERMENE … RUNDE 8, «Én innboks»).
 *
 * Samler det som lå på tre sider, med de samme lasterne og handlingene:
 *   /admin/kommunikasjon — loadInnboksSaker (varsler, tilbakemeldinger,
 *                          Jarvis-triage) og e-post fra post@akgolf.no
 *                          (InnboksEpost, bare ADMIN — som før)
 *   /admin/ko            — lastGodkjenninger (PlanAction, CaddieDraft,
 *                          SessionRequest, ukesrapport, løste sjekkpunkter)
 *   /admin/queue         — lastOppfolging (FollowUpCase)
 * I tillegg åpne spørsmål fra spillere, datakvalitet (runder uten
 * SG-grunnlag) og leads under Oppfølging (bare ADMIN, som e-posten). Tilgang: ADMIN/COACH, samme basisgate som alle tre sidene.
 * Ingen tilgang er utvidet: e-post og Jarvis-triage er fortsatt bare for
 * ADMIN, Caddie-utkast krever fortsatt USE_AGENTS i handlingen, og Kø-fanene
 * som krever capability vises bare som lenke når brukeren har den.
 *
 * Fanene: ?filter=spillere|epost|godkjenn|oppfolging|varsler|caddie|datakvalitet.
 * ?o=risk|watch|check|ok|leads velger kolonne under Oppfølging, ?vis=sendt viser
 * sendt og arkivert e-post.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { canUser } from "@/lib/auth/effective-capabilities";
import { Capability } from "@/lib/auth/cbac";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG04Innboks } from "@/components/admin/precision/AG04Innboks";
import { loadInnboksSaker } from "@/lib/admin/innboks-saker";
import { lastGodkjenninger } from "@/lib/admin/ko/last-godkjenninger";
import { koHref, synligeFaner } from "@/lib/admin/ko/faner";
import { lastOppfolging } from "@/lib/admin/oppfolging/last-oppfolging";
import { lastApneSporsmal } from "@/lib/admin/innboks/last-sporsmal";
import { lastDatakvalitet } from "@/lib/admin/innboks/last-datakvalitet";
import { loadEpostVedStatus } from "@/lib/innboks/data";
import { apneSaker, byggInnboks, innboksHaster } from "@/lib/admin/innboks/bygg-innboks";
import { lesInnboksFilter, lesOppfStatus } from "@/lib/admin/innboks/filter";
import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";

export const dynamic = "force-dynamic";
export const metadata = { title: "Innboks · AgencyOS" };

/** Status-verdiene på InnboksEpost — samme som Kommunikasjon-fanene Utkast og Sendt. */
const UTKAST_STATUSER = ["NY", "UTKAST_KLART"];
const SENDT_STATUSER = ["SENDT", "ARKIVERT"];

const forste = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function InnboksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const sp = await searchParams;
  const filter = lesInnboksFilter(forste(sp.filter));
  const oppf = lesOppfStatus(forste(sp.o));
  const erAdmin = user.role === "ADMIN";
  const visSendt = erAdmin && forste(sp.vis) === "sendt";

  const [kanAgenter, kanTester] = await Promise.all([
    canUser(user, Capability.USE_AGENTS),
    canUser(user, Capability.MANAGE_TESTS),
  ]);
  const andreKoer = synligeFaner((c) => (c === Capability.USE_AGENTS ? kanAgenter : c === Capability.MANAGE_TESTS ? kanTester : false))
    .filter((f) => f.id !== "godkjenninger")
    .map((f) => ({ label: f.label, href: koHref(f.id) }));

  const [saker, godkjenn, oppfolging, sporsmal, epost, epostSendt, datakvalitet] = await Promise.all([
    loadInnboksSaker({ id: user.id, role: user.role, name: user.name }),
    lastGodkjenninger(user),
    lastOppfolging(user),
    lastApneSporsmal(user),
    erAdmin ? loadEpostVedStatus(UTKAST_STATUSER) : Promise.resolve([]),
    visSendt ? loadEpostVedStatus(SENDT_STATUSER) : Promise.resolve([]),
    lastDatakvalitet(user),
  ]);
  // Leads (Lead-tabellen) er AK Golfs salgsløype — bare head coach, som e-posten.
  const leads = erAdmin
    ? (await prisma.lead.findMany({
        where: { status: { in: ["NEW", "CONTACTED"] } },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, name: true, email: true, source: true, status: true, createdAt: true },
      })).map((l) => ({
        id: l.id, navn: l.name, epost: l.email, kilde: l.source ?? "", status: l.status,
        dato: new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" }).format(l.createdAt),
      }))
    : null;

  // Spiller 360 åpner bare PLAYER-kontoer i stallen (lastSpiller360Hode).
  // Lenker til andre kontoer (coach, forelder) ga «Denne siden finnes ikke».
  const kandidater = [
    ...godkjenn.rows.map((r) => r.playerId),
    ...oppfolging.kort.map((o) => o.id),
    ...sporsmal.map((q) => q.spillerId),
    ...datakvalitet.runder.map((r) => r.spillerId),
    ...saker.saker.flatMap((s) => /^\/admin\/spillere\/([^/?#]+)/.exec(s.href ?? "")?.[1] ?? []),
  ].filter((id): id is string => !!id);
  const spillere = new Set(
    kandidater.length === 0
      ? []
      : (await prisma.user.findMany({
          where: { AND: [coachScopedPlayerWhere(user), { id: { in: [...new Set(kandidater)] }, role: "PLAYER" }] },
          select: { id: true },
        })).map((u) => u.id),
  );

  const poster = byggInnboks({
    saker: saker.saker,
    godkjenn: godkjenn.rows,
    oppfolging: oppfolging.kort,
    sporsmal,
    epost,
    epostSendt,
    spillere,
    now: new Date(),
  });

  const sok = Object.fromEntries(
    Object.entries(sp).flatMap(([k, v]) => {
      const x = forste(v);
      return x == null ? [] : [[k, x] as const];
    }),
  );

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"} uleste={apneSaker(poster)} haster={innboksHaster(poster)}>
      <AG04Innboks
        tilstand="data"
        poster={poster}
        startFilter={filter}
        startOppf={oppf}
        dagLabel={saker.dagLabel}
        visSendt={visSendt}
        harEpost={erAdmin}
        godkjenn={{
          venter: godkjenn.totalt ?? godkjenn.rows.length,
          lavRisiko: godkjenn.lowRiskCount,
          eldste: godkjenn.eldste ?? null,
          godkjent7Dager: godkjenn.godkjent7Dager ?? null,
          avvist7Dager: godkjenn.avvist7Dager ?? null,
          ukesrapport: godkjenn.ukesrapport ?? null,
          lostSjekkpunkter: godkjenn.lostSjekkpunkter ?? [],
          andreKoer,
        }}
        oppfolgingSpillere={oppfolging.spillereTotalt}
        datakvalitet={{
          ...datakvalitet,
          runder: datakvalitet.runder.map((r) => ({ ...r, spillerId: r.spillerId && spillere.has(r.spillerId) ? r.spillerId : null })),
        }}
        sok={sok}
        leads={leads}
        startLeads={filter === "oppfolging" && forste(sp.o) === "leads"}
      />
    </AgencyOSSkall>
  );
}
