/**
 * AgencyOS v2 — Talent · Ressurs-bibliotek (`/admin/talent/ressurser`,
 * AgencyOS Bølge 3.22, 2026-07-14). Port fra `(legacy)/talent/ressurser/
 * page.tsx` — samme `TalentRessurs`-datamodell, filter-chips (kategori/
 * nivå/fokus via URL), ekte FormData-basert `leggTilRessurs`-action for
 * ADMIN (native ukontrollerte felt, samme mønster som «Rediger spiller»).
 */

import Link from "next/link";
import type { CSSProperties } from "react";
import { Caps, Tittel, Kort, Knapp, StatusPill, Icon, T } from "@/components/v2";

const KATEGORIER = ["video", "artikkel", "podcast"] as const;
export type KategoriV2 = (typeof KATEGORIER)[number];
const NIVAER = ["U10", "U12", "U14", "U16", "U18", "Senior"] as const;
const FOKUS = ["teknikk", "mental", "taktikk", "fysisk", "motivasjon"] as const;

const KAT_IKON: Record<KategoriV2, string> = { video: "video", artikkel: "file-text", podcast: "mic" };

export interface RessursV2 {
  id: string;
  kategori: string;
  niva: string | null;
  fokus: string | null;
  tittel: string;
  beskrivelse: string | null;
  url: string;
}

const feltStil: CSSProperties = {
  width: "100%", boxSizing: "border-box", appearance: "none",
  background: T.panel2, border: `1px solid ${T.borderS}`, borderRadius: 11,
  padding: "10px 13px", fontFamily: T.ui, fontSize: 13.5, color: T.fg, outline: "none",
};

function ChipLinkV2({ href, aktiv, children }: { href: string; aktiv: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ borderRadius: 9999, padding: "6px 14px", fontFamily: T.ui, fontSize: 12, fontWeight: 600, textDecoration: "none", background: aktiv ? T.lime : T.panel2, color: aktiv ? T.onLime : T.fg, border: aktiv ? "none" : `1px solid ${T.border}` }}>
      {children}
    </Link>
  );
}

function FilterRadV2({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
      <span style={{ minWidth: 64 }}><Caps size={9}>{label}</Caps></span>
      {children}
    </div>
  );
}

export function AdminTalentRessurserV2({
  ressurser,
  isAdmin,
  valgtKategori,
  valgtNiva,
  valgtFokus,
  leggTilRessurs,
}: {
  ressurser: RessursV2[];
  isAdmin: boolean;
  valgtKategori: string | null;
  valgtNiva: string | null;
  valgtFokus: string | null;
  leggTilRessurs: (formData: FormData) => Promise<void>;
}) {
  function chipHref(opts: { kategori?: string; niva?: string; fokus?: string }) {
    const params = new URLSearchParams();
    const k = opts.kategori ?? valgtKategori;
    const n = opts.niva ?? valgtNiva;
    const f = opts.fokus ?? valgtFokus;
    if (k) params.set("kategori", k);
    if (n) params.set("niva", n);
    if (f) params.set("fokus", f);
    const q = params.toString();
    return `/admin/talent/ressurser${q ? `?${q}` : ""}`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <Caps size={9}>Talent · Ressurser</Caps>
          <Tittel em="bibliotek">Ressurs</Tittel>
          <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>{ressurser.length} ressurser tilgjengelig — video, artikler og podcasts for talent-utvikling.</p>
        </div>
        <Link href="/admin/talent" style={{ display: "inline-flex", flex: "none", alignItems: "center", gap: 6, borderRadius: 8, border: `1px solid ${T.border}`, background: T.panel2, padding: "8px 14px", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, textDecoration: "none" }}>
          <Icon name="arrow-left" size={14} />Tilbake
        </Link>
      </div>

      <Kort style={{ gap: 10 }}>
        <FilterRadV2 label="Kategori">
          <ChipLinkV2 href={chipHref({ kategori: "" })} aktiv={!valgtKategori}>Alle</ChipLinkV2>
          {KATEGORIER.map((k) => <ChipLinkV2 key={k} href={chipHref({ kategori: k })} aktiv={valgtKategori === k}>{k}</ChipLinkV2>)}
        </FilterRadV2>
        <FilterRadV2 label="Nivå">
          <ChipLinkV2 href={chipHref({ niva: "" })} aktiv={!valgtNiva}>Alle</ChipLinkV2>
          {NIVAER.map((n) => <ChipLinkV2 key={n} href={chipHref({ niva: n })} aktiv={valgtNiva === n}>{n}</ChipLinkV2>)}
        </FilterRadV2>
        <FilterRadV2 label="Fokus">
          <ChipLinkV2 href={chipHref({ fokus: "" })} aktiv={!valgtFokus}>Alle</ChipLinkV2>
          {FOKUS.map((f) => <ChipLinkV2 key={f} href={chipHref({ fokus: f })} aktiv={valgtFokus === f}>{f}</ChipLinkV2>)}
        </FilterRadV2>
      </Kort>

      {isAdmin && (
        <Kort style={{ border: `1px solid color-mix(in srgb, ${T.lime} 30%, transparent)` }}>
          <Caps size={9}><Icon name="plus" size={11} style={{ marginRight: 6, verticalAlign: "-2px" }} />Legg til ressurs (admin)</Caps>
          <form action={leggTilRessurs} style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <input type="text" name="tittel" placeholder="Tittel" required minLength={2} maxLength={200} style={feltStil} />
            <input type="url" name="url" placeholder="https://…" required style={feltStil} />
            <select name="kategori" required defaultValue="video" style={feltStil}>
              {KATEGORIER.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
            <select name="niva" defaultValue="" style={feltStil}>
              <option value="">Nivå (valgfri)</option>
              {NIVAER.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <select name="fokus" defaultValue="" style={feltStil}>
              <option value="">Fokus (valgfri)</option>
              {FOKUS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <input type="text" name="beskrivelse" placeholder="Beskrivelse (valgfri)" maxLength={1000} style={{ ...feltStil, gridColumn: "1 / -1" }} />
            <div style={{ gridColumn: "1 / -1" }}>
              <Knapp icon="plus" type="submit">Lagre ressurs</Knapp>
            </div>
          </form>
        </Kort>
      )}

      {ressurser.length === 0 ? (
        <Kort>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "40px 16px", textAlign: "center" }}>
            <Icon name="book-open" size={28} style={{ color: T.mut }} />
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Ingen ressurser matcher filter</div>
            <p style={{ maxWidth: 360, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
              {valgtKategori || valgtNiva || valgtFokus ? "Prøv å nullstille noen av filterne." : "Legg til første ressurs for å komme i gang."}
            </p>
          </div>
        </Kort>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: T.gap }}>
          {ressurser.map((r) => (
            <Kort key={r.id} style={{ gap: 10 }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 9999, background: T.lime, padding: "3px 10px", fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: T.onLime }}>
                  <Icon name={KAT_IKON[r.kategori as KategoriV2] ?? "file-text"} size={11} />{r.kategori}
                </span>
                {r.niva && <StatusPill tone="info">{r.niva}</StatusPill>}
                {r.fokus && <StatusPill tone="lime">{r.fokus}</StatusPill>}
              </div>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>{r.tittel}</div>
              {r.beskrivelse && <p style={{ fontFamily: T.ui, fontSize: 12, lineHeight: 1.6, color: T.mut }}>{r.beskrivelse}</p>}
              <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 9999, background: T.panel3, padding: "6px 14px", fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg, textDecoration: "none" }}>
                Åpne<Icon name="external-link" size={13} />
              </a>
            </Kort>
          ))}
        </div>
      )}
    </div>
  );
}
