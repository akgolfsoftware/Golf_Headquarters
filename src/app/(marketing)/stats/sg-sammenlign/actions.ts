"use server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { redirect } from "next/navigation";

/** The direct reference comparison cannot run without customer-facing rights. */
export async function startSammenligning(_formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/stats/sg-sammenlign/start");
  throw new Error("DataGolf-sammenligning er utilgjengelig til lisensen er avklart.");
}
