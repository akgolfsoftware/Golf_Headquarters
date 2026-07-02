"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function logout() {
  const supabase = await createClient();
  // scope: 'global' ugyldiggjør alle sesjoner på alle enheter (ikke bare denne).
  // Hindrer at en stjålet refresh-token forblir gyldig etter utlogging.
  await supabase.auth.signOut({ scope: "global" });
  // Land på den dedikerte «logget ut»-skjermen (v10-fasit) i stedet for rett
  // til login — den var bygget for dette og hadde ingen inngang (IA A12).
  redirect("/auth/logget-ut");
}
