"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Calendar, MessageSquare, Trophy, ClipboardList, Info } from "lucide-react";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
};

type Props = {
  notifications: NotificationItem[];
  basePath?: string; // /portal/varsler eller /admin/varsler
};

function ikonForType(type: string) {
  switch (type) {
    case "booking":
      return Calendar;
    case "plan":
      return ClipboardList;
    case "achievement":
      return Trophy;
    case "melding":
      return MessageSquare;
    default:
      return Info;
  }
}

export function NotificationBell({
  notifications,
  basePath = "/portal/varsler",
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const ulest = notifications.filter((n) => !n.readAt).length;
  const visning = notifications.slice(0, 5);

  // Lukk ved klikk utenfor
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function markerAlleLest() {
    startTransition(async () => {
      await fetch("/api/notifications/mark-all-read", { method: "POST" });
      router.refresh();
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
        aria-label={`Varsler${ulest > 0 ? ` (${ulest} uleste)` : ""}`}
      >
        <Bell className="h-4 w-4" strokeWidth={1.75} />
        {ulest > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-destructive px-1 font-mono text-[9px] font-semibold text-destructive-foreground">
            {ulest > 9 ? "9+" : ulest}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-display text-sm font-semibold">Varsler</span>
            {ulest > 0 && (
              <button
                type="button"
                onClick={markerAlleLest}
                disabled={pending}
                className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary hover:underline disabled:opacity-50"
              >
                {pending ? "..." : "Marker alle lest"}
              </button>
            )}
          </div>

          {visning.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Ingen varsler ennå.
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {visning.map((n) => {
                const Icon = ikonForType(n.type);
                const innhold = (
                  <div
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-secondary/40 ${
                      !n.readAt ? "bg-primary/5" : ""
                    }`}
                  >
                    <span className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-sm font-semibold text-foreground">
                        {n.title}
                      </div>
                      {n.body && (
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {n.body}
                        </div>
                      )}
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                        {timeAgo(n.createdAt)}
                      </div>
                    </div>
                    {!n.readAt && (
                      <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                );
                return (
                  <li
                    key={n.id}
                    className="border-b border-border/40 last:border-0"
                  >
                    {n.link ? (
                      <Link
                        href={n.link}
                        onClick={() => setOpen(false)}
                      >
                        {innhold}
                      </Link>
                    ) : (
                      innhold
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-border bg-secondary/30 px-4 py-2 text-center">
            <Link
              href={basePath}
              className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary hover:underline"
              onClick={() => setOpen(false)}
            >
              Se alle varsler →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(d: Date): string {
  const sek = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sek < 60) return "akkurat nå";
  if (sek < 3600) return `${Math.floor(sek / 60)} min siden`;
  if (sek < 86400) return `${Math.floor(sek / 3600)} t siden`;
  if (sek < 7 * 86400) return `${Math.floor(sek / 86400)} d siden`;
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}
