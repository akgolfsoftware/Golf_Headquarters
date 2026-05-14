// Dashboard-hero: profilbilde + hilsen + ambisjon + meta-rad.

import Image from "next/image";
import { ukenummer } from "@/lib/uke-helpers";

const DAGNAVN = [
  "Søndag",
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
];

const MND = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];

function hilsen(): string {
  const time = new Date().getHours();
  if (time < 5) return "God natt";
  if (time < 10) return "Godmorgen";
  if (time < 17) return "God dag";
  return "God kveld";
}

type Props = {
  name: string;
  avatarUrl: string | null;
  hcp: number | null;
  homeClub: string | null;
  tier: string;
  ambition: string | null;
};

export function DashHero({
  name,
  avatarUrl,
  hcp,
  homeClub,
  tier,
  ambition,
}: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const idag = new Date();
  const eyebrow = `${DAGNAVN[idag.getDay()]} ${idag.getDate()}. ${MND[idag.getMonth()]} · uke ${ukenummer(idag)}`;
  const fornavn = name.split(" ")[0] ?? name;

  const meta = [
    homeClub,
    hcp != null ? `HCP ${hcp.toFixed(1).replace(".", ",")}` : null,
    tier === "PRO" ? "Pro" : "Gratis",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
      <span className="relative shrink-0">
        <span className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              width={80}
              height={80}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            initial
          )}
        </span>
        <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
      </span>

      <div className="min-w-0 flex-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {eyebrow}
        </span>
        <h1 className="mt-1 font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          <em className="font-normal text-primary md:italic">{hilsen()},</em>{" "}
          {fornavn}
        </h1>
        {ambition && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {ambition}
          </p>
        )}
        {meta && (
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.10em] text-foreground/70">
            {meta}
          </p>
        )}
      </div>
    </header>
  );
}
