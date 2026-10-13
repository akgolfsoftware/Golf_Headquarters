"use client";

import Link from "next/link";
import { ArrowLeft, Check, CreditCard, FileText, Settings, ShieldCheck } from "lucide-react";
import { FeilTilstand, Ikon, KnappLenke, LasterTilstand, Sidehode, StatusPille, TomTilstand } from "@/components/precision/pa";
import { type Tilstand } from "@/components/precision/pa-a4";
import { formaterKroner, type PH25AbonnementData } from "@/lib/portal-abonnement/ph25-abonnement-data";

export interface PH25AbonnementProps {
  initialData?: PH25AbonnementData;
  tilstand?: Tilstand;
  visGameplanAlert?: boolean;
  onTilbakeHref?: string;
  onOppgraderHref?: string;
  onKortHref?: string;
  paymentFailed?: boolean;
  onSlettKontoAction?: () => Promise<void> | void;
}

/** Status kommer fra abonnementskilden. Endringer bekreftes i de eksisterende betalings- og personvernflytene. */
export function PH25Abonnement({ initialData: data, tilstand = "data", visGameplanAlert = false, onTilbakeHref = "/portal/meg", onOppgraderHref = "/portal/meg/abonnement/oppgrader/flyt", onKortHref = "/portal/meg/abonnement/kort/ny", paymentFailed = false }: PH25AbonnementProps) {
  const head = <><KnappLenke href={onTilbakeHref} variant="ghost" icon={ArrowLeft}>Tilbake til Meg</KnappLenke><Sidehode kicker="Meg" title="Abonnement" sub="Din tilgang, betalinger og neste fornyelse." /></>;
  if (tilstand === "laster") return <div className="pa-side">{head}<LasterTilstand text="Henter abonnement og betalinger …" /></div>;
  if (tilstand === "feil") return <div className="pa-side">{head}<FeilTilstand icon={CreditCard} title="Abonnementet kunne ikke hentes" text="Åpne siden på nytt for oppdatert status." code="ABONNEMENT" /></div>;
  if (!data) return <div className="pa-side">{head}<TomTilstand icon={CreditCard} title="Abonnementet er ikke hentet" text="Åpne abonnementet på nytt for å se din faktiske tilgang og betalinger." /></div>;
  const full = data.current.plan === "FULL";
  const cancelled = Boolean(data.current.cancelled);
  const dateKnown = data.current.renews !== "—" && Boolean(data.current.renews);
  return <div className="pa-side ph25-abonnement">
    {head}
    {visGameplanAlert && !full && <p className="ph25-tilgangsvarsel">Plan, Workbench, Live-økt og Gameplan følger Full. Se innhold og pris før du bekrefter abonnementet.</p>}
    {paymentFailed && <p className="ph25-tilgangsvarsel" role="status">Betalingen har feilet. Oppdater betalingskortet for å følge opp abonnementet.</p>}
    <section className="ph25-status" aria-label="Ditt abonnement">
      <div><span className="ph25-status__label">Din tilgang</span><h2>{full ? "Full" : "Gratis"}</h2><StatusPille tone={cancelled ? "warn" : "neutral"}>{cancelled ? "Avslutning registrert" : full ? "Full tilgang" : "Gratis tilgang"}</StatusPille></div>
      <div><h3>{full ? cancelled ? "Gjelder til" : "Neste fornyelse" : "Ingen fast betaling"}</h3><p className="ph25-status__dato">{full ? cancelled ? data.current.ends || "Dato ikke registrert" : dateKnown ? data.current.renews : "Dato ikke registrert" : "0 kr"}</p>{full && <p>{data.current.period === "ar" ? "Årlig betaling" : "Månedlig betaling"}</p>}</div>
      <div className="ph25-status__handling">{paymentFailed ? <KnappLenke href={onKortHref}>Oppdater betalingskort</KnappLenke> : !full ? <KnappLenke href={onOppgraderHref}>Se Full og bekreft</KnappLenke> : cancelled ? <KnappLenke href="/portal/meg/abonnement/fortsett">Fortsett Full</KnappLenke> : <KnappLenke variant="secondary" href="/portal/meg/abonnement/avbestill">Avslutt abonnement</KnappLenke>}</div>
    </section>
    <section aria-label="Abonnementenes innhold" className="ph25-planer">
      {data.plans.map(plan => <article key={plan.id} className="ph25-plan"><div className="ph25-plan__head"><h3>{plan.navn}</h3>{plan.id === data.current.plan && <StatusPille tone="neutral">Din plan</StatusPille>}</div><p className="ph25-pris">{formaterKroner(plan.prisMnd)}{plan.prisMnd > 0 && <span> per måned</span>}</p><ul>{plan.features.filter(feature => !/DataGolf|Caddie/i.test(feature)).map(feature => <li key={feature}><Ikon icon={Check} size={16} name="check" /><span>{feature}</span></li>)}</ul>{plan.id === "FULL" && !full && <KnappLenke fullWidth href={onOppgraderHref}>Se oppgraderingen</KnappLenke>}</article>)}
    </section>
    <div className="ph25-detaljer">
      <section className="ph25-seksjon" aria-label="Betalingskort"><h2><CreditCard size={20} aria-hidden />Betalingskort</h2><p>Kortopplysningene håndteres av Stripe.</p>{data.card && <dl className="ph25-kv"><div><dt>Kort</dt><dd>{data.card.brand} •••• {data.card.last4}</dd></div><div><dt>Utløper</dt><dd>{data.card.exp}</dd></div></dl>}{full && <KnappLenke variant="secondary" href={onKortHref}>Administrer betalingskort</KnappLenke>}</section>
      <section className="ph25-seksjon" aria-label="Betalingshistorikk"><h2><FileText size={20} aria-hidden />Betalingshistorikk</h2>{data.invoices.length === 0 ? <p className="ph25-dempet">Ingen bekreftede betalinger er registrert.</p> : <ul className="ph25-fakturaer">{data.invoices.map(invoice => <li key={invoice.id}><Link href={`/portal/meg/abonnement/faktura/${invoice.id}`}><span><strong>{invoice.gjelder}</strong><small>{invoice.dato} · {invoice.status}</small></span><span>{formaterKroner(invoice.belop)}</span></Link></li>)}</ul>}</section>
    </div>
    <section className="ph25-seksjon" aria-label="Konto og innstillinger"><h2><Settings size={20} aria-hidden />Konto og innstillinger</h2><div className="ph25-kontolenker"><KnappLenke variant="secondary" icon={ShieldCheck} href="/portal/meg/innstillinger/personvern">Deling og samtykker</KnappLenke><KnappLenke variant="secondary" href="/portal/meg/innstillinger/varsler">Varsler</KnappLenke><KnappLenke variant="secondary" href="/portal/meg/innstillinger/sikkerhet">Innlogging og sikkerhet</KnappLenke><KnappLenke variant="ghost" href="/portal/meg/innstillinger/eksport">Eksporter opplysninger</KnappLenke></div><p className="ph25-dempet">Endre samtykker, varsler og sikkerhet på hver sin side. Eksport og kontosletting finnes under personvern.</p></section>
  </div>;
}
