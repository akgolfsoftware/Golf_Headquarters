/**
 * Oppfølgingskø — «Oppfølging»-fanen i /admin/spillere (MASTERPLAN 15.11,
 * beslutning 6.6: `/admin/queue` er IKKE Kø, den hører i Stall).
 *
 * Visningslag flyttet 1:1 fra `admin/queue/page.tsx` (data flyttet til
 * `src/lib/admin/spillere/last-oppfolging.ts`). Kanban-boardet (drag/drop,
 * lagre-state) er uendret — `QueueBoard` er client-komponenten fra den
 * gamle ruta, gjenbrukt as-is.
 *
 * `somFane`: skjuler egen tittel/undertekst (den delte SpillereHode eier
 * H1-en når dette er en fane) — lærdom fra 15.1/15.2/15.6. CTA-ene
 * («Justere regler», «Generer AI-aksjoner») er funksjon, ikke pynt, og
 * beholdes uansett — kun flyttet til en egen rad når hodet er skjult.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { Caps, Tittel, Kort, KpiFlis, MikroMeta, CTAPill } from "@/components/v2";
import { QueueBoard, type QueueKolonne } from "@/app/admin/queue/_board";
import type { OppfolgingsKoData } from "@/lib/admin/spillere/last-oppfolging";

export function OppfolgingsKoV2({
  data,
  somFane = false,
}: {
  data: OppfolgingsKoData;
  somFane?: boolean;
}) {
  const { kolonner, totalAktive, spillereTotalt } = data;
  const risk = kolonner.find((k) => k.status === "risk")?.kort.length ?? 0;
  const watch = kolonner.find((k) => k.status === "watch")?.kort.length ?? 0;
  const check = kolonner.find((k) => k.status === "check")?.kort.length ?? 0;
  const ok = kolonner.find((k) => k.status === "ok")?.kort.length ?? 0;

  const cta = (
    <div style={{ display: "flex", gap: 8 }}>
      <Link href="/admin/oppsett" style={{ textDecoration: "none" }}>
        <CTAPill ghost icon="settings">
          Justere regler
        </CTAPill>
      </Link>
      <CTAPill ghost icon="sparkles">
        Generer AI-aksjoner
      </CTAPill>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {somFane ? (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>{cta}</div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <div>
            <Caps>AgencyOS · Oppfølgingskø</Caps>
            <div style={{ marginTop: 10 }}>
              <Tittel em="samtale">Hvem trenger en</Tittel>
            </div>
            <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, margin: "10px 0 0" }}>
              Plattformen flagger — du bestemmer.
            </p>
          </div>
          {cta}
        </div>
      )}

      {/* KPI-strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 16 }}>
        <KpiFlis label="Risiko" value={risk} delta="krever samtale < 48 t" />
        <KpiFlis label="Watch" value={watch} delta="trender feil retning" />
        <KpiFlis label="Sjekk inn" value={check} delta="lett oppdatering" />
        <KpiFlis label="Løst · 7d" value={ok} delta="markert ferdig" />
      </div>

      {/* Aktivitets-stripe */}
      <Kort pad="12px 18px">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 }}>
          <Caps>Aktivitet · siste 7d</Caps>
          <MikroMeta icon="check-circle">
            Løst <b style={{ color: TL.text }}>{ok}</b> saker
          </MikroMeta>
          <MikroMeta icon="bell">
            Flagget <b style={{ color: TL.text }}>{totalAktive}</b> aktive
          </MikroMeta>
          <span style={{ marginLeft: "auto", fontFamily: TL.font.mono, fontSize: 10, textTransform: "uppercase", color: TL.mute }}>
            Av {spillereTotalt} spillere totalt
          </span>
        </div>
      </Kort>

      {/* Board — I5: kanban med drag-and-drop (klient) */}
      <QueueBoard kolonner={kolonner as QueueKolonne[]} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${TL.hair}`, paddingTop: 16 }}>
        <span style={{ fontFamily: TL.font.mono, fontSize: 10.5, textTransform: "uppercase", color: TL.mute }}>AgencyOS · Oppfølgingskø</span>
        <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>{totalAktive} aktive saker</span>
      </div>
    </div>
  );
}
