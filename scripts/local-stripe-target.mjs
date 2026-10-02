/** Only the explicitly requested Stripe test run may use an external provider. */
export function assertStripeTestSettings(settings) {
  if (Object.keys(settings).length === 2 &&
      /^oak_[A-Za-z0-9_-]+$/.test(settings.LOCAL_STRIPE_OAUTH_TOKEN ?? '') &&
      /^acct_[A-Za-z0-9]+$/.test(settings.LOCAL_STRIPE_ACCOUNT ?? '')) return;
  if (Object.keys(settings).length !== 1 ||
      !/^(sk|rk)_test_[A-Za-z0-9]+$/.test(settings.STRIPE_SECRET_KEY ?? '')) {
    throw new Error('Stripe tests require exactly one test-mode STRIPE_SECRET_KEY in the private test file');
  }
}

export function isLocalStripeBrowserUrl(value) {
  const url = new URL(value);
  if (url.username || url.password) return false;
  if (url.protocol === 'http:' && url.hostname === '127.0.0.1' && ['3061', '55621'].includes(url.port)) return true;
  return url.protocol === 'https:' && !url.port &&
    ['stripe.com', 'stripe.network', 'stripecdn.com', 'hcaptcha.com'].some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
}

/** Reject unrelated test-account events before sending anything to the app. */
export function isOwnStripeCheckout(event, booking) {
  const session = event?.data?.object;
  return event?.livemode === false && event.type === 'checkout.session.completed' &&
    session?.livemode === false && session.mode === 'payment' &&
    booking?.serviceTypeId === 'local-users-20261001-service' &&
    /^stripe-e2e-[a-f0-9-]+@akgolf\.test$/.test(booking.guestEmail ?? '') &&
    session.metadata?.bookingId === booking.id &&
    session.id === booking.stripeCheckoutSessionId;
}
