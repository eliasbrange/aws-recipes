# Run Wiremock in a Lambda Extension

This example shows how to run `stubr`/ `wiremock-rs` in a Lambda Extension. This can be useful for mocking external services in your Lambda functions during development.

## Requirements

- [Rust](https://www.rust-lang.org/tools/install)
- [Cargo Lambda](https://www.cargo-lambda.info/guide/getting-started.html#step-1-install-cargo-lambda)
- [Node.js](https://nodejs.org/en/download/package-manager)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

## Deploy extension

In the `extension` directory, run the following commands to build and deploy the extension:

```bash
$ cargo lambda build --release --extension --arm64
$ cargo lambda deploy --extension --compatible-runtimes nodejs22.x

...

🔍 extension arn: arn:aws:lambda:eu-west-1:123456789012:layer:lambda-wiremock:1
```

## Deploy example application

The repository contains a simple SAM application that uses the extension.

Update the `WiremockExtensionArn` in `samconfig.yaml` with the ARN of the extension you just deployed.

Deploy the application with the following commands.

```bash
$ npm install
$ sam build
$ sam deploy --config-env dev
```

## Try it out

I'm using [HTTPie](https://httpie.io/), but you can use `curl` or any other HTTP client.

```bash
$ http https://YOUR_API_ID.execute-api.eu-west-1.amazonaws.com/hello

HTTP/1.1 200 OK
...

{
    "message": "Hello from Stubr/Wiremock!"
}
