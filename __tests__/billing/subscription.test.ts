// =============================================================================
// Tests: billing/subscription
// Tests Razorpay subscription creation and cancellation.
// =============================================================================

import {
  createRazorpaySubscription,
  cancelRazorpaySubscription,
  getRazorpaySubscription,
} from '@/lib/services/razorpay/subscriptions';

// Mock the Razorpay SDK client
const mockCreate = jest.fn();
const mockCancel = jest.fn();
const mockFetch  = jest.fn();

jest.mock('@/lib/services/razorpay/client', () => ({
  getRazorpay: () => ({
    subscriptions: { create: mockCreate, cancel: mockCancel, fetch: mockFetch },
  }),
}));

beforeEach(() => jest.clearAllMocks());

describe('createRazorpaySubscription', () => {
  test('calls Razorpay API with correct parameters', async () => {
    mockCreate.mockResolvedValueOnce({
      id:        'sub_test123',
      plan_id:   'plan_pro',
      status:    'created',
      short_url: 'https://rzp.io/l/test',
    });

    const result = await createRazorpaySubscription('cust_123', 'plan_pro', 12);
    expect(result.id).toBe('sub_test123');
    expect(result.shortUrl).toBe('https://rzp.io/l/test');
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      plan_id:     'plan_pro',
      customer_id: 'cust_123',
      total_count: 12,
    }));
  });

  test('returns subscriptionId from Razorpay response', async () => {
    mockCreate.mockResolvedValueOnce({ id: 'sub_456', plan_id: 'plan_team', status: 'created', short_url: '' });
    const result = await createRazorpaySubscription('cust_999', 'plan_team');
    expect(result.id).toBe('sub_456');
    expect(result.status).toBe('created');
  });
});

describe('cancelRazorpaySubscription', () => {
  test('calls Razorpay cancel with cancelAtCycleEnd=true by default', async () => {
    mockCancel.mockResolvedValueOnce({ id: 'sub_123', status: 'cancelled' });
    await cancelRazorpaySubscription('sub_123');
    expect(mockCancel).toHaveBeenCalledWith('sub_123', true);
  });

  test('calls with cancelAtCycleEnd=false when specified', async () => {
    mockCancel.mockResolvedValueOnce({ id: 'sub_123', status: 'cancelled' });
    await cancelRazorpaySubscription('sub_123', false);
    expect(mockCancel).toHaveBeenCalledWith('sub_123', false);
  });
});

describe('getRazorpaySubscription', () => {
  test('fetches subscription status', async () => {
    mockFetch.mockResolvedValueOnce({ id: 'sub_abc', status: 'active', plan_id: 'plan_pro' });
    const result = await getRazorpaySubscription('sub_abc');
    expect(result.status).toBe('active');
    expect(result.id).toBe('sub_abc');
  });
});
