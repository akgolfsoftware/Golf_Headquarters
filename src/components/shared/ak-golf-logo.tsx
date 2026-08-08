import Image from "next/image";

type Props = {
  variant?: "primary" | "mono" | "white";
  width?: number;
  className?: string;
  alt?: string;
};

/** Paper-palett (ak-golf-logo-bruk.md) — aldri Presis grønn/lime. */
const SRC: Record<NonNullable<Props["variant"]>, string> = {
  primary: "/logos/ak-golf-logo-primary-on-light.svg",
  mono: "/logos/ak-golf-logo-black-mono.svg",
  white: "/logos/ak-golf-logo-white-on-dark.svg",
};

/**
 * AK Golf-logo (Image-variant for e-post/marketing).
 * - primary: ink + clay prikk på lys flate
 * - mono: sort
 * - white: paper-wordmark + clay prikk på mørk flate
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
