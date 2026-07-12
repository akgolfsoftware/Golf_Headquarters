"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { agBtnClass } from "@/components/admin/agencyos/ui";
import { synkWagrNaa } from "./actions";

export function SynkNaaButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={agBtnClass("primary")}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await synkWagrNaa();
          if (!res.ok) {
            toast.error(`Synk feilet: ${res.feil}`);
            return;
          }

          const { resultat } = res;
          const deler: string[] = [];
          if (resultat.oppdatert > 0) {
            deler.push(`${resultat.oppdatert} rankinger oppdatert`);
          }
          deler.push(
            resultat.nyKoblet > 0
              ? `${resultat.nyKoblet} nye spillere koblet`
              : "ingen nye spillere å koble",
          );

          if (resultat.kilde === "ikke-konfigurert") {
            // Ærlig status: ekstern henting fra wagr.com venter på at Anders
            // avklarer datakilden — CSV/skjema-import er fortsatt hovedveien.
            toast.info(
              `Synk kjørt: ${deler.join(", ")}. Henting fra wagr.com venter på kildeavklaring — manuell import er fortsatt hovedveien.`,
            );
          } else {
            toast.success(`Synk fullført: ${deler.join(", ")}.`);
          }

          if (resultat.tvetydige.length > 0) {
            toast.warning(
              `Flere spillere deler navn (${resultat.tvetydige.join(", ")}) — koble disse manuelt.`,
            );
          }
        })
      }
    >
      <RefreshCw
        size={16}
        aria-hidden
        className={pending ? "animate-spin" : undefined}
      />{" "}
      {pending ? "Synker …" : "Synk nå"}
    </button>
  );
}
