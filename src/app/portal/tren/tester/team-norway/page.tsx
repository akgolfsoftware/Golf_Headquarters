/** Own-session registry with Precision Athletics scorecards and canonical results. */
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { TN_CATALOG, TN_RULES_VERSION, tnProtocol, tnVersion } from "@/lib/portal-tester/tn-catalog";
import { TnSessionSchema } from "@/lib/portal-tester/tn-session";
import { z } from "zod";
import { tnFromDefinitionId, tnDefinitionId, tnComparableResult } from "@/lib/portal-tester/tn-integration";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { TnLocalDrafts } from "./local-drafts";
import { TnScorecard } from "./scorecard";
import { hentGodkjenteOvelsesbankElementer } from "@/lib/masterbrain/drill-bank";
import { foreslaGodkjenteOvelser, ovelsesNavn } from "@/lib/portal-tester/test-anbefaling";
import { ResultatKontekst } from "@/components/tester/ResultatKontekst";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";

export const dynamic = "force-dynamic";
export default async function TeamNorwayTests({ searchParams }: { searchParams: Promise<{ test?: string; session?: string; participant?: string; count?: string; local?: string; version?: string }> }) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const query = await searchParams;
  let content;
  if (query.participant) {
    const participant = await prisma.testDayParticipant.findFirst({
      where: { id: query.participant, playerId: user.id, status: "PENDING", testDay: { status: "ACTIVE" } },
      include: { testDay: { include: { group: { select: { id: true, name: true } }, testDefinition: true } }, session: true },
    });
    if (!participant) notFound();
    const membership = await prisma.groupMember.findFirst({ where: { groupId: participant.testDay.groupId, userId: user.id, ...aktivtSpillerMedlemskapWhere() }, select: { id: true } });
    if (!membership) notFound();
    const protocolId = (participant.testDay.testDefinition.protocol as { protocolId?: string } | null)?.protocolId;
    const p = protocolId ? tnProtocol(protocolId, undefined, participant.testDay.testDefinition.scoringRule ?? "") : null;
    if (!p || p.blocked) notFound();
    const state = participant.session ? TnSessionSchema.safeParse(participant.session.scoringData) : null;
    const initial = state?.success && state.data.protocolId === p.id && state.data.version === tnVersion(p) && state.data.count === p.rows.length
      ? { sessionId: participant.session!.id, revision: state.data.revision, values: state.data.values, notes: state.data.notes, status: participant.session!.status }
      : undefined;
    if (participant.session && !initial) notFound();
    content = <><h1>{participant.testDay.title}</h1><p>{participant.testDay.group.name} · {p.name}</p><TnScorecard key={`${participant.id}-${participant.sessionId ?? "new"}`} protocol={p} initial={initial} localSessionId={participant.sessionId ? undefined : crypto.randomUUID()} testDayParticipantId={participant.id} /></>;
  } else if (query.session) {
    const row = await prisma.testSession.findFirst({ where: { id: query.session, userId: user.id } });
    if (!row) notFound();
    const state = TnSessionSchema.safeParse(row.scoringData);
    if (!state.success) notFound();
    const base = tnProtocol(state.data.protocolId, undefined, state.data.version);
    const p = base?.variableCount ? tnProtocol(state.data.protocolId, state.data.count, state.data.version) : base;
    if (!p || p.rows.length !== state.data.count || row.testId !== tnDefinitionId(p)) notFound();
    const stored = row.testResultId ? await prisma.testResult.findFirst({ where: { id: row.testResultId, userId: user.id, testId: row.testId } }) : null;
    const canonical = stored ? tnComparableResult(row.testId, stored.score, stored.details) : null;
    const saved = canonical ? { success: true as const, data: canonical } : { success: false as const };
    if (row.status === "COMPLETED" && (!saved.success || saved.data.protocolId !== p.id || saved.data.count !== state.data.count)) notFound();
    let forslag = [] as ReturnType<typeof foreslaGodkjenteOvelser>;
    if (row.status === "COMPLETED" && saved.success && stored) {
      const facilities = await prisma.playerFacility.findMany({
        where: { userId: user.id },
        select: { capabilities: true, maksPuttLengdeM: true, rangeLengdeM: true },
      });
      forslag = foreslaGodkjenteOvelser({
        test: { id: row.testId, omraade: null },
        bank: hentGodkjenteOvelsesbankElementer(),
        fasiliteter: facilities,
        spillerKategori: null,
      });
    }
    // Integrasjonsvakt: en PÅGÅENDE økt en trener fører i en testdag er
    // samme TestSession-rad (userId = spilleren). Egenføringens redigerbare
    // scorecard skal ALDRI vises for den — spilleren ser en kort, read-only
    // beskjed i stedet. Et FULLFØRT resultat vises fortsatt normalt (det er
    // spillerens egen, ekte historikk).
    const testdagKobling = row.status === "IN_PROGRESS" ? await prisma.testDayParticipant.findFirst({ where: { sessionId: row.id, playerId: user.id, status: "PENDING", testDay: { status: "ACTIVE" } }, select: { id: true } }) : null;
    content = testdagKobling ? (
      <p>Denne økten hører til en testdag. <Link href={`?participant=${testdagKobling.id}`}>Fortsett registreringen</Link></p>
    ) : (
      <>
        <TnScorecard savedResult={saved.success ? saved.data : undefined} key={row.id} protocol={p} initial={{ sessionId: row.id, revision: state.data.revision, values: state.data.values, notes: state.data.notes, status: row.status }} />
        {row.status === "COMPLETED" && saved.success ? <ResultatKontekst /> : null}
        {row.status === "COMPLETED" && saved.success ? <section aria-label="Øvelsesforslag" style={{ borderTop: `1px solid var(--border-hairline)`, marginTop: 24, paddingTop: 20 }}>
          <h2>Øvelser å vurdere etter testen</h2>
          <p>Dette er ikke en diagnose eller automatisk endring i treningsplanen. Ta resultatet og forslagene med coachen.</p>
          {forslag.length ? <ul>{forslag.map(({ ovelse, kanLeggesTil, begrunnelse }) => <li key={ovelse.id} style={{ marginBlock: 16 }}>
            <strong>{ovelsesNavn(ovelse.navn)}</strong> · {ovelse.beskrivelse}
            <p>{kanLeggesTil ? "Fasilitet er bekreftet. " : ""}{begrunnelse}</p>
          </li>)}</ul> : <p>Ingen godkjent øvelse er koblet til denne testen ennå.</p>}
        </section> : null}
      </>
    );
  } else if (query.test) {
    if (query.local && !z.string().uuid().safeParse(query.local).success) notFound();
    const p = tnProtocol(query.test, query.count === undefined ? undefined : Number(query.count), query.version);
    if (!p) notFound();
    const localSessionId = query.local ?? crypto.randomUUID();
    content = p.variableCount && query.count === undefined
      ? <form><h1>{p.name}</h1><input type="hidden" name="test" value={p.id} /><label>Antall slag før start <input type="number" name="count" min={1} max={200} defaultValue={p.rows.length} /></label><button type="submit">Velg antall</button></form>
      : <TnScorecard key={`${p.id}-${p.rows.length}-${localSessionId}`} protocol={p} localSessionId={localSessionId} />;
  } else {
    const assignments = await prisma.testAssignment.findMany({ where: { playerId: user.id, status: "OPEN", testId: { startsWith: "tn-v3-" } }, orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }], select: { id: true, testId: true, dueDate: true, note: true } });
    const sessions = await prisma.testSession.findMany({ where: { userId: user.id, testId: { startsWith: "tn-v3-" } }, orderBy: { startedAt: "desc" }, take: 100 });
    const [testdagKoblinger, egneTestdager] = await Promise.all([
      prisma.testDayParticipant.findMany({ where: { sessionId: { in: sessions.map((s) => s.id) } }, select: { id: true, sessionId: true } }),
      prisma.testDayParticipant.findMany({ where: { playerId: user.id, status: "PENDING", testDay: { status: "ACTIVE" } }, orderBy: [{ testDay: { scheduledAt: "asc" } }, { order: "asc" }], include: { testDay: { include: { group: { select: { id: true, name: true } }, testDefinition: true } } } }),
    ]);
    const kobledeSessioner = new Map(testdagKoblinger.filter((k) => k.sessionId).map((k) => [k.sessionId!, k.id]));
    const aktiveGrupper = new Set((await prisma.groupMember.findMany({ where: { groupId: { in: [...new Set(egneTestdager.map((d) => d.testDay.groupId))] }, userId: user.id, ...aktivtSpillerMedlemskapWhere() }, select: { groupId: true } })).map((m) => m.groupId));
    const aktiveEgneTestdager = egneTestdager.filter((d) => aktiveGrupper.has(d.testDay.groupId));
    content = <><h1>Team Norway-tester</h1><p>Velg test og variant. Resultater fra denne utgaven holdes atskilt fra eldre testregler.</p><p>{TN_RULES_VERSION}</p>
      <h2>Pågående felles testdager</h2>{aktiveEgneTestdager.length === 0 ? <p>Ingen aktive testdagstildelinger.</p> : <ul>{aktiveEgneTestdager.map((d) => {
        const protocolId = (d.testDay.testDefinition.protocol as { protocolId?: string } | null)?.protocolId;
        const p = protocolId ? tnProtocol(protocolId, undefined, d.testDay.testDefinition.scoringRule ?? "") : null;
        return <li key={d.id}><Link href={`?participant=${d.id}`}>{d.testDay.title} · {p?.name ?? d.testDay.testDefinition.name}</Link> · {d.testDay.group.name} · {d.testDay.scheduledAt.toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo" })}</li>;
      })}</ul>}
      <h2>Tildelt av coach</h2>{assignments.length === 0 ? <p>Ingen åpne tildelinger.</p> : <ul>{assignments.map(a => {
        const p = tnFromDefinitionId(a.testId);
        if (!p || p.blocked) return null;
        return <li key={a.id}><Link href={`?test=${p.id}${p.variableCount ? `&count=${p.rows.length}` : ""}`}>{p.name} · {p.rows.length} forsøk</Link>{a.dueDate && <span> · Frist {a.dueDate.toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo" })}</span>}{a.note && <p>{a.note}</p>}</li>;
      })}</ul>}
      <TnLocalDrafts /><h2>Dine registreringer</h2>{sessions.length === 0 ? <p>Ingen registreringer ennå.</p> : <ul>{sessions.map(s => {
        const state = TnSessionSchema.safeParse(s.scoringData);
        if (!state.success) return null;
        const tekst = `${tnProtocol(state.data.protocolId, undefined, state.data.version)?.name ?? state.data.protocolId} · ${state.data.count} forsøk · ${s.status === "COMPLETED" ? "Fullført" : s.status === "ABORTED" ? "Ufullstendig" : "Utkast"} · ${s.startedAt.toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo" })}`;
        // Pågående testdag-førte økter er IKKE en lenke her — de kan ikke
        // redigeres i egenføring uansett (samme vakt som over).
        if (s.status === "IN_PROGRESS" && kobledeSessioner.has(s.id)) {
          return <li key={s.id}><Link href={`?participant=${kobledeSessioner.get(s.id)}`}>{tekst} · Fortsett testdagen</Link></li>;
        }
        return <li key={s.id}><Link href={`?session=${s.id}`}>{tekst}</Link></li>;
      })}</ul>}
      <h2>Testvarianter</h2><ul>{TN_CATALOG.map(p => <li key={p.id} style={{ paddingBlock: 8 }}><Link href={`?test=${p.id}`}>{p.name} · {p.rows.length} forsøk</Link>{p.blocked && <span> · råregistrering tilgjengelig, testregel avventes</span>}</li>)}</ul>
    </>;
  }
  const uleste = await prisma.notification.count({ where: { userId: user.id, readAt: null } });
  return <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}><div className="pa-side" style={{ maxWidth: 1120, margin: "auto" }}><Link href="/portal/tren/tester">Alle tester</Link>{content}</div></PlayerHQSkall>;
}
