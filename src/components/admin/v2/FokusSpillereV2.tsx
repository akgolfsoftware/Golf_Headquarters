"use client";

/**
 * D3 · «Fokus-spillere»-blokk øverst i AgencyOS-cockpiten. 1:1 med mockup-
 * fasit ui_kits/v2/agencyos-fokus.jsx + komponent-kontrakten
 * components/domain/FokusSpillerBlokk.prompt.md, drevet av ekte data
 * (loadFokusSpillere + CoachFokusPin).
 *
 * To soner: «Pinnet av deg» (0–3 kort, unpin-kryss, klikk → spiller-detalj)
 * og «Foreslått nå» (AI, maks 3, ÉN klarspråk-grunn m/ tall+enhet+retning;
 * Pin-knappen er blokkens ENESTE lime-CTA). Anbefalinger — aldri sperrer.
 *
 * Avvis (bevisst førsteversjon, ingen ny datamodell): forslaget skjules for
 * DAGEN på denne enheten (sessionStorage, dags-nøkkel) — teksten i UI lover
 * derfor bare det («skjult ut dagen»), ikke læring vi ikke har.
 */

import { use, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Caps, Kort, AvatarInit, Icon, HjelpTips } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import { MAKS_PINNEDE } from "@/lib/admin/fokus-forslag";
import type { FokusSpillereData } from "@/lib/admin/fokus-spillere-data";
import type { FokusForslag } from "@/lib/admin/fokus-forslag";
import { pinFokusSpiller, fjernFokusPin } from "@/app/admin/agencyos/fokus-actions";

/* Grunn-kilde → «?»-nøkkel i tekstbanken (kun der grunnen bærer et faguttrykk). */
const KILDE_HJELP: Record<FokusForslag["kilde"], "sgTotal" | "planEtterlevelse" | null> = {
  sg: "sgTotal",
  planEtterlevelse: "planEtterlevelse",
  inaktivitet: null,
};

/* Dags-nøkkel for avviste forslag (Oslo-veggklokka er irrelevant her — nøkkelen
   er kun en lokal UI-preferanse på én enhet, aldri forretningslogikk). */
function dagsNokkel(): string {
  const d = new Date();
  return `v2-fokus-avvist:${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function lesAvviste(): string[] {
  try {
    const raw = sessionStorage.getItem(dagsNokkel());
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function lagreAvviste(ids: string[]) {
  try {
    sessionStorage.setItem(dagsNokkel(), JSON.stringify(ids));
  } catch {
    /* sessionStorage utilgjengelig — avvis gjelder da kun til neste innlasting */
  }
}

const GRID = (mobileOneCol = true) =>
  mobileOneCol ? "grid grid-cols-1 lg:grid-cols-3" : "grid grid-cols-3";

// ── Sone 1: pinnet kort ─────────────────────────────────────────
function PinnetKort({
  s,
  onFjern,
  onApne,
  travelt,
}: {
  s: FokusSpillereData["pinnede"][number];
  onFjern: () => void;
  onApne: () => void;
  travelt: boolean;
}) {
  return (
    <div
      className="v2-kort-h"
      onClick={onApne}
      style={{
        background: T.panel2,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: "11px 12px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        minWidth: 0,
        opacity: travelt ? 0.6 : 1,
        transition: "transform 180ms, border-color 180ms, opacity 180ms",
      }}
    >
      <AvatarInit navn={s.navn} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {s.navn}
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.mut, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {s.meta}
        </div>
      </div>
      {/* SG m/ fortegn i up/down-farge — aldri lime (domenefasit). */}
      <span
        style={{ display: "inline-flex", alignItems: "center", gap: 4, flex: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: s.sg == null ? T.mut : s.sgRetning === "down" ? T.down : T.up, fontVariantNumeric: "tabular-nums" }}>
          {s.sg ?? "—"}
        </span>
        {s.sg != null && <HjelpTips k="sgTotal" size={11} align="right" />}
      </span>
      <span
        className="v2-press v2-focus"
        tabIndex={0}
        role="button"
        aria-label={`Fjern pin: ${s.navn}`}
        title="Fjern pin"
        onClick={(e) => {
          e.stopPropagation();
          onFjern();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            onFjern();
          }
        }}
        style={{ width: 24, height: 24, borderRadius: 9999, display: "inline-flex", alignItems: "center", justifyContent: "center", color: T.mut, cursor: "pointer", flex: "none" }}
      >
        <Icon name="pin-off" size={12} strokeWidth={1.5} />
      </span>
    </div>
  );
}

// ── Sone 2: forslagskort ────────────────────────────────────────
function ForslagKort({
  f,
  kanPinne,
  onPin,
  onAvvis,
  travelt,
}: {
  f: FokusForslag;
  kanPinne: boolean;
  onPin: () => void;
  onAvvis: () => void;
  travelt: boolean;
}) {
  const hjelp = KILDE_HJELP[f.kilde];
  return (
    <div
      style={{
        background: T.panel2,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: "11px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minWidth: 0,
        opacity: travelt ? 0.6 : 1,
        transition: "opacity 180ms",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <AvatarInit navn={f.navn} size={26} />
        <span style={{ flex: 1, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {f.navn}
        </span>
        <span
          className="v2-press v2-focus"
          tabIndex={0}
          role="button"
          aria-label={`Avvis forslag: ${f.navn}`}
          title="Avvis — skjul forslaget i dag"
          onClick={onAvvis}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onAvvis();
            }
          }}
          style={{ width: 22, height: 22, borderRadius: 9999, display: "inline-flex", alignItems: "center", justifyContent: "center", color: T.mut, cursor: "pointer", flex: "none" }}
        >
          <Icon name="x" size={12} />
        </span>
      </div>
      {/* Grunnen er det viktigste på kortet — tall m/ enhet og retning. */}
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <Icon
          name={f.retning === "down" ? "trending-down" : "trending-up"}
          size={12}
          style={{ color: f.retning === "down" ? T.down : T.up, flex: "none" }}
        />
        <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.45 }}>{f.grunn}</span>
        {hjelp && <HjelpTips k={hjelp} size={11} />}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {kanPinne ? (
          /* Pin er blokkens ENE lime-moment (jf. komponent-kontrakten). */
          <span
            className="v2-press v2-focus"
            tabIndex={0}
            role="button"
            aria-label={`Pin ${f.navn} som fokus-spiller`}
            onClick={onPin}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPin();
              }
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.ui, fontSize: 11.5, fontWeight: 600, color: T.onLime, background: T.lime, borderRadius: 9999, padding: "6px 12px", cursor: "pointer" }}
          >
            <Icon name="pin" size={11} strokeWidth={1.5} />
            Pin
          </span>
        ) : (
          <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut }}>
            Maks {MAKS_PINNEDE} pinnet — fjern en først.
          </span>
        )}
      </div>
    </div>
  );
}

// ── Laster-tilstand (Suspense-fallback) ─────────────────────────
export function FokusSpillereSkjelett() {
  return (
    <Kort tint eyebrow="Fokus-spillere" action={<Caps size={9}>…</Caps>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
            <span style={{ width: 32, height: 32, borderRadius: 9999, background: T.panel3, flex: "none" }} />
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", width: "48%", height: 10, borderRadius: 5, background: T.panel3 }} />
              <span style={{ display: "block", width: "68%", height: 7, borderRadius: 4, background: T.panel2, marginTop: 6 }} />
            </span>
          </div>
        ))}
      </div>
    </Kort>
  );
}

// ── Blokken ─────────────────────────────────────────────────────
export function FokusSpillereV2({ data }: { data: FokusSpillereData }) {
  const router = useRouter();
  const [travelt, startTransition] = useTransition();
  const [notis, setNotis] = useState<string | null>(null);
  const [avviste, setAvviste] = useState<string[]>([]);

  // sessionStorage leses etter mount (aldri under SSR — unngår hydreringsavvik).
  useEffect(() => {
    setAvviste(lesAvviste());
  }, []);

  const forslag = data.forslag.filter((f) => !avviste.includes(f.playerId));
  const kanPinne = data.pinnede.length < MAKS_PINNEDE;

  const pin = (f: FokusForslag) => {
    startTransition(async () => {
      const res = await pinFokusSpiller(f.playerId);
      setNotis(
        res.ok
          ? `${f.navn} er pinnet — du finner spilleren øverst i cockpiten fra nå av.`
          : (res.error ?? "Kunne ikke pinne spilleren — prøv igjen."),
      );
    });
  };

  const fjern = (s: FokusSpillereData["pinnede"][number]) => {
    startTransition(async () => {
      const res = await fjernFokusPin(s.playerId);
      setNotis(
        res.ok
          ? `${s.navn} er ikke lenger pinnet.`
          : (res.error ?? "Kunne ikke fjerne pin — prøv igjen."),
      );
    });
  };

  const avvis = (f: FokusForslag) => {
    const neste = [...avviste, f.playerId];
    setAvviste(neste);
    lagreAvviste(neste);
    setNotis("Forslaget er skjult ut dagen.");
  };

  return (
    <Kort tint eyebrow="Fokus-spillere" action={<Caps size={9}>{data.pinnede.length} pinnet</Caps>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Sone 1 · Pinnet av deg */}
        <div>
          <Caps size={8.5} style={{ marginBottom: 8 }}>
            Pinnet av deg
          </Caps>
          {data.pinnede.length === 0 ? (
            <div style={{ border: `1px dashed ${T.borderS}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="pin" size={15} strokeWidth={1.5} style={{ color: T.mut, flexShrink: 0 }} />
              <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.5 }}>
                Ingen pinnede ennå. Pin en spiller fra forslagene under, så ligger
                spilleren alltid øverst i cockpiten.
              </span>
            </div>
          ) : (
            <div className={GRID()} style={{ gap: 10 }}>
              {data.pinnede.map((s) => (
                <PinnetKort
                  key={s.playerId}
                  s={s}
                  travelt={travelt}
                  onFjern={() => fjern(s)}
                  onApne={() => router.push(`/admin/spillere/${s.playerId}`)}
                />
              ))}
            </div>
          )}
        </div>
        {/* Sone 2 · Foreslått nå (AI) — ærlig tomtilstand når alt er stabilt */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Icon name="sparkles" size={12} style={{ color: T.lime }} />
            <Caps size={8.5} color={T.lime}>
              Foreslått nå
            </Caps>
          </div>
          {forslag.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 0 2px" }}>
              <Icon name="circle-check" size={14} style={{ color: T.up, flex: "none" }} />
              <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2 }}>
                Alt ser stabilt ut — ingen spillere skiller seg ut akkurat nå.
              </span>
            </div>
          ) : (
            <div className={GRID()} style={{ gap: 10 }}>
              {forslag.map((f) => (
                <ForslagKort
                  key={f.playerId}
                  f={f}
                  kanPinne={kanPinne}
                  travelt={travelt}
                  onPin={() => pin(f)}
                  onAvvis={() => avvis(f)}
                />
              ))}
            </div>
          )}
        </div>
        {notis && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 11px" }}>
            <Icon name="info" size={12} style={{ color: T.fg2, flex: "none" }} />
            <span style={{ flex: 1, fontFamily: T.ui, fontSize: 11.5, color: T.fg2 }}>{notis}</span>
            <span
              className="v2-press v2-focus"
              tabIndex={0}
              role="button"
              aria-label="Lukk melding"
              onClick={() => setNotis(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setNotis(null);
                }
              }}
              style={{ cursor: "pointer", display: "inline-flex" }}
            >
              <Icon name="x" size={11} style={{ color: T.mut }} />
            </span>
          </div>
        )}
      </div>
    </Kort>
  );
}

/** Suspense-innmat: cockpit-siden sender lasteren som promise (streames). */
export function FokusSpillereAsync({ promise }: { promise: Promise<FokusSpillereData> }) {
  const data = use(promise);
  return <FokusSpillereV2 data={data} />;
}
