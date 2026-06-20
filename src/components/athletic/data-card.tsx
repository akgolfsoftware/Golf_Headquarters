import { cn } from "@/lib/utils";

export type DataCardProps = {
  children: React.ReactNode;
  title?: string;
  className?: string;
};

const gridStyle = {
  backgroundColor: "var(--t-bg-2)",
  backgroundImage: `
    linear-gradient(var(--t-line-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--t-line-soft) 1px, transparent 1px)
  `,
  backgroundSize: "30px 30px",
} as React.CSSProperties;

export function DataCard({ children, title, className }: DataCardProps) {
  return (
    <div
      className={cn("rounded-[var(--r-md)] p-4 md:p-6", className)}
      style={gridStyle}
    >
      {title && (
        <p className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-[var(--t-fg)] opacity-60">
          {title}
        </p>
      )}
      <div className="text-[var(--t-fg)]">{children}</div>
    </div>
  );
}
