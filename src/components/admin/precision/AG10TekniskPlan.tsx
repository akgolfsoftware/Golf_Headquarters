"use client";

/**
 * AG-10 Teknisk plan (utvidet), Precision Athletics. Tegning: Claude Design
 * 7d7c2994, ui_kits/agencyos/screens/AG-10.jsx (etag 1790542555438652).
 * Rute /admin/spillere/[id]/plan/[planId]; med ?oppgave= vises AG-TP-01.
 *
 * Avvik fra tegningen, fordi dataene ikke finnes i basen (tillegg D1–D4):
 * - Posisjonsstatus (Ikke startet · Jobber med · Godkjent) vises ikke.
 * - «Før og nå» og kvalitetssjekk er tomme; knappene som ikke kan lagre, er utelatt.
 * - Siste registreringer viser spillerens kommentar, men coachen kan ikke svare ennå.
 * - «Legg i økt» åpner spillerens Workbench, der øvelsen kobles til oppgaven.
 * «Publiser» og «Dupliser» er beholdt fra dagens coachside.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarPlus, Copy, ListChecks, Pencil, Plus, Send } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Knapp, KnappLenke, TomTilstand } from "@/components/precision/pa";
import { Meta, OppgaveKort, Oppsummering, Posisjonslinje } from "@/components/precision/teknisk-plan/tp-deler";
import { publiserTekniskPlan, dupliserTekniskPlan } from "@/app/admin/spillere/[id]/plan/[planId]/plan-actions";
import { TP_POSISJONER, type TpPlan } from "@/lib/teknisk-plan/tp-visning";
import { AGTP01Oppgaveskjema, type AGTP01Props } from "./AGTP01Oppgaveskjema";
import "@/styles/precision-a4.css";

export type AG10Props = {
  coachNavn: string;
  spiller: { id: string; navn: string };
  plan: TpPlan;
  planAktiv: boolean;
  /** Satt når ?oppgave= er i adressen: viser oppgaveskjemaet (AG-TP-01). */
  skjema?: Omit<AGTP01Props, "planId" | "spillerId" | "spillerNavn" | "planAktiv"> | null;
};

export function AG10TekniskPlan({ coachNavn, spiller, plan, planAktiv, skjema }: AG10Props) {
  const router = useRouter();
  const [valgt, setValgt] = useState<string | null>(null);
  const [aapne, setAapne] = useState<Record<string, boolean>>(() => (plan.oppgaver[0] ? { [plan.oppgaver[0].id]: true } : {}));
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const planHref = `/admin/spillere/${spiller.id}/plan/${plan.id}`;
  const vis = valgt ? plan.oppgaver.filter((o) => o.hovedP === valgt) : plan.oppgaver;
  const posNavn = TP_POSISJONER.find((p) => p.pNummer === valgt)?.navn;

  if (skjema) {
    return <AgencyOSSkall navn={coachNavn}>
      <div className="pa-side">
        <AGTP01Oppgaveskjema key={skjema.skjema.id ?? "ny"} planId={plan.id} spillerId={spiller.id} spillerNavn={spiller.navn} planAktiv={planAktiv} {...skjema} />
      </div>
    </AgencyOSSkall>;
  }

  const kjor = (fn: () => Promise<unknown>, melding: string) => start(async () => {
    try { await fn(); setFeil(null); router.refresh(); }
    catch (e) {
      // dupliserTekniskPlan sender videre med redirect(), som kastes som en feil.
      if (e instanceof Error && e.message === "NEXT_REDIRECT") return;
      setFeil(e instanceof Error ? e.message : melding);
    }
  });

  return <AgencyOSSkall navn={coachNavn}>
    <div className="pa-side">
      <header className="pa-pagehead">
        <div className="pa-pagehead__row">
          <div className="pa-pagehead__text">
            <span className="kicker pa-pagehead__kicker">Teknisk plan · {spiller.navn}</span>
            <h1 className="pa-pagehead__title">{plan.navn}</h1>
            <p className="pa-pagehead__sub">Oppgaver per posisjon med ett teknisk fokus, repetisjoner per læringssteg og miljø, TrackMan-mål og treffprotokoll. Status vises. Ingenting låses.</p>
          </div>
          <div className="pa-pagehead__actions">
            <KnappLenke variant="secondary" icon={ArrowLeft} iconName="arrow-left" href={`/admin/spillere/${spiller.id}`}>Spiller 360</KnappLenke>
            {!planAktiv && <Knapp variant="secondary" icon={Send} iconName="send" disabled={pending} onClick={() => kjor(() => publiserTekniskPlan(plan.id), "Planen ble ikke publisert.")}>Publiser</Knapp>}
            <Knapp variant="ghost" icon={Copy} iconName="copy" disabled={pending} onClick={() => kjor(() => dupliserTekniskPlan(plan.id), "Planen ble ikke kopiert.")}>Dupliser</Knapp>
            <KnappLenke icon={Plus} iconName="plus" href={`${planHref}?oppgave=ny`}>Ny oppgave</KnappLenke>
          </div>
        </div>
      </header>
      {feil && <p role="alert" className="a4-feil">{feil}</p>}

      {plan.oppgaver.length === 0
        ? <TomTilstand icon={ListChecks} title="Ingen oppgaver i planen ennå"
          text="Start med posisjonen dere jobber mest med. Legg til én oppgave med ett teknisk fokus. Spilleren ser planen når du publiserer."
          actions={<KnappLenke icon={Plus} iconName="plus" href={`${planHref}?oppgave=ny`}>Ny oppgave</KnappLenke>} />
        : <div className="tp-flate">
          <Oppsummering plan={plan} />
          <div className="pa-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <span className="kicker">Posisjoner P1.0–P10.0</span>
              <Meta>{plan.oppgaver.length} OPPGAVER{plan.coach ? ` · ${plan.coach.toUpperCase()}` : ""}</Meta>
            </div>
            <Posisjonslinje oppgaver={plan.oppgaver} valgt={valgt} onVelg={setValgt} hovedfokus={plan.hovedfokus} />
          </div>
          <section style={{ display: "flex", flexDirection: "column", gap: 12 }} aria-label="Oppgaver">
            <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
              <span className="kicker" style={{ flex: "1 1 auto" }}>Oppgaver · {valgt ? `${valgt} ${posNavn}` : "alle posisjoner"}</span>
              <Meta>{vis.length} {vis.length === 1 ? "OPPGAVE" : "OPPGAVER"}</Meta>
            </div>
            {vis.length === 0
              ? <div className="pa-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen oppgaver på {valgt}.</p>
                <div><KnappLenke size="sm" variant="secondary" icon={Plus} iconName="plus" href={`${planHref}?oppgave=ny`}>Legg til oppgave</KnappLenke></div>
              </div>
              : vis.map((o) => <OppgaveKort key={o.id} o={o} aapen={!!aapne[o.id]} onVeksle={() => setAapne((a) => ({ ...a, [o.id]: !a[o.id] }))}
                handlinger={<>
                  <KnappLenke size="sm" variant="secondary" icon={CalendarPlus} iconName="calendar-plus" href={`/admin/workbench/${spiller.id}`}>Legg i økt</KnappLenke>
                  <KnappLenke size="sm" variant="ghost" icon={Pencil} iconName="pencil" href={`${planHref}?oppgave=${o.id}`}>Rediger</KnappLenke>
                </>} />)}
          </section>
          <div className="pa-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", paddingBottom: 10 }}>
              <span className="kicker">Siste registreringer</span><Meta>LIVE-ØKT · TRACKMAN · MANUELT</Meta>
            </div>
            {plan.logg.length === 0
              ? <p style={{ margin: 0, paddingTop: 12, borderTop: "1px solid var(--border-hairline)", font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen registreringer ennå.</p>
              : plan.logg.map((l) => <div key={l.id} style={{ display: "flex", flexDirection: "column", gap: 6, padding: "12px 0", borderTop: "1px solid var(--border-hairline)" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "baseline" }}>
                  <span style={{ font: "600 13px/1.3 var(--font-mono)" }}>{l.dato}</span>
                  <span style={{ font: "500 14px/1.3 var(--font-sans)", flex: "1 1 200px", minWidth: 0 }}>{l.pNummer} · {l.oppgave}</span>
                  <span style={{ font: "600 13px/1.3 var(--font-mono)" }}>{l.reps} rep.</span>
                </div>
                <Meta>{(l.steg ?? "Uten læringssteg").toUpperCase()} · {(l.miljo ?? "Miljø ikke registrert").toUpperCase()} · {l.kilde.toUpperCase()}</Meta>
                {l.kommentar
                  ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-body)", textWrap: "pretty" }}><b style={{ fontWeight: 600 }}>{spiller.navn}:</b> {l.kommentar}</p>
                  : <Meta>INGEN KOMMENTAR FRA SPILLEREN</Meta>}
              </div>)}
          </div>
        </div>}
    </div>
  </AgencyOSSkall>;
}
