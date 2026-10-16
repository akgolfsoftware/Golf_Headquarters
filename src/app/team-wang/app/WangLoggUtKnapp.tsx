"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { opprettWangNettleserKlient } from "@/lib/wang-supabase/client";

import styles from "./app.module.css";

export function WangLoggUtKnapp() {
  const router = useRouter();

  async function loggUt() {
    await opprettWangNettleserKlient().auth.signOut();
    router.replace("/team-wang/app/logg-inn");
    router.refresh();
  }

  return (
    <button type="button" className={styles.signOut} onClick={loggUt}>
      <LogOut size={17} aria-hidden />
      Logg ut
    </button>
  );
}
