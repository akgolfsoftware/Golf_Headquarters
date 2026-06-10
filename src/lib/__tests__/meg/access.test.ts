import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parsePersoner,
  finnPerson,
  adminSubject,
  toolsForRolle,
} from "@/lib/meg/access";

describe("parsePersoner", () => {
  it("leser MEG_ALLOWED_PEOPLE (JSON) med roller", () => {
    const personer = parsePersoner({
      MEG_ALLOWED_PEOPLE: JSON.stringify([
        { chatId: "8701859629", navn: "Anders", rolle: "admin" },
        { chatId: 123456, navn: "Markus", rolle: "coach" },
      ]),
    });
    assert.equal(personer.length, 2);
    assert.equal(personer[0].navn, "Anders");
    assert.equal(personer[1].chatId, "123456");
    assert.equal(personer[1].rolle, "coach");
  });

  it("faller tilbake til legacy enkelt-admin", () => {
    const personer = parsePersoner({ MEG_TELEGRAM_ALLOWED_CHAT_ID: "999" });
    assert.equal(personer.length, 1);
    assert.equal(personer[0].chatId, "999");
    assert.equal(personer[0].rolle, "admin");
  });

  it("returnerer tom liste uten konfig", () => {
    assert.deepEqual(parsePersoner({}), []);
  });

  it("faller tilbake til legacy ved ugyldig JSON", () => {
    const personer = parsePersoner({
      MEG_ALLOWED_PEOPLE: "{ ikke gyldig",
      MEG_TELEGRAM_ALLOWED_CHAT_ID: "777",
    });
    assert.equal(personer.length, 1);
    assert.equal(personer[0].chatId, "777");
  });
});

describe("finnPerson", () => {
  const personer = parsePersoner({
    MEG_ALLOWED_PEOPLE: JSON.stringify([
      { chatId: "111", navn: "Anders", rolle: "admin" },
      { chatId: "222", navn: "Markus", rolle: "coach" },
    ]),
  });

  it("finner person på chat-id (number eller string)", () => {
    assert.equal(finnPerson(222, personer)?.navn, "Markus");
    assert.equal(finnPerson("111", personer)?.rolle, "admin");
  });

  it("avviser ukjent avsender og null", () => {
    assert.equal(finnPerson(999, personer), null);
    assert.equal(finnPerson(null, personer), null);
  });
});

describe("adminSubject", () => {
  it("gir admin sin chat-id", () => {
    const s = adminSubject({
      MEG_ALLOWED_PEOPLE: JSON.stringify([
        { chatId: "222", navn: "Markus", rolle: "coach" },
        { chatId: "111", navn: "Anders", rolle: "admin" },
      ]),
    });
    assert.equal(s, "111");
  });
});

describe("toolsForRolle", () => {
  it("coach får kun trygge arbeidsverktøy", () => {
    const navn = toolsForRolle("coach").map((t) => t.name);
    assert.deepEqual(navn.sort(), ["hent_nylige", "logg"]);
  });

  it("coach har ingen private kilder (gmail/disk/helse/kalender/minne)", () => {
    const navn = new Set(toolsForRolle("coach").map((t) => t.name));
    for (const forbudt of ["gmail_sok", "disk_sok", "helse_hent", "kalender_agenda", "sok_minne"]) {
      assert.equal(navn.has(forbudt), false, `coach skal ikke ha ${forbudt}`);
    }
  });

  it("admin får flere verktøy enn coach", () => {
    assert.ok(toolsForRolle("admin").length > toolsForRolle("coach").length);
  });
});
