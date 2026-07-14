/**
 * I3 (Bølge 1) — opprett kalenderhendelse. Leser ?start= (samme param
 * HurtigOpprett allerede bruker for "Ny booking") og forhåndsutfyller
 * start-dato/tid i skjemaet.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke, Tittel } from "@/components/v2";
import { HendelseForm } from "./hendelse-form";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ start?: string }>;

function dagensDatoOgTid(): { dato: string; tid: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    dato: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    tid: `${pad(now.getHours())}:00`,
  };
}

export default async function NyHendelsePage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { start } = await searchParams;

  const fallback = dagensDatoOgTid();
  const [dato, tid] = start?.includes("T") ? start.split("T") : [fallback.dato, fallback.tid];

  return (
    <V2Shell aktiv="kalender" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/kalender">Kalender</TilbakeLenke>
      <div style={{ marginTop: 12, marginBottom: 20 }}>
        <Tittel mobile={false}>Ny hendelse</Tittel>
      </div>
      <HendelseForm startDato={dato} startKlokkeslett={tid} />
    </V2Shell>
  );
}
