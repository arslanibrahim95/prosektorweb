# Error Handling

> Fallback strategies and error recovery for multi-model pipeline.

---

## 1. Error Categories

| Category | Examples | Strategy |
|----------|----------|----------|
| **Transient** | Timeout, rate limit | Retry with backoff |
| **Model** | Invalid response, context length | Try fallback model |
| **Auth** | Invalid API key | Stop, notify user |
| **Fatal** | All models unavailable | Stop, detailed report |

---

## 2. Fallback Chain

### Default Chain

```
claude → gemini → gpt4 → glm
```

### Per-Content-Type Chains

| Content Type | Chain |
|--------------|-------|
| blog | claude → gemini → gpt4 |
| landing | gemini → claude → gpt4 |
| faq | gemini → glm → claude |
| product | glm → gemini → claude |

---

## 3. Retry Strategy

### Exponential Backoff

```python
def calculate_backoff(attempt: int, base_delay: float = 1.0) -> float:
    """Calculate delay with jitter."""
    delay = base_delay * (2 ** attempt)
    jitter = random.uniform(0, delay * 0.1)
    return min(delay + jitter, 60.0)  # Max 60 seconds
```

### Retry Matrix

| Error Type | Max Retries | Backoff |
|------------|-------------|---------|
| Rate limit | 3 | Exponential |
| Timeout | 2 | Linear |
| Server error | 2 | Exponential |
| Invalid response | 1 | None |

---

## 4. Circuit Breaker

### States

```
CLOSED → Normal operation
OPEN → Model disabled, skip immediately
HALF-OPEN → Testing if recovered
```

### Thresholds

| Metric | Threshold |
|--------|-----------|
| Failure count | 5 consecutive |
| Open duration | 60 seconds |
| Half-open test | 1 request |

### Implementation

```python
class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, reset_timeout: int = 60):
        self.failures = 0
        self.state = "CLOSED"
        self.last_failure_time = None

    def record_failure(self):
        self.failures += 1
        if self.failures >= self.failure_threshold:
            self.state = "OPEN"
            self.last_failure_time = time.time()

    def can_execute(self) -> bool:
        if self.state == "CLOSED":
            return True
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.reset_timeout:
                self.state = "HALF-OPEN"
                return True
            return False
        return True  # HALF-OPEN
```

---

## 5. Error Response Schema

```python
@dataclass
class ErrorResponse:
    code: str           # E001-E005
    message: str        # Human-readable
    model: str          # Which model failed
    recoverable: bool   # Can we try fallback?
    suggestion: str     # What to do
    details: dict       # Debug info
```

---

## 6. Logging Strategy

### Log Levels

| Event | Level |
|-------|-------|
| Request start | DEBUG |
| Success | INFO |
| Retry | WARNING |
| Fallback | WARNING |
| Final failure | ERROR |

### Log Format

```python
logger.warning(
    "Model fallback triggered",
    extra={
        "from_model": "claude",
        "to_model": "gemini",
        "reason": "rate_limited",
        "content_type": "blog",
        "attempt": 2
    }
)
```

---

## 7. Health Checks

### Periodic Checks

```python
async def health_check_all():
    """Check all model availability."""
    results = {}
    for name, connector in connectors.items():
        try:
            available = await connector.ping()
            results[name] = {"status": "healthy" if available else "unhealthy"}
        except Exception as e:
            results[name] = {"status": "error", "message": str(e)}
    return results
```

### Health Endpoints

| Check | Frequency |
|-------|-----------|
| API ping | 5 minutes |
| Token balance | 1 hour |
| Rate limit status | Per request |

---

## 8. Graceful Degradation

### Quality Tiers

```
Tier 1: Primary model (best quality)
Tier 2: First fallback (good quality)
Tier 3: Second fallback (acceptable)
Tier 4: Emergency fallback (basic)
```

### User Notification

```python
if used_fallback:
    response.metadata["notice"] = (
        f"Content generated using {used_model} "
        f"(primary: {primary_model} unavailable)"
    )
```

---

## 9. Recovery Procedures

### Manual Recovery

1. Check `.env` for API keys
2. Verify API quotas/billing
3. Test individual connectors
4. Reset circuit breakers if needed

### Automatic Recovery

```python
async def auto_recover():
    """Attempt automatic recovery of failed models."""
    for name, connector in connectors.items():
        if connector.circuit_breaker.state == "OPEN":
            if await connector.ping():
                connector.circuit_breaker.reset()
                logger.info(f"Model {name} recovered")
```

---

> **Principle:** Fail gracefully, recover quickly. Users should get content even when primary models are down.
