"use client";

/**
 * AG-11b Øvelsesbank for coach i AgencyOS (/admin/ovelser), bølge 2 (20.10.2026).
 * Fasit: canvas «Øvelsesbank» (godkjent av Anders 20.10). Erstatter spillerkomponenten PH-13 i coachens bank;
 * spillerens bank (/portal/drills) er uendret.
 *
 * Søket leter i alle øvelser coachen har tilgang til (hele lista er med, ingen grense på 60). Uten søk og filter står de
 * mest brukte øvelsene først (talt i Workbench-øktene til spillerne, ikke et tidsvindu). «Ny øvelse» åpner øvelsesarket
 * med de åtte trinnene (AG14Ovelseark), som lagrer i banken. Rader åpner Øvelser i Plan-hub, der coachen endrer øvelsen.
 *
 * Avvik:
 *   - Caddie-forslaget og break-tabellen er spillerens sider og er ikke med.
 *   - «Legg i økta» skjer i Workbench; her lages og finnes øvelser.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { KnappLenke, Knapp, Pille, Seksjon, Tom, Topp, Varsel } from "@/components/admin/agencyos-ny/ny";
import {
  OV_AKSE_KODE, OV_PYRAMIDE, TOMT_FILTER, antallPerAkse, filterAktivt, omraaderFor, passer, verdierI,
  type OvAkse, type OvFilter, type OvelseVisning,
} from "@/lib/portal-drills/ovelser-visning";
import { AG14Ovelseark } from "./AG14Ovelseark";
import "@/styles/agencyos-ny-ovelsesbank.css";

const HREF = "/admin/plan?fane=ovelser";

export function AG11Ovelsesbank({ ovelser }: { ovelser: OvelseVisning[] }) {
  const router = useRouter();
  const [f, setF] = useState<OvFilter>(TOMT_FILTER);
  const [ark, setArk] = useState(false);
  const [lagret, setLagret] = useState<{ tittel: string; kode: string } | null>(null);
  const treff = useMemo(() => ovelser.filter((o) => passer(o, f)), [ovelser, f]);
  const perAkse = useMemo(() => antallPerAkse(ovelser), [ovelser]);
  const omraader = f.akse ? omraaderFor(ovelser, f.akse) : [];
  const miljoer = useMemo(() => verdierI(ovelser, "miljo"), [ovelser]);
  const presser = useMemo(() => verdierI(ovelser, "press"), [ovelser]);
  const sett = (p: Partial<OvFilter>) => setF((x) => ({ ...x, ...p }));

  return <div className="agn-s">
    <Topp dato="Workbench · øvelsesbank" tittel="Øvelsesbank" ingress="Alle øvelser du har tilgang til. Coachen får samme bank som spilleren."
      handlinger={<><Knapp variant="pri" onClick={() => { setLagret(null); setArk(true); }}><Plus className="ikon" aria-hidden style={{ width: 16, height: 16 }} />Ny øvelse</Knapp><KnappLenke variant="sek" href="/admin/plan">Til Plan-hub</KnappLenke></>} />
    {lagret && <Varsel tone="ok" tittel={lagret.tittel}><span className="mono">{lagret.kode}</span></Varsel>}

    <Seksjon tittel="Alle øvelser" kilde={`${filterAktivt(f) ? `${treff.length} av ` : ""}${ovelser.length}`}>
      <label className="ob-sok"><Search className="ikon" aria-hidden />
        <input type="search" value={f.sok} onChange={(e) => sett({ sok: e.target.value })} placeholder="Navn eller treningsområde" aria-label="Søk i alle øvelser" /></label>
      <div className="ob-chips" role="group" aria-label="Pyramide">
        <button type="button" aria-pressed={f.akse === null} onClick={() => sett({ akse: null, omraade: null })}>Alle <b className="num">{ovelser.length}</b></button>
        {OV_PYRAMIDE.map((a: OvAkse) => <button key={a} type="button" aria-pressed={f.akse === a} onClick={() => sett({ akse: f.akse === a ? null : a, omraade: null })}>{OV_AKSE_KODE[a]} <b className="num">{perAkse[a]}</b></button>)}
      </div>
      <div className="ob-filtre">
        {omraader.length > 0 && <label className="felt"><span className="etikett">Treningsområde</span>
          <select value={f.omraade ?? ""} onChange={(e) => sett({ omraade: e.target.value || null })}><option value="">Alle</option>{omraader.map((o) => <option key={o} value={o}>{o}</option>)}</select></label>}
        {miljoer.length > 0 && <label className="felt"><span className="etikett">Treningsmiljø</span>
          <select value={f.miljo ?? ""} onChange={(e) => sett({ miljo: e.target.value || null })}><option value="">Alle</option>{miljoer.map((m) => <option key={m} value={m}>{m}</option>)}</select></label>}
        {presser.length > 0 && <label className="felt"><span className="etikett">Press</span>
          <select value={f.press ?? ""} onChange={(e) => sett({ press: e.target.value || null })}><option value="">Alle</option>{presser.map((p) => <option key={p} value={p}>{p}</option>)}</select></label>}
        {filterAktivt(f) && <Knapp variant="spok" onClick={() => setF(TOMT_FILTER)}>Nullstill filter</Knapp>}
      </div>

      {ovelser.length === 0
        ? <Tom tittel="Ingen øvelser ennå" tekst="Lag den første med «Ny øvelse»." />
        : treff.length === 0
          ? <Tom tittel="Ingen øvelser passer filteret" tekst="Ta bort et filter, eller lag en egen øvelse." />
          : <div className="ob-liste">
            <div className="ob-rad ob-topp" aria-hidden><span /><span>Øvelse</span><span>Miljø</span><span>Press</span><span>Brukt</span></div>
            {treff.map((o) => <Link key={o.id} href={HREF} className="ob-rad">
              <i className={`ob-akse ${o.akse}`} aria-hidden />
              <span className="ob-navn"><b>{o.navn}{o.egen && <Pille>Egen</Pille>}</b><span className="kilde">{OV_AKSE_KODE[o.akse]}{o.omraade ? ` · ${o.omraade}` : ""}{o.mengde ? ` · ${o.mengde}` : ""}</span></span>
              <span className="ob-miljo">{o.miljo[0] ?? "—"}</span>
              <span className="ob-press">{o.press ?? "—"}</span>
              <b className="num ob-brukt">{o.brukt}×</b>
            </Link>)}
          </div>}
      <p className="kilde">Mest brukt først, talt i Workbench-øktene til spillerne · søket leter i hele banken</p>
    </Seksjon>

    {ark && <AG14Ovelseark key="ny" open ovelse={null} onLukk={() => setArk(false)}
      onLagret={(tittel, kode) => { setArk(false); setLagret({ tittel, kode }); router.refresh(); }} />}
  </div>;
}
