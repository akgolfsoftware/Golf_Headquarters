"use client";

/**
 * AgencyOS Triage / Innboks — v2 (retning C «Presis»). 1:1 med mockup-fasit
 * ui_kits/v2/agencyos.jsx → Triage + TriageGruppe, men drevet av EKTE data fra
 * loadDailyBrief (Prisma) — samme loader som cockpiten. Bygget utelukkende av
 * v2-komponentbiblioteket (src/components/v2). Ingen ad-hoc UI, ingen rå hex.
 *
 * «Trenger deg»-køen gruppert etter hastegrad:
 *   Avvik    (sterk)  ← focus-spillere med signal-tone alert/warn (frafall/belastning)
 *   Venter   (medium) ← innboks type «appr» (ventende godkjenninger)
 *   Spørsmål (lav)    ← innboks type «req/msg/advice» (forespørsler + meldinger)
 * Anbefaling, aldri sperre: du bestemmer alltid selv.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  AvatarInit,
  SevChip,
  CTAPill,
  Knapp,
  InnsiktChip,
  TomTilstand,
  type SevKey,
} from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import type {
  CockpitData,
  CockpitFocusPlayer,
} from "@/components/admin/cockpit/agency-cockpit";
import type { AppFeedbackRad, AppFeedbackType } from "@/lib/admin/load-app-feedback";
import type { KoTelling } from "@/lib/admin/ko-telling";
import { markerAppFeedbackSett } from "@/app/admin/innboks/actions";

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

type Sak = {
  id: string;
  name: string;
  text: string;
  meta?: string;
  handling: string;
  href?: string;
};

type Gruppe = { key: string; label: string; sev: SevKey; saker: Sak[] };

function reasonText(reason: CockpitFocusPlayer["reason"]): string {
  return reason.map((r) => r.text).join("");
}

/** Bygg de tre køene fra CockpitData. Ingen fabrikering — kun det loaderen gir. */
function byggGrupper(data: CockpitData): Gruppe[] {
  // Avvik: spillere loaderen har flagget som frafall/over belastning.
  const avvik: Sak[] = data.focus
    .filter((f) => f.signal.tone === "alert" || f.signal.tone === "warn")
    .map((f) => {
      // Knappeteksten MÅ komme fra samme handling som lenken peker til —
      // ellers viser raden f.eks. "Ring" men trykk går til meldinger
      // (I8 lag 2-funn: primary/nav valgte forskjellige actions).
      const nav = f.actions.find((a) => a.href);
      const handling = nav ?? f.actions.find((a) => a.primary) ?? f.actions[0];
      return {
        id: f.id,
        name: f.name,
        text: reasonText(f.reason),
        meta: f.signal.label,
        handling: handling?.label ?? "Se",
        href: nav?.href,
      };
    });

  // Venter: ventende godkjenninger (PlanAction PENDING → innboks «appr»).
  const venter: Sak[] = data.inbox
    .filter((i) => i.type === "appr")
    .map((i) => ({
      id: i.id,
      name: i.name,
      text: i.preview,
      meta: i.typeLabel,
      handling: "Godkjenn",
      href: i.href,
    }));

  // Spørsmål: forespørsler + meldinger/råd.
  const spm: Sak[] = data.inbox
    .filter((i) => i.type !== "appr")
    .map((i) => ({
      id: i.id,
      name: i.name,
      text: i.preview,
      meta: i.typeLabel,
      handling: i.type === "req" ? "Svar" : "Se",
      href: i.href,
    }));

  const alle: Gruppe[] = [
    { key: "avvik", label: "Avvik", sev: "sterk", saker: avvik },
    { key: "venter", label: "Venter", sev: "medium", saker: venter },
    { key: "spm", label: "Spørsmål", sev: "lav", saker: spm },
  ];
  return alle.filter((g) => g.saker.length > 0);
}

const FEEDBACK_TYPE_INFO: Record<AppFeedbackType, { navn: string; ikon: string }> = {
  bug: { navn: "Bug", ikon: "bug" },
  forslag: { navn: "Forslag", ikon: "lightbulb" },
  ros: { navn: "Ros", ikon: "heart" },
  sporsmal: { navn: "Spørsmål", ikon: "help-circle" },
  SUPPORT: { navn: "Support", ikon: "message-square" },
};

/** Tilbakemeldinger + support-henvendelser fra AppFeedback — nyeste først. */
function TilbakemeldingerKort({ rader }: { rader: AppFeedbackRad[] }) {
  const router = useRouter();
  const [sett, setSett] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const antallNye = rader.filter((r) => r.status === "NY" && !sett.has(r.id)).length;

  return (
    <Kort
      eyebrow="Tilbakemeldinger"
      action={antallNye > 0 ? <Caps size={9} color={T.warn}>{pl(antallNye, "ny", "nye")}</Caps> : undefined}
    >
      {rader.length === 0 ? (
        <TomTilstand icon="message-square" title="Ingen tilbakemeldinger" sub="Ingen spillere har sendt inn noe ennå." />
      ) : (
        rader.map((r, i) => {
          const erNy = r.status === "NY" && !sett.has(r.id);
          const info = FEEDBACK_TYPE_INFO[r.type] ?? FEEDBACK_TYPE_INFO.sporsmal;
          return (
            <Rad
              key={r.id}
              leading={<AvatarInit navn={r.spillerNavn} size={30} />}
              title={r.spillerNavn}
              sub={r.tekst}
              meta={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span
                    className="hidden md:inline-flex"
                    style={{ alignItems: "center", gap: 4, fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.mut }}
                  >
                    {info.navn} · {r.when}
                  </span>
                  <Caps size={9} color={erNy ? T.warn : T.mut}>{erNy ? "Ny" : "Sett"}</Caps>
                  {erNy && (
                    <Knapp
                      icon="check"
                      ghost
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          setSett((prev) => new Set(prev).add(r.id));
                          await markerAppFeedbackSett(r.id);
                          router.refresh();
                        })
                      }
                    >
                      Sett
                    </Knapp>
                  )}
                </span>
              }
              trailing={null}
              last={i === rader.length - 1}
            />
          );
        })
      )}
    </Kort>
  );
}

function TriageGruppe({ g, onOpen }: { g: Gruppe; onOpen: (href: string) => void }) {
  return (
    <Kort eyebrow={g.label} action={<SevChip s={g.sev} />}>
      {g.saker.map((s, i) => {
        const href = s.href;
        return (
          <Rad
            key={s.id}
            onClick={href ? () => onOpen(href) : undefined}
            leading={<AvatarInit navn={s.name} size={30} />}
            title={s.name}
            sub={s.text}
            meta={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                {s.meta && (
                  <span
                    className="hidden md:inline"
                    style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}
                  >
                    {s.meta}
                  </span>
                )}
                <CTAPill ghost>{s.handling}</CTAPill>
              </span>
            }
            trailing={null}
            last={i === g.saker.length - 1}
          />
        );
      })}
    </Kort>
  );
}

export function TriageV2({ data, feedback = [], ko }: { data: CockpitData; feedback?: AppFeedbackRad[]; ko?: KoTelling }) {
  const router = useRouter();
  const grupper = byggGrupper(data);

  const totalSaker = grupper.reduce((n, g) => n + g.saker.length, 0);
  const avvikCount = grupper.find((g) => g.key === "avvik")?.saker.length ?? 0;
  // Kanonisk kø-telling (samme tall som godkjenninger-hodet og varsler-siden).
  const godkjenningsKo = ko?.totalt ?? 0;

  // ── Hode ────────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>
          {pl(totalSaker, "sak", "saker")} · {pl(avvikCount, "avvik", "avvik")} · AgencyOS
        </Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel>Innboks</Tittel>
        </div>
      </div>
      <div className="hidden md:block">
        <Caps size={9}>Anbefalinger — du bestemmer alltid selv</Caps>
      </div>
    </div>
  );

  // ── AI-innsikt (ærlig, avledet av reelle tall — ingen oppdiktet plan) ──
  // Banneret bærer kanonisk godkjenningskø-tall og lenker til godkjenninger
  // (aldri til innboksen selv — vi er allerede her).
  const innsiktTekst =
    godkjenningsKo > 0
      ? `${pl(godkjenningsKo, "sak venter", "saker venter")} på godkjenning${
          avvikCount > 0 ? ` — ${pl(avvikCount, "avvik", "avvik")} bør ses først.` : "."
        }`
      : totalSaker > 0
        ? `${pl(totalSaker, "sak venter", "saker venter")} på deg${
            avvikCount > 0 ? ` — ${pl(avvikCount, "avvik", "avvik")} bør ses først.` : "."
          }`
        : "Innboksen er tom — ingenting venter på deg akkurat nå.";
  const innsikt = (
    <Link href="/admin/godkjenninger" style={{ textDecoration: "none" }}>
      <InnsiktChip cta="Åpne godkjenninger">{innsiktTekst}</InnsiktChip>
    </Link>
  );

  if (grupper.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        {godkjenningsKo > 0 && innsikt}
        <Kort>
          <TomTilstand
            icon="inbox"
            title="Innboksen er tom"
            sub="Ingen saker trenger deg akkurat nå."
          />
        </Kort>
        <TilbakemeldingerKort rader={feedback} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      <div
        className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]"
        style={{ gap: T.gap, alignItems: "start" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          {grupper.map((g) => (
            <TriageGruppe key={g.key} g={g} onOpen={(href) => router.push(href)} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          {innsikt}
          <TilbakemeldingerKort rader={feedback} />
        </div>
      </div>
    </div>
  );
}
