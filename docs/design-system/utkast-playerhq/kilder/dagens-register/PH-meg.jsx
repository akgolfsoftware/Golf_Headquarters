/* PH-24-TEAM Meg › Mitt team, PH-27 Meg › Deling og PH-25 Abonnement og innstillinger · Precision 2.28.1 (09.10.2026, liste B). Kandidat. PH-24-TEAM er mal for de to andre.
   PH-24-TEAM: hvem som er coach og hvem som har tilgang, per organisasjon (DataRow med Avatar, AccessStatus). «Endre deling» åpner PH-27.
   PH-27: deling per organisasjon (D-04, D-17): Full profil · Bare tester · Ikke delt, eget ja for Helse og Meldinger. TestConsent for testene (D-55). Endringer lagres med det samme.
   PH-25: abonnement (Gratis · Full) og varsler med Switch.
   Data: data/spillere.js (demodata, Tobias Lindvik). */
(() => {
const NS = window.AKGolfPrecisionAthletics_7d7c29, H = window.AK_HOST;
const Meta = ({ children }) => <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" }}>{children}</span>;
const Card = ({ title, children, meta, label }) => <section aria-label={label || title} className="pa-card" style={{ padding: "var(--space-4)", gap: "var(--space-2)", minWidth: 0 }}><h2 style={{ margin: 0, font: "var(--type-title-s)", color: "var(--text-primary)" }}>{title}</h2>{children}{meta && <Meta>{meta}</Meta>}</section>;
const ORGS = [["wang", "WANG Toppidrett"], ["team-norway", "Team Norway"]];
function Shell({ id, title, state, setState, children, empty, what }) {
  const { Gate, PageHeader, LargeTitle, Button } = NS;
  const { cw } = H.useW(), narrow = cw < 600, [attempts, setAttempts] = React.useState(0);
  const kicker = "MEG · TOBIAS LINDVIK";
  return <NS.Page bottomInset={80}>
    <div><Button variant="ghost" icon="chevron-left" onClick={() => H.go && H.go("PH-24")}>Meg</Button></div>
    {narrow ? <LargeTitle title={title} kicker={kicker} /> : <PageHeader title={title} kicker={kicker} />}
    <Gate state={state === "tom" ? "data" : state} loading={"Henter " + what + " …"} attempts={attempts} onRetry={() => { setAttempts((n) => n + 1); setState("data"); }} error={{ title: "Kunne ikke hente " + what, text: "Tilkoblingen ble brutt. Ingenting er endret.", code: "FEIL 503 · " + id + " · 05.10.2026 08:14" }}>
      {state === "tom" ? empty : <div style={{ display: "grid", gridTemplateColumns: cw >= 900 ? "repeat(2,minmax(0,1fr))" : "minmax(0,1fr)", gap: "var(--space-4)", alignItems: "start", minWidth: 0 }}>{children}</div>}
    </Gate>
  </NS.Page>;
}
const useGo = (go) => { H.go = go; return go; };
function Team({ state, setState, go, player }) {
  const { DataRow, Avatar, AccessStatus, Button, EmptyState } = NS;
  const A = window.AK_DATA; useGo(go);
  const tr = (org) => A.trainers.filter((t) => t.org === org && t.groups.some((g) => player.groups.includes(g)));
  const person = (t, sub) => <DataRow key={t.id || t.name} leading={<Avatar name={t.name} size={36} />} title={t.name} sub={sub} />;
  return <Shell id="MITT TEAM" title="Mitt team" what="teamet ditt" state={state} setState={setState}
    empty={<EmptyState icon="users" title="Du har ingen coach ennå" text="Koble deg til en coach, så ser dere planen sammen." action="Finn coach" actionIcon="search" onAction={() => go("AU-04")} />}>
    <Card title="AK Golf Academy" meta="AVTALE MED AK GOLF ACADEMY · HELE PROFILEN">{person(A.coach, "Hovedcoach")}</Card>
    {ORGS.map(([o, n]) => { const acc = A.access(player.id, o), l = tr(o); return <Card key={o} title={n} meta={acc.grantedAt ? "DELT SIDEN " + acc.grantedAt : null}>
      <div><AccessStatus status={acc.status} scope={acc.scope} /></div>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>{l.map((t) => person(t, t.role))}</div>
      <div><Button variant="secondary" iconRight="arrow-right" onClick={() => go("PH-27")}>Endre deling</Button></div>
    </Card>; })}
  </Shell>;
}
function Deling({ state, setState, go, player }) {
  const { Radio, Switch, AccessStatus, TestConsent, DataRow, EmptyState } = NS;
  const A = window.AK_DATA; useGo(go);
  const init = () => Object.fromEntries(ORGS.map(([o]) => { const s = A.sharingRecord(player.id,o); return [o, { v: s && s.status === "aktiv" ? s.scopeName : "Ikke delt", helse: !!(s && s.sensitive.helse), meldinger: !!(s && s.sensitive.meldinger), at: s && s.grantedAt }]; }));
  const X=window.AK_HANDLING,[S,setS]=React.useState(init),consent=X.use("test-consent:"+player.id,"gitt");
  const set=(o,k,val,n)=>{const next={...S,[o]:{...S[o],[k]:val}};setS(next);const x=next[o];X.changeSharing(player,o,x.v,{helse:x.helse,meldinger:x.meldinger});H.toast(A.under16(player)&&x.v!=="Ikke delt"?"Venter på foresatt":"Delingen er oppdatert","LOKAL DEMO");};

  const wangG = (A.groupsOf(player).find((g) => g.org === "wang") || {}).name;
  return <Shell id="DELING" title="Deling" what="delingen" state={state} setState={setState}
    empty={<EmptyState icon="share-2" title="Du deler ikke med noen ennå" text="Når WANG eller Team Norway ber om å se profilen din, svarer du her." action="Se teamet ditt" actionIcon="users" onAction={() => go("PH-24-TEAM")} />}>
    {ORGS.map(([o, n]) => { const x = S[o], full = x.v === "Full profil"; return <Card key={o} title={n} meta={x.at && x.v !== "Ikke delt" ? "DELT SIDEN " + x.at : "IKKE DELT"}>
      <div><AccessStatus status={A.access(player.id,o).status} scope={A.access(player.id,o).scope} /></div>
      <div role="radiogroup" aria-label={"Deling med " + n} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", minWidth: 0 }}>{["Full profil", "Bare tester", "Ikke delt"].map((v) => <Radio key={v} name={"ph27-" + o} label={v} checked={x.v === v} onChange={() => set(o, "v", v, n)} />)}</div>
      {full && <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", minWidth: 0 }}>
        <Switch label="Helse" checked={x.helse} onChange={(e) => set(o, "helse", e.target.checked, n)} />
        <Switch label="Meldinger" checked={x.meldinger} onChange={(e) => set(o, "meldinger", e.target.checked, n)} />
      </div>}
    </Card>; })}
    <TestConsent status={consent} group={wangG} since="18.08.2026" viewer="spiller" primary={false} onConsent={()=>X.set("test-consent:"+player.id,A.under16(player)?"forelder":"gitt")} onWithdraw={()=>X.set("test-consent:"+player.id,"mangler")} />
  </Shell>;
}
function Innstillinger({ state, setState, go }) {
  const { DataRow, Switch, Button, EmptyState } = NS;
  useGo(go);
  const X=window.AK_HANDLING,V=X.use("notification-settings",{okter:true,meldinger:true,paaminnelse:false}),setV=v=>X.set("notification-settings",typeof v==="function"?v(V):v);
  const sw = (k, label) => <Switch label={label} checked={V[k]} onChange={(e) => { setV((x) => ({ ...x, [k]: e.target.checked })); H.toast("Lagret", "VARSLER"); }} />;
  return <Shell id="INNSTILLINGER" title="Abonnement og innstillinger" what="innstillingene" state={state} setState={setState}
    empty={<EmptyState icon="wallet" title="Du bruker Gratis" text="Med Full får du Workbench, live-økt og SG-analyse." action="Velg Full" actionIcon="arrow-right" onAction={() => go("PH-21")} />}>
    <Card title="Abonnement" meta="FORNYES 01.01.2027">
      <DataRow title="Full" sub="Performance · AK Golf Academy" />
      <div><Button variant="secondary" onClick={() => go("PH-21")}>Endre abonnement</Button></div>
    </Card>
    <Card title="Varsler">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", minWidth: 0 }}>{sw("okter", "Nye økter og endringer")}{sw("meldinger", "Meldinger fra coach")}{sw("paaminnelse", "Påminnelse 30 min før økt")}</div>
    </Card>
    <Card title="Deling og personvern">
      <DataRow title="Deling" sub="WANG Toppidrett · Team Norway" onClick={() => go("PH-27")} />
      <DataRow title="Mitt team" sub="Hvem som er coach og har tilgang" onClick={() => go("PH-24-TEAM")} />
    </Card>
    <Card title="Konto">
      <DataRow title="Språk" value="Bokmål" />
      <div><Button variant="ghost" onClick={() => go("AU-01")}>Logg ut</Button></div>
    </Card>
  </Shell>;
}
window.AK_SCREENS["PH-24-TEAM"] = { id: "PH-24-TEAM", name: "Meg › Mitt team", route: "/portal/meg/team", Component: Team };
window.AK_SCREENS["PH-27"] = { id: "PH-27", name: "Meg › Deling", route: "/portal/meg/deling", Component: Deling };
window.AK_SCREENS["PH-25"] = { id: "PH-25", name: "Abonnement og innstillinger", route: "/portal/meg/innstillinger", Component: Innstillinger };
})();
