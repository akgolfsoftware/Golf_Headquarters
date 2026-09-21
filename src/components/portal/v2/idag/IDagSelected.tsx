"use client";

/**
 * Valgt design: App design / playerhq-handover/ph-01-v1.0, 21.09.2026.
 * Rigg: PH-01 I dag
 * Kontroll: tests/visual/playerhq-ph01 — 20 kombinasjoner (390 og 1440), ingen konsollfeil.
 * Referanse: fersk v1.0 fra «App design» 21.09.2026, etag 1789994883152613.
 *
 * Bevisste avvik fra den valgte versjonen:
 *   - Låst gratiskonto viser ikke økttittel og klokkeslett dempet slik tegningen gjør.
 *     Anders 21.09.2026: låst plan skal ikke vise skjult øktinnhold. Koden saniterer
 *     derfor plandataene på serveren (skjulLaastPlanData) før de når klienten.
 *   - Øktstatus heter «Gjennomført». Tegningen sier «Fullført»; docs/ordbok.md eier
 *     begrepet og har «Gjennomført» som status.
 *   - Fordelingen bruker de fulle pyramidenavnene fra PYRAMID_LABEL, ikke tegningens
 *     korte koder med fargemarkør.
 *   - «Publisert av …» mangler: opphavet finnes ikke i NaaKort i dag.
 *   - «Foreslå annen tid» har ingen serverhandling; eksisterende Avvis beholdes.
 *   - SG-referanse er ikke oppgitt av kilden og omtales derfor som ukjent.
 *   - Caddie beholdes som en tilgjengelig utvidelse under dagens innhold.
 */
import { useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Home, CalendarDays, ChartNoAxesCombined, UserRound, X } from "lucide-react";
import { resolvePlayerApproval } from "@/lib/workbench/wb-actions";
import type { PlayerDaySession } from "@/lib/workbench/wb-actions";
import type { WeekPlanProgress } from "@/app/portal/actions";
import { formatMinutes, PYRAMID_LABEL } from "@/lib/domain/workbench/labels";
import { klokkeslett } from "@/lib/domain/kalender-lag";
import { IDAG_UI, IDAG_UKE_BOKSTAVER } from "@/lib/portal/idag-visning";
import { sgAkse, valgtGodkjenningsforslag } from "@/lib/portal/ph01-visning";
import type { IDagTrainLockProps, NaaKort } from "./IDagTrainLock";
import type { IDagAgendaHendelse } from "@/lib/portal/idag-agenda";
import styles from "./idag-selected.module.css";

const nav = [
  { label: "I dag", href: "/portal", icon: Home },
  { label: "Plan", href: "/portal/planlegge", icon: CalendarDays },
  { label: "Analyse", href: "/portal/analysere", icon: ChartNoAxesCombined },
  { label: "Meg", href: "/portal/meg", icon: UserRound },
];

export function PH01Shell({ children, navn, avatarUrl, planLaast = false }: {
  children: ReactNode; navn?: string; avatarUrl?: string | null; planLaast?: boolean;
}) {
  const initialer = (navn ?? "Spiller").split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]).join("");
  return <div className={styles.app} data-design-version="ph-01-v1.0">
    <a className={styles.skip} href="#ph01-innhold">Hopp til innhold</a>
    <header className={styles.top}>
      <Link href="/portal" aria-label="PlayerHQ hjem"><Image src="/logos/logo-ak-golf-hq.svg" alt="AK Golf HQ" width={136} height={30} /></Link>
      <nav aria-label="Hovedmeny">{nav.map((n) => <Link key={n.href} href={n.href} aria-current={n.href === "/portal" ? "page" : undefined}>{n.label}</Link>)}</nav>
      <Link href="/portal/meg" className={styles.who}><span>{navn ?? "Spiller"}<small>{planLaast ? "Gratis konto" : "Spiller"}</small></span><span className={styles.avatar}>{avatarUrl ? <Image src={avatarUrl} alt="" width={44} height={44} unoptimized /> : initialer}</span></Link>
    </header>
    {children}
    <nav className={styles.bottom} aria-label="Hovedmeny">{nav.map((n) => <Link key={n.href} href={n.href} aria-current={n.href === "/portal" ? "page" : undefined}><n.icon size={20} aria-hidden />{n.label}</Link>)}</nav>
  </div>;
}

function ButtonLink({ href, children, rust = false, quiet = false }: { href: string; children: ReactNode; rust?: boolean; quiet?: boolean }) {
  return <Link href={href} className={`${styles.button} ${rust ? styles.rust : quiet ? styles.quiet : ""}`}>{children}</Link>;
}
function Kicker({ children }: { children: ReactNode }) { return <div className={styles.kicker}>{children}</div>; }

function Approval({ okt, onDone }: { okt: PlayerDaySession; onDone: (id: string) => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  function answer(decision: "ACCEPTED" | "REJECTED") {
    if (pending) return;
    setError(null);
    start(async () => {
      try {
        const res = await resolvePlayerApproval({ sessionId: okt.id, decision });
        if (!res.ok) { setError(res.error); return; }
        onDone(okt.id);
        router.refresh();
      } catch { setError("Svaret ble ikke bekreftet. Prøv igjen."); }
    });
  }
  return <section className={styles.card} aria-label="Økt til godkjenning" aria-busy={pending}>
    <div className={styles.row}><Kicker>{okt.origin === "GROUP" ? "Fra gruppen" : "Fra coach"}</Kicker><span className={styles.badge}>Venter på deg</span></div>
    <h2>{okt.title}</h2>
    <p className={styles.mono}>{klokkeslett(okt.startMinute)} · {formatMinutes(okt.durationMinutes)} · {PYRAMID_LABEL[okt.pyramid as keyof typeof PYRAMID_LABEL] ?? okt.pyramid}</p>
    {okt.notes && <p>{okt.notes}</p>}
    {okt.drillsCount > 0 && <p>{okt.drillsCount} øvelser</p>}
    <p>Avvis skjuler forslaget fra planen din.</p>
    <div className={styles.actions}>
      <button className={`${styles.button} ${styles.rust}`} disabled={pending} onClick={() => answer("ACCEPTED")}>{pending ? "Sender svar …" : "Godkjenn"}</button>
      <button className={`${styles.button} ${styles.quiet}`} disabled={pending} onClick={() => answer("REJECTED")}>Avvis</button>
    </div>
    {error && <p role="alert">{error}</p>}
  </section>;
}

function Now({ naa, approval }: { naa: NaaKort | null; approval: PlayerDaySession | null }) {
  const title = approval?.title ?? naa?.tittel;
  if (!title) return null;
  // Varigheten hører til klokkeslettet, ikke til stedslinjen. Pågående og gjennomførte
  // økter har den allerede i sin egen tidstekst, så den legges bare til for planlagte.
  const visVarighet = !approval && naa != null && !naa.live && !naa.fullfort && Boolean(naa.varighetTekst);
  const tidLinje = approval
    ? `${klokkeslett(approval.startMinute)} · ${formatMinutes(approval.durationMinutes)}`
    : visVarighet ? `${naa!.tid} · ${naa!.varighetTekst}` : naa?.tid;
  const stedLinje = approval ? approval.location : naa?.fullfort ? naa.meta : naa?.stedTekst ?? naa?.meta;
  const pyramide = naa?.pyramide ? PYRAMID_LABEL[naa.pyramide as keyof typeof PYRAMID_LABEL] ?? naa.pyramide : null;
  return <section className={`${styles.card} ${styles.now} ${approval ? styles.dimmed : ""}`} aria-label="Nå">
    <div className={styles.row}><Kicker>Nå</Kicker><span className={styles.badge}>{approval ? "Avventer svar" : naa?.live ? "Pågår" : naa?.fullfort ? "Gjennomført" : "Planlagt"}</span></div>
    <h2>{title}</h2>
    <p className={styles.mono}>{tidLinje}</p>
    <div className={styles.metaRad}>{naa?.pyramide && <i className={styles.stav} data-lag={naa.pyramide} aria-hidden />}<p>{[pyramide, stedLinje].filter(Boolean).join(" · ")}</p></div>
    {!approval && naa?.fremdriftPst != null && <><progress max={100} value={naa.fremdriftPst} aria-label="Fremdrift i økten" />{naa.fremdriftTekst && <p className={styles.mono}>{naa.fremdriftTekst}</p>}</>}
    {approval ? <><button className={styles.button} disabled>START ØKT</button><p>Blir tilgjengelig når du har svart.</p></> : naa && <>
      <div className={styles.heroActions}>
        <ButtonLink href={naa.ctaHref} rust={!naa.live && !naa.fullfort}>{naa.fullfort ? "Se oppsummering" : naa.live ? "Fortsett økt" : "START ØKT"}</ButtonLink>
        {naa.sekundarHref && <ButtonLink href={naa.sekundarHref} quiet>Avslutt økt</ButtonLink>}
        {!naa.live && !naa.fullfort && <Link className={styles.detailAction} href={naa.ctaHref}>Se øktdetalj</Link>}
      </div>
    </>}
  </section>;
}

function Agenda({ events }: { events: readonly IDagAgendaHendelse[] }) {
  return events.length ? <ul className={styles.agenda}>{events.map((h) => {
    const content = <><span className={styles.mono}>{h.startMin == null ? h.lag === "TESTER" ? "Frist" : "Hele dagen" : klokkeslett(h.startMin)}</span><span className={styles.eventText}><strong>{h.tittel}</strong>{h.undertekst && <small>{h.undertekst}</small>}</span>{h.fullfort ? <span className={styles.badge}>Gjennomført</span> : h.lesevisning ? <span className={styles.badge}>Låst</span> : null}</>;
    return <li key={h.id}>{h.href ? <Link href={h.href}>{content}</Link> : <div>{content}</div>}</li>;
  })}</ul> : <p>Ingen andre avtaler i dag.</p>;
}

function SG({ value, label, unavailable = false }: { value: number | null; label: string; unavailable?: boolean }) {
  const axis = sgAkse(value);
  return <section className={styles.stat} aria-label="SG innspill">
    <Kicker>SG innspill</Kicker><div className={styles.number}>{axis ? label : "—"}</div>
    {axis && <><div className={styles.sgAxis} role="img" aria-label={`SG innspill ${label}. Skala minus ${axis.grense} til pluss ${axis.grense}.`}><span style={{ left: `${axis.start}%`, width: `${axis.bredde}%` }} /></div><div className={styles.axisLabels}><span>−{axis.grense.toFixed(1).replace(".", ",")}</span><span>0</span><span>+{axis.grense.toFixed(1).replace(".", ",")}</span></div></>}
    <p className={styles.caption}>{unavailable ? "Ikke tilgjengelig uten nett." : axis ? "Slag per runde. Inntil de 10 siste rundene. Kilden oppgir ikke hva tallet måles mot." : "Ingen registrerte SG-verdier for innspill."}</p>
  </section>;
}

export type IDagSelectedProps = IDagTrainLockProps & {
  planLaast: boolean; sgVerdi: number | null; weekProgress: WeekPlanProgress; children?: ReactNode; caddie?: ReactNode;
};
export function IDagSelected(p: IDagSelectedProps) {
  const [answered, setAnswered] = useState<string[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const approvals = p.planLaast ? [] : p.godkjenninger.filter((g) => !answered.includes(g.id));
  const blocked = valgtGodkjenningsforslag(approvals, p.valgtOktId, p.naa !== null);
  const failed = p.tilstand === "feil";
  const events = p.hendelser.filter((h) => h.id !== `okt-${p.valgtOktId}` && (!p.valgtOktId || h.planSessionId !== p.valgtOktId));
  const days = p.prikker.filter((d) => !d.tom);
  const initials = (p.navn ?? "Spiller").split(/\s+/).slice(0, 2).map((s) => s[0]).join("");
  // Stablingsrekkefølge på liten skjerm. På bred skjerm ligger elementene i hver sin
  // kolonne, der verdiene allerede stiger, så samme tall styrer begge formatene.
  const ORD = { godkjenning: 1, hero: 2, tall: 3, dag: 4, test: 5, trackman: 6, neste: 7, apent: 8, maaned: 9, caddie: 10 } as const;
  let hero: ReactNode;
  if (p.planLaast) hero = <section className={styles.card} style={{ order: ORD.hero }}><Kicker>Gratis konto</Kicker><h2>Treningsplanen krever full tilgang</h2><p>Du kan fortsatt åpne tester, runder, analyse og booking. Planlagte økter åpnes med full tilgang.</p><ButtonLink href="/portal/oppgrader">Se hva full tilgang gir</ButtonLink><Link className={styles.textLink} href="#ph01-apent">Fortsett med gratis konto</Link></section>;
  else if (failed) hero = <section className={styles.card} style={{ order: ORD.hero }} role="alert"><Kicker>{IDAG_UI.feilCaps}</Kicker><h2>{IDAG_UI.feilTittel}</h2><p>{IDAG_UI.feilBrød}</p><button className={styles.button} onClick={() => router.refresh()}>Prøv igjen</button></section>;
  else if (p.naa || blocked) hero = <div style={{ order: ORD.hero, minWidth: 0 }}><Now naa={p.naa} approval={blocked} /></div>;
  else if (p.tilstand === "hvile") hero = <section className={styles.card} style={{ order: ORD.hero }}><Kicker>Nå · Hviledag</Kicker><h2>Hvile</h2><p>Hvilen er en del av planen.</p><ButtonLink href="/portal/planlegge" quiet>Åpne uken i Plan</ButtonLink></section>;
  else hero = <section className={styles.card} style={{ order: ORD.hero }}><Kicker>{p.tilstand === "tom-uke" ? "Ingen plan" : "Ingen økt"}</Kicker><h2>{p.tilstand === "tom-uke" ? `Uke ${p.ukeNummer} er tom` : "Ingen økt i dag"}</h2><p>{p.tilstand === "tom-uke" ? "Du har ingen planlagte økter denne uken." : "Dagen har ingen planlagt økt."}</p><ButtonLink href="/portal/tren/wb">Start egen økt</ButtonLink><Link className={styles.textLink} href="/portal/planlegge">Åpne plan</Link></section>;
  return <PH01Shell navn={p.navn} avatarUrl={p.avatarUrl} planLaast={p.planLaast}>
    <main id="ph01-innhold" className={styles.main}>
      {p.children}
      <header className={styles.heading}><div><Kicker>{p.datoLinje} · Uke {p.ukeNummer}</Kicker><h1><span className={styles.mobileOnly}>I dag</span><span className={styles.desktopOnly}>{p.hilsen ?? "I dag"}</span></h1></div><Link className={`${styles.avatar} ${styles.mobileOnly}`} href="/portal/meg" aria-label="Åpne profilen min">{p.avatarUrl ? <Image src={p.avatarUrl} alt="" width={44} height={44} unoptimized /> : initials}</Link></header>
      <div className={styles.grid}><div className={styles.primary}>
        {approvals.map((g) => <div key={g.id} style={{ order: ORD.godkjenning, minWidth: 0 }}><Approval okt={g} onDone={(id) => setAnswered((prev) => [...prev, id])} /></div>)}
        {hero}
        <section style={{ order: ORD.dag }}><div className={styles.row}><Kicker>Resten av dagen</Kicker>{!failed && <button className={styles.textLink} onClick={() => dialog.current?.showModal()}>Hele dagen</button>}</div>{failed ? <ul className={styles.agenda}><li><div><span className={styles.mono}>—</span><span className={styles.eventText}><strong>Ikke tilgjengelig nå</strong><small>Dagen hentes når du er på nett.</small></span></div></li></ul> : <Agenda events={events} />}</section>
        {p.trackman && <Link className={styles.card} style={{ order: ORD.trackman }} href={`/portal/analysere/trackman/${p.trackman.sessionId}`}><Kicker>Siste TrackMan · {p.trackman.club} · {p.trackman.dateText}</Kicker><p>{p.trackman.sentence}</p><span className={styles.textLink}>Se spredning ›</span></Link>}
        {p.planLaast && <section id="ph01-apent" className={styles.card} style={{ order: ORD.apent }}><Kicker>Dette er åpent for deg</Kicker><ButtonLink href="/portal/tren/tester" quiet>Tester</ButtonLink><ButtonLink href="/portal/analysere" quiet>Analyse og runder</ButtonLink><ButtonLink href="/booking" quiet>Book enkelttime</ButtonLink></section>}
        {!p.planLaast && <section className={`${styles.card} ${styles.mobileOnly}`} style={{ order: ORD.maaned }}><Kicker>{p.maanedNavn}</Kicker><p>{days.filter((d) => d.fylt).length} dager med gjennomført økt, utenom i dag.</p><Link className={styles.textLink} href="/portal/planlegge">Åpne måneden i Plan</Link></section>}
        {p.caddie && <details className={styles.caddie} style={{ order: ORD.caddie }}><summary>Spør Caddie</summary>{p.caddie}</details>}
      </div><div className={styles.cards}>
        <div className={styles.stats} style={{ order: ORD.tall }}><section className={styles.stat}><Kicker>Økter denne uken</Kicker><div className={styles.number}>{p.planLaast || failed || p.okterUke === 0 ? "—" : <>{p.fullfortUke ?? 0}<small> av {p.okterUke}</small></>}</div>{!p.planLaast && !failed && p.weekProgress.plannedMin > 0 && <progress aria-label="Ukefremdrift" max={p.weekProgress.plannedMin} value={p.weekProgress.completedMin} />}<p className={styles.caption}>{p.planLaast ? "Krever full tilgang." : failed ? "Ikke tilgjengelig uten nett." : p.weekProgress.plannedMin > 0 ? `${p.weekProgress.completedMin} av ${p.weekProgress.plannedMin} planlagte minutter` : "Ingen planlagte minutter."}</p></section><SG value={failed ? null : p.sgVerdi} label={p.sgInnspill} unavailable={failed} /></div>
        {p.testerLive && <section className={styles.card} style={{ order: ORD.test }}><Kicker>Test pågår · {p.testerLive.testNavn}</Kicker><p className={styles.mono}>{p.testerLive.fremdrift}</p><ButtonLink href={`/portal/tren/tester/${p.testerLive.testId}/gjennomfor`}>Fortsett testen</ButtonLink></section>}
        {p.neste && <section className={styles.card} style={{ order: ORD.neste }}><Kicker>Neste</Kicker>{p.neste.href ? <Link href={p.neste.href}><h3>{p.neste.tittel}</h3><p className={styles.mono}>{p.neste.meta}</p></Link> : <><h3>{p.neste.tittel}</h3><p>{p.neste.meta}</p></>}</section>}
      </div><aside className={styles.side} aria-label="Månedsoversikt">
        <section className={styles.card}><h2>{p.maanedNavn}</h2>{failed ? <p className={styles.caption}>Månedsstatus hentes når du er på nett.</p> : <><div className={styles.calendar}>{IDAG_UKE_BOKSTAVER.map((d,i) => <span key={`${d}-${i}`} aria-hidden>{d}</span>)}{p.prikker.map((d,i) => <span key={i} className={`${d.fylt ? styles.filled : ""} ${d.idag ? styles.today : ""}`} aria-label={d.tom ? undefined : `${i - (p.prikker.length - days.length) + 1}. ${p.maanedNavn}${d.idag ? ", i dag" : ""}${d.fylt ? ", gjennomført økt" : ""}`}>{d.tom ? "" : i - (p.prikker.length - days.length) + 1}</span>)}</div><p className={styles.caption}>Fylt dato = gjennomført økt. Ring = i dag.</p></>}</section>
        {p.planLaast && <section className={styles.card}><h2>Full tilgang</h2><p className={styles.caption}>Planlagte økter, Workbench og Live åpnes med full tilgang. Gratis konto utløper aldri.</p><ButtonLink href="/portal/oppgrader" quiet>Se hva full tilgang gir</ButtonLink></section>}
        {!p.planLaast && failed && <section className={styles.card}><h2>Ukens tall</h2><div className={styles.number}>—</div><p className={styles.caption}>Ikke tilgjengelig uten nett.</p></section>}
        {!p.planLaast && !failed && <section className={styles.card}><h2>Ukens tall</h2><div className={styles.number}>{p.okterUke > 0 ? p.weekProgress.completedMin : "—"}</div><p className={styles.caption}>Planlagte minutter i gjennomførte økter · Uke {p.ukeNummer}</p><Kicker>Fordeling</Kicker><dl className={styles.distribution}>{Object.entries(p.weekProgress.completedByAxis).map(([axis, minutes]) => <div key={axis}><dt>{PYRAMID_LABEL[axis as keyof typeof PYRAMID_LABEL] ?? axis}</dt><dd className={styles.mono}>{p.weekProgress.plannedByAxis[axis as keyof typeof p.weekProgress.plannedByAxis] > 0 ? `${minutes} min` : "—"}</dd></div>)}</dl></section>}
      </aside></div>
      <dialog ref={dialog} className={styles.dialog} aria-labelledby="ph01-dag-title"><div className={styles.row}><h2 id="ph01-dag-title">{p.dagLabel}</h2><button className={styles.iconButton} onClick={() => dialog.current?.close()} aria-label="Lukk hele dagen"><X size={20} /></button></div><Agenda events={p.hendelser} /><p>Skole og avtaler er lesevisning. Økter redigeres i Plan.</p></dialog>
    </main>
  </PH01Shell>;
}

export function PH01Loading() {
  return <PH01Shell><main id="ph01-innhold" className={styles.main} aria-busy="true"><header className={styles.heading}><div><div className={`${styles.skeletonLine} ${styles.skeletonMeta}`} /><h1>I dag</h1></div></header><div className={styles.grid}><div className={styles.primary}><div className={`${styles.card} ${styles.skeletonCard}`} style={{ order: 2 }}><div className={`${styles.skeletonLine} ${styles.skeletonMeta}`} /><div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} /><div className={`${styles.skeletonLine} ${styles.skeletonText}`} /><div className={`${styles.skeletonLine} ${styles.skeletonButton}`} /></div><div className={`${styles.skeletonLine} ${styles.skeletonAgenda}`} style={{ order: 4 }} /><div className={`${styles.skeletonLine} ${styles.skeletonAgenda}`} style={{ order: 6 }} /></div><div className={styles.cards}><div className={styles.stats} style={{ order: 3 }}><div className={`${styles.stat} ${styles.skeletonStat}`} /><div className={`${styles.stat} ${styles.skeletonStat}`} /></div></div><aside className={styles.side}><div className={`${styles.card} ${styles.skeletonSide}`} /><div className={`${styles.card} ${styles.skeletonStat}`} /></aside></div><p className={styles.loadingStatus} role="status">Henter dagen din …</p></main></PH01Shell>;
}
export function PH01Error({ reset }: { reset: () => void }) {
  return <PH01Shell><main id="ph01-innhold" className={styles.main}><section className={styles.card}><Kicker>Ingen forbindelse</Kicker><h1>Vi fikk ikke hentet dagen din</h1><p>{IDAG_UI.feilBrød}</p><button className={styles.button} onClick={reset}>Prøv igjen</button><Link className={styles.textLink} href="/portal">Til I dag</Link></section></main></PH01Shell>;
}
