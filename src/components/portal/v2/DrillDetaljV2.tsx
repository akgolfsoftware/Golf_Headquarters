"use client";

/**
 * PlayerHQ · Drill-detalj — v2 (retning C «Presis»).
 * v2-port 16. juli 2026: erstatter DrillDetalj (v10, components/portal/drills).
 *
 * Kun presentasjonslaget er nytt (v2-primitiver + T-tokens). Datakontrakten
 * speiler loaderens ærlige prinsipp: tomme seksjoner utelates eller vises som
 * ærlige tomtilstander (media uten filer → «Media kommer»), aldri fabrikerte
 * tall. Avkryssbare trinn (klient-tilstand, lagres ikke) er bevart fra v10.
 */

import { useState } from "react";
import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  AkseChip,
  MikroMeta,
  CTAPill,
  AvatarInit,
  TomTilstand,
  HjelpTips,
} from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import type { AkseKey } from "@/lib/v2/tokens";

export type DrillMetaChip = {
  icon: "clock" | "list" | "target" | "zap";
  text: string;
};

export type DrillDetaljV2Data = {
  akse: AkseKey;
  /** Eyebrow, f.eks. "SLAG · INNSPILL". */
  eyebrow: string;
  navn: string;
  beskrivelse: string | null;
  meta: DrillMetaChip[];
  /** Utledede trinn — tom liste skjuler seksjonen. */
  trinn: { n: number; text: string }[];
  coachNotat: string | null;
  coachNavn: string;
  /** Tilgjengelige media — tom liste gir ærlig «Media kommer». */
  media: { kind: "video" | "foto"; label: string; url: string }[];
  /** Parameter-tabell — kun rader med faktisk verdi. */
  params: { key: string; value: string }[];
  hrefBibliotek: string;
  hrefLeggTilIPlan: string;
};

/** v10-metaikonene → Icon-navn i v2-kartet ("zap" finnes ikke → "activity"). */
const META_IKON: Record<DrillMetaChip["icon"], string> = {
  clock: "clock",
  list: "list",
  target: "target",
  zap: "activity",
};

export function DrillDetaljV2({ data }: { data: DrillDetaljV2Data }) {
  // Avkryssbare trinn — ren klient-tilstand (som i v10), lagres ikke.
  const [gjort, setGjort] = useState<Set<number>>(new Set());

  function toggleTrinn(n: number) {
    setGjort((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  const harCsMeta = data.meta.some((m) => m.text.toUpperCase().includes("CS"));

  return (
    <div style={{ maxWidth: 720, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Header */}
      <div>
        <Caps>{data.eyebrow}</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel>{data.navn}</Tittel>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <AkseChip a={data.akse} />
          {data.meta.map((m, i) => (
            <MikroMeta key={i} icon={META_IKON[m.icon]}>
              {m.text}
            </MikroMeta>
          ))}
          {harCsMeta && <HjelpTips k="csNivaa" size={12} />}
        </div>
      </div>

      {/* Beskrivelse */}
      {data.beskrivelse && (
        <Kort eyebrow="Om drillen">
          <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.6, margin: 0 }}>
            {data.beskrivelse}
          </p>
        </Kort>
      )}

      {/* Trinn */}
      {data.trinn.length > 0 && (
        <Kort
          eyebrow="Slik gjør du det"
          action={
            <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, fontVariantNumeric: "tabular-nums" }}>
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
                  style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 0", borderBottom: i === data.trinn.length - 1 ? "none" : `1px solid ${T.border}`, cursor: "pointer" }}
                >
                  <span style={{ marginTop: 1, width: 20, height: 20, borderRadius: 7, border: `2px solid ${on ? T.lime : T.borderS}`, background: on ? T.lime : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                    {on && <Icon name="check" size={13} style={{ color: T.onLime }} />}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut, marginRight: 8 }}>{t.n}.</span>
                    <span style={{ fontFamily: T.ui, fontSize: 13.5, color: on ? T.mut : T.fg, lineHeight: 1.55, textDecoration: on ? "line-through" : "none" }}>
                      {t.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Kort>
      )}

      {/* Media */}
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
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 10px", margin: "0 -10px", borderRadius: 10, borderBottom: i === data.media.length - 1 ? "none" : `1px solid ${T.border}`, textDecoration: "none" }}
              >
                <span style={{ width: 30, height: 30, borderRadius: 9999, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <Icon name={m.kind === "video" ? "video" : "image"} size={14} style={{ color: T.fg2 }} />
                </span>
                <span style={{ flex: 1, fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{m.label}</span>
                <Icon name="external-link" size={13} style={{ color: T.mut }} />
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
              <span style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg2, display: "block" }}>{data.coachNavn}</span>
              <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg, lineHeight: 1.6, margin: "6px 0 0" }}>{data.coachNotat}</p>
            </div>
          </div>
        </Kort>
      )}

      {/* Parametere */}
      {data.params.length > 0 && (
        <Kort eyebrow="Parametere">
          <div>
            {data.params.map((p, i) => (
              <div key={p.key} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: i === data.params.length - 1 ? "none" : `1px solid ${T.border}` }}>
                <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>{p.key}</span>
                <span style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: T.fg, textAlign: "right" }}>{p.value}</span>
              </div>
            ))}
          </div>
        </Kort>
      )}

      {/* CTA-er */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href={data.hrefLeggTilIPlan} style={{ textDecoration: "none" }}>
          <CTAPill icon="plus">Legg til i plan</CTAPill>
        </Link>
        <Link href={data.hrefBibliotek} style={{ textDecoration: "none" }}>
          <CTAPill ghost icon="arrow-left">Til øvelsesbanken</CTAPill>
        </Link>
      </div>
    </div>
  );
}
