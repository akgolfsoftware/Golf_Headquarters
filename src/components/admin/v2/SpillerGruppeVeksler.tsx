"use client";

/**
 * SPILLER↔GRUPPE-VEKSLER — D2 (bolk 5, godkjent av Anders 17. jul 2026).
 * Fast kontekst-veksler i V2Shell-toppraden for AgencyOS: coachen bytter
 * aktiv spiller eller gruppe uansett hvor han står — uten å gå via Stallen.
 *
 * Design-fasit 1:1: `ui_kits/v2/agencyos-veksler.jsx` + komponent-kontrakten
 * `components/nav/SpillerGruppeVeksler.prompt.md` i Claude Design-prosjektet.
 * Nedtrekk m/ segmentert Spiller|Gruppe, søk, «Sist brukte», aktiv = lime-hake
 * (nedtrekkets ENESTE lime). Mobil: nedtrekket er bunn-ark. Tilstander:
 * tom gruppeliste, søk uten treff, laster (skeleton).
 *
 * KONTEKST-MØNSTER (ikke parallell state): valget navigerer til eksisterende
 * ruter — samme id-i-URL-mønster som CoachWorkbenchMount («Planlegger for»,
 * /admin/spillere/[id]/workbench m/ ?uke= bevart). Sist valgte kontekst
 * huskes i cookie `ak-veksler-kontekst` KUN for å vise triggeren på skjermer
 * uten kontekst i URL-en — sannheten for hva en skjerm viser er alltid URL-en.
 * Skjermer uten gruppe-ekvivalent (økonomi/faktura): kun spiller-listen +
 * mikrotekst. Roster hentes fra /api/admin/veksler (I0-porten server-side).
 */

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { T } from "@/lib/v2/tokens";
import { AvatarInit, Caps, Icon, PillVelger, TomTilstand } from "@/components/v2";
import type { VekslerResponse, VekslerValg } from "@/app/api/admin/veksler/route";

type Modus = "spiller" | "gruppe";
type Kontekst = { type: Modus; id: string };

const KONTEKST_COOKIE = "ak-veksler-kontekst";
const SIST_KEY = "ak-veksler-sist";
const SPILLER_RE = /^\/admin\/spillere\/([^/]+)(\/.*)?$/;
const GRUPPE_RE = /^\/admin\/grupper\/([^/]+)(\/.*)?$/;
/** Ruter uten gruppe-ekvivalent (faktura/økonomi) → kun spiller-listen. */
const KUN_SPILLER_PREFIKS = ["/admin/agencyos/okonomi", "/admin/finance"];

/* Modul-cache: V2Shell remountes per side, men rosteret endrer seg sjelden —
   unngå ett API-kall per navigasjon. */
let rosterCache: { data: VekslerResponse; ts: number } | null = null;
const CACHE_TTL_MS = 60_000;

function lesKontekstRaa(): string | null {
  if (typeof document === "undefined") return null;
  const rad = document.cookie.split("; ").find((c) => c.startsWith(`${KONTEKST_COOKIE}=`));
  return rad ? decodeURIComponent(rad.split("=")[1] ?? "") : null;
}

function skrivKontekstCookie(k: Kontekst) {
  document.cookie = `${KONTEKST_COOKIE}=${encodeURIComponent(`${k.type}:${k.id}`)};path=/;max-age=31536000;samesite=lax`;
  window.dispatchEvent(new Event("ak-veksler-kontekst"));
}

/** Cookie-kontekst som eksternt lager (samme idiom som useV2Tema i shellen).
 *  SSR-snapshot er null — URL-konteksten dekker første paint. */
function useCookieKontekst(): Kontekst | null {
  const raa = useSyncExternalStore(
    (cb) => {
      window.addEventListener("ak-veksler-kontekst", cb);
      return () => window.removeEventListener("ak-veksler-kontekst", cb);
    },
    lesKontekstRaa,
    () => null,
  );
  if (!raa) return null;
  const [type, id] = raa.split(":");
  if ((type === "spiller" || type === "gruppe") && id) return { type, id };
  return null;
}

function lesSistBrukte(): string[] {
  try {
    const raw = localStorage.getItem(SIST_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function skrivSistBrukte(id: string) {
  try {
    const neste = [id, ...lesSistBrukte().filter((x) => x !== id)].slice(0, 3);
    localStorage.setItem(SIST_KEY, JSON.stringify(neste));
  } catch {
    /* private mode o.l. — «sist brukte» er ren komfort */
  }
}

/** Kontekst fra URL-en (fasit-kilden) — `ny` er en rute, ikke en spiller-id. */
function kontekstFraUrl(pathname: string): Kontekst | null {
  const sp = SPILLER_RE.exec(pathname);
  if (sp && sp[1] !== "ny") return { type: "spiller", id: sp[1] };
  const gr = GRUPPE_RE.exec(pathname);
  if (gr && gr[1] !== "ny") return { type: "gruppe", id: gr[1] };
  return null;
}

/**
 * Mål-URL for et valg: samme skjermtype for ny kontekst der det gir mening
 * (spiller-detalj → ny spillers detalj, workbench ↔ gruppe-workbench —
 * mønsteret fra CoachWorkbenchMount), ellers kontekstens detaljside.
 */
function maalForValg(type: Modus, id: string, pathname: string, uke: string | null): string {
  const query = uke ? `?uke=${encodeURIComponent(uke)}` : "";
  const sp = SPILLER_RE.exec(pathname);
  const gr = GRUPPE_RE.exec(pathname);
  if (type === "spiller") {
    if (sp && sp[1] !== "ny") return `/admin/spillere/${id}${sp[2] ?? ""}${query}`;
    if (gr && gr[2] === "/workbench") return `/admin/spillere/${id}/workbench${query}`;
    return `/admin/spillere/${id}`;
  }
  if (gr && gr[1] !== "ny") return `/admin/grupper/${id}${gr[2] ?? ""}${query}`;
  if (sp && sp[2]?.startsWith("/workbench")) return `/admin/grupper/${id}/workbench${query}`;
  return `/admin/grupper/${id}`;
}

/** Mobil = under md-brytepunktet (768px, samme som shellens hidden/md:flex). */
function useErMobil(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(max-width: 767px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false,
  );
}

/* ── Rader ────────────────────────────────────────────── */

function RadVelg({
  x,
  gruppe,
  aktiv,
  onVelg,
  last,
}: {
  x: VekslerValg;
  gruppe?: boolean;
  aktiv: boolean;
  onVelg: () => void;
  last: boolean;
}) {
  return (
    <div
      className="v2-press v2-focus"
      tabIndex={0}
      role="option"
      aria-selected={aktiv}
      onClick={onVelg}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onVelg();
        }
      }}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", margin: "0 -10px", borderRadius: 10, cursor: "pointer", borderBottom: last ? "none" : `1px solid ${T.border}` }}
    >
      {gruppe ? (
        <span style={{ width: 28, height: 28, borderRadius: 9999, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <Icon name="users" size={13} style={{ color: T.fg2 }} />
        </span>
      ) : (
        <AvatarInit navn={x.navn} size={28} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.navn}</div>
        <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut, marginTop: 1 }}>{x.meta}</div>
      </div>
      {/* Én accent-jobb: aktiv-markøren */}
      {aktiv && <Icon name="check" size={14} strokeWidth={2.5} style={{ color: T.lime }} />}
    </div>
  );
}

function SkjelettRad({ last }: { last: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: last ? "none" : `1px solid ${T.border}` }}>
      <span style={{ width: 28, height: 28, borderRadius: 9999, background: T.panel3, flex: "none" }} />
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", width: "55%", height: 10, borderRadius: 5, background: T.panel3 }} />
        <span style={{ display: "block", width: "35%", height: 7, borderRadius: 4, background: T.panel2, marginTop: 5 }} />
      </span>
    </div>
  );
}

/* ── Nedtrekket ───────────────────────────────────────── */

function Nedtrekk({
  mobile,
  modus,
  setModus,
  sok,
  setSok,
  data,
  valgt,
  onVelg,
  kunSpillere,
}: {
  mobile?: boolean;
  modus: Modus;
  setModus: (m: Modus) => void;
  sok: string;
  setSok: (s: string) => void;
  data: VekslerResponse | null;
  valgt: Kontekst | null;
  onVelg: (x: VekslerValg, m: Modus) => void;
  kunSpillere: boolean;
}) {
  const laster = data === null;
  const kilde = laster ? [] : modus === "gruppe" ? data.grupper : data.spillere;
  const tomGrupper = !laster && modus === "gruppe" && data.grupper.length === 0;
  const q = sok.trim().toLowerCase();
  const treff = q ? kilde.filter((x) => x.navn.toLowerCase().includes(q)) : kilde;
  const sistIds = !q && modus === "spiller" ? lesSistBrukte() : [];
  const sist = sistIds
    .map((id) => kilde.find((x) => x.id === id))
    .filter((x): x is VekslerValg => x != null);
  const resten = q ? treff : kilde.filter((x) => !sist.includes(x));
  const erAktiv = (x: VekslerValg) => valgt != null && valgt.type === modus && valgt.id === x.id;

  return (
    <div
      role="listbox"
      aria-label="Velg spiller eller gruppe"
      style={{ background: T.panel3, border: `1px solid ${T.borderS}`, borderRadius: 16, padding: "12px 14px", boxShadow: "0 18px 44px rgba(0,0,0,0.5)", width: mobile ? "100%" : 300, display: "flex", flexDirection: "column", gap: 10, boxSizing: "border-box" }}
    >
      {!kunSpillere && (
        <PillVelger
          options={[{ v: "spiller", l: "Spiller" }, { v: "gruppe", l: "Gruppe" }]}
          value={modus}
          onChange={(v) => setModus(v as Modus)}
        />
      )}
      {kunSpillere && (
        <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, lineHeight: 1.5 }}>
          Faktura gjelder enkeltspillere — grupper har ikke egen faktura.
        </span>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "7px 10px" }}>
        <Icon name="search" size={13} style={{ color: T.mut, flex: "none" }} />
        <input
          value={sok}
          onChange={(e) => setSok(e.target.value)}
          placeholder={modus === "gruppe" ? "Søk i grupper …" : "Søk i spillere …"}
          autoFocus={!mobile}
          className="v2-focus"
          style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", fontFamily: T.ui, fontSize: 12.5, color: T.fg }}
        />
        {sok && (
          <button
            type="button"
            aria-label="Tøm søk"
            onClick={() => setSok("")}
            style={{ cursor: "pointer", display: "inline-flex", background: "transparent", border: 0, padding: 0 }}
          >
            <Icon name="x" size={12} style={{ color: T.mut }} />
          </button>
        )}
      </div>

      {laster && <div>{[0, 1, 2].map((i) => <SkjelettRad key={i} last={i === 2} />)}</div>}

      {tomGrupper && !q && (
        <TomTilstand
          icon="users"
          title="Ingen grupper ennå"
          sub="Grupper du oppretter i Stallen dukker opp her — da kan hele arbeidsflaten vise gruppen samlet."
        />
      )}

      {!laster && q && treff.length === 0 && !tomGrupper && (
        <TomTilstand
          icon="search"
          title={`Ingen treff for «${sok.trim()}»`}
          sub={modus === "gruppe" ? "Prøv et annet gruppenavn." : "Prøv et annet navn, eller åpne Stallen for hele oversikten."}
        />
      )}

      {!laster && !tomGrupper && !(q && treff.length === 0) && (
        <div style={{ maxHeight: mobile ? "45vh" : 300, overflowY: "auto", margin: "0 -4px", padding: "0 4px" }}>
          {sist.length > 0 && (
            <>
              <Caps size={8.5} style={{ padding: "2px 0 6px" }}>Sist brukte</Caps>
              {sist.map((x, i) => (
                <RadVelg key={x.id} x={x} aktiv={erAktiv(x)} onVelg={() => onVelg(x, modus)} last={i === sist.length - 1} />
              ))}
              <Caps size={8.5} style={{ padding: "10px 0 6px" }}>{modus === "gruppe" ? "Alle grupper" : "Alle spillere"}</Caps>
            </>
          )}
          {resten.map((x, i) => (
            <RadVelg key={x.id} x={x} gruppe={modus === "gruppe"} aktiv={erAktiv(x)} onVelg={() => onVelg(x, modus)} last={i === resten.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Trigger i toppraden ──────────────────────────────── */

function Trigger({
  navn,
  meta,
  erGruppe,
  laster,
  apen,
  onClick,
}: {
  navn: string | null;
  meta: string | null;
  erGruppe: boolean;
  laster: boolean;
  apen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="v2-press v2-focus"
      onClick={onClick}
      aria-expanded={apen}
      aria-haspopup="listbox"
      aria-label="Bytt aktiv spiller eller gruppe"
      style={{ appearance: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 9, background: T.panel2, border: `1px solid ${apen ? T.borderS : T.border}`, borderRadius: 12, padding: "6px 12px 6px 7px", maxWidth: 280 }}
    >
      {erGruppe ? (
        <span style={{ width: 26, height: 26, borderRadius: 9999, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <Icon name="users" size={12} style={{ color: T.fg2 }} />
        </span>
      ) : navn ? (
        <AvatarInit navn={navn} size={26} />
      ) : (
        <span style={{ width: 26, height: 26, borderRadius: 9999, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <Icon name="user" size={12} style={{ color: T.fg2 }} />
        </span>
      )}
      <span style={{ minWidth: 0, textAlign: "left" }}>
        {laster ? (
          <>
            <span style={{ display: "block", width: 92, height: 10, borderRadius: 5, background: T.panel3 }} />
            <span style={{ display: "block", width: 60, height: 7, borderRadius: 4, background: T.panel3, marginTop: 4 }} />
          </>
        ) : (
          <>
            <span style={{ display: "block", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{navn ?? "Velg spiller"}</span>
            <span style={{ display: "block", fontFamily: T.mono, fontSize: 8.5, color: T.mut, marginTop: 1 }}>{meta ?? "Ingen valgt"}</span>
          </>
        )}
      </span>
      <Icon name="chevron-down" size={13} style={{ color: T.mut, transform: apen ? "rotate(180deg)" : "none", transition: "transform 180ms", flex: "none" }} />
    </button>
  );
}

/* ── Selve veksleren ──────────────────────────────────── */

export function SpillerGruppeVeksler() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mobil = useErMobil();

  const kunSpillere = KUN_SPILLER_PREFIKS.some((p) => pathname.startsWith(p));
  const [apen, setApen] = useState(false);
  const [modus, setModus] = useState<Modus>("spiller");
  const [sok, setSok] = useState("");
  const [data, setData] = useState<VekslerResponse | null>(rosterCache?.data ?? null);
  // Cookie-kontekst (sist valgt) — URL vinner alltid, se `kontekst` under.
  const cookieKontekst = useCookieKontekst();
  const rotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fersk cache er allerede lagt i useState-initialisatoren.
    if (rosterCache && Date.now() - rosterCache.ts < CACHE_TTL_MS) return;
    let avbrutt = false;
    fetch("/api/admin/veksler")
      .then((r) => (r.ok ? (r.json() as Promise<VekslerResponse>) : null))
      .then((d) => {
        if (d && !avbrutt) {
          rosterCache = { data: d, ts: Date.now() };
          setData(d);
        }
      })
      .catch(() => {
        /* nettverksfeil → triggeren blir stående i laster-tilstand */
      });
    return () => {
      avbrutt = true;
    };
  }, []);

  // Lukk på Escape + klikk utenfor (desktop-nedtrekket har ingen backdrop).
  useEffect(() => {
    if (!apen) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setApen(false);
    };
    const utenfor = (e: MouseEvent) => {
      if (rotRef.current && e.target instanceof Node && !rotRef.current.contains(e.target)) setApen(false);
    };
    window.addEventListener("keydown", esc);
    window.addEventListener("mousedown", utenfor);
    return () => {
      window.removeEventListener("keydown", esc);
      window.removeEventListener("mousedown", utenfor);
    };
  }, [apen]);

  // Aktiv kontekst: URL-en er fasit; cookien dekker skjermer uten id i URL-en.
  const kontekst = kontekstFraUrl(pathname) ?? (kunSpillere && cookieKontekst?.type === "gruppe" ? null : cookieKontekst);
  const valgtRad =
    kontekst && data
      ? (kontekst.type === "gruppe" ? data.grupper : data.spillere).find((x) => x.id === kontekst.id) ?? null
      : null;

  const onVelg = (x: VekslerValg, m: Modus) => {
    setApen(false);
    setSok("");
    skrivKontekstCookie({ type: m, id: x.id });
    if (m === "spiller") skrivSistBrukte(x.id);
    if (kontekst && kontekst.type === m && kontekst.id === x.id) return; // allerede aktiv
    router.push(maalForValg(m, x.id, pathname, searchParams.get("uke")));
  };

  const nedtrekk = (
    <Nedtrekk
      mobile={mobil}
      modus={kunSpillere ? "spiller" : modus}
      setModus={setModus}
      sok={sok}
      setSok={setSok}
      data={data}
      valgt={kontekst}
      onVelg={onVelg}
      kunSpillere={kunSpillere}
    />
  );

  return (
    <div ref={rotRef} style={{ position: "relative" }}>
      <Trigger
        navn={valgtRad?.navn ?? null}
        meta={valgtRad?.meta ?? null}
        erGruppe={kontekst?.type === "gruppe"}
        laster={data === null && kontekst != null}
        apen={apen}
        onClick={() => setApen(!apen)}
      />
      {apen && !mobil && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 60 }}>{nedtrekk}</div>
      )}
      {apen && mobil && (
        <>
          <div onClick={() => setApen(false)} style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(0,0,0,0.55)" }} aria-hidden />
          {/* Mobil: nedtrekket er et bunn-ark (samme idiom som Mer-arket) */}
          <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 91, borderRadius: "20px 20px 0 0", overflow: "hidden", boxShadow: "0 -18px 44px rgba(0,0,0,0.5)", paddingBottom: "env(safe-area-inset-bottom)", background: T.panel3 }}>
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
              <span style={{ width: 36, height: 4, borderRadius: 9999, background: T.borderS }} />
            </div>
            {nedtrekk}
          </div>
        </>
      )}
    </div>
  );
}
