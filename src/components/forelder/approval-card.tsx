"use client";

import { CreditCard, CalendarClock, Video, Check, X, Eye, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ApprovalKind = "payment" | "booking" | "video";

const kindMeta: Record<ApprovalKind, { icon: LucideIcon; category: string; cls: string }> = {
  payment: { icon: CreditCard, category: "Betaling", cls: "bg-warning/15 text-warning-foreground" },
  booking: { icon: CalendarClock, category: "Booking · avbestilling > 24t", cls: "bg-info/10 text-info-foreground" },
  video: { icon: Video, category: "Video-deling", cls: "bg-accent text-primary" },
};

export type ApprovalRequest = {
  kind: ApprovalKind;
  who: string;
  what: string;
  meta: string;
};

/**
 * Godkjenningskort i foreldreportalen. `kind` styrer ikon/kategori. Brukes for
 * betaling, booking-avbestilling og video-deling.
 */
export function ApprovalCard({
  request,
  onApprove,
  onDecline,
  onPreview,
  className,
}: {
  request: ApprovalRequest;
  onApprove?: () => void;
  onDecline?: () => void;
  onPreview?: () => void;
  className?: string;
}) {
  const m = kindMeta[request.kind];
  const btn =
    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em]";
  return (
    <div className={cn("flex flex-col gap-3 rounded-[12px] border border-border bg-card p-4", className)}>
      <span className={cn("inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]", m.cls)}>
        <m.icon className="h-3 w-3" strokeWidth={1.5} />
        {m.category}
      </span>

      <div className="rounded-lg border border-border bg-background p-3">
        <div className="text-sm font-bold text-foreground">{request.who}</div>
        <div className="mt-1 text-xs leading-[1.5] text-foreground">{request.what}</div>
        <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">{request.meta}</div>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" onClick={onApprove} className={cn(btn, "bg-primary text-accent")}>
          <Check className="h-3 w-3" strokeWidth={2} />Godkjenn
        </button>
        {request.kind === "video" && (
          <button type="button" onClick={onPreview} className={cn(btn, "border border-border bg-card text-foreground hover:bg-secondary")}>
            <Eye className="h-3 w-3" strokeWidth={1.5} />Forhåndsvis
          </button>
        )}
        <button type="button" onClick={onDecline} className={cn(btn, "text-destructive hover:bg-destructive/5")}>
          <X className="h-3 w-3" strokeWidth={2} />Avslå
        </button>
      </div>
    </div>
  );
}
