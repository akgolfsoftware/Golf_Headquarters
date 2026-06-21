import { ForgotForm } from "./forgot-form";

/**
 * /auth/forgot-password — terminal-lys-fasit (samme «Auth Registrering og passord»-stil).
 * Mørk terminal-flate (forest + svakt grid), «ak»-lettermerke, skjema rett på flaten.
 * `.dark` flipper de semantiske tokenene → mørke inputs/kort. Steg 1 = send e-post,
 * steg 2 = bekreftelse — begge i ForgotForm.
 */
export default function ForgotPasswordPage() {
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
        <div className="w-full">
          <ForgotForm />
        </div>
      </div>
    </main>
  );
}
