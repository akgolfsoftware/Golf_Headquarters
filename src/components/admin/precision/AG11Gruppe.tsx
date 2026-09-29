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
import "@/styles/precision-a9.css";

export type AG11GruppeProps = {
  gruppe: { id: string; navn: string; medlemmer: number };
  grupper: readonly { id: string; navn: string }[];
  faste: readonly { id: string; dag: string; tid: string; sted: string | null }[];
  /** Gruppas årsplan (ikke portert, AG-11-GRUPPE-AR). */
  aarsplan: ReactNode;
};

export function AG11Gruppe({ gruppe, grupper, faste, aarsplan }: AG11GruppeProps) {
  const router = useRouter();
  const [velger, setVelger] = useState(false);
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
      <div role="note" className="pa-alert"><Ikon icon={Layers} size={18} /><span>Gruppeplanen er grunnmuren. {gruppe.medlemmer} aktive {gruppe.medlemmer === 1 ? "medlem" : "medlemmer"}. Gruppas perioder kan rulles ut til medlemmenes egne årsplaner.</span></div>
      <section className="pa-card a9-kort" aria-label="Gruppas årsplan">
        <span className="kicker">Gruppas årsplan</span>
        <div className="a9-arv a9-arv--gruppe">{aarsplan}</div>
      </section>
      <section className="pa-card a9-kort" aria-label="Faste gruppetider">
        <div className="a9-kort__hode"><span className="a9-kort__tittel">Faste gruppetider</span><KnappLenke variant="ghost" size="sm" href={`/admin/grupper/${id}/timeplan`}>Rediger timeplan</KnappLenke></div>
        {faste.length === 0 ? <Caps>INGEN FASTE TIDER REGISTRERT</Caps> : <div role="list" className="a9-liste">
          {faste.map((f, i) => <Listerad key={f.id} forste={i === 0} tittel={`${f.dag} ${f.tid}`} under={f.sted ? f.sted.toUpperCase() : undefined} />)}
        </div>}
      </section>
    </div>
    {velger && <VelgerArk modus="gruppe" liste={grupper} valgtId={gruppe.id} hrefFor={(g) => `/admin/grupper/${g}/workbench`} onLukk={() => setVelger(false)} />}
  </Side>;
}
