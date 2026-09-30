/**
 * Logget ut (/auth/logget-ut) i Precision Athletics. Tegning: Claude Design
 * 7d7c2994, ui_kits/konto/screens/AU-01-03.jsx › AU01 (tilstanden «Logget ut»).
 * Rent presentasjonelt: ingen database, innlogging eller loader.
 */

import { ArrowRight } from "lucide-react";
import { KnappLenke } from "@/components/precision/pa";
import { AuthRamme, AuthHode, LenkeTekst } from "@/components/auth/precision/AuthPa";

export type LoggetUtV2Props = {
  /** Lenke bak logoen, vanligvis forsiden. Logoen i rammen peker alltid til «/». */
  hjemHref?: string;
  /** Lenke til ny innlogging. */
  loggInnHref?: string;
  /** Lenke «Tilbake til akgolf.no». */
  marketingHref?: string;
  /** E-postadresse for tilbakemelding. */
  feedbackEpost?: string;
  natt?: boolean;
};

export function LoggetUtV2({
  loggInnHref = "/auth/login",
  marketingHref = "/",
  feedbackEpost = "post@akgolf.no",
  natt,
}: LoggetUtV2Props = {}) {
  return (
    <AuthRamme natt={natt}>
      <AuthHode kicker="Logget ut" tittel="Du er logget ut" under="Du er logget ut på denne enheten. Andre enheter er fortsatt innlogget." />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <KnappLenke href={loggInnHref} iconRight={ArrowRight}>Logg inn igjen</KnappLenke>
        <KnappLenke href={marketingHref} variant="ghost">Til akgolf.no</KnappLenke>
      </div>
      <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
        Spørsmål? <LenkeTekst href={`mailto:${feedbackEpost}`}>{feedbackEpost}</LenkeTekst>
      </span>
    </AuthRamme>
  );
}
