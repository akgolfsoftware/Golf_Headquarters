"use client";

/**
 * Stall · dag — AgencyOS (natt-plan bølge 2, Loop 6 / C2).
 *
 * Fasit: `A-10 Mac Stall dag.dc.html` (spillere som kolonner, X-akse =
 * person for én dag), `WB-09 Gruppe og stall.dc.html`, `AG-04 Stall.dc.html`.
 *
 * Omfang (natt-plan): spillere som kolonner, UTKAST synlig per celle, én
 * handling — «Åpne uke» sender coachen inn i den ekte Workbench-uka
 * (`/admin/workbench/[playerId]`). Ingen redigering her, ingen
 * GROUP-propagering, ingen kalender-lag (skole/TURN/test/booking hører til
 * Loop 7 / C3) — kun lesing av eksisterende `WorkbenchSession`-rader.
 *
 * Gjenbruker samme `TimeGrid`-motor som `WeekGrid` (Loop 2), men med
 * kolonner = spillere i stedet for dager. Nå-linjen er slått av: motoren
 * støtter kun én uthevet kolonne (dagens dato), og alle kolonner her deler
 * samme dato — en fullbredde nå-linje er utenfor omfanget til denne loopen.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TimeGrid, timeGridBlockStyle, type TimeGridDay } from "@/components/v2/time-grid";
import { Icon } from "@/components/v2/icon";
import { Knapp, TomTilstand } from "@/components/v2/core";
import { T } from "@/lib/v2/tokens";
import { TL } from "@/lib/v2/train-lock";
import { addDays, mondayOf } from "@/lib/domain/workbench/operations";
import { formatTime, UI } from "@/lib/domain/workbench/labels";
import type { StallDagSpiller, StallDagViewModel } from "@/lib/domain/workbench/stall-dag";
import { harHake, STATUS_CAPS, WARM } from "./wb-visuelt";

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

function initialer(navn: string): string {
  return navn
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

function fornavn(navn: string): string {
  return navn.split(" ")[0] ?? navn;
}

/** ISO-dato ("YYYY-MM-DD") → «Lør 22. aug». UTC-parsing (jf. datomatte-gotcha). */
function formaterDato(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dato = new Date(Date.UTC(y, m - 1, d));
  const ukedag = new Intl.DateTimeFormat("nb-NO", { weekday: "short", timeZone: "UTC" }).format(dato);
  const dagMnd = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", timeZone: "UTC" }).format(
    dato,
  );
  return `${ukedag[0]?.toUpperCase()}${ukedag.slice(1)} ${dagMnd}`;
}

function workbenchHref(playerId: string, dato: string): string {
  return `/admin/workbench/${playerId}?uke=${mondayOf(dato)}`;
}

type Props = {
  dato: string;
  data: StallDagViewModel;
  /** true = valgt dato er i dag (Oslo) — styrer «I dag»-knappen i topplinjen. */
  erIdag: boolean;
};

export function StallDagV2({ dato, data, erIdag }: Props) {
  const mobile = useMobile();

  return (
    <div style={{ display: "grid", gap: 16, minWidth: 0 }}>
      <Topplinje dato={dato} antallSpillere={data.spillere.length} erIdag={erIdag} />

      {data.spillere.length === 0 ? (
        <TomTilstand icon="users" title="Ingen spillere i stallen" sub="Legg til en spiller for å se dagen her." />
      ) : mobile ? (
        <MobilListe dato={dato} spillere={data.spillere} />
      ) : (
        <DesktopGrid dato={dato} spillere={data.spillere} />
      )}
    </div>
  );
}

function Topplinje({
  dato,
  antallSpillere,
  erIdag,
}: {
  dato: string;
  antallSpillere: number;
  erIdag: boolean;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, minWidth: 0 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: T.disp, fontSize: 19, fontWeight: 600, color: T.fg }}>
          Stall · {formaterDato(dato)}
        </div>
        <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, fontVariantNumeric: "tabular-nums" }}>
          {antallSpillere} {antallSpillere === 1 ? "spiller" : "spillere"}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginLeft: "auto", flexWrap: "wrap" }}>
        <Link href={`/admin/stall/dag?dato=${addDays(dato, -1)}`} prefetch={false}>
          <Knapp ghost icon="chevron-left">Forrige dag</Knapp>
        </Link>
        {!erIdag && (
          <Link href="/admin/stall/dag" prefetch={false}>
            <Knapp ghost>{UI.today}</Knapp>
          </Link>
        )}
        <Link href={`/admin/stall/dag?dato=${addDays(dato, 1)}`} prefetch={false}>
          <Knapp ghost icon="chevron-right">Neste dag</Knapp>
        </Link>
      </div>
    </div>
  );
}

/** Kompakt kort — «Åpne uke» er alltid tilgjengelig, uansett antall økter. */
function AapneUkePill({ playerId, dato, kompakt }: { playerId: string; dato: string; kompakt?: boolean }) {
  return (
    <Link
      href={workbenchHref(playerId, dato)}
      className="v2-press v2-focus"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: kompakt ? 28 : 32,
        padding: kompakt ? "0 10px" : "0 12px",
        borderRadius: TL.radius.pill,
        background: TL.dock,
        color: TL.text,
        fontSize: kompakt ? 11 : 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      Åpne uke
      <Icon name="chevron-right" size={kompakt ? 11 : 12} />
    </Link>
  );
}

function DesktopGrid({ dato, spillere }: { dato: string; spillere: StallDagSpiller[] }) {
  const dager: TimeGridDay[] = spillere.map((s) => ({
    id: s.id,
    dow: initialer(s.navn),
    date: fornavn(s.navn),
  }));

  return (
    <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
      {/* Spiller-strip: samme flex-bredder som TimeGrid-hodet (62px tidskolonne +
          N like kolonner), så pillene står rett over riktig kolonne. */}
      <div style={{ display: "flex", minWidth: 0 }}>
        <div style={{ width: 62, flex: "none" }} />
        {spillere.map((s) => (
          <div key={s.id} style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "center", padding: "0 4px" }}>
            <AapneUkePill playerId={s.id} dato={dato} kompakt />
          </div>
        ))}
      </div>

      <TimeGrid
        days={dager}
        showNowLine={false}
        renderDay={(i) => {
          const spiller = spillere[i];
          if (!spiller) return null;
          if (spiller.okter.length === 0) {
            return (
              <Link
                href={workbenchHref(spiller.id, dato)}
                aria-label={`Åpne uke for ${spiller.navn}`}
                style={{
                  position: "absolute",
                  left: 3,
                  right: 3,
                  top: 96,
                  borderRadius: TL.radius.row,
                  border: `1px dashed ${T.border}`,
                  padding: "8px 8px",
                  textAlign: "center",
                  fontFamily: T.ui,
                  fontSize: 11,
                  color: T.mut,
                }}
              >
                Ingen økt i dag
              </Link>
            );
          }
          return (
            <>
              {spiller.okter.map((o) => (
                <OktBlokk key={o.id} playerId={spiller.id} dato={dato} okt={o} />
              ))}
            </>
          );
        }}
      />
    </div>
  );
}

function OktBlokk({
  playerId,
  dato,
  okt,
}: {
  playerId: string;
  dato: string;
  okt: StallDagSpiller["okter"][number];
}) {
  const utkast = okt.erUtkast;
  const hake = harHake(okt.status);
  const slutt = okt.startMinute + okt.durationMinutes;

  return (
    <Link
      href={workbenchHref(playerId, dato)}
      title={`${okt.tittel} · ${formatTime(okt.startMinute)}–${formatTime(slutt)} · ${STATUS_CAPS[okt.status]} · Åpne uke i Workbench`}
      style={{
        ...timeGridBlockStyle(okt.startMinute, okt.durationMinutes),
        display: "block",
        textAlign: "left",
        overflow: "hidden",
        padding: "4px 7px",
        borderRadius: TL.radius.row,
        background: utkast ? "transparent" : TL.dock,
        border: utkast ? `1px solid ${TL.draftBorder}` : `1px solid ${TL.hair}`,
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontFamily: T.mono,
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: utkast ? T.mut : WARM,
        }}
      >
        {hake && <Icon name="check" size={9} style={{ color: WARM }} />}
        {STATUS_CAPS[okt.status]}
      </span>
      <span
        style={{
          display: "block",
          fontFamily: T.ui,
          fontSize: 11.5,
          fontWeight: 600,
          color: T.fg,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {okt.tittel}
      </span>
      <span style={{ display: "block", fontFamily: T.mono, fontSize: 9.5, color: T.mut, fontVariantNumeric: "tabular-nums" }}>
        {formatTime(okt.startMinute)}–{formatTime(slutt)}
      </span>
    </Link>
  );
}

function MobilListe({ dato, spillere }: { dato: string; spillere: StallDagSpiller[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {spillere.map((s) => (
        <div key={s.id} style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "14px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600, color: TL.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {s.navn}
            </div>
            <AapneUkePill playerId={s.id} dato={dato} />
          </div>

          {s.okter.length === 0 ? (
            <div style={{ marginTop: 8, fontSize: 13, color: TL.mute }}>Ingen økt i dag</div>
          ) : (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {s.okter.map((o) => {
                const utkast = o.erUtkast;
                const hake = harHake(o.status);
                const slutt = o.startMinute + o.durationMinutes;
                return (
                  <Link
                    key={o.id}
                    href={workbenchHref(s.id, dato)}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 8,
                      padding: "8px 10px",
                      borderRadius: TL.radius.row,
                      background: utkast ? "transparent" : TL.dock,
                      border: utkast ? `1px dashed ${TL.draftBorder}` : "none",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: 11,
                        color: TL.mute,
                        fontVariantNumeric: "tabular-nums",
                        flexShrink: 0,
                      }}
                    >
                      {formatTime(o.startMinute)}–{formatTime(slutt)}
                    </span>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, color: TL.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {o.tittel}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        fontFamily: T.mono,
                        fontSize: 9.5,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        color: utkast ? TL.mute : WARM,
                        flexShrink: 0,
                      }}
                    >
                      {hake && <Icon name="check" size={9} style={{ color: WARM }} />}
                      {STATUS_CAPS[o.status]}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Feil-tilstand: kort norsk forklaring + «Prøv igjen» (CLAUDE.md §Feilhåndtering). */
export function StallDagFeil({ melding }: { melding: string }) {
  const router = useRouter();
  return (
    <div
      role="alert"
      style={{
        display: "grid",
        gap: 12,
        justifyItems: "center",
        textAlign: "center",
        padding: "48px 20px",
        border: `1px solid ${T.border}`,
        borderRadius: T.rCard,
        background: T.panel,
      }}
    >
      <Icon name="triangle-alert" size={22} style={{ color: T.down }} />
      <div style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
        Kunne ikke hente dagen
      </div>
      <div style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, maxWidth: 380 }}>{melding}</div>
      <Knapp onClick={() => router.refresh()}>{UI.retry}</Knapp>
    </div>
  );
}
