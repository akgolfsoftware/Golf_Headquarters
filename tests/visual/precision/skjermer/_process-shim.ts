// Prøven har ingen Node-`process`; moduler som leser NEXT_PUBLIC_* ved import trenger et tomt env.
const g = globalThis as { process?: { env: Record<string, string | undefined> } };
g.process ??= { env: {} };
g.process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ??= "prove";
