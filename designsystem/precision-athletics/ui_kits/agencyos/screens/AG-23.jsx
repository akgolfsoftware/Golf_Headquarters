(() => {
const TABS = [["profil", "Egen profil"], ["team", "Team og tilgang"], ["inviter", "Inviter coach"], ["ekstern", "Ekstern trener"], ["varsler", "Varsler"], ["integr", "Integrasjoner"], ["mark", "Markedsføring"], ["virks", "Virksomhet"]];
function AG23({ state, go }) {
  const { PageHeader, Button, EmptyState, Tabs, DataTable, FormField, TextInput, Select, Switch, KeyValue, StatusPill, InlineAlert, Avatar } = window.AGQ.ns();
  const A = window.AGQ, S = window.AG_DATA4.setup, { mob, desk } = A.useW(), empty = state === "tom";
  const [tab, setTab] = React.useState("team"), [inv, setInv] = React.useState({ email: "", role: "Assist Coach" }), [err, setErr] = React.useState(null), [team, setTeam] = React.useState(S.team);
  const [nt, setNt] = React.useState({ ko: true, innboks: true, acwr: true, uke: false }), [mk, setMk] = React.useState({ headline: "Book time hos AK Golf Academy", show: true });
  const invite = () => { if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inv.email)) { setErr("Skriv en gyldig e-postadresse."); return; } setTeam((l) => [...l, [inv.email.split("@")[0], inv.role, inv.role === "Ekstern trener" ? "Les" : "Coach", inv.email]]); setInv({ ...inv, email: "" }); setErr(null); A.toast("Invitasjonen er klar som utkast", "SEND FRA INNBOKS · GYLDIG I 7 DAGER"); };
  const wrap = (children) => <A.Card gap={14} style={{ maxWidth: 820 }}>{children}</A.Card>;
  let body;
  if (tab === "profil") body = wrap(<><div style={{ display: "flex", gap: 12, alignItems: "center" }}><Avatar name="Anders Kristiansen" size={48} /><div><div style={{ font: "var(--type-title-s)" }}>Anders Kristiansen</div><A.Meta>HOVEDCOACH · ADMIN</A.Meta></div></div><FormField label="Visningsnavn"><TextInput defaultValue="Anders Kristiansen" /></FormField><FormField label="E-post"><TextInput defaultValue="anders@demo.no" /></FormField><Switch defaultChecked label="Totrinnsinnlogging (2FA)" /><div><Button icon="check" onClick={() => A.toast("Profilen er lagret", "—")}>Lagre</Button></div></>);
  if (tab === "team") body = <DataTable caption="Team og tilgang" rowKey="3" columns={[{ key: "0", label: "Navn" }, { key: "1", label: "Rolle" }, { key: "2", label: "Tilgang", render: (r) => <StatusPill tone={r[2] === "Admin" ? "solid" : "neutral"}>{r[2]}</StatusPill> }, { key: "3", label: "E-post", mono: true }]} rows={(empty ? team.slice(0, 1) : team).map((r) => ({ ...r }))} />;
  if (tab === "inviter" || tab === "ekstern") body = wrap(<><A.Head k={tab === "ekstern" ? "Ekstern trener" : "Inviter coach"} /><p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{tab === "ekstern" ? "Ekstern trener får lesetilgang til spillere du velger. Ingen tilgang til økonomi eller meldinger." : "Coach får tilgang til stall, plan og kø for gruppene sine."}</p>
    <FormField label="E-post" required error={err || undefined}><TextInput type="email" value={inv.email} onChange={(e) => { setInv({ ...inv, email: e.target.value }); setErr(null); }} placeholder="coach@demo.no" /></FormField>
    <Select label="Rolle" value={tab === "ekstern" ? "Ekstern trener" : inv.role} onChange={(e) => setInv({ ...inv, role: e.target.value })} options={tab === "ekstern" ? ["Ekstern trener"] : ["Assist Coach", "Coach"]} disabled={tab === "ekstern"} />
    {tab === "ekstern" && <Select label="Spillere" options={["Tobias Lindvik", "Magnus Aasheim", "Hele WANG Toppidrett"]} />}
    <div><Button icon="send" onClick={() => { if (tab === "ekstern") setInv({ ...inv, role: "Ekstern trener" }); invite(); }}>Lag invitasjon</Button></div></>);
  if (tab === "varsler") body = wrap(<>{[["ko", "Nye saker i Kø"], ["innboks", "Ubesvarte meldinger over 24 t"], ["acwr", "ACWR over 1,5"], ["uke", "Ukesdigest lørdag 06:00"]].map(([k, l]) => <Switch key={k} checked={nt[k]} onChange={(e) => setNt({ ...nt, [k]: e.target.checked })} label={l} />)}</>);
  if (tab === "integr") body = wrap(<KeyValue items={[["TrackMan", "Koblet · Studio 1 og 2", { mono: false, hint: "SIST HENTET 26.09 14:00" }], ["GolfBox", "Koblet", { mono: false, hint: "NATTLIG 03:00" }], ["Tripletex", "Koblet · les", { mono: false, hint: "EKSPORT 25.09 23:00" }], ["Notion", "Koblet", { mono: false, hint: "HVERT 15. MIN" }], ["Data Golf", "Koblet · bare Anders", { mono: false }]]} />);
  if (tab === "mark") body = wrap(<><A.Head k="Markedsføring · forside" aside="AKGOLF.NO" /><FormField label="Overskrift"><TextInput value={mk.headline} onChange={(e) => setMk({ ...mk, headline: e.target.value })} /></FormField><KeyValue items={[["Hovedknapp", "Book time", { mono: false, hint: "FAST · STYRES IKKE HER" }]]} /><Switch checked={mk.show} onChange={(e) => setMk({ ...mk, show: e.target.checked })} label="Vis medlemskap TALENT og FULL" /><InlineAlert tone="neutral">Ingen sitater, stjerner eller vitnesbyrd på markedssidene.</InlineAlert><div><Button icon="check" onClick={() => A.toast("Endringen er klar som utkast", "PUBLISER FRA FORHÅNDSVISNINGEN")}>Lagre utkast</Button></div></>);
  if (tab === "virks") body = wrap(<KeyValue items={[["Navn", "AK Golf Academy", { mono: false }], ["Org.nr.", "000 000 000", { hint: "DEMODATA" }], ["Virksomheter", "Mulligan · Academy · Software · WANG · GFGK", { mono: false }], ["Tidssone", "Europe/Oslo", { mono: false }]]} />);
  return <A.Page>
    <PageHeader kicker="Oppsett" title="Oppsett" sub="Profil, team, tilgang, varsler og integrasjoner." />
    <A.Gate state={state} loading="Henter oppsett …" error={{ title: "Oppsettet kunne ikke hentes", text: "Ingen innstillinger er endret. Prøv igjen.", code: "FEIL 502 · ORG" }}>
      <Tabs tabs={TABS.map(([v, l]) => ({ value: v, label: l }))} value={tab} onChange={setTab} />
      {empty && tab === "team" && <InlineAlert tone="info" title="Bare deg i teamet">Inviter en coach eller ekstern trener for å dele stallen.</InlineAlert>}
      {body}
    </A.Gate>
  </A.Page>;
}
window.AG_SCREENS["AG-23"] = { id: "AG-23", name: "Oppsett", route: "/admin/oppsett", Component: AG23 };
})();
