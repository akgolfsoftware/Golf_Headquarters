"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  UserPlus,
  ChevronRight,
  Eye,
  BarChart2,
  Check,
  X,
  Clock,
} from "lucide-react";
import {
  sokSpillere,
  sendVenneforesporsel,
  svarPaVenneforesporsel,
  fjernVenn,
  type VennerData,
  type VennRad,
  type SokResultat,
} from "@/lib/venner/actions";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name.slice(0, 2) || "AK").toUpperCase();
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
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <form onSubmit={utforSok} className="ph24v-sok-form">
        <div className="ph24v-sok-input-wrap">
          <Search size={16} style={{ color: "var(--text-muted)", flex: "none" }} />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSokt(false);
            }}
            placeholder="Søk navn…"
            className="ph24v-sok-input"
            aria-label="Søk spillere etter navn"
          />
        </div>
        <button
          type="submit"
          disabled={q.trim().length < 2 || pending}
          className="pa-btn pa-btn--primary"
          style={{ flex: "none", height: 44, padding: "0 18px" }}
        >
          {pending ? "Søker…" : "Søk"}
        </button>
      </form>

      {sokt && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          {treff.length === 0 ? (
            <p style={{ margin: 0, padding: "4px", font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
              Ingen spillere funnet med navnet «{q}».
            </p>
          ) : (
            treff.map((t) => (
              <div key={t.id} className="ph24v-rad">
                <div className="ph24v-avatar">{getInitials(t.name)}</div>
                <div className="ph24v-info">
                  <div className="ph24v-navn">{t.name}</div>
                  <div className="ph24v-sub">{vennSub(t) || "—"}</div>
                </div>
                {sendtTil.has(t.id) ? (
                  <span className="pa-status pa-status--ok" style={{ flex: "none" }}>
                    <Check size={12} style={{ marginRight: 4 }} /> Sendt
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => inviter(t.id)}
                    disabled={pending}
                    className="pa-btn pa-btn--secondary pa-btn--sm"
                    style={{ flex: "none" }}
                  >
                    <UserPlus size={14} style={{ marginRight: 4 }} />
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
    <div className="ph24v-rad" style={{ background: "var(--surface-sunken)" }}>
      <div className="ph24v-avatar">{getInitials(bruker.name)}</div>
      <div className="ph24v-info">
        <div className="ph24v-navn">{bruker.name}</div>
        <div className="ph24v-sub">
          {vennSub(bruker) ? `${vennSub(bruker)} · ` : ""}vil bli venn
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flex: "none" }}>
        <button
          type="button"
          onClick={() => svar("avslaa")}
          disabled={pending}
          className="pa-btn pa-btn--ghost pa-btn--sm"
        >
          <X size={14} style={{ marginRight: 4 }} />
          Avslå
        </button>
        <button
          type="button"
          onClick={() => svar("godkjenn")}
          disabled={pending}
          className="pa-btn pa-btn--primary pa-btn--sm"
        >
          <Check size={14} style={{ marginRight: 4 }} />
          Godkjenn
        </button>
      </div>
    </div>
  );
}

function UtgaendeRad({
  friendshipId,
  bruker,
}: {
  friendshipId: string;
  bruker: VennRad;
}) {
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
    <div className="ph24v-rad">
      <div className="ph24v-avatar">{getInitials(bruker.name)}</div>
      <div className="ph24v-info">
        <div className="ph24v-navn">{bruker.name}</div>
      </div>
      <span className="pa-status pa-status--warn" style={{ flex: "none" }}>
        <Clock size={12} style={{ marginRight: 4 }} /> Venter
      </span>
      <button
        type="button"
        onClick={trekkTilbake}
        disabled={pending}
        className="pa-btn pa-btn--ghost pa-btn--sm"
        style={{ flex: "none" }}
      >
        Trekk tilbake
      </button>
    </div>
  );
}

function VennRadKomponent({ v }: { v: VennRad }) {
  return (
    <Link href={`/portal/venner/${v.id}`} className="ph24v-rad">
      <div className="ph24v-avatar">{getInitials(v.name)}</div>
      <div className="ph24v-info">
        <div className="ph24v-navn">{v.name}</div>
        <div className="ph24v-sub">
          {vennSub(v) || "Ingen delte økter ennå"}
        </div>
      </div>
      <ChevronRight size={18} style={{ color: "var(--text-muted)", flex: "none" }} aria-hidden />
    </Link>
  );
}

export function VennerClient({
  initial,
  visLeaderboard,
}: {
  initial: VennerData;
  visLeaderboard: boolean;
}) {
  const { venner, innkommende, utgaende } = initial;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
      <section className="ph24v-seksjon">
        <h2 className="ph24v-seksjon-tittel">Legg til venn</h2>
        <SokLeggTil />
      </section>

      {innkommende.length > 0 && (
        <section className="ph24v-seksjon">
          <h2 className="ph24v-seksjon-tittel">Venneforespørsler ({innkommende.length})</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {innkommende.map((f) => (
              <ForesporselInnRad
                key={f.friendshipId}
                friendshipId={f.friendshipId}
                bruker={f.bruker}
              />
            ))}
          </div>
        </section>
      )}

      {utgaende.length > 0 && (
        <section className="ph24v-seksjon">
          <h2 className="ph24v-seksjon-tittel">Sendt, venter ({utgaende.length})</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {utgaende.map((f) => (
              <UtgaendeRad
                key={f.friendshipId}
                friendshipId={f.friendshipId}
                bruker={f.bruker}
              />
            ))}
          </div>
        </section>
      )}

      <section className="ph24v-seksjon">
        <h2 className="ph24v-seksjon-tittel">Dine venner ({venner.length})</h2>
        {venner.length === 0 ? (
          <div className="pa-state pa-state--empty">
            <div className="pa-state__icon">
              <UserPlus size={22} />
            </div>
            <div className="pa-state__text">
              <div className="pa-state__title">Ingen venner ennå</div>
              <div className="pa-state__body">
                Søk etter spillere over for å legge til din første venn.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {venner.map((v) => (
              <VennRadKomponent key={v.id} v={v} />
            ))}
          </div>
        )}
      </section>

      {visLeaderboard && (
        <Link
          href="/portal/mal/leaderboard?tab=venner"
          className="ph24v-rad"
          style={{ textDecoration: "none" }}
        >
          <div className="ph24v-avatar" style={{ background: "var(--surface-flat)" }}>
            <BarChart2 size={18} style={{ color: "var(--text-secondary)" }} />
          </div>
          <div className="ph24v-info">
            <div className="ph24v-navn">Se ledertavlen</div>
            <div className="ph24v-sub">Hvor du ligger blant venner</div>
          </div>
          <ChevronRight size={18} style={{ color: "var(--text-muted)", flex: "none" }} aria-hidden />
        </Link>
      )}

      <div className="ph24v-personvern">
        <Eye size={16} style={{ color: "var(--text-secondary)", marginTop: 2, flex: "none" }} aria-hidden />
        <span>
          Venner ser kun AT du har trent — aldri plan, fagkoder eller coach-notater. Du kan endre synlighet under{" "}
          <Link href="/portal/meg/innstillinger">Meg › Innstillinger</Link>.
        </span>
      </div>
    </div>
  );
}
