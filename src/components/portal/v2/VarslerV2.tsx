"use client";

/**
 * PlayerHQ Varsler — Train-lock-porten.
 * Fasit: designsystem/train-lock/PH-20 Varsel-ark.dc.html
 *
 * Liste med hairline-delte rader: 8px prikk (hvit = ulest, dim = lest),
 * tittel 15/600, sub 13 mute, tid til høyre. Tom = «Ingen uleste.» og «Lukk»
 * går tilbake til I dag. Radklikk markerer lest og følger varselets lenke.
 *
 * Ærlig avvik: fasitens svarrad-knapper per varsel finnes ikke i
 * Notification-modellen — radens ene handling er å åpne lenken.
 */

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { markNotificationsRead } from "@/app/portal/(legacy)/varsler/actions";
import { TL } from "@/lib/v2/train-lock";

/* ── Datakontrakt (fra server-loaderen) ────────────────────────────── */

export type VarselKategori = "coach" | "timer" | "foring" | "tester" | "betaling" | "annet";

export type VarslerV2Item = {
  id: string;
  /** v2 ikon-navn (kebab-case), avledet av Notification.type på server. */
  icon: string;
  kategori: VarselKategori;
  tittel: string;
  body: string | null;
  tid: string;
  ulest: boolean;
  link: string | null;
  gruppe: "I dag" | "Denne uka" | "Tidligere";
};

export type VarslerV2Data = {
  items: VarslerV2Item[];
  uleste: number;
  navn: string;
};

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function VarslerV2({ data }: { data: VarslerV2Data }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const { items } = data;
  const tomt = items.length === 0;

  function apne(item: VarslerV2Item) {
    startTransition(async () => {
      if (item.ulest) await markNotificationsRead([item.id]);
      if (item.link) router.push(item.link);
      else router.refresh();
    });
  }

  return (
    <div
      data-od-id="varsler-root"
      style={{
        display: "flex",
        flexDirection: "column",
        maxWidth: 720,
        margin: "0 auto",
        width: "100%",
        minWidth: 0,
        fontFamily: TL.font.sans,
        color: TL.text,
      }}
    >
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>
        Varsler
      </h1>

      {tomt ? (
        <div style={{ marginTop: 10, padding: "15px 0", fontSize: 15, fontWeight: 400, color: TL.mute }}>
          Ingen uleste.
        </div>
      ) : (
        <div style={{ marginTop: 10 }}>
          {items.map((v) => (
            <button
              key={v.id}
              type="button"
              disabled={pending}
              onClick={() => apne(v)}
              data-od-id={`varsler-rad-${v.id}`}
              className="v2-press v2-focus"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: "100%",
                padding: "15px 0",
                borderTop: `1px solid ${TL.hair}`,
                borderBottom: "none",
                borderLeft: "none",
                borderRight: "none",
                background: "transparent",
                color: "inherit",
                fontFamily: TL.font.sans,
                textAlign: "left",
                cursor: "pointer",
                minWidth: 0,
              }}
            >
              <span
                aria-label={v.ulest ? "Ulest" : undefined}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: v.ulest ? TL.text : TL.dim,
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 15,
                    fontWeight: 600,
                    color: v.ulest ? TL.text : TL.mute,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {v.tittel}
                </span>
                {v.body && (
                  <span
                    style={{
                      display: "block",
                      marginTop: 2,
                      fontSize: 13,
                      fontWeight: 400,
                      color: TL.mute,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {v.body}
                  </span>
                )}
              </span>
              <span
                style={{
                  flex: "none",
                  fontSize: 13,
                  fontWeight: 400,
                  color: TL.mute,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {v.tid}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* PH-20: Lukk — tilbake til I dag */}
      <Link
        href="/portal"
        data-od-id="varsler-lukk"
        className="v2-press"
        style={{
          marginTop: 4,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          fontWeight: 600,
          color: TL.mute,
          textDecoration: "none",
        }}
      >
        Lukk
      </Link>
    </div>
  );
}
