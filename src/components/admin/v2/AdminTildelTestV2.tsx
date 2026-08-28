"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * AgencyOS — Tildel test-modal, v2-port 16. juli 2026.
 *
 * Delt av to ruter (`/admin/tester/tildel/[spillerId]` og
 * `/admin/spillere/[id]/tildel-test`) som tidligere hadde to divergerende
 * hand-bygde implementasjoner (`tildel-modal.tsx` — usstilt, ingen CSS for
 * klassene fantes i det hele tatt — og `tildel-test-modal-screen.tsx` —
 * fabrikerte «HCP 4.8 · 12/36 tester gjennomført · A1»-tall). Denne
 * komponenten er ÉN kanon-versjon, komponert av v2-primitiver, matet med
 * EKTE spillerkategori (A–K) og ekte gjennomførte/tildelte test-tall fra
 * TestAssignment — ingen fabrikerte tall. Samme `tildelTest`-server-action
 * uendret.
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Caps, AkseChip, Knapp, StatusPill, TomTilstand } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { tildelTest } from "@/app/admin/(legacy)/tester/tildel/[spillerId]/actions";

export type PyramidArea = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
const PYRAMID_FILTERS: Array<"Alle" | PyramidArea> = ["Alle", "FYS", "TEK", "SLAG", "SPILL", "TURN"];

export interface AdminTildelTestItem {
  id: string;
  name: string;
  description: string;
  pyramidArea: PyramidArea;
}

export interface AdminTildelTestV2Data {
  spillerId: string;
  spillerNavn: string;
  /** A–K, null hvis ikke beregnbart (ingen runder/HCP). */
  kategori: string | null;
  hcpLabel: string;
  fullforte: number;
  totalt: number;
  tester: AdminTildelTestItem[];
  /** Hvor "Tildel test" navigerer etter suksess. */
  tilbakeHref: string;
}

export function AdminTildelTestV2({ data }: { data: AdminTildelTestV2Data }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Alle" | PyramidArea>("Alle");
  const [selectedId, setSelectedId] = useState<string>(data.tester[0]?.id ?? "");
  const [dato, setDato] = useState("");
  const [notat, setNotat] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const pyrCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of data.tester) c[t.pyramidArea] = (c[t.pyramidArea] ?? 0) + 1;
    return c;
  }, [data.tester]);

  const filtered = useMemo(
    () =>
      data.tester.filter((t) => {
        if (filter !== "Alle" && t.pyramidArea !== filter) return false;
        if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [data.tester, filter, search],
  );

  function lukk() {
    router.back();
  }

  function send() {
    setFeil(null);
    startTransition(async () => {
      const res = await tildelTest({
        spillerId: data.spillerId,
        testId: selectedId,
        note: notat,
        dueDate: dato || undefined,
      });
      if (res.ok) router.push(data.tilbakeHref);
      else setFeil(res.error ?? "Kunne ikke tildele testen.");
    });
  }

  return (
    <div data-paper-wave-h="tildeltest" data-paper-pattern 
      role="dialog"
      aria-modal="true"
      aria-label="Tildel test"
      onClick={(e) => {
        if (e.target === e.currentTarget) lukk();
      }}
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "grid", placeItems: "center", background: TL.scrim, padding: 16 }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "88vh",
          overflowY: "auto",
          borderRadius: TL.radius.card,
          background: TL.elev,
          border: `1px solid ${TL.hair}`,
          boxShadow: "none",
        }}
      >
        <div style={{ position: "sticky", top: 0, background: TL.elev, padding: "18px 22px 14px", borderBottom: `1px solid ${TL.hair}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, zIndex: 1 }}>
          <div>
            <Caps>AgencyOS · Stall · Spillere</Caps>
            <h2 style={{ margin: "8px 0 0", fontFamily: TL.font.sans, fontWeight: 700, fontSize: 19, color: TL.text }}>
              Tildel test til <strong>{data.spillerNavn}</strong>
            </h2>
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <StatusPill tone="info">
                {data.fullforte}/{data.totalt} tester gjennomført
              </StatusPill>
              {data.kategori && <StatusPill tone="lime">Kategori {data.kategori}</StatusPill>}
            </div>
          </div>
          <button
            onClick={lukk}
            aria-label="Lukk"
            style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 8, background: TL.dock, border: `1px solid ${TL.hair}`, color: TL.mute, cursor: "pointer", flex: "none" }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: TL.dock, border: `1px solid ${TL.hair}` }}>
            <span style={{ width: 36, height: 36, borderRadius: 9999, background: TL.dim, border: `1px solid ${TL.hair}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: TL.font.mono, fontSize: 12, fontWeight: 700, color: TL.mute, flex: "none" }}>
              {data.spillerNavn.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase()}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 14, color: TL.text }}>{data.spillerNavn}</div>
              <div style={{ fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>
                {data.hcpLabel} · {data.tester.length} tester i biblioteket
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 12, fontWeight: 600, color: TL.mute, marginBottom: 8 }}>
              Velg test <span style={{ color: TL.danger }}>*</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, borderRadius: 10, border: `1px solid ${TL.hair}`, background: TL.dock, padding: "0 12px" }}>
              <Icon name="search" size={14} style={{ color: TL.mute }} />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Søk test, disiplin, mål …"
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: TL.font.sans, fontSize: 13, color: TL.text }}
              />
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              {PYRAMID_FILTERS.map((f) => {
                const count = f === "Alle" ? data.tester.length : (pyrCounts[f] ?? 0);
                const on = filter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    style={{ appearance: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, height: 28, padding: "0 10px", borderRadius: 9999, background: on ? TL.fill : TL.dim, border: `1px solid ${on ? "transparent" : TL.hair}`, color: on ? TL.onFill : TL.text, fontFamily: TL.font.sans, fontSize: 11.5, fontWeight: on ? 600 : 500 }}
                  >
                    {f} <span style={{ fontFamily: TL.font.mono, fontSize: 10, opacity: 0.8 }}>{count}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 10, borderRadius: 12, border: `1px solid ${TL.hair}`, overflow: "hidden" }}>
              {filtered.length === 0 ? (
                <TomTilstand
                  icon="search"
                  title={data.tester.length === 0 ? "Ingen tester i biblioteket" : "Ingen tester matcher"}
                  sub={data.tester.length === 0 ? "Opprett tester under Tester før du tildeler." : "Prøv et annet søk eller filter."}
                />
              ) : (
                filtered.map((t, i) => {
                  const isSel = t.id === selectedId;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer", background: isSel ? `color-mix(in srgb, ${TL.fill} 10%, transparent)` : "transparent", borderTop: i ? `1px solid ${TL.hair}` : "none" }}
                    >
                      <AkseChip a={t.pyramidArea} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>{t.name}</div>
                        <div style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, marginTop: 2 }}>{t.description}</div>
                      </div>
                      {isSel && <Icon name="check" size={15} style={{ color: TL.fill, flex: "none" }} />}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 12, fontWeight: 600, color: TL.mute, marginBottom: 8 }}>Frist (valgfritt)</div>
            <input
              type="date"
              value={dato}
              onChange={(e) => setDato(e.target.value)}
              style={{ width: "100%", height: 40, borderRadius: 10, border: `1px solid ${TL.hair}`, background: TL.dock, padding: "0 12px", fontFamily: TL.font.mono, fontSize: 13, color: TL.text, boxSizing: "border-box" }}
            />
          </div>

          <div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 12, fontWeight: 600, color: TL.mute, marginBottom: 8 }}>Notat til spiller</div>
            <textarea
              value={notat}
              onChange={(e) => setNotat(e.target.value)}
              rows={4}
              placeholder={`Hva skal ${data.spillerNavn.split(" ")[0]} ha i tankene før testen?`}
              style={{ width: "100%", borderRadius: 10, border: `1px solid ${TL.hair}`, background: TL.dock, padding: 12, fontFamily: TL.font.sans, fontSize: 13, color: TL.text, outline: "none", resize: "vertical", boxSizing: "border-box" }}
            />
            <div style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, marginTop: 4 }}>Spilleren får varsel i appen · {notat.length} / 280 tegn</div>
          </div>
        </div>

        <div style={{ position: "sticky", bottom: 0, background: TL.elev, padding: "14px 22px", borderTop: `1px solid ${TL.hair}`, display: "flex", alignItems: "center", gap: 8 }}>
          {feil && <span style={{ marginRight: "auto", fontFamily: TL.font.mono, fontSize: 11, color: TL.danger }}>{feil}</span>}
          <Knapp ghost disabled={pending} onClick={lukk}>
            Avbryt
          </Knapp>
          <Knapp icon="arrow-right" disabled={!selectedId || pending} onClick={send}>
            {pending ? "Tildeler…" : "Tildel test"}
          </Knapp>
        </div>
      </div>
    </div>
  );
}
