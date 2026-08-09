import Image from "next/image";

type Props = {
  variant?: "primary" | "mono" | "white" | "on-paper" | "on-ink" | "on-accent";
  width?: number;
  className?: string;
  alt?: string;
};

/**
 * Paper-palett (designsystem/paper/uploads/ak-golf-logo-bruk.md + assets/).
 * Canonical sources under /logos/paper/ after Paper (2) sync 2026-08-09.
 */
const SRC: Record<NonNullable<Props["variant"]>, string> = {
  primary: "/logos/paper/ak-golf-logo-on-paper.svg",
  "on-paper": "/logos/paper/ak-golf-logo-on-paper.svg",
  mono: "/logos/paper/ak-golf-logo-mono-ink.svg",
  white: "/logos/paper/ak-golf-logo-mono-paper.svg",
  "on-ink": "/logos/paper/ak-golf-logo-on-ink.svg",
  "on-accent": "/logos/paper/ak-golf-logo-on-accent.svg",
};

/**
 * AK Golf-logo (Image-variant for e-post/marketing).
 * - primary / on-paper: full logo on light (paper)
 * - mono: ink mono for light surfaces
 * - white: paper mono for dark/rail
 * - on-ink / on-accent: full logo on dark / clay
 */
export function AkGolfLogo({
  variant = "primary",
  width = 56,
  className = "",
  alt = "AK Golf",
}: Props) {
  return (
    <Image
      src={SRC[variant]}
      alt={alt}
      width={width}
      height={Math.round(width * (470 / 538))}
      className={className}
      priority
    />
  );
}
