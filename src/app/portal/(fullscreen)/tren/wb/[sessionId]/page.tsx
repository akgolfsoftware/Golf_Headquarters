/**
 * Spillerens økt-ark for en Workbench-økt (Loop 3S, natt-plan 25.08.2026).
 * Start / Fullfør / Hopp over på en publisert økt. Aldri DRAFT — usynlig
 * eller «Fant ikke økten» er identiske svar (unngår å lekke at et utkast
 * finnes, CLAUDE.md invariant 3).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadPlayerSession } from "@/lib/workbench/wb-actions";
import { UI } from "@/lib/domain/workbench/labels";
import { T } from "@/lib/v2/tokens";
import { Icon, Knapp } from "@/components/v2";
import { OktArk } from "@/components/portal/workbench/OktArk";

export const dynamic = "force-dynamic";

export default async function WorkbenchOktPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  await requirePortalUser({ allow: ["PLAYER"] });
  const { sessionId } = await params;
  const res = await loadPlayerSession(sessionId);

  return (
    <div style={{ minHeight: "100dvh", background: T.bg, color: T.fg, fontFamily: T.ui }}>
      <div
        className="mx-auto w-full max-w-[460px] px-4 pb-8 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6"
        style={{ paddingTop: "calc(12px + env(safe-area-inset-top))" }}
      >
        {!res.ok ? (
          <TilstandKort ikon="triangle-alert" tittel="Kunne ikke hente økten" tekst={res.error} />
        ) : !res.data ? (
          <TilstandKort ikon="eye" tittel={UI.sessionNotFoundTitle} tekst={UI.sessionNotFoundBody} />
        ) : (
          <OktArk session={res.data} />
        )}
      </div>
    </div>
  );
}

function TilstandKort({ ikon, tittel, tekst }: { ikon: "triangle-alert" | "eye"; tittel: string; tekst: string }) {
  return (
    <div
      role="alert"
      style={{
        display: "grid",
        gap: 12,
        justifyItems: "center",
        textAlign: "center",
        padding: "64px 20px",
        maxWidth: 460,
        margin: "0 auto",
      }}
    >
      <Icon name={ikon} size={22} style={{ color: T.mut }} />
      <div style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>{tittel}</div>
      <div style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, maxWidth: 340 }}>{tekst}</div>
      <a href="/portal" style={{ textDecoration: "none" }}>
        <Knapp>{UI.backToToday}</Knapp>
      </a>
    </div>
  );
}
