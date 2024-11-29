import type { EventBridgeEvent } from "aws-lambda";

const EVENTS_API_URL = process.env.EVENTS_API_URL || "missing";
const EVENTS_API_KEY = process.env.EVENTS_API_KEY || "missing";

export const handler = async (
  event: EventBridgeEvent<string, unknown>,
): Promise<void> => {
  await fetch(`${EVENTS_API_URL}/event`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": EVENTS_API_KEY,
    },
    body: JSON.stringify({
      channel: "/default/debug",
      events: [JSON.stringify(event)],
    }),
  });
};
