/** Functional Excel-v3 registry and own-session history. Design remains under review. */
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { TN_CATALOG, TN_VERSION, tnProtocol } from "@/lib/portal-tester/tn-catalog";
import { TnSessionSchema } from "@/lib/portal-tester/tn-session";
import { TnResultSchema } from "@/lib/portal-tester/tn-scoring";
import { tnFromDefinitionId } from "@/lib/portal-tester/tn-integration";
import { TL } from "@/lib/v2/train-lock";
import { TnScorecard } from "./scorecard";

export const dynamic = "force-dynamic";
export default async function TeamNorwayTests({ searchParams }: { searchParams: Promise<{ test?: string; session?: string; count?: string }> }) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const query = await searchParams;
  let content;
  if (query.session) {
    const row = await prisma.testSession.findFirst({ where: { id: query.session, userId: user.id } });
    if (!row) notFound();
    const state = TnSessionSchema.safeParse(row.scoringData);
    if (!state.success) notFound();
    const base = tnProtocol(state.data.protocolId);
    const p = base?.variableCount ? tnProtocol(state.data.protocolId, state.data.count) : base;
    if (!p || p.rows.length !== state.data.count || row.testId !== `tn-v3-${p.id}`) notFound();
    const stored = row.testResultId ? await prisma.testResult.findFirst({ where: { id: row.testResultId, userId: user.id, testId: row.testId } }) : null;
    const saved = TnResultSchema.safeParse(stored?.details);
    if (row.status === "COMPLETED" && (!saved.success || saved.data.protocolId !== p.id || saved.data.count !== state.data.count)) notFound();
    content = <TnScorecard savedResult={saved.success ? saved.data : undefined} key={row.id} protocol={p} initial={{ sessionId: row.id, revision: state.data.revision, values: state.data.values, notes: state.data.notes, status: row.status }} />;
  } else if (query.test) {
    const p = tnProtocol(query.test, query.count === undefined ? undefined : Number(query.count));
    if (!p) notFound();
    content = p.variableCount && query.count === undefined
      ? <form><h1>{p.name}</h1><input type="hidden" name="test" value={p.id} /><label>Antall slag før start <input type="number" name="count" min={1} max={200} defaultValue={p.rows.length} /></label><button type="submit">Velg antall</button></form>
      : <TnScorecard key={`${p.id}-${p.rows.length}`} protocol={p} />;
  } else {
    const assignments = await prisma.testAssignment.findMany({ where: { playerId: user.id, status: "OPEN", testId: { startsWith: "tn-v3-" } }, orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }], select: { id: true, testId: true, dueDate: true, note: true } });
    const sessions = await prisma.testSession.findMany({ where: { userId: user.id, testId: { startsWith: "tn-v3-" } }, orderBy: { startedAt: "desc" }, take: 100 });
    content = <><h1>Team Norway-tester</h1><p>Velg test og variant. Resultater fra denne utgaven holdes atskilt fra eldre testregler.</p><p>{TN_VERSION}</p>
      <h2>Tildelt av coach</h2>{assignments.length === 0 ? <p>Ingen åpne tildelinger.</p> : <ul>{assignments.map(a => {
        const p = tnFromDefinitionId(a.testId);
        if (!p || p.blocked) return null;
        return <li key={a.id}><Link href={`?test=${p.id}${p.variableCount ? `&count=${p.rows.length}` : ""}`}>{p.name} · {p.rows.length} forsøk</Link>{a.dueDate && <span> · Frist {a.dueDate.toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo" })}</span>}{a.note && <p>{a.note}</p>}</li>;
      })}</ul>}
      <h2>Dine registreringer</h2>{sessions.length === 0 ? <p>Ingen registreringer ennå.</p> : <ul>{sessions.map(s => {
        const state = TnSessionSchema.safeParse(s.scoringData);
        if (!state.success) return null;
        return <li key={s.id}><Link href={`?session=${s.id}`}>{tnProtocol(state.data.protocolId)?.name ?? state.data.protocolId} · {state.data.count} forsøk · {s.status === "COMPLETED" ? "Fullført" : s.status === "ABORTED" ? "Ufullstendig" : "Utkast"} · {s.startedAt.toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo" })}</Link></li>;
      })}</ul>}
      <h2>Testvarianter</h2><ul>{TN_CATALOG.map(p => <li key={p.id} style={{ paddingBlock: 8 }}><Link href={`?test=${p.id}`}>{p.name} · {p.rows.length} forsøk</Link>{p.blocked && <span> · råregistrering tilgjengelig, testregel avventes</span>}</li>)}</ul>
    </>;
  }
  return <main style={{ background: TL.scene, color: TL.text, fontFamily: TL.font.sans, minHeight: "100dvh", padding: 20 }}><div style={{ maxWidth: 1120, margin: "auto" }}><Link href="/portal/tren/tester">Alle tester</Link>{content}</div></main>;
}
