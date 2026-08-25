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
