/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/jarvis/innstillinger.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SakKanal } from "@/generated/prisma/enums";
import { STANDARD_INNSTILLINGER } from "@/lib/jarvis/types";
import {
  filtrerSakerEtterKanal,
  iStilleTidsrom,
  kanalPa,
  osloTime,
  skalSendeJarvisTelegram,
  slaTerskelTimer,
} from "./innstillinger";

describe("osloTime / iStilleTidsrom", () => {
  it("22:00 Oslo sommertid er stille", () => {
    const na = new Date("2026-08-16T20:00:00Z"); // 22:00 CEST
    assert.equal(osloTime(na), 22);
    assert.equal(iStilleTidsrom(na, STANDARD_INNSTILLINGER), true);
  });

  it("21:59 Oslo er ikke stille", () => {
    const na = new Date("2026-08-16T19:59:00Z");
    assert.equal(osloTime(na), 21);
    assert.equal(iStilleTidsrom(na, STANDARD_INNSTILLINGER), false);
  });

  it("06:59 Oslo er stille, 07:00 er ikke", () => {
    assert.equal(iStilleTidsrom(new Date("2026-08-16T04:59:00Z"), STANDARD_INNSTILLINGER), true);
    assert.equal(iStilleTidsrom(new Date("2026-08-16T05:00:00Z"), STANDARD_INNSTILLINGER), false);
  });

  it("bryter av = aldri stille", () => {
    const inn = { ...STANDARD_INNSTILLINGER, stilleTidsromAktivert: false };
    assert.equal(iStilleTidsrom(new Date("2026-08-16T20:00:00Z"), inn), false);
  });
});

describe("kanalPa / filter", () => {
  it("skrur av Gmail uten å røre TASK", () => {
    const inn = { ...STANDARD_INNSTILLINGER, kanalGmail: false };
    assert.equal(kanalPa(inn, SakKanal.EPOST), false);
    assert.equal(kanalPa(inn, SakKanal.TASK), true);
    const saker = [{ kanal: SakKanal.EPOST }, { kanal: SakKanal.TASK }];
    assert.deepEqual(filtrerSakerEtterKanal(saker, inn).map((s) => s.kanal), [SakKanal.TASK]);
  });

  it("SMS og iMessage følger samme bryter", () => {
    const inn = { ...STANDARD_INNSTILLINGER, kanalImessage: false };
    assert.equal(kanalPa(inn, SakKanal.SMS), false);
    assert.equal(kanalPa(inn, SakKanal.IMESSAGE), false);
  });
});

describe("slaTerskelTimer / telegram", () => {
  it("klipper ugyldig SLA til default", () => {
    assert.equal(slaTerskelTimer({ ...STANDARD_INNSTILLINGER, slaTerskelTimer: 0 }), 6);
    assert.equal(slaTerskelTimer({ ...STANDARD_INNSTILLINGER, slaTerskelTimer: 99 }), 72);
  });

  it("telegram av i stille tidsrom", () => {
    const na = new Date("2026-08-16T20:00:00Z");
    assert.equal(skalSendeJarvisTelegram(STANDARD_INNSTILLINGER, na), false);
    assert.equal(
      skalSendeJarvisTelegram({ ...STANDARD_INNSTILLINGER, kanalTelegram: false }, new Date("2026-08-16T10:00:00Z")),
      false,
    );
    assert.equal(skalSendeJarvisTelegram(STANDARD_INNSTILLINGER, new Date("2026-08-16T10:00:00Z")), true);
  });
});
