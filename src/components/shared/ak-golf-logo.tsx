import Image from "next/image";

type Props = {
  variant?: "primary" | "mono" | "white";
  width?: number;
  className?: string;
  alt?: string;
};

const SRC: Record<NonNullable<Props["variant"]>, string> = {
  primary: "/logos/ak-golf-logo-primary-on-light.svg",
  mono: "/logos/ak-golf-logo-black-mono.svg",
  white: "/logos/ak-golf-logo-white-on-dark.svg",
};

/**
 * AK Golf-logo. Brukes overalt der vi før hadde tekst-versjonen.
 * - primary: AK-grønn mot lys bakgrunn (default)
 * - mono: ren sort (kvitteringer, e-post)
 * - white: hvit mot mørk bakgrunn (admin-sidebar)
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
