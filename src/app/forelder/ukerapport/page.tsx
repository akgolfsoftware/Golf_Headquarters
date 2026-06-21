/**
 * Foreldreportal · /forelder/ukerapport — ukentlig rapport-detalj (terminal-lys-fasit).
 * Fasit: «Onboarding-gap og Forelder long-tail (terminal-lys)» → /foreldre/rapport/[id].
 *
 * Read-only ukesoppsummering: Denne uka (3 stat) + coachens kommentar + høydepunkt.
 * Alle tall avledet fra barnets ekte data (hentForelderUkerapport). Light, mobil-først.
 */

import { Star } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentForelderUkerapport } from "@/lib/forelder";

export const dynamic = "force-dynamic";

const nf1 = new Intl.NumberFormat("nb-NO", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export default async function Ukerapport() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const d = await hentForelderUkerapport(user.id);

  if (!d) {
    return (
      <div className="mx-auto w-full max-w-[440px] px-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          Ingen barn er koblet til kontoen din ennå.
        </p>
      </div>
    );
  }

  const sgTekst =
    d.ukeSg == null ? "—" : `${d.ukeSg > 0 ? "+" : ""}${nf1.format(d.ukeSg)}`;

  return (
    <div className="mx-auto w-full max-w-[440px] px-4 py-5">
      {/* Header */}
      <header className="mb-4">
        <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Uke {d.ukenummer} · {d.childFirstName}
        </span>
        <h1 className="mt-1 font-display text-[22px] font-bold leading-[1.04] tracking-[-0.02em] text-foreground">
          Ukerapport
        </h1>
      </header>

      {/* Denne uka — 3 stat */}
      <div className="mb-3.5 rounded-xl border border-border bg-card p-4">
        <div className="mb-3 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          Denne uka
        </div>
        <div className="flex gap-8">
          <Stat value={String(d.oktFullfort)} label="Økter" />
          <Stat value={`${nf1.format(d.trentTimer)}t`} label="Trent" />
          <Stat value={sgTekst} label="SG" />
        </div>
      </div>

      {/* Coachens kommentar */}
      {d.coachNote && (
        <div className="mb-3.5 rounded-xl border border-border bg-card p-4">
          <div className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Coachens kommentar
          </div>
          <p className="text-[12.5px] leading-[1.5] text-foreground">
            {d.coachNote.body}
          </p>
          <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
            — {d.coachNote.author}
          </div>
        </div>
      )}

      {/* Høydepunkt */}
      {d.hoydepunkt && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Høydepunkt
          </div>
          <div className="flex items-center gap-3">
            <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-md bg-secondary">
              <Star className="h-4 w-4 text-primary" strokeWidth={1.7} aria-hidden />
            </span>
            <div className="flex-1">
              <div className="text-[13px] font-medium text-foreground">
                {d.hoydepunkt.testNavn}
              </div>
              <div className="font-mono text-[9.5px] uppercase tracking-[0.06em] text-muted-foreground">
                Beste resultat · {nf1.format(d.hoydepunkt.score)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-mono text-[22px] font-bold leading-none tabular-nums text-primary">
        {value}
      </div>
      <div className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
