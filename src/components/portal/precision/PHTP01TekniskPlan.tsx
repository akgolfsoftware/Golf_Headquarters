"use client";

/**
 * PH-TP-01 Teknisk plan (spiller), Precision Athletics. Tegning: Claude Design
 * 7d7c2994, ui_kits/playerhq/screens/PH-TP.jsx (etag 1790543557501444).
 *
 * Spilleren leser planen her. Endringer gjøres sammen med coachen (AG-TP-01).
 * «Registrer repetisjoner» skriver til PositionTaskLog via logReps, med
 * læringssteg (bare fullsving), miljø og kommentar til coachen.
 *
 * Avvik fra tegningen: kvalitetssjekk og før og nå er tomme til tillegg D1/D2
 * er inne. Kvitteringen bruker dagens dato fra klokka, ikke en fast dato.
 */
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ListChecks, MessageSquare, Play, Plus } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { Knapp, KnappLenke, TomTilstand } from "@/components/precision/pa";
import { Ark, Skjemafelt, Nedtrekk, Tekstfelt } from "@/components/precision/pa-a4";
import {
  ForOgNaaTom, Meta, OppgaveKort, Oppsummering, Posisjonslinje, Teller, Valg,
} from "@/components/precision/teknisk-plan/tp-deler";
import { logReps } from "@/app/portal/tren/teknisk-plan/actions";
import { dato, type TpPlan } from "@/lib/teknisk-plan/tp-visning";
import {
  BELASTNING_KODER, BELASTNING_LABEL, MOTORIKK_KODER, MOTORIKK_LABEL,
  type BelastningKode, type MotorikkKode,
} from "@/lib/domain/ak-formel-v2";
import "@/styles/precision-a4.css";

export type PHTP01Props = {
  /** null = spilleren har ingen teknisk plan. */
  plan: TpPlan | null;
  uleste: number;
  /** Neste planlagte økt, eller Workbench når ingen finnes. */
  okt: { href: string; label: string };
  /** Åpner registreringsarket ved første visning (skjermprøven). */
  startMedArk?: boolean;
};

const REP_FELT: Record<MotorikkKode, "dry" | "lav" | "full"> = { UTEN_BALL: "dry", LAV_HAST: "lav", AUTO: "full" };

export function PHTP01TekniskPlan({ plan, uleste, okt, startMedArk }: PHTP01Props) {
  const router = useRouter();
  const [valgt, setValgt] = useState<string | null>(null);
  const [aapne, setAapne] = useState<Record<string, boolean>>(() => (plan?.oppgaver[0] ? { [plan.oppgaver[0].id]: true } : {}));
  const [ark, setArk] = useState(!!startMedArk);
  const [kvittering, setKvittering] = useState<{ tekst: string; oppgave: string; miljo: string | null; kommentar: boolean } | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const forste = plan?.oppgaver[0] ?? null;
  const [reg, setReg] = useState<{ oppgaveId: string; steg: MotorikkKode; miljo: BelastningKode | null; antall: number; kommentar: string }>({
    oppgaveId: forste?.id ?? "", steg: "LAV_HAST", miljo: null, antall: 20, kommentar: "",
  });
  const regOppgave = plan?.oppgaver.find((o) => o.id === reg.oppgaveId) ?? null;
  const vis = useMemo(() => (plan ? (valgt ? plan.oppgaver.filter((o) => o.hovedP === valgt) : plan.oppgaver) : []), [plan, valgt]);

  const registrer = () => {
    if (!regOppgave || reg.antall <= 0) return;
    const fullsving = regOppgave.familie === "FULLSVING";
    const felt = fullsving ? REP_FELT[reg.steg] : "full";
    start(async () => {
      try {
        await logReps(regOppgave.id, { [felt]: reg.antall }, { belastning: reg.miljo, kommentar: reg.kommentar });
        const tekst = `Registrert ${dato(new Date()).slice(0, 5)} · ${reg.antall} repetisjoner${fullsving ? ` · ${MOTORIKK_LABEL[reg.steg]}` : ""}`;
        setKvittering({ tekst, oppgave: regOppgave.tittel, miljo: reg.miljo ? BELASTNING_LABEL[reg.miljo] : null, kommentar: !!reg.kommentar.trim() });
        setFeil(null);
        setArk(false);
        setReg((r) => ({ ...r, kommentar: "" }));
        router.refresh();
      } catch {
        setFeil("Repetisjonene ble ikke registrert. Prøv igjen.");
      }
    });
  };

  const handlinger = <>
    <Knapp variant="secondary" icon={Plus} iconName="plus" disabled={!plan || plan.oppgaver.length === 0} onClick={() => setArk(true)}>Registrer repetisjoner</Knapp>
    <KnappLenke icon={Play} iconName="play" href={okt.href}>{okt.label}</KnappLenke>
  </>;

  return <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
    <div className="pa-side" style={{ maxWidth: 1200 }}>
      <header className="pa-pagehead">
        <div className="pa-pagehead__row">
          <div className="pa-pagehead__text">
            <span className="kicker pa-pagehead__kicker">Plan · Teknisk plan</span>
            <h1 className="pa-pagehead__title">{plan ? plan.navn : "Teknisk plan"}</h1>
            <p className="pa-pagehead__sub">
              {plan
                ? `Fra ${plan.coach ?? "coachen"}. Du leser planen her. Endringer gjør du sammen med coachen.`
                : "Coachen lager planen sammen med deg."}
            </p>
          </div>
          {plan && <div className="pa-pagehead__actions">{handlinger}</div>}
        </div>
      </header>

      {!plan
        ? <TomTilstand icon={ListChecks} title="Ingen teknisk plan ennå" text="Coachen lager planen sammen med deg. Du ser den her når den er klar."
          actions={<KnappLenke icon={MessageSquare} iconName="message-square" href="/portal/coach/melding/ny">Send melding til coachen</KnappLenke>} />
        : <div className="tp-flate">
          {kvittering && <div className="pa-alert pa-alert--ok" role="status">
            <span className="pa-alert__title">{kvittering.tekst}</span>
            <span>{kvittering.oppgave}{kvittering.miljo ? ` · ${kvittering.miljo}` : ""}.{kvittering.kommentar ? " Kommentaren er sendt til coachen." : ""}</span>
          </div>}
          <Oppsummering plan={plan} />
          <div className="pa-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <span className="kicker">Posisjoner P1.0–P10.0</span>
              <Meta>HOVEDFOKUS {plan.hovedfokus.length ? plan.hovedfokus.join(" · ") : "—"}</Meta>
            </div>
            <Posisjonslinje oppgaver={plan.oppgaver} valgt={valgt} onVelg={setValgt} hovedfokus={plan.hovedfokus} />
          </div>
          <section style={{ display: "flex", flexDirection: "column", gap: 12 }} aria-label="Oppgaver">
            <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
              <span className="kicker" style={{ flex: "1 1 auto" }}>Oppgaver · {valgt ?? "alle posisjoner"}</span>
              <Meta>{vis.length} {vis.length === 1 ? "OPPGAVE" : "OPPGAVER"}</Meta>
            </div>
            {vis.length === 0
              ? <div className="pa-card" style={{ padding: 16 }}><p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
                {valgt ? `Ingen oppgaver på ${valgt}.` : "Planen har ingen oppgaver ennå."}</p></div>
              : vis.map((o) => <OppgaveKort key={o.id} o={o} aapen={!!aapne[o.id]} onVeksle={() => setAapne((a) => ({ ...a, [o.id]: !a[o.id] }))} />)}
          </section>
          <ForOgNaaTom />
        </div>}
    </div>

    <Ark open={ark} onClose={() => setArk(false)} kicker="Teknisk plan" title="Registrer repetisjoner"
      footer={<>
        {feil && <p role="alert" className="a4-feil" style={{ margin: 0 }}>{feil}</p>}
        <Knapp fullWidth size="lg" icon={Check} iconName="check" disabled={!regOppgave || reg.antall <= 0} loading={pending} loadingText="Registrerer …" onClick={registrer}>Registrer {reg.antall} repetisjoner</Knapp>
        <Knapp variant="ghost" fullWidth onClick={() => setArk(false)}>Avbryt</Knapp>
      </>}>
      {plan && <>
        <Skjemafelt label="Oppgave">
          <Nedtrekk value={reg.oppgaveId} onChange={(v) => setReg((r) => ({ ...r, oppgaveId: v }))}
            options={plan.oppgaver.map((o) => ({ value: o.id, label: `${o.pNummer} · ${o.tittel}` }))} />
        </Skjemafelt>
        {regOppgave?.familie === "FULLSVING" && <fieldset className="tp-gruppe" style={{ borderTop: 0, paddingTop: 0 }}>
          <legend className="tp-gruppe__navn">Læringssteg</legend>
          <div className="tp-rad">{MOTORIKK_KODER.map((m) => <Valg key={m} stor valgt={reg.steg === m} onClick={() => setReg((r) => ({ ...r, steg: m }))}>{MOTORIKK_LABEL[m]}</Valg>)}</div>
        </fieldset>}
        <fieldset className="tp-gruppe" style={{ borderTop: 0, paddingTop: 0 }}>
          <legend className="tp-gruppe__navn">Miljø</legend>
          <div className="tp-rad">{BELASTNING_KODER.map((b) => <Valg key={b} stor valgt={reg.miljo === b} onClick={() => setReg((r) => ({ ...r, miljo: r.miljo === b ? null : b }))}>{BELASTNING_LABEL[b]}</Valg>)}</div>
        </fieldset>
        <Teller storrelse="xl" label="Antall repetisjoner" verdi={reg.antall} maks={500} onEndre={(v) => setReg((r) => ({ ...r, antall: v }))} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
          <Knapp variant="secondary" size="lg" onClick={() => setReg((r) => ({ ...r, antall: Math.min(500, r.antall + 10) }))}>+10</Knapp>
          <Knapp variant="secondary" size="lg" onClick={() => setReg((r) => ({ ...r, antall: Math.min(500, r.antall + 25) }))}>+25</Knapp>
        </div>
        <Skjemafelt label="Kommentar til coachen" hint="Valgfritt">
          <Tekstfelt value={reg.kommentar} onChange={(v) => setReg((r) => ({ ...r, kommentar: v }))} placeholder="Hva kjente du?" />
        </Skjemafelt>
        <Meta>KILDE MANUELT · {dato(new Date())}</Meta>
      </>}
    </Ark>
  </PlayerHQSkall>;
}
