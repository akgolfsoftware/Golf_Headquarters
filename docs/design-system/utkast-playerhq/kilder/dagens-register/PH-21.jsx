/* PH-21 Innboks (spiller) · Precision 2.28.1 (09.10.2026, liste A krav 1). Kandidat. Mal for AG-04.
   Faner Saker (InboxList) og Meldinger (ConversationList + MessageThread, mønster 1). Under 720 px: samtalelista fyller skjermen, trykk åpner tråden med «Tilbake».
   Data: data/kjerne.js (demodata). 10.10.2026: «Ny melding» åpner et ark med Composer. Sendt melding lagres i demotilstanden (data/handling.js, AK_HANDLING.TRAD)
   og vises i tråden med Anders her og i AG-04, AG-12 og AG-13. Skrivefeltet inne i MessageThread sender ikke i 2.32.1 (ingen onSend, venter på Precision). */
(() => {
const NS = window.AKGolfPrecisionAthletics_7d7c29, H = window.AK_HOST;
/* 2.32.0: variant meldinger åpner fanen Meldinger. Tråden med Anders har video, bilde og talemelding (MessageThread). */
function PH21({ state, setState, variant }) {
  const { Gate, Tabs, InboxList, ConversationList, MessageThread, EmptyState, PageHeader, LargeTitle, Button, Sheet, Composer } = NS, X = window.AK_HANDLING;
  X.use(X.TRAD, []);
  const [ny, setNy] = React.useState(false);
  const send = async (v) => { await X.sendMessage(X.TRAD, "spiller", v); setNy(false); setTab("meldinger"); setSel("ak"); };
  const { cw } = H.useW(), A = window.AK_DATA, narrow = cw < 600, split = cw >= 720, tom = state === "tom";
  const [tab, setTab] = React.useState(variant === "meldinger" ? "meldinger" : "saker"), [sel, setSel] = React.useState(split ? "ak" : null), [attempts, setAttempts] = React.useState(0);
  const items = tom ? [] : A.innboks.spiller, siste = X.sisteMelding(), convs = tom ? [] : A.samtaler.spiller.map((x) => x.id === "ak" && siste ? { ...x, last: siste.text, time: siste.time } : x), c = convs.find((x) => x.id === sel);
  const thread = c && <MessageThread title={c.name} subtitle={c.role} messages={c.id === "ak" ? X.traad("spiller") : []} draftKey={"ph21-" + c.id} composer={{ voice: false }} onSend={c.id === "ak" ? v => X.sendMessage(X.TRAD, "spiller", v) : undefined} onRetry={m => X.sendMessage(X.TRAD, "spiller", m).catch(() => {})} />;
  const meld = !convs.length ? <EmptyState icon="message-square" title="Ingen meldinger ennå" text="Når coachen din skriver, kommer meldingen her." action="Skriv til Anders" actionIcon="message-square-plus" onAction={() => setNy(true)} />
    : split ? <div style={{ display: "grid", gridTemplateColumns: (cw >= 1100 ? 360 : 300) + "px minmax(0,1fr)", gap: "var(--space-4)", alignItems: "start", minWidth: 0 }}><ConversationList conversations={convs} selected={sel} onSelect={(x) => setSel(x.id)} /><div style={{ minWidth: 0 }}>{thread}</div></div>
    : c ? <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", minWidth: 0 }}><div><Button variant="ghost" icon="chevron-left" onClick={() => setSel(null)}>Meldinger</Button></div>{thread}</div>
    : <ConversationList conversations={convs} onSelect={(x) => setSel(x.id)} />;
  const kicker = tom ? "TOBIAS LINDVIK" : items.filter((x) => x.unread).length + " ULESTE · TOBIAS LINDVIK";
  return <NS.Page bottomInset={80}>
    {narrow ? <LargeTitle title="Innboks" kicker={kicker} /> : <PageHeader title="Innboks" kicker={kicker} actions={state === "data" ? <Button variant="primary" icon="message-square-plus" onClick={() => setNy(true)}>Ny melding</Button> : null} />}
    {narrow && state === "data" && <div><Button variant="primary" icon="message-square-plus" onClick={() => setNy(true)}>Ny melding</Button></div>}
    <Gate state={tom ? "data" : state} loading="Henter innboksen …" attempts={attempts} onRetry={() => { setAttempts((n) => n + 1); setState("data"); }} error={{ title: "Kunne ikke hente innboksen", text: "Tilkoblingen ble brutt. Ingen meldinger er borte.", code: "FEIL 503 · INNBOKS · 05.10.2026 09:41" }}>
      <Tabs id="ph21-fane" label="Innboks" tabs={[{ value: "saker", label: "Saker" }, { value: "meldinger", label: "Meldinger" }]} value={tab} onChange={setTab} />
      {tab === "saker" ? <InboxList items={items} /> : meld}
    </Gate>
    <Sheet open={ny} onClose={() => setNy(false)} kicker="TIL ANDERS KRISTIANSEN · AK-COACH" title="Ny melding" footer={<Button variant="ghost" fullWidth onClick={() => setNy(false)}>Avbryt</Button>}>
      {ny && <Composer draftKey="ph21-ny" voice={false} onSend={send} />}
    </Sheet>
  </NS.Page>;
}
window.AK_SCREENS["PH-21"] = { id: "PH-21", name: "Innboks", route: "/portal/innboks", Component: PH21 };
})();
