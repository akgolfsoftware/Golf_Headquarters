/**
 * AG-TP-02 Før og nå per posisjon i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-TP.jsx › AGTP02, tp-parts.jsx › BeforeAfter).
 *
 * Tegningen trenger to daterte bilder per oppgave. Basen har ett bilde og én
 * video per oppgave (PositionTask.bildeUrl, videoUrl) og ingen dato på bildet:
 * det bildet som finnes vises som «Nå» uten dato, «Før» er tom. Opplasting,
 * delelinje og notat fra coach venter på tillegget i datamodellen.
 */
import Link from "next/link";
import { ArrowLeft, CircleAlert, ImageOff } from "lucide-react";
import { FeilTilstand, KnappLenke, LasterTilstand, Meta, TomTilstand } from "@/components/precision/pa";
import { SideHode } from "@/components/precision/pa-a4";
import { Seksjon } from "@/components/precision/pa-spiller360";

export type ForOgNaaOppgave = { id: string; p: string; posisjon: string; tittel: string; bildeUrl: string | null; videoUrl: string | null };

function Ramme({ hva, url, tittel }: { hva: string; url: string | null; tittel: string }) {
  return (
    <div className="a8-bilde">
      <Meta>{`${hva} · ${url ? "DATO —" : "—"}`}</Meta>
      <div className="a8-bilde__ramme">
        {url
          // eslint-disable-next-line @next/next/no-img-element -- bildet ligger i Supabase Storage eller ekstern lenke, ikke i next/image-oppsettet
          ? <img src={url} alt={`${hva}: ${tittel}`} />
          : <span className="a8-dempet">Ingen bilde registrert</span>}
      </div>
    </div>
  );
}

export function AGTP02ForOgNaa({ tilstand, spiller, planId, oppgaver, valgtId }: {
  tilstand: "data" | "tom" | "laster" | "feil";
  spiller: { id: string; navn: string };
  planId: string;
  oppgaver: ForOgNaaOppgave[];
  valgtId: string | null;
}) {
  const t = oppgaver.find((o) => o.id === valgtId) ?? oppgaver[0] ?? null;
  const tilbake = `/admin/spillere/${spiller.id}/plan/${planId}`;
  return (
    <div className="a8-side" style={{ maxWidth: 1100 }}>
      <SideHode
        kicker={`Teknisk plan · ${spiller.navn} · Før og nå`}
        title={t ? `Før og nå · ${t.p} ${t.posisjon}` : "Før og nå"}
        sub="To daterte bilder av samme posisjon. Ingen referansefigur og ingen vinkler som ikke er målt."
        actions={<KnappLenke variant="secondary" icon={ArrowLeft} iconName="arrow-left" href={tilbake}>Teknisk plan</KnappLenke>}
      />
      {tilstand === "laster" ? <LasterTilstand text="Henter bildene …" />
        : tilstand === "feil" ? <FeilTilstand icon={CircleAlert} title="Bildene kunne ikke hentes" text="Ingen bilder er slettet. Prøv igjen." code="FEIL · MEDIA" />
        : tilstand === "tom" || !t ? <TomTilstand icon={ImageOff} title="Ingen oppgaver i planen" text="Legg til en oppgave i teknisk plan. Bildet av posisjonen hører til oppgaven." />
        : <>
          <nav aria-label="Oppgave" className="a8-faner">
            {oppgaver.map((o) => <Link key={o.id} href={`?oppgave=${o.id}`} className="pa-choice a8-valg" aria-current={o.id === t.id ? "page" : undefined} aria-pressed={o.id === t.id}>{`${o.p} · ${o.tittel}`}</Link>)}
          </nav>
          <Seksjon k={t.tittel} meta={`FØR — · NÅ ${t.bildeUrl ? "DATO —" : "—"}`} gap={12}>
            <div className="a8-bilder" style={{ maxWidth: 720 }}>
              <Ramme hva="FØR" url={null} tittel={t.tittel} />
              <Ramme hva="NÅ" url={t.bildeUrl} tittel={t.tittel} />
            </div>
            <Meta>FØR OG NÅ KREVER TO DATERTE BILDER · OPPLASTING OG DELELINJE KOMMER MED TILLEGGET I DATAMODELLEN</Meta>
            {t.videoUrl && <div><KnappLenke size="sm" variant="ghost" href={t.videoUrl}>Åpne video</KnappLenke></div>}
            <Meta>INGEN NOTAT FRA COACH</Meta>
          </Seksjon>
        </>}
    </div>
  );
}
