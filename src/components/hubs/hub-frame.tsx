import { cn } from "@/lib/utils";
import "./hubs.css";

export function HubFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("hub-frame", className)}>
      <div className="hub-page">{children}</div>
    </div>
  );
}
