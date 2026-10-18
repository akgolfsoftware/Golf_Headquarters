"use client";

/**
 * AG-10 Teknisk plan (coach) i nytt design (pakke 6). Med ?oppgave= vises AG-TP-01.
 * Fasit: docs/design-system/utkast-agencyos/teknisk.html, skjerm «AG-10 Teknisk plan».
 * Rute: /admin/spillere/[id]/plan/[planId]. Stil: src/styles/agencyos-ny-teknisk.css.
 * Funksjoner som før: Publiser og Dupliser (plan-actions), Ny oppgave, Rediger, Legg i økt (Workbench),
 * siste registreringer.
 *
 * Avvik:
 *   - Posisjonsstatus (Ikke startet · Jobber med · Godkjent) finnes ikke i basen; posisjoner med oppgave
 *     er fylt i TEK-farge, de uten viser «—».
 *   - «Før og nå» og kvalitetssjekk: bildene finnes ikke ennå (to daterte bilder per oppgave krever tillegg i
 *     datamodellen). Kvalitetssjekken vises som status; logg for den finnes ikke.
 *   - Siste registreringer viser spillerens kommentar. «Svar» (coachens svar) finnes ikke ennå.
 *   - «Legg i økt» åpner spillerens Workbench, der øvelsen kobles til oppgaven.
 *   - Publiseringsdato finnes ikke; planstatus vises.
 */
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Copy, Plus, Send } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Pille } from "@/components/admin/agencyos-ny/ny";
import { publiserTekniskPlan, dupliserTekniskPlan } from "@/app/admin/spillere/[id]/plan/[planId]/plan-actions";
import { TP_POSISJONER, type TpOppgave, type TpPlan, type TpTmRad } from "@/lib/teknisk-plan/tp-visning";
import { formaterTall } from "@/lib/format-tall";
import { AGTP01OppgaveskjemaNy, type AGTP01NyProps } from "./AGTP01OppgaveskjemaNy";
import "@/styles/agencyos-ny-teknisk.css";

export type AG10NyProps = {
  coachNavn: string;
  spiller: { id: string; navn: string };
  plan: TpPlan;
  planAktiv: boolean;
  skjema?: Omit<AGTP01NyProps, "planId" | "spillerId" | "spillerNavn" | "planAktiv"> | null;
};

const d = (v: number | null | undefined, n = 1) => formaterTall(v, n, true);
const tall = (v: number) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

function TmSkala({ r }: { r: TpTmRad }) {
  const pkt = [r.fra, r.til, r.naa, r.utgangspunkt].filter((v): v is number => v != null);
  if (pkt.length === 0) return null;
  const lo = Math.min(...pkt), hi = Math.max(...pkt), pad = (hi - lo || 1) * 0.25;
  const a = lo - pad, b = hi + pad;
  const x = (v: number) => `${((v - a) / (b - a)) * 100}%`;
  const fra = r.fra ?? a, til = r.til ?? b;
  return <div className="skala-tm">
    <div className="spor" role="img" aria-label={`${r.navn}: mål ${r.fra != null ? d(r.fra, r.desimaler) : "—"} til ${r.til != null ? d(r.til, r.desimaler) : "—"}, nå ${r.naa != null ? d(r.naa, r.desimaler) : "—"}`}>
      <span className="mal" style={{ left: x(fra), width: `calc(${x(til)} - ${x(fra)})` }} />
      {r.naa != null && <span className="naa" style={{ left: x(r.naa) }} />}
    </div>
    <div className="tall-rad"><span>{d(a, r.desimaler)}{r.enhet}</span><span>{d(b, r.desimaler)}{r.enhet}</span></div>
    <p className="forklar"><b>{r.navn}</b> ({r.klubb}) · nå <b>{r.naa != null ? `${d(r.naa, r.desimaler)}${r.enhet}` : "—"}</b>{r.utgangspunkt != null ? ` · utgangspunkt ${d(r.utgangspunkt, r.desimaler)}${r.enhet} (${r.utgangspunktDato})` : ""} · {r.innenfor == null ? "ikke målt" : r.innenfor ? "innenfor målet" : "utenfor målet"}</p>
  </div>;
}

function OppgavePanel({ o, spillerId, planHref }: { o: TpOppgave; spillerId: string; planHref: string }) {
  const treff = o.protokoll?.siste;
  return <>
    <div className="oppg">
      <div className="rad"><span className="akse-merke"><i aria-hidden />TEK</span><span className="meta">{[o.omraade, o.slag !== "—" ? o.slag : null, o.stegNaa, o.miljoNaa].filter(Boolean).join(" · ")}</span></div>
      <b className="n">{o.pNummer} · {o.tittel}</b>
      <span className="meta">Teknisk fokus: {o.fokus}{o.utstyr ? ` · ${o.utstyr}` : ""}</span>
      <div className="rep-grid">{o.steg.map((s) => <div key={s.navn}><b>{tall(s.gjort)}</b><span className="t">{s.navn} · av {s.maal != null ? tall(s.maal) : "—"}</span><div className="stolpe"><span style={{ width: `${s.maal ? Math.min(100, (s.gjort / s.maal) * 100) : 0}%` }} /></div></div>)}</div>
      <div className="knapper">
        <Link className="knapp lys" href={`${planHref}?oppgave=${o.id}`}>Rediger oppgaven</Link>
        <Link className="knapp omriss" href={`/admin/workbench/${spillerId}`}>Legg i økt</Link>
      </div>
    </div>
    <section className="seksjon" aria-label="Miljø">
      <div className="sek-topp"><h2>Miljø</h2><span className="kilde">Rep-mål per miljø</span></div>
      <div className="teller-rad" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>{o.miljo.map((m) => <div key={m.kode} className="teller" style={{ cursor: "default", minHeight: 0 }}><span className="e">{m.navn}</span><b className="t" style={{ fontSize: 20 }}>{m.maal == null ? (m.gjort ? `${tall(m.gjort)} / —` : "—") : `${tall(m.gjort)} / ${tall(m.maal)}`}</b><span className="s">{m.maal == null ? "Ikke i planen" : ""}</span></div>)}</div>
    </section>
    {o.tm.length > 0 && <section className="seksjon" aria-label="TrackMan-mål"><div className="sek-topp"><h2>TrackMan-mål</h2><span className="kilde">{o.tm.length} {o.tm.length === 1 ? "parameter" : "parametere"}</span></div>{o.tm.map((r) => <TmSkala key={r.id} r={r} />)}</section>}
    <section className="seksjon" aria-label="Treffprotokoll">
      <div className="sek-topp"><h2>Treffprotokoll</h2><span className="kilde">{o.protokoll ? o.protokoll.navn : "Ingen"}</span></div>
      {o.protokoll ? <><p className="forklar">{o.protokoll.tekst}</p><p className="forklar"><b>Nå:</b> {o.protokoll.naa}</p>
        {treff && <div className="protokoll" role="img" aria-label={`${treff.treff} av ${treff.antall} treff`}>{Array.from({ length: Math.min(treff.antall, 20) }, (_, i) => <i key={i} className={i < treff.treff ? "t" : "b"} />)}</div>}</>
        : <p className="kilde">Ingen treffprotokoll satt for oppgaven.</p>}
    </section>
    <section className="seksjon" aria-label="Kvalitetssjekk"><div className="sek-topp"><h2>Kvalitetssjekk</h2><Pille tone="noy">Vises bare</Pille></div><p className="forklar">Viser status. Spilleren kan gå videre til neste læringssteg uansett.</p></section>
  </>;
}

export function AG10TekniskPlanNy({ coachNavn, spiller, plan, planAktiv, skjema }: AG10NyProps) {
  const router = useRouter();
  const [valgt, setValgt] = useState<string | null>(plan.oppgaver.find((o) => o.hovedP === plan.hovedfokus[0])?.hovedP ?? plan.oppgaver[0]?.hovedP ?? null);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const planHref = `/admin/spillere/${spiller.id}/plan/${plan.id}`;
  const vis = valgt ? plan.oppgaver.filter((o) => o.hovedP === valgt) : plan.oppgaver;
  const posNavn = TP_POSISJONER.find((p) => p.pNummer === valgt)?.navn;

  if (skjema) {
    return <AgencyOSSkall navn={coachNavn}>
      <AGTP01OppgaveskjemaNy key={skjema.skjema.id ?? "ny"} planId={plan.id} spillerId={spiller.id} spillerNavn={spiller.navn} planAktiv={planAktiv} {...skjema} />
    </AgencyOSSkall>;
  }
  const kjor = (fn: () => Promise<unknown>, melding: string) => start(async () => {
    try { await fn(); setFeil(null); router.refresh(); }
    catch (e) { if (e instanceof Error && e.message === "NEXT_REDIRECT") return; setFeil(e instanceof Error ? e.message : melding); }
  });

  return <AgencyOSSkall navn={coachNavn}>
    <div className="agn-s">
      <div className="topp">
        <Link href={`/admin/spillere/${spiller.id}`} className="ag-tilbake"><ChevronLeft className="ikon" aria-hidden />{spiller.navn}</Link>
        <div className="topp-rad">
          <div><div className="dato">{spiller.navn} · teknisk plan</div><h1 className="tittel">{plan.navn}</h1></div>
          <Pille tone={plan.statusTone === "ok" ? "ok" : plan.statusTone === "warn" ? "vent" : "noy"}>{plan.status}</Pille>
        </div>
        <div className="knapper">
          <Link className="knapp pri" href={`${planHref}?oppgave=ny`}><Plus className="ikon" aria-hidden style={{ width: 16, height: 16 }} />Ny oppgave</Link>
          {!planAktiv && <button type="button" className="knapp sek" disabled={pending} onClick={() => kjor(() => publiserTekniskPlan(plan.id), "Planen ble ikke publisert.")}><Send className="ikon" aria-hidden style={{ width: 16, height: 16 }} />Publiser</button>}
          <button type="button" className="knapp spok" disabled={pending} onClick={() => kjor(() => dupliserTekniskPlan(plan.id), "Planen ble ikke kopiert.")}><Copy className="ikon" aria-hidden style={{ width: 16, height: 16 }} />Dupliser</button>
          <Link className="knapp spok" href={`${planHref}/for-og-na`}>Før og nå</Link>
        </div>
        {feil && <div className="varsel advarsel" role="alert"><p className="forklar">{feil}</p></div>}
      </div>

      {plan.oppgaver.length === 0
        ? <div className="kort dempet"><b className="undertittel">Ingen oppgaver i planen ennå</b><p className="forklar">Start med posisjonen dere jobber mest med. Legg til én oppgave med ett teknisk fokus. Spilleren ser planen når du publiserer.</p><div className="knapper"><Link className="knapp pri" href={`${planHref}?oppgave=ny`}>Ny oppgave</Link></div></div>
        : <>
          <section className="seksjon" aria-label="Posisjoner">
            <div className="sek-topp"><h2>Posisjoner</h2><span className="kilde">{plan.oppgaver.length} {plan.oppgaver.length === 1 ? "oppgave" : "oppgaver"} · {plan.gjort} av {plan.maal || "—"} rep</span></div>
            <div className="posisjoner" role="group" aria-label="Posisjoner P1.0–P10.0">{TP_POSISJONER.map(({ pNummer }) => {
              const c = plan.oppgaver.filter((o) => o.hovedP === pNummer).length;
              return <button key={pNummer} type="button" className={c ? "har" : ""} aria-pressed={valgt === pNummer} aria-label={`${pNummer} ${TP_POSISJONER.find((p) => p.pNummer === pNummer)?.navn}, ${c} ${c === 1 ? "oppgave" : "oppgaver"}`} onClick={() => setValgt(valgt === pNummer ? null : pNummer)}><b>{pNummer.replace(".0", "")}</b><span>{c ? `${c} ${c === 1 ? "oppgave" : "oppgaver"}` : "—"}</span></button>;
            })}</div>
            <p className="forklar">{valgt ? `${valgt} ${posNavn}${vis.length === 0 ? " · ingen oppgave. Legg til en oppgave for posisjonen." : ""}` : "Alle posisjoner. Trykk en posisjon for å filtrere."}</p>
          </section>
          {vis.length === 0
            ? <div className="knapper"><Link className="knapp sek" href={`${planHref}?oppgave=ny`}>Legg til oppgave</Link></div>
            : vis.map((o) => <div key={o.id} className="seksjon"><OppgavePanel o={o} spillerId={spiller.id} planHref={planHref} /></div>)}
          <section className="seksjon" aria-label="Siste registreringer">
            <div className="sek-topp"><h2>Siste registreringer</h2><span className="kilde">Live-økt · TrackMan · manuelt</span></div>
            {plan.logg.length === 0 ? <p className="kilde">Ingen registreringer ennå.</p> : <div className="kort" style={{ gap: 0, paddingTop: 4, paddingBottom: 4 }}>{plan.logg.map((l) => <div key={l.id} className="reg">
              <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{l.dato}</span>
              <span><b>{l.pNummer} · {l.oppgave}</b><span className="kilde">{(l.steg ?? "Uten læringssteg")} · {(l.miljo ?? "Miljø ikke registrert")} · {l.kilde}{l.kommentar ? ` · ${spiller.navn.split(" ")[0]}: ${l.kommentar}` : ""}</span></span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{l.reps} rep.</span>
            </div>)}</div>}
          </section>
        </>}
    </div>
  </AgencyOSSkall>;
}
