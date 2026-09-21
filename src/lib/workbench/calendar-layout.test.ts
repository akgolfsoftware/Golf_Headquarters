import { test } from "node:test";
import assert from "node:assert/strict";
import { calendarLanes } from "./calendar-layout";

test("korte kort får egne kolonner når 44 px-trefflatene overlapper", () => {
  const result = calendarLanes([{id:"a",startMinute:600,durationMinutes:30},{id:"b",startMinute:660,durationMinutes:30}]);
  assert.deepEqual(result.get("a"),{lane:0,count:2});
  assert.deepEqual(result.get("b"),{lane:1,count:2});
});
test("kjeder av overlapp bruker samme kolonnebredde og gjenbruker ledige kolonner", () => {
  const result = calendarLanes([{id:"c",startMinute:660,durationMinutes:60},{id:"a",startMinute:600,durationMinutes:60},{id:"b",startMinute:630,durationMinutes:60},{id:"d",startMinute:900,durationMinutes:30}],0);
  assert.deepEqual(result.get("a"),{lane:0,count:2});
  assert.deepEqual(result.get("b"),{lane:1,count:2});
  assert.deepEqual(result.get("c"),{lane:0,count:2});
  assert.deepEqual(result.get("d"),{lane:0,count:1});
});
test("samme starttid gir stabil rekkefølge uten å endre originalen", () => {
  const input=[{id:"b",startMinute:600,durationMinutes:90},{id:"a",startMinute:600,durationMinutes:90}];
  assert.deepEqual(calendarLanes(input).get("a"),{lane:0,count:2});
  assert.equal(input[0].id,"b");
});
