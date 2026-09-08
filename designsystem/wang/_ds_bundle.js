/* @ds-bundle: {"format":4,"namespace":"DesignSystem_35c50e","components":[],"sourceHashes":{"eksport/designsystem-wang/fasit/arsplan-2026-27/ds-base.js":"d7fa04286356","eksport/designsystem-wang/fasit/arsplan-2026-27/ukesrapporter.js":"4e04fd204f83","fasit/arsplan-2026-27/ds-base.js":"d7fa04286356","fasit/arsplan-2026-27/ukesrapporter.js":"4e04fd204f83"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DesignSystem_35c50e = window.DesignSystem_35c50e || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// eksport/designsystem-wang/fasit/arsplan-2026-27/ds-base.js
try { (() => {
// Loads the bound WANG design system into this page.
(() => {
  const base = '_ds/wang-toppidrett-software-be77fcdb-7e1e-4341-aa67-23f21370ad8a';
  for (const p of ["tokens/fonts.css", "tokens/colors.css", "tokens/typography.css", "tokens/spacing.css", "tokens/base.css", "styles.css"]) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = base + '/' + p;
    document.head.appendChild(l);
  }
  const s = document.createElement('script');
  s.src = base + '/_ds_bundle.js';
  s.onerror = () => console.error('ds-base.js: failed to load ' + s.src);
  document.head.appendChild(s);
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "eksport/designsystem-wang/fasit/arsplan-2026-27/ds-base.js", error: String((e && e.message) || e) }); }

// eksport/designsystem-wang/fasit/arsplan-2026-27/ukesrapporter.js
try { (() => {
/* Ukesrapporter — leses inn av treneren hver fredag.
 *
 * Claude Code: legg NYE rapporter først i lista. Format:
 *
 *   {
 *     uke: 35,                                   // ukenummer
 *     datoer: '24.–28. august 2026',              // treningsuken rapporten gjelder
 *     periode: 'Turneringsperiode',               // periode i årsplanen
 *     maalsetning: 'Én setning om hva uken skulle gi.',
 *     fokus: ['Kort punkt', 'Kort punkt'],        // 2–4 fokusområder
 *     gjennomfort: ['Man: …', 'Ons: …', 'Fre: …'],// hva som faktisk ble gjort
 *     hoydepunkt: 'Én setning foreldrene bør merke seg.',
 *     neste: 'Hva som skjer neste uke.',
 *     trener: 'Anders Kristiansen',
 *   }
 */
window.WANGRAPPORTER = [];
})(); } catch (e) { __ds_ns.__errors.push({ path: "eksport/designsystem-wang/fasit/arsplan-2026-27/ukesrapporter.js", error: String((e && e.message) || e) }); }

// fasit/arsplan-2026-27/ds-base.js
try { (() => {
// Loads the bound WANG design system into this page.
(() => {
  const base = '_ds/wang-toppidrett-software-be77fcdb-7e1e-4341-aa67-23f21370ad8a';
  for (const p of ["tokens/fonts.css", "tokens/colors.css", "tokens/typography.css", "tokens/spacing.css", "tokens/base.css", "styles.css"]) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = base + '/' + p;
    document.head.appendChild(l);
  }
  const s = document.createElement('script');
  s.src = base + '/_ds_bundle.js';
  s.onerror = () => console.error('ds-base.js: failed to load ' + s.src);
  document.head.appendChild(s);
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "fasit/arsplan-2026-27/ds-base.js", error: String((e && e.message) || e) }); }

// fasit/arsplan-2026-27/ukesrapporter.js
try { (() => {
/* Ukesrapporter — leses inn av treneren hver fredag.
 *
 * Claude Code: legg NYE rapporter først i lista. Format:
 *
 *   {
 *     uke: 35,                                   // ukenummer
 *     datoer: '24.–28. august 2026',              // treningsuken rapporten gjelder
 *     periode: 'Turneringsperiode',               // periode i årsplanen
 *     maalsetning: 'Én setning om hva uken skulle gi.',
 *     fokus: ['Kort punkt', 'Kort punkt'],        // 2–4 fokusområder
 *     gjennomfort: ['Man: …', 'Ons: …', 'Fre: …'],// hva som faktisk ble gjort
 *     hoydepunkt: 'Én setning foreldrene bør merke seg.',
 *     neste: 'Hva som skjer neste uke.',
 *     trener: 'Anders Kristiansen',
 *   }
 */
window.WANGRAPPORTER = [];
})(); } catch (e) { __ds_ns.__errors.push({ path: "fasit/arsplan-2026-27/ukesrapporter.js", error: String((e && e.message) || e) }); }

})();
