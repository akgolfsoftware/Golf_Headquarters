import { Suspense } from "react";
import { LoginForm } from "./login-form";

/**
 * /auth/login — terminal-lys-fasit «Auth Innlogging (terminal-lys).dc.html».
 * Mørk terminal-flate (forest + svakt grid), «ak»-lettermerke i lime, hero
 * «Tren på det du trenger», skjema rett på flaten (ingen hvitt kort).
 * `.dark` flipper de semantiske tokenene så LoginForm-inputene blir mørke.
 * All form-logikk (Supabase e-post/passord + Google OAuth) uendret i LoginForm.
 */
export default function LoginPage() {
  return (
    <main
      className="dark relative flex min-h-svh items-center justify-center overflow-hidden px-5 py-10"
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

        {/* Hero */}
        <div className="text-center">
          <h1 className="font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-[var(--t-fg,#EAF2EC)]">
            Tren på det du{" "}
            <em className="font-medium italic text-accent">trenger</em>
          </h1>
          <p className="mt-2 text-[13.5px] text-[var(--t-fg-2,#9DB0A4)]">
            Strokes gained, plan og coach i samme flate.
          </p>
        </div>

        {/* Skjema — rett på flaten */}
        <div className="w-full">
          <Suspense fallback={<div className="h-64" aria-hidden />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
