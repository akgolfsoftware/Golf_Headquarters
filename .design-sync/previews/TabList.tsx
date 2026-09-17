import { Rad, Tab, TabList, TabPanel, Tabs } from "akgolf-hq-komponenter";

const boks = { maxWidth: 560 };
const panel = { paddingTop: 12 };
const mono = { fontFamily: "var(--tl-font-mono)", fontSize: 12, color: "var(--tl-text)" };

/** TabList er role=tablist: pillene på rad med 6 px gap, i Tabs. Aktiv fane fra defaultValue. */
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
            <Rad title="Onsøy GK · 18 hull" sub="Lørdag 12. september · Turnering" meta={<span style={mono}>74 (+2)</span>} trailing={null} last />
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

/** Med tellere på alle fanene — Kø i AgencyOS. */
export function MedTellere() {
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
            <Rad title="Forelder spør om onsdagsøkta" sub="E-post · for 2 timer siden" meta={<span style={mono}>i dag</span>} trailing={null} last />
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

/** Smal ramme (360 px): lista ruller horisontalt (overflow-x-auto, scrollbar-none) i stedet for å brekke. */
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
      </Tabs>
    </div>
  );
}
