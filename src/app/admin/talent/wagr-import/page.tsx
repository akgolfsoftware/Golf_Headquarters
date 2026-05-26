/**
 * /admin/talent/wagr-import — WAGR-import-side
 *
 * Enkel oppsummering + import-knapp for WAGR (World Amateur Golf Ranking).
 */

import { Download, RefreshCw, Trophy, Users } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { HubFrame, HubHeader, HubStatSep, HubCard, HubPill } from "@/components/hubs";

export const dynamic = "force-dynamic";

export default async function WagrImportPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <HubFrame>
      <HubHeader
        eyebrow="COACHHQ · TALENT · WAGR"
        title="WAGR"
        titleItalic="-import"
        sub="World Amateur Golf Ranking — importer norske spillere og benchmark mot kohort."
        actions={
          <>
            <button className="hub-btn btn-outline" type="button">
              <RefreshCw size={13} strokeWidth={1.75} aria-hidden /> Oppdater
            </button>
            <button className="hub-btn btn-forest" type="button">
              <Download size={13} strokeWidth={2} aria-hidden /> Kjør import
            </button>
          </>
        }
        stats={
          <>
            <span>
              <strong>87</strong> hits sist import
            </span>
            <HubStatSep />
            <span>
              <strong>14</strong> norske matchet
            </span>
            <HubStatSep />
            <span className="ok-dot">
              <span />
              <strong>Sist 23. mai</strong>
            </span>
          </>
        }
      />

      <section className="hub-grid">
        <HubCard
          icon={Trophy}
          eyebrow="01 · STATUS"
          title="Siste import"
          data="23. mai · 14:32"
          sub="87 spillere · 14 norske · 9 matchet stall"
          statusPill={
            <HubPill kind="ok" dot="d-ok">
              SUCCESS
            </HubPill>
          }
          cta="Se logger →"
        />
        <HubCard
          href="/admin/talent/wagr-benchmark"
          icon={Users}
          eyebrow="02 · KOHORT"
          title="Benchmark"
          data="A1-klassen · 87 spillere"
          sub="Norske gjennomsnitt vs WAGR top 100"
          cta="Se sammenligning →"
        />
        <HubCard
          icon={Download}
          eyebrow="03 · EKSPORT"
          title="Eksporter data"
          data="CSV · JSON · Excel"
          sub="Full ranking-data + posisjons-historikk"
          cta="Eksporter →"
        />
      </section>
    </HubFrame>
  );
}
