"use client";

/* Fase F · design-lab — core-parity (Button/Card/Tag/Input/EmptyState) + tema.
   AgencyOS / PlayerHQ · aldri «CoachHQ». */

import Image from "next/image";
import { useSyncExternalStore, type ReactNode } from "react";
import { T, fmtTall, TOM_TALL } from "@/lib/v2/tokens";
import {
  Caps,
  CTAPill,
  Knapp,
  Kort,
  Tag,
  TallHero,
  TomTilstand,
  DeltaChip,
  KpiFlis,
  Rad,
  AvatarInit,
} from "@/components/v2/core";
import {
  SpillerKort,
  AnbefalingsKort,
  OektKort,
  LiveBar,
} from "@/components/v2/domene";
import { OppgaveKort } from "@/components/v2/domene2";
import {
  Inndata,
  TekstOmraade,
  Velger,
  Bryter,
  Avkryssing,
  RadioGruppe,
  SegmentertFaner,
  SkjemaFelt,
} from "@/components/v2/skjema";
import { Icon } from "@/components/v2/icon";
import {
  StatStrip,
  DispersionPlot,
  TrajectoryPlot,
  TrackmanSammendrag,
  KolleStatKort,
} from "@/components/v2/spesialviz";
import {
  SgTotal,
  SgKategorier,
  Diagnose,
  NesteFokus,
  ProgresjonsBar,
  MiniSpark,
  LaunchWindow,
} from "@/components/v2/datavis";
import {
  UkeGrid,
  MndKalender,
  DagStripe,
  AgendaRad,
  VisningsVelger,
} from "@/components/v2/kalender";
import { Modal, Ark, Skuff, Toast, Banner } from "@/components/v2/overlays";
import { FAB } from "@/components/v2/struktur";

type V2Tema = "dark" | "light";

function lesTema(): V2Tema {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-v2-tema") === "dark" ? "dark" : "light";
}

function abonner(cb: () => void) {
  window.addEventListener("ak-v2-tema", cb);
  return () => window.removeEventListener("ak-v2-tema", cb);
}

function byttTema() {
  const neste: V2Tema = lesTema() === "light" ? "dark" : "light";
  if (neste === "dark") document.documentElement.setAttribute("data-v2-tema", "dark");
  else document.documentElement.removeAttribute("data-v2-tema");
  document.cookie = `ak-v2-tema=${neste};path=/;max-age=31536000;samesite=lax`;
  window.dispatchEvent(new Event("ak-v2-tema"));
}

function Seksjon({ tittel, barn }: { tittel: string; barn: ReactNode }) {
  return (
    <section style={{ marginTop: 36 }}>
      <Caps size={10} style={{ marginBottom: 14 }}>
        {tittel}
      </Caps>
      {barn}
    </section>
  );
}

export function DesignLabV2() {
  const tema = useSyncExternalStore(abonner, lesTema, () => "light" as V2Tema);
  const logoSrc =
    tema === "dark"
      ? "/logos/ak-golf-logo-white-on-dark.svg"
      : "/logos/ak-golf-logo-primary-on-light.svg";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(900px 380px at 20% -10%, var(--v2-vignett), transparent 60%), ${T.bg}`,
        color: T.fg,
        fontFamily: T.ui,
        padding: "32px 20px 64px",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            borderBottom: `1px solid ${T.border}`,
            paddingBottom: 22,
          }}
        >
          <div>
            <Caps size={10}>AgencyOS · design-lab · Fase F</Caps>
            <h1
              style={{
                fontFamily: T.disp,
                fontWeight: 700,
                fontSize: 28,
                letterSpacing: "-0.02em",
                margin: "8px 0 0",
                lineHeight: 1.15,
              }}
            >
              Core parity
            </h1>
            <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, margin: "10px 0 0", maxWidth: 520, lineHeight: 1.55 }}>
              Tokens og kjernekomponenter mot Open Design-fasit. Lys er default. Primær-CTA i lys =
              forest, i mørk = lime.
            </p>
          </div>
          <button
            type="button"
            onClick={byttTema}
            className="v2-press v2-focus"
            aria-label={tema === "dark" ? "Bytt til lys modus" : "Bytt til mørk modus"}
            style={{
              appearance: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              minHeight: 44,
              padding: "10px 16px",
              borderRadius: T.rPill,
              border: `1px solid ${T.borderS}`,
              background: T.panel,
              color: T.fg,
              fontFamily: T.ui,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Icon name={tema === "dark" ? "sun" : "moon"} size={16} />
            {tema === "dark" ? "Lys modus" : "Mørk modus"}
          </button>
        </header>

        <Seksjon
          tittel="Logo"
          barn={
            <Kort pad="20px">
              <Image
                src={logoSrc}
                alt="AK Golf"
                width={160}
                height={48}
                style={{ height: 40, width: "auto" }}
                unoptimized
              />
              <p style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, margin: "12px 0 0" }}>
                {tema === "dark" ? "white-on-dark.svg" : "primary-on-light.svg"} · ikke recolor i CSS
              </p>
            </Kort>
          }
        />

        <Seksjon
          tittel="Button · CTAPill / Knapp"
          barn={
            <Kort pad="20px">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                <CTAPill icon="arrow-right">Primær CTA</CTAPill>
                <CTAPill ghost icon="arrow-left">
                  Ghost
                </CTAPill>
                <Knapp icon="check">Knapp</Knapp>
                <Knapp ghost>Ghost-knapp</Knapp>
              </div>
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "14px 0 0", lineHeight: 1.5 }}>
                Lys: forest på hvit tekst. Mørk: lime. Touch ≥ 44px.
              </p>
            </Kort>
          }
        />

        <Seksjon
          tittel="Card · Kort"
          barn={
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: T.gap }}>
              <Kort eyebrow="Radius 20" hover>
                <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, margin: 0, lineHeight: 1.5 }}>
                  Standard panel-kort. Hover-løft på desktop.
                </p>
              </Kort>
              <Kort tint eyebrow="Med tint">
                <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, margin: 0, lineHeight: 1.5 }}>
                  Forest-tint bakgrunn for vekt.
                </p>
              </Kort>
            </div>
          }
        />

        <Seksjon
          tittel="Tag · StatusPill"
          barn={
            <Kort pad="20px">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <Tag tone="lime">Aktiv</Tag>
                <Tag tone="up">Opp</Tag>
                <Tag tone="down">Ned</Tag>
                <Tag tone="warn">Varsel</Tag>
                <Tag tone="info">Info</Tag>
              </div>
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "12px 0 0" }}>
                Radius tag = 8. Opp/ned bruker --v2-up / --v2-down — aldri lime for delta.
              </p>
            </Kort>
          }
        />

        <Seksjon
          tittel="Forms · parity (Fase 1)"
          barn={
            <div style={{ display: "grid", gap: T.gap, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              <Kort pad="20px">
                <Caps size={9} style={{ marginBottom: 12 }}>
                  Inndata · Velger · Tekst
                </Caps>
                <Inndata label="Navn" defaultValue="" placeholder="Skriv navn" />
                <div style={{ marginTop: 14 }}>
                  <Inndata label="Score (mono)" defaultValue="" placeholder={TOM_TALL} mono />
                </div>
                <div style={{ marginTop: 14 }}>
                  <Inndata label="Med feil" defaultValue="x" feil="Ugyldig verdi — prøv igjen" />
                </div>
                <div style={{ marginTop: 14 }}>
                  <Inndata label="Deaktivert" defaultValue="Låst" disabled />
                </div>
                <div style={{ marginTop: 14 }}>
                  <Velger label="Treningsområde" />
                </div>
                <div style={{ marginTop: 14 }}>
                  <TekstOmraade label="Notat" defaultValue="" placeholder="Skriv notat" rows={3} />
                </div>
              </Kort>
              <Kort pad="20px">
                <Caps size={9} style={{ marginBottom: 12 }}>
                  Bryter · Avkryssing · Radio · Segment
                </Caps>
                <Bryter />
                <div style={{ marginTop: 8 }}>
                  <Avkryssing />
                </div>
                <div style={{ marginTop: 16 }}>
                  <RadioGruppe />
                </div>
                <div style={{ marginTop: 16 }}>
                  <SegmentertFaner label="Periode" />
                </div>
                <div style={{ marginTop: 16 }}>
                  <SkjemaFelt label="Handicap" hjelp="Bruk komma, f.eks. 4,2.">
                    <Inndata label={null} defaultValue="4,2" mono />
                  </SkjemaFelt>
                </div>
                <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "14px 0 0", lineHeight: 1.5 }}>
                  Radius input 12 · touch ≥ 44px · feil = --v2-down · primær on = forest i lys / lime i mørk.
                </p>
              </Kort>
            </div>
          }
        />

        <Seksjon
          tittel="EmptyState · TomTilstand"
          barn={
            <Kort pad="8px">
              <TomTilstand
                icon="inbox"
                title="Ingen elementer ennå"
                sub="Tom tilstand for lister og seksjoner. Anbefaler, sperrer ikke."
              />
            </Kort>
          }
        />

        <Seksjon
          tittel="KPI / tall · eksempel (ikke produksjonsdata)"
          barn={
            <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: T.gap }}>
                <KpiFlis label="Eksempel SG total" value={0.4} delta="+0,2" dir="up" instant />
                <KpiFlis label="Eksempel SG putting" value={-0.3} delta="−0,1" dir="down" instant />
                <KpiFlis label="Mangler data" value={null} />
              </div>
              <Kort>
                <TallHero
                  label="Eksempel hero-tall"
                  value={74}
                  unit="slag"
                  delta="−1,2"
                  dir="up"
                  size={40}
                  sub="Lab-demo · delta bruker --v2-up / --v2-down, aldri lime"
                />
              </Kort>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                <Caps size={9}>Delta</Caps>
                <DeltaChip v="+0,4" dir="up" />
                <DeltaChip v="−0,3" dir="down" />
                <span style={{ fontFamily: T.mono, fontSize: 12, color: T.mut }}>tom = {fmtTall(null)}</span>
              </div>
            </div>
          }
        />

        <Seksjon
          tittel="Metric strip · StatStrip (eksempel)"
          barn={
            <StatStrip
              items={[
                { l: "Runder", v: "14" },
                { l: "SG Total", v: "+1,2", delta: "+0,4", dir: "up" },
                { l: "Putting", v: null },
                { l: "Nærspill", v: "−0,2", delta: "−0,1", dir: "down" },
              ]}
            />
          }
        />

        <Seksjon
          tittel="Overlays · nav (Fase 7 / reg-test)"
          barn={
            <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0, lineHeight: 1.5 }}>
                Showroom-parity: lukk ≥ 44px, dialog-roller, sheet radius 28, toast/banner a11y. AgencyOS — aldri CoachHQ.
              </p>
              <div style={{ overflowX: "auto" }}>
                <Modal w={520} h={300} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
                <Ark h={360} />
                <Skuff w={400} h={360} />
              </div>
              <Toast />
              <Banner />
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <FAB label="Ny økt" />
                <FAB />
              </div>
              <Kort pad="16px">
                <Caps size={9}>Reg-sjekk</Caps>
                <ul style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.65, margin: "10px 0 0", paddingLeft: 18 }}>
                  <li>Lys CTA = forest (lime-token remappet)</li>
                  <li>Mørk: én primær lime per flate</li>
                  <li>Delta = up/down · tom tall = —</li>
                  <li>Ingen «CoachHQ» i v2-lab</li>
                </ul>
              </Kort>
            </div>
          }
        />

        <Seksjon
          tittel="Produktflater · Fase 3"
          barn={
            <Kort pad="20px">
              <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, margin: 0, lineHeight: 1.55 }}>
                Speil av Open Design workbench-unified / player-plan. Ruter (krever innlogging):
              </p>
              <ul style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, lineHeight: 1.7, margin: "12px 0 0", paddingLeft: 18 }}>
                <li>
                  <strong>AgencyOS cockpit</strong> —{" "}
                  <code style={{ fontFamily: T.mono, fontSize: 12 }}>/admin/agencyos</code>
                  {" · "}LiveBar + OktKort (dagens timer)
                </li>
                <li>
                  <strong>PlayerHQ uke</strong> —{" "}
                  <code style={{ fontFamily: T.mono, fontSize: 12 }}>/portal/planlegge</code>
                  {" · "}OktKort for dagens økter + én primær CTA
                </li>
                <li>
                  <strong>Coach workbench</strong> —{" "}
                  <code style={{ fontFamily: T.mono, fontSize: 12 }}>/admin/spillere/[id]/workbench</code>
                  {" · "}chrome med AgencyOS-label, 44px kontroller
                </li>
              </ul>
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "14px 0 0", lineHeight: 1.5 }}>
                Domain top 5 (over) er byggeklossene. Full grid-paritet er later waves.
              </p>
            </Kort>
          }
        />

        <Seksjon
          tittel="Domain top 5 · eksempel (ikke produksjonsdata)"
          barn={
            <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0, lineHeight: 1.5 }}>
                Parity mot Open Design familie-domain. Alle tall er lab-eksempel.
              </p>
              <SpillerKort
                navn="Emma Nilsen"
                kategori="Kat A"
                hcp="4,2"
                sg="+1,8"
                sgDelta="+0,4"
                sgDir="up"
                runder={12}
                adherence="87 %"
                medKpiStripe
              />
              <SpillerKort
                navn="Jonas Hauge"
                kategori="Kat B"
                hcp="11,7"
                sg="-0,6"
                sgDelta="-0,2"
                sgDir="down"
                runder={5}
                adherence={null}
                medKpiStripe
              />
              <OektKort
                title="Innspill 120–150 m"
                time="08:00"
                duration="60 min"
                state="planned"
                meta="I dag · range · 4 drills · eksempel"
                cta="Start økt"
                ctaGhost="Rediger"
              />
              <OektKort
                title="Putting 2–6 m"
                time="16:30"
                duration="45 min"
                state="done"
                meta="I går · green · 3 drills · eksempel"
                footerTall={
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: T.fg2 }}>
                    Adherence <b style={{ color: T.up }}>92 %</b>
                  </span>
                }
                ctaGhost="Se logg"
              />
              <OppgaveKort tittel="Godkjenn ukeplan for Emma" sub="Frist i dag · AgencyOS · eksempel" status="aapen" />
              <OppgaveKort tittel="Send foreldre-oppsummering" sub="Ferdig i går · eksempel" status="fullfort" frist={null} />
              <AnbefalingsKort />
              <LiveBar tittel="Innspill · live økt (eksempel)" tid="42:18" cta="Åpne økt" />
              <LiveBar tittel="Starter om 12 min (eksempel)" tid="07:48" kritisk cta="Gå til økt" />
            </div>
          }
        />

        <Seksjon
          tittel="Domain-kjerne · status-tag, liste-rad, metric strip"
          barn={
            <div style={{ display: "grid", gap: T.gap }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <Tag tone="lime">Status</Tag>
                <Tag tone="up">I rute</Tag>
                <Tag tone="warn">Venter</Tag>
                <Tag tone="down">Avvik</Tag>
              </div>
              <Kort pad="8px 16px">
                <Rad
                  leading={<AvatarInit navn="Eksempel Spiller" />}
                  title="Eksempel spiller"
                  sub="Lab-rad · ikke produksjonsdata"
                  meta={<Tag tone="up">I rute</Tag>}
                  last
                />
                <Rad
                  leading={<AvatarInit navn="Tom Data" />}
                  title="Uten meta"
                  sub={`Tom tall: ${fmtTall(null)}`}
                  trailing={
                    <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
                      {fmtTall(null)}
                    </span>
                  }
                  last
                />
              </Kort>
              <Kort pad="8px">
                <TomTilstand
                  icon="users"
                  title="Ingen rader i listen"
                  sub="EmptyState inne i liste-seksjon — anbefaler, sperrer ikke."
                />
              </Kort>
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0, lineHeight: 1.5 }}>
                Metric strip: se StatStrip over. Radius: tag 8 · rad 12 · kort 20 · sheet {T.rSheet}.
              </p>
            </div>
          }
        />

        <Seksjon
          tittel="Kalender · Fase 8 (eksempel)"
          barn={
            <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0, lineHeight: 1.5 }}>
                Parity mot Open Design familie-calendar. Alle datoer/økter er lab-eksempel.
              </p>
              <VisningsVelger periode="Uke 28 · juli 2026 · eksempel" />
              <DagStripe />
              <Kort pad="16px">
                <Caps size={9}>Uke-grid · eksempel</Caps>
                <div style={{ marginTop: 12, overflowX: "auto" }}>
                  <UkeGrid />
                </div>
              </Kort>
              <Kort pad="16px">
                <Caps size={9}>Måned · eksempel</Caps>
                <div style={{ marginTop: 12, maxWidth: 360 }}>
                  <MndKalender />
                </div>
              </Kort>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <AgendaRad state="live" title="Live økt · innspill" time="08:00" duration="60 min" />
                <AgendaRad state="upcoming" title="Putting 3–6 ft" time="16:30" duration="45 min" />
                <AgendaRad state="done" title="FYS styrke" time="07:00" duration="50 min" />
              </div>
            </div>
          }
        />

        <Seksjon
          tittel="Golfdata · SG · Fase 9 (eksempel)"
          barn={
            <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0, lineHeight: 1.5 }}>
                Parity mot familie-golfdata / familie-data. Tall er lab-eksempel — ikke produksjons-KPI.
              </p>
              <SgTotal />
              <SgKategorier />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: T.gap }}>
                <Kort pad="16px">
                  <Caps size={9}>Progresjon · eksempel</Caps>
                  <div style={{ marginTop: 12 }}>
                    <ProgresjonsBar label="Ukesvolum" value={64} />
                  </div>
                </Kort>
                <Kort pad="16px">
                  <Caps size={9}>Mini-spark · eksempel</Caps>
                  <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
                    <MiniSpark verdier={[0.2, -0.1, 0.4, 0.3, 0.8, 0.5, 1.1]} />
                    <span style={{ fontFamily: T.mono, fontSize: 12, color: T.fg2 }}>SG trend</span>
                  </div>
                </Kort>
              </div>
              <Diagnose />
              <NesteFokus />
            </div>
          }
        />

        <Seksjon
          tittel="TrackMan · Fase 10 (eksempel)"
          barn={
            <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0, lineHeight: 1.5 }}>
                Parity mot familie-trackman. Plottene er SVG-demo med eksempeldata.
              </p>
              <TrackmanSammendrag />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: T.gap }}>
                <KolleStatKort />
                <LaunchWindow />
              </div>
              <Kort pad="16px">
                <Caps size={9}>Dispersion · eksempel</Caps>
                <div style={{ marginTop: 12, overflowX: "auto" }}>
                  <DispersionPlot />
                </div>
              </Kort>
              <Kort pad="16px">
                <Caps size={9}>Trajectory · eksempel</Caps>
                <div style={{ marginTop: 12, overflowX: "auto" }}>
                  <TrajectoryPlot />
                </div>
              </Kort>
            </div>
          }
        />

        <Seksjon
          tittel="Port-status · resterende"
          barn={
            <Kort pad="20px">
              <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, margin: 0, lineHeight: 1.55 }}>
                Plan: <code style={{ fontFamily: T.mono, fontSize: 12 }}>docs/design-system/plan-resterende-port.md</code>
              </p>
              <ul style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, lineHeight: 1.7, margin: "12px 0 0", paddingLeft: 18 }}>
                <li>✅ Fase 0–7: tokens, forms, domain top 5, 3 flater, overlays</li>
                <li>✅ Fase 8–10 lab: kalender, golfdata, TrackMan</li>
                <li>⬜ Bølge 11: feedback + structure rest</li>
                <li>⬜ Bølge 12: dypere produktflater (admin-kalender, SG, TM live)</li>
                <li>⬜ Bølge 13–14: marketing polish + hardening</li>
              </ul>
            </Kort>
          }
        />
      </div>
    </div>
  );
}
