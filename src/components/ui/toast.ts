/**
 * Toast-primitiv for AK Golf HQ.
 *
 * Re-export fra `@/components/shared/toast-provider`, som er den eksisterende
 * globale toast-systemet. Lagt inn under `ui/` for å samle alle primitiver
 * på ett sted — call-sites kan bytte til `import { useToast } from "@/components/ui"`.
 *
 * Bruk:
 *   const toast = useToast();
 *   toast.success("Sendt til Anders");
 *   toast.error("Kunne ikke lagre");
 *   toast.info("Coach Anders K leste meldingen din");
 */

export { ToastProvider, useToast } from "@/components/shared/toast-provider";
