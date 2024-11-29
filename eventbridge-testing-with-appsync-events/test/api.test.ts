import "dotenv/config";

import { afterAll, describe, expect, it } from "vitest";
import { subscribe } from "./subscribe";

describe("When an order is created", async () => {
  const API_URL = process.env.API_URL || "";

  const subscription = await subscribe("default", "debug");

  afterAll(async () => {
    subscription.unsubscribe();
  });

  it("It should publish an OrderCreated event to EventBridge", async () => {
    const response = await fetch(`${API_URL}/event`, { method: "POST" });
    expect(response.status).toBe(201);

    const order = await response.json();

    const message = await subscription.waitForMessageMatching({
      source: "OrderService",
      "detail-type": "OrderCreated",
      detail: {
        id: order.id,
        name: order.name,
      },
    });

    expect(message).not.toBeNull();
  }, 5000);
});
