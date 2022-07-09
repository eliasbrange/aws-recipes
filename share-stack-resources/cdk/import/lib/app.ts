import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient({});
const input = { Name: '/cdk/tableName' };
const command = new GetParameterCommand(input);
const parameterPromise = ssmClient.send(command);

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;

    const parameter = await parameterPromise;
    try {
        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'hello world',
                paramFromOutput: process.env.TABLE_NAME_FROM_OUTPUT,
                paramFromSSMDeployTime: process.env.TABLE_NAME_FROM_SSM,
                paramFromSSMRunTime: parameter.Parameter?.Value,
            }),
        };
    } catch (err) {
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }

    return response;
};
