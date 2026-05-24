"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function logout() {
  const supabase = await createClient();
  // scope: 'global' ugyldiggjør alle sesjoner på alle enheter (ikke bare denne).
  // Hindrer at en stjålet refresh-token forblir gyldig etter utlogging.
  await supabase.auth.signOut({ scope: "global" });
  redirect("/auth/login");
}
