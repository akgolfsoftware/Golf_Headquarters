/**
 * PlayerHQ · Utenfor banen (/portal/utenfor-banen) — Paper-port W2 (fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-hjem-rest.html
 * (rute per manifest-w2-komplett.md rad 13).
 *
 * Hub med tre faner (Fysisk · Lag · Utfordringer) nådd fra I dag. Alle data
 * fra EKSISTERENDE kilder: dagens FYS-økt + uka fra TrainingPlanSession
 * (samme spørring som /portal/tren/fys-plan), øvelsene fra getFysiskData
 * (fysisk-loggeren), venner fra hentVennerData (B39), utfordringer fra
 * DrillChallenge-spørringen på /portal/utfordringer. Ingen fabrikkering:
 * fasitens delte SG-tall i Lag-fanen finnes ikke i datamodellen (B39: venner
 * ser aldri tall) — fanen viser HCP/kategori i stedet, med personvern-forklar.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getFysiskData } from "@/lib/portal-fysisk/fysisk-data";
import { hentVennerData } from "@/lib/venner/actions";
import { startOfDay, endOfDay, startOfWeek, ukenummer } from "@/lib/uke-helpers";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { UtenforBanenV2, type UtenforBanenData, type UkeDagStatus } from "@/components/portal/v2/UtenforBanenV2";

export const dynamic = "force-dynamic";

const OSLO_TID = new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Oslo",
});
const OSLO_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "long",
  timeZone: "Europe/Oslo",
});
/** Ukedag-indeks i Oslo (0 = mandag … 6 = søndag). */
function osloDagIndeks(d: Date): number {
  const kort = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "Europe/Oslo" }).format(d);
  const idx = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(kort);
  return idx === -1 ? 0 : idx;
}

export default async function UtenforBanenPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const idag = new Date();
  const ukeStart = startOfWeek(idag);
  const ukeSlutt = new Date(ukeStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [fysUke, dagensFys, fysisk, venner, utfordringer] = await Promise.all([
    // Ukas FYS-økter — samme kilde som fys-plan-fasiten («Én ting nå», akse FYS).
    prisma.trainingPlanSession.findMany({
      where: {
        plan: { userId: user.id },
        pyramidArea: "FYS",
        scheduledAt: { gte: ukeStart, lt: ukeSlutt },
      },
      orderBy: { scheduledAt: "asc" },
      select: { id: true, scheduledAt: true, status: true },
    }),
    prisma.trainingPlanSession.findFirst({
      where: {
        plan: { userId: user.id },
        pyramidArea: "FYS",
        status: "PLANNED",
        scheduledAt: { gte: startOfDay(idag), lte: endOfDay(idag) },
      },
      orderBy: { scheduledAt: "asc" },
      select: { id: true, title: true, scheduledAt: true, durationMin: true, location: true },
    }),
    getFysiskData(user.id),
    hentVennerData(),
    // Samme spørring som /portal/utfordringer (eier eller deltaker).
    prisma.drillChallenge.findMany({
      where: {
        OR: [{ ownerId: user.id }, { participants: { some: { userId: user.id } } }],
      },
      include: {
        owner: { select: { id: true, name: true } },
        participants: { select: { id: true, userId: true, score: true, rank: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Uke-grid: én status per dag (gjennomført vinner over planlagt).
  const uke: UkeDagStatus[] = Array.from({ length: 7 }, () => "" as UkeDagStatus);
  for (const s of fysUke) {
    const i = osloDagIndeks(s.scheduledAt);
    if (s.status === "COMPLETED") uke[i] = "gjort";
    else if (uke[i] !== "gjort") uke[i] = "planlagt";
  }
  const gjortAntall = uke.filter((d) => d === "gjort").length;
  const planlagtAntall = fysUke.length;

  const aktive = utfordringer.filter((u) => u.status === "ACTIVE");

  const data: UtenforBanenData = {
    ukeNr: ukenummer(idag),
    uke,
    gjortAntall,
    planlagtAntall,
    dagensFys: dagensFys
      ? {
          id: dagensFys.id,
          tittel: dagensFys.title,
          tid: OSLO_TID.format(dagensFys.scheduledAt),
          varighetMin: dagensFys.durationMin,
          sted: dagensFys.location,
        }
      : null,
    okt: fysisk.okt
      ? {
          navn: fysisk.okt.navn,
          varighetMin: fysisk.okt.varighetMin,
          ovelser: [
            ...fysisk.okt.styrke.map((o) => {
              const s0 = o.startSett[0];
              return {
                navn: o.navn,
                meta: s0
                  ? `${o.startSett.length} × ${s0.reps}${s0.vekt > 0 ? ` · ${s0.vekt} kg` : ""}`
                  : o.muskelgrupper.join(" · ") || "Styrke",
              };
            }),
            ...fysisk.okt.intervaller.map((i) => ({
              navn: i.navn,
              meta: `${i.serier} × ${i.minutter} min · ${i.sone}`,
            })),
          ],
        }
      : null,
    venner: venner.venner.map((v) => ({
      id: v.id,
      navn: v.name,
      hcp: v.hcp,
      kategori: v.kategori,
    })),
    utfordringer: aktive.map((u) => {
      const min = u.participants.find((p) => p.userId === user.id);
      return {
        id: u.id,
        navn: u.name,
        beskrivelse: u.description,
        deltakere: u.participants.length,
        slutt: u.endAt ? `Til ${OSLO_DATO.format(u.endAt)}` : null,
        minRank: min?.rank ?? null,
        minScore: min?.score ?? null,
      };
    }),
  };

  return (
    <V2Shell bredde="kolonne" aktiv="hjem" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal">I dag</TilbakeLenke>
      <UtenforBanenV2 data={data} />
    </V2Shell>
  );
}
