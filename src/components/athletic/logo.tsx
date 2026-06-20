import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoVariant = "on-light" | "on-dark" | "white-on-green" | "white-mono" | "primary-mono";

export type LogoProps = {
  variant?: LogoVariant;
  height?: number;
  className?: string;
};

const variantSrc: Record<LogoVariant, string> = {
  "on-light":       "/logos/ak-golf-logo-primary-on-light.svg",
  "on-dark":        "/logos/ak-golf-logo-white-on-dark.svg",
  "white-on-green": "/logos/ak-golf-logo-white-on-green.svg",
  "white-mono":     "/logos/ak-golf-logo-white-mono.svg",
  "primary-mono":   "/logos/ak-golf-logo-primary-mono.svg",
};

export function Logo({ variant = "on-light", height = 32, className }: LogoProps) {
  const src = variantSrc[variant];
  const aspectRatio = 538 / 470;
  const width = Math.round(height * aspectRatio);

  return (
    <Image
      src={src}
      alt="AK Golf"
      width={width}
      height={height}
      className={cn("shrink-0", className)}
      priority
    />
  );
}
