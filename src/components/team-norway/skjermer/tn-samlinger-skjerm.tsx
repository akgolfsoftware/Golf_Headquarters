import Link from "next/link";
import { notFound } from "next/navigation";

import { hentTnSamlinger, hentTnTurneringer } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { TnDatoRad, TnEtikett, TnFlate, TnFlatehode, TnFotnote, TnKorttittel, TnMangler, TnSkjermhode } from "../tn-flate";
import { MANEDER, MANEDER_LANG, SkjermRamme, datoKort, heltallParam, hentSkjermbruker, osloDag, periode } from "./felles";

/**
 * TN-04 Samlinger og terminliste.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-04.
 *
 * Avvik fra designet, fordi dataene ikke finnes:
 *   - Mesterskap er ikke egen kategori i turneringsdataene. Årshjulet viser
 *     samlinger og turneringer, ikke mesterskap som eget merke.
 *   - Dagsprogram, romfordeling og pakkeliste har ingen datamodell. Kortet sier
 *     det rett ut i stedet for å vise eksempeltekst.
 */

type Hendelse = { type: "samling" | "turnering"; tittel: string; fra: Date; til: Date; sted: string | null; id: string };

export async function TnSamlingerSkjerm({ sokeparametre, valgtId }: { sokeparametre: Record<string, string | string[] | undefined>; valgtId?: string }) {
  const bruker = await hentSkjermbruker();
  const [data, turneringsdata] = await Promise.all([hentTnSamlinger(bruker), hentTnTurneringer(bruker)]);
  if (!data) notFound();

  const naa = new Date();
  const idag = osloDag(naa);
  const aar = heltallParam(sokeparametre.ar, 2000, 2100, idag.aar);
  const maned = heltallParam(sokeparametre.maned, 1, 12, aar === idag.aar ? idag.maned : 1);

  const hendelser: Hendelse[] = [
    ...data.samlinger.map((s) => ({ type: "samling" as const, tittel: s.name, fra: s.startDate, til: s.endDate, sted: s.location, id: s.id })),
    ...(turneringsdata?.turneringer ?? []).map((t) => ({ type: "turnering" as const, tittel: t.name, fra: t.startDate, til: t.endDate ?? t.startDate, sted: t.location, id: t.id })),
  ].sort((a, b) => a.fra.getTime() - b.fra.getTime());

  const iManed = (h: Hendelse, a: number, m: number) => {
    const fra = osloDag(h.fra);
    const til = osloDag(h.til);
    const start = fra.aar * 12 + fra.maned;
    const slutt = til.aar * 12 + til.maned;
    const denne = a * 12 + m;
    return denne >= start && denne <= slutt;
  };

  const valgt = valgtId
    ? data.samlinger.find((s) => s.id === valgtId)
    : [...data.samlinger].sort((a, b) => a.startDate.getTime() - b.startDate.getTime()).find((s) => s.endDate.getTime() >= naa.getTime());
  if (valgtId && !valgt) notFound();

  const manedsrader = hendelser.filter((h) => iManed(h, aar, maned));
  const lenke = (a: number, m: number) => `/team-norway/samlinger?ar=${a}&maned=${m}`;

  return (
    <SkjermRamme aktiv="samlinger" brukerNavn={bruker.name} kontekst={data.kontekst}>
      <TnSkjermhode
        rute={valgt && valgtId ? `/team-norway/samlinger/${valgt.id}` : "/team-norway/samlinger"}
        tittel="Samlinger og terminliste"
        ingress="Hele sesongen på ett ark. Velg en måned for detaljer."
      />

      <TnFlate>
        <TnFlatehode tittel={`Årshjul ${aar}`}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 12.5, color: TN.textSecondary, alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span aria-hidden="true" style={{ width: 10, height: 10, background: TN.navy900 }} />Samling</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span aria-hidden="true" style={{ width: 10, height: 10, background: TN.navy100, border: `1px solid ${TN.navy300}` }} />Turnering</span>
            <span style={{ display: "flex", gap: 10, fontFamily: TN.font.mono, fontSize: 12 }}>
              <Link href={lenke(aar - 1, 12)} style={{ color: TN.navy700, minHeight: 44, display: "inline-flex", alignItems: "center" }}>← {aar - 1}</Link>
              <Link href={lenke(aar + 1, 1)} style={{ color: TN.navy700, minHeight: 44, display: "inline-flex", alignItems: "center" }}>{aar + 1} →</Link>
            </span>
          </div>
        </TnFlatehode>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gap: 1, background: TN.navy100, border: `1px solid ${TN.navy100}`, marginTop: 16 }}>
          {MANEDER.map((navn, i) => {
            const m = i + 1;
            const aktiv = m === maned;
            const hendelserIManed = hendelser.filter((h) => iManed(h, aar, m));
            return (
              <Link
                key={navn}
                href={lenke(aar, m)}
                scroll={false}
                aria-current={aktiv ? "true" : undefined}
                aria-label={`${MANEDER_LANG[i]} ${aar}, ${hendelserIManed.length} hendelser`}
                style={{ background: aktiv ? TN.navy50 : TN.white, borderTop: `3px solid ${aktiv ? TN.red600 : "transparent"}`, padding: "10px 8px 12px", minHeight: 118, display: "flex", flexDirection: "column", gap: 5, textDecoration: "none", minWidth: 0 }}
              >
                <span style={{ fontFamily: TN.font.display, fontSize: 12, letterSpacing: "0.18em", color: TN.navy900 }}>{navn}</span>
                {hendelserIManed.slice(0, 3).map((h) => (
                  <span key={`${h.type}-${h.id}`} style={{ display: "block", fontSize: 11.5, lineHeight: 1.3, padding: "3px 5px", borderRadius: TN.radius.sm, background: h.type === "samling" ? TN.navy900 : TN.navy100, color: h.type === "samling" ? TN.white : TN.navy900, overflowWrap: "anywhere" }}>
                    {h.tittel}
                  </span>
                ))}
                {hendelserIManed.length > 3 ? <span style={{ fontFamily: TN.font.mono, fontSize: 11, color: TN.textSecondary }}>+{hendelserIManed.length - 3} til</span> : null}
              </Link>
            );
          })}
        </div>
      </TnFlate>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 20, alignItems: "start" }}>
        <TnFlate>
          <TnFlatehode tittel={`${MANEDER_LANG[maned - 1]} ${aar}`} merknad={`${manedsrader.length} i terminlisten`} />
          {manedsrader.map((h) => (
            <TnDatoRad
              key={`${h.type}-${h.id}`}
              dato={periode(h.fra, h.til)}
              datoFarge={h.type === "samling" ? TN.navy900 : TN.textSecondary}
              tittel={h.type === "samling" ? <Link href={`/team-norway/samlinger/${h.id}`} style={{ color: TN.textPrimary }}>{h.tittel}</Link> : h.tittel}
              tekst={`${h.type === "samling" ? "Samling" : "Turnering"} · ${h.sted ?? "Sted ikke registrert"}`}
            />
          ))}
          {manedsrader.length === 0 ? <TnMangler>Ingen aktivitet i terminlisten denne måneden.</TnMangler> : null}
        </TnFlate>

        <TnFlate>
          {valgt ? (
            <>
              <TnKorttittel overlinje={`${valgtId ? "Samling" : "Neste samling"} · ${periode(valgt.startDate, valgt.endDate, true)}`} tittel={valgt.location ?? valgt.name}>
                {valgt.location ? <div style={{ fontSize: 14, color: TN.textSecondary, marginTop: 4 }}>{valgt.name}</div> : null}
              </TnKorttittel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1, background: TN.navy100, border: `1px solid ${TN.navy100}`, marginTop: 18 }}>
                {[
                  ["Deltakere", String(valgt.antallDeltakere)],
                  ["Fra", datoKort(valgt.startDate)],
                  ["Til", datoKort(valgt.endDate)],
                ].map(([etikett, verdi]) => (
                  <div key={etikett} style={{ background: TN.white, padding: "12px 14px", minWidth: 0 }}>
                    <div style={{ fontFamily: TN.font.mono, fontSize: 22, fontVariantNumeric: "tabular-nums" }}>{verdi}</div>
                    <TnEtikett style={{ marginTop: 4 }}>{etikett}</TnEtikett>
                  </div>
                ))}
              </div>
              <TnEtikett style={{ marginTop: 22, paddingBottom: 6, borderBottom: `1px solid ${TN.navy100}` }}>Arrangør</TnEtikett>
              <p style={{ fontSize: 14.5, margin: "10px 0 0" }}>{valgt.partner ?? "Ikke registrert"}</p>
              <TnEtikett style={{ marginTop: 22, paddingBottom: 6, borderBottom: `1px solid ${TN.navy100}` }}>Notater</TnEtikett>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: "10px 0 0", whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{valgt.notes ?? "Ingen notater på samlingen."}</p>
              <TnFotnote>Dagsprogram, romfordeling og pakkeliste kan ikke registreres i AK Golf HQ ennå, og vises derfor ikke her.</TnFotnote>
              {valgtId ? <p style={{ margin: "14px 0 0" }}><Link href="/team-norway/samlinger" style={{ color: TN.navy700, fontSize: 14, minHeight: 44, display: "inline-flex", alignItems: "center" }}>Alle samlinger</Link></p> : null}
            </>
          ) : (
            <>
              <TnFlatehode tittel="Neste samling" />
              <TnMangler>Ingen kommende samlinger er registrert for gruppen.</TnMangler>
            </>
          )}
        </TnFlate>
      </div>
    </SkjermRamme>
  );
}
