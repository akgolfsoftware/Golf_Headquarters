import Image from "next/image";
import { cn } from "@/lib/utils";
import { AthleticEyebrow } from "./eyebrow";
import { PulseDot } from "./pulse-dot";

type AthleticHeroProps = {
  imageSrc?: string;
  imageAlt?: string;
  eyebrow?: string;
  weather?: { label: string; pulse?: boolean };
  height?: "sm" | "md" | "lg";
  children?: React.ReactNode;
  className?: string;
};

const heightMap: Record<NonNullable<AthleticHeroProps["height"]>, string> = {
  sm: "h-40",
  md: "h-52",
  lg: "h-64",
};

export function AthleticHero({
  imageSrc,
  imageAlt = "",
  eyebrow,
  weather,
  height = "md",
  children,
  className,
}: AthleticHeroProps) {
  return (
    <div className={cn("relative w-full overflow-hidden", heightMap[height], className)}>
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-emerald-900" />
      )}

      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/55 z-[2]" />

      {(eyebrow || weather) && (
        <div className="absolute left-5 right-5 top-12 z-[5] flex items-center justify-between">
          {eyebrow ? <AthleticEyebrow tone="light">{eyebrow}</AthleticEyebrow> : <span />}
          {weather && (
            <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.06em] text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]">
              {weather.pulse && <PulseDot size="sm" />}
              {weather.label}
            </span>
          )}
        </div>
      )}

      {children && <div className="absolute inset-x-0 bottom-0 z-[5]">{children}</div>}
    </div>
  );
}
