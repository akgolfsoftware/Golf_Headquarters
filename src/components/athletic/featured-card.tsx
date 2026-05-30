import Image from "next/image";
import { cn } from "@/lib/utils";
import { AthleticEyebrow } from "./eyebrow";
import { PulseDot } from "./pulse-dot";

type FeaturedCardProps = {
  eyebrow?: string;
  showPulse?: boolean;
  title: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  action?: React.ReactNode;
  minHeight?: number;
  className?: string;
  children?: React.ReactNode;
};

export function FeaturedCard({
  eyebrow,
  showPulse = false,
  title,
  description,
  imageSrc,
  imageAlt = "",
  action,
  minHeight = 180,
  className,
  children,
}: FeaturedCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-emerald-900 p-6 text-white",
        className,
      )}
      style={{ minHeight }}
    >
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="absolute inset-0 object-cover opacity-60 mix-blend-multiply"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/80 to-emerald-900/60" />
      <div
        aria-hidden
        className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent opacity-15 blur-sm"
      />

      <div className="relative z-10 flex h-full flex-col">
        {eyebrow && (
          <div className="mb-4 flex items-center gap-2">
            {showPulse && <PulseDot size="sm" />}
            <AthleticEyebrow tone="lime">{eyebrow}</AthleticEyebrow>
          </div>
        )}
        <h3 className="font-display max-w-[22ch] text-xl font-bold leading-tight tracking-[-0.015em] md:text-2xl">
          {title}
        </h3>
        {description && (
          <p className="mt-2 max-w-[36ch] font-mono text-xs leading-relaxed text-white/85 md:text-[13px]">
            {description}
          </p>
        )}
        {children && <div className="mt-4 flex-1">{children}</div>}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
