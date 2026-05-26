"use client";

import type { Partner } from "@/lib/v2-fixtures";

export type PartnerCardProps = {
  partner: Partner;
  onInvite?: (partner: Partner) => void;
};

export default function PartnerCard({ partner, onInvite }: PartnerCardProps) {
  return (
    <div
      className="lift flex items-center gap-[14px] p-4 rounded-[14px] border border-border cursor-pointer"
      style={{ background: "var(--card)" }}
    >
      {/* Avatar */}
      <div
        className="w-11 h-11 rounded-full grid place-items-center flex-shrink-0 font-display font-bold text-[14px]"
        style={{
          background: "color-mix(in oklab, var(--primary) 90%, transparent)",
          color: "var(--accent)",
        }}
      >
        {partner.initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-display font-semibold text-[15px]">
            {partner.name}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            HCP <span className="tabular">{partner.hcp.toFixed(1)}</span>
          </span>
        </div>
        <div className="text-[12px] text-muted-foreground mt-[2px]">
          {partner.akademi} · {partner.lastSession}
        </div>
      </div>

      {/* Invite button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onInvite?.(partner);
        }}
        className="flex-shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-foreground rounded-full border border-border px-4 py-[6px]"
        style={{ background: "var(--card)" }}
        type="button"
      >
        Inviter
      </button>
    </div>
  );
}
