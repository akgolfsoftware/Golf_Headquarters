import {
  AvatarInit,
  InspektorBlokk,
  InspektorKpi,
  InspektorLinje,
  Inspektorpanel,
  InspektorTom,
  Knapp,
  Kort,
  MasterDetalj,
  Rad,
  StatusPill,
} from "akgolf-hq-komponenter";

/* Riggen fanger cellen på 900 px — under MasterDetaljs lg-brekkpunkt (1024 px) der panelkolonnen vises.
   Denne cellestilen gjenskaper desktop-kolonnene i fangsten; på ≥1024 px gir den nøyaktig samme
   resultat som komponentens egne klasser (minmax(0,1fr) 380px, panelet synlig). */
const DESKTOP_CSS =
  "[data-ds-desktop].grid{grid-template-columns:minmax(0,1fr) 380px}[data-ds-desktop]>.hidden{display:block}";

const kpiRad = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 };

/** Masterlista: stallen med én navngitt spiller og gruppene, pluss ukas økter. Klikk på rad velger inn i panelet. */
function Master() {
  const velg = () => {};
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Kort eyebrow="Stall · 4 rader" pad="15px 17px">
        <Rad leading={<AvatarInit navn="Øyvind Rohjan" size={36} />} title="Øyvind Rohjan" sub="Neste økt torsdag 16:00 · sist aktiv i går" meta={<StatusPill tone="up">I rute</StatusPill>} onClick={velg} />
        <Rad leading={<AvatarInit navn="WANG Toppidrett" size={36} />} title="WANG VG2 · 8 spillere" sub="Fredag 08:00 · 2 venter på deg" meta={<StatusPill tone="warn">2 venter</StatusPill>} onClick={velg} />
        <Rad leading={<AvatarInit navn="GFGK Junior" size={36} />} title="GFGK junior · 12 spillere" sub="Torsdag 20:00 · ballplukking" onClick={velg} />
        <Rad leading={<AvatarInit navn="Team Norway" size={36} />} title="Team Norway U18 · 6 spillere" sub="Samling 3.–5. oktober" meta={<StatusPill>Samling</StatusPill>} onClick={velg} last />
      </Kort>
      <Kort eyebrow="Denne uka · Øyvind Rohjan" pad="15px 17px">
        <Rad title="Wedge 60–100 m · 60 slag" sub="Torsdag 16:00 · Range, GFGK" meta={<StatusPill tone="up">Publisert</StatusPill>} onClick={velg} />
        <Rad title="Putting · 3 m lag-drill" sub="Torsdag 17:00 · 30 putter" meta={<StatusPill>Utkast</StatusPill>} onClick={velg} last />
      </Kort>
    </div>
  );
}

/** Desktop-mønsteret: masterlista til venstre, valgt spiller i inspektørpanelet (380 px) til høyre. Fast høyde 520. */
export function StallMedValg() {
  return (
    <div style={{ height: 520 }}>
      <style>{DESKTOP_CSS}</style>
      <MasterDetalj
        data-ds-desktop=""
        panel={
          <Inspektorpanel
            tittel="Øyvind Rohjan"
            tag={<StatusPill tone="up">I rute</StatusPill>}
            fot={
              <>
                <Knapp ghost icon="send">Send melding</Knapp>
                <Knapp>Åpne uke 38</Knapp>
              </>
            }
          >
            <InspektorBlokk label="Denne uka">
              <div style={kpiRad}>
                <InspektorKpi label="Økter" verdi="5 av 6" sub="én gjenstår: lørdag" />
                <InspektorKpi label="SG 30 d" verdi="+1,8" sub="mot eget snitt" />
              </div>
            </InspektorBlokk>
            <InspektorBlokk label="Detaljer">
              <InspektorLinje label="Neste økt" verdi="Torsdag 16:00" />
              <InspektorLinje label="Sist aktiv" verdi="i går 20:12" />
              <InspektorLinje label="Pakke" verdi="Performance" />
              <InspektorLinje label="Neste turnering" verdi="Srixon Tour · 27.09" />
            </InspektorBlokk>
          </Inspektorpanel>
        }
      >
        <Master />
      </MasterDetalj>
    </div>
  );
}

/** Ingenting valgt ennå: samme masterliste, InspektorTom i panelkolonnen. */
export function StallUtenValg() {
  return (
    <div style={{ height: 520 }}>
      <style>{DESKTOP_CSS}</style>
      <MasterDetalj
        data-ds-desktop=""
        panel={<InspektorTom tittel="Ingen spiller valgt" tekst="Velg en spiller i stallen for å se ukestatus, siste aktivitet og neste økt." />}
      >
        <Master />
      </MasterDetalj>
    </div>
  );
}
