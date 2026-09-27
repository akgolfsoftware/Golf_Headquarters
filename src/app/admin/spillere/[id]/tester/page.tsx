/**
 * AgencyOS — coach-view av en spillers tester (/admin/spillere/[id]/tester),
 * v2-design (retning C).
 *
 * Auth + dataloader gjenbrukt 1:1 fra den forrige (legacy) siden:
 * requirePortalUser (ADMIN/COACH) + loadSpillerTesterData. Spiller-id kommer
 * fra ruten (params.id) — notFound() hvis ingen data finnes.
 *
 * Server component.
 */

import { prisma } from "@/lib/prisma";
import { tnHistorikkRader } from "@/lib/portal-tester/tn-historikk";
import { tnProtocol } from "@/lib/portal-tester/tn-catalog";
import { tnFormat } from "@/lib/portal-tester/tn-scoring";
import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadSpillerTesterData } from "@/lib/admin/spiller-tester-data";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminSpillerTesterV2 } from "@/components/admin/v2/AdminSpillerTesterV2";
import Link from "next/link";
import { TestOvelseValg } from "@/components/admin/test-ovelse-valg";
import { loadTestFollowup } from "@/lib/portal-tester/test-followup-data";
import { ovelsesNavn } from "@/lib/portal-tester/test-anbefaling";
import { workbenchUrl } from "@/lib/workbench/visning-url";
import { ResultatKontekst } from "@/components/tester/ResultatKontekst";

export const dynamic = "force-dynamic";

export default async function SpillerTesterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;

  const data = await loadSpillerTesterData(id, user);
  if (!data) notFound();
  const followup = await loadTestFollowup(id, user);
  if (!followup) notFound();
  const results = await prisma.testResult.findMany({ where: { userId: id, testId: { startsWith: "tn-v3-" } }, select: { id: true, testId: true, score: true, details: true, takenAt: true }, orderBy: { takenAt: "desc" }, take: 100 });
  const historikk = tnHistorikkRader(results);

  return (
    <V2Shell bredde="kolonne" aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminSpillerTesterV2 data={data} playerId={id} />
      <section aria-label="Testdager og oppfølging" className="mx-auto w-full max-w-[960px] space-y-6 py-6">
        <h2 className="text-xl font-semibold">Testdager og oppfølging</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold">Testdager i planen</h3>
            {followup.testdager.length ? <ul className="mt-2 space-y-2">{followup.testdager.map((day) => (
              <li key={day.id} className="border-b py-2 text-sm">
                {day.date.toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo" })} · {day.title} · {day.status === "COMPLETED" ? "Gjennomført" : "Planlagt"}
              </li>
            ))}</ul> : <p className="mt-2 text-sm">Ingen testdag er lagt i årsplanens kalender i år.</p>}
          </div>
          <div>
            <h3 className="font-semibold">Tildelte tester</h3>
            {followup.tildelinger.length ? <ul className="mt-2 space-y-2">{followup.tildelinger.map((assignment) => (
              <li key={assignment.id} className="border-b py-2 text-sm">
                {assignment.test.name} · {assignment.dueDate ? `Frist ${assignment.dueDate.toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo" })}` : "Uten frist"}
              </li>
            ))}</ul> : <p className="mt-2 text-sm">Ingen åpne testtildelinger.</p>}
            <p className="mt-2 text-xs">En frist er ikke en tidsfestet testdag.</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Resultater og øvelsesforslag</h3>
          {followup.rader.length ? <ul className="mt-2 divide-y">{followup.rader.map((row) => (
            <li key={row.id} className="py-4">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <strong>{row.testNavn}</strong>
                <span>{row.score}</span>
                <span className="text-sm">{row.dato.toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo" })}</span>
              </div>
              <p className="mt-1 text-sm">{row.trend === "IKKE_SAMMENLIGNBAR" ? "Ingen sikker sammenligning med tidligere resultat." : row.trend === "LIKT" ? "Lik score som forrige sammenlignbare test." : `${row.trend === "HOYERE" ? "Høyere" : "Lavere"} score enn forrige sammenlignbare test. Dette er ikke et nivåvarsel.`}</p>
              <div className="mt-3"><ResultatKontekst /></div>
              {row.forslag.length ? <ul className="mt-3 space-y-4">{row.forslag.map(({ ovelse, kanLeggesTil, begrunnelse }) => {
                const sessions = followup.futureSessions.filter((s) => s.environment && ovelse.environment.includes(s.environment));
                return <li key={ovelse.id} className="border-l-2 pl-3">
                  <strong className="text-sm">{ovelsesNavn(ovelse.navn)}</strong>
                  <p className="text-sm">{ovelse.beskrivelse}</p>
                  <p className="text-xs">{begrunnelse}</p>
                  {kanLeggesTil && sessions.length ? <TestOvelseValg playerId={id} resultId={row.id} ovelseId={ovelse.id} sessions={sessions.map((s) => ({ id: s.id, label: `${s.date.toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo" })} · ${s.title}` }))} /> : null}
                  {kanLeggesTil && !sessions.length ? <Link className="text-sm underline" href={workbenchUrl(id, "uke", {})}>Opprett et fremtidig øktutkast i Workbench</Link> : null}
                </li>;
              })}</ul> : <p className="mt-2 text-sm">Ingen godkjent øvelse er koblet til dette testområdet ennå. Coachen vurderer videre trening.</p>}
            </li>
          ))}</ul> : <p className="mt-2 text-sm">Ingen testresultater registrert. Et testforslag kommer først etter et resultat.</p>}
        </div>
      </section>
      <section aria-label="Team Norway-resultater"><h2>Team Norway-resultater</h2>
        {historikk.length === 0 ? <p>Ingen resultater fra den nye testutgaven.</p> : <ul>{historikk.map(row => {
          return <li key={row.id}>{tnProtocol(row.protocolId)?.name} · {row.count} forsøk · {tnFormat({ value: row.score, unit: row.unit })} · {row.takenAt.toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo" })}</li>;
        })}</ul>}
      </section>
    </V2Shell>
  );
}
