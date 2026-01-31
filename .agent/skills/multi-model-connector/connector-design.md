# Connector Design

> Architecture patterns for multi-model AI connectors.

---

## 1. Design Principles

| Principle | Application |
|-----------|-------------|
| **Single Responsibility** | One connector per model |
| **Open/Closed** | Extensible for new models |
| **Dependency Inversion** | Abstract base, concrete implementations |
| **Fail-Safe** | Graceful degradation with fallbacks |

---

## 2. Class Hierarchy

```
BaseConnector (Abstract)
    │
    ├── ClaudeConnector
    ├── GeminiConnector
    ├── GLMConnector
    └── OpenAIConnector

ConnectorManager (Factory + Router)
    └── Manages all connectors
```

---

## 3. BaseConnector Interface

```python
class BaseConnector(ABC):
    @abstractmethod
    def generate(self, prompt: str, context: dict) -> ConnectorResponse

    @abstractmethod
    def is_available(self) -> bool

    @abstractmethod
    def get_model_info(self) -> ModelInfo
```

---

## 4. Response Schema

```python
@dataclass
class ConnectorResponse:
    content: str           # Generated content
    model: str             # Model used
    tokens_used: int       # Token consumption
    latency_ms: float      # Response time
    metadata: dict         # Additional info
    success: bool          # Success flag
    error: Optional[str]   # Error message if failed
```

---

## 5. Routing Logic

### Content Type Routing

```python
CONTENT_ROUTES = {
    "blog": ["claude", "gemini", "gpt4"],
    "service": ["claude", "gemini", "gpt4"],
    "landing": ["gemini", "claude", "gpt4"],
    "faq": ["gemini", "claude", "glm"],
    "product": ["glm", "gemini", "claude"],
    "description": ["glm", "gemini", "claude"]
}
```

### Routing Decision Tree

```
1. Get content_type
2. Look up preferred models
3. Check availability of first choice
4. If available → Use it
5. If not → Try next in fallback chain
6. If all fail → Return error
```

---

## 6. Rate Limiting

### Per-Model Limits

| Model | RPM | TPM |
|-------|-----|-----|
| Claude | 50 | 100K |
| Gemini | 60 | 120K |
| GLM | 100 | 200K |
| GPT-4 | 40 | 80K |

### Implementation

```python
class RateLimiter:
    def __init__(self, rpm: int, tpm: int):
        self.rpm = rpm
        self.tpm = tpm
        self.request_times = []
        self.token_count = 0

    def can_request(self, estimated_tokens: int) -> bool:
        # Check both RPM and TPM limits
        pass

    def wait_time(self) -> float:
        # Calculate wait time if rate limited
        pass
```

---

## 7. Caching Strategy

### Cache Keys

```python
cache_key = hash(f"{model}:{prompt}:{sorted(context.items())}")
```

### TTL Settings

| Content Type | TTL |
|--------------|-----|
| Static (FAQ) | 24h |
| Dynamic (Blog) | 1h |
| Product | 12h |

---

## 8. Metrics Collection

```python
@dataclass
class ConnectorMetrics:
    total_requests: int
    successful_requests: int
    failed_requests: int
    fallback_count: int
    avg_latency_ms: float
    tokens_consumed: int
    cost_estimate: float
```

---

## 9. Adding New Models

1. Create `new_model_connector.py` extending `BaseConnector`
2. Implement required methods
3. Add to `model-config.json`
4. Register in `ConnectorManager`

```python
# Example: Adding Mistral
class MistralConnector(BaseConnector):
    def __init__(self, api_key: str):
        super().__init__("mistral", api_key)

    def generate(self, prompt: str, context: dict) -> ConnectorResponse:
        # Mistral-specific implementation
        pass
```

---

> **Principle:** Design for extension, not modification. New models should require zero changes to existing code.
