# Run Wiremock in a Lambda Extension

This example shows how to run `stubr`/ `wiremock-rs` in a Lambda Extension. This can be useful for mocking external services in your Lambda functions during development.

## Requirements

- [Rust](https://www.rust-lang.org/tools/install)
- [Cargo Lambda](https://www.cargo-lambda.info/guide/getting-started.html#step-1-install-cargo-lambda)
- [Node.js](https://nodejs.org/en/download/package-manager)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

## Deploy extension

In the `lambda-wiremock` directory, run the following commands to build and deploy the extension:

```bash
$ cargo lambda build --release --extension --arm64
$ cargo lambda deploy --extension --compatible-runtimes nodejs20.x
```

## Deploy example application

In the `example-app` directory, deploy the SAM application and take not of the API Gateway URL:

```bash
$ sam build && sam deploy
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
