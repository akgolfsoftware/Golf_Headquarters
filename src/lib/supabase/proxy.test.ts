import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";

let refresh = false;
mock.module("@supabase/ssr", {
  namedExports: {
    createServerClient: (_url: string, _key: string, options: {
      cookies: { setAll: (cookies: Array<{ name: string; value: string; options: CookieOptions }>) => void };
    }) => ({
      auth: {
        getUser: async () => {
          if (refresh) options.cookies.setAll([{ name: "synthetic-session", value: "renewed", options: { httpOnly: true } }]);
          return { data: { user: null } };
        },
      },
    }),
  },
});


for (const shouldRefresh of [false, true]) {
  test(`serverens CSP følger renderingen ${shouldRefresh ? "etter" : "uten"} cookie-fornyelse`, async () => {
    const { updateSession } = await import("./proxy");
    refresh = shouldRefresh;
    const request = new NextRequest("http://localhost/team-wang/logg-inn", {
      headers: { "x-nonce": "untrusted-client", "content-security-policy": "script-src *" },
    });
    const csp = "script-src 'nonce-synthetic-server' 'strict-dynamic'";
    const response = await updateSession(request, "synthetic-server", csp);
    assert.equal(response.headers.get("x-middleware-request-content-security-policy"), csp);
    assert.equal(response.headers.get("x-middleware-request-x-nonce"), "synthetic-server");
    assert.equal(response.headers.get("x-middleware-request-x-pathname"), "/team-wang/logg-inn");
    if (shouldRefresh) {
      assert.equal(request.cookies.get("synthetic-session")?.value, "renewed");
      assert.equal(response.cookies.get("synthetic-session")?.value, "renewed");
    }
  });
}
