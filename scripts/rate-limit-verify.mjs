/**
 * Verifies rate-limit behavior used by checkout and admin media routes.
 * Run: node --experimental-strip-types scripts/rate-limit-verify.mjs
 */
import {
  allowAdminMedia,
  allowCheckout,
  CHECKOUT_RATE_LIMIT,
  CHECKOUT_RATE_LIMIT_MESSAGE,
  pruneRateLimitBuckets,
  rateLimit,
  rateLimitBucketCount
} from '../src/lib/rate-limit.ts';

function assert(ok, label) {
  if (!ok) {
    console.error('FAIL', label);
    process.exitCode = 1;
    return;
  }
  console.log('PASS', label);
}

const checkoutIp = `verify-checkout-${Date.now()}`;
const checkoutResults = [];
for (let i = 1; i <= CHECKOUT_RATE_LIMIT + 1; i += 1) {
  const allowed = allowCheckout(checkoutIp);
  checkoutResults.push(allowed);
  if (!allowed) {
    const message = CHECKOUT_RATE_LIMIT_MESSAGE;
    assert(
      message === 'Too many orders submitted. Please wait a few minutes and try again.',
      `6th checkout returns: ${message}`
    );
  }
}
assert(
  checkoutResults.slice(0, CHECKOUT_RATE_LIMIT).every(Boolean),
  `first ${CHECKOUT_RATE_LIMIT} checkout calls allowed`
);
assert(checkoutResults[CHECKOUT_RATE_LIMIT] === false, '6th checkout call rejected');

const adminId = `verify-admin-${Date.now()}`;
let adminAllowed = 0;
let adminBlocked = 0;
for (let i = 0; i < 100; i += 1) {
  if (allowAdminMedia(adminId)) adminAllowed += 1;
  else adminBlocked += 1;
}
assert(adminAllowed === 60, `admin loop allows 60/min (got ${adminAllowed})`);
assert(adminBlocked === 40, `admin loop blocks the rest (got ${adminBlocked})`);

const otherAdmin = `verify-admin-other-${Date.now()}`;
assert(allowAdminMedia(otherAdmin) === true, 'a second admin is not blocked by the first loop');

const leakKey = `leak-${Date.now()}`;
rateLimit(leakKey, 1, 1);
await new Promise((resolve) => setTimeout(resolve, 5));
const beforePrune = rateLimitBucketCount();
pruneRateLimitBuckets();
const afterPrune = rateLimitBucketCount();
assert(beforePrune >= 1, `buckets exist before prune (${beforePrune})`);
assert(afterPrune < beforePrune, `prune drops expired keys (${beforePrune} → ${afterPrune})`);

if (process.exitCode) {
  process.exit(1);
}
console.log('RATE LIMIT VERIFY PASS');
