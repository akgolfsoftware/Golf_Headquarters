// Miljøshim, ikke produktkode: komponentene er skrevet for Next.js, der `process.env` også
// finnes i nettleseren (next/link leser process.env.__NEXT_*). Claude Design og kortene i
// denne synken har ingen Next-runtime, så en tom env er alt som trengs for at bundelen laster.
if (typeof (globalThis as { process?: unknown }).process === "undefined") {
  (globalThis as { process?: unknown }).process = { env: {} };
}
export {};
