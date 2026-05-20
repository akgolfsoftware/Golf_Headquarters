import Link from "next/link";
import { AlertTriangle, XCircle, Pause, Heart } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AvbestillButtons } from "./avbestill-buttons";

const KONSEKVENSER = [
  { tittel: "AI-coach ubegrenset", detalj: "låses etter 1 måned", etterpaa: "låst" },
  { tittel: "Coaching-credits", detalj: "fra 4 / mnd til 0", etterpaa: "0" },
  { tittel: "Videoanalyse fra coach", detalj: "opplastinger låses", etterpaa: "låst" },
  { tittel: "Komplett historikk", detalj: "kuttes til siste 30 dager", etterpaa: "30 dgr" },
  { tittel: "Familiekonto", detalj: "far/mor mister tilgang", etterpaa: "utløper" },
];

function formatDato(d: Date) {
  return d.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
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
    <div className="mx-auto w-full max-w-[600px] space-y-6">
      {/* Hero */}
      <div className="space-y-4 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-destructive/30 bg-destructive/[0.06] text-destructive">
          <AlertTriangle className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Siste bekreftelse · Steg 2 av 2
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            Avbestille <em className="font-normal italic text-primary">Pro</em>?
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Du mister disse fordelene når perioden løper ut. <strong className="text-foreground">Du betales ikke noe mer</strong> — men tilgangen forsvinner gradvis.
          </p>
        </div>
      </div>

      {/* Date block */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Pro aktiv til
          </span>
          <div className="mt-1 font-display text-base font-semibold capitalize text-foreground">
            {formatDato(proAktivTil)}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-bold text-foreground">kl 23:59</div>
          <div className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">
            {dagerIgjen} dager igjen
          </div>
        </div>
      </div>

      {/* Consequences */}
      <section className="space-y-2 rounded-xl border border-destructive/20 bg-destructive/[0.03] p-5">
        <h3 className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-destructive">
          Dette mister du
        </h3>
        {KONSEKVENSER.map((k) => (
          <div
            key={k.tittel}
            className="grid grid-cols-[20px_1fr_auto] items-center gap-3 border-b border-destructive/10 py-2 last:border-b-0"
          >
            <XCircle className="h-4 w-4 text-destructive" strokeWidth={1.75} />
            <div className="text-sm text-foreground">
              <span className="font-medium">{k.tittel}</span>{" "}
              <em className="text-muted-foreground">{k.detalj}</em>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              → {k.etterpaa}
            </span>
          </div>
        ))}
      </section>

      {/* Pause banner */}
      <div className="grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-xl border border-primary/30 bg-primary/[0.04] p-4">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/15 text-primary">
          <Pause className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div className="text-sm text-foreground">
          <strong className="block font-display font-semibold">
            Vil du heller pause i 1 måned?
          </strong>
          Behold all data — ingen belastning før august.
        </div>
        <button
          type="button"
          className="rounded-full px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
        >
          Pause →
        </button>
      </div>

      <AvbestillButtons />

      <p className="text-center font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/80">
        <Link href="/portal/meg/abonnement" className="hover:text-foreground">
          ← Tilbake til abonnement
        </Link>
      </p>

      {/* Suppress unused import warning */}
      <Heart className="hidden" />
    </div>
  );
}
