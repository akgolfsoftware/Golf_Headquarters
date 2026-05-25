/**
 * PlayerHeroImage — hero-card med AK Golf Academy-bilde som bakgrunn.
 *
 * Stil: "Athletic editorial" (kombinerer luksuriøs foto-kvalitet med kommanderende stil).
 * Bilde fra AK Golf Academy (real photography, ikke stock).
 *
 * Layout:
 * - Foto fyller hele cardet
 * - Gradient overlay forest-green → transparent for tekst-lesbarhet
 * - Personlig "Hei, Øyvind"-hilsen (Inter Tight italic, premium-fg)
 * - HCP, tier, neste turnering som meta-rad
 * - Lime accent på PRO-pill og countdown-tall
 */

import Image from "next/image";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";

type PlayerHeroImageProps = {
  user: {
    name: string;
    tier: "GRATIS" | "PRO" | "ELITE";
    nivaa?: string;
    hcp: number | null;
    hcpTrend?: number;
    avatarUrl?: string;
  };
  neste_turnering?: { navn: string; dato: Date };
  /** Hvilket AK Golf Academy-bilde (1-44). Default 1 (lavt-vinkel swing). */
  imageId?: number;
  className?: string;
};

function formaterHcp(hcp: number | null): string {
  if (hcp == null) return "—";
  if (hcp < 0) return `+${Math.abs(hcp).toFixed(1).replace(".", ",")}`;
  return hcp.toFixed(1).replace(".", ",");
}

function dagerTilDato(dato: Date): number {
  const naa = new Date();
  naa.setHours(0, 0, 0, 0);
  const target = new Date(dato);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - naa.getTime()) / (1000 * 60 * 60 * 24));
}

export function PlayerHeroImage({
  user,
  neste_turnering,
  imageId = 1,
  className,
}: PlayerHeroImageProps) {
  const fornavn = user.name.split(" ")[0] || "der";
  const initials = initialsFromName(user.name);
  const avatarBgColor = avatarBg(user.name);
  const dagerTilTurnering = neste_turnering
    ? dagerTilDato(neste_turnering.dato)
    : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl shadow-lg",
        "min-h-[280px] md:min-h-[360px]",
        className,
      )}
    >
      {/* Foto-bakgrunn */}
      <Image
        src={`/images/akgolf/AK-Golf-Academy-${imageId}.webp`}
        alt=""
        fill
        priority
        sizes="(max-width: 768px) 100vw, 1280px"
        className="object-cover"
      />

      {/* Gradient overlay — forest grønn fade for lesbarhet */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/75 to-primary/40" />

      {/* Innhold */}
      <div className="relative flex h-full min-h-[280px] flex-col justify-between p-6 md:min-h-[360px] md:p-10">
        {/* Top-rad: PRO-pill + meta */}
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-accent-foreground">
            {user.tier === "PRO" ? "PRO" : user.tier === "ELITE" ? "ELITE" : "GRATIS"}
          </span>
          {/* Avatar */}
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-14 w-14 rounded-full border-2 border-accent object-cover md:h-16 md:w-16"
            />
          ) : (
            <div
              className="grid h-14 w-14 place-items-center rounded-full border-2 border-accent font-display text-xl font-bold text-accent-foreground md:h-16 md:w-16"
              style={{ background: avatarBgColor }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Hilsen + meta */}
        <div className="space-y-3">
          <h1 className="font-display text-3xl font-bold leading-tight text-accent md:text-5xl">
            Hei, <em className="italic">{fornavn}</em>.
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.10em] text-accent/85 md:text-xs">
            {user.nivaa && <span>{user.nivaa}</span>}
            {user.nivaa && <span className="text-accent/40">·</span>}
            <span className="flex items-center gap-1.5">
              HCP <strong className="font-bold text-accent">{formaterHcp(user.hcp)}</strong>
              {user.hcpTrend != null && (
                <span
                  className={cn(
                    "inline-flex items-center font-bold",
                    user.hcpTrend > 0.1 && "text-accent",
                    user.hcpTrend < -0.1 && "text-destructive-foreground/80",
                    Math.abs(user.hcpTrend) <= 0.1 && "text-accent/60",
                  )}
                >
                  {user.hcpTrend > 0.1 ? (
                    <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : user.hcpTrend < -0.1 ? (
                    <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                  )}
                  {user.hcpTrend > 0
                    ? `+${user.hcpTrend.toFixed(1).replace(".", ",")}`
                    : user.hcpTrend.toFixed(1).replace(".", ",")}
                </span>
              )}
            </span>
            {dagerTilTurnering != null && dagerTilTurnering >= 0 && neste_turnering && (
              <>
                <span className="text-accent/40">·</span>
                <span className="flex items-center gap-1.5">
                  <strong className="font-bold text-accent">{dagerTilTurnering}</strong>
                  <span>dager til {neste_turnering.navn}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
