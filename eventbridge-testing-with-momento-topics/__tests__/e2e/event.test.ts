import 'dotenv/config';
import { subscribe } from '../lib/subscribe';

const API_URL = process.env.API_URL || '';

describe('When an order is created', async () => {
  const subscription = await subscribe();
  let order: { id: string; name: string };

  beforeAll(async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
    });
    expect(response.status).toBe(201);

    order = await response.json();
  });

  afterAll(async () => {
    subscription.unsubscribe();
  });

  it('It should publish an OrderCreated event to EventBridge', async () => {
    const message = await subscription.waitForMessageMatching({
      source: 'OrderService',
      'detail-type': 'OrderCreated',
      detail: {
        id: order.id,
        name: order.name,
      },
    });

    expect(message).not.toBeNull();
  }, 5000);
});
