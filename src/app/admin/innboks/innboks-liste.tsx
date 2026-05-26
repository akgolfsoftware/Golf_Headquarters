"use client";

/**
 * Innboks — samlet listevisning.
 *
 * Tar en flat liste av {@link InboxItem} (godkjennelser, meldinger,
 * oppfølging) og rendrer den som rad-liste med:
 *  - Filter-rad over: alle / uleste / i dag / uka
 *  - Checkbox per rad + master-checkbox
 *  - Bulk-action-rad ("Marker alle som lest")
 *  - Per-rad actions: "Åpne" (lenke) + "Marker behandlet" (server action)
 */

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Inbox,
  Loader2,
} from "lucide-react";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";
import { EmptyState } from "@/components/shared/empty-state";
import {
  markInboxItemDone,
  markInboxItemsRead,
  type InboxItemKind,
} from "./actions";

export type InboxItem = {
  id: string;
  kind: InboxItemKind;
  playerId: string;
  playerName: string;
  summary: string;
  detail: string;
  /** ISO-string slik at vi kan serialisere fra server til client uten Date-issues. */
  timestamp: string;
  unread: boolean;
  severity: "urg" | "warn" | "info";
  href: string;
};

type FilterKey = "alle" | "ulest" | "idag" | "uka";

const FILTER_LABEL: Record<FilterKey, string> = {
  alle: "Alle",
  ulest: "Uleste",
  idag: "I dag",
  uka: "Denne uka",
};

const KIND_LABEL: Record<InboxItemKind, string> = {
  approval: "Godkjenning",
  message: "Melding",
  follow_up: "Oppfølging",
};

const SEVERITY_STYLE: Record<InboxItem["severity"], string> = {
  urg: "bg-destructive",
  warn: "bg-accent",
  info: "bg-muted-foreground/50",
};

function relativTid(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const min = Math.round(diffMs / 60_000);
  if (min < 1) return "nå";
  if (min < 60) return `${min} min`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} t`;
  const dager = Math.round(hr / 24);
  if (dager < 7) return `${dager}d`;
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

function erIDag(iso: string): boolean {
  const d = new Date(iso);
  const nå = new Date();
  return (
    d.getFullYear() === nå.getFullYear() &&
    d.getMonth() === nå.getMonth() &&
    d.getDate() === nå.getDate()
  );
}

function erDenneUka(iso: string): boolean {
  const d = new Date(iso);
  const nå = new Date();
  const syvDagerSiden = new Date(nå.getTime() - 7 * 24 * 60 * 60 * 1000);
  return d.getTime() >= syvDagerSiden.getTime();
}

export function InnboksListe({ items }: { items: InboxItem[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("alle");
  const [valgte, setValgte] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [pendingRow, setPendingRow] = useState<string | null>(null);

  const filtrert = useMemo(() => {
    switch (filter) {
      case "ulest":
        return items.filter((i) => i.unread);
      case "idag":
        return items.filter((i) => erIDag(i.timestamp));
      case "uka":
        return items.filter((i) => erDenneUka(i.timestamp));
      default:
        return items;
    }
  }, [items, filter]);

  // Master-checkbox: alle synlige rader valgt?
  const alleValgt = filtrert.length > 0 && filtrert.every((i) => valgte.has(rowKey(i)));
  const noenValgt = filtrert.some((i) => valgte.has(rowKey(i)));

  function toggleRad(item: InboxItem, checked: boolean) {
    const key = rowKey(item);
    setValgte((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function toggleAlle(checked: boolean) {
    setValgte((prev) => {
      const next = new Set(prev);
      for (const i of filtrert) {
        const key = rowKey(i);
        if (checked) next.add(key);
        else next.delete(key);
      }
      return next;
    });
  }

  function markerValgteSomLest() {
    if (valgte.size === 0) return;
    setFeil(null);

    // Map fra rowKey tilbake til (kind, id)
    const items = Array.from(valgte)
      .map((k) => parseRowKey(k))
      .filter((x): x is { kind: InboxItemKind; id: string } => x !== null);

    startTransition(async () => {
      const res = await markInboxItemsRead(items);
      if (!res.ok) {
        setFeil(res.feil);
        return;
      }
      setValgte(new Set());
      router.refresh();
    });
  }

  function markerEnSomBehandlet(item: InboxItem) {
    setFeil(null);
    setPendingRow(rowKey(item));
    startTransition(async () => {
      const res = await markInboxItemDone(item.kind, item.id);
      setPendingRow(null);
      if (!res.ok) {
        setFeil(res.feil);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Filter-rad */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Filter
        </span>
        {(Object.keys(FILTER_LABEL) as FilterKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-medium transition-colors ${
              filter === key
                ? "bg-foreground text-background"
                : "border border-border bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {FILTER_LABEL[key]}
            <span className="font-mono text-[10px] tabular-nums opacity-70">
              {tellingForFilter(items, key)}
            </span>
          </button>
        ))}

        <span className="flex-1" />

        {noenValgt && (
          <button
            type="button"
            onClick={markerValgteSomLest}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
            Marker valgte som lest ({valgte.size})
          </button>
        )}
      </div>

      {feil && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm text-destructive">
          {feil}
        </div>
      )}

      {/* Liste */}
      {filtrert.length === 0 ? (
        <EmptyState
          icon={Inbox}
          titleItalic="Innboksen"
          titleTrail="er tom"
          sub="Ingen items matcher det aktive filteret. Bytt til «Alle» for å se hele listen."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {/* Bulk-header */}
          <div className="flex items-center gap-4 border-b border-border bg-secondary/40 px-6 py-2">
            <input
              type="checkbox"
              checked={alleValgt}
              onChange={(e) => toggleAlle(e.target.checked)}
              aria-label="Velg alle synlige"
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {alleValgt
                ? `Alle ${filtrert.length} valgt`
                : noenValgt
                  ? `${valgte.size} valgt`
                  : `${filtrert.length} ${filtrert.length === 1 ? "item" : "items"}`}
            </span>
          </div>

          <ul className="divide-y divide-border">
            {filtrert.map((item) => {
              const key = rowKey(item);
              const erValgt = valgte.has(key);
              const radPending = pendingRow === key && pending;
              return (
                <li
                  key={key}
                  className={`group flex items-center gap-4 px-6 py-4 transition-colors ${
                    erValgt ? "bg-accent/10" : "hover:bg-secondary/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={erValgt}
                    onChange={(e) => toggleRad(item, e.target.checked)}
                    aria-label={`Velg ${item.playerName}`}
                    className="h-4 w-4 shrink-0 rounded border-input accent-primary"
                  />

                  {/* Status-prikk */}
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      item.unread
                        ? SEVERITY_STYLE[item.severity]
                        : "bg-border"
                    }`}
                  />

                  {/* Avatar */}
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-[11px] font-semibold text-white"
                    style={{ background: avatarBg(item.playerName) }}
                  >
                    {initialsFromName(item.playerName)}
                  </span>

                  {/* Navn + summary */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-foreground">
                        {item.playerName}
                      </span>
                      <span className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                        {KIND_LABEL[item.kind]}
                      </span>
                      {item.unread && (
                        <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-accent-foreground">
                          ulest
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 truncate text-sm text-foreground">
                      {item.summary}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.detail}
                    </div>
                  </div>

                  {/* Tidsstempel */}
                  <div className="w-16 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                    {relativTid(item.timestamp)}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      Åpne
                      <ChevronRight className="h-3 w-3" strokeWidth={1.75} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => markerEnSomBehandlet(item)}
                      disabled={radPending || pending}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {radPending ? (
                        <Loader2
                          className="h-3 w-3 animate-spin"
                          strokeWidth={1.75}
                        />
                      ) : (
                        <CheckCircle2 className="h-3 w-3" strokeWidth={1.75} />
                      )}
                      Behandlet
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/* =============================================================
   Helpers
   ============================================================= */

function rowKey(item: InboxItem): string {
  return `${item.kind}:${item.id}`;
}

function parseRowKey(
  key: string,
): { kind: InboxItemKind; id: string } | null {
  const sep = key.indexOf(":");
  if (sep === -1) return null;
  const kind = key.slice(0, sep) as InboxItemKind;
  const id = key.slice(sep + 1);
  if (
    (kind !== "approval" && kind !== "message" && kind !== "follow_up") ||
    !id
  ) {
    return null;
  }
  return { kind, id };
}

function tellingForFilter(items: InboxItem[], filter: FilterKey): number {
  switch (filter) {
    case "ulest":
      return items.filter((i) => i.unread).length;
    case "idag":
      return items.filter((i) => erIDag(i.timestamp)).length;
    case "uka":
      return items.filter((i) => erDenneUka(i.timestamp)).length;
    default:
      return items.length;
  }
}
