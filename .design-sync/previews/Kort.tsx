import { AvatarInit, CTAPill, Kort, MikroMeta, Rad, StatusPill, TallHero, TomTilstand } from "akgolf-hq-komponenter";

const boks = { maxWidth: 440 };

/** Kort er flaten: eyebrow (Caps) øverst, innholdet ligger rammeløst inni. */
export function Standard() {
  return (
    <div style={boks}>
      <Kort eyebrow="Neste økt">
        <Rad title="Wedge 60–100 m · 60 slag" sub="Torsdag 16:00–17:30 · Range, GFGK" trailing={null} last />
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 4 }}>
          <MikroMeta icon="radar">TrackMan · Carry ± 5 m</MikroMeta>
          <MikroMeta icon="repeat">Hver torsdag</MikroMeta>
        </div>
        <div style={{ marginTop: 16 }}>
          <CTAPill icon="play">Start økt</CTAPill>
        </div>
      </Kort>
    </div>
  );
}

/** action til høyre i toppraden, ved siden av eyebrow. */
export function MedHandling() {
  return (
    <div style={boks}>
      <Kort eyebrow="Denne uka" action={<StatusPill tone="up">Publisert</StatusPill>}>
        <TallHero value={4} unit="av 6 økter" sub="To gjenstår: torsdag og lørdag" />
      </Kort>
    </div>
  );
}

/** Liste i kort: Rad-er skilt med hårlinje, siste uten. */
export function Liste() {
  return (
    <div style={boks}>
      <Kort eyebrow="Stall · 3 grupper" action={<CTAPill ghost icon="arrow-right">Åpne</CTAPill>}>
        <Rad leading={<AvatarInit navn="WANG Toppidrett" size={36} />} title="WANG Toppidrett · 8 spillere" sub="Fredag 08:00 · 2 venter på deg" meta={<StatusPill tone="warn">2 venter</StatusPill>} />
        <Rad leading={<AvatarInit navn="GFGK Junior" size={36} />} title="GFGK junior · 12 spillere" sub="Torsdag 20:00 · ballplukking" />
        <Rad leading={<AvatarInit navn="Team Norway" size={36} />} title="Team Norway U18 · 6 spillere" sub="Samling 3.–5. oktober" meta={<StatusPill>Samling</StatusPill>} last />
      </Kort>
    </div>
  );
}

/** tint: tonet flate for et kort som trenger blikk (varsle-KPI). */
export function Tint() {
  return (
    <div style={boks}>
      <Kort tint eyebrow="Etterlevelse · uke 37">
        <TallHero value="62" unit="%" delta="−18" dir="down" sub="5 av 8 økter fullført. Snakk med Øyvind før torsdag." />
      </Kort>
    </div>
  );
}

/** Tom tilstand inne i kortet, med én vei videre i teksten. */
export function Tom() {
  return (
    <div style={boks}>
      <Kort eyebrow="Runder">
        <TomTilstand icon="flag" title="Ingen runder registrert" sub="Registrer en runde, eller koble GolfBox så hentes turneringene automatisk." />
      </Kort>
    </div>
  );
}
