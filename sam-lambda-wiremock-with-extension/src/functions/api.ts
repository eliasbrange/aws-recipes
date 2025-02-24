import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const ANOTHER_SERVICE_URL = process.env.ANOTHER_SERVICE_URL;

export const handler = async (
  _event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const response = await fetch(`${ANOTHER_SERVICE_URL}/some-path`);

  return {
    statusCode: 200,
    body: JSON.stringify(await response.json()),
  };
};
