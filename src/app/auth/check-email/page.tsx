import Link from "next/link";
import { MailCheck } from "lucide-react";

/**
 * /auth/check-email — terminal-lys-fasit (samme mørke auth-stil som login/signup).
 * Mørk terminal-flate (forest + svakt grid), «ak»-lettermerke, bekreftelses-kort.
 * Statisk venteskjerm etter registrering — ingen form-logikk.
 */
export default function CheckEmailPage() {
  return (
    <main
      className="dark relative flex min-h-svh items-center justify-center overflow-hidden px-5 py-12"
      style={{ background: "linear-gradient(160deg, #0A1410, #07100C)" }}
    >
      {/* Svakt terminal-grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(var(--t-line-soft,rgba(180,225,195,.035)) 1px,transparent 1px),linear-gradient(90deg,var(--t-line-soft,rgba(180,225,195,.035)) 1px,transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      <div className="relative z-10 flex w-full max-w-[400px] flex-col items-center gap-7">
        {/* «ak»-lettermerke */}
        <div className="font-display text-[40px] font-bold leading-none tracking-[-0.045em] text-accent">
          ak
        </div>

        {/* Bekreftelses-kort */}
        <div className="w-full rounded-2xl border border-border bg-card px-7 py-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
            <MailCheck
              className="h-[26px] w-[26px] text-success"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>

          <h1 className="mb-2 font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-foreground">
            Sjekk innboksen din
          </h1>
          <p className="mb-5 text-[13.5px] leading-relaxed text-muted-foreground">
            Vi har sendt en bekreftelseslenke til e-posten du registrerte deg
            med. Klikk på lenken for å aktivere kontoen din.
          </p>

          <div className="mb-5 rounded-xl bg-secondary px-[14px] py-[14px] text-left">
            <p className="mb-[6px] font-mono text-[9.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              Ikke fått e-posten?
            </p>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Sjekk søppelpost-mappen, eller{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-primary hover:underline"
              >
                registrer deg på nytt
              </Link>
              .
            </p>
          </div>

          <Link
            href="/auth/login"
            className="inline-flex rounded-full border-[1.5px] border-border bg-transparent px-6 py-[11px] font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Tilbake til innlogging
          </Link>
        </div>
      </div>
    </main>
  );
}
