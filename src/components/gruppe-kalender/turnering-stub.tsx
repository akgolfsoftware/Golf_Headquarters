import { Trophy } from "lucide-react";

/**
 * Plassholder for turneringsplanen — layout-plass reservert, ingen datakobling
 * ennå. Kobles på når turneringskalenderen (AK Golf Platform) er klar.
 */
export function TurneringStub() {
  return (
    <section className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 p-4">
      <Trophy className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      <div>
        <p className="text-sm font-semibold text-foreground">Turneringsplan</p>
        <p className="text-[13px] text-muted-foreground">
          Legges til her når turneringskalenderen er klar.
        </p>
      </div>
    </section>
  );
}
