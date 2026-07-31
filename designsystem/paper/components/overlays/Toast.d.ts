/**
 * Flyktig bekreftelse (~20 skjermer). role="status", forsvinner av seg
 * selv. Blir meldingen stående til noe er løst, er det Banner.
 */
export interface ToastProps {
  /** Rendres i flyten i stedet for fixed — for spesimenkort og dokumentasjon */
  inline?: boolean;
  /** neutral (standard, ingen prikk) · ok · warn · info — prikken er eneste fargebærer */
  tone?: "neutral" | "ok" | "warn" | "info";
  /** ms før den forsvinner. 0 = blir stående (krever at skjermen fjerner den). Ignoreres når inline. */
  duration?: number;
  onDone?: () => void;
  dataOdId?: string;
  children?: React.ReactNode;
}
