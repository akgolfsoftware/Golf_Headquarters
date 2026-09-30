import assert from "node:assert/strict";
import { mock, test } from "node:test";

mock.module("next/navigation", {
  namedExports: {
    redirect: (url: string) => {
      throw new Error(`REDIRECT:${url}`);
    },
  },
});

test("/portal/gjennomfore sender videre til I dag", async () => {
  const { default: side } = await import("./gjennomfore/page");
  assert.throws(() => side(), /REDIRECT:\/portal$/);
});

test("/portal/tren/wb sender videre til I dag", async () => {
  const { default: side } = await import("./(fullscreen)/tren/wb/page");
  assert.throws(() => side(), /REDIRECT:\/portal$/);
});
