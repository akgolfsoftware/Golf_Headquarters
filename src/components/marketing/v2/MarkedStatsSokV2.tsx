"use client";

/**
 * AK Golf HQ v2 — STATS/SØK (/stats/sok), retning C, mørk.
 * Live-søk-logikken (debounce, URL-sync, fetch mot /api/stats/search,
 * server-resultater ved direktelenke) videreført 1:1 fra (mlegacy) sin
 * sok-client.tsx — kun presentasjonen er byttet til T-tokens/v2-komponenter.
 */
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, Caps } from "@/components/v2";
import { StatsRamme, useMobile } from "./stats-ramme";
import { Eyebrow, HeroT, Seksjon } from "./marked-ramme";

interface NorskSpiller {
  slug: string;
  name: string;
  tier: string;
  bio: string | null;
}
interface PgaSpiller {
  playerName: string;
  dgPlayerId: number;
  sgTotal: number | null;
}
interface Turnering {
  slug: string | null;
  name: string;
  startDate: Date | string;
  tour: string | null;
}
export interface SokServerResultater {
  norskeSpillere: NorskSpiller[];
  pgaSpillere: PgaSpiller[];
  turneringer: Turnering[];
}

const KLUBBER_FALLBACK: { navn: string; region: string; spillere: number }[] = [];

const POPULAERE_SOK = ["Hovland", "Norske college", "Bærum GK", "Srixon Tour", "2009-årgangen", "PGA Tour 2026"];

const TYPE_FILTER = [
  { id: "alle", label: "Alle" },
  { id: "norske", label: "Spillere" },
  { id: "klubber", label: "Klubber" },
  { id: "turneringer", label: "Turneringer" },
];
const AAR_FILTER = [
  { id: "alle", label: "Alle år" },
  { id: "2026", label: "2026" },
  { id: "2025", label: "2025" },
  { id: "2024", label: "2024" },
];

async function soekAPI(q: string): Promise<SokServerResultater> {
  const res = await fetch(`/api/stats/search?q=${encodeURIComponent(q)}`, { signal: AbortSignal.timeout(3000) });
  if (!res.ok) throw new Error("Søk feilet");
  return res.json() as Promise<SokServerResultater>;
}

export interface SokV2Props {
  initialQuery: string;
  initialType: string;
  serverResultater: SokServerResultater | null;
}

export function SokV2({ initialQuery, initialType, serverResultater }: SokV2Props) {
  const mobile = useMobile();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [resultater, setResultater] = useState<SokServerResultater | null>(serverResultater);
  const [laster, setLaster] = useState(false);
  const [harSokt, setHarSokt] = useState(!!initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialQuery) inputRef.current?.focus();
  }, [initialQuery]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 220);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    const utforSok = async () => {
      if (debouncedQuery.length < 2) {
        if (!debouncedQuery) {
          setResultater(null);
          setHarSokt(false);
        }
        return;
      }
      setLaster(true);
      setHarSokt(true);
      startTransition(() => {
        const params = new URLSearchParams();
        if (debouncedQuery) params.set("q", debouncedQuery);
        if (type !== "alle") params.set("type", type);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
      try {
        const res = await soekAPI(debouncedQuery);
        if (!controller.signal.aborted) {
          setResultater(res);
          setLaster(false);
        }
      } catch {
        if (!controller.signal.aborted) setLaster(false);
      }
    };
    void utforSok();
    return () => controller.abort();
  }, [debouncedQuery, type, pathname, router]);

  const visKlubbResultater = KLUBBER_FALLBACK.filter(
    (k) => debouncedQuery.length >= 2 && k.navn.toLowerCase().includes(debouncedQuery.toLowerCase()),
  );

  const ingenTreff =
    harSokt &&
    !laster &&
    resultater &&
    resultater.norskeSpillere.length === 0 &&
    resultater.pgaSpillere.length === 0 &&
    resultater.turneringer.length === 0 &&
    visKlubbResultater.length === 0;

  return (
    <StatsRamme mobile={mobile}>
      <Seksjon mobile={mobile} style={{ paddingBottom: 8 }}>
        <Eyebrow>AK Golf Stats · Søk</Eyebrow>
        <HeroT mobile={mobile}>Søk alt.</HeroT>
        <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, marginTop: 14, maxWidth: 520 }}>
          Spillere, turneringer, klubber, artikler: alt i én søkeboks.
        </p>
      </Seksjon>

      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 260px", gap: 32, alignItems: "flex-start" }}>
          {/* Venstre: søk + resultater */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, background: T.panel2, border: `2px solid ${T.borderS}`, borderRadius: T.rCard, padding: "16px 22px" }}>
              <Icon name="search" size={20} style={{ color: T.mut, flex: "none" }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Søk navn, klubb, turnering…"
                aria-label="Søk i AK Golf Stats"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 17, fontFamily: T.ui, color: T.fg, minWidth: 0 }}
              />
              {laster && (
                <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${T.border}`, borderTopColor: T.lime, animation: "stats-sok-spin 0.8s linear infinite", flex: "none" }} />
              )}
              {query && !laster && (
                <button
                  onClick={() => {
                    setQuery("");
                    setResultater(null);
                    setHarSokt(false);
                    router.replace(pathname, { scroll: false });
                    inputRef.current?.focus();
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: T.mut, padding: 0, flex: "none", display: "flex" }}
                >
                  <Icon name="x" size={16} />
                </button>
              )}
              {!mobile && (
                <span style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.08em", color: T.mut, padding: "3px 7px", background: T.panel3, borderRadius: 4, flex: "none" }}>
                  ⌘K
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              {TYPE_FILTER.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setType(f.id)}
                  style={{
                    padding: "7px 15px",
                    borderRadius: 9999,
                    border: type === f.id ? `1.5px solid ${T.lime}` : `1px solid ${T.borderS}`,
                    background: type === f.id ? T.lime : "transparent",
                    color: type === f.id ? T.onLime : T.fg2,
                    fontFamily: T.mono,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {!harSokt && (
              <div style={{ marginTop: 44 }}>
                <Caps>Populære søk nå</Caps>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                  {POPULAERE_SOK.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      style={{ padding: "9px 16px", borderRadius: 9999, border: `1px solid ${T.borderS}`, background: T.panel2, cursor: "pointer", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {ingenTreff && (
              <div style={{ marginTop: 44 }}>
                <Caps>Ingen treff for «{debouncedQuery}»</Caps>
                <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.7, marginTop: 12 }}>Sjekk for skrivefeil, eller prøv:</p>
                <ul style={{ marginTop: 8, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {["Mindre spesifikt søk", "Søk bare etter etternavn", "Søk på klubb"].map((s) => (
                    <li key={s} style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, display: "flex", gap: 8 }}>
                      <span style={{ color: T.lime }}>·</span> {s}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 28 }}>
                  <Caps>Prøv i stedet</Caps>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                    {POPULAERE_SOK.map((s) => (
                      <button key={s} onClick={() => setQuery(s)} style={{ padding: "6px 14px", borderRadius: 9999, border: `1px solid ${T.border}`, background: "transparent", cursor: "pointer", fontFamily: T.ui, fontSize: 13, color: T.fg2 }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {resultater && !ingenTreff && harSokt && (
              <div style={{ marginTop: 36 }}>
                <Caps style={{ marginBottom: 20, display: "block" }}>Søkeresultater for «{debouncedQuery}»</Caps>

                {(type === "alle" || type === "norske") && resultater.norskeSpillere.length > 0 && (
                  <ResultGruppe tittel="Norske spillere" antall={resultater.norskeSpillere.length} ikon="user">
                    {resultater.norskeSpillere.slice(0, 5).map((s) => (
                      <ResultRad key={s.slug} href={`/stats/spillere/${s.slug}`} navn={s.name} sub={`${s.tier} · ${s.bio ?? "Ukjent klubb"}`} />
                    ))}
                  </ResultGruppe>
                )}

                {(type === "alle" || type === "pga") && resultater.pgaSpillere.length > 0 && (
                  <ResultGruppe tittel="PGA Tour-spillere" antall={resultater.pgaSpillere.length} ikon="trophy">
                    {resultater.pgaSpillere.slice(0, 5).map((s) => (
                      <ResultRad
                        key={s.playerName}
                        href="/stats/pga"
                        navn={s.playerName}
                        sub={s.sgTotal != null ? `SG Total ${s.sgTotal >= 0 ? "+" : ""}${s.sgTotal.toFixed(2)}` : "PGA Tour 2026"}
                      />
                    ))}
                  </ResultGruppe>
                )}

                {(type === "alle" || type === "klubber") && visKlubbResultater.length > 0 && (
                  <ResultGruppe tittel="Klubber" antall={visKlubbResultater.length} ikon="flag">
                    {visKlubbResultater.map((k) => (
                      <ResultRad key={k.navn} href="/stats/regions" navn={k.navn} sub={`${k.region} · ${k.spillere} spillere`} />
                    ))}
                  </ResultGruppe>
                )}

                {(type === "alle" || type === "turneringer") && resultater.turneringer.length > 0 && (
                  <ResultGruppe tittel="Turneringer" antall={resultater.turneringer.length} ikon="calendar">
                    {resultater.turneringer.slice(0, 5).map((t) => (
                      <ResultRad
                        key={t.name}
                        href={t.slug ? `/turneringer/${t.slug}` : "/turneringer"}
                        navn={t.name}
                        sub={[t.tour?.toUpperCase(), new Date(t.startDate).getFullYear().toString()].filter(Boolean).join(" · ")}
                      />
                    ))}
                  </ResultGruppe>
                )}
              </div>
            )}
          </div>

          {/* Høyre: filter-sidebar */}
          {!mobile && (
            <Kort pad="22px" style={{ position: "sticky", top: 88 }}>
              <Caps style={{ marginBottom: 16, display: "block" }}>Filter</Caps>
              <FilterGroup label="Type" options={TYPE_FILTER} value={type} onChange={setType} />
              <FilterGroup label="År" options={AAR_FILTER} value="alle" onChange={() => {}} />
              <div style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${T.border}`, fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.5 }}>
                <strong style={{ color: T.fg }}>Tips:</strong> Bruk ⌘K for raskt søk fra alle Stats-sider.
              </div>
            </Kort>
          )}
        </div>
      </Seksjon>

      <style>{`@keyframes stats-sok-spin { to { transform: rotate(360deg); } }`}</style>
    </StatsRamme>
  );
}

function ResultGruppe({ tittel, antall, ikon, children }: { tittel: string; antall: number; ikon: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon name={ikon} size={14} style={{ color: T.mut }} />
        <Caps>{tittel}</Caps>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, padding: "2px 7px", background: T.panel3, borderRadius: 9999 }}>{antall}</span>
      </div>
      <Kort pad="0" style={{ overflow: "hidden" }}>{children}</Kort>
    </div>
  );
}

function ResultRad({ href, navn, sub }: { href: string; navn: string; sub?: string }) {
  return (
    <Link
      href={href}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: `1px solid ${T.border}`, textDecoration: "none", color: "inherit" }}
    >
      <div>
        <div style={{ fontFamily: T.ui, fontWeight: 600, fontSize: 14, color: T.fg }}>{navn}</div>
        {sub && <div style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, marginTop: 2 }}>{sub}</div>}
      </div>
      <Icon name="chevron-right" size={14} style={{ color: T.mut, flex: "none" }} />
    </Link>
  );
}

function FilterGroup({ label, options, value, onChange }: { label: string; options: { id: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <Caps style={{ marginBottom: 8, display: "block" }}>{label}</Caps>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            style={{
              padding: "5px 11px",
              borderRadius: 9999,
              border: value === o.id ? `1.5px solid ${T.lime}` : `1px solid ${T.border}`,
              background: value === o.id ? T.panel3 : "transparent",
              color: value === o.id ? T.fg : T.mut,
              fontFamily: T.ui,
              fontSize: 12,
              fontWeight: value === o.id ? 700 : 500,
              cursor: "pointer",
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
