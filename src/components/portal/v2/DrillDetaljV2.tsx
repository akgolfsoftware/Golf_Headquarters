"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ · Drill-detalj — Paper-port W1 (fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-drill-detalj.html.
 *
 * Struktur per fasit: header (navn + mono-sub) → «hva den trener» →
 * «AK-formelen · slot for slot» → clay-CTA «Legg i neste økt».
 * Ærlig-prinsippet fra loaderen består: slots og seksjoner vises kun når
 * feltene faktisk finnes — aldri fabrikerte verdier. Trinn (avkryssbare),
 * media, coach-notat og parametere er reelle data uten fasit-motpart og
 * beholdes som egne kort (Enkelhet: behold funksjoner).
 */

import { useState } from "react";
import Link from "next/link";
import { Kort, AvatarInit, TomTilstand } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import type { AkseKey } from "@/lib/v2/format";

export type DrillDetaljV2Data = {
  akse: AkseKey;
  /** Mono-sublinje under navnet, f.eks. "Innspill · 35 min · 30 reps". */
  sub: string;
  navn: string;
  beskrivelse: string | null;
  /** AK-formelen slot for slot — kun slots med faktisk verdi. */
  slots: { k: string; v: string }[];
  /** Utledede trinn — tom liste skjuler seksjonen. */
  trinn: { n: number; text: string }[];
  coachNotat: string | null;
  coachNavn: string;
  /** Tilgjengelige media — tom liste gir ærlig «Media kommer». */
  media: { kind: "video" | "foto"; label: string; url: string }[];
  /** Parameter-tabell — kun rader med faktisk verdi. */
  params: { key: string; value: string }[];
  /** «din bruk» — Sist brukt / Siste 30 dager (samme kilde som øvelsesbanken).
      «Beste resultat» finnes ikke i datamodellen og utelates ærlig. */
  bruk: { k: string; v: string }[];
  hrefLeggTilIPlan: string;
};

export function DrillDetaljV2({ data }: { data: DrillDetaljV2Data }) {
  // Avkryssbare trinn — ren klient-tilstand, lagres ikke.
  const [gjort, setGjort] = useState<Set<number>>(new Set());

  function toggleTrinn(n: number) {
    setGjort((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  return (
    <div
      data-paper-slug="playerhq-drill-detalj"
      data-od-id="playerhq-drill-detalj"
      style={{ maxWidth: 720, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}
    >
      {/* Topp — fasit: navn + mono-sub */}
      <div style={{ minWidth: 0 }}>
        <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {data.navn}
        </h1>
        <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>
          {data.sub}
        </span>
      </div>

      {/* Hva den trener */}
      {data.beskrivelse && (
        <Kort eyebrow="hva den trener">
          <p style={{ fontFamily: TL.font.sans, fontSize: 14, color: TL.mute, lineHeight: 1.6, margin: 0 }}>
            {data.beskrivelse}
          </p>
        </Kort>
      )}

      {/* AK-formelen · slot for slot — kun slots med faktisk verdi */}
      {data.slots.length > 0 && (
        <Kort eyebrow="AK-formelen · slot for slot">
          <div>
            {data.slots.map((s, i) => (
              <div
                key={s.k}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "8px 0",
                  fontSize: 12.5,
                  borderBottom: i === data.slots.length - 1 ? "none" : `1px solid ${TL.hair}`,
                }}
              >
                <span style={{ flex: "none", width: 96, fontFamily: TL.font.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: TL.mute, paddingTop: 2 }}>
                  {s.k}
                </span>
                <span style={{ fontFamily: TL.font.sans, color: TL.mute }}>{s.v}</span>
              </div>
            ))}
          </div>
        </Kort>
      )}

      {/* Din bruk — fasit: Sist brukt / Siste 30 dager (Beste resultat utelatt ærlig) */}
      {data.bruk.length > 0 && (
        <Kort eyebrow="din bruk">
          <div>
            {data.bruk.map((b, i) => (
              <div
                key={b.k}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: i === data.bruk.length - 1 ? "none" : `1px solid ${TL.hair}`,
                }}
              >
                <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>{b.k}</span>
                <span style={{ fontFamily: TL.font.mono, fontSize: 12.5, fontWeight: 700, color: TL.text, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {b.v}
                </span>
              </div>
            ))}
          </div>
        </Kort>
      )}

      {/* Trinn — reelle data (fra prerequisites), uten fasit-motpart */}
      {data.trinn.length > 0 && (
        <Kort
          eyebrow="Slik gjør du det"
          action={
            <span style={{ fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
              {gjort.size}/{data.trinn.length}
            </span>
          }
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {data.trinn.map((t, i) => {
              const on = gjort.has(t.n);
              return (
                <div
                  key={t.n}
                  role="checkbox"
                  aria-checked={on}
                  tabIndex={0}
                  className="v2-press v2-focus"
                  onClick={() => toggleTrinn(t.n)}
                  style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 0", borderBottom: i === data.trinn.length - 1 ? "none" : `1px solid ${TL.hair}`, cursor: "pointer" }}
                >
                  <span style={{ marginTop: 1, width: 20, height: 20, borderRadius: 7, border: `2px solid ${on ? TL.fill : TL.hair}`, background: on ? TL.fill : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                    {on && <Icon name="check" size={13} style={{ color: TL.onFill }} />}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, color: TL.mute, marginRight: 8 }}>{t.n}.</span>
                    <span style={{ fontFamily: TL.font.sans, fontSize: 13.5, color: on ? TL.mute : TL.text, lineHeight: 1.55, textDecoration: on ? "line-through" : "none" }}>
                      {t.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Kort>
      )}

      {/* Media — kun det som faktisk finnes; ellers ærlig tomtilstand */}
      <Kort eyebrow="Media">
        {data.media.length === 0 ? (
          <TomTilstand icon="video" title="Media kommer" sub="Video eller bilder for drillen er ikke lastet opp ennå." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {data.media.map((m, i) => (
              <a
                key={i}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="v2-row-h"
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 10px", margin: "0 -10px", borderRadius: 10, borderBottom: i === data.media.length - 1 ? "none" : `1px solid ${TL.hair}`, textDecoration: "none" }}
              >
                <span style={{ width: 30, height: 30, borderRadius: 9999, background: TL.dim, border: `1px solid ${TL.hair}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <Icon name={m.kind === "video" ? "video" : "image"} size={14} style={{ color: TL.mute }} />
                </span>
                <span style={{ flex: 1, fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text }}>{m.label}</span>
                <Icon name="external-link" size={13} style={{ color: TL.mute }} />
              </a>
            ))}
          </div>
        )}
      </Kort>

      {/* Coach-notat */}
      {data.coachNotat && (
        <Kort eyebrow="Coach-notat" tint>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <AvatarInit navn={data.coachNavn} size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: TL.font.sans, fontSize: 12, fontWeight: 600, color: TL.mute, display: "block" }}>{data.coachNavn}</span>
              <p style={{ fontFamily: TL.font.sans, fontSize: 13.5, color: TL.text, lineHeight: 1.6, margin: "6px 0 0" }}>{data.coachNotat}</p>
            </div>
          </div>
        </Kort>
      )}

      {/* Parametere */}
      {data.params.length > 0 && (
        <Kort eyebrow="Parametere">
          <div>
            {data.params.map((p, i) => (
              <div key={p.key} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: i === data.params.length - 1 ? "none" : `1px solid ${TL.hair}` }}>
                <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>{p.key}</span>
                <span style={{ fontFamily: TL.font.mono, fontSize: 12.5, fontWeight: 700, color: TL.text, textAlign: "right" }}>{p.value}</span>
              </div>
            ))}
          </div>
        </Kort>
      )}

      {/* Kontrakt §3: skjermens ene aksenthandling (fasit: sist på siden) */}
      <Link
        href={data.hrefLeggTilIPlan}
        data-od-id="drilld-legg"
        className="v2-press v2-focus"
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 56,
          width: "100%",
          borderRadius: TL.radius.card,
          background: TL.fill,
          color: TL.onFill,
          fontFamily: TL.font.sans,
          fontSize: 14,
          fontWeight: 600,
        }}
        data-paper-en-ting="true"
      >
        Legg i neste økt
      </Link>

      {/* Eier-fotnote — fasit: hvorfor ingen godkjenning trengs */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          fontFamily: TL.font.sans,
          fontSize: 12.5,
          color: TL.mute,
          lineHeight: 1.6,
          paddingBottom: 24,
        }}
      >
        <Icon name="pencil" size={14} style={{ color: TL.mute, flex: "none", marginTop: 3 }} />
        <span>
          Å legge en drill i egen økt endrer ikke ukeplanen — derfor ingen godkjenning. Anders
          får beskjed og kan justere om det kolliderer med tema.
        </span>
      </div>
    </div>
  );
}
