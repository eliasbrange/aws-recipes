# Test EventBridge with Momento Topics

This is a sample project to end-to-end test applications that uses EventBridge. It shows how to do this by using [Momento Topics](https://www.gomomento.com/services/topics).

The project includes a simple serverless application in `template.yaml` that includes:

1. An API Gateway.
2. An EventBridge Bus
3. A Lambda function that is triggered on `POST /` and sends an `OrderCreated` event to EventBridge.

It also includes a stack (`template-momento.yaml`) that contains resources to publish all events from the EventBridge Bus to a Momento Topic.

## How to use

This project assumes that you have a Momento account. If you don't, you can [sign up for a free account](https://www.gomomento.com/).

The project is configured to deploy to region `eu-west-1`. You can change this by editing the `region` properties in `samconfig.toml`. At the time of writing, Momento supports the following regions in AWS:

- `us-east-1`
- `us-east-2`
- `us-west-2`
- `eu-west-1`
- `ap-south-1`
- `ap-northeast-1`

### Steps

1. Create a new Momento Cache named `MyTestCache` in your region of choice.
1. Create a [Momento API key](https://docs.momentohq.com/cache/develop/authentication/api-keys) in the same region as your cache. Store this secretly somewhere.
   - You can use a fine-grained access controlled key with the following properties:
     - **Permission Type**: `Topic`
     - **Cache Name**: `MyTestCache`
     - **Topic Name**: `MyTestTopic`
     - **Role Type**: `publishsubscribe`
   - After creating the key, you will be shown the generated `Api Key` as well as the `HTTP Endpoint` to use.
1. Install dependencies by running `npm install` (or `yarn`, `pnpm`, etc).
1. Make sure you have AWS credentials configured for your terminal.
1. Deploy the sample application with `sam build && sam deploy`.
   - You should see the API Gateway endpoint in the stack output.
1. Create a `.env` file with the following contents:
   ```
   MOMENTO_API_KEY=<your-api-key>
   CACHE_NAME=MyTestCache
   TOPIC_NAME=MyTestTopic
   API_URL=https://<your-api-id>.execute-api.eu-west-1.amazonaws.com/Prod/
   ```
1. Run tests with `npm test`. They should fail since you are not publishing events to Momento yet.
1. Deploy the Momento integration by running

   ```bash
   $ sam build --config-env momento && sam deploy --config-env momento --parameter-overrides \
   CacheName=MyTestCache \
   TopicName=MyTestTopic \
   MomentoEndpoint=<your-momento-http-endpoint-from-step-2> \
   MomentoAuthToken=<your-api-key>
   ```

1. Run tests again with `npm test`. They should now pass.
