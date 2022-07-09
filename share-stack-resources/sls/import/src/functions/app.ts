import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;

    try {
        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'hello world',
                paramFromOutput: process.env.TABLE_NAME_FROM_OUTPUT,
                paramFromSSMDeployTime: process.env.TABLE_NAME_FROM_SSM,
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
