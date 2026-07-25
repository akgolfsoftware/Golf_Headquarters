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
import { Inndata } from "@/components/v2/skjema";
import { Icon } from "@/components/v2/icon";
import { StatStrip } from "@/components/v2/spesialviz";

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
          tittel="Input · Inndata"
          barn={
            <Kort pad="20px" style={{ maxWidth: 400 }}>
              <Inndata label="Navn" defaultValue="" placeholder="Skriv navn" />
              <div style={{ marginTop: 14 }}>
                <Inndata label="Score (mono)" defaultValue="" placeholder={TOM_TALL} mono />
              </div>
            </Kort>
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
                Metric strip: se StatStrip over. Radius: tag 8 · rad 12 · kort 20.
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
}
