import { APIGatewayProxyResult } from 'aws-lambda';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { ulid } from 'ulid';

const eventBridgeClient = new EventBridgeClient({});
const { EVENT_BUS } = process.env;

export const handler = async (): Promise<APIGatewayProxyResult> => {
  const order = {
    id: ulid(),
    name: 'test order',
  };

  await eventBridgeClient.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: EVENT_BUS,
          Source: 'OrderService',
          DetailType: 'OrderCreated',
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
