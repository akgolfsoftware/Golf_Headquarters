"use client";

/**
 * AgencyOS Triage / Innboks — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Mørk AgencyOS. Kø: Avvik · Venter · Spørsmål.
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
  KpiFlis,
  StatusPill,
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
  const avvik: Sak[] = data.focus
    .filter((f) => f.signal.tone === "alert" || f.signal.tone === "warn")
    .map((f) => {
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
  const godkjenningsKo = ko?.totalt ?? 0;

  // B: primær handling — godkjenninger hvis kø, ellers første avvik, ellers stall
  const forsteAvvik = grupper.find((g) => g.key === "avvik")?.saker[0];
  const primaerHref =
    godkjenningsKo > 0
      ? "/admin/godkjenninger"
      : forsteAvvik?.href
        ? forsteAvvik.href
        : totalSaker > 0
          ? grupper[0]?.saker[0]?.href ?? "/admin/godkjenninger"
          : "/admin/agencyos";
  const primaerTekst =
    godkjenningsKo > 0
      ? `Behandle ${pl(godkjenningsKo, "godkjenning", "godkjenninger")}`
      : forsteAvvik
        ? `Følg opp ${forsteAvvik.name.split(" ")[0]}`
        : totalSaker > 0
          ? "Åpne første sak"
          : "Til stall";

  const statusTone =
    avvikCount > 0 ? "down" : godkjenningsKo > 0 || totalSaker > 0 ? "warn" : "up";
  const statusTekst =
    avvikCount > 0
      ? `${pl(avvikCount, "avvik", "avvik")}`
      : godkjenningsKo > 0
        ? `${pl(godkjenningsKo, "venter", "venter")}`
        : totalSaker > 0
          ? `${pl(totalSaker, "sak", "saker")}`
          : "Tom";

  // ── Hode — B: status ──────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>AgencyOS · Innboks</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel>Innboks</Tittel>
        </div>
      </div>
      <StatusPill tone={statusTone}>{statusTekst}</StatusPill>
    </div>
  );

  // ── B: én primær CTA ──────────────────────────────────────────
  const primaerCta = (
    <Link href={primaerHref} style={{ textDecoration: "none", display: "block" }}>
      <CTAPill icon={godkjenningsKo > 0 || totalSaker > 0 ? "arrow-right" : "users"} full>
        {primaerTekst}
      </CTAPill>
    </Link>
  );

  // ── KPI ───────────────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-3" style={{ gap: T.gap }}>
      <KpiFlis label="Saker" value={totalSaker} />
      <KpiFlis label="Avvik" value={avvikCount} varsle={avvikCount > 0} />
      <KpiFlis label="Godkjenninger" value={godkjenningsKo} varsle={godkjenningsKo > 0} />
    </div>
  );

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

  if (grupper.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        {kpi}
        <Kort>
          <TomTilstand
            icon="inbox"
            title="Innboksen er tom"
            sub="Ingen saker trenger deg akkurat nå."
          />
        </Kort>
        {godkjenningsKo > 0 ? primaerCta : (
          <Link href="/admin/agencyos" style={{ textDecoration: "none", display: "block" }}>
            <CTAPill icon="users" full>
              Til stall
            </CTAPill>
          </Link>
        )}
        <TilbakemeldingerKort rader={feedback} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {primaerCta}
      {kpi}
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
          <InnsiktChip cta="Åpne godkjenninger" href="/admin/godkjenninger">
            {innsiktTekst}
          </InnsiktChip>
          <TilbakemeldingerKort rader={feedback} />
        </div>
      </div>
    </div>
  );
}
