import test from 'node:test';
import assert from 'node:assert/strict';
import { assertStripeTestSettings, isLocalStripeBrowserUrl, isOwnStripeCheckout } from '../../scripts/local-stripe-target.mjs';

test('test key accepted, live keys and additional providers rejected', () => {
  assert.doesNotThrow(() => assertStripeTestSettings({ STRIPE_SECRET_KEY: 'rk_test_synthetic' }));
  for (const settings of [{}, { STRIPE_SECRET_KEY: 'sk_live_synthetic' },
    { STRIPE_SECRET_KEY: 'sk_test_synthetic', RESEND_API_KEY: 'synthetic' }]) {
    assert.throws(() => assertStripeTestSettings(settings));
  }
});
test('browser is restricted to local app/Auth and HTTPS Stripe', () => {
  for (const url of ['http://127.0.0.1:3061/booking', 'https://checkout.stripe.com/c/pay/test', 'https://js.stripe.com/v3/']) {
    assert.equal(isLocalStripeBrowserUrl(url), true);
  }
  for (const url of ['https://akgolf.no', 'http://checkout.stripe.com', 'https://stripe.com.example.com',
    'https://evilstripe.com', 'https://stripe.com:8443', 'http://127.0.0.1:3000', 'https://user:password@stripe.com']) {
    assert.equal(isLocalStripeBrowserUrl(url), false);
  }
});
const booking = { id: 'synthetic', serviceTypeId: 'local-users-20261001-service',
  guestEmail: 'stripe-e2e-abcd-1234@akgolf.test', stripeCheckoutSessionId: 'cs_test_synthetic' };
const event = { livemode: false, type: 'checkout.session.completed', data: { object: {
  id: 'cs_test_synthetic', livemode: false, mode: 'payment', metadata: { bookingId: 'synthetic' },
} } };
test('relay only forwards our synthetic booking and matching checkout', () => {
  assert.equal(isOwnStripeCheckout(event, booking), true);
  assert.equal(isOwnStripeCheckout({ ...event, livemode: true }, booking), false);
  assert.equal(isOwnStripeCheckout(event, { ...booking, guestEmail: 'someone@example.com' }), false);
  assert.equal(isOwnStripeCheckout(event, { ...booking, stripeCheckoutSessionId: 'another' }), false);
  assert.equal(isOwnStripeCheckout(event, undefined), false);
});
