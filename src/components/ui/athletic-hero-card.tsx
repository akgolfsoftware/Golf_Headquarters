import React from "react";

export interface AthleticHeroCardProps {
  /** Valgfri bakgrunnsbilde-URL (sportsfoto) */
  imageUrl?: string;
  /** Merkelapp/Badge øverst i kortet (f.eks. "NESTE ØKT", "I DAG · MORGEN") */
  badgeText?: string;
  /** Hovedtittel (f.eks. "Slaglengde & Dispersjon på rangen") */
  title: string;
  /** Undertittel / beskrivelse */
  subtitle?: string;
  /** Primæraction-knappens tekst (f.eks. "Start live-økt") */
  actionLabel?: string;
  /** Klikk-håndterer for primæraction */
  onAction?: () => void;
  /** Sekundæraction (f.eks. "30s runderapport") */
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  /** Ekstra overleggsinnhold eller barn */
  children?: React.ReactNode;
  className?: string;
}

/**
 * AthleticHeroCard – Atletisk Intelligens Hero-kort
 * Kombinerer sportsfoto, mørk gradient, IBM Plex Sans og glass-pilleknapper.
 */
export function AthleticHeroCard({
  imageUrl,
  badgeText,
  title,
  subtitle,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  children,
  className = "",
}: AthleticHeroCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-zinc-950 text-white shadow-lg transition-all duration-200 border border-white/10 ${className}`}
      style={{
        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Gradient-overlay for optimal kontrast i henhold til AK Golf Design System */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-transparent pointer-events-none" />

      {/* Innholdskontainer */}
      <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-between min-h-[220px] sm:min-h-[260px]">
        {/* Merkelapp øverst */}
        {badgeText && (
          <div className="self-start">
            <span className="inline-block px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90 bg-white/10 backdrop-blur-md rounded-full border border-white/15 font-sans">
              {badgeText}
            </span>
          </div>
        )}

        {/* Midtseksjon: Tittel og undertittel */}
        <div className="mt-4 sm:mt-6 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-white leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm sm:text-base font-sans text-white/80 max-w-xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Ekstra barn-elementer dersom oppgitt */}
        {children && <div className="mt-4">{children}</div>}

        {/* Aksjons-seksjon nederst */}
        {(actionLabel || secondaryActionLabel) && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {actionLabel && (
              <button
                type="button"
                onClick={onAction}
                className="px-6 py-3 text-sm font-semibold font-sans text-zinc-950 bg-white rounded-full hover:bg-white/90 active:scale-[0.98] transition-all duration-150 shadow-md flex items-center justify-center gap-2"
              >
                <span>{actionLabel}</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </button>
            )}

            {secondaryActionLabel && (
              <button
                type="button"
                onClick={onSecondaryAction}
                className="px-5 py-3 text-sm font-semibold font-sans text-white bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 active:scale-[0.98] transition-all duration-150"
              >
                {secondaryActionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
