"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ChevronRight, EyeOff, UserPlus } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import {
  sokSpillere,
  sendVenneforesporsel,
  svarPaVenneforesporsel,
  fjernVenn,
  type VennerData,
  type VennRad,
  type SokResultat,
} from "@/lib/venner/actions";

function initials(name: string): string {
  const deler = name.trim().split(/\s+/).filter(Boolean);
  if (deler.length >= 2) return (deler[0][0] + deler[deler.length - 1][0]).toUpperCase();
  return (name.slice(0, 2) || "?").toUpperCase();
}

function AvatarSirkel({ navn, size = 40 }: { navn: string; size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full bg-primary font-semibold text-primary-foreground"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials(navn)}
    </div>
  );
}

function vennSub(v: { hcp: number | null; kategori: string | null }): string {
  const deler: string[] = [];
  if (v.kategori) deler.push(`Kategori ${v.kategori}`);
  if (v.hcp != null) deler.push(`HCP ${v.hcp.toString().replace(".", ",")}`);
  return deler.join(" · ");
}

function SokLeggTil() {
  const [q, setQ] = useState("");
  const [treff, setTreff] = useState<SokResultat[]>([]);
  const [sokt, setSokt] = useState(false);
  const [sendtTil, setSendtTil] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function utforSok(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim().length < 2) return;
    startTransition(async () => {
      const res = await sokSpillere(q.trim());
      setTreff(res);
      setSokt(true);
    });
  }

  function inviter(id: string) {
    startTransition(async () => {
      const res = await sendVenneforesporsel(id);
      if (res.ok) {
        setSendtTil((prev) => new Set(prev).add(id));
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3">
      <form onSubmit={utforSok} className="flex items-center gap-2">
        <div className="flex h-11 flex-1 items-center gap-2 rounded-full border border-border bg-card px-4">
          <Search size={15} strokeWidth={1.5} className="shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSokt(false);
            }}
            placeholder="Søk navn…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="submit"
          disabled={q.trim().length < 2 || pending}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Søk
        </button>
      </form>

      {sokt && (
        <div className="space-y-2">
          {treff.length === 0 ? (
            <p className="px-1 text-xs text-muted-foreground">Ingen spillere funnet.</p>
          ) : (
            treff.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <AvatarSirkel navn={t.name} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold leading-none">{t.name}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{vennSub(t) || "—"}</div>
                </div>
                {sendtTil.has(t.id) ? (
                  <span className="shrink-0 text-[11px] text-muted-foreground">Sendt</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => inviter(t.id)}
                    disabled={pending}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
                  >
                    <UserPlus size={12} strokeWidth={1.5} />
                    Inviter
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ForesporselInnRad({
  friendshipId,
  bruker,
}: {
  friendshipId: string;
  bruker: VennRad;
}) {
  const [pending, startTransition] = useTransition();
  const [svart, setSvart] = useState(false);
  const router = useRouter();

  function svar(valg: "godkjenn" | "avslaa") {
    startTransition(async () => {
      const res = await svarPaVenneforesporsel(friendshipId, valg);
      if (res.ok) {
        setSvart(true);
        router.refresh();
      }
    });
  }

  if (svart) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3">
      <AvatarSirkel navn={bruker.name} size={36} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold leading-none">{bruker.name}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          {vennSub(bruker) ? `${vennSub(bruker)} · ` : ""}vil bli venn
        </div>
      </div>
      <button
        type="button"
        onClick={() => svar("avslaa")}
        disabled={pending}
        className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40"
      >
        Avslå
      </button>
      <button
        type="button"
        onClick={() => svar("godkjenn")}
        disabled={pending}
        className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        Godkjenn
      </button>
    </div>
  );
}

function UtgaendeRad({ friendshipId, bruker }: { friendshipId: string; bruker: VennRad }) {
  const [pending, startTransition] = useTransition();
  const [trukket, setTrukket] = useState(false);
  const router = useRouter();

  function trekkTilbake() {
    startTransition(async () => {
      const res = await fjernVenn(friendshipId);
      if (res.ok) {
        setTrukket(true);
        router.refresh();
      }
    });
  }

  if (trukket) return null;

  return (
    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
      <AvatarSirkel navn={bruker.name} size={28} />
      <span className="flex-1 truncate">{bruker.name}</span>
      <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
        Venter
      </span>
      <button
        type="button"
        onClick={trekkTilbake}
        disabled={pending}
        className="text-[11px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:opacity-40"
      >
        Trekk tilbake
      </button>
    </div>
  );
}

function VennRadKomponent({ v }: { v: VennRad }) {
  return (
    <Link
      href={`/portal/venner/${v.id}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-secondary/40"
    >
      <AvatarSirkel navn={v.name} size={40} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold leading-none">{v.name}</div>
        <div className="mt-1 text-[11.5px] text-muted-foreground">{vennSub(v) || "Ingen delte økter ennå"}</div>
      </div>
      <ChevronRight size={16} strokeWidth={1.5} className="shrink-0 text-muted-foreground" />
    </Link>
  );
}

export function VennerClient({ initial }: { initial: VennerData }) {
  const { venner, innkommende, utgaende } = initial;

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Legg til venn
        </h2>
        <SokLeggTil />
      </section>

      {innkommende.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Venneforespørsler
          </h2>
          <div className="space-y-2">
            {innkommende.map((f) => (
              <ForesporselInnRad key={f.friendshipId} friendshipId={f.friendshipId} bruker={f.bruker} />
            ))}
          </div>
        </section>
      )}

      {utgaende.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Sendt, venter
          </h2>
          <div className="space-y-2">
            {utgaende.map((f) => (
              <UtgaendeRad key={f.friendshipId} friendshipId={f.friendshipId} bruker={f.bruker} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Dine venner ({venner.length})
        </h2>
        {venner.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            titleItalic="Ingen venner"
            titleTrail="ennå"
            sub="Søk over for å legge til den første."
          />
        ) : (
          <div className="space-y-2">
            {venner.map((v) => (
              <VennRadKomponent key={v.id} v={v} />
            ))}
          </div>
        )}
      </section>

      <div className="flex items-start gap-2 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        <EyeOff size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-primary" />
        <span>
          Venner ser kun AT du har trent — aldri plan, fagkoder eller coach-notater. Skru av i{" "}
          <Link href="/portal/meg/innstillinger" className="font-medium text-primary underline-offset-2 hover:underline">
            Meg › Innstillinger › Varsler
          </Link>
          .
        </span>
      </div>
    </div>
  );
}
