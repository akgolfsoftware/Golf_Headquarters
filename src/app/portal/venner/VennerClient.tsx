"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  sokSpillere,
  sendVenneforesporsel,
  svarPaVenneforesporsel,
  fjernVenn,
  type VennerData,
  type VennRad,
  type SokResultat,
} from "@/lib/venner/actions";
import { T } from "@/lib/v2/tokens";
import { Caps, TomTilstand, Icon, AvatarInit, StatusPill } from "@/components/v2";

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
      <form onSubmit={utforSok} style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            flex: 1,
            height: 44,
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 9999,
            border: `1px solid ${T.border}`,
            background: T.panel,
            padding: "0 14px",
          }}
        >
          <Icon name="search" size={15} style={{ color: T.mut, flex: "none" }} />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSokt(false);
            }}
            placeholder="Søk navn…"
            style={{
              minWidth: 0,
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: T.ui,
              fontSize: 13.5,
              color: T.fg,
            }}
          />
        </div>
        <button
          type="submit"
          disabled={q.trim().length < 2 || pending}
          style={{
            height: 44,
            flex: "none",
            border: "none",
            borderRadius: 9999,
            background: T.forest,
            color: T.onLime,
            fontFamily: T.ui,
            fontSize: 13.5,
            fontWeight: 600,
            padding: "0 18px",
            cursor: q.trim().length < 2 || pending ? "not-allowed" : "pointer",
            opacity: q.trim().length < 2 || pending ? 0.4 : 1,
          }}
        >
          Søk
        </button>
      </form>

      {sokt && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {treff.length === 0 ? (
            <p style={{ margin: 0, padding: "0 4px", fontFamily: T.ui, fontSize: 12, color: T.mut }}>
              Ingen spillere funnet.
            </p>
          ) : (
            treff.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderRadius: T.rRow,
                  border: `1px solid ${T.border}`,
                  background: T.panel,
                  padding: 12,
                }}
              >
                <AvatarInit navn={t.name} size={36} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontFamily: T.ui,
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: T.fg,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.name}
                  </div>
                  <div style={{ marginTop: 4, fontFamily: T.ui, fontSize: 11, color: T.mut }}>
                    {vennSub(t) || "—"}
                  </div>
                </div>
                {sendtTil.has(t.id) ? (
                  <span style={{ flex: "none", fontFamily: T.ui, fontSize: 11, color: T.mut }}>Sendt</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => inviter(t.id)}
                    disabled={pending}
                    style={{
                      flex: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      borderRadius: 9999,
                      border: `1px solid ${T.border}`,
                      background: "transparent",
                      padding: "6px 12px",
                      fontFamily: T.ui,
                      fontSize: 12,
                      fontWeight: 600,
                      color: T.fg,
                      cursor: pending ? "not-allowed" : "pointer",
                      opacity: pending ? 0.4 : 1,
                    }}
                  >
                    <Icon name="user-plus" size={12} />
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderRadius: T.rRow,
        border: `1px solid ${T.border}`,
        background: T.panel2,
        padding: 12,
      }}
    >
      <AvatarInit navn={bruker.name} size={36} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: T.ui,
            fontSize: 13.5,
            fontWeight: 600,
            color: T.fg,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {bruker.name}
        </div>
        <div style={{ marginTop: 4, fontFamily: T.ui, fontSize: 11, color: T.mut }}>
          {vennSub(bruker) ? `${vennSub(bruker)} · ` : ""}vil bli venn
        </div>
      </div>
      <button
        type="button"
        onClick={() => svar("avslaa")}
        disabled={pending}
        style={{
          flex: "none",
          border: "none",
          borderRadius: 9999,
          background: "transparent",
          padding: "6px 12px",
          fontFamily: T.ui,
          fontSize: 12,
          fontWeight: 600,
          color: T.mut,
          cursor: pending ? "not-allowed" : "pointer",
          opacity: pending ? 0.4 : 1,
        }}
      >
        Avslå
      </button>
      <button
        type="button"
        onClick={() => svar("godkjenn")}
        disabled={pending}
        style={{
          flex: "none",
          border: "none",
          borderRadius: 9999,
          background: T.forest,
          color: T.onLime,
          padding: "6px 12px",
          fontFamily: T.ui,
          fontSize: 12,
          fontWeight: 600,
          cursor: pending ? "not-allowed" : "pointer",
          opacity: pending ? 0.4 : 1,
        }}
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
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: T.ui, fontSize: 13.5, color: T.fg2 }}>
      <AvatarInit navn={bruker.name} size={28} />
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bruker.name}</span>
      <StatusPill tone="info">Venter</StatusPill>
      <button
        type="button"
        onClick={trekkTilbake}
        disabled={pending}
        style={{
          border: "none",
          background: "transparent",
          fontFamily: T.ui,
          fontSize: 11,
          fontWeight: 600,
          color: T.mut,
          textDecoration: "underline",
          textUnderlineOffset: 2,
          cursor: pending ? "not-allowed" : "pointer",
          opacity: pending ? 0.4 : 1,
        }}
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
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderRadius: T.rRow,
        border: `1px solid ${T.border}`,
        background: T.panel,
        padding: 12,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <AvatarInit navn={v.name} size={40} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: T.ui,
            fontSize: 13.5,
            fontWeight: 600,
            color: T.fg,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {v.name}
        </div>
        <div style={{ marginTop: 4, fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>
          {vennSub(v) || "Ingen delte økter ennå"}
        </div>
      </div>
      <Icon name="chevron-right" size={16} style={{ color: T.mut, flex: "none" }} />
    </Link>
  );
}

export function VennerClient({ initial }: { initial: VennerData }) {
  const { venner, innkommende, utgaende } = initial;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Caps>Legg til venn</Caps>
        <SokLeggTil />
      </section>

      {innkommende.length > 0 && (
        <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Caps>Venneforespørsler</Caps>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {innkommende.map((f) => (
              <ForesporselInnRad key={f.friendshipId} friendshipId={f.friendshipId} bruker={f.bruker} />
            ))}
          </div>
        </section>
      )}

      {utgaende.length > 0 && (
        <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Caps>Sendt, venter</Caps>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {utgaende.map((f) => (
              <UtgaendeRad key={f.friendshipId} friendshipId={f.friendshipId} bruker={f.bruker} />
            ))}
          </div>
        </section>
      )}

      <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Caps>Dine venner ({venner.length})</Caps>
        {venner.length === 0 ? (
          <TomTilstand
            icon="user-plus"
            title="Ingen venner ennå"
            sub="Søk over for å legge til den første."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {venner.map((v) => (
              <VennRadKomponent key={v.id} v={v} />
            ))}
          </div>
        )}
      </section>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          borderTop: `1px solid ${T.border}`,
          paddingTop: 14,
          fontFamily: T.ui,
          fontSize: 12,
          lineHeight: 1.5,
          color: T.mut,
        }}
      >
        <Icon name="eye" size={14} style={{ color: T.forest, marginTop: 2, flex: "none" }} />
        <span>
          Venner ser kun AT du har trent — aldri plan, fagkoder eller coach-notater. Skru av i{" "}
          <Link
            href="/portal/meg/innstillinger"
            style={{ fontWeight: 600, color: T.forest, textDecoration: "none" }}
          >
            Meg › Innstillinger › Varsler
          </Link>
          .
        </span>
      </div>
    </div>
  );
}
