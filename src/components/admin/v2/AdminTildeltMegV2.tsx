import { TL } from "@/lib/v2/train-lock";
import Link from "next/link";
import { Kort, TomTilstand, StatusPill, CTAPill } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
/**
 * AgencyOS Tildelt meg — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * Ventende handlinger samlet. T.* only.
 */

export interface TildeltMegItem {
  icon: string;
  tittel: string;
  meta: string;
  href: string;
}
export interface AdminTildeltMegV2Data {
  items: TildeltMegItem[];
  antallOrd: string;
}

export function AdminTildeltMegV2({ data }: { data: AdminTildeltMegV2Data }) {
  const n = data.items.length;
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Tildelt meg</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>AgencyOS</span>
        </div>
        <p style={{ fontFamily: TL.font.sans, fontSize: 13, lineHeight: 1.55, color: TL.mute, margin: "10px 0 0", maxWidth: 560 }}>
          Alt som venter på en handling fra deg, samlet ett sted.
        </p>
      </div>
      <StatusPill tone={n === 0 ? "lime" : "warn"}>{n === 0 ? "Ingenting venter" : `${n} saker`}</StatusPill>
    </div>
  );

  const primaerCta = (
    <Link href="/admin/godkjenninger" style={{ textDecoration: "none", display: "block" }}>
      <CTAPill icon="check-circle" full>
        Åpne godkjenninger
      </CTAPill>
    </Link>
  );

  if (n === 0) {
    return (
      <div data-paper-wave-h="tildeltmeg" data-paper-pattern  style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {hode}
        <Kort>
          <TomTilstand
            icon="check-circle"
            title="Ingenting venter på deg"
            sub="Godt jobbet. Nye saker fra agenter og forespørsler lander her automatisk."
          />
        </Kort>
        {primaerCta}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {hode}
      {primaerCta}
      <Kort pad="4px 18px">
        {data.items.map((it, i) => (
          <Link
            key={`${it.href}-${i}`}
            href={it.href}
            style={{
              display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 2px",
              borderTop: i ? `1px solid ${TL.hair}` : "none", textDecoration: "none",
            }}
          >
            <span style={{ display: "inline-flex", flex: "none", paddingTop: 2 }}>
              <Icon name={it.icon} size={18} style={{ color: TL.text }} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>{it.tittel}</span>
              <span style={{ display: "block", marginTop: 2, fontFamily: TL.font.mono, fontSize: 10, color: TL.mute }}>{it.meta}</span>
            </span>
            <Icon name="chevron-right" size={18} style={{ color: TL.mute, alignSelf: "center", flex: "none" }} />
          </Link>
        ))}
      </Kort>
    </div>
  );
}
