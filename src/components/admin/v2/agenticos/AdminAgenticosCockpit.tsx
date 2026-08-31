"use client";

/**
 * AO-01 Cockpit — neste task + kø-tall. Én hvit primær (Kjør eller Godkjenn).
 */

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { TL } from "@/lib/v2/train-lock";
import { triggerAgentManually } from "@/app/admin/(legacy)/agents/actions";
import type { AgenticosCockpitData } from "@/lib/agencyos/last-agenticos";
import { AoCaps, AoFeilKort, AoKnapp, AoKort, AoTittel } from "./tl-agenticos";

export function AdminAgenticosCockpit({ data }: { data: AgenticosCockpitData }) {
  return (
    <div data-screen-label="AO-01 Cockpit" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <AoTittel>Nå</AoTittel>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{data.naTekst}</span>
      </div>

      {data.feilende[0] ? (
        <AoFeilKort
          tittel={`${data.feilende[0].navn} svarer ikke`}
          tekst="Siste kjøring feilet. Tidligere forslag står i godkjenn-køen — ingenting er rørt uten deg."
          primaer={
            <AoKnapp variant={data.neste ? undefined : "primaer"} href={data.feilende[0].detaljHref}>
              Åpne agent
            </AoKnapp>
          }
          sekundaer={<AoKnapp href="/admin/agenticos/ko">Se kø</AoKnapp>}
        />
      ) : null}

      <div className="flex flex-col min-[1101px]:flex-row" style={{ gap: 18, alignItems: "stretch" }}>
        <NesteKort data={data} />
      </div>

      <div className="flex flex-col min-[1101px]:flex-row" style={{ gap: 18 }}>
        <AoKort pad="14px 16px" radius={14} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: TL.text }}>
            {data.venterPaDeg}
          </span>
          <span style={{ fontSize: 13, color: TL.mute, lineHeight: 1.4, flex: 1 }}>
            {data.venterPaDeg === 1
              ? "venter på deg — én om gangen, ingenting skrives før du sier ja"
              : "venter på deg — én om gangen, ingenting skrives før du sier ja"}
          </span>
          <AoKnapp variant="lenke" href="/admin/agenticos/godkjenn">
            Åpne godkjenn-kø
          </AoKnapp>
        </AoKort>
        <AoKort pad="14px 16px" radius={14} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: TL.text }}>
            {data.klarCount}
          </span>
          <span style={{ fontSize: 13, color: TL.mute, flex: 1 }}>
            tasks klare i kø{data.pagarCount > 0 ? ` · ${data.pagarCount} pågår` : ""}
          </span>
          <AoKnapp variant="lenke" href="/admin/agenticos/ko">
            Åpne kø
          </AoKnapp>
        </AoKort>
        <AoKort
          pad="14px 16px"
          radius={14}
          hair
          style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }}
        >
          <span style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: TL.mute }}>
            {data.researchCount}
          </span>
          <span style={{ fontSize: 13, color: TL.mute, lineHeight: 1.4, flex: 1 }}>
            nye research-resultater · leste bare, ingen godkjenning
          </span>
          <AoKnapp variant="lenke" href="/admin/agenticos">
            Les
          </AoKnapp>
        </AoKort>
      </div>

      <p style={{ margin: 0, fontSize: 11, color: TL.mute, lineHeight: 1.6 }}>
        Agenten skriver aldri direkte til Workbench-økter. Ukesforslag kommer som utkast-task «Foreslå uke …» i
        godkjenn-køen.
      </p>
    </div>
  );
}

function NesteKort({ data }: { data: AgenticosCockpitData }) {
  const neste = data.neste;
  if (!neste) {
    return (
      <AoKort pad="20px 22px" radius={18} style={{ flex: 1.2, gap: 12 }}>
        <AoCaps>Neste task</AoCaps>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: TL.text }}>Ingen task klar</div>
        <p style={{ margin: 0, fontSize: 13, color: TL.mute, lineHeight: 1.6 }}>
          Agenten foreslår nye når det kommer data den kan jobbe med — forslagene havner i godkjenn-køen.
        </p>
        <AoKnapp variant="primaer" full href="/admin/workspace">
          Ny oppgave
        </AoKnapp>
      </AoKort>
    );
  }

  const erGodkjenn = neste.kind === "godkjenn";
  return (
    <AoKort pad="20px 22px" radius={18} style={{ flex: 1.2, gap: 12 }}>
      <AoCaps>{erGodkjenn ? "Neste task · Venter godkjenning" : "Neste task · Klar"}</AoCaps>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: TL.text, lineHeight: 1.3 }}>
          {neste.tittel}
        </div>
        <div style={{ marginTop: 6, fontSize: 13, color: TL.mute }}>{neste.meta}</div>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: TL.mute, lineHeight: 1.6 }}>{neste.beskrivelse}</p>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {erGodkjenn ? (
          <>
            <AoKnapp variant="primaer" full href={`/admin/agenticos/godkjenn?sak=${neste.id}`}>
              Godkjenn
            </AoKnapp>
            <AoKnapp href={`/admin/agenticos/godkjenn?sak=${neste.id}`}>Åpne task</AoKnapp>
          </>
        ) : neste.kanKjore ? (
          <>
            <KjorKnapp slug={neste.slug} />
            <AoKnapp href={`/admin/agents/${neste.slug}`}>Åpne task</AoKnapp>
          </>
        ) : (
          <AoKnapp variant="primaer" full href={`/admin/agents/${neste.slug}`}>
            Åpne task
          </AoKnapp>
        )}
      </div>
    </AoKort>
  );
}

function KjorKnapp({ slug }: { slug: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <AoKnapp
      variant="primaer"
      full
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await triggerAgentManually(slug);
          if (res.ok) toast.success(res.melding);
          else toast.error(res.melding);
          router.refresh();
        })
      }
    >
      {pending ? "Kjører …" : "Kjør"}
    </AoKnapp>
  );
}


