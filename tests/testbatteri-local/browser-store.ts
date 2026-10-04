/** Real browser IndexedDB contract, served on its own local origin (never app storage). */
import { activateTnDraftOwner, clearTnDrafts, listTnDrafts, updateTnDraft, TnLocalConflict } from "../../src/lib/offline-queue/tn-draft-store";
import { tnNewDraft, tnPrepare } from "../../src/lib/portal-tester/tn-draft";
import { tnProtocol } from "../../src/lib/portal-tester/tn-catalog";
const output = document.querySelector("ol")!;
const button = document.querySelector("button")!;
function check(ok: boolean, message: string): asserts ok { if (!ok) throw new Error(message); }
async function run() {
  const owner = "synthetic-browser-a"; const other = "synthetic-browser-b";
  const p = tnProtocol("naerspill-gate")!; const session = crypto.randomUUID();
  await activateTnDraftOwner(owner);
  const created = await updateTnDraft(owner, session, null, () => ({ ...tnNewDraft(owner, session, p), raw: { "1": { points: "2,5" } }, localRevision: 1 }));
  const prepared = await updateTnDraft(owner, session, created.token, d => tnPrepare(d!, p, "draft"));
  const reopened = (await listTnDrafts(owner)).find(d => d.sessionId === session)!;
  check(reopened.raw["1"].points === "2,5" && reopened.pending?.input.mutationId === prepared.pending?.input.mutationId, "Rådata/kvittering forsvant ved ny databasetilkobling");
  report("PASS: rådata og frosset sending gjenleses fra faktisk IndexedDB");
  const race = await Promise.allSettled(["3", "4"].map(points => updateTnDraft(owner, session, reopened.token, d => ({ ...d!, raw: { "1": { points } }, localRevision: 2 }))));
  check(race.filter(r => r.status === "fulfilled").length === 1, "Samtidige skriv ble ikke avgrenset");
  check(race.some(r => r.status === "rejected" && r.reason instanceof TnLocalConflict), "Tapende skriver mangler konflikt");
  report("PASS: to samtidige skriv gir én lagring og én konflikt");
  const current = (await listTnDrafts(owner)).find(d => d.sessionId === session)!;
  await updateTnDraft(owner, session, current.token, () => { throw new Error("synthetic-abort"); }).then(() => { throw Error("Ingen feil returnert"); }, e => check(e.message === "synthetic-abort", "Feilen forsvant"));
  check((await listTnDrafts(owner)).find(d => d.sessionId === session)?.token === current.token, "Avbrutt transaksjon endret data");
  report("PASS: avbrutt transaksjon bevarer lagret utgave");
  await activateTnDraftOwner(other);
  check((await listTnDrafts(other)).length === 0, "Annen konto arvet rådata");
  await updateTnDraft(owner, session, current.token, d => d!).then(() => { throw Error("Gammel eier fikk skrive"); }, e => check(e instanceof TnLocalConflict, "Feil ved eierbytte"));
  report("PASS: kontobytte tømmer utkast og avviser gammel skriver");
  const second = crypto.randomUUID();
  const stored = await updateTnDraft(other, second, null, () => tnNewDraft(other, second, p));
  await clearTnDrafts();
  await updateTnDraft(other, second, stored.token, d => d!).then(() => { throw Error("Utlogget skriver ble akseptert"); }, e => check(e instanceof TnLocalConflict, "Utlogging mangler sperre"));
  await activateTnDraftOwner(other);
  check((await listTnDrafts(other)).length === 0, "Utkast overlevde utlogging");
  report("PASS: utlogging sletter data og avviser forsinket skriving");
}
function report(text: string) { const li = document.createElement("li"); li.textContent = text; output.append(li); }
button.addEventListener("click", () => { button.disabled = true; output.replaceChildren(); void run().then(() => report("5 av 5 kontroller bestått"), e => report(`FAIL: ${e.message}`)).finally(() => { button.disabled = false; }); });
