import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { hentGruppeDokumenter, hentViewerRolleIGruppe } from "@/lib/domain/tn-post";
import { TN_DOKUMENT_KATEGORIER } from "@/lib/domain/tn-post-regler";
import { MAX_FILE_SIZES, STORAGE_BUCKETS } from "@/lib/storage/buckets";
import { TN } from "@/lib/v2/team-norway";
import { TnShell } from "../tn-shell";
import { TnFilterknapper, TnSkjermhode } from "../tn-flate";
import { TnDokumentSkjema } from "../tn-gruppe-klient";
import { TnSlettDokument } from "../tn-redigering-skjema";
import { datoLang, hentSkjermbruker } from "./felles";

/**
 * TN-14 Dokumenter. Gruppens filer samlet på ett sted.
 * Fasit: docs/design-system/utkast-tn/gruppe.html, skjermene Dokumenter og Last opp (pakke 6).
 *
 * Avvik:
 *   - Vedlegg i innlegg har ingen kategori. De vises under Alle, merket «Fra innlegg».
 *   - Filtypene er de lagringen godtar: PDF, XLSX, JPG, PNG og WEBP, maks 50 MB.
 *     DOCX godtas ikke.
 *   - Trenere ser i tillegg hvor mange i gruppen som har åpnet filen.
 *   - Den som lastet opp og trenere kan slette et dokument (Anders 27.09.2026).
 */

function filtype(navn: string) {
  const deler = navn.split(".");
  return deler.length > 1 ? deler.pop()!.toUpperCase() : "FIL";
}

function storrelse(bytes: number | null) {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} kB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("nb-NO", { maximumFractionDigits: 1 })} MB`;
}

export async function TnDokumenterSkjerm({ groupId, sokeparametre }: { groupId: string; sokeparametre: Record<string, string | string[] | undefined> }) {
  const bruker = await hentSkjermbruker();
  const [gruppe, rolle] = await Promise.all([
    prisma.group.findUnique({ where: { id: groupId }, select: { name: true } }),
    hentViewerRolleIGruppe(groupId, bruker.id),
  ]);
  if (!gruppe || !rolle) notFound();
  const dokumenter = await hentGruppeDokumenter(groupId, bruker.id);
  if (!dokumenter) notFound();

  const erTrener = rolle === "TRENER";
  const harTrenertilgang = erTrener || bruker.role === "ADMIN";
  const kategoriParam = Array.isArray(sokeparametre.kategori) ? sokeparametre.kategori[0] : sokeparametre.kategori;
  const kategori = TN_DOKUMENT_KATEGORIER.find((k) => k.toLowerCase() === kategoriParam) ?? null;
  const liste = dokumenter.filter((d) => !kategori || d.kategori === kategori);
  const base = `/team-norway/${groupId}/dokumenter`;
  const maksMb = Math.round(MAX_FILE_SIZES[STORAGE_BUCKETS.TN_POST_VEDLEGG] / (1024 * 1024));

  return (
    <TnShell aktiv="dokumenter" brukerNavn={bruker.name ?? "Ukjent"} rolle={erTrener ? "Trener" : rolle === "SPILLER" ? "Spiller" : "Foresatt"} groupId={groupId} visTrenerflater={harTrenertilgang} kanAdministrere={harTrenertilgang}>
      <TnSkjermhode overlinje={gruppe.name} tittel="Dokumenter" ingress={`Program, planer og avtaler for gruppa.${erTrener ? " Du ser hvor mange som har åpnet hvert dokument." : ""}`} />

      {erTrener ? <TnDokumentSkjema groupId={groupId} maksMb={maksMb} kategorier={[...TN_DOKUMENT_KATEGORIER]} /> : null}

      <TnFilterknapper
        etikett="Filtrer dokumenter"
        valg={[
          { href: base, label: "Alle", aktiv: kategori === null, antall: dokumenter.length },
          ...TN_DOKUMENT_KATEGORIER.map((k) => ({ href: `${base}?kategori=${k.toLowerCase()}`, label: k, aktiv: kategori === k, antall: dokumenter.filter((d) => d.kategori === k).length })),
        ]}
      />

      <section aria-label="Dokumenter" style={{ background: TN.white, border: `1px solid ${TN.ink200}`, borderRadius: TN.radius.sm, minWidth: 0 }}>
        {liste.map((d) => (
          <div key={d.attachmentId} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "8px 20px", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${TN.ink200}` }}>
            <a href={`/api/team-norway/vedlegg/${encodeURIComponent(d.attachmentId)}`} style={{ flex: "1 1 260px", minWidth: 0, minHeight: 44, display: "flex", gap: 12, alignItems: "center", color: TN.textPrimary, textDecoration: "none" }}>
              <span aria-hidden="true" style={{ width: 40, height: 40, flex: "none", background: TN.navy100, color: TN.navy900, fontFamily: TN.font.mono, fontWeight: 500, fontSize: 10.5, letterSpacing: "0.08em", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {filtype(d.fileName).slice(0, 4)}
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, overflowWrap: "anywhere" }}>{d.fileName}</span>
                <span style={{ display: "block", fontSize: 13, color: TN.textSecondary, marginTop: 2 }}>{d.kategori ?? (d.kilde === "LASTET_OPP" ? "Uten kategori" : "Fra innlegg")}</span>
              </span>
            </a>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", alignItems: "baseline", fontFamily: TN.font.mono, fontSize: 12, color: TN.textSecondary, minWidth: 0 }}>
                            <span>{datoLang(d.oppdatert)}</span>
              <span style={{ fontFamily: TN.font.body, fontSize: 13, overflowWrap: "anywhere" }}>{d.opplasterNavn}</span>
              <span>{storrelse(d.fileSize)}</span>
              {erTrener ? <span>{d.kvittering.apnet}/{d.kvittering.totalt} åpnet</span> : null}
              {harTrenertilgang || d.opplasterId === bruker.id ? <TnSlettDokument id={d.attachmentId} navn={d.fileName} /> : null}
            </div>
          </div>
        ))}
        {liste.length === 0 ? (
          <div style={{ padding: "16px 18px 18px" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TN.ink900 }}>{dokumenter.length === 0 ? "Ingen dokumenter" : "Ingen treff"}</div>
            <p style={{ fontSize: 14.5, lineHeight: 1.55, color: TN.ink700, margin: "8px 0 0", maxWidth: "60ch" }}>
              {dokumenter.length > 0
                ? "Ingen dokumenter i denne kategorien."
                : erTrener
                  ? "Last opp sesongplan, uttakskriterier og reiseinfo, så finner spillerne alt på ett sted."
                  : "Trenerteamet har ikke delt noen dokumenter ennå."}
            </p>
          </div>
        ) : null}
      </section>
    </TnShell>
  );
}
