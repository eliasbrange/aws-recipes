import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handler } from '../../src/handlers/my-function';

describe('Unit test for app handler', function () {
  it('verifies successful response', async () => {
    const event: APIGatewayProxyEvent = {
      httpMethod: 'get',
      body: '',
      headers: {},
      isBase64Encoded: false,
      multiValueHeaders: {},
      multiValueQueryStringParameters: {},
      path: '/',
      pathParameters: {},
      queryStringParameters: {},
      requestContext: {
        accountId: '123456789012',
        apiId: '1234',
        authorizer: {},
        httpMethod: 'get',
        identity: {
          accessKey: '',
          accountId: '',
          apiKey: '',
          apiKeyId: '',
          caller: '',
          clientCert: {
            clientCertPem: '',
            issuerDN: '',
            serialNumber: '',
            subjectDN: '',
            validity: { notAfter: '', notBefore: '' },
          },
          cognitoAuthenticationProvider: '',
          cognitoAuthenticationType: '',
          cognitoIdentityId: '',
          cognitoIdentityPoolId: '',
          principalOrgId: '',
          sourceIp: '',
          user: '',
          userAgent: '',
          userArn: '',
        },
        path: '/',
        protocol: 'HTTP/1.1',
        requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
        requestTimeEpoch: 1428582896000,
        resourceId: '123456',
        resourcePath: '/',
        stage: 'dev',
      },
      resource: '',
      stageVariables: {},
    };
    const result: APIGatewayProxyResult = await handler(event);

    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      JSON.stringify({
        message: 'hello world',
      }),
    );
  });
});
