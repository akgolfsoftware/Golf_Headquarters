"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ExternalLink,
  FileText,
  Mail,
  Send,
  Trash2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  Ikon,
  Knapp,
  KnappLenke,
  StatusPille,
  Sidehode,
  Meta,
} from "@/components/precision/pa";
import {
  Dialogboks,
  Skjemafelt,
  Tekstfelt,
  Bryter,
  Nokkelverdi,
  Tabell,
  Tilstandsvakt,
  type Tilstand,
} from "@/components/precision/pa-a4";
import {
  formaterKroner,
  beregnArligBesparelse,
  PH25_PLANER,
  type PH25AbonnementData,
  type PlanId,
  type BetalingsPeriode,
} from "@/lib/portal-abonnement/ph25-abonnement-data";

export interface PH25AbonnementProps {
  initialData?: PH25AbonnementData;
  tilstand?: Tilstand;
  visGameplanAlert?: boolean;
  onTilbakeHref?: string;
  onOppgraderHref?: string;
  onKortHref?: string;
  onSlettKontoAction?: () => Promise<void> | void;
}

interface ToastMelding {
  tittel: string;
  sub?: string;
}

export function PH25Abonnement({
  initialData,
  tilstand = "data",
  visGameplanAlert = false,
  onTilbakeHref = "/portal/meg",
  onOppgraderHref: _onOppgraderHref = "/portal/meg/abonnement/oppgrader/flyt",
  onKortHref = "/portal/meg/abonnement/kort/ny",
}: PH25AbonnementProps) {
  const d = initialData ?? {
    current: {
      plan: "FULL" as PlanId,
      period: "mnd" as const,
      renews: "26.10.2026",
      ends: "25.10.2026",
      cancelled: false,
    },
    plans: PH25_PLANER,
    card: { brand: "Visa", last4: "4821", exp: "08/28" },
    invoices: [
      { id: "inv-1", dato: "26.09.2026", gjelder: "Full · september", belop: 299, status: "Betalt" },
      { id: "inv-2", dato: "26.08.2026", gjelder: "Full · august", belop: 299, status: "Betalt" },
      { id: "inv-3", dato: "26.07.2026", gjelder: "Full · juli", belop: 299, status: "Betalt" },
    ],
    samtykker: { coach: true, data: true, bilder: false, forsk: false },
    varsler: { plan: true, meld: true, turn: true, digest: true, caddie: false },
    sikkerhet: { tofaktor: true, telefonMaskert: "+47 ••• •• 412", sidenDato: "12.01.2026" },
    hjelp: [
      { id: "h1", tittel: "Slik registrerer du en runde", ikon: "file-text", href: "/portal/analysere/hjelp/runder" },
      { id: "h2", tittel: "Slik kobler du TrackMan", ikon: "file-text", href: "/portal/analysere/hjelp/trackman" },
      { id: "h3", tittel: "Kontakt Fredrikstad GK", ikon: "mail", href: "mailto:post@fredrikstadgk.no" },
    ],
  };

  const fullPlan = d.plans.find((p) => p.id === "FULL") ?? PH25_PLANER[1];
  const talentPlan = d.plans.find((p) => p.id === "TALENT") ?? PH25_PLANER[0];
  const arligBesparelse = beregnArligBesparelse(fullPlan.prisMnd, fullPlan.prisAr);

  const [valgtPlan, setValgtPlan] = useState<PlanId>(
    tilstand === "tom" ? "TALENT" : d.current.plan
  );
  const [periode, setPeriode] = useState<BetalingsPeriode>(
    d.current.period === "mnd" ? "Månedlig" : "Årlig"
  );
  const [avbrutt, setAvbrutt] = useState<boolean>(d.current.cancelled ?? false);
  const [visAvsluttDialog, setVisAvsluttDialog] = useState<boolean>(false);
  const [visSlettDialog, setVisSlettDialog] = useState<boolean>(false);
  const [slettBekreftTekst, setSlettBekreftTekst] = useState<string>("");

  const [samtykker, setSamtykker] = useState(d.samtykker);
  const [varsler, setVarsler] = useState(d.varsler);
  const [toFaktor, setToFaktor] = useState<boolean>(d.sikkerhet.tofaktor);
  const [tilbakemeldingTekst, setTilbakemeldingTekst] = useState<string>("");
  const [tilbakemeldingSendt, setTilbakemeldingSendt] = useState<boolean>(false);

  const [toast, setToast] = useState<ToastMelding | null>(null);

  function visToast(tittel: string, sub?: string) {
    setToast({ tittel, sub });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }

  function handleByttPeriode(nyPeriode: BetalingsPeriode) {
    setPeriode(nyPeriode);
    visToast(
      "Betalingsperiode endret",
      nyPeriode === "Årlig"
        ? `${formaterKroner(fullPlan.prisAr).toUpperCase()} PER ÅR · FRA ${d.current.renews}`
        : `${formaterKroner(fullPlan.prisMnd).toUpperCase()} PER MND`
    );
  }

  function handleVelgPlan(planId: PlanId) {
    setValgtPlan(planId);
    setAvbrutt(false);
    visToast(
      planId === "FULL" ? "Du har Full" : "Du bytter til Gratis",
      planId === "FULL"
        ? `${formaterKroner(fullPlan.prisMnd).toUpperCase()} PER MND · FORNYES ${d.current.renews}`
        : `GJELDER FRA ${d.current.renews}`
    );
  }

  function handleAvsluttAbonnement() {
    setAvbrutt(true);
    setVisAvsluttDialog(false);
    visToast(
      `Abonnementet avsluttes ${d.current.ends}`,
      "DU BEHOLDER FULL TIL DA"
    );
  }

  function handleGjenopptaAbonnement() {
    setAvbrutt(false);
    visToast("Abonnementet fortsetter", `FORNYES ${d.current.renews}`);
  }

  function handleTofaktorToggle(nyVerdi: boolean) {
    setToFaktor(nyVerdi);
    visToast(
      nyVerdi ? "Tofaktor er slått på" : "Tofaktor er slått av",
      nyVerdi ? `KODE PÅ SMS TIL ${d.sikkerhet.telefonMaskert || "+47 ••• •• 412"}` : "ANBEFALES PÅ"
    );
  }

  function handleSendTilbakemelding() {
    if (!tilbakemeldingTekst.trim()) return;
    setTilbakemeldingSendt(true);
    visToast("Tilbakemelding sendt", "TAKK · VI LESER ALT");
  }

  function handleSlettKonto() {
    setVisSlettDialog(false);
    setSlettBekreftTekst("");
    visToast("Kontoen slettes", "INNEN 30 DAGER · KVITTERING PÅ E-POST");
  }

  const erTom = tilstand === "tom";

  return (
    <div className="pa-side" style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 20px" }}>
      {/* Toast-varsel */}
      {toast && (
        <aside
          role="status"
          aria-live="polite"
          className="pa-undo"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--surface-sunken)",
            border: "1px solid var(--border-ink)",
            borderRadius: "var(--radius)",
            padding: "10px 16px",
            boxShadow: "var(--shadow-raised)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            zIndex: 100,
          }}
        >
          <span style={{ font: "var(--type-label)", color: "var(--text-primary)" }}>
            {toast.tittel}
          </span>
          {toast.sub && (
            <span
              style={{
                font: "var(--type-meta)",
                color: "var(--text-muted)",
                letterSpacing: ".04em",
              }}
            >
              {toast.sub}
            </span>
          )}
        </aside>
      )}

      {/* Toppseksjon med Tilbake-knapp */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 240 }}>
          <Sidehode
            kicker="Meg · Innstillinger"
            title="Abonnement og innstillinger"
          />
        </div>
        <div>
          <KnappLenke
            variant="secondary"
            icon={ArrowLeft}
            iconName="arrow-left"
            href={onTilbakeHref}
          >
            Meg
          </KnappLenke>
        </div>
      </div>

      {/* InlineAlert ved tom tilstand eller spesiell oppgrader-kilde */}
      {(erTom || visGameplanAlert) && (
        <div
          className="pa-alert pa-alert--info"
          role="status"
          style={{ marginBottom: 16 }}
        >
          <Ikon icon={AlertCircle} size={18} name="alert-circle" />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="pa-alert__title">Gameplan krever Full</span>
            <span>
              Du kom hit fordi flaten er låst i Gratis. Åpent i Gratis: testbatteriet, analyse og
              runderegistrering med SG, booking av enkelttimer og konto. Velg
              Full for plan, Live-økt, Gameplan og Caddie.
            </span>
          </div>
        </div>
      )}

      <Tilstandsvakt
        tilstand={tilstand}
        laster="Henter abonnement og innstillinger …"
        feil={{
          title: "Abonnementet kunne ikke hentes",
          text: "Ingenting er endret og ingenting er trukket. Prøv igjen.",
          code: "FEIL 502 · BETALING",
        }}
      >
        {/* Hovedrutenett: To-pakke visning (Gratis vs Full) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
            marginBottom: 20,
          }}
        >
          {[talentPlan, fullPlan].map((p) => {
            const erAktiv = valgtPlan === p.id;
            return (
              <div
                key={p.id}
                className="pa-card"
                style={{
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  borderColor: erAktiv ? "var(--border-ink)" : "var(--border-hairline)",
                  boxShadow: erAktiv ? "inset 0 0 0 1px var(--border-ink)" : "var(--shadow-card)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      font: "600 17px/1 var(--font-mono)",
                      color: "var(--text-primary)",
                      letterSpacing: ".04em",
                      flex: 1,
                    }}
                  >
                    {p.navn}
                  </span>
                  {erAktiv && (
                    <StatusPille tone={avbrutt ? "warn" : "ok"}>
                      {avbrutt ? `Avsluttes ${d.current.ends}` : "Ditt nivå"}
                    </StatusPille>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      font: "var(--type-metric)",
                      color: "var(--text-primary)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {p.prisMnd ? formaterKroner(p.prisMnd) : "Gratis"}
                  </span>
                  {p.per && (
                    <span
                      style={{
                        font: "var(--type-meta)",
                        color: "var(--text-muted)",
                      }}
                    >
                      per {p.per} · eller {formaterKroner(p.prisAr)} per år
                    </span>
                  )}
                </div>

                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    flex: 1,
                  }}
                >
                  {p.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        font: "var(--type-body-s)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <Ikon icon={Check} size={14} name="check" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {!erAktiv && (
                  <div style={{ marginTop: 8 }}>
                    <Knapp
                      variant={p.id === "FULL" ? "primary" : "secondary"}
                      fullWidth
                      onClick={() => handleVelgPlan(p.id)}
                    >
                      {p.id === "FULL" ? "Velg Full" : "Bytt til Gratis"}
                    </Knapp>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* To kolonner for detaljer og innstillinger */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* Kolonne 1 (Venstre): Betaling, Kort, Faktura */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {valgtPlan === "FULL" && (
              <div
                className="pa-card"
                style={{
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span className="kicker">Betalingsperiode</span>
                  <Meta>
                    {avbrutt
                      ? `AVSLUTTES ${d.current.ends}`
                      : `FORNYES ${d.current.renews}`}
                  </Meta>
                </div>

                {/* Segmentert toggle: Månedlig vs Årlig */}
                <div className="pa-seg pa-seg--full" role="group" aria-label="Betalingsperiode">
                  {(["Månedlig", "Årlig"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className="pa-seg__opt"
                      aria-pressed={periode === opt}
                      onClick={() => handleByttPeriode(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <Meta>
                  {periode === "Årlig"
                    ? `${formaterKroner(fullPlan.prisAr).toUpperCase()} PER ÅR · SPARER ${formaterKroner(arligBesparelse).toUpperCase()}`
                    : `${formaterKroner(fullPlan.prisMnd).toUpperCase()} PER MND · ÅRLIG GIR ${formaterKroner(arligBesparelse).toUpperCase()} LAVERE PRIS`}
                </Meta>

                {avbrutt ? (
                  <div
                    className="pa-alert pa-alert--warn"
                    role="status"
                    style={{ marginTop: 4 }}
                  >
                    <Ikon icon={AlertCircle} size={16} name="alert-circle" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span className="pa-alert__title">Full avsluttes {d.current.ends}</span>
                      <span>
                        Du beholder alt til og med {d.current.ends}. Deretter får du Gratis. Ingen
                        flere trekk.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Knapp variant="ghost" onClick={() => setVisAvsluttDialog(true)}>
                      Avslutt abonnement
                    </Knapp>
                  </div>
                )}

                {avbrutt && (
                  <div>
                    <Knapp variant="secondary" onClick={handleGjenopptaAbonnement}>
                      Fortsett Full
                    </Knapp>
                  </div>
                )}
              </div>
            )}

            {/* Betalingskort */}
            <div
              className="pa-card"
              style={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span className="kicker">Betalingskort</span>
                <Meta>ÅPNES I STRIPE-KUNDEPORTALEN</Meta>
              </div>

              {erTom || !d.card ? (
                <p
                  style={{
                    margin: 0,
                    font: "var(--type-body-s)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Ingen kort registrert.
                </p>
              ) : (
                <Nokkelverdi
                  items={[
                    ["Kort", `${d.card.brand} •••• ${d.card.last4}`, { mono: true }],
                    ["Utløper", d.card.exp, { mono: true }],
                  ]}
                />
              )}

              <div>
                <KnappLenke
                  variant="secondary"
                  size="sm"
                  icon={ExternalLink}
                  iconName="external-link"
                  href={onKortHref}
                >
                  Bytt kort og se kvitteringer
                </KnappLenke>
              </div>
            </div>

            {/* Fakturaer */}
            <div
              className="pa-card"
              style={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span className="kicker">Faktura</span>
              </div>

              {erTom || d.invoices.length === 0 ? (
                <p
                  style={{
                    margin: 0,
                    font: "var(--type-body-s)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Ingen fakturaer på Gratis.
                </p>
              ) : (
                <Tabell
                  caption="Faktura"
                  columns={[
                    { key: "dato", label: "Dato", mono: true, render: (r) => r.dato },
                    { key: "gjelder", label: "Gjelder", render: (r) => r.gjelder },
                    {
                      key: "belop",
                      label: "Beløp",
                      mono: true,
                      align: "right",
                      render: (r) => formaterKroner(r.belop),
                    },
                    {
                      key: "status",
                      label: "Status",
                      render: (r) => (
                        <StatusPille tone={r.status === "Betalt" ? "ok" : "warn"}>
                          {r.status}
                        </StatusPille>
                      ),
                    },
                  ]}
                  rows={d.invoices}
                />
              )}
            </div>
          </div>

          {/* Kolonne 2 (Høyre): Samtykke, Varsler, Sikkerhet, Hjelp, Slett konto, Tilbakemelding */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Samtykke */}
            <div
              className="pa-card"
              style={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span className="kicker">Samtykke</span>
                <Meta>UNDER 16 ÅR GIR FORELDEREN SAMTYKKET</Meta>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Bryter
                  checked={samtykker.coach}
                  onChange={(v) => setSamtykker((s) => ({ ...s, coach: v }))}
                  label="Ytelsesbilde (søvn, mat, energi)"
                />
                <Bryter
                  checked={samtykker.data}
                  onChange={(v) => setSamtykker((s) => ({ ...s, data: v }))}
                  label="Opptak i coachingøkt"
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <Meta>HVEM SOM SER DATAENE STYRES I</Meta>
                <Link
                  href="/portal/meg/innstillinger/personvern/deling"
                  style={{
                    font: "var(--type-meta)",
                    color: "var(--text-primary)",
                    textDecoration: "underline",
                    letterSpacing: ".04em",
                  }}
                >
                  MEG › DELING
                </Link>
              </div>
            </div>

            {/* Varsler */}
            <div
              className="pa-card"
              style={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span className="kicker">Varsler</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Bryter
                  checked={varsler.plan}
                  onChange={(v) => setVarsler((s) => ({ ...s, plan: v }))}
                  label="Ny plan fra coach"
                />
                <Bryter
                  checked={varsler.meld}
                  onChange={(v) => setVarsler((s) => ({ ...s, meld: v }))}
                  label="Meldinger"
                />
                <Bryter
                  checked={varsler.turn}
                  onChange={(v) => setVarsler((s) => ({ ...s, turn: v }))}
                  label="Turneringsfrister"
                />
                <Bryter
                  checked={varsler.digest}
                  onChange={(v) => setVarsler((s) => ({ ...s, digest: v }))}
                  label="Ukesdigest søndag kveld"
                />
                <Bryter
                  checked={varsler.caddie}
                  onChange={(v) => setVarsler((s) => ({ ...s, caddie: v }))}
                  label="Forslag fra Caddie"
                />
              </div>
            </div>

            {/* Sikkerhet */}
            <div
              className="pa-card"
              style={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span className="kicker">Sikkerhet</span>
                <Link
                  href="/portal/meg/innstillinger/sikkerhet"
                  style={{
                    font: "var(--type-meta)",
                    color: "var(--text-muted)",
                    textDecoration: "underline",
                  }}
                >
                  DETALJER
                </Link>
              </div>

              <Bryter
                checked={toFaktor}
                onChange={handleTofaktorToggle}
                label="Tofaktor-innlogging (2FA)"
              />

              <Meta>
                {toFaktor
                  ? `PÅ · SMS TIL ${d.sikkerhet.telefonMaskert || "+47 ••• •• 412"}${
                      d.sikkerhet.sidenDato ? ` · SIDEN ${d.sikkerhet.sidenDato}` : ""
                    }`
                  : "AV"}
              </Meta>
            </div>

            {/* Hjelp */}
            <div
              className="pa-card"
              style={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                minWidth: 0,
              }}
            >
              <span className="kicker">Hjelp</span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {d.hjelp.map((h, i) => {
                  const IkonGlyf =
                    h.ikon === "mail"
                      ? Mail
                      : h.ikon === "file-text"
                      ? FileText
                      : HelpCircle;
                  return (
                    <a
                      key={h.id}
                      href={h.href ?? "#"}
                      onClick={(e) => {
                        if (!h.href || h.href === "#") {
                          e.preventDefault();
                          visToast("Åpner", h.tittel.toUpperCase());
                        }
                      }}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        minHeight: 44,
                        borderTop: i > 0 ? "1px solid var(--border-hairline)" : "none",
                        color: "inherit",
                        textDecoration: "none",
                      }}
                    >
                      <Ikon icon={IkonGlyf} size={16} name={h.ikon} />
                      <span
                        style={{
                          flex: 1,
                          font: "500 14px/1.3 var(--font-sans)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {h.tittel}
                      </span>
                      <Ikon icon={ArrowUpRight} size={14} name="arrow-up-right" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Slett konto */}
            <div
              className="pa-card"
              style={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minWidth: 0,
              }}
            >
              <span className="kicker">Slett konto</span>
              <p
                style={{
                  margin: 0,
                  font: "var(--type-body-s)",
                  color: "var(--text-secondary)",
                }}
              >
                Alt du har registrert slettes innen 30 dager: økter, runder, tester, helse og
                meldinger. Abonnementet avsluttes i Stripe. Coachene mister tilgangen straks.
              </p>
              <div>
                <Knapp
                  variant="signal"
                  size="sm"
                  icon={Trash2}
                  iconName="trash-2"
                  onClick={() => setVisSlettDialog(true)}
                >
                  Slett konto
                </Knapp>
              </div>
            </div>

            {/* Tilbakemelding */}
            <div
              className="pa-card"
              style={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minWidth: 0,
              }}
            >
              <span className="kicker">Tilbakemelding</span>
              {tilbakemeldingSendt ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <StatusPille tone="ok">Sendt</StatusPille>
                  <Meta>TAKK · VI LESER ALT</Meta>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Skjemafelt label="Hva kan bli bedre?">
                    <Tekstfelt
                      value={tilbakemeldingTekst}
                      onChange={(v) => setTilbakemeldingTekst(v)}
                      placeholder="Skriv kort"
                    />
                  </Skjemafelt>
                  <div>
                    <Knapp
                      size="sm"
                      icon={Send}
                      iconName="send"
                      disabled={!tilbakemeldingTekst.trim()}
                      onClick={handleSendTilbakemelding}
                    >
                      Send
                    </Knapp>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Tilstandsvakt>

      {/* Dialog: Avslutte Full? */}
      <Dialogboks
        open={visAvsluttDialog}
        title="Avslutte Full?"
        onClose={() => setVisAvsluttDialog(false)}
        footer={
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
            <Knapp variant="secondary" onClick={() => setVisAvsluttDialog(false)}>
              Behold Full
            </Knapp>
            <Knapp variant="primary" onClick={handleAvsluttAbonnement}>
              Avslutt abonnement
            </Knapp>
          </div>
        }
      >
        <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-primary)" }}>
          Full gjelder til og med {d.current.ends}. Etter det får du Gratis: testbatteri,
          analyse og runderegistrering, booking og konto. Plan fra coach, Live-økt, Gameplan og
          Caddie stopper.
        </p>
      </Dialogboks>

      {/* Dialog: Slette kontoen? */}
      <Dialogboks
        open={visSlettDialog}
        title="Slette kontoen?"
        onClose={() => {
          setVisSlettDialog(false);
          setSlettBekreftTekst("");
        }}
        footer={
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
            <Knapp
              variant="secondary"
              onClick={() => {
                setVisSlettDialog(false);
                setSlettBekreftTekst("");
              }}
            >
              Behold kontoen
            </Knapp>
            <Knapp
              variant="signal"
              disabled={slettBekreftTekst.trim().toUpperCase() !== "SLETT"}
              onClick={handleSlettKonto}
            >
              Slett for godt
            </Knapp>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-primary)" }}>
            Dette kan ikke angres. Skriv SLETT for å bekrefte.
          </p>
          <Skjemafelt label="Skriv SLETT">
            <Tekstfelt
              mono
              value={slettBekreftTekst}
              onChange={(v) => setSlettBekreftTekst(v)}
              placeholder="SLETT"
            />
          </Skjemafelt>
        </div>
      </Dialogboks>
    </div>
  );
}
