"use client";

/**
 * Widget-pakke — «Målsetninger» (PlayerHQ).
 *
 * De viktigste aktive målene med fremdrift fra den FELLES beregningen
 * (src/lib/domain/maal-fremdrift.ts) — samme prosent her som på /portal/mal.
 * Data fra getMaalWidgetData (src/lib/widgets/maal-widget-data.ts).
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MaalWidgetData, MaalWidgetMaal } from "@/lib/widgets/maal-widget-data";
import {
  T,
  Caps,
  Kort,
  StatusPill,
  ProgresjonsBar,
  TomTilstand,
  CTAPill,
  type StatusTone,
} from "@/components/v2";

const TONE: Record<MaalWidgetMaal["status"], StatusTone> = {
  "on-track": "info",
  behind: "warn",
  achieved: "up",
};

export function MaalWidget({ data }: { data: MaalWidgetData }) {
  const router = useRouter();
  const { antallAktive, maal } = data;

  return (
    <Kort
      eyebrow="Målsetninger"
      action={
        antallAktive > 0 ? (
          <Link href="/portal/mal" style={{ textDecoration: "none" }}>
            <Caps size={9} style={{ cursor: "pointer" }}>
              {antallAktive} aktive →
            </Caps>
          </Link>
        ) : undefined
      }
    >
      {maal.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TomTilstand
            icon="target"
            title="Ingen mål ennå"
            sub="Sett et mål — det gir treningen retning."
          />
          <Link href="/portal/mal" style={{ textDecoration: "none" }}>
            <CTAPill icon="target" ghost full>
              Sett ditt første mål
            </CTAPill>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {maal.map((m) => (
            <div
              key={m.id}
              className="v2-press"
              role="link"
              tabIndex={0}
              onClick={() => router.push(m.href)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") router.push(m.href);
              }}
              style={{ cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <Caps size={9} style={{ display: "inline", color: T.mut }}>{m.typeLabel}</Caps>
                  <span
                    style={{
                      fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}
                  >
                    {m.tittel}
                  </span>
                </span>
                <StatusPill tone={TONE[m.status]}>{m.statusLabel}</StatusPill>
              </div>
              <ProgresjonsBar
                value={m.pct}
                max={100}
                label={<span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.fg2 }}>{m.sub}</span>}
                color={m.status === "behind" ? T.warn : T.lime}
              />
            </div>
          ))}
        </div>
      )}
    </Kort>
  );
}
