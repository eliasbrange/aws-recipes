# Test EventBridge with AppSync Events

This is a sample project to end-to-end test applications that uses EventBridge. It shows how to do this by using [AppSync Events](https://docs.aws.amazon.com/appsync/latest/eventapi/event-api-welcome.html).

The project includes a simple serverless application, built with CDK, that includes:

1. An API Gateway.
2. An EventBridge Bus
3. A Lambda function that is triggered on `POST /event` and sends an `OrderCreated` event to EventBridge.

To test the events, the project also includes the following resources:
1. An AppSync Events API with an API Key and default namespace.
2. An EventBridge Rule that forwards all events to the Lambda function.
3. A Lambda function that forwards events from EventBridge to the AppSync Events API.

## How to use

This project assumes that you have an AWS account and have the AWS CLI configured.

### Steps

1. Install dependencies with `npm install` (or `yarn`, `pnpm`, etc).
2. Deploy the application with `npm run cdk deploy`.
    - Take note of the `ApiUrl` and `EventsApiUrl` in the stack output.
3. Go to the AppSync console and find the newly created Events API.
    - On the settings page, take note `API Key` in the *Authorization configuration* section.
4. Create a `.env` file with the following contents:
    ```
    API_URL=<ApiUrlFromOutput>
    EVENTS_API_URL=<EventsApiUrlFromOutput>
    EVENTS_API_KEY=<AppSyncEventsApiKey>
    ```

    For example:
    ```
    API_URL=https://abcdefghij.execute-api.eu-west-1.amazonaws.com/prod/
    EVENTS_API_URL=https://abcdefghij12345678.appsync-api.eu-west-1.amazonaws.com/event
    EVENTS_API_KEY=da2-xyzxyzxyzxyzxyzxyz
    ```

   **Note: the `EVENTS_API_URL` should be on the format `https://<http-dns-endpoint>/event`**
5. Run tests with `npm test`.
