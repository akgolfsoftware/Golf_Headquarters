import Link from "next/link";
import { AlertTriangle, XCircle, Pause } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AvbestillButtons } from "./avbestill-buttons";

const KONSEKVENSER = [
  { tittel: "AI-coach ubegrenset", detalj: "låses etter 1 måned", etterpaa: "→ låst" },
  { tittel: "Coaching-credits", detalj: "fra 4 / mnd til 0", etterpaa: "→ 0" },
  { tittel: "Videoanalyse fra coach", detalj: "opplastinger låses", etterpaa: "→ låst" },
  { tittel: "Komplett historikk", detalj: "kuttes til siste 30 dager", etterpaa: "→ 30 dgr" },
  { tittel: "Familiekonto", detalj: "far/mor mister tilgang", etterpaa: "→ utløper" },
];

function ukedag(d: Date) {
  return d.toLocaleDateString("nb-NO", { weekday: "long" });
}

function datoDag(d: Date) {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}

export default async function AvbestillPage() {
  const user = await requirePortalUser();
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });
  const naa = new Date();
  const proAktivTil =
    subscription?.currentPeriodEnd ?? new Date(naa.getTime() + 31 * 24 * 60 * 60 * 1000);
  const dagerIgjen = Math.max(
    0,
    Math.ceil((proAktivTil.getTime() - naa.getTime()) / (24 * 60 * 60 * 1000)),
  );

  return (
    <div className="mx-auto w-full max-w-[480px] space-y-6">
      {/* Hero */}
      <div className="flex flex-col items-center gap-4 pt-2 text-center">
        {/* Danger ring */}
        <div
          className="relative grid h-16 w-16 place-items-center rounded-full text-destructive"
          style={{
            border: "2px solid rgba(163,45,45,0.30)",
            background: "rgba(163,45,45,0.06)",
          }}
        >
          <AlertTriangle className="h-8 w-8" strokeWidth={1.75} />
          {/* radial glow behind ring */}
          <span
            className="pointer-events-none absolute inset-0 -z-10 rounded-full"
            style={{
              margin: "-10px",
              background: "radial-gradient(circle, rgba(163,45,45,0.10), transparent 65%)",
            }}
          />
        </div>
        <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Siste bekreftelse · Steg 2 av 2
        </span>
        <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.015em] text-foreground">
          Avbestille{" "}
          <em
            className="font-serif not-italic italic font-normal"
            style={{ color: "var(--destructive)" }}
          >
            Pro
          </em>
          ?
        </h1>
        <p className="max-w-[380px] text-[14px] leading-[1.55] text-muted-foreground">
          Du mister disse fordelene når perioden løper ut.{" "}
          <strong className="font-semibold text-foreground">Du betales ikke noe mer</strong>{" "}
          — men tilgangen forsvinner gradvis.
        </p>
      </div>

      {/* Date block */}
      <div
        className="grid items-center gap-3 rounded-[14px] border border-border p-4"
        style={{
          gridTemplateColumns: "1fr auto",
          background: "var(--background)",
        }}
      >
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            Pro aktiv til
          </span>
          <div className="mt-1 font-display text-base font-semibold text-foreground">
            <em className="font-serif not-italic italic font-normal text-primary capitalize">
              {ukedag(proAktivTil)}
            </em>{" "}
            {datoDag(proAktivTil)}
          </div>
        </div>
        <div className="text-right font-mono">
          <div className="text-[13px] font-semibold text-foreground tabular-nums">kl 23:59</div>
          <div className="mt-1 text-[10px] font-medium text-muted-foreground">
            {dagerIgjen} dager igjen
          </div>
        </div>
      </div>

      {/* Consequences */}
      <section className="flex flex-col gap-0.5">
        <span className="mb-2 border-b border-border/50 pb-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Dette mister du
        </span>
        {KONSEKVENSER.map((k) => (
          <div
            key={k.tittel}
            className="grid items-center gap-3 py-2"
            style={{ gridTemplateColumns: "20px 1fr auto" }}
          >
            <XCircle className="h-4 w-4 text-destructive" strokeWidth={1.75} />
            <div className="text-[13.5px] font-medium leading-tight text-foreground">
              {k.tittel}
              <em className="not-italic block font-mono text-[11.5px] text-muted-foreground mt-0.5">
                {k.detalj}
              </em>
            </div>
            <span
              className="whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.04em] text-destructive"
              style={{ background: "rgba(163,45,45,0.08)" }}
            >
              {k.etterpaa}
            </span>
          </div>
        ))}
      </section>

      {/* Pause banner */}
      <div
        className="grid items-center gap-3 rounded-xl border p-3.5"
        style={{
          gridTemplateColumns: "36px 1fr auto",
          borderColor: "rgba(209,248,67,0.55)",
          background: "linear-gradient(140deg, rgba(209,248,67,0.20), rgba(209,248,67,0.08))",
        }}
      >
        <span
          className="grid h-9 w-9 place-items-center rounded-full"
          style={{ background: "var(--accent)", color: "var(--foreground)" }}
        >
          <Pause className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div className="text-[13px] leading-[1.4] text-foreground">
          <strong className="block font-display font-semibold">
            Vil du heller pause i 1 måned?
          </strong>
          Behold all data — ingen belastning før august.
        </div>
        <button
          type="button"
          className="whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-primary hover:bg-primary/[0.06]"
        >
          Pause →
        </button>
      </div>

      <AvbestillButtons />

      <p className="text-center font-mono text-[10px] tracking-[0.08em] text-muted-foreground/60">
        Trykk <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[9.5px] font-semibold text-muted-foreground">Esc</kbd>{" "}
        eller{" "}
        <Link href="/portal/meg/abonnement" className="hover:text-foreground">
          tilbake til abonnement
        </Link>{" "}
        for å lukke uten å endre noe
      </p>
    </div>
  );
}
