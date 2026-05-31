"use client";

/**
 * SokClient — live søk med debounce, filter og resultater
 * Design: 27-global-sok.md
 */

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { StatsIcon } from "@/components/stats/icon";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

interface ServerResultater {
  norskeSpillere: NorskSpiller[];
  pgaSpillere: PgaSpiller[];
  turneringer: Turnering[];
}

// Ingen klubb-datamodell ennå — tom til ekte klubb-data finnes (ikke
// fabrikkerte spiller-tall). Søket dekker spillere + turneringer fra API-et.
const KLUBBER_FALLBACK: { navn: string; region: string; spillere: number }[] = [];

const POPULAERE_SOK = [
  "Hovland", "Norske college", "Bærum GK", "Srixon Tour", "2009-årgangen", "PGA Tour 2026",
];

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

// ---------------------------------------------------------------------------
// Search API
// ---------------------------------------------------------------------------

async function soekAPI(q: string): Promise<ServerResultater> {
  const res = await fetch(`/api/stats/search?q=${encodeURIComponent(q)}`, {
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) throw new Error("Søk feilet");
  return res.json() as Promise<ServerResultater>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SokClientProps {
  initialQuery: string;
  initialType: string;
  initialYear: string;
  serverResultater: ServerResultater | null;
}

export function SokClient({
  initialQuery,
  initialType,
  // initialYear used for future year-filter persistence
  serverResultater,
}: SokClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [resultater, setResultater] = useState<ServerResultater | null>(serverResultater);
  const [laster, setLaster] = useState(false);
  const [harSokt, setHarSokt] = useState(!!initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus
  useEffect(() => {
    if (!initialQuery) inputRef.current?.focus();
  }, [initialQuery]);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 220);
    return () => clearTimeout(t);
  }, [query]);

  // Søk når debouncedQuery endres — alle state-oppdateringer i async-callback
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
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 48px 80px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 40, alignItems: "flex-start" }}>

        {/* ── VENSTRE: søk + resultater ── */}
        <div>
          {/* Stor søke-input */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "var(--s-card)",
              border: "2px solid var(--s-border)",
              borderRadius: "var(--s-r-lg)",
              padding: "16px 24px",
              boxShadow: "var(--s-shadow-md)",
              transition: "border-color .15s",
            }}
            onFocusCapture={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = "var(--s-primary)")
            }
            onBlurCapture={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = "var(--s-border)")
            }
          >
            <StatsIcon
              name="Search"
              size={20}
              style={{ color: "var(--s-muted-fg)", flexShrink: 0 }}
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Søk navn, klubb, turnering…"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 18,
                fontFamily: "inherit",
                color: "var(--s-fg)",
              }}
              aria-label="Søk i AK Golf Stats"
            />
            {laster && (
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: "2px solid var(--s-border)",
                  borderTopColor: "var(--s-primary)",
                  animation: "spin 0.8s linear infinite",
                  flexShrink: 0,
                }}
              />
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
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--s-muted-fg)",
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <StatsIcon name="X" size={16} />
              </button>
            )}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.08em",
                color: "var(--s-muted-fg)",
                padding: "3px 7px",
                background: "var(--s-secondary)",
                borderRadius: 4,
                flexShrink: 0,
              }}
            >
              ⌘K
            </span>
          </div>

          {/* Type-chips */}
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            {TYPE_FILTER.map((f) => (
              <button
                key={f.id}
                onClick={() => setType(f.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: type === f.id ? "1.5px solid var(--s-primary)" : "1px solid var(--s-border)",
                  background: type === f.id ? "var(--s-primary)" : "transparent",
                  color: type === f.id ? "var(--s-accent)" : "var(--s-fg)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* EMPTY STATE — ingen søk ennå */}
          {!harSokt && (
            <div style={{ marginTop: 48 }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--s-muted-fg)",
                  marginBottom: 16,
                }}
              >
                Populære søk nå
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {POPULAERE_SOK.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 999,
                      border: "1px solid var(--s-border)",
                      background: "var(--s-card)",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 500,
                      transition: "box-shadow .15s",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INGEN TREFF */}
          {ingenTreff && (
            <div style={{ marginTop: 48 }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--s-muted-fg)",
                  marginBottom: 12,
                }}
              >
                Ingen treff for &ldquo;{debouncedQuery}&rdquo;
              </div>
              <p style={{ fontSize: 14, color: "var(--s-muted-fg)", lineHeight: 1.7 }}>
                Sjekk for skrivefeil, eller prøv:
              </p>
              <ul
                style={{
                  marginTop: 8,
                  paddingLeft: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {["Mindre spesifikt søk", "Søk bare etter etternavn", "Søk på klubb"].map(
                  (s) => (
                    <li key={s} style={{ fontSize: 14, color: "var(--s-muted-fg)", display: "flex", gap: 8 }}>
                      <span style={{ color: "var(--s-accent)" }}>·</span> {s}
                    </li>
                  ),
                )}
              </ul>

              <div style={{ marginTop: 32 }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--s-muted-fg)",
                    marginBottom: 12,
                  }}
                >
                  Prøv i stedet
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {POPULAERE_SOK.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 999,
                        border: "1px solid var(--s-border)",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* RESULTATER */}
          {resultater && !ingenTreff && harSokt && (
            <div style={{ marginTop: 40 }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--s-muted-fg)",
                  marginBottom: 24,
                }}
              >
                Søkeresultater for &ldquo;{debouncedQuery}&rdquo;
              </div>

              {/* Norske spillere */}
              {(type === "alle" || type === "norske") && resultater.norskeSpillere.length > 0 && (
                <ResultGruppe
                  tittel="Norske spillere"
                  antall={resultater.norskeSpillere.length}
                  ikon="User"
                >
                  {resultater.norskeSpillere.slice(0, 5).map((s) => (
                    <ResultRad
                      key={s.slug}
                      href={`/stats/spillere/${s.slug}`}
                      navn={s.name}
                      sub={`${s.tier} · ${s.bio ?? "Ukjent klubb"}`}
                    />
                  ))}
                </ResultGruppe>
              )}

              {/* PGA-spillere */}
              {(type === "alle" || type === "pga") && resultater.pgaSpillere.length > 0 && (
                <ResultGruppe
                  tittel="PGA Tour-spillere"
                  antall={resultater.pgaSpillere.length}
                  ikon="Trophy"
                >
                  {resultater.pgaSpillere.slice(0, 5).map((s) => (
                    <ResultRad
                      key={s.playerName}
                      href="/stats/pga"
                      navn={s.playerName}
                      sub={
                        s.sgTotal != null
                          ? `SG Total ${s.sgTotal >= 0 ? "+" : ""}${s.sgTotal.toFixed(2)}`
                          : "PGA Tour 2026"
                      }
                    />
                  ))}
                </ResultGruppe>
              )}

              {/* Klubber */}
              {(type === "alle" || type === "klubber") && visKlubbResultater.length > 0 && (
                <ResultGruppe
                  tittel="Klubber"
                  antall={visKlubbResultater.length}
                  ikon="Flag"
                >
                  {visKlubbResultater.map((k) => (
                    <ResultRad
                      key={k.navn}
                      href="/stats/regions"
                      navn={k.navn}
                      sub={`${k.region} · ${k.spillere} spillere`}
                    />
                  ))}
                </ResultGruppe>
              )}

              {/* Turneringer */}
              {(type === "alle" || type === "turneringer") && resultater.turneringer.length > 0 && (
                <ResultGruppe
                  tittel="Turneringer"
                  antall={resultater.turneringer.length}
                  ikon="Calendar"
                >
                  {resultater.turneringer.slice(0, 5).map((t) => (
                    <ResultRad
                      key={t.name}
                      href={t.slug ? `/turneringer/${t.slug}` : "/turneringer"}
                      navn={t.name}
                      sub={[
                        t.tour?.toUpperCase(),
                        new Date(t.startDate).getFullYear().toString(),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    />
                  ))}
                </ResultGruppe>
              )}
            </div>
          )}
        </div>

        {/* ── HØYRE: filter-sidebar ── */}
        <div
          style={{
            position: "sticky",
            top: 80,
            background: "var(--s-card)",
            border: "1px solid var(--s-border)",
            borderRadius: "var(--s-r-lg)",
            padding: 24,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--s-muted-fg)",
              marginBottom: 16,
            }}
          >
            Filter
          </div>

          <FilterGroup label="Type" options={TYPE_FILTER} value={type} onChange={setType} />
          <FilterGroup label="År" options={AAR_FILTER} value="alle" onChange={() => {}} />

          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px solid var(--s-border)",
              fontSize: 12,
              color: "var(--s-muted-fg)",
              lineHeight: 1.5,
            }}
          >
            <strong>Tips:</strong> Bruk ⌘K for raskt søk fra alle Stats-sider.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ResultGruppe({
  tittel,
  antall,
  ikon,
  children,
}: {
  tittel: string;
  antall: number;
  ikon: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <StatsIcon name={ikon as Parameters<typeof StatsIcon>[0]["name"]} size={14} style={{ color: "var(--s-muted-fg)" }} />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--s-muted-fg)",
          }}
        >
          {tittel}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--s-muted-fg)",
            padding: "2px 6px",
            background: "var(--s-secondary)",
            borderRadius: 99,
          }}
        >
          {antall}
        </span>
      </div>
      <div
        style={{
          background: "var(--s-card)",
          border: "1px solid var(--s-border)",
          borderRadius: "var(--s-r-md)",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ResultRad({ href, navn, sub }: { href: string; navn: string; sub?: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px dashed var(--s-border)",
        textDecoration: "none",
        color: "inherit",
        transition: "background .1s",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.background = "var(--s-secondary)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.background = "transparent")
      }
    >
      <div>
        <div style={{ fontWeight: 500, fontSize: 14 }}>{navn}</div>
        {sub && (
          <div style={{ fontSize: 12, color: "var(--s-muted-fg)", marginTop: 2 }}>{sub}</div>
        )}
      </div>
      <StatsIcon name="ChevronRight" size={14} style={{ color: "var(--s-muted-fg)", flexShrink: 0 }} />
    </Link>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--s-muted-fg)",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            style={{
              padding: "4px 10px",
              borderRadius: 99,
              border: value === o.id ? "1.5px solid var(--s-primary)" : "1px solid var(--s-border)",
              background: value === o.id ? "var(--s-secondary)" : "transparent",
              color: value === o.id ? "var(--s-fg)" : "var(--s-muted-fg)",
              fontSize: 12,
              cursor: "pointer",
              fontWeight: value === o.id ? 600 : 400,
              transition: "all .12s",
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
