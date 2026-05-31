// =============================================================================
// Tests: billing/webhook
// Tests Razorpay webhook signature verification and event processing.
// =============================================================================

import crypto from 'crypto';
import {
  verifyWebhookSignature,
  processWebhookEvent,
  WebhookVerificationError,
  type RazorpayWebhookPayload,
} from '@/lib/services/razorpay/webhooks';

process.env.RAZORPAY_WEBHOOK_SECRET = 'webhook_test_secret';

// ─── Mock all DB dependencies ─────────────────────────────────────────────────

jest.mock('@/lib/db/client', () => ({
  getDbClient: () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: () => ({
            data: table === 'subscriptions'
              ? { id: 'sub-row-1', user_id: 'user-1' }
              : null,
            error: null,
          }),
          in:     () => ({ single: () => ({ data: null, error: null }) }),
        }),
        in: () => ({ single: () => ({ data: null, error: null }) }),
      }),
      insert: () => ({ select: () => ({ single: () => ({ data: { id: 'evt-1' }, error: null }) }) }),
      update: () => ({ eq: () => ({ data: null, error: null }) }),
    }),
  }),
}));

jest.mock('@/lib/db/queries/billing', () => ({
  insertWebhookEvent:       jest.fn().mockResolvedValue('evt-1'),
  markWebhookProcessed:     jest.fn().mockResolvedValue(undefined),
  updateSubscriptionStatus: jest.fn().mockResolvedValue(undefined),
  insertPayment:            jest.fn().mockResolvedValue({}),
  upsertCustomer:           jest.fn().mockResolvedValue({}),
  createSubscriptionRecord: jest.fn().mockResolvedValue({}),
}));

jest.mock('@/lib/db/queries/users', () => ({
  updateUserPlan:               jest.fn().mockResolvedValue(undefined),
  updateUserSubscriptionStatus: jest.fn().mockResolvedValue(undefined),
}));

import { insertWebhookEvent, markWebhookProcessed, updateSubscriptionStatus } from '@/lib/db/queries/billing';
import { updateUserPlan, updateUserSubscriptionStatus } from '@/lib/db/queries/users';

const mockInsertEvent      = insertWebhookEvent      as jest.MockedFunction<typeof insertWebhookEvent>;
const mockMarkProcessed    = markWebhookProcessed    as jest.MockedFunction<typeof markWebhookProcessed>;
const mockUpdateSubStatus  = updateSubscriptionStatus as jest.MockedFunction<typeof updateSubscriptionStatus>;
const mockUpdateUserPlan   = updateUserPlan           as jest.MockedFunction<typeof updateUserPlan>;
const mockUpdateUserSubStatus = updateUserSubscriptionStatus as jest.MockedFunction<typeof updateUserSubscriptionStatus>;

beforeEach(() => jest.clearAllMocks());

// ─── verifyWebhookSignature ───────────────────────────────────────────────────

describe('verifyWebhookSignature', () => {
  function makeWebhookSig(body: string): string {
    return crypto
      .createHmac('sha256', 'webhook_test_secret')
      .update(body)
      .digest('hex');
  }

  test('does not throw for valid signature', () => {
    const body = JSON.stringify({ event: 'payment.captured' });
    const sig  = makeWebhookSig(body);
    expect(() => verifyWebhookSignature(body, sig)).not.toThrow();
  });

  test('throws WebhookVerificationError for invalid signature', () => {
    expect(() => verifyWebhookSignature('{"event":"payment.captured"}', 'badsig')).toThrow(
      WebhookVerificationError,
    );
  });

  test('throws for tampered payload', () => {
    const original = '{"event":"payment.captured"}';
    const sig = makeWebhookSig(original);
    expect(() => verifyWebhookSignature('{"event":"payment.failed"}', sig)).toThrow(
      WebhookVerificationError,
    );
  });
});

// ─── processWebhookEvent ─────────────────────────────────────────────────────

function makePayload(event: string, extra: object = {}): RazorpayWebhookPayload {
  return {
    event,
    payload: {
      subscription: {
        entity: {
          id:           'sub_test123',
          plan_id:      'plan_pro_placeholder',
          status:       'active',
          current_start: 1000000000,
          current_end:   1002000000,
          ...extra,
        },
      },
    },
    created_at: 1000000000,
  };
}

describe('processWebhookEvent — subscription.activated', () => {
  test('updates subscription status to active and upgrades user plan', async () => {
    await processWebhookEvent('evt-activated-1', makePayload('subscription.activated'));
    expect(mockUpdateSubStatus).toHaveBeenCalledWith('sub_test123', 'active', expect.any(Object));
    expect(mockUpdateUserPlan).toHaveBeenCalledWith(expect.any(String), 'pro');
    expect(mockUpdateUserSubStatus).toHaveBeenCalledWith(expect.any(String), 'active');
  });
});

describe('processWebhookEvent — subscription.cancelled', () => {
  test('reverts user plan to free and marks status cancelled', async () => {
    await processWebhookEvent('evt-cancelled-1', makePayload('subscription.cancelled'));
    expect(mockUpdateUserPlan).toHaveBeenCalledWith(expect.any(String), 'free');
    expect(mockUpdateUserSubStatus).toHaveBeenCalledWith(expect.any(String), 'cancelled');
  });
});

describe('processWebhookEvent — idempotency', () => {
  test('marks event as processed after successful handling', async () => {
    await processWebhookEvent('evt-idem-1', makePayload('subscription.activated'));
    expect(mockMarkProcessed).toHaveBeenCalledWith('evt-1', null);
  });
});
