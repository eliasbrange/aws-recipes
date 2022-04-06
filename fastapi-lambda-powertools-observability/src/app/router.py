from uuid import uuid4
from fastapi import Request, Response
from fastapi.routing import APIRoute
from typing import Callable
from mangum.types import LambdaContext

from .utils import logger


class LoggerRouteHandler(APIRoute):
    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()

        async def route_handler(request: Request) -> Response:
            # Get correlation id from X-Correlation-Id header
            # If empty, use request id from aws context
            corr_id = request.headers.get("x-correlation-id")
            if not corr_id:
                aws_ctx: LambdaContext = request.scope["aws.context"]
                corr_id = aws_ctx.aws_request_id

            logger.set_correlation_id(corr_id)

            # Add some request context to logs
            ctx = {
                "path": request.url.path,
                "route": self.path,
                "method": request.method,
            }
            logger.append_keys(fastapi=ctx)

            logger.info("Received request")
            return await original_route_handler(request)

        return route_handler
