from aws_lambda_powertools import Logger, Metrics
from aws_lambda_powertools.metrics import MetricUnit  # noqa: F401


logger: Logger = Logger()
metrics: Metrics = Metrics()
