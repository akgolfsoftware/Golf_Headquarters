import { cn } from "@/lib/utils";

type AthleticEyebrowProps = {
  children: React.ReactNode;
  tone?: "default" | "light" | "lime";
  className?: string;
};

export function AthleticEyebrow({
  children,
  tone = "default",
  className,
}: AthleticEyebrowProps) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
        tone === "default" && "text-muted-foreground",
        tone === "light" && "text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]",
        tone === "lime" && "text-accent",
        className,
      )}
    >
      {children}
    </span>
  );
}
