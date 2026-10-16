"use client";

import { useRouter } from "next/navigation";

import { opprettWangNettleserKlient } from "@/lib/wang-supabase/client";
import { WangInnloggingsSkjema } from "../../logg-inn/wang-innloggings-skjema";

export function WangAppLogin({ retursti }: { retursti: string }) {
  const router = useRouter();

  return (
    <WangInnloggingsSkjema
      variant="app"
      loggInn={async ({ epost, passord }) => {
        const supabase = opprettWangNettleserKlient();
        const { error } = await supabase.auth.signInWithPassword({
          email: epost,
          password: passord,
        });

        if (error?.name === "AuthRetryableFetchError" || error?.status === 0) {
          throw new Error("Innloggingen fikk ikke forbindelse.");
        }
        if (error) return { ok: false };

        router.replace(retursti);
        router.refresh();
        return { ok: true };
      }}
    />
  );
}
