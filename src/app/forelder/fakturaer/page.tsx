/**
 * Foreldreportal · /forelder/fakturaer
 * Hybrid design: editorial header + terminal data cards.
 * Light theme, no .dark. Tokens only, no hardcoded hex except gradient.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import type { PaymentStatus } from "@/generated/prisma/client";

const NB_DAG = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
});

const NB_MND = new Intl.DateTimeFormat("nb-NO", { month: "short" });

function ore(n: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(Math.round(n / 100));
}

function statusPille(s: PaymentStatus): { tekst: string; klasse: string } {
  if (s === "SUCCEEDED")
    return { tekst: "Betalt", klasse: "bg-success/10 text-success" };
  if (s === "REFUNDED" || s === "PARTIALLY_REFUNDED")
    return { tekst: "Refundert", klasse: "bg-secondary text-muted-foreground" };
  if (s === "FAILED")
    return { tekst: "Feilet", klasse: "bg-destructive/10 text-destructive" };
  return { tekst: "Venter", klasse: "bg-warning/10 text-warning" };
}

export default async function Fakturaer() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);
  const childIds = barn.map((b) => b.child.id);

  const payments = childIds.length
    ? await prisma.payment.findMany({
        where: { userId: { in: childIds } },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true } },
          booking: {
            select: {
              id: true,
              serviceType: { select: { name: true } },
            },
          },
        },
        take: 50,
      })
    : [];

  // KPI aggregates
  const totalBetalt = payments
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((s, p) => s + Math.round(p.amountOre / 100), 0);

  const nesteForfall = payments.find(
    (p) => p.status === "PENDING" || p.status === "FAILED",
  );

  const nesteBeloep = nesteForfall
    ? Math.round(nesteForfall.amountOre / 100)
    : null;

  const nesteForfallDato = nesteForfall
    ? NB_DAG.format(nesteForfall.createdAt)
    : null;

  return (
    <div className="mx-auto max-w-[480px] space-y-4 px-4 pb-24 pt-6">
      {/* Editorial header */}
      <h1 className="font-display text-[26px] font-bold tracking-[-0.03em] text-foreground">
        Fakturaer &amp;{" "}
        <em className="font-medium italic text-primary">økonomi</em>
      </h1>

      {/* KPI 2-col */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
          <div className="font-mono text-[8px] font-bold uppercase tracking-[0.10em] text-muted-foreground mb-[5px]">
            Betalt hittil
          </div>
          <div className="font-mono text-[22px] font-semibold tabular-nums leading-none text-foreground">
            {new Intl.NumberFormat("nb-NO").format(totalBetalt)}
          </div>
          <div className="font-mono text-[10px] text-muted-foreground mt-[3px]">
            kr · 2026
          </div>
        </div>

        {nesteBeloep !== null ? (
          <div
            className="rounded-xl p-3"
            style={{
              background: "rgba(184,133,42,0.08)",
              border: "1px solid rgba(184,133,42,0.2)",
            }}
          >
            <div className="font-mono text-[8px] font-bold uppercase tracking-[0.10em] text-warning mb-[5px]">
              Neste forfall
            </div>
            <div className="font-mono text-[22px] font-semibold tabular-nums leading-none text-foreground">
              {new Intl.NumberFormat("nb-NO").format(nesteBeloep)}
            </div>
            <div className="font-mono text-[10px] text-warning mt-[3px]">
              kr · {nesteForfallDato}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
            <div className="font-mono text-[8px] font-bold uppercase tracking-[0.10em] text-muted-foreground mb-[5px]">
              Neste forfall
            </div>
            <div className="font-mono text-[22px] font-semibold tabular-nums leading-none text-foreground">
              —
            </div>
            <div className="font-mono text-[10px] text-muted-foreground mt-[3px]">
              Ingen utestående
            </div>
          </div>
        )}
      </div>

      {/* Invoice list */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-secondary px-4 py-[10px] font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Fakturahistorikk
        </div>

        {payments.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-muted-foreground">
            Ingen fakturaer registrert.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {payments.map((p) => {
              const st = statusPille(p.status);
              const beskrivelse =
                p.description ?? p.booking?.serviceType?.name ?? p.type;
              const dag = p.createdAt.getDate().toString().padStart(2, "0");
              const mnd = NB_MND.format(p.createdAt).toUpperCase();
              return (
                <li
                  key={p.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  {/* Date box */}
                  <div className="flex h-[38px] w-[38px] flex-shrink-0 flex-col items-center justify-center rounded-lg bg-secondary">
                    <span className="font-mono text-[12px] font-bold leading-none text-primary">
                      {dag}
                    </span>
                    <span className="font-mono text-[7.5px] text-muted-foreground">
                      {mnd}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-semibold text-foreground">
                      {beskrivelse}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                      {p.user?.name ?? "—"}
                    </div>
                  </div>

                  {/* Amount + status */}
                  <div className="flex-shrink-0 text-right">
                    <div className="font-mono text-[14px] font-semibold tabular-nums text-foreground">
                      {ore(p.amountOre)} kr
                    </div>
                    <span
                      className={`mt-1 inline-block rounded-full px-[7px] py-[2px] font-mono text-[9px] font-bold ${st.klasse}`}
                    >
                      {st.tekst}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Lesemodus note */}
      <div className="rounded-xl border border-dashed border-border bg-card p-3.5">
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Betalinger administreres via coaching-avtalen. Spørsmål om fakturaer?
          Kontakt{" "}
          <a
            href="mailto:hei@akgolf.no"
            className="text-primary hover:underline"
          >
            hei@akgolf.no
          </a>
          .
        </p>
      </div>
    </div>
  );
}
