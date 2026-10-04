/**
 * Kø — AG-02 i Precision Athletics (/admin/ko).
 *
 * Én samlet adresse for alt som venter på beslutning fra trener/admin:
 * godkjenninger, agentforslag (AgenticOS), tester, dubletter, moderering og e-post.
 *
 * Erstatter Train-lock-skallet (V2Shell/TL) med Precision Athletics (AgencyOSSkall og AG02Ko).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { canUser } from "@/lib/auth/effective-capabilities";
import { Capability } from "@/lib/auth/cbac";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG02Ko, type AG02Data } from "@/components/admin/precision/AG02Ko";
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
      at: t.opprettet || "Nylig",
      done: 0,
      of: 1,
      result: "Foreslått test",
    })),
    dubletter: dubletterRes.map((d) => ({
      id: d.manual.id,
      match: `Overlapp: ${d.forslag[0]?.name ?? "Mulig dublett"}`,
      a: {
        name: d.manual.name,
        born: "—",
        email: d.manual.createdByEmail ?? "—",
        phone: "—",
        club: "—",
        parent: "—",
        src: "Manuell",
      },
      b: {
        name: d.forslag[0]?.name ?? "—",
        born: "—",
        email: "—",
        phone: "—",
        club: "—",
        parent: "—",
        src: d.forslag[0]?.sourceOrigin ?? "Kanonisk kilde",
      },
    })),
    moderering: (modereringRes.saker || []).map((m) => ({
      id: m.id,
      where: m.mal ?? "Innlegg",
      who: m.spillerNavn,
      reason: m.begrunnelse ?? "Varslet innhold",
      at: m.mottatt,
      text: m.begrunnelse ?? "",
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
        data={data}
      />
    </AgencyOSSkall>
  );
}
