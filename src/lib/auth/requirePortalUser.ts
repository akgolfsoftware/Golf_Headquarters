// Server-side guard for beskyttede sider. Redirector hvis ikke innlogget
// eller mangler tillatt rolle.

import { redirect } from "next/navigation";
import { getCurrentUser } from "./getCurrentUser";
import { hasRole } from "./cbac";
import type { UserRole } from "@/generated/prisma/client";

type Options = {
  allow?: UserRole | UserRole[];
  redirectTo?: string;
};

export async function requirePortalUser(options: Options = {}) {
  const { allow, redirectTo = "/auth/login" } = options;
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  if (allow && !hasRole(user.role, allow)) redirect("/portal");
  return user;
}
