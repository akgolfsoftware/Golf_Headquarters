import "server-only";
import { Prisma } from "@/generated/prisma/client";

// Fixed upstream contract owned by ak-golf-pipelines (0011/0026). These SQL
// identifiers are never supplied by a client or environment setting. Keeping
// them together lets isolated SQL tests substitute their synthetic namespace.
export const nivaProfilFunksjon = Prisma.sql`dashboard.player_profile_for_user`;
export const nivaKoblinger = Prisma.sql`dashboard.profile_links`;
