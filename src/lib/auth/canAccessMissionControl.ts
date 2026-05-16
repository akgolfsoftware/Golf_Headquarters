// Tilgangs-helper for Mission Control / Caddie — kun ADMIN-rolle.
// Returnerer Prisma-User hvis OK, ellers null. Brukes i route handlers,
// Server Actions og RSC for å gate intern admin-funksjonalitet.

import { getCurrentUser } from "./getCurrentUser";
import type { User } from "@/generated/prisma/client";

export async function canAccessMissionControl(): Promise<User | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "ADMIN") return null;
  return user;
}
