"use client";

import { useState } from "react";
import { Mail, MessageSquare, Bell, Send, X, Check, MailOpen, MousePointerClick, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── MessageComposer ───────────────────────────────────────────────────── */

type Channel = "email" | "sms" | "push";
const channelMeta: Record<Channel, { label: string; icon: typeof Mail }> = {
  email: { label: "E-post", icon: Mail },
  sms: { label: "SMS", icon: MessageSquare },
  push: { label: "Push", icon: Bell },
};

export function MessageComposer({
  recipients,
  onSend,
  className,
}: {
  recipients: string[];
  onSend?: () => void;
  className?: string;
}) {
  const [channels, setChannels] = useState<Set<Channel>>(new Set(["email", "push"]));
  const toggle = (c: Channel) =>
    setChannels((s) => {
      const n = new Set(s);
      if (n.has(c)) n.delete(c);
      else n.add(c);
      return n;
    });

  return (
    <div className={cn("rounded-[12px] border border-border bg-card p-4", className)}>
      <div className="mb-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">Ny gruppemelding</div>

      <label className="mb-1 block font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">Til</label>
      <div className="flex flex-wrap gap-1.5 rounded-md border border-border bg-background px-2 py-2">
        {recipients.map((r) => (
          <span key={r} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-foreground">
            {r}
            <button type="button" aria-label={`Fjern ${r}`} className="text-muted-foreground hover:text-foreground">
              <X className="h-2.5 w-2.5" strokeWidth={2} />
            </button>
          </span>
        ))}
      </div>

      <label className="mb-1 mt-3 block font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">Emne</label>
      <input className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-xs text-foreground outline-none focus:border-primary" placeholder="Sesongavslutning og sommerplan" />

      <label className="mb-1 mt-3 block font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">Melding</label>
      <textarea rows={4} className="w-full resize-none rounded-md border border-border bg-background px-2.5 py-2 text-xs leading-[1.5] text-foreground outline-none focus:border-primary" placeholder="Skriv til foreldrene …" />

      <div className="mt-3 flex items-center gap-3">
        <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">Kanaler</span>
        <div className="flex gap-1.5">
          {(Object.keys(channelMeta) as Channel[]).map((c) => {
            const on = channels.has(c);
            const Icon = channelMeta[c].icon;
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggle(c)}
                aria-pressed={on}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.08em]",
                  on ? "border-primary bg-primary text-accent" : "border-border bg-card text-muted-foreground hover:bg-secondary",
                )}
              >
                <Icon className="h-3 w-3" strokeWidth={1.5} />{channelMeta[c].label}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={onSend} className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-accent">
          <Send className="h-3 w-3" strokeWidth={1.5} />Send
        </button>
      </div>
    </div>
  );
}

/* ── ReadReceiptList ───────────────────────────────────────────────────── */

export type ReceiptState = "read" | "unread" | "clicked" | "bounce";

const receiptMeta: Record<ReceiptState, { label: string; icon: typeof Check; cls: string }> = {
  read: { label: "Lest", icon: MailOpen, cls: "text-success" },
  unread: { label: "Ulest", icon: Mail, cls: "text-muted-foreground" },
  clicked: { label: "Klikket", icon: MousePointerClick, cls: "text-primary" },
  bounce: { label: "Bounce", icon: AlertTriangle, cls: "text-destructive" },
};

export type Receipt = { initials: string; name: string; state: ReceiptState; when?: string };

export function ReadReceiptList({ receipts, className }: { receipts: Receipt[]; className?: string }) {
  return (
    <div className={cn("divide-y divide-border", className)}>
      {receipts.map((r, i) => {
        const m = receiptMeta[r.state];
        return (
          <div key={i} className="flex items-center gap-2.5 px-1 py-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-secondary font-display text-[10px] font-bold text-foreground">{r.initials}</span>
            <span className="flex-1 text-xs font-semibold text-foreground">{r.name}</span>
            {r.when && <span className="font-mono text-[9px] text-muted-foreground">{r.when}</span>}
            <span className={cn("inline-flex items-center gap-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.08em]", m.cls)}>
              <m.icon className="h-3 w-3" strokeWidth={1.5} />{m.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
