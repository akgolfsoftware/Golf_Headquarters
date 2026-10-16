/**
 * Kø — AG-02 i Precision Athletics (/admin/ko).
 *
 * Én samlet adresse for alt som venter på beslutning fra trener/admin:
 * godkjenninger, agentforslag (AgenticOS), tester, dubletter, moderering og e-post.
 *
 * Erstatter Train-lock-skallet (V2Shell/TL) med Precision Athletics (AgencyOSSkall og AG02Ko).
 *
 * Knappene kaller de samme server actionene som de gamle kø-komponentene
 * (se src/components/admin/precision/ag02-handlinger.ts). Tom kø gir ekte tom
 * tilstand — aldri demodata. Fanene følger capability-reglene i faner.ts:
 * mangler du capability, finnes fanen ikke.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { canUser } from "@/lib/auth/effective-capabilities";
import { Capability } from "@/lib/auth/cbac";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG02Ko, type AG02Data } from "@/components/admin/precision/AG02Ko";
import type { KoFaneId } from "@/lib/admin/ko/faner";
import { lastGodkjenninger } from "@/lib/admin/ko/last-godkjenninger";
import { lastAgenticosKo } from "@/lib/agencyos/last-agenticos";
import { lastForeslatteTester } from "@/lib/admin/ko/last-foreslatte-tester";
import { lastDubletter } from "@/lib/admin/ko/last-dubletter";
import { lastModerering } from "@/lib/admin/ko/last-moderering";
import { synligeFaner, velgFane } from "@/lib/admin/ko/faner";
import { ukenummer } from "@/lib/uke-helpers";
import type { AdminGodkjenningV2Row } from "@/components/admin/v2/AdminGodkjenningerV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kø · AgencyOS" };

export default async function KoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const coach = { id: user.id, role: user.role };
  const sp = await searchParams;
  const onsket = Array.isArray(sp.fane) ? sp.fane[0] : sp.fane;

  const [kanAgenter, kanTester] = await Promise.all([
    canUser(user, Capability.USE_AGENTS),
    canUser(user, Capability.MANAGE_TESTS),
  ]);
  const harCapability = (c: Capability) =>
    c === Capability.USE_AGENTS ? kanAgenter : c === Capability.MANAGE_TESTS ? kanTester : false;

  const faner = synligeFaner(harCapability);
  const aktiv = velgFane(onsket, faner);

  // Agent-kø og agent-godkjenning viser de samme PlanAction-sakene og er én fane i AG-02.
  const tilAg02Fane = (id: KoFaneId): keyof AG02Data => (id === "agentgodkjenn" ? "agentko" : id);
  const ag02Faner = [...new Set(faner.map((f) => tilAg02Fane(f.id)))];

  const datoFmt = new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const [godkjennRes, agentkoRes, testerRes, dubletterRes, modereringRes] = await Promise.all([
    lastGodkjenninger(coach).catch(() => ({ rows: [] })),
    kanAgenter ? lastAgenticosKo(user).catch(() => null) : Promise.resolve(null),
    kanTester ? lastForeslatteTester().catch(() => ({ forslag: [] })) : Promise.resolve({ forslag: [] }),
    lastDubletter().catch(() => []),
    lastModerering().catch(() => ({ saker: [] })),
  ]);

  const naa = new Date();
  const dag = new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(naa);
  const dagLabel = `${dag.charAt(0).toUpperCase()}${dag.slice(1)} · uke ${ukenummer(naa)}`;

  const rows: AdminGodkjenningV2Row[] = (godkjennRes as { rows?: AdminGodkjenningV2Row[] })?.rows || [];

  const data: AG02Data = {
    godkjenninger: rows.map((r: AdminGodkjenningV2Row) => ({
      id: r.id,
      who: r.who,
      title: r.title,
      kind: r.actionType,
      from: r.kilde ?? "Kø",
      at: r.when,
      status: r.urgent ? "Haster" : r.lowRisk ? "Lav risiko" : "Venter",
      due: r.when,
      sum: r.detail,
      lines: r.diffPreview ? [["Endring", r.diffPreview, ""]] : undefined,
      kilde: r.kilde ?? "agent",
    })),
    agentko: (agentkoRes?.venter || []).map((it) => ({
      id: it.id,
      who: "AgenticOS",
      title: it.tittel,
      agent: it.meta ?? "Agent",
      t: "I dag",
      body: it.tittel,
      facts: [
        ["Kategori", it.filterTekst],
        ["Lenke", it.lenkeLabel],
      ],
      out: it.tittel,
      axis: "tek",
    })),
    tester: (testerRes.forslag || []).map((t) => ({
      id: t.id,
      who: t.forfatter || "Spiller",
      test: t.navn || "Test",
      src: "Spiller",
      at: t.opprettet || "—",
      beskrivelse: t.beskrivelse ?? undefined,
      scoring: t.scoring || undefined,
    })),
    dubletter: dubletterRes.map((d) => {
      const topp = d.forslag[0] ?? null;
      return {
        id: d.manual.id,
        match: topp ? `Mulig dublett av «${topp.name}»` : "Ingen automatisk match",
        kildeId: d.manual.id,
        malId: topp?.id ?? null,
        a: {
          name: d.manual.name,
          dato: datoFmt.format(new Date(d.manual.startDate)),
          bane: d.manual.location ?? "—",
          pamelding: String(d.manual.antallEntries),
          resultater: String(d.manual.antallResults),
          src: "Manuell",
        },
        b: (topp
          ? {
              name: topp.name,
              dato: datoFmt.format(new Date(topp.startDate)),
              bane: topp.location ?? "—",
              pamelding: String(topp.antallEntries),
              resultater: String(topp.antallResults),
              src: topp.sourceOrigin ?? "—",
            }
          : { src: "—" }) as Record<string, string>,
      };
    }),
    moderering: (modereringRes.saker || []).map((m) => ({
      id: m.id,
      where: m.mal ?? "—",
      who: m.spillerNavn,
      reason: m.begrunnelse ?? "—",
      at: m.mottatt,
      text: "",
      type: m.type,
      status: m.status === "APPROVED" ? ("APPROVED" as const) : ("OPEN" as const),
    })),
    epost: [],
  };

  const totaltVenter =
    data.godkjenninger.length +
    data.agentko.length +
    data.tester.length +
    data.dubletter.length +
    data.moderering.length;

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"} uleste={totaltVenter}>
      <AG02Ko
        tilstand="data"
        dagLabel={dagLabel}
        startFane={aktiv ?? "godkjenninger"}
        faner={ag02Faner}
        data={data}
      />
    </AgencyOSSkall>
  );
}
