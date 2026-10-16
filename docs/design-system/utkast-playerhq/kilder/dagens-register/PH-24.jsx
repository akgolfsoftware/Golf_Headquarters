/* PH-24 Meg · Precision 2.28.0 (09.10.2026, mønster 1 og 4). Kandidat.
   Profilen går gjennom PlayerProfile (AccessGate inni), viewer = spilleren selv.
   Under 600 px: LargeTitle og seksjonsliste («Seksjoner i profilen»). Trykk åpner seksjonen, «Tilbake» tar deg ut igjen. Fra 600 px: faner.
   Variant: plan (seksjonen Plan åpnet). Data: data/spillere.js og data/stats-meg-stall.js (demodata). */
(() => {
const NS = window.AKGolfPrecisionAthletics_7d7c29, H = window.AK_HOST;
function PH24({ state, setState, go, player, variant }) {
  const { Gate, PlayerProfile, EmptyState, PageHeader, LargeTitle, SCOPE_FULL } = NS;
  const { cw } = H.useW(), narrow = cw < 600, A = window.AK_DATA;
  const [attempts, setAttempts] = React.useState(0);
  const mark = React.useRef(null), [sc, setSc] = React.useState(null);
  React.useLayoutEffect(() => { let el = mark.current && mark.current.parentElement; while (el && el !== document.body) { const o = getComputedStyle(el).overflowY; if ((o === "auto" || o === "scroll") && el.scrollHeight > el.clientHeight) break; el = el.parentElement; } if (el && el !== document.body) setSc({ current: el }); }, [narrow, state]);
  const kicker = player.name.toUpperCase() + " · KATEGORI " + player.cat;
  const access = { status: "aktiv", scope: SCOPE_FULL, sensitive: { helse: true, meldinger: true } };
  return <NS.Page bottomInset={80}>
    {narrow ? <><span ref={mark} hidden></span><LargeTitle title="Meg" kicker={kicker} root={sc || undefined} /></> : <PageHeader title="Meg" kicker={kicker} />}
    <Gate state={state} loading="Henter profilen din …" attempts={attempts} onRetry={() => { setAttempts((n) => n + 1); setState("data"); }} error={{ title: "Kunne ikke hente profilen", text: "Tilkoblingen ble brutt. Ingenting er endret.", code: "FEIL 503 · MEG · 05.10.2026 08:14" }}>
      {state === "tom" ? <EmptyState icon="user" title="Profilen er ikke fylt ut" text="Legg inn klubb og handicap, så ser coachen hvor du står." action="Fyll ut profilen" actionIcon="pencil" onAction={() => go("PH-25")} />
        : <PlayerProfile viewer={{ org: "player" }} access={access} data={A.profil(player)} section={variant === "plan" ? "plan" : undefined} />}
    </Gate>
  </NS.Page>;
}
window.AK_SCREENS["PH-24"] = { id: "PH-24", name: "Meg", route: "/portal/meg", Component: PH24 };
})();
