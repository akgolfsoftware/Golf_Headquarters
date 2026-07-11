"use client";

/**
 * AgencyOS Bookinger & kapasitet — v2 (retning C «Presis»). Coach/ADMIN
 * håndterer ukens bookinger og ser kapasitet. Ingen mockup fantes —
 * komponert utelukkende av v2-biblioteket (src/components/v2), ingen ad-hoc
 * UI, ingen rå hex (kun T.*).
 *
 * Funksjon/data bevart 1:1 fra den ekte skjermen (src/app/admin/bookinger):
 *   - 4 KPI-er: bookinger uke · kapasitet brukt % · forespørsler · ledige luker.
 *   - Kapasitet-heatmap (timer × dag) fra ekte bookinger (VarmeKart).
 *   - Booking-liste (spiller/tid/tjeneste/anlegg/status) med inline bekreft/avvis
 *     for PENDING (server-actions bekreftBooking/avvisBooking).
 *   - Massehandlinger (bekreft/avvis alle PENDING · marker CONFIRMED fullført).
 *   - Snarvei «Ny booking» → wizard, og CSV-eksport av kapasitet.
 *   - Plan-lenke per booking der spilleren har en aktiv teknisk plan.
 *
 * Mobil: 2-kolonne (liste | heatmap) kollapser til stabel med lista først;
 * PENDING-rader viser fullbredde bekreft/avvis under raden i stedet for i meta.
 *
 * Ærlige tomrom: ingen fabrikerte tall — tom heatmap ved 0 anlegg, tom liste
 * ved 0 bookinger. Coach-filter og kalender-fane er GAP (meldes i ruten).
 */

import { Fragment, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  KpiFlis,
  StatusPill,
  CTAPill,
  Knapp,
  FilterChips,
  AvatarInit,
  VarmeKart,
  TomTilstand,
  InnsiktChip,
  Icon,
  T,
  type StatusTone,
} from "@/components/v2";
import {
  bekreftBooking,
  avvisBooking,
  bekreftAllePending,
  avvisAllePending,
  markerAlleConfirmedSomCompleted,
} from "@/app/admin/(legacy)/bookinger/actions";

// ── Datakontrakt (mappes fra Prisma i ruten) ────────────────────
export type BookingStatusKey = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface AdminBookingV2Row {
  id: string;
  navn: string;
  tid: string;
  tjeneste: string;
  anlegg: string;
  status: BookingStatusKey;
  planHref: string | null;
}
export interface AdminBookingerV2Data {
  ukeNr: number;
  lokasjon: string;
  nyHref: string;
  kpis: {
    bookinger: number;
    kapasitetPct: number;
    foresporsler: number;
    ledigeLuker: number;
  };
  heat: {
    timer: string[]; // rad-etiketter (klokketimer)
    dager: string[]; // kolonne-etiketter (Ma..Sø)
    verdier: number[][]; // 0..1 belegg per [time][dag]
  };
  anlegg: string[]; // aktive anlegg (heatmap-caption)
  bookinger: AdminBookingV2Row[];
}

const STATUS: Record<BookingStatusKey, { label: string; tone: StatusTone; filter: string }> = {
  PENDING: { label: "Forespørsel", tone: "warn", filter: "Forespørsel" },
  CONFIRMED: { label: "Bekreftet", tone: "up", filter: "Bekreftet" },
  COMPLETED: { label: "Fullført", tone: "info", filter: "Fullført" },
  CANCELLED: { label: "Avlyst", tone: "down", filter: "Avlyst" },
};

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

/** md-breakpoint-speil (matcher V2Shell/AgencyKalenderV2). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/** Inline bekreft/avvis for én PENDING-booking (server-actions + optimistisk dimming). */
function BekreftAvvis({ id, full }: { id: string; full?: boolean }) {
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
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        width: full ? "100%" : "auto",
        flex: "none",
        opacity: pending ? 0.5 : 1,
      }}
    >
      <Knapp icon="check" full={full} disabled={pending} onClick={() => kjor(bekreftBooking)}>
        Bekreft
      </Knapp>
      <Knapp ghost full={full} disabled={pending} onClick={() => kjor(avvisBooking)}>
        Avvis
      </Knapp>
      {feil && <span style={{ fontFamily: T.ui, fontSize: 11, color: T.down, alignSelf: "center" }}>Feilet — prøv igjen</span>}
    </div>
  );
}

/** Massehandlinger over hele PENDING/CONFIRMED-køen. */
function Massehandlinger({ pending, confirmed }: { pending: number; confirmed: number }) {
  const [busy, start] = useTransition();
  const [feil, setFeil] = useState(false);
  const kjor = (fn: () => Promise<unknown>) =>
    start(async () => {
      setFeil(false);
      try {
        await fn();
      } catch {
        setFeil(true);
      }
    });
  if (pending === 0 && confirmed === 0) return null;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", opacity: busy ? 0.5 : 1 }}>
      {pending > 0 && (
        <Knapp icon="check-circle" ghost disabled={busy} onClick={() => kjor(bekreftAllePending)}>
          Bekreft alle ({pending})
        </Knapp>
      )}
      {pending > 0 && (
        <Knapp icon="x-circle" ghost disabled={busy} onClick={() => kjor(avvisAllePending)}>
          Avvis alle
        </Knapp>
      )}
      {confirmed > 0 && (
        <Knapp icon="flag" ghost disabled={busy} onClick={() => kjor(markerAlleConfirmedSomCompleted)}>
          Marker fullført ({confirmed})
        </Knapp>
      )}
      {feil && <span style={{ fontFamily: T.ui, fontSize: 11, color: T.down }}>Feilet — prøv igjen</span>}
    </div>
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

/** Lenke til spillerens aktive plan (radens trailing). */
function PlanLenke({ href }: { href: string }) {
  return (
    <Link
      href={href}
      title="Se plan"
      onClick={(e) => e.stopPropagation()}
      className="v2-focus"
      style={{ textDecoration: "none", display: "inline-flex", flex: "none" }}
    >
      <Icon name="file-text" size={16} style={{ color: T.mut }} />
    </Link>
  );
}

export function AdminBookingerV2({ data }: { data: AdminBookingerV2Data }) {
  const mobile = useMobile();
  const [filtre, setFiltre] = useState<string[]>([]);

  const antallPending = useMemo(() => data.bookinger.filter((b) => b.status === "PENDING").length, [data.bookinger]);
  const antallConfirmed = useMemo(() => data.bookinger.filter((b) => b.status === "CONFIRMED").length, [data.bookinger]);

  const tilgjengeligeFiltre = useMemo(() => {
    const set = new Set(data.bookinger.map((b) => STATUS[b.status].filter));
    return (["Forespørsel", "Bekreftet", "Fullført", "Avlyst"] as const).filter((f) => set.has(f));
  }, [data.bookinger]);

  const filtrert = data.bookinger.filter(
    (b) => filtre.length === 0 || filtre.indexOf(STATUS[b.status].filter) !== -1,
  );

  const toggle = (x: string) =>
    setFiltre((prev) => (prev.indexOf(x) !== -1 ? prev.filter((y) => y !== x) : prev.concat(x)));

  // ── Hode ──────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>{`Uke ${data.ukeNr} · ${data.lokasjon} · AgencyOS`}</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="kapasitet.">Bookinger &amp;</Tittel>
        </div>
      </div>
      <div className="hidden md:flex" style={{ gap: 8 }}>
        <Eksporter heat={data.heat} ukeNr={data.ukeNr} />
        <Link href={data.nyHref} style={{ textDecoration: "none" }}>
          <CTAPill icon="plus">Ny booking</CTAPill>
        </Link>
      </div>
    </div>
  );

  // ── KPI-flis (4) ──────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
      <KpiFlis label="Bookinger uke" value={data.kpis.bookinger} />
      <KpiFlis label="Kapasitet brukt" value={`${data.kpis.kapasitetPct} %`} />
      <KpiFlis label="Forespørsler" value={data.kpis.foresporsler} varsle={data.kpis.foresporsler > 0} />
      <KpiFlis label="Ledige luker" value={data.kpis.ledigeLuker} />
    </div>
  );

  // ── Booking-liste ─────────────────────────────────────────────
  const liste = (
    <Kort
      eyebrow="Ukens bookinger"
      action={filtrert.length > 0 ? <Caps size={9}>{pl(filtrert.length, "booking", "bookinger")}</Caps> : undefined}
      pad="4px 20px"
    >
      {filtrert.length === 0 ? (
        <div style={{ padding: "16px 0" }}>
          <TomTilstand
            icon="calendar"
            title="Ingen bookinger her"
            sub={
              data.bookinger.length === 0
                ? "Ingen bookinger denne uka ennå."
                : "Ingen bookinger passer filteret akkurat nå."
            }
          />
        </div>
      ) : (
        filtrert.map((b, i) => {
          const st = STATUS[b.status];
          const visMobilHandling = mobile && b.status === "PENDING";
          const radSist = i === filtrert.length - 1 && !visMobilHandling;
          return (
            <Fragment key={b.id}>
              <Rad
                leading={<AvatarInit navn={b.navn} size={32} />}
                title={b.navn}
                sub={[b.tid, b.tjeneste, b.anlegg].filter(Boolean).join(" · ")}
                meta={
                  b.status === "PENDING" && !mobile ? (
                    <BekreftAvvis id={b.id} />
                  ) : (
                    <StatusPill tone={st.tone}>{st.label}</StatusPill>
                  )
                }
                trailing={b.planHref ? <PlanLenke href={b.planHref} /> : null}
                last={radSist}
              />
              {visMobilHandling && (
                <div
                  style={{
                    padding: "0 0 12px",
                    borderBottom: i === filtrert.length - 1 ? "none" : `1px solid ${T.border}`,
                  }}
                >
                  <BekreftAvvis id={b.id} full />
                </div>
              )}
            </Fragment>
          );
        })
      )}
    </Kort>
  );

  // ── Kapasitet-heatmap ─────────────────────────────────────────
  const heatmap = (
    <Kort eyebrow="Kapasitet · timer × dag" action={<Caps size={9} color={T.lime}>Full = lime</Caps>}>
      {data.anlegg.length === 0 ? (
        <TomTilstand icon="grid" title="Ingen aktive anlegg" sub="Legg til anlegg for å se kapasitetsbelegg." />
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <VarmeKart
              rows={data.heat.timer}
              cols={data.heat.dager}
              values={data.heat.verdier}
              cell={mobile ? 20 : 24}
              fmt={(v) => `${Math.round(v * 100)} % belegg`}
            />
          </div>
          <div style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, marginTop: 12 }}>
            Anlegg: {data.anlegg.slice(0, 4).join(" · ")}
            {data.anlegg.length > 4 ? ` +${data.anlegg.length - 4}` : ""}
          </div>
        </>
      )}
    </Kort>
  );

  // ── AI-innsikt → kø ───────────────────────────────────────────
  const innsiktTekst =
    antallPending > 0
      ? `${pl(antallPending, "forespørsel venter", "forespørsler venter")} på svar — bekreft eller avvis dem samlet.`
      : `Ingen ubehandlede forespørsler. Kapasitet brukt ${data.kpis.kapasitetPct} % denne uka.`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}

      {/* Mobil-handlinger (skjult på desktop der de ligger i hodet) */}
      <div className="flex md:hidden" style={{ gap: 8 }}>
        <Link href={data.nyHref} style={{ textDecoration: "none", flex: 1 }}>
          <Knapp icon="plus" full>
            Ny booking
          </Knapp>
        </Link>
        <Eksporter heat={data.heat} ukeNr={data.ukeNr} />
      </div>

      {kpi}

      {tilgjengeligeFiltre.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Caps size={9} style={{ width: 64, flex: "none" }}>
            Status
          </Caps>
          <FilterChips items={[...tilgjengeligeFiltre]} active={filtre} onToggle={toggle} />
        </div>
      )}

      <Massehandlinger pending={antallPending} confirmed={antallConfirmed} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr]" style={{ gap: T.gap, alignItems: "start" }}>
        {liste}
        {heatmap}
      </div>

      <InnsiktChip cta="Åpne kapasitet">{innsiktTekst}</InnsiktChip>
    </div>
  );
}
