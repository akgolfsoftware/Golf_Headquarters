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
        "font-mono text-[10px] font-bold uppercase tracking-[0.10em]",
        tone === "default" && "text-muted-foreground",
        tone === "light" && "text-background/90 [text-shadow:0_1px_4px_hsl(var(--foreground)/0.4)]",
        tone === "lime" && "text-accent",
        className,
      )}
    >
      {children}
    </span>
  );
}
