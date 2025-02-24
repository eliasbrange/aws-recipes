use lambda_extension::*;

#[tokio::main]
async fn main() -> Result<(), Error> {
    let stubs_path = std::env::var("STUBS_PATH").unwrap_or_else(|_| "/opt/stubs".to_string());
    let stubs_port = std::env::var("STUBS_PORT").unwrap_or_else(|_| "1234".to_string());

    tracing::init_default_subscriber();
    let stubr = stubr::Stubr::start_with(
        stubs_path,
        stubr::Config {
            port: Some(stubs_port.parse().unwrap()),
            ..Default::default()
        },
    )
    .await;

    tracing::info!(stubr.uri = %stubr.uri(), "stubr started");

    Extension::new().run().await
}
