// Forhåndsvisning-indeks (ungated, demo) — oversikt over redesignede skjermer mot v10.
// Fjernes ved lansering.
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

type Skjerm = { href: string; modul: string; navn: string; status: "klar" | "kommer" };

const SKJERMER: Skjerm[] = [
  { href: "/forhandsvisning/hjem", modul: "PLAYERHQ", navn: "Hjem / Oversikt", status: "klar" },
  // Flere legges til etter hvert som de portes mot v10:
  // I dag · Kalender · Treningsplan · Mål · Strokes gained · Runder · Meldinger · Profil
];

export default function ForhandsvisningIndeks() {
  const klare = SKJERMER.filter((s) => s.status === "klar");
  return (
    <div className="mx-auto min-h-screen w-full max-w-[640px] bg-background px-5 py-10">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        AK GOLF · FORHÅNDSVISNING
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
        Redesignede skjermer{" "}
        <em className="font-normal italic text-primary">mot v10</em>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Demo-data. Hver skjerm er portet fra v10-designet og verifisert mot fasit.
        {" "}
        {klare.length} klar{klare.length === 1 ? "" : "e"} så langt.
      </p>

      <div className="mt-8 space-y-3">
        {SKJERMER.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20"
          >
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {s.modul}
              </div>
              <div className="mt-0.5 font-display text-lg font-semibold tracking-tight text-foreground">
                {s.navn}
              </div>
            </div>
            <ArrowUpRight
              className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={1.75}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
