import { cn } from "@/lib/utils";

type CoachShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function CoachShell({ children, className }: CoachShellProps) {
  return (
    <div className={cn("mx-auto max-w-7xl space-y-8 px-4 py-6 sm:py-8 md:px-6 lg:space-y-10 lg:px-8", className)}>
      {children}
    </div>
  );
}
