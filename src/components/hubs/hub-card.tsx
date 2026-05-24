import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HubCardProps = {
  href?: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  data: ReactNode;
  sub?: ReactNode;
  statusPill?: ReactNode;
  visual?: ReactNode;
  cta?: string;
  tone?: "default" | "empty" | "muted" | "accent";
};

export function HubCard({
  href,
  icon: IconComponent,
  eyebrow,
  title,
  data,
  sub,
  statusPill,
  visual,
  cta = "Åpne →",
  tone = "default",
}: HubCardProps) {
  const className = cn("hub-card", `tone-${tone}`);
  const content = (
    <>
      <div className="hub-card-top">
        <div className="hub-card-icon">
          <IconComponent size={20} strokeWidth={1.75} aria-hidden />
        </div>
        {statusPill}
      </div>
      <div className="hub-card-body">
        <div className="eyebrow">{eyebrow}</div>
        <h3 className="hub-card-title">{title}</h3>
      </div>
      <div className="hub-card-divider" />
      <div className="hub-card-data">
        <div className="hub-card-prim">{data}</div>
        {sub ? <div className="hub-card-sub">{sub}</div> : null}
        {visual}
      </div>
      <div className="hub-card-cta">
        <span>{cta}</span>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return <div className={className}>{content}</div>;
}
