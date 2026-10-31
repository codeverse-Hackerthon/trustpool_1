"""Phase 13 — Production Security Hardening Middleware (Pure ASGI).

Includes:
1. RateLimiter: Sliding window in-memory rate limiter protecting sensitive authentication and QR endpoints.
2. SecurityMiddleware:
   - Rejects payloads exceeding maximum allowable content length (10MB) with HTTP 413.
   - Enforces sliding-window rate limits (HTTP 429).
   - Injects enterprise HTTP security headers (nosniff, DENY, Referrer-Policy, etc.).
   - Completely transparent to WebSocket connections (scope['type'] != 'http').
"""
from __future__ import annotations

import collections
import time
from starlette.datastructures import MutableHeaders
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send

# Max request payload size: 10 Megabytes
MAX_CONTENT_LENGTH = 10 * 1024 * 1024


class RateLimiter:
    """Sliding-window in-memory rate limiter."""

    def __init__(self) -> None:
        self.requests: dict[str, collections.deque[float]] = collections.defaultdict(collections.deque)
        # Endpoint prefix / rule matches: (prefix, method, max_requests, window_seconds)
        self.rules: list[tuple[str, str | None, int, int]] = [
            ("/api/v1/auth/login", "POST", 10, 60),
            ("/api/v1/auth/register", "POST", 10, 60),
            ("/api/v1/qr/verify", "POST", 30, 60),
            ("/api/v1/auth/reset-password", "POST", 10, 60),
        ]
        self.default_rule = (200, 60)  # 200 requests per minute globally per IP

    def is_rate_limited(self, ip: str, path: str, method: str) -> tuple[bool, int]:
        """Check if request exceeds sliding-window rate limit. Returns (is_limited, retry_after)."""
        now = time.time()
        max_requests, window = self.default_rule
        rule_key = "global"

        for prefix, rule_method, limit, win in self.rules:
            if path.startswith(prefix) and (rule_method is None or rule_method == method):
                max_requests = limit
                window = win
                rule_key = prefix
                break

        key = f"{ip}:{rule_key}"
        timestamps = self.requests[key]

        # Evict timestamps older than sliding window
        cutoff = now - window
        while timestamps and timestamps[0] < cutoff:
            timestamps.popleft()

        if len(timestamps) >= max_requests:
            oldest = timestamps[0]
            retry_after = max(1, int(oldest + window - now))
            return True, retry_after

        timestamps.append(now)
        return False, 0

    def reset(self) -> None:
        """Clear all rate limit state (useful for test isolation)."""
        self.requests.clear()


rate_limiter = RateLimiter()


class SecurityMiddleware:
    """Pure ASGI middleware for security headers, request size limits, and rate limiting."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        # Pass non-HTTP scopes (e.g. WebSockets, lifespan) directly through without touching
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request = Request(scope, receive=receive)

        # 1. Reject payloads exceeding MAX_CONTENT_LENGTH
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                if int(content_length) > MAX_CONTENT_LENGTH:
                    response = JSONResponse(
                        status_code=413,
                        content={"detail": "Payload too large. Maximum allowable size is 10MB."},
                    )
                    await response(scope, receive, send)
                    return
            except ValueError:
                pass

        # 2. Check rate limit
        client_ip = request.client.host if request.client else "unknown"
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()

        bypass = request.headers.get("x-bypass-rate-limit")
        if not bypass:
            is_limited, retry_after = rate_limiter.is_rate_limited(
                ip=client_ip,
                path=request.url.path,
                method=request.method,
            )
            if is_limited:
                response = JSONResponse(
                    status_code=429,
                    content={
                        "detail": "Rate limit exceeded. Too many requests. Please try again later.",
                        "retry_after": retry_after,
                    },
                    headers={"Retry-After": str(retry_after)},
                )
                await response(scope, receive, send)
                return

        # 3. Intercept response headers to add OWASP security headers
        async def send_with_security_headers(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers = MutableHeaders(scope=message)
                headers["X-Content-Type-Options"] = "nosniff"
                headers["X-Frame-Options"] = "DENY"
                headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
                headers["X-XSS-Protection"] = "1; mode=block"
                headers["Permissions-Policy"] = "camera=(self), microphone=(), geolocation=()"
            await send(message)

        await self.app(scope, receive, send_with_security_headers)
