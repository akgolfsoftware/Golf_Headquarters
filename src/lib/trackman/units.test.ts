import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  csvShotsToCanonical,
  distanceToMeters,
  htmlReportToCanonical,
  speedToMph,
} from "./canonical";
import {
  byggTrackManCsvMedValgteSlag,
  parseTrackManCsv,
} from "./parse-csv";
import { parseTrackManHtmlReport } from "./parse-html-report";
import { trackManShotsForPreview } from "./preview";

function csvShots(csv: string) {
  const parsed = parseTrackManCsv(csv);
  if (!parsed.ok) assert.fail(parsed.error);
  return parsed.sessions.flatMap((session) => session.rawJson.shots);
}

function htmlReport(
  speedUnit: string,
  distanceUnit: string,
  clubSpeed: number,
  ballSpeed: number,
  total: number,
) {
  return parseTrackManHtmlReport(`
    <html><body>
      <div>Club Speed (${speedUnit})</div>
      <div>Ball Speed (${speedUnit})</div>
      <div>Total Distance (${distanceUnit})</div>
      <div>9/11/2026 Synthetic Session 2026-09-11</div>
      <section>2026-09-11 7i SevenIron Hide
        1. ${clubSpeed} 0 0 0 0 ${ballSpeed} 0 1.2 ${total} 0
        Average ${clubSpeed} 0 0 0 0 ${ballSpeed} 0 1.2 ${total} 0
        Consistency 0 0 0 0 0 0 0 0 0 0
      </section>
    </body></html>
  `);
}

describe("eksplisitte TrackMan-enheter", () => {
  it("lar oppgitt mph og m/s styre også ved grenseverdiene 60 og 70", () => {
    assert.equal(speedToMph(60, "mph"), 60);
    assert.equal(speedToMph(70, "mph"), 70);
    assert.equal(speedToMph(60, "m/s"), 134.22);
    assert.equal(speedToMph(70, "m/s"), 156.59);
  });

  it("lar oppgitt meter og yards styre også ved 320 og 330", () => {
    assert.equal(distanceToMeters(320, "m"), 320);
    assert.equal(distanceToMeters(330, "m"), 330);
    assert.equal(distanceToMeters(320, "yd"), 292.61);
    assert.equal(distanceToMeters(330, "yd"), 301.75);
  });

  it("gir null for en uttrykkelig ukjent enhet", () => {
    assert.equal(speedToMph(70, "unknown"), null);
    assert.equal(distanceToMeters(330, "unknown"), null);
  });
});

describe("CSV-enheter gjennom hele normaliseringen", () => {
  it("bevarer m/s, mph, meter og yards fra overskriftene", () => {
    const shots = csvShots(
      [
        "Date,Club,Club Speed (mph),Ball Speed (m/s),Carry (m),Total (yd),Side (yd)",
        "2026-09-11,Driver,60,70,330,320,5",
      ].join("\n"),
    );

    assert.deepEqual(shots[0]?.sourceUnits, {
      clubSpeed: "mph",
      ballSpeed: "m/s",
      carry: "m",
      total: "yd",
      side: "yd",
    });

    const canonical = csvShotsToCanonical(shots)[0];
    assert.equal(canonical?.clubSpeedMph, 60);
    assert.equal(canonical?.ballSpeedMph, 156.59);
    assert.equal(canonical?.carryMeters, 330);
    assert.equal(canonical?.totalMeters, 292.61);
    assert.equal(canonical?.sideMeters, 4.57);
  });

  it("gir forhåndsvisningen canonical mph og meter", () => {
    const preview = trackManShotsForPreview(
      csvShots("Date,Club,Ball Speed (mph),Carry (yd)\n2026-09-11,Driver,70,330"),
    )[0];
    assert.equal(preview?.ballSpeedMph, 70);
    assert.equal(preview?.carryMeters, 301.75);
  });

  it("holder carry ukjent når CSV-en bare har total", () => {
    const canonical = csvShotsToCanonical(
      csvShots("Date,Club,Ball Speed (mph),Total (m)\n2026-09-11,Driver,70,330"),
    )[0];
    assert.equal(canonical?.ballSpeedMph, 70);
    assert.equal(canonical?.carryMeters, null);
    assert.equal(canonical?.totalMeters, 330);
  });

  it("gjetter ikke når en CSV oppgir en enhet vi ikke støtter", () => {
    const canonical = csvShotsToCanonical(
      csvShots("Date,Club,Ball Speed (km/h),Carry (ft)\n2026-09-11,Driver,70,330"),
    )[0];
    assert.equal(canonical?.ballSpeedMph, null);
    assert.equal(canonical?.carryMeters, null);
  });

  it("leser en egen enhetsrad med deg og rpm uten å gjøre den til et slag", () => {
    const shots = csvShots(
      [
        "Date,Club,Club Speed,Ball Speed,Carry,Total,Launch Angle,Spin Rate,Side",
        ",,mph,m/s,yd,m,deg,rpm,yd",
        "2026-09-11,Driver,70,60,330,320,12,2400,5",
      ].join("\n"),
    );

    assert.equal(shots.length, 1);
    assert.deepEqual(shots[0]?.sourceUnits, {
      clubSpeed: "mph",
      ballSpeed: "m/s",
      carry: "yd",
      total: "m",
      side: "yd",
    });
    const canonical = csvShotsToCanonical(shots)[0];
    assert.equal(canonical?.clubSpeedMph, 70);
    assert.equal(canonical?.ballSpeedMph, 134.22);
    assert.equal(canonical?.carryMeters, 301.75);
    assert.equal(canonical?.totalMeters, 320);
    assert.equal(canonical?.sideMeters, 4.57);
  });

  it("beholder enhetsraden og velger faktiske slagrader med riktig indeks", () => {
    const csv = [
      "Date,Club,Ball Speed,Carry,Launch Angle,Spin Rate",
      ",,mph,yd,deg,rpm",
      "2026-09-11,Driver,150,280,12,2400",
      "2026-09-11,7-jern,120,170,18,6200",
    ].join("\n");

    const onlyFirst = csvShots(byggTrackManCsvMedValgteSlag(csv, new Set([0])));
    const onlyLast = csvShots(byggTrackManCsvMedValgteSlag(csv, new Set([1])));

    assert.equal(onlyFirst.length, 1);
    assert.equal(onlyFirst[0]?.club, "Driver");
    assert.equal(onlyFirst[0]?.sourceUnits?.carry, "yd");
    assert.equal(onlyLast.length, 1);
    assert.equal(onlyLast[0]?.club, "7-jern");
    assert.equal(onlyLast[0]?.sourceUnits?.ballSpeed, "mph");
  });

  it("merker ukjente enheter i en egen enhetsrad uten å gjette", () => {
    const canonical = csvShotsToCanonical(
      csvShots(
        [
          "Date,Club,Ball Speed,Carry,Launch Angle,Spin Rate",
          ",,km/h,ft,deg,rpm",
          "2026-09-11,Driver,240,900,12,2400",
        ].join("\n"),
      ),
    )[0];

    assert.equal(canonical?.ballSpeedMph, null);
    assert.equal(canonical?.carryMeters, null);
  });
});

describe("HTML-enheter gjennom hele normaliseringen", () => {
  it("bevarer eksplisitte metriske enheter og skiller total fra carry", () => {
    const report = htmlReport("m/s", "m", 60, 70, 330);
    assert.deepEqual(report.sourceUnits, {
      clubSpeed: "m/s",
      ballSpeed: "m/s",
      totalDistance: "m",
    });
    const canonical = htmlReportToCanonical(report)[0];
    assert.equal(canonical?.clubSpeedMph, 134.22);
    assert.equal(canonical?.ballSpeedMph, 156.59);
    assert.equal(canonical?.carryMeters, null);
    assert.equal(canonical?.totalMeters, 330);
  });

  it("bevarer eksplisitte imperiale enheter ved de gamle tersklene", () => {
    const canonical = htmlReportToCanonical(htmlReport("mph", "yards", 60, 70, 320))[0];
    assert.equal(canonical?.clubSpeedMph, 60);
    assert.equal(canonical?.ballSpeedMph, 70);
    assert.equal(canonical?.carryMeters, null);
    assert.equal(canonical?.totalMeters, 292.61);
  });

  it("gjetter ikke når HTML-rapporten oppgir ukjente enheter", () => {
    const canonical = htmlReportToCanonical(htmlReport("km/h", "feet", 60, 70, 330))[0];
    assert.equal(canonical?.clubSpeedMph, null);
    assert.equal(canonical?.ballSpeedMph, null);
    assert.equal(canonical?.carryMeters, null);
    assert.equal(canonical?.totalMeters, null);
  });
});

describe("eldre data uten enhet", () => {
  it("beholder den dokumenterte terskel-reserveveien", () => {
    assert.equal(speedToMph(60), 134.22);
    assert.equal(speedToMph(70), 70);
    assert.equal(distanceToMeters(320), 320);
    assert.equal(distanceToMeters(330), 301.75);
  });
});
