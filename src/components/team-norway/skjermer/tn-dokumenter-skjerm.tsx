import { notFound } from "next/navigation";
import { FileText } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { hentGruppeDokumenter, hentViewerRolleIGruppe } from "@/lib/domain/tn-post";
import { MAX_FILE_SIZES, STORAGE_BUCKETS } from "@/lib/storage/buckets";
import { TN } from "@/lib/v2/team-norway";
import { TnShell } from "../tn-shell";
import { TnFilterknapper, TnSkjermhode } from "../tn-flate";
import { TnDokumentSkjema } from "../tn-gruppe-klient";
import { datoLang, hentSkjermbruker } from "./felles";

/**
 * TN-14 Dokumenter. Gruppens filer samlet på ett sted.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-14.
 *
 * Avvik:
 *   - Kategori (Sesongplan, Uttak, Reise, Test, Helse) finnes ikke på filen.
 *     Filteret skiller i stedet på kilde: lastet opp her, eller vedlegg i et innlegg.
 *   - Filtypene er de lagringen godtar: PDF, XLSX, JPG, PNG og WEBP, maks 50 MB.
 *     DOCX godtas ikke.
 *   - Trenere ser i tillegg hvor mange i gruppen som har åpnet filen.
 */

type Kilde = "LASTET_OPP" | "FRA_POST";

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
  const kildeParam = Array.isArray(sokeparametre.kilde) ? sokeparametre.kilde[0] : sokeparametre.kilde;
  const kilde: Kilde | null = kildeParam === "opplastet" ? "LASTET_OPP" : kildeParam === "innlegg" ? "FRA_POST" : null;
  const liste = dokumenter.filter((d) => !kilde || d.kilde === kilde);
  const base = `/team-norway/${groupId}/dokumenter`;
  const maksMb = Math.round(MAX_FILE_SIZES[STORAGE_BUCKETS.TN_POST_VEDLEGG] / (1024 * 1024));

  return (
    <TnShell aktiv="dokumenter" brukerNavn={bruker.name ?? "Ukjent"} rolle={erTrener ? "Trener" : rolle === "SPILLER" ? "Spiller" : "Foresatt"} groupId={groupId} visTrenerflater={harTrenertilgang} kanAdministrere={harTrenertilgang}>
      <TnSkjermhode rute={base} tittel="Dokumenter" ingress={`Sesongplan, uttakskriterier og reiseinfo for ${gruppe.name}. Alle i gruppen finner filene her.`} />

      {erTrener ? <TnDokumentSkjema groupId={groupId} maksMb={maksMb} /> : null}

      <TnFilterknapper
        etikett="Filtrer dokumenter"
        valg={[
          { href: base, label: "Alle", aktiv: kilde === null, antall: dokumenter.length },
          { href: `${base}?kilde=opplastet`, label: "Lastet opp", aktiv: kilde === "LASTET_OPP", antall: dokumenter.filter((d) => d.kilde === "LASTET_OPP").length },
          { href: `${base}?kilde=innlegg`, label: "Fra innlegg", aktiv: kilde === "FRA_POST", antall: dokumenter.filter((d) => d.kilde === "FRA_POST").length },
        ]}
      />

      <section aria-label="Dokumenter" style={{ background: TN.white, border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.lg, minWidth: 0 }}>
        {liste.map((d) => (
          <div key={d.attachmentId} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "8px 20px", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${TN.navy100}` }}>
            <a href={`/api/team-norway/vedlegg/${encodeURIComponent(d.attachmentId)}`} style={{ flex: "1 1 260px", minWidth: 0, minHeight: 44, display: "flex", gap: 12, alignItems: "center", color: TN.textPrimary, textDecoration: "none" }}>
              <span aria-hidden="true" style={{ width: 36, height: 36, flex: "none", borderRadius: TN.radius.xs, background: TN.navy50, border: `1px solid ${TN.navy100}`, color: TN.navy900, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={18} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, overflowWrap: "anywhere" }}>{d.fileName}</span>
                <span style={{ display: "block", fontSize: 13, color: TN.textSecondary, marginTop: 2 }}>{d.kilde === "LASTET_OPP" ? "Lastet opp" : "Fra innlegg"}</span>
              </span>
            </a>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", alignItems: "baseline", fontFamily: TN.font.mono, fontSize: 12, color: TN.textSecondary, minWidth: 0 }}>
              <span style={{ color: TN.navy900 }}>{filtype(d.fileName)}</span>
              <span>{datoLang(d.oppdatert)}</span>
              <span style={{ fontFamily: TN.font.body, fontSize: 13, overflowWrap: "anywhere" }}>{d.opplasterNavn}</span>
              <span>{storrelse(d.fileSize)}</span>
              {erTrener ? <span>{d.kvittering.apnet}/{d.kvittering.totalt} åpnet</span> : null}
            </div>
          </div>
        ))}
        {liste.length === 0 ? (
          <div style={{ padding: "clamp(16px, 2vw, 24px)" }}>
            <div style={{ fontFamily: TN.font.display, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: TN.navy900 }}>{dokumenter.length === 0 ? "Ingen dokumenter" : "Ingen treff"}</div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: TN.textSecondary, margin: "10px 0 0", maxWidth: "60ch" }}>
              {dokumenter.length > 0
                ? "Ingen dokumenter med denne kilden."
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
