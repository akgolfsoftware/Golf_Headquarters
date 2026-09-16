import { Rad, Tab, TabList, TabPanel, Tabs, TomTilstand } from "akgolf-hq-komponenter";

const boks = { maxWidth: 560 };
const panel = { paddingTop: 12 };
const mono = { fontFamily: "var(--tl-font-mono)", fontSize: 12, color: "var(--tl-text)" };

/** Hele komposisjonen: Tabs holder valgt verdi (defaultValue), TabList + Tab er pillene, TabPanel viser bare den aktive. */
export function Standard() {
  return (
    <div style={boks}>
      <Tabs defaultValue="runder">
        <TabList>
          <Tab value="oversikt">Oversikt</Tab>
          <Tab value="runder">Runder</Tab>
          <Tab value="trackman">TrackMan</Tab>
          <Tab value="sg">Strokes Gained</Tab>
          <Tab value="tester">Tester</Tab>
        </TabList>
        <TabPanel value="oversikt">
          <div style={panel}>Oversikt</div>
        </TabPanel>
        <TabPanel value="runder">
          <div style={panel}>
            <Rad title="Onsøy GK · 18 hull" sub="Lørdag 12. september · Turnering" meta={<span style={mono}>74 (+2)</span>} trailing={null} />
            <Rad title="Gamle Fredrikstad GK · 18 hull" sub="Onsdag 9. september · Alene" meta={<span style={mono}>77 (+5)</span>} trailing={null} />
            <Rad title="Gamle Fredrikstad GK · 9 hull" sub="Mandag 7. september · Observert" meta={<span style={mono}>38 (+2)</span>} trailing={null} last />
          </div>
        </TabPanel>
        <TabPanel value="trackman">
          <div style={panel}>TrackMan</div>
        </TabPanel>
        <TabPanel value="sg">
          <div style={panel}>Strokes Gained</div>
        </TabPanel>
        <TabPanel value="tester">
          <div style={panel}>Tester</div>
        </TabPanel>
      </Tabs>
    </div>
  );
}

/** count på fanene — Kø i AgencyOS. Aktiv teller får primary/20-bakgrunn, inaktive secondary. */
export function MedTeller() {
  return (
    <div style={boks}>
      <Tabs defaultValue="venter">
        <TabList>
          <Tab value="alle" count={12}>Alle</Tab>
          <Tab value="venter" count={4}>Venter på svar</Tab>
          <Tab value="godkjenn" count={3}>Godkjenninger</Tab>
          <Tab value="ferdig" count={5}>Ferdig</Tab>
        </TabList>
        <TabPanel value="alle">
          <div style={panel}>Alle</div>
        </TabPanel>
        <TabPanel value="venter">
          <div style={panel}>
            <Rad title="Forelder spør om onsdagsøkta" sub="E-post · for 2 timer siden" meta={<span style={mono}>i dag</span>} trailing={null} />
            <Rad title="Ønsker time lørdag formiddag" sub="SMS · for 4 timer siden" meta={<span style={mono}>i dag</span>} trailing={null} last />
          </div>
        </TabPanel>
        <TabPanel value="godkjenn">
          <div style={panel}>Godkjenninger</div>
        </TabPanel>
        <TabPanel value="ferdig">
          <div style={panel}>Ferdig</div>
        </TabPanel>
      </Tabs>
    </div>
  );
}

/** Kontrollert: value settes utenfra (her statisk) og onValueChange melder klikk oppover. */
export function Kontrollert() {
  return (
    <div style={boks}>
      <Tabs defaultValue="trackman" value="trackman" onValueChange={() => {}}>
        <TabList>
          <Tab value="runder">Runder</Tab>
          <Tab value="trackman">TrackMan</Tab>
          <Tab value="tester">Tester</Tab>
        </TabList>
        <TabPanel value="runder">
          <div style={panel}>Runder</div>
        </TabPanel>
        <TabPanel value="trackman">
          <div style={panel}>
            <Rad title="Club Speed" sub="Driver · 12.09.2026" meta={<span style={mono}>98,4 mph</span>} trailing={null} />
            <Rad title="Attack Angle" sub="Driver · 12.09.2026" meta={<span style={mono}>+1,8°</span>} trailing={null} />
            <Rad title="Carry" sub="Driver · 12.09.2026" meta={<span style={mono}>231 m</span>} trailing={null} last />
          </div>
        </TabPanel>
        <TabPanel value="tester">
          <div style={panel}>
            <TomTilstand icon="target" title="Ingen tester registrert ennå" />
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}

/** Smal ramme (360 px): TabList ruller horisontalt uten synlig rullefelt, pillene brekker aldri. */
export function Smal() {
  return (
    <div style={{ maxWidth: 360, border: "1px dashed var(--tl-hair)", padding: 8 }}>
      <Tabs defaultValue="trackman">
        <TabList>
          <Tab value="oversikt">Oversikt</Tab>
          <Tab value="runder">Runder</Tab>
          <Tab value="trackman">TrackMan</Tab>
          <Tab value="sg">Strokes Gained</Tab>
          <Tab value="tester">Tester</Tab>
          <Tab value="fysisk">Fysisk</Tab>
          <Tab value="turneringer">Turneringer</Tab>
          <Tab value="video">Video</Tab>
        </TabList>
        <TabPanel value="oversikt">
          <div style={panel}>Oversikt</div>
        </TabPanel>
        <TabPanel value="runder">
          <div style={panel}>Runder</div>
        </TabPanel>
        <TabPanel value="trackman">
          <div style={panel}>
            <Rad title="Club Speed" sub="Driver · 12.09.2026" meta={<span style={mono}>98,4 mph</span>} trailing={null} last />
          </div>
        </TabPanel>
        <TabPanel value="sg">
          <div style={panel}>Strokes Gained</div>
        </TabPanel>
        <TabPanel value="tester">
          <div style={panel}>Tester</div>
        </TabPanel>
        <TabPanel value="fysisk">
          <div style={panel}>Fysisk</div>
        </TabPanel>
        <TabPanel value="turneringer">
          <div style={panel}>Turneringer</div>
        </TabPanel>
        <TabPanel value="video">
          <div style={panel}>Video</div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
