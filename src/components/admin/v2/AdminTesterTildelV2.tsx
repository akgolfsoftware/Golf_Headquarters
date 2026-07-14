"use client";

/**
 * AgencyOS v2 — Tester · Tildel test (`/admin/tester/tildel` +
 * `/admin/tester/tildel/[spillerId]`, AgencyOS Bølge 3.27, 2026-07-14).
 * Port fra `(legacy)/tester/tildel/page.tsx` + `[spillerId]/page.tsx` +
 * `tildel-modal.tsx` — samme `tildelTest`-server-action-kontrakt.
 *
 * MERK (funnet under porten): legacy-modalen brukte egendefinerte CSS-
 * klasser (`tester-modal`, `te-pyr-filter`, `te-ply-chip` osv.) som IKKE
 * har noen matchende stilark noe sted i kodebasen — skjermen rendret
 * altså HELT ustylet i prod. v2-porten her er derfor en reell forbedring,
 * ikke bare et redesign. Samme (litt uvanlige) startverdier er bevart:
 * søkefeltet startet forhåndsutfylt med «putt» og filteret på «SLAG» i
 * stedet for «Alle» — dette var slik i legacy også, ikke fikset her.
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTilbake } from "@/components/v2/back-button";
import { Caps, Tittel, Kort, Knapp, StatusPill, Icon, T, BunnArk } from "@/components/v2";
import { tildelTest } from "@/app/admin/(legacy)/tester/tildel/[spillerId]/actions";

export interface TildelSpillerRadV2 {
  id: string;
  name: string;
  hcpTekst: string;
}

export function AdminTildelVelgSpillerV2({ spillere }: { spillere: TildelSpillerRadV2[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps size={9}>Analysere · Tester</Caps>
        <Tittel em="velg spiller">Registrer test</Tittel>
        <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Velg spilleren du vil registrere eller tildele en test for.</p>
      </div>

      {spillere.length === 0 ? (
        <Kort><p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut }}>Ingen spillere funnet.</p></Kort>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {spillere.map((s) => (
            <Link key={s.id} href={`/admin/tester/tildel/${s.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel, padding: "12px 16px", textDecoration: "none" }}>
              <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{s.name}</span>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>{s.hcpTekst}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

type PyramidArea = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
const PYRAMID_FILTERS = ["Alle", "FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

// Fallback-sample hvis ingen TestDefinition i DB (bevart fra legacy — se
// fil-toppens merknad).
const SAMPLE_TESTS: TildelTestItemV2[] = [
  { id: "s1", name: "Putt 1–3 m", description: "30 putt · 1m, 2m, 3m · % sunket · ~12 min", pyramidArea: "SLAG" },
  { id: "s2", name: "Putt 4–8 m", description: "20 putt · 4m, 6m, 8m · proximity til hull · ~10 min", pyramidArea: "SLAG" },
  { id: "s3", name: "Putt langdistanse 10–20 m", description: "15 putt · proximity 3-putt unngåelse · ~12 min", pyramidArea: "SLAG" },
  { id: "s4", name: "Chip landingsone 15 m", description: "10 chip · 3m landingsone · % i sone · ~8 min", pyramidArea: "SLAG" },
];

export interface TildelTestItemV2 {
  id: string;
  name: string;
  description: string;
  pyramidArea: PyramidArea;
}

export interface TildelSpillerV2 {
  id: string;
  name: string;
  initials: string;
  hcp: string;
}

export function AdminTildelTestModalV2({
  spiller,
  tester,
  pyrCounts,
}: {
  spiller: TildelSpillerV2;
  tester: TildelTestItemV2[];
  pyrCounts: Record<string, number>;
}) {
  const router = useRouter();
  const allTests = tester.length > 0 ? tester : SAMPLE_TESTS;
  const [search, setSearch] = useState("putt");
  const [activeFilter, setActiveFilter] = useState<(typeof PYRAMID_FILTERS)[number]>("SLAG");
  const [selectedTestId, setSelectedTestId] = useState<string>(allTests[0]?.id ?? "");
  const [dato, setDato] = useState("");
  const [notat, setNotat] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filteredTests = useMemo(() => {
    return allTests.filter((t) => {
      if (activeFilter !== "Alle" && t.pyramidArea !== activeFilter) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allTests, activeFilter, search]);

  const handleClose = useTilbake(`/admin/spillere/${spiller.id}/tester`);

  function handleSend() {
    setFeil(null);
    startTransition(async () => {
      const res = await tildelTest({ spillerId: spiller.id, testId: selectedTestId, note: notat, dueDate: dato || undefined });
      if (res.ok) router.push("/admin/tester");
      else setFeil(res.error ?? "Kunne ikke tildele testen.");
    });
  }

  return (
    <BunnArk tittel={<>Tildel test til <em style={{ fontStyle: "italic", color: T.lime }}>{spiller.name}</em></>} onLukk={handleClose} laast={pending} bredde={560}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 14px" }}>
          <span style={{ width: 36, height: 36, borderRadius: 9999, background: T.lime, display: "grid", placeItems: "center", fontFamily: T.disp, fontWeight: 700, fontSize: 13, color: T.onLime, flex: "none" }}>{spiller.initials}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{spiller.name}</div>
            <div style={{ marginTop: 1, fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>HCP {spiller.hcp}</div>
          </div>
        </div>

        <div>
          <Caps size={9}>Velg test <span style={{ color: T.down }}>*</span></Caps>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, borderRadius: 10, border: `1px solid ${T.borderS}`, background: T.panel2, padding: "9px 12px" }}>
            <Icon name="search" size={14} style={{ color: T.mut }} />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Søk test, disiplin, mål …" style={{ flex: 1, border: "none", background: "none", outline: "none", fontFamily: T.ui, fontSize: 13, color: T.fg }} />
          </div>

          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {PYRAMID_FILTERS.map((f) => {
              const count = f === "Alle" ? allTests.length : pyrCounts[f] ?? 0;
              const aktiv = activeFilter === f;
              return (
                <button key={f} type="button" onClick={() => setActiveFilter(f)} style={{ borderRadius: 9999, border: aktiv ? "none" : `1px solid ${T.border}`, background: aktiv ? T.lime : T.panel2, padding: "5px 12px", fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, color: aktiv ? T.onLime : T.fg, cursor: "pointer" }}>
                  {f} <span style={{ opacity: 0.7 }}>{count}</span>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflowY: "auto" }}>
            {filteredTests.length === 0 ? (
              <div style={{ padding: "24px 0", textAlign: "center", fontFamily: T.mono, fontSize: 12, color: T.mut }}>Ingen tester matcher</div>
            ) : (
              filteredTests.map((t) => {
                const valgt = t.id === selectedTestId;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTestId(t.id)}
                    style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 10, border: `1px solid ${valgt ? T.lime : T.border}`, background: valgt ? `color-mix(in srgb, ${T.lime} 8%, transparent)` : T.panel2, padding: "10px 12px", cursor: "pointer" }}
                  >
                    <StatusPill tone="info">{t.pyramidArea}</StatusPill>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{t.name}</div>
                      <div style={{ marginTop: 1, fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>{t.description}</div>
                    </div>
                    {valgt && <Icon name="check" size={16} style={{ color: T.lime, flex: "none" }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <label style={{ display: "block" }}>
          <Caps size={9} style={{ display: "block", marginBottom: 7 }}>Frist (valgfritt)</Caps>
          <input type="date" value={dato} onChange={(e) => setDato(e.target.value)} style={{ width: "100%", boxSizing: "border-box", height: 40, borderRadius: 10, border: `1px solid ${T.borderS}`, background: T.panel2, padding: "0 12px", fontFamily: T.mono, fontSize: 13, color: T.fg }} />
        </label>

        <label style={{ display: "block" }}>
          <Caps size={9} style={{ display: "block", marginBottom: 7 }}>Notat til spiller</Caps>
          <textarea value={notat} onChange={(e) => setNotat(e.target.value)} rows={4} maxLength={280} placeholder="Hva skal spilleren ha i tankene før testen?" style={{ width: "100%", boxSizing: "border-box", borderRadius: 10, border: `1px solid ${T.borderS}`, background: T.panel2, padding: "10px 13px", fontFamily: T.ui, fontSize: 13.5, color: T.fg, resize: "vertical" }} />
          <div style={{ marginTop: 4, fontFamily: T.mono, fontSize: 10, color: T.mut }}>Spilleren får varsel i appen · {notat.length} / 280 tegn</div>
        </label>

        {feil && <div role="alert" style={{ fontFamily: T.ui, fontSize: 12.5, color: T.down }}>{feil}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Knapp ghost onClick={handleClose} disabled={pending}>Avbryt</Knapp>
          <Knapp icon="arrow-right" onClick={handleSend} disabled={!selectedTestId || pending}>{pending ? "Tildeler…" : "Tildel test"}</Knapp>
        </div>
      </div>
    </BunnArk>
  );
}
