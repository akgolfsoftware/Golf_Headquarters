/**
 * Next.js instrumentation — kjører én gang ved server-oppstart.
 * Validerer kritiske miljøvariabler (fail-fast) kun i Node-runtime.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv } = await import("./lib/env");
    validateEnv();
  }
}
