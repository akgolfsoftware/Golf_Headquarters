/**
 * AgencyOS · Innboks — datalag for AppFeedback (spillerens tilbakemeldinger
 * + support-henvendelser, jf. spor F6). Nyeste først, ingen fabrikering.
 */

import { prisma } from "@/lib/prisma";

export type AppFeedbackType = "bug" | "forslag" | "ros" | "sporsmal" | "SUPPORT";

export type AppFeedbackRad = {
  id: string;
  spillerNavn: string;
  type: AppFeedbackType;
  tekst: string;
  status: "NY" | "SETT";
  when: string;
};

function tidSiden(d: Date, now: Date): string {
  const sek = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 1000));
  if (sek < 60) return "nå";
  const min = Math.floor(sek / 60);
  if (min < 60) return `${min} min`;
  const t = Math.floor(min / 60);
  if (t < 24) return `${t} t`;
  const dg = Math.floor(t / 24);
  if (dg < 30) return `${dg} d`;
  return `${Math.floor(dg / 30)} mnd`;
}

export async function loadAppFeedback(): Promise<AppFeedbackRad[]> {
  const now = new Date();
  const rader = await prisma.appFeedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  if (rader.length === 0) return [];

  const brukere = await prisma.user.findMany({
    where: { id: { in: [...new Set(rader.map((r) => r.userId))] } },
    select: { id: true, name: true },
  });
  const navnPrId = new Map(brukere.map((b) => [b.id, b.name ?? "Ukjent spiller"]));

  return rader.map((r) => ({
    id: r.id,
    spillerNavn: navnPrId.get(r.userId) ?? "Ukjent spiller",
    type: r.type as AppFeedbackType,
    tekst: r.tekst,
    status: r.status === "SETT" ? "SETT" : "NY",
    when: tidSiden(r.createdAt, now),
  }));
}
