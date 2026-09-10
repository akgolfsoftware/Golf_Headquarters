import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import { naivOsloTilTidspunkt } from "@/lib/google-calendar-tid";
import { hoursUntil, cancellationDeadline } from "./policy";

test("kalender og 24-timersfrist bruker reell Oslo-tid om vinteren og sommeren", () => {
  assert.equal(naivOsloTilTidspunkt(new Date(2026, 0, 15, 10, 30)).toISOString(), "2026-01-15T09:30:00.000Z");
  assert.equal(naivOsloTilTidspunkt(new Date(2026, 6, 15, 10, 30)).toISOString(), "2026-07-15T08:30:00.000Z");
  assert.equal(hoursUntil(new Date(2026, 2, 29, 12), new Date("2026-03-28T10:00:00Z")), 24);
  assert.equal(hoursUntil(new Date(2026, 9, 25, 12), new Date("2026-10-24T11:00:00Z")), 24);
});

test("bookingens klokkeslett bevares mellom server og nettleser i ulike tidssoner", () => {
  for (const serverZone of ["UTC", "Europe/Oslo"]) {
    const encoded = execFileSync(process.execPath, ["--import", "tsx", "--eval", `
      const {fraNaivVeggklokke}=require('./src/lib/google-calendar-tid.ts');
      process.stdout.write(JSON.stringify([0,6].map(m=>fraNaivVeggklokke(new Date(2026,m,15,10,30,0)))));
    `], { encoding: "utf8", env: { ...process.env, TZ: serverZone } });
    assert.deepEqual(JSON.parse(encoded), ["2026-01-15T10:30:00", "2026-07-15T10:30:00"]);
    for (const clientZone of ["UTC", "Europe/Oslo", "America/New_York", "Asia/Tokyo"]) {
      const received = execFileSync(process.execPath, ["--eval", `
        process.stdout.write(JSON.stringify(${encoded}.map(s=>{const d=new Date(s);return [d.getMonth(),d.getDate(),d.getHours(),d.getMinutes()]})));
      `], { encoding: "utf8", env: { ...process.env, TZ: clientZone } });
      assert.deepEqual(JSON.parse(received), [[0,15,10,30],[6,15,10,30]], `${serverZone} → ${clientZone}`);
    }
  }
});


test("e-postens avbestillingsfrist samsvarer med policy gjennom begge klokkeoverganger", () => {
  for (const [start, expected] of [
    [new Date(2026, 2, 29, 12), [2, 28, 11]],
    [new Date(2026, 9, 25, 12), [9, 24, 13]],
  ] as const) {
    const deadline = cancellationDeadline(start);
    assert.deepEqual([deadline.getMonth(), deadline.getDate(), deadline.getHours()], expected);
    assert.equal(hoursUntil(start, naivOsloTilTidspunkt(deadline)), 24);
  }
});
