/**
 * AgencyOS · Uka (v2) — 7-dagers kanban med bookinger gruppert per dag.
 * V2-port av src/app/admin/(legacy)/agencyos/uka/page.tsx. Samme datalogikk
 * (ukevindu, KPI-beregning, per-dag-gruppering) — kun rekomponert med
 * v2-primitiver i V2Shell (AGENCYOS_NAV).
 *
 * Server component.
 */

import { TilbakeLenke } from "@/components/v2";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminUkaV2, type AdminUkaV2Data, type UkaDagV2 } from "@/components/admin/v2/AdminUkaV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Uka · AgencyOS (v2)" };

const DAGNAVN_KORT = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"];
const DAGNAVN_LANG = ["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"];

function ukeNummer(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / (7 * 24 * 3600 * 1000));
}

export default async function V2UkaPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const now = new Date();
  const idag = new Date(now);
  idag.setHours(0, 0, 0, 0);
  const mandag = new Date(idag);
  mandag.setDate(idag.getDate() - ((idag.getDay() + 6) % 7));
  const sondag = new Date(mandag);
  sondag.setDate(mandag.getDate() + 7);

  const bookinger = await prisma.booking.findMany({
    where: {
      startAt: { gte: mandag, lt: sondag },
      status: { in: ["CONFIRMED", "PENDING"] },
    },
    orderBy: { startAt: "asc" },
    include: { user: true, serviceType: true, location: true },
  });

  const dager: UkaDagV2[] = Array.from({ length: 7 }, (_, i) => {
    const dato = new Date(mandag);
    dato.setDate(mandag.getDate() + i);
    const erIdag = dato.getTime() === idag.getTime();
    const erHelg = i >= 5;
    const events = bookinger.filter((b) => {
      const bd = new Date(b.startAt);
      bd.setHours(0, 0, 0, 0);
      return bd.getTime() === dato.getTime();
    });
    return {
      key: dato.toISOString(),
      kortNavn: DAGNAVN_KORT[i],
      langNavn: DAGNAVN_LANG[i],
      dato: dato.toISOString(),
      erIdag,
      erHelg,
      bookinger: events.map((e) => ({
        id: e.id,
        time: e.startAt.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" }),
        durMin: Math.round((e.endAt.getTime() - e.startAt.getTime()) / (1000 * 60)),
        navn: e.user?.name ?? e.guestName ?? "Gjest",
        tjeneste: e.serviceType.name,
      })),
    };
  });

  const totalTimer = bookinger.reduce(
    (sum, b) => sum + (b.endAt.getTime() - b.startAt.getTime()) / (1000 * 60 * 60),
    0,
  );
  const unikeSpillere = new Set(bookinger.map((b) => b.userId)).size;
  const kapasitet = 28; // mål
  const kapasitetPct = Math.round((totalTimer / kapasitet) * 100);

  const sluttDato = new Date(sondag);
  sluttDato.setDate(sluttDato.getDate() - 1);

  const data: AdminUkaV2Data = {
    ukeNummer: ukeNummer(mandag),
    periodeLabel: `${mandag.getDate()}.–${sluttDato.getDate()}. ${sluttDato.toLocaleDateString("nb-NO", { month: "short" })}`,
    timerTotalt: Math.round(totalTimer),
    kapasitetMaal: kapasitet,
    antallBookinger: bookinger.length,
    unikeSpillere,
    kapasitetPct,
    dager,
  };

  return (
    <V2Shell aktiv="uka" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/agencyos">Cockpit</TilbakeLenke>
      <AdminUkaV2 data={data} />
    </V2Shell>
  );
}
