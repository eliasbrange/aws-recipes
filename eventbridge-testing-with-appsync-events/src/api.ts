import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ulid } from "ulid";

const ebClient = new EventBridgeClient();
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || "default";

export const handler = async (
  _event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const order = {
    id: ulid(),
    name: "test order",
  };

  await ebClient.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: EVENT_BUS_NAME,
          Source: "OrderService",
          DetailType: "OrderCreated",
          Detail: JSON.stringify(order),
        },
      ],
    }),
  );

  return {
    statusCode: 201,
    body: JSON.stringify(order),
  };
};
