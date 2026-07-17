"use client";

/**
 * M2 — mobil-Workbench, RETNING A (oppgavedrevet kø). Godkjent 2026-07-17.
 *
 * Workbench på 390-flaten er IKKE krympede desktop-paneler: de hastende
 * jobbene kommer som en kø av handlinger med ett-trykks svar. Grunnen (hva
 * coachen skal ta stilling til) er viktigst; anbefalinger sperrer aldri.
 * Full ukeplanlegging henvises til desktop-Workbench.
 *
 * Datakontrakt: `loadWorkbenchOppgaver` (src/lib/agencyos/workbench-oppgaver.ts).
 * Handlinger kaller de SAMME server-actionene som desktop-godkjenningskøen —
 * ekte, ikke demo:
 *   - godkjenn   → acceptPlanAction / rejectPlanAction
 *   - foresporsel → markerSomPlanlagt / avslaaForespørsel
 * Design-fasit: ui_kits/v2/agencyos-wb-mobil-retninger.jsx (RetningA).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/v2/tokens";
import {
  Caps,
  Tittel,
  Kort,
  TallHero,
  CTAPill,
  AvatarInit,
  SevChip,
  TomTilstand,
  Icon,
} from "@/components/v2";
import { acceptPlanAction, rejectPlanAction } from "@/lib/agents/actions";
import {
  markerSomPlanlagt,
  avslaaForespørsel,
} from "@/app/admin/(legacy)/foresporsler/actions";
import type {
  WorkbenchOppgave,
  WorkbenchOppgaverData,
} from "@/lib/agencyos/workbench-oppgaver";

/* Desktop-henvisning: full ukeplanlegging bor på desktop (flate-skille-regelen). */
function DesktopHenvisning({ onKlikk }: { onKlikk: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onKlikk}
      className="v2-row-h v2-focus"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 12,
        border: `1px dashed ${T.borderS}`,
        cursor: "pointer",
      }}
    >
      <Icon name="monitor" size={15} style={{ color: T.mut }} />
      <span style={{ flex: 1, fontFamily: T.ui, fontSize: 12, color: T.fg2 }}>
        Full ukeplanlegging gjør du i Workbench på desktop
      </span>
      <Icon name="chevron-right" size={13} style={{ color: T.mut }} />
    </div>
  );
}

function OppgaveKort({
  o,
  travelt,
  onHandling,
}: {
  o: WorkbenchOppgave;
  travelt: boolean;
  onHandling: (o: WorkbenchOppgave, handling: "primær" | "sekundær") => void;
}) {
  const primærLabel = o.kind === "godkjenn" ? "Godkjenn" : "Marker planlagt";
  const sekundærLabel = o.kind === "godkjenn" ? "Avvis" : "Avslå";
  return (
    <Kort pad="14px 16px">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <AvatarInit navn={o.spillerNavn} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>
            {o.spillerNavn}
          </div>
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 9,
              color: T.mut,
              display: "block",
              marginTop: 2,
            }}
          >
            {o.tittel} · {o.alder} siden
          </span>
        </div>
        <SevChip s={o.kind === "godkjenn" ? "medium" : "lav"} />
      </div>
      <p
        style={{
          fontFamily: T.ui,
          fontSize: 12.5,
          color: T.fg2,
          lineHeight: 1.5,
          margin: "10px 0 0",
        }}
      >
        {o.beskrivelse}
      </p>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 12, opacity: travelt ? 0.5 : 1 }}>
        <span onClick={() => !travelt && onHandling(o, "primær")} style={{ display: "inline-flex" }}>
          <CTAPill icon="check">{primærLabel}</CTAPill>
        </span>
        <span onClick={() => !travelt && onHandling(o, "sekundær")} style={{ display: "inline-flex" }}>
          <CTAPill ghost>{sekundærLabel}</CTAPill>
        </span>
      </div>
    </Kort>
  );
}

export function WorkbenchMobilV2({ data }: { data: WorkbenchOppgaverData }) {
  const router = useRouter();
  const [travelt, start] = useTransition();
  const [notis, setNotis] = useState<string | null>(null);
  // Optimistisk skjuling: en behandlet sak forsvinner umiddelbart fra køen.
  const [skjulte, setSkjulte] = useState<string[]>([]);

  const køen = data.oppgaver.filter((o) => !skjulte.includes(o.id));

  const handling = (o: WorkbenchOppgave, valg: "primær" | "sekundær") => {
    start(async () => {
      try {
        if (o.kind === "godkjenn") {
          if (valg === "primær") await acceptPlanAction(o.refId);
          else await rejectPlanAction(o.refId);
        } else {
          if (valg === "primær") await markerSomPlanlagt(o.refId);
          else await avslaaForespørsel(o.refId);
        }
        setSkjulte((v) => v.concat(o.id));
        const fornavn = o.spillerNavn.split(" ")[0];
        setNotis(
          o.kind === "godkjenn"
            ? valg === "primær"
              ? `Forslaget for ${fornavn} er godkjent og lagt inn i planen.`
              : `Forslaget for ${fornavn} er avvist — ${fornavn} ser ingen sperre.`
            : valg === "primær"
              ? `Øktforespørselen fra ${fornavn} er markert som planlagt.`
              : `Øktforespørselen fra ${fornavn} er avslått.`,
        );
        router.refresh();
      } catch {
        setNotis("Kunne ikke fullføre handlingen — prøv igjen. Ingenting er endret.");
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Tittel mobile em="å gjøre.">
          Workbench —
        </Tittel>
        <div style={{ marginTop: 12 }}>
          <TallHero
            label="Oppgaver i køen"
            value={String(køen.length)}
            size={44}
            sub="Godkjenne forslag · svare på øktforespørsler — full planlegging venter på desktop"
          />
        </div>
      </div>

      {notis && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: T.panel3,
            border: `1px solid ${T.borderS}`,
            borderRadius: 12,
            padding: "9px 12px",
          }}
        >
          <Icon name="info" size={12} style={{ color: T.fg2, flex: "none" }} />
          <span style={{ flex: 1, fontFamily: T.ui, fontSize: 11.5, color: T.fg2 }}>{notis}</span>
          <span
            role="button"
            tabIndex={0}
            aria-label="Lukk"
            className="v2-focus"
            onClick={() => setNotis(null)}
            style={{ cursor: "pointer", display: "inline-flex" }}
          >
            <Icon name="x" size={11} style={{ color: T.mut }} />
          </span>
        </div>
      )}

      {køen.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="circle-check"
            title="Køen er tom"
            sub="Alt som kan håndteres mobilt er håndtert. Full ukeplanlegging gjør du i Workbench på desktop."
          />
        </Kort>
      ) : (
        køen.map((o) => (
          <OppgaveKort key={o.id} o={o} travelt={travelt} onHandling={handling} />
        ))
      )}

      <DesktopHenvisning
        onKlikk={() =>
          setNotis(
            "Full ukeplanlegging — dra-og-slipp, mål-spor og periodisering — gjør du i Workbench på desktop. Mobilen dekker godkjenning og øktsvar.",
          )
        }
      />
    </div>
  );
}
