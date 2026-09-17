import { Rad, Tab, TabList, TabPanel, Tabs } from "akgolf-hq-komponenter";

const boks = { maxWidth: 560 };
const panel = { paddingTop: 12 };
const mono = { fontFamily: "var(--tl-font-mono)", fontSize: 12, color: "var(--tl-text)" };

/** Tab må stå i Tabs → TabList. Aktiv pille: accent-fyll med lys tekst; inaktive: mute-tekst, fyll kun på hover. */
export function AktivOgInaktiv() {
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
            <Rad title="Gamle Fredrikstad GK · 18 hull" sub="Onsdag 9. september · Alene" meta={<span style={mono}>77 (+5)</span>} trailing={null} last />
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

/** count: mono 10 px teller i pillen — primary/20 på den aktive, secondary på de andre. */
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

/** Teksten brekker aldri (whitespace-nowrap); lange navn holder pillen på én linje. count=0 vises også. */
export function LangTekstOgNull() {
  return (
    <div style={boks}>
      <Tabs defaultValue="samlinger">
        <TabList>
          <Tab value="samlinger" count={2}>Treningssamlinger</Tab>
          <Tab value="heldag" count={0}>Heldagssamlinger</Tab>
          <Tab value="testuke">Testuke</Tab>
        </TabList>
        <TabPanel value="samlinger">
          <div style={panel}>
            <Rad title="Team Norway U18 · Losby" sub="2.–4. oktober · 3 dager" trailing={null} />
            <Rad title="WANG Toppidrett · Spania" sub="Uke 8 · 7 dager" trailing={null} last />
          </div>
        </TabPanel>
        <TabPanel value="heldag">
          <div style={panel}>Heldagssamlinger</div>
        </TabPanel>
        <TabPanel value="testuke">
          <div style={panel}>Testuke</div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
