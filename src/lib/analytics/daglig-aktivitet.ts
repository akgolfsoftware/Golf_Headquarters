/**
 * Daglig aktiv-måling (STEG 16.3, grillingen 1.7). Aktivering og frafall
 * skal måles fra dag én av betalt drift, ikke gjettes.
 *
 * registrerDagligAktivitet skrives fra portal-rot-layouten ved hver
 * innlasting av /portal (dermed alle undersider) — idempotent, maks én rad
 * per bruker per Oslo-kalenderdag. hentBruksmaaling leser den tilbake til
 * "X brukte appen i går / denne uka / ikke åpnet på 30 dager"-tallene og en
 * 30-dagers dagsserie (samme form som AdminReachV2Data.daglig, som allerede
 * har en ferdig sparkline-komponent — se AdminReachV2.tsx — men venter på en
 * Train-lock-fasit for kortet før den kobles til en skjerm).
 */
import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/uke-helpers";

export async function registrerDagligAktivitet(userId: string): Promise<void> {
  const dato = startOfDay(new Date());
  await prisma.dailyActiveUser
    .upsert({
      where: { userId_dato: { userId, dato } },
      create: { userId, dato },
      update: {},
    })
    .catch(() => null);
}

export interface Bruksmaaling {
  totaltSpillere: number;
  aktivIGar: number;
  aktivDenneUka: number;
  ikkeApnet30d: number;
  daglig: { dato: string; aktive: number }[];
}

function tilDatoStreng(d: Date): string {
  // en-CA gir YYYY-MM-DD, samme mønster som uke-helpers.ts sin osloDatoFormatter.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(d);
}

export async function hentBruksmaaling(): Promise<Bruksmaaling> {
  const iDag = startOfDay(new Date());
  const iGar = new Date(iDag);
  iGar.setDate(iGar.getDate() - 1);
  const sjuDagerSiden = new Date(iDag);
  sjuDagerSiden.setDate(sjuDagerSiden.getDate() - 6);
  const trettiDagerSiden = new Date(iDag);
  trettiDagerSiden.setDate(trettiDagerSiden.getDate() - 29);

  const [totaltSpillere, spillerIder] = await Promise.all([
    prisma.user.count({ where: { role: "PLAYER", deletedAt: null } }),
    prisma.user.findMany({ where: { role: "PLAYER", deletedAt: null }, select: { id: true } }),
  ]);
  const spillerIdSet = new Set(spillerIder.map((s) => s.id));

  const rader = await prisma.dailyActiveUser.findMany({
    where: { userId: { in: [...spillerIdSet] }, dato: { gte: trettiDagerSiden, lte: iDag } },
    select: { userId: true, dato: true },
  });

  const perDato = new Map<string, Set<string>>();
  const aktive30d = new Set<string>();
  const aktiveIGar = new Set<string>();
  const aktive7d = new Set<string>();
  for (const r of rader) {
    const key = tilDatoStreng(r.dato);
    if (!perDato.has(key)) perDato.set(key, new Set());
    perDato.get(key)!.add(r.userId);
    aktive30d.add(r.userId);
    if (r.dato.getTime() === iGar.getTime()) aktiveIGar.add(r.userId);
    if (r.dato.getTime() >= sjuDagerSiden.getTime()) aktive7d.add(r.userId);
  }

  const daglig: { dato: string; aktive: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(trettiDagerSiden);
    d.setDate(d.getDate() + i);
    const key = tilDatoStreng(d);
    daglig.push({ dato: key, aktive: perDato.get(key)?.size ?? 0 });
  }

  return {
    totaltSpillere,
    aktivIGar: aktiveIGar.size,
    aktivDenneUka: aktive7d.size,
    ikkeApnet30d: totaltSpillere - aktive30d.size,
    daglig,
  };
}
