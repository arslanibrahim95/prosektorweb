"""
Base Connector Abstract Class

Defines the interface for all AI model connectors.
"""

import os
import time
import random
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List
from collections import deque

logger = logging.getLogger(__name__)


@dataclass
class ModelInfo:
    """Model information and capabilities."""
    name: str
    provider: str
    model_id: str
    max_tokens: int
    content_types: List[str]
    cost_per_1k_input: float
    cost_per_1k_output: float


@dataclass
class ConnectorResponse:
    """Standardized response from any connector."""
    content: str
    model: str
    tokens_used: int
    latency_ms: float
    success: bool
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "content": self.content,
            "model": self.model,
            "tokens_used": self.tokens_used,
            "latency_ms": self.latency_ms,
            "success": self.success,
            "error": self.error,
            "metadata": self.metadata
        }


class CircuitBreaker:
    """Circuit breaker for model availability."""

    def __init__(self, failure_threshold: int = 5, reset_timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.failures = 0
        self.state = "CLOSED"  # CLOSED, OPEN, HALF-OPEN
        self.last_failure_time: Optional[float] = None

    def record_success(self):
        """Reset failures on success."""
        self.failures = 0
        self.state = "CLOSED"

    def record_failure(self):
        """Record failure and potentially open circuit."""
        self.failures += 1
        self.last_failure_time = time.time()
        if self.failures >= self.failure_threshold:
            self.state = "OPEN"
            logger.warning(f"Circuit breaker opened after {self.failures} failures")

    def can_execute(self) -> bool:
        """Check if request can proceed."""
        if self.state == "CLOSED":
            return True
        if self.state == "OPEN":
            if time.time() - (self.last_failure_time or 0) > self.reset_timeout:
                self.state = "HALF-OPEN"
                return True
            return False
        return True  # HALF-OPEN

    def reset(self):
        """Manually reset circuit breaker."""
        self.failures = 0
        self.state = "CLOSED"
        self.last_failure_time = None


class RateLimiter:
    """Token bucket rate limiter."""

    def __init__(self, rpm: int, tpm: int):
        self.rpm = rpm
        self.tpm = tpm
        self.request_times: deque = deque()
        self.token_count = 0
        self.last_reset = time.time()

    def can_request(self, estimated_tokens: int = 0) -> bool:
        """Check if request is within rate limits."""
        now = time.time()

        # Reset token count every minute
        if now - self.last_reset >= 60:
            self.token_count = 0
            self.last_reset = now
            self.request_times.clear()

        # Remove requests older than 1 minute
        while self.request_times and now - self.request_times[0] > 60:
            self.request_times.popleft()

        # Check RPM
        if len(self.request_times) >= self.rpm:
            return False

        # Check TPM
        if self.token_count + estimated_tokens > self.tpm:
            return False

        return True

    def record_request(self, tokens: int = 0):
        """Record a request for rate limiting."""
        self.request_times.append(time.time())
        self.token_count += tokens

    def wait_time(self) -> float:
        """Calculate wait time until next request is allowed."""
        if not self.request_times:
            return 0
        oldest = self.request_times[0]
        wait = 60 - (time.time() - oldest)
        return max(0, wait)


class BaseConnector(ABC):
    """Abstract base class for AI model connectors."""

    def __init__(
        self,
        name: str,
        api_key: Optional[str] = None,
        env_key: Optional[str] = None,
        rpm: int = 50,
        tpm: int = 100000
    ):
        self.name = name
        self.api_key = api_key or os.getenv(env_key or "")
        self.circuit_breaker = CircuitBreaker()
        self.rate_limiter = RateLimiter(rpm, tpm)
        self._client = None

    @abstractmethod
    def generate(
        self,
        prompt: str,
        context: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> ConnectorResponse:
        """Generate content using the model."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Check if the model is available."""
        pass

    @abstractmethod
    def get_model_info(self) -> ModelInfo:
        """Get model information."""
        pass

    def _calculate_backoff(self, attempt: int, base_delay: float = 1.0) -> float:
        """Calculate exponential backoff with jitter."""
        delay = base_delay * (2 ** attempt)
        jitter = random.uniform(0, delay * 0.1)
        return min(delay + jitter, 60.0)

    def _handle_error(self, error: Exception, context: str = "") -> ConnectorResponse:
        """Handle errors consistently."""
        self.circuit_breaker.record_failure()
        error_msg = f"{self.name}: {str(error)}"
        if context:
            error_msg = f"{context} - {error_msg}"
        logger.error(error_msg)
        return ConnectorResponse(
            content="",
            model=self.name,
            tokens_used=0,
            latency_ms=0,
            success=False,
            error=error_msg
        )

    def _pre_request_check(self, estimated_tokens: int = 1000) -> Optional[str]:
        """Check if request can proceed."""
        if not self.api_key:
            return f"API key not configured for {self.name}"
        if not self.circuit_breaker.can_execute():
            return f"Circuit breaker open for {self.name}"
        if not self.rate_limiter.can_request(estimated_tokens):
            return f"Rate limited for {self.name}"
        return None

    def ping(self) -> bool:
        """Quick availability check."""
        return self.is_available()
