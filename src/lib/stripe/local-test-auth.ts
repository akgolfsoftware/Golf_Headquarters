import type Stripe from "stripe";

/** Stripe CLI OAuth is short-lived and uses explicit account + test-mode headers.
 * It is accepted only by the dedicated local development process, never a build
 * or a hosted deployment. Normal API-key authentication is unchanged.
 */
export function localStripeTestAuth(env: Record<string, string | undefined>): NonNullable<ConstructorParameters<typeof Stripe>[1]> {
  const token = env.LOCAL_STRIPE_OAUTH_TOKEN;
  if (!token) return {};
  const localDatabase = (value: string | undefined) => {
    try {
      const url = new URL(value ?? "");
      return ["postgres:", "postgresql:"].includes(url.protocol) && url.hostname === "127.0.0.1" &&
        url.port === "55622" && url.pathname === "/postgres" && !url.search && !url.hash;
    } catch { return false; }
  };
  if (env.NODE_ENV !== "development" || env.LOCAL_STRIPE_E2E !== "1" || env.STRIPE_SECRET_KEY ||
      env.LOCAL_USERS_PROJECT !== "ak-hq-brukere-20261001" ||
      env.NEXT_PUBLIC_APP_URL !== "http://127.0.0.1:3061" ||
      env.NEXT_PUBLIC_SUPABASE_URL !== "http://127.0.0.1:55621" ||
      !localDatabase(env.DATABASE_URL) || !localDatabase(env.DIRECT_URL) ||
      !/^oak_[A-Za-z0-9_-]+$/.test(token) || !/^acct_[A-Za-z0-9]+$/.test(env.LOCAL_STRIPE_ACCOUNT ?? "")) {
    throw new Error("Stripe CLI OAuth is restricted to the isolated local test process");
  }
  return {
    authenticator: async request => {
      if (request.host !== "api.stripe.com" || request.protocol !== "https" || String(request.port) !== "443") {
        throw new Error("Stripe test authentication requires the official HTTPS API");
      }
      request.headers.Authorization = `Bearer ${token}`;
      request.headers["Stripe-Context"] = env.LOCAL_STRIPE_ACCOUNT!;
      request.headers["Stripe-Livemode"] = "false";
    },
  };
}
