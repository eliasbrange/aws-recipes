import "dotenv/config";
import { Amplify } from "aws-amplify";
import { events } from "aws-amplify/data";
import * as _ from "lodash";
import { ReplaySubject, firstValueFrom } from "rxjs";
import { filter } from "rxjs/operators";
import { WebSocket } from "ws";

// @ts-expect-error type
globalThis.WebSocket = WebSocket;

Amplify.configure({
  API: {
    Events: {
      endpoint: process.env.EVENTS_API_URL || "missing",
      defaultAuthMode: "apiKey",
      apiKey: process.env.EVENTS_API_KEY || "missing",
    },
  },
});

export const subscribe = async (namespace: string, channelName: string) => {
  const messages = new ReplaySubject(100);

  const channel = await events.connect(`/${namespace}/${channelName}`);
  channel.subscribe({
    next: (data) => {
      messages.next(data.event);
    },
    error: (err) => console.error("error", err),
  });

  // Give the subscription some time to establish
  await new Promise((resolve) => setTimeout(resolve, 250));

  const unsubscribe = async () => {
    channel.close();
  };

  const waitForMessageMatching = async (expected: object) => {
    const predicate = (message: unknown) => {
      if (typeof message !== "object" || message === null) {
        return false;
      }

      return _.isMatch(message, expected);
    };

    const data = messages.pipe(filter((message) => predicate(message)));
    return firstValueFrom(data);
  };

  return {
    unsubscribe,
    waitForMessageMatching,
  };
};
