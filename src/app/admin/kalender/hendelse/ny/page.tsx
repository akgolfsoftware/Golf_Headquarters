/**
 * Ny kalenderhendelse (ferie, stengt anlegg, møte) i Precision, 29.09.2026.
 * Leser ?start= («YYYY-MM-DDTHH:mm», samme param som «Ny booking») og
 * forhåndsutfyller start. Samme opprettHendelse som før.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { KnappLenke } from "@/components/precision/pa";
import { Side, SideHode } from "@/components/precision/pa-a4";
import { HendelseSkjema } from "@/components/admin/precision/AG05Hendelse";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ny hendelse · AgencyOS" };

type SearchParams = Promise<{ start?: string }>;

function dagensDatoOgTid(): { dato: string; tid: string } {
  const naa = new Date();
  const dato = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(naa);
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Oslo", hour: "2-digit", hourCycle: "h23" }).format(naa);
  return { dato, tid: `${time.padStart(2, "0")}:00` };
}

function pluss60(tid: string): string {
  const [h, m] = tid.split(":").map(Number);
  const t = Math.min(23 * 60 + 45, h * 60 + m + 60);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

export default async function NyHendelsePage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { start } = await searchParams;
  const m = start ? /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(start) : null;
  const { dato, tid } = m ? { dato: m[1], tid: m[2] } : dagensDatoOgTid();

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <Side max={760}>
        <SideHode
          kicker="Kalender · ny hendelse"
          title="Ny hendelse"
          sub="Ferie, stengt anlegg eller møte. Tiden blokkeres for booking."
          actions={<KnappLenke href="/admin/kalender" variant="ghost">Til kalenderen</KnappLenke>}
        />
        <HendelseSkjema start={{ tittel: "", startDato: dato, startTid: tid, sluttDato: dato, sluttTid: pluss60(tid), notat: "" }} />
      </Side>
    </AgencyOSSkall>
  );
}
