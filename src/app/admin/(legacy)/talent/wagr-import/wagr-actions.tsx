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
          const antallForsokt =
            resultat.hentet +
            resultat.ikkeFunnet.length +
            resultat.blittProff.length +
            resultat.feilet.length;
          const deler: string[] = [
            `${resultat.oppdatert} av ${antallForsokt} rankinger oppdatert fra wagr.com`,
          ];
          deler.push(
            resultat.nyKoblet > 0
              ? `${resultat.nyKoblet} nye spillere koblet`
              : "ingen nye spillere å koble",
          );
          toast.success(`Synk fullført: ${deler.join(", ")}.`);

          if (resultat.feilet.length > 0) {
            toast.error(
              `Klarte ikke hente ${resultat.feilet.length} spillere (${resultat.feilet.join(", ")}) — prøv igjen senere.`,
            );
          }
          if (resultat.blittProff.length > 0) {
            toast.info(
              `Ute av amatørrankingen (blitt proff): ${resultat.blittProff.join(", ")} — siste amatørtall beholdes.`,
            );
          }
          if (resultat.ikkeFunnet.length > 0) {
            toast.warning(
              `Finnes ikke lenger på wagr.com: ${resultat.ikkeFunnet.join(", ")}.`,
            );
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
