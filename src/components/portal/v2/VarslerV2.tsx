"use client";

/**
 * PlayerHQ Varsler — Paper-port W2 (fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-hjem-varsler.html.
 *
 * Struktur per fasit: «Én ting nå» (nyeste uleste varsel — eneste clay på
 * flaten) → filter-chips (Alle/Uleste + kategorier som faktisk finnes i
 * dataene) → seksjoner per dag (I dag / Denne uka / Tidligere) med vrad-rader
 * (ikonboks, tittel + ulest-prikk, brødtekst, tid). Marker-som-lest går via
 * eksisterende markNotificationsRead-action; radklikk markerer lest og følger
 * varselets lenke når den finnes.
 *
 * Ærlig avvik: fasitens svarrad-knapper per varsel («Svar», «Bekreft», …)
 * finnes ikke i Notification-modellen — radens ene handling er å åpne lenken.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { markNotificationsRead } from "@/app/portal/(legacy)/varsler/actions";
import { T } from "@/lib/v2/tokens";
import { Caps, Kort, TomTilstand } from "@/components/v2";
import { Icon } from "@/components/v2/icon";

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

const GRUPPER = ["I dag", "Denne uka", "Tidligere"] as const;

const KATEGORI_LABEL: Record<VarselKategori, string> = {
  coach: "Coach",
  timer: "Timer",
  foring: "Føring",
  tester: "Tester",
  betaling: "Betaling",
  annet: "Annet",
};
const KATEGORI_REKKEFOLGE: VarselKategori[] = ["coach", "timer", "foring", "tester", "betaling", "annet"];

type Filter = "alle" | "ulest" | VarselKategori;

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function VarslerV2({ data }: { data: VarslerV2Data }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<Filter>("alle");

  const { items, uleste, navn } = data;
  const tomt = items.length === 0;

  /** Chips: Alle/Uleste + kun kategorier som finnes i dataene (aldri tomme filtre). */
  const kategorier = KATEGORI_REKKEFOLGE.filter((k) => items.some((i) => i.kategori === k));
  const chips: { id: Filter; label: string }[] = [
    { id: "alle", label: "Alle" },
    { id: "ulest", label: "Uleste" },
    ...kategorier.map((k) => ({ id: k as Filter, label: KATEGORI_LABEL[k] })),
  ];

  const synlige = items.filter((i) =>
    filter === "alle" ? true : filter === "ulest" ? i.ulest : i.kategori === filter,
  );

  const nyesteUlest = items.find((i) => i.ulest) ?? null;

  function apne(item: VarslerV2Item) {
    startTransition(async () => {
      if (item.ulest) await markNotificationsRead([item.id]);
      if (item.link) router.push(item.link);
      else router.refresh();
    });
  }

  return (
    <div
      data-paper-wave-g="varsler"
      data-paper-slug="playerhq-hjem-varsler"
      data-paper-portal-varsler
      style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720, margin: "0 auto", width: "100%", minWidth: 0 }}
    >
      {/* Topp — fasit: Varsler / navn · N uleste */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }} data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>Varsler</h1>
          <span className="num" style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
            {navn}
            {" · "}
            {uleste > 0 ? `${uleste} uleste` : "ingen uleste"}
          </span>
        </div>
      </div>

      {tomt ? (
        /* Tom tilstand — fasit: «Alt er lest» med én vei videre */
        <Kort>
          <TomTilstand
            icon="bell"
            title="Alt er lest"
            sub="Ingen nye varsler. Meldinger fra coachen, timeendringer og påminnelser om føring dukker opp her."
          />
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <Link
              href="/portal"
              data-od-id="varsler-tom-idag"
              className="v2-press v2-focus"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
                padding: "0 16px",
                borderRadius: T.rTag,
                border: `1px solid ${T.border}`,
                background: T.panel,
                color: T.fg,
                fontFamily: T.ui,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Gå til I dag
            </Link>
          </div>
        </Kort>
      ) : (
        <>
          {/* Én ting nå — nyeste uleste; eneste clay på flaten (manifest-vedtak) */}
          {nyesteUlest && (
            <div
              style={{
                background: T.handlingSoft,
                border: `1px solid ${T.border}`,
                borderRadius: T.rCard,
                padding: 16,
              }}
            >
              <Caps color={T.handling}>Én ting nå</Caps>
              <h2 style={{ margin: "8px 0 4px", fontFamily: T.disp, fontSize: 16, fontWeight: 600, color: T.fg }}>
                {nyesteUlest.tittel}
              </h2>
              {nyesteUlest.body && (
                <p style={{ margin: "0 0 12px", fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut, maxWidth: "46ch" }}>
                  {nyesteUlest.body}
                </p>
              )}
              <button
                type="button"
                disabled={pending}
                onClick={() => apne(nyesteUlest)}
                data-od-id="varsler-nu-apne"
                className="v2-press v2-focus"
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 56,
                  borderRadius: T.rTag,
                  border: "none",
                  background: T.handling,
                  color: T.onHandling,
                  fontFamily: T.ui,
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {nyesteUlest.link ? "Åpne varselet" : "Marker som lest"}
              </button>
            </div>
          )}

          {/* Filter-chips — fasit .filtre med aria-pressed */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2, minWidth: 0 }} role="group" aria-label="Filtrer varsler">
            {chips.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={filter === c.id}
                onClick={() => setFilter(c.id)}
                data-od-id={`varsler-filter-${c.id}`}
                className="v2-press v2-focus"
                style={{
                  flex: "none",
                  minHeight: 36,
                  padding: "0 12px",
                  border: `1px solid ${filter === c.id ? T.borderS : T.border}`,
                  borderRadius: T.rPill,
                  background: filter === c.id ? T.panel2 : T.panel,
                  color: T.fg,
                  fontFamily: T.mono,
                  fontSize: 11,
                  fontWeight: filter === c.id ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {synlige.length === 0 ? (
            /* Tom kategori — fasit-tilstand */
            <Kort>
              <TomTilstand icon="bell" title="Ingen varsler i denne kategorien" sub="Bytt filter for å se resten." />
            </Kort>
          ) : (
            GRUPPER.map((gr) => {
              const g = synlige.filter((i) => i.gruppe === gr);
              if (g.length === 0) return null;
              return (
                <section key={gr} style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                    <Caps>{gr}</Caps>
                    <span className="num" style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>
                      {g.length}
                    </span>
                  </div>
                  {g.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      disabled={pending}
                      onClick={() => apne(v)}
                      data-od-id={`varsler-rad-${v.id}`}
                      className="v2-press v2-focus"
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                        width: "100%",
                        textAlign: "left",
                        background: v.ulest ? T.panel2 : T.panel,
                        border: `1px solid ${T.border}`,
                        borderRadius: T.rCard,
                        padding: "12px 16px",
                        marginBottom: 8,
                        color: "inherit",
                        cursor: "pointer",
                        minWidth: 0,
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          flex: "none",
                          width: 34,
                          height: 34,
                          borderRadius: T.rTag,
                          background: T.panel2,
                          border: `1px solid ${T.border}`,
                          display: "grid",
                          placeItems: "center",
                          marginTop: 2,
                          color: T.mut,
                        }}
                      >
                        <Icon name={v.icon} size={16} />
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>
                          <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.tittel}</span>
                          {v.ulest && (
                            <i
                              aria-label="Ulest"
                              style={{ flex: "none", width: 7, height: 7, borderRadius: "50%", background: T.fg }}
                            />
                          )}
                        </span>
                        {v.body && (
                          <span style={{ display: "block", fontFamily: T.bodyFont, fontSize: 13, color: T.mut, marginTop: 2 }}>
                            {v.body}
                          </span>
                        )}
                        <span
                          className="num"
                          style={{
                            display: "block",
                            fontFamily: T.mono,
                            fontSize: 10,
                            color: T.mut,
                            marginTop: 6,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                          }}
                        >
                          {v.tid}
                        </span>
                      </span>
                    </button>
                  ))}
                </section>
              );
            })
          )}
        </>
      )}
    </div>
  );
}
