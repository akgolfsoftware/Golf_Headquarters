"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export async function disconnectGoogleCalendar() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  await prisma.googleCalendarConnection.deleteMany({
    where: { userId: user.id },
  });
  revalidatePath("/admin/settings/calendar");
}
