"use client";

/**
 * AG-11-GRUPPE Workbench · gruppe i Precision Athletics. Tegning: Claude Design
 * 7d7c2994, ui_kits/agencyos/screens/AG-11-wb3.jsx (mode0="gruppe") og
 * ui_kits/_shared/WB3.jsx.
 *
 * Portert: skallet, velgeren (spiller/gruppe med forrige/neste og søk), fanene,
 * grunnmur-merknaden med ekte medlemstall og de faste gruppetidene. Gruppas
 * årsplan (perioder, rull ut) er AG-11-GRUPPE-AR og følger en egen beslutning
 * (PR #995); den vises her som før, uendret. En ukeplan for gruppa (økter som
 * arves av medlemmene) finnes ikke i Workbench-motoren og er ikke tegnet inn
 * (Parkert). Planforslag for gruppe (B4) er skjult ved lansering.
 */
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Layers } from "lucide-react";
import { Ikon, KnappLenke } from "@/components/precision/pa";
import { FanerLenker, Side, SideHode } from "@/components/precision/pa-a4";
import { Caps, Listerad, Velger } from "@/components/precision/pa-workbench";
import { VelgerArk } from "./AG11Ark";
import { MonthPlan } from "@/components/workbench/MonthPlan";
import "@/styles/precision-a9.css";

export type AG11GruppeProps = {
  gruppe: { id: string; navn: string; medlemmer: number };
  grupper: readonly { id: string; navn: string }[];
  faste: readonly { id: string; dag: string; tid: string; sted: string | null }[];
  /** Gruppas årsplan (ikke portert, AG-11-GRUPPE-AR). */
  aarsplan: ReactNode;
  malUtrulling?: ReactNode;
  initialMonth?: string;
  initialMode?: "aar" | "maned";
};

export function AG11Gruppe({ gruppe, grupper, faste, aarsplan, malUtrulling, initialMonth, initialMode = "aar" }: AG11GruppeProps) {
  const router = useRouter();
  const [velger, setVelger] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const [month, setMonth] = useState(initialMonth ?? new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date()).slice(0, 7));
  const idx = grupper.findIndex((g) => g.id === gruppe.id);
  const til = (d: number) => router.push(`/admin/grupper/${grupper[(idx + d + grupper.length) % grupper.length].id}/workbench`);
  const id = gruppe.id;

  return <Side max={1440}>
    <div className="a9">
      <SideHode kicker="Workbench · Gruppe" title="Workbench" />
      <Velger modus="gruppe" navn={gruppe.navn}
        onModus={(m) => { if (m === "spiller") router.push("/admin/planlegge"); }}
        onForrige={grupper.length > 1 && idx >= 0 ? () => til(-1) : undefined}
        onNeste={grupper.length > 1 && idx >= 0 ? () => til(1) : undefined}
        onSok={() => setVelger(true)}
        meta={`${gruppe.medlemmer} ${gruppe.medlemmer === 1 ? "MEDLEM" : "MEDLEMMER"}`} />
      <FanerLenker faner={[
        { href: `/admin/grupper/${id}`, navn: "Medlemmer", aktiv: false },
        { href: `/admin/grupper/${id}/workbench`, navn: "Workbench", aktiv: true },
        { href: `/admin/grupper/${id}/arsplan`, navn: "Årsplan", aktiv: false },
        { href: `/admin/grupper/${id}/timeplan`, navn: "Timeplan", aktiv: false },
        { href: `/admin/grupper/${id}/arsplan/skoledata`, navn: "Skoledata", aktiv: false },
      ]} />
      <div role="note" className="pa-alert"><Ikon icon={Layers} size={18} /><span>{gruppe.medlemmer} aktive {gruppe.medlemmer === 1 ? "medlem" : "medlemmer"}. Gruppeplanen beskriver felles fokus og perioder. Utrulling til personlige planer bekreftes separat.</span></div>
      <div role="group" aria-label="Gruppeplanens horisont" className="pa-seg"><button type="button" className="pa-seg__opt" aria-pressed={mode === "aar"} onClick={() => setMode("aar")}>Årsplan</button><button type="button" className="pa-seg__opt" aria-pressed={mode === "maned"} onClick={() => setMode("maned")}>Månedsplan</button></div>
      {mode === "maned" ? <><label className="ws-field month-group-selector">Velg måned<input type="month" min="1900-01" max="9998-12" value={month} onChange={e => { if (/^\d{4}-(0[1-9]|1[0-2])$/.test(e.target.value)) setMonth(e.target.value); }} /></label><MonthPlan owner={{ kind: "group", groupId: gruppe.id }} year={Number(month.slice(0, 4))} month={Number(month.slice(5, 7))} /></> : <section className="pa-card a9-kort" aria-label="Gruppas årsplan">
        <h2 className="a9-kort__tittel">Gruppas årsplan</h2>
        <div className="a9-arv a9-arv--gruppe">{aarsplan}</div>
      </section>}
      {malUtrulling}
      <details className="pa-card a9-kort">
        <summary>Faste gruppetider · {faste.length}</summary>
        <div className="a9-kort__hode"><span className="a9-kort__tittel">Faste gruppetider</span><KnappLenke variant="ghost" size="sm" href={`/admin/grupper/${id}/timeplan`}>Rediger timeplan</KnappLenke></div>
        {faste.length === 0 ? <Caps>INGEN FASTE TIDER REGISTRERT</Caps> : <div role="list" className="a9-liste">
          {faste.map((f, i) => <Listerad key={f.id} forste={i === 0} tittel={`${f.dag} ${f.tid}`} under={f.sted ? f.sted.toUpperCase() : undefined} />)}
        </div>}
      </details>
    </div>
    {velger && <VelgerArk modus="gruppe" liste={grupper} valgtId={gruppe.id} hrefFor={(g) => `/admin/grupper/${g}/workbench`} onLukk={() => setVelger(false)} />}
  </Side>;
}
