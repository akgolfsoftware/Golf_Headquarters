import { cn } from "@/lib/utils";

type PulseDotProps = {
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  className?: string;
};

export function PulseDot({ size = "md", glow = true, className }: PulseDotProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-block rounded-full bg-accent",
        size === "sm" && "h-1.5 w-1.5",
        size === "md" && "h-2 w-2",
        size === "lg" && "h-2.5 w-2.5",
        glow && "shadow-[0_0_8px_rgba(209,248,67,0.6)]",
        className,
      )}
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
    </span>
  );
}
