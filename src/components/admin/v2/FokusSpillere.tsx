"use client";

/**
 * Fokus-spiller-blokk (D3) — øverst i AgencyOS-cockpiten.
 *
 * To soner, bygget kun av v2-primitivene:
 *   - «Pinnet av deg» (0–3): kort-klikk → spiller-detalj, stjerne → løsne.
 *   - «Foreslått nå» (maks 3): hvert kort med ÉN klarspråk-grunn (tall + enhet +
 *     retning), stjerne → fest, X → avvis. Forslag er ANBEFALINGER — aldri
 *     alarmer/sperrer. «Avvis» er ren klient-state (ingen persistering).
 *
 * Tomtilstander er ærlige: ingen pinnet → hint om hvordan feste; ingen forslag
 * (eller alle avvist) → «Alt ser stabilt ut», ikke en tom boks.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Kort, Caps, AvatarFoto, TomTilstand, HjelpTips, Icon } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import type { FokusData } from "@/lib/agencyos/fokus-spillere";
import { pinnSpiller, avpinnSpiller } from "@/app/admin/agencyos/actions";

/** Liten ikon-knapp (fest/løsne/avvis) — v2-press + fokusring, token-farger. */
function IkonKnapp({
  icon,
  title,
  tone = "mut",
  onClick,
  disabled,
}: {
  icon: string;
  title: string;
  tone?: "mut" | "lime";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="v2-press v2-focus"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        appearance: "none",
        flex: "none",
        width: 30,
        height: 30,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 9999,
        background: T.panel3,
        border: `1px solid ${T.border}`,
        color: tone === "lime" ? T.lime : T.mut,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Icon name={icon} size={14} />
    </button>
  );
}

function Tile({
  href,
  navn,
  sub,
  avatarUrl,
  children,
  onNavigate,
}: {
  href: string;
  navn: string;
  sub?: React.ReactNode;
  avatarUrl: string | null;
  children?: React.ReactNode;
  onNavigate: (href: string) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="v2-row-h v2-focus"
      onClick={() => onNavigate(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onNavigate(href);
        }
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "10px 11px",
        borderRadius: 12,
        background: T.panel2,
        border: `1px solid ${T.border}`,
        cursor: "pointer",
      }}
    >
      <AvatarFoto src={avatarUrl} navn={navn} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: T.ui,
            fontSize: 13.5,
            fontWeight: 600,
            color: T.fg,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {navn}
        </div>
        {sub && <div style={{ marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

export function FokusSpillere({ fokus }: { fokus: FokusData }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  // Avvis + nettopp-festet skjules umiddelbart (optimistisk); serverdata henter
  // resten inn ved neste last (router.refresh).
  const [skjulte, setSkjulte] = useState<Set<string>>(new Set());
  const [feil, setFeil] = useState<string | null>(null);

  const go = (href: string) => router.push(href);

  const skjul = (playerId: string) =>
    setSkjulte((s) => new Set(s).add(playerId));

  const festSpiller = (playerId: string) => {
    setFeil(null);
    skjul(playerId); // optimistisk: forsvinner fra forslag
    start(async () => {
      const res = await pinnSpiller(playerId);
      if (!res.ok) {
        // Rull tilbake skjuling ved feil (f.eks. maks 3 nådd).
        setSkjulte((s) => {
          const neste = new Set(s);
          neste.delete(playerId);
          return neste;
        });
        setFeil(res.error ?? "Kunne ikke feste spilleren.");
        return;
      }
      router.refresh();
    });
  };

  const losneSpiller = (playerId: string) => {
    setFeil(null);
    start(async () => {
      const res = await avpinnSpiller(playerId);
      if (!res.ok) {
        setFeil(res.error ?? "Kunne ikke løsne spilleren.");
        return;
      }
      router.refresh();
    });
  };

  const avvis = (playerId: string) => {
    setFeil(null);
    skjul(playerId);
  };

  const synligeForslag = fokus.forslag.filter((f) => !skjulte.has(f.playerId));

  // ── Sone 1: Pinnet av deg ───────────────────────────────────────
  const pinnetSone = (
    <Kort
      eyebrow="Pinnet av deg"
      action={
        fokus.pinnet.length > 0 ? (
          <Caps size={9}>
            {fokus.pinnet.length} av 3
          </Caps>
        ) : undefined
      }
    >
      {fokus.pinnet.length === 0 ? (
        <TomTilstand
          icon="star"
          title="Ingen festet ennå"
          sub="Fest en spiller fra et forslag her — eller fra Stallen — så ligger de alltid øverst."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {fokus.pinnet.map((p) => (
            <Tile
              key={p.playerId}
              href={p.href}
              navn={p.navn}
              avatarUrl={p.avatarUrl}
              onNavigate={go}
              sub={p.sub ? <Caps size={9}>{p.sub}</Caps> : undefined}
            >
              <IkonKnapp
                icon="star"
                tone="lime"
                title="Løsne fra fokus"
                disabled={pending}
                onClick={() => losneSpiller(p.playerId)}
              />
            </Tile>
          ))}
        </div>
      )}
    </Kort>
  );

  // ── Sone 2: Foreslått nå ────────────────────────────────────────
  const forslagSone = (
    <Kort
      tint
      eyebrow={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="sparkles" size={11} style={{ color: T.lime }} />
          Foreslått nå
        </span>
      }
      action={synligeForslag.length > 0 ? <Caps size={9}>Anbefaling</Caps> : undefined}
    >
      {synligeForslag.length === 0 ? (
        <TomTilstand
          icon="check-circle"
          title="Alt ser stabilt ut"
          sub="Ingen spillere skiller seg ut på plan-etterlevelse eller Strokes Gained akkurat nå."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {synligeForslag.map((f) => (
            <Tile
              key={f.playerId}
              href={f.href}
              navn={f.navn}
              avatarUrl={f.avatarUrl}
              onNavigate={go}
              sub={
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontFamily: T.ui,
                    fontSize: 11.5,
                    color: T.fg2,
                    lineHeight: 1.4,
                  }}
                >
                  {f.grunn}
                  <HjelpTips k={f.hjelp} size={11} />
                </span>
              }
            >
              <IkonKnapp
                icon="star"
                title="Fest denne spilleren"
                disabled={pending}
                onClick={() => festSpiller(f.playerId)}
              />
              <IkonKnapp
                icon="x"
                title="Avvis forslag"
                disabled={pending}
                onClick={() => avvis(f.playerId)}
              />
            </Tile>
          ))}
        </div>
      )}
    </Kort>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: T.gap }}>
        {pinnetSone}
        {forslagSone}
      </div>
      {feil && (
        <div
          role="status"
          style={{
            fontFamily: T.ui,
            fontSize: 12,
            color: T.warn,
            padding: "8px 12px",
            borderRadius: 10,
            background: `color-mix(in srgb, ${T.warn} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${T.warn} 30%, transparent)`,
          }}
        >
          {feil}
        </div>
      )}
    </div>
  );
}
