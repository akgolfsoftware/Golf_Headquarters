"use client";

/**
 * AgencyOS — Talent · Ressurs-bibliotek, v2-port 17. juli 2026. Rekomponerer
 * den gamle /admin/(legacy)/talent/ressurser-skjermen i v2-idiomet med IDENTISK
 * funksjon: filter på kategori/nivå/fokus (flyttet til klienten — alle
 * ressurser lastes én gang), ressurs-kort-grid, og admin-skjema som kaller den
 * EKTE server action `leggTilRessurs` (uendret validering/rolle-krav i action).
 */

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Caps,
  Tittel,
  Kort,
  Knapp,
  StatusPill,
  FilterChips,
  Inndata,
  Velger,
  TomTilstand,
  T,
} from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { leggTilRessurs } from "@/app/admin/(legacy)/talent/ressurser/actions";

// ── Datakontrakt (mappes fra ruten) ─────────────────────────────
export interface TalentRessursV2 {
  id: string;
  tittel: string;
  kategori: string;
  niva: string | null;
  fokus: string | null;
  beskrivelse: string | null;
  url: string;
}
export interface AdminTalentRessurserV2Data {
  ressurser: TalentRessursV2[];
  erAdmin: boolean;
}

// Samme taksonomi som server action (leggTilRessurs).
const KATEGORIER = ["video", "artikkel", "podcast"] as const;
const NIVAER = ["U10", "U12", "U14", "U16", "U18", "Senior"] as const;
const FOKUS = ["teknikk", "mental", "taktikk", "fysisk", "motivasjon"] as const;

const KAT_IKON: Record<string, string> = {
  video: "video",
  artikkel: "file-text",
  podcast: "headphones",
};

/** Admin-skjema: legg til ny ressurs via den ekte server action. */
function LeggTilSkjema() {
  const [pending, start] = useTransition();
  const [tittel, setTittel] = useState("");
  const [url, setUrl] = useState("");
  const [kategori, setKategori] = useState<string>("video");
  const [niva, setNiva] = useState<string>("");
  const [fokus, setFokus] = useState<string>("");
  const [beskrivelse, setBeskrivelse] = useState("");

  function submit() {
    if (pending) return;
    const fd = new FormData();
    fd.set("tittel", tittel);
    fd.set("url", url);
    fd.set("kategori", kategori);
    fd.set("niva", niva);
    fd.set("fokus", fokus);
    fd.set("beskrivelse", beskrivelse);
    start(async () => {
      try {
        await leggTilRessurs(fd);
        toast.success("Ressurs lagret.");
        setTittel("");
        setUrl("");
        setBeskrivelse("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Kunne ikke lagre ressursen.");
      }
    });
  }

  return (
    <Kort eyebrow="Legg til ressurs (admin)">
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
        <Inndata label="Tittel" value={tittel} onChange={setTittel} placeholder="F.eks. Puttedrill 3–6 ft" />
        <Inndata label="Lenke" value={url} onChange={setUrl} placeholder="https://…" />
        <Velger label="Kategori" options={[...KATEGORIER]} value={kategori} onChange={setKategori} />
        <Velger
          label="Nivå (valgfri)"
          options={[{ value: "", label: "Alle nivå" }, ...NIVAER.map((n) => ({ value: n, label: n }))]}
          value={niva}
          onChange={setNiva}
        />
        <Velger
          label="Fokus (valgfri)"
          options={[{ value: "", label: "Alle fokus" }, ...FOKUS.map((f) => ({ value: f, label: f }))]}
          value={fokus}
          onChange={setFokus}
        />
        <Inndata
          label="Beskrivelse (valgfri)"
          value={beskrivelse}
          onChange={setBeskrivelse}
          placeholder="Kort om hva ressursen dekker"
        />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
        <Knapp icon="plus" onClick={submit} disabled={pending || !tittel.trim() || !url.trim()}>
          {pending ? "Lagrer…" : "Lagre ressurs"}
        </Knapp>
      </div>
    </Kort>
  );
}

export function AdminTalentRessurserV2({ data }: { data: AdminTalentRessurserV2Data }) {
  // Ett aktivt valg per dimensjon (samme semantikk som legacy-?kategori/&niva/&fokus).
  const [kategori, setKategori] = useState<string[]>([]);
  const [niva, setNiva] = useState<string[]>([]);
  const [fokus, setFokus] = useState<string[]>([]);

  const velgEn = (set: (v: string[]) => void, aktiv: string[]) => (x: string) =>
    set(aktiv.indexOf(x) !== -1 ? [] : [x]);

  const filtrert = useMemo(
    () =>
      data.ressurser.filter((r) => {
        if (kategori.length > 0 && r.kategori !== kategori[0]) return false;
        if (niva.length > 0 && r.niva !== niva[0]) return false;
        if (fokus.length > 0 && r.fokus !== fokus[0]) return false;
        return true;
      }),
    [data.ressurser, kategori, niva, fokus],
  );

  const harFilter = kategori.length > 0 || niva.length > 0 || fokus.length > 0;

  const hode = (
    <div>
      <Caps>Talent · Ressurser</Caps>
      <div style={{ marginTop: 10 }}>
        <Tittel em="bibliotek.">Ressurs-</Tittel>
      </div>
      <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.55, margin: "10px 0 0", maxWidth: 520 }}>
        {data.ressurser.length} ressurser tilgjengelig — video, artikler og podcasts
        for talent-utvikling.
      </p>
    </div>
  );

  const filterRad = (label: string, items: string[], aktiv: string[], onToggle: (x: string) => void) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
      <Caps size={9} style={{ width: 64, flex: "none", paddingTop: 8 }}>{label}</Caps>
      <div style={{ flex: 1, minWidth: 0 }}>
        <FilterChips items={items} active={aktiv} onToggle={onToggle} />
      </div>
    </div>
  );

  const filtre = (
    <Kort pad="14px 16px">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filterRad("Kategori", [...KATEGORIER], kategori, velgEn(setKategori, kategori))}
        {filterRad("Nivå", [...NIVAER], niva, velgEn(setNiva, niva))}
        {filterRad("Fokus", [...FOKUS], fokus, velgEn(setFokus, fokus))}
      </div>
    </Kort>
  );

  const grid =
    filtrert.length === 0 ? (
      <Kort>
        <TomTilstand
          icon="book-open"
          title={harFilter ? "Ingen ressurser matcher filter" : "Ingen ressurser ennå"}
          sub={harFilter ? "Prøv å nullstille noen av filterne." : "Legg til første ressurs for å komme i gang."}
        />
      </Kort>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: T.gap }}>
        {filtrert.map((r) => (
          <Kort key={r.id} hover>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <StatusPill tone="lime">
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Icon name={KAT_IKON[r.kategori] ?? "file-text"} size={11} />
                  {r.kategori}
                </span>
              </StatusPill>
              {r.niva && <StatusPill tone="info">{r.niva}</StatusPill>}
              {r.fokus && <StatusPill tone="info">{r.fokus}</StatusPill>}
            </div>
            <div style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, color: T.fg, lineHeight: 1.3, marginTop: 10 }}>
              {r.tittel}
            </div>
            {r.beskrivelse && (
              <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.55, margin: "6px 0 0" }}>
                {r.beskrivelse}
              </p>
            )}
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="v2-focus"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 12,
                fontFamily: T.mono,
                fontSize: 11.5,
                fontWeight: 700,
                color: T.lime,
                textDecoration: "none",
              }}
            >
              Åpne
              <Icon name="external-link" size={12} />
            </a>
          </Kort>
        ))}
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {filtre}
      {data.erAdmin && <LeggTilSkjema />}
      {grid}
    </div>
  );
}
