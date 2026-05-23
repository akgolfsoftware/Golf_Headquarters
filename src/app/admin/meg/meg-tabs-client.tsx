"use client";

/**
 * Client-komponenter for /admin/meg tabs som trenger lokal state
 * (vise/skjule API-nøkkel + notif-toggles).
 */

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function ApiKeyVisibilityRow({
  name,
  prefix,
  created,
  lastUsed,
}: {
  name: string;
  prefix: string;
  created: string;
  lastUsed: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="grid grid-cols-[160px_1fr_100px_100px_88px] items-center gap-3 border-b border-border py-3 last:border-b-0">
      <div className="font-display text-sm font-semibold">{name}</div>
      <code className="font-mono truncate rounded-md bg-muted/60 px-2.5 py-1 text-[11.5px] text-foreground">
        {visible
          ? `${prefix}_a4f8c2e9d1b6f3a8c5e2d9f1b4a7c3e8`
          : `${prefix}_••••••••••••••••••••••••`}
      </code>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
        {created}
      </div>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
        {lastUsed}
      </div>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="font-display inline-flex h-8 items-center justify-center gap-1 rounded-full border border-border bg-card px-2.5 text-[11px] font-semibold"
      >
        {visible ? (
          <>
            <EyeOff className="h-3 w-3" /> Skjul
          </>
        ) : (
          <>
            <Eye className="h-3 w-3" /> Vis
          </>
        )}
      </button>
    </div>
  );
}

function Toggle({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`relative h-5 w-9 rounded-full transition ${on ? "bg-primary" : "bg-border"}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${on ? "left-[18px]" : "left-0.5"}`}
      />
    </button>
  );
}

export function NotifToggleRow({
  event,
  defaults,
}: {
  event: string;
  defaults: [boolean, boolean, boolean];
}) {
  const [email, setEmail] = useState(defaults[0]);
  const [push, setPush] = useState(defaults[1]);
  const [sms, setSms] = useState(defaults[2]);
  return (
    <div className="grid grid-cols-[1fr_80px_80px_80px] items-center gap-3 border-b border-border py-2.5 last:border-b-0">
      <div className="text-sm font-medium">{event}</div>
      <div className="flex justify-center">
        <Toggle on={email} onClick={() => setEmail((v) => !v)} label={`${event} på e-post`} />
      </div>
      <div className="flex justify-center">
        <Toggle on={push} onClick={() => setPush((v) => !v)} label={`${event} på push`} />
      </div>
      <div className="flex justify-center">
        <Toggle on={sms} onClick={() => setSms((v) => !v)} label={`${event} på SMS`} />
      </div>
    </div>
  );
}
