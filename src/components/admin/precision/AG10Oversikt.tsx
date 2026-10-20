"use client";

/**
 * Teknisk plan · oversikt (/admin/plan/teknisk) i nytt design (bølge 2, 20.10.2026).
 * Fasit: canvas «Teknisk plan · oversikt» (AG-10). Én rad per spiller i stallen med spillerens tekniske plan
 * (TechnicalPlan): status, oppgaver per posisjon P1.0–P10.0, oppgaver, repetisjoner og sist registrert.
 * Stil: src/styles/agencyos-ny-teknisk.css (.agn-s).
 *
 * Avvik: «Venter på deg» teller spillere med plan i utkast; planer venter ikke på noe annet i basen.
 */
import Link from "next/link";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { KnappLenke, Pille, Seksjon, Tom, Topp, type PilleTone } from "@/components/admin/agencyos-ny/ny";
import { brok } from "@/components/precision/teknisk-plan/tp-deler";
import type { OversiktRad } from "@/lib/teknisk-plan/tp-oversikt";
import "@/styles/agencyos-ny-mer.css";
import "@/styles/agencyos-ny-teknisk.css";

const TONE: Record<NonNullable<OversiktRad["status"]>, PilleTone> = { Aktiv: "ok", Utkast: "vent", Arkivert: "noy" };
const tall = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

function PosStrip({ ant }: { ant: number[] }) {
  const maks = Math.max(1, ...ant);
  return <span className="pos-strip" role="img" aria-label={`Oppgaver per posisjon P1.0 til P10.0: ${ant.join(", ")}`}>
    {ant.map((a, i) => <i key={i} className={a ? "har" : ""} style={{ height: `${a ? 8 + Math.round((a / maks) * 18) : 6}px` }} />)}
  </span>;
}

export function AG10Oversikt({ coachNavn, rader }: { coachNavn: string; rader: OversiktRad[] }) {
  const medPlan = rader.filter((r) => r.planId);
  const utkast = medPlan.filter((r) => r.status === "Utkast").length;
  const oppgaver = rader.reduce((s, r) => s + r.oppgaver, 0);
  const gjort = rader.reduce((s, r) => s + r.gjort, 0);
  return <AgencyOSSkall navn={coachNavn}>
    <div className="agn-s">
      <Topp dato="Plan · teknisk plan" tittel="Teknisk plan"
        ingress="Oppgaver per posisjon P1.0–P10.0 for hver spiller i stallen. Åpne en spiller for å se og endre planen."
        handlinger={<KnappLenke href="/admin/plan">Plan</KnappLenke>} />
      {rader.length === 0
        ? <Tom tittel="Ingen spillere i stallen" tekst="Spillere du coacher, vises her med sin tekniske plan." />
        : <>
          <div className="teller-rad">
            <div className="teller"><span className="e">Spillere med plan</span><b className="t">{medPlan.length} av {rader.length}</b><span className="s">{utkast > 0 ? `${utkast} utkast venter` : "ingen utkast venter"}</span></div>
            <div className="teller"><span className="e">Oppgaver</span><b className="t">{tall(oppgaver)}</b><span className="s">i alle planer</span></div>
            <div className="teller"><span className="e">Repetisjoner</span><b className="t">{tall(gjort)}</b><span className="s">alle kilder</span></div>
            <div className="teller"><span className="e">Venter på deg</span><b className="t">{utkast}</b><span className="s">utkast å publisere</span></div>
          </div>
          <Seksjon tittel="Spillere" kilde={`${rader.length} ${rader.length === 1 ? "spiller" : "spillere"}`}>
            <div className="tp-liste">
              <div className="tp-rad tp-topp" aria-hidden><span>Spiller</span><span>Status</span><span>Oppgaver P1.0–P10.0</span><span>Oppgaver</span><span>Repetisjoner</span><span>Sist registrert</span></div>
              {rader.map((r) => <Link key={r.id} className="tp-rad" href={r.planId ? `/admin/spillere/${r.id}/plan/${r.planId}` : `/admin/spillere/${r.id}/plan`}>
                <span className="tp-navn"><b>{r.navn}</b><span className="kilde">{r.planNavn ?? "Ingen teknisk plan"}{r.antallPlaner > 1 ? ` · ${r.antallPlaner} planer` : ""}</span></span>
                <span>{r.status ? <Pille tone={TONE[r.status]}>{r.status}</Pille> : <Pille tone="noy">Ingen plan</Pille>}</span>
                <PosStrip ant={r.perPosisjon} />
                <b className="num tp-tall">{r.planId ? r.oppgaver : "—"}</b>
                <span className="num tp-tall">{r.maal > 0 ? brok(r.gjort, r.maal) : r.gjort > 0 ? `${r.gjort} · ingen mål` : "—"}</span>
                <span className="num kilde">{r.sistRegistrert}</span>
              </Link>)}
            </div>
          </Seksjon>
        </>}
    </div>
  </AgencyOSSkall>;
}
