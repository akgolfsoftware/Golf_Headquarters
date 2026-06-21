import { SignupForm } from "./signup-form";

/**
 * /auth/signup — terminal-lys-fasit «Auth Registrering og passord (terminal-lys).dc.html».
 * Mørk terminal-flate (forest + svakt grid), «ak»-lettermerke i lime, hero
 * «Lag konto» + «Start gratis. Ingen binding.», skjema rett på flaten.
 * `.dark` flipper de semantiske tokenene → mørke inputs. Registreringslogikk
 * uendret i SignupForm. ?epost=… prefiller e-postfeltet (gjeste-bro fra booking).
 */
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ epost?: string }>;
}) {
  const { epost } = await searchParams;
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
            Lag konto
          </h1>
          <p className="mt-2 text-[13.5px] text-[var(--t-fg-2,#9DB0A4)]">
            Start gratis. Ingen binding.
          </p>
        </div>

        {/* Skjema — rett på flaten */}
        <div className="w-full">
          <SignupForm defaultEmail={epost} />
        </div>
      </div>
    </main>
  );
}
