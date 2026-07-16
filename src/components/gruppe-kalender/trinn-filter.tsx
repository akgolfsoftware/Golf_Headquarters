import Link from "next/link";

const TRINN = ["VG1", "VG2", "VG3"] as const;

/**
 * Trinn-filter for gruppekalenderen — samme Link+searchParams-mønster som
 * `?trinn=`-filteret i GruppeDetaljV2 (admin/grupper/[id]), men Tailwind-stilt
 * som resten av gruppe-kalender-familien (golfdata v13-laget, ikke v2-tokens).
 * Styrer hvilket trinns skole-hendelser (prøver/timeplan) som vises — samlinger
 * og treningsperioder er trinn-uavhengige og vises uansett.
 */
export function TrinnFilter({ basePath, aktivtTrinn }: { basePath: string; aktivtTrinn: string | null }) {
  return (
    <div className="inline-flex flex-wrap gap-1.5">
      {["", ...TRINN].map((t) => {
        const on = (aktivtTrinn ?? "") === t;
        return (
          <Link key={t || "alle"} href={t ? `${basePath}?trinn=${t}` : basePath} scroll={false}>
            <span
              className={
                "inline-block rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] transition " +
                (on
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground")
              }
            >
              {t || "Alle trinn"}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
