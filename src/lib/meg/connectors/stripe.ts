// src/lib/meg/connectors/stripe.ts
// Stripe-connector for Meg. Gjenbruker appens stripeKlient() singleton.
// Kun les-operasjoner — ingen skriving uten BEKREFT-flyt.
import "server-only";
import { stripeKlient } from "@/lib/stripe";

function sikkerStripe<T>(fn: () => Promise<T>): Promise<string | T> {
  return fn().catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    return `Stripe-feil: ${msg}`;
  });
}

function nokFormat(belop: number, valuta: string): string {
  const divisor = valuta.toLowerCase() === "jpy" ? 1 : 100;
  return `${(belop / divisor).toFixed(2)} ${valuta.toUpperCase()}`;
}

function datestamp(ts: number): string {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

// ── Saldo ─────────────────────────────────────────────────────────────────────

export async function stripeSaldo(): Promise<string> {
  return sikkerStripe(async () => {
    const s = stripeKlient();
    const bal = await s.balance.retrieve();
    const linjer = bal.available.map(
      (b) => `Tilgjengelig: ${nokFormat(b.amount, b.currency)}`,
    );
    const pend = bal.pending.map(
      (b) => `Ventende: ${nokFormat(b.amount, b.currency)}`,
    );
    return [...linjer, ...pend].join("\n") || "Ingen saldo.";
  });
}

// ── Betalinger ────────────────────────────────────────────────────────────────

export async function stripeBetalinger(dager = 7, limit = 10): Promise<string> {
  return sikkerStripe(async () => {
    const s = stripeKlient();
    const siden = Math.floor((Date.now() - dager * 86400_000) / 1000);
    const res = await s.charges.list({
      created: { gte: siden },
      limit: Math.min(limit, 30),
    });
    if (res.data.length === 0) return `Ingen betalinger siste ${dager} dager.`;
    return res.data
      .map((c) => {
        const status = c.paid ? "✅" : c.refunded ? "↩️" : "❌";
        const kundenavn = c.billing_details?.name ?? c.customer ?? "(ukjent)";
        return `${status} ${datestamp(c.created)}: ${nokFormat(c.amount, c.currency)} — ${kundenavn}${c.description ? ` (${c.description})` : ""}`;
      })
      .join("\n");
  });
}

// ── Abonnementer ─────────────────────────────────────────────────────────────

export async function stripeAbonnementer(limit = 20): Promise<string> {
  return sikkerStripe(async () => {
    const s = stripeKlient();
    const res = await s.subscriptions.list({
      status: "active",
      limit: Math.min(limit, 50),
      expand: ["data.customer"],
    });
    if (res.data.length === 0) return "Ingen aktive abonnementer.";
    return res.data
      .map((sub) => {
        const kunde =
          sub.customer && typeof sub.customer === "object" && "email" in sub.customer
            ? (sub.customer as { email?: string | null }).email ?? sub.customer.id
            : String(sub.customer);
        const pris = sub.items.data[0]?.price;
        const belopStr = pris?.unit_amount != null
          ? `${nokFormat(pris.unit_amount, pris.currency ?? "nok")}/${pris.recurring?.interval ?? "mnd"}`
          : "";
        return `- ${kunde}${belopStr ? `: ${belopStr}` : ""} [${sub.id}]`;
      })
      .join("\n");
  });
}

// ── Fakturaer ─────────────────────────────────────────────────────────────────

export async function stripeFakturaer(limit = 10): Promise<string> {
  return sikkerStripe(async () => {
    const s = stripeKlient();
    const res = await s.invoices.list({ limit: Math.min(limit, 30) });
    if (res.data.length === 0) return "Ingen fakturaer funnet.";
    return res.data
      .map((inv) => {
        const statusEmoji =
          inv.status === "paid" ? "✅" : inv.status === "open" ? "🔔" : "⬜";
        const dato = datestamp(inv.created);
        const kunde = inv.customer_email ?? inv.customer ?? "(ukjent)";
        return `${statusEmoji} ${dato}: ${nokFormat(inv.amount_due, inv.currency)} — ${kunde}${inv.number ? ` [${inv.number}]` : ""}`;
      })
      .join("\n");
  });
}

// ── Kundesøk ──────────────────────────────────────────────────────────────────

export async function stripeKundeSok(query: string, limit = 5): Promise<string> {
  return sikkerStripe(async () => {
    const s = stripeKlient();
    const res = await s.customers.search({
      query: `email:"${query}" OR name:"${query}"`,
      limit: Math.min(limit, 10),
    });
    if (res.data.length === 0) {
      // Fallback til list hvis search gir 0
      const list = await s.customers.list({ email: query, limit: 5 });
      if (list.data.length === 0) return `Ingen kunder for "${query}".`;
      return list.data
        .map((c) => `- ${c.name ?? "(uten navn)"} ${c.email ?? ""} [${c.id}] — skapt ${datestamp(c.created)}`)
        .join("\n");
    }
    return res.data
      .map((c) => `- ${c.name ?? "(uten navn)"} ${c.email ?? ""} [${c.id}] — skapt ${datestamp(c.created)}`)
      .join("\n");
  });
}
