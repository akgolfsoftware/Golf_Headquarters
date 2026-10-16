/**
 * AG-23 Oppsett: ekte data fra basen. Team = brukere med rolle ADMIN eller COACH.
 * E-post til andre enn deg selv vises bare for admin. Ingenting oppdiktes.
 */

import { prisma } from "@/lib/prisma";
import type { AG23Data, TeamMedlem } from "@/components/admin/precision/AG23Oppsett";

type Viewer = { id: string; role: string; name: string | null; email?: string | null };

export function byggOppsettData(
  viewer: Viewer,
  ansatte: Array<{ id: string; name: string | null; email: string | null; role: string }>,
): AG23Data {
  const erAdmin = viewer.role === "ADMIN";
  const team: TeamMedlem[] = ansatte.map((u) => ({
    id: u.id,
    name: u.name ?? "—",
    role: u.role === "ADMIN" ? "Admin" : "Coach",
    access: u.role === "ADMIN" ? "Admin" : "Coach",
    email: erAdmin || u.id === viewer.id ? u.email : null,
  }));

  return {
    team,
    profil: {
      navn: viewer.name ?? "—",
      epost: viewer.email ?? null,
      rolle: viewer.role === "ADMIN" ? "Admin" : "Coach",
    },
  };
}

export async function lastOppsettData(viewer: Viewer): Promise<AG23Data> {
  const ansatte = await prisma.user
    .findMany({
      where: { role: { in: ["ADMIN", "COACH"] }, deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, role: true },
    })
    .catch(() => []);
  return byggOppsettData(viewer, ansatte);
}
