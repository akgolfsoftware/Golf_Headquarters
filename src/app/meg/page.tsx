// /meg — Jarvis: samlet «venter på deg»-kø på tvers av kanaler. Server
// component, låst til ADMIN. Erstatter den enkle brief/ventende/logg-
// oversikten med skallet fra jarvis/meg-hjem.html (Én ting nå-kort,
// tråd, composer, artefaktpanel med saker-køen).
//
// Bruker den ekte Prisma-baserte repository-implementasjonen (aldri
// demodata i produksjon) — se src/lib/jarvis/repository.ts.
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { lagPrismaRepository } from "@/lib/jarvis/repository";
import { MegApp } from "@/components/meg/MegApp";
import { godkjennSak, avvisSak } from "./actions";

export const dynamic = "force-dynamic";

export default async function MegPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();

  const repo = lagPrismaRepository();
  const saker = await repo.hentSaker();
  const [systemHelse, avvik, dagen, logg] = await Promise.all([
    repo.hentSystemHelse(),
    repo.hentAvvik(),
    repo.hentDagen(saker),
    repo.hentLogg(),
  ]);

  return (
    <MegApp
      brukernavn={user.name ?? "Anders"}
      saker={saker}
      systemHelse={systemHelse}
      avvik={avvik}
      dagen={dagen}
      logg={logg}
      naServertid={new Date().toISOString()}
      godkjennSak={godkjennSak}
      avvisSak={avvisSak}
    />
  );
}
