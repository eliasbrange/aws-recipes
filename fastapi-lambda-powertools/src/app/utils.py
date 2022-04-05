from aws_lambda_powertools import Logger, Metrics, Tracer
from aws_lambda_powertools.metrics import MetricUnit  # noqa: F401


logger: Logger = Logger()
metrics: Metrics = Metrics()
tracer: Tracer = Tracer()
