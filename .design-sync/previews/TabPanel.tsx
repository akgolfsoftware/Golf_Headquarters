import { Rad, Tab, TabList, TabPanel, Tabs, TomTilstand } from "akgolf-hq-komponenter";

const boks = { maxWidth: 560 };
const panel = { paddingTop: 12 };
const mono = { fontFamily: "var(--tl-font-mono)", fontSize: 12, color: "var(--tl-text)" };

function Faner() {
  return (
    <TabList>
      <Tab value="runder">Runder</Tab>
      <Tab value="trackman">TrackMan</Tab>
      <Tab value="tester">Tester</Tab>
    </TabList>
  );
}

/** TabPanel rendrer bare når value = aktiv fane; de andre panelene er null i DOM. Her: Runder. */
export function Runder() {
  return (
    <div style={boks}>
      <Tabs defaultValue="runder">
        <Faner />
        <TabPanel value="runder">
          <div style={panel}>
            <Rad title="Onsøy GK · 18 hull" sub="Lørdag 12. september · Turnering" meta={<span style={mono}>74 (+2)</span>} trailing={null} />
            <Rad title="Gamle Fredrikstad GK · 18 hull" sub="Onsdag 9. september · Alene" meta={<span style={mono}>77 (+5)</span>} trailing={null} last />
          </div>
        </TabPanel>
        <TabPanel value="trackman">
          <div style={panel}>TrackMan</div>
        </TabPanel>
        <TabPanel value="tester">
          <div style={panel}>Tester</div>
        </TabPanel>
      </Tabs>
    </div>
  );
}

/** Samme komposisjon med TrackMan aktiv: et annet panel, samme faner. */
export function TrackMan() {
  return (
    <div style={boks}>
      <Tabs defaultValue="trackman">
        <Faner />
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
          <div style={panel}>Tester</div>
        </TabPanel>
      </Tabs>
    </div>
  );
}

/** Tomt panel: TomTilstand med én vei videre. */
export function Tom() {
  return (
    <div style={boks}>
      <Tabs defaultValue="tester">
        <Faner />
        <TabPanel value="runder">
          <div style={panel}>Runder</div>
        </TabPanel>
        <TabPanel value="trackman">
          <div style={panel}>TrackMan</div>
        </TabPanel>
        <TabPanel value="tester">
          <div style={panel}>
            <TomTilstand icon="target" title="Ingen tester registrert ennå" sub="Testbatteriet er gratis — start med Putt Gate på neste økt." />
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
