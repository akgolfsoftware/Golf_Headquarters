"use client";

/**
 * AgencyOS Bookinger og kapasitet — Paper 1:1 (fase2 W4, `agencyos-bookinger`).
 * Fasit: designsystem/paper/fase2/agencyos/agencyos-bookinger.html.
 * Hode (Forrige uke + Ny booking) → KPI-rad (5) → «Når er det trykk?»-varmekart
 * → anleggsfaner → bookingtabell (desktop) / kortliste (mobil) → tjenester-kort.
 *
 * A2 (16.08.2026): master–detalj på desktop ≥1024px — klikk på en rad velger
 * bookingen inn i inspektørpanelet (380px, delt primitiv) der den kan forstås
 * og avgjøres (bekreft/avvis, åpne detaljruten). Bookinger-fasiten selv har
 * ikke `med-panel`; panelform følger fasitens delte panelmønster (w4-base.css)
 * per A2-beslutningen. Mobil og 768–1023px beholder liste→detalj uendret.
 */

import { Fragment, useMemo, useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Kort,
  Rad,
  KpiFlis,
  StatusPill,
  CTAPill,
  Knapp,
  AvatarInit,
  VarmeKart,
  TomTilstand,
  Inspektorpanel,
  InspektorBlokk,
  InspektorLinje,
  InspektorTom,
  MasterDetalj,
  useInspektorSynlig,
  T,
  type StatusTone,
} from "@/components/v2";
import { bekreftBooking, avvisBooking } from "@/app/admin/(legacy)/bookinger/actions";

// ── Datakontrakt (mappes fra Prisma i ruten) ────────────────────
export type BookingStatusKey = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface AdminBookingV2Row {
  id: string;
  navn: string;
  tid: string;
  tjeneste: string;
  anlegg: string;
  /** Grovgruppert anleggstype — driver anleggsfanene (reelle anleggsdata). */
  anleggType: string;
  status: BookingStatusKey;
  prisKr: number;
  planHref: string | null;
}

export interface AdminBookingerV2AnleggTab {
  navn: string;
  antall: number;
}

export interface AdminBookingerV2Data {
  ukeNr: number;
  lokasjon: string;
  nyHref: string;
  forrigeUkeHref: string;
  kpis: {
    bookinger: number;
    avlyst: number;
    kapasitetPct: number;
    brukteTimeluker: number;
    totaltTimeluker: number;
    foresporsler: number;
    ledigeLuker: number;
    apningstid: string;
    // Ukas bookingverdi i kroner — null når brukeren mangler VIEW_FINANCE.
    ukesVerdiKr: number | null;
  };
  heat: {
    timer: string[]; // rad-etiketter (klokketimer)
    dager: string[]; // kolonne-etiketter (Ma..Sø)
    verdier: number[][]; // 0..1 belegg per [time][dag]
  };
  kapasitetHref: string;
  /** Fane 0 er alltid «Alle anlegg N»; resten er reelle anleggstyper med treff. */
  anleggTabs: AdminBookingerV2AnleggTab[];
  bookinger: AdminBookingV2Row[];
  tjenester: { id: string; navn: string; varighetMin: number; prisLabel: string }[];
}

const STATUS: Record<BookingStatusKey, { label: string; tone: StatusTone }> = {
  PENDING: { label: "Venter", tone: "warn" },
  CONFIRMED: { label: "Bekreftet", tone: "up" },
  COMPLETED: { label: "Fullført", tone: "info" },
  CANCELLED: { label: "Avlyst", tone: "down" },
};

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

/** Inline bekreft/avvis for én PENDING-booking (server-actions + optimistisk dimming).
 *  `stor`: full knappstørrelse for inspektørpanelets fot (ellers kompakt tabell-variant). */
function BekreftAvvis({ id, stor }: { id: string; stor?: boolean }) {
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState(false);
  const kjor = (fn: (id: string) => Promise<unknown>) =>
    start(async () => {
      setFeil(false);
      try {
        await fn(id);
      } catch {
        setFeil(true);
      }
    });
  const kompakt = stor ? undefined : { minHeight: 32, padding: "6px 12px", fontSize: 11.5 };
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ display: stor ? "grid" : "inline-flex", gridAutoFlow: "column", gridAutoColumns: stor ? "1fr" : undefined, gap: stor ? 8 : 6, opacity: pending ? 0.5 : 1, flex: "none" }}
    >
      <Knapp icon="check" full={stor} disabled={pending} onClick={() => kjor(bekreftBooking)} style={kompakt}>
        Bekreft
      </Knapp>
      <Knapp ghost full={stor} disabled={pending} onClick={() => kjor(avvisBooking)} style={kompakt}>
        Avvis
      </Knapp>
      {feil && <span style={{ fontFamily: T.ui, fontSize: 11, color: T.down, alignSelf: "center" }}>Feilet</span>}
    </div>
  );
}

/**
 * Booking-inspektøren (A2) — valgt rad i 380px-panelet: nok til å forstå og
 * avgjøre bookingen uten å forlate flaten. Detaljruten (/admin/bookinger/[id])
 * beholdes og nås fra panelets fot. Kun feltene lista faktisk har — gjest-
 * kontakt, notat og opprettet-tidspunkt bor på detaljruten (ikke i rad-data,
 * og skal ikke diktes opp her).
 */
function BookingInspektor({ b }: { b: AdminBookingV2Row }) {
  const st = STATUS[b.status];
  return (
    <Inspektorpanel
      tittel={b.navn}
      ariaLabel={`Valgt booking: ${b.navn}`}
      tag={<StatusPill tone={st.tone}>{st.label}</StatusPill>}
      fot={
        b.status === "PENDING" ? (
          <BekreftAvvis id={b.id} stor />
        ) : (
          <>
            <Link href={`/admin/bookinger/${b.id}`} style={{ textDecoration: "none" }}>
              <Knapp full icon="arrow-right">
                Åpne booking
              </Knapp>
            </Link>
            {b.planHref && (
              <Link href={b.planHref} style={{ textDecoration: "none" }}>
                <Knapp ghost full icon="file-text">
                  Se plan
                </Knapp>
              </Link>
            )}
          </>
        )
      }
    >
      <InspektorBlokk label="Booking">
        <InspektorLinje label="Når" verdi={b.tid} />
        <InspektorLinje label="Tjeneste" verdi={b.tjeneste} />
        <InspektorLinje label="Anlegg" verdi={b.anlegg} />
        <InspektorLinje label="Pris" verdi={b.prisKr > 0 ? krLabel(b.prisKr) : "0"} />
      </InspektorBlokk>

      {b.status === "PENDING" && (
        <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12, lineHeight: 1.55, color: T.mut }}>
          Forespørselen venter på svar — bekreft eller avvis under.
        </p>
      )}

      <Link
        href={`/admin/bookinger/${b.id}`}
        className="v2-focus"
        style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.mut, textDecoration: "none", width: "fit-content" }}
      >
        Kontakt, notat og historikk → detaljruten
      </Link>
    </Inspektorpanel>
  );
}

/** Klient-CSV-eksport av kapasitets-heatmapen (erstatter legacy EksporterKnapp). */
function Eksporter({ heat, ukeNr }: { heat: AdminBookingerV2Data["heat"]; ukeNr: number }) {
  const last = () => {
    const linjer = [["Klokke", ...heat.dager].join(";")];
    heat.timer.forEach((t, ri) => {
      const rad = heat.verdier[ri] ?? [];
      linjer.push([`Kl ${t}:00`, ...heat.dager.map((_, ci) => `${Math.round((rad[ci] ?? 0) * 100)}%`)].join(";"));
    });
    const blob = new Blob([linjer.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kapasitet-uke-${ukeNr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Knapp ghost icon="download" onClick={last}>
      Eksporter
    </Knapp>
  );
}

const krLabel = (kr: number) => `${kr.toLocaleString("nb-NO")} kr`;

export function AdminBookingerV2({ data }: { data: AdminBookingerV2Data }) {
  const router = useRouter();
  const [anleggFilter, setAnleggFilter] = useState<string | null>(null);
  // A2: valgt booking fyller inspektørpanelet på desktop; klikk igjen fjerner
  // valget. Under lg finnes ikke panelet — der navigerer radklikk som før.
  const [valgtId, setValgtId] = useState<string | null>(null);
  const visPanel = useInspektorSynlig();

  const filtrert = useMemo(
    () => (anleggFilter ? data.bookinger.filter((b) => b.anleggType === anleggFilter) : data.bookinger),
    [data.bookinger, anleggFilter],
  );

  const gaTilDetalj = (id: string) => router.push(`/admin/bookinger/${id}`);
  const radKlikk = (id: string) => {
    if (visPanel) setValgtId((cur) => (cur === id ? null : id));
    else gaTilDetalj(id);
  };

  // ── Hode ─────────────────────────────────────────────────────
  const hode = (
    <header
      data-paper-slug="agencyos-bookinger"
      style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}
    >
      <div>
        <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 22, fontWeight: 600, color: T.fg }}>Bookinger og kapasitet</h1>
        <span style={{ display: "block", fontFamily: T.mono, fontSize: 11, color: T.mut, marginTop: 4 }}>
          uke {data.ukeNr} · {data.lokasjon}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link href={data.forrigeUkeHref} style={{ textDecoration: "none" }}>
          <CTAPill ghost>Forrige uke</CTAPill>
        </Link>
        <Link href={data.nyHref} style={{ textDecoration: "none" }}>
          <CTAPill icon="plus">Ny booking</CTAPill>
        </Link>
      </div>
    </header>
  );

  // ── KPI-rad (5) ──────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-2 lg:grid-cols-5" style={{ gap: T.gap }}>
      <KpiFlis
        label="Bookinger"
        value={data.kpis.bookinger}
        sub={`uke ${data.ukeNr} · ${pl(data.kpis.avlyst, "avlyst", "avlyst")}`}
      />
      <KpiFlis
        label="Kapasitet"
        value={`${data.kpis.kapasitetPct} %`}
        sub={`${data.kpis.brukteTimeluker} av ${data.kpis.totaltTimeluker} timeluker`}
      />
      <KpiFlis
        label="Forespørsler"
        value={data.kpis.foresporsler}
        varsle={data.kpis.foresporsler > 0}
        sub="ubehandlet, alle uker"
      />
      <KpiFlis label="Ledige luker" value={data.kpis.ledigeLuker} sub={data.kpis.apningstid} />
      <KpiFlis
        label="Ukesverdi"
        value={data.kpis.ukesVerdiKr !== null ? krLabel(data.kpis.ukesVerdiKr) : null}
        sub={data.kpis.ukesVerdiKr !== null ? "kr · låst ved booking" : "ikke tilgjengelig for din rolle"}
      />
    </div>
  );

  // ── «Når er det trykk?»-varmekart ───────────────────────────
  const heatmap = (
    <Kort
      eyebrow="Når er det trykk?"
      action={
        <Link href={data.kapasitetHref} style={{ textDecoration: "none" }}>
          <Knapp ghost style={{ minHeight: 32, padding: "6px 12px", fontSize: 11.5 }}>
            Åpne kapasitet
          </Knapp>
        </Link>
      }
    >
      <div style={{ overflowX: "auto" }}>
        <VarmeKart
          rows={data.heat.timer}
          cols={data.heat.dager}
          values={data.heat.verdier}
          color={T.info}
          cell={22}
          fmt={(v) => `${Math.round(v * 100)} % belegg`}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontFamily: T.mono, fontSize: 10, color: T.mut }}>
        <span>Ingen</span>
        <span style={{ width: 16, height: 10, borderRadius: 2, background: T.track }} />
        <span style={{ width: 16, height: 10, borderRadius: 2, background: `color-mix(in srgb, ${T.info} 35%, ${T.track})` }} />
        <span style={{ width: 16, height: 10, borderRadius: 2, background: `color-mix(in srgb, ${T.info} 60%, ${T.track})` }} />
        <span style={{ width: 16, height: 10, borderRadius: 2, background: T.info }} />
        <span>Fullt</span>
      </div>
    </Kort>
  );

  // ── Anleggsfaner ─────────────────────────────────────────────
  const faner = (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <button
        type="button"
        className="v2-press v2-focus"
        onClick={() => setAnleggFilter(null)}
        style={{
          appearance: "none",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          height: 32,
          padding: "0 12px",
          borderRadius: 9999,
          background: anleggFilter === null ? T.handlingSoft : T.panel3,
          border: `1px solid ${anleggFilter === null ? T.handling : T.borderS}`,
          color: anleggFilter === null ? T.handling : T.fg,
          fontFamily: T.ui,
          fontSize: 12.5,
          fontWeight: 500,
        }}
      >
        Alle anlegg <span style={{ fontFamily: T.mono, fontSize: 11 }}>{data.bookinger.length}</span>
      </button>
      {data.anleggTabs.map((f) => {
        const on = anleggFilter === f.navn;
        return (
          <button
            key={f.navn}
            type="button"
            className="v2-press v2-focus"
            onClick={() => setAnleggFilter(f.navn)}
            style={{
              appearance: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 32,
              padding: "0 12px",
              borderRadius: 9999,
              background: on ? T.handlingSoft : T.panel3,
              border: `1px solid ${on ? T.handling : T.borderS}`,
              color: on ? T.handling : T.fg,
              fontFamily: T.ui,
              fontSize: 12.5,
              fontWeight: 500,
            }}
          >
            {f.navn} <span style={{ fontFamily: T.mono, fontSize: 11 }}>{f.antall}</span>
          </button>
        );
      })}
    </div>
  );

  // ── Bookingtabell (desktop) ──────────────────────────────────
  const th: CSSProperties = {
    padding: "10px 16px",
    textAlign: "left",
    fontFamily: T.mono,
    fontSize: 9.5,
    fontWeight: 600,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: T.mut,
    borderBottom: `1px solid ${T.borderS}`,
    whiteSpace: "nowrap",
  };
  const td: CSSProperties = {
    padding: "10px 16px",
    fontFamily: T.ui,
    fontSize: 12.5,
    color: T.fg,
    verticalAlign: "middle",
  };

  const tabell = (
    <div style={{ overflowX: "auto", border: `1px solid ${T.border}`, borderRadius: T.rCard }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
        <caption className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
          Bookinger uke {data.ukeNr}
        </caption>
        <thead>
          <tr>
            <th scope="col" style={th}>Når</th>
            <th scope="col" style={th}>Hvem</th>
            <th scope="col" style={th}>Tjeneste</th>
            <th scope="col" style={th}>Anlegg</th>
            <th scope="col" style={th}>Status</th>
            <th scope="col" style={{ ...th, textAlign: "right" }}>Pris</th>
          </tr>
        </thead>
        <tbody>
          {filtrert.map((b, i) => {
            const st = STATUS[b.status];
            const sist = i === filtrert.length - 1;
            const valgt = visPanel && b.id === valgtId;
            return (
              <tr
                key={b.id}
                onClick={() => radKlikk(b.id)}
                className="v2-row-h"
                data-valgt={valgt ? "true" : undefined}
                style={{
                  cursor: "pointer",
                  borderBottom: sist ? "none" : `1px solid ${T.border}`,
                  background: valgt ? T.panel3 : undefined,
                }}
              >
                <td style={{ ...td, fontFamily: T.mono, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{b.tid}</td>
                <td style={{ ...td, minWidth: 0, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.navn}</td>
                <td style={{ ...td, minWidth: 0, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.tjeneste}</td>
                <td style={{ ...td, minWidth: 0, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.anlegg}</td>
                <td style={td}>
                  {b.status === "PENDING" ? <BekreftAvvis id={b.id} /> : <StatusPill tone={st.tone}>{st.label}</StatusPill>}
                </td>
                <td style={{ ...td, textAlign: "right", fontFamily: T.mono, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  {b.prisKr > 0 ? krLabel(b.prisKr) : "0"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // ── Kortliste (mobil) ────────────────────────────────────────
  const kortliste = (
    <Kort pad="4px 16px">
      {filtrert.map((b, i) => {
        const st = STATUS[b.status];
        return (
          <Fragment key={b.id}>
            <Rad
              onClick={() => gaTilDetalj(b.id)}
              leading={<AvatarInit navn={b.navn} size={32} />}
              title={b.navn}
              sub={[b.tid, b.tjeneste, b.anlegg].filter(Boolean).join(" · ")}
              meta={<StatusPill tone={st.tone}>{st.label}</StatusPill>}
              last={i === filtrert.length - 1}
            />
            {b.status === "PENDING" && (
              <div style={{ padding: "0 0 12px", borderBottom: i === filtrert.length - 1 ? "none" : `1px solid ${T.border}` }}>
                <BekreftAvvis id={b.id} />
              </div>
            )}
          </Fragment>
        );
      })}
    </Kort>
  );

  // ── Tjenester og åpningstid ──────────────────────────────────
  const tjenesterKort =
    data.tjenester.length > 0 ? (
      <Kort
        eyebrow="Tjenester og åpningstid"
        action={
          <Link href="/admin/services" className="v2-focus" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut }}>
              Rediger
            </span>
          </Link>
        }
      >
        {data.tjenester.map((t, i) => (
          <Rad
            key={t.id}
            title={`${t.navn} · ${t.varighetMin} min`}
            meta={<span style={{ fontFamily: T.mono, fontSize: 12, color: T.fg }}>{t.prisLabel}</span>}
            trailing={null}
            last={i === data.tjenester.length - 1}
          />
        ))}
      </Kort>
    ) : null;

  const primaerCta = (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <Eksporter heat={data.heat} ukeNr={data.ukeNr} />
    </div>
  );

  const valgtBooking = valgtId ? (data.bookinger.find((b) => b.id === valgtId) ?? null) : null;

  return (
    <MasterDetalj
      data-paper-wave-h="bookinger"
      data-paper-pattern
      panel={
        valgtBooking ? (
          <BookingInspektor b={valgtBooking} />
        ) : (
          <InspektorTom
            tittel="Ingen booking valgt"
            tekst="Velg en rad i lista, så ser og avgjør du bookingen her."
          />
        )
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap, minWidth: 0 }}>
      {hode}
      {kpi}
      {heatmap}
      {faner}

      {filtrert.length === 0 ? (
        <Kort>
          {data.bookinger.length === 0 ? (
            <TomTilstand
              icon="calendar"
              title="Ingen bookinger denne uka"
              sub={
                data.kpis.foresporsler > 0
                  ? `${pl(data.kpis.foresporsler, "forespørsel venter", "forespørsler venter")} fortsatt på svar. Behandler du dem, fyller de ukas ledige luker.`
                  : "Opprett første booking, eller sjekk kapasiteten når anlegg er aktive."
              }
            />
          ) : (
            <TomTilstand icon="calendar" title="Ingen bookinger for dette anlegget" sub="Velg en annen anleggsfane, eller se alle anlegg." />
          )}
        </Kort>
      ) : (
        <>
          <div className="hidden md:block">{tabell}</div>
          <div className="md:hidden">{kortliste}</div>
        </>
      )}

      {tjenesterKort}
      {primaerCta}
      </div>
    </MasterDetalj>
  );
}
