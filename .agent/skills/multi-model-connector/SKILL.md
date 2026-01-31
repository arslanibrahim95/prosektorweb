---
name: multi-model-connector
description: Multi-model AI connector framework for Claude, Gemini, GLM 4.7, and OpenAI with unified API and fallback strategies.
allowed-tools: Read, Glob, Grep, Bash
---

# Multi-Model Connector

> Unified interface for multiple AI models with intelligent routing and fallback.

---

## 1. Overview

This skill provides a unified connector framework for:
- **Claude** (Anthropic) - Long-form content, E-E-A-T articles
- **Gemini** (Google) - Structured content, landing pages
- **GLM 4.7** (Zhipu) - High-volume, cost-effective content
- **GPT-4/o1** (OpenAI) - Review, analysis, quality control

---

## 2. Content Map

| File | Purpose |
|------|---------|
| `connector-design.md` | Architecture and design patterns |
| `error-handling.md` | Fallback strategies and error recovery |
| `config/model-config.json` | Model configuration template |
| `scripts/connector_manager.py` | Factory and routing manager |
| `scripts/connectors/base_connector.py` | Abstract base connector |
| `scripts/connectors/claude_connector.py` | Claude API connector |
| `scripts/connectors/gemini_connector.py` | Gemini API connector |
| `scripts/connectors/glm_connector.py` | GLM 4.7 API connector |
| `scripts/connectors/openai_connector.py` | OpenAI API connector |

---

## 3. Model-Content Mapping

| Model | Content Types | Rationale |
|-------|---------------|-----------|
| **Claude** | blog, service, article | Long-form, consistent tone, E-E-A-T |
| **Gemini** | landing, faq, comparison | Structured, conversion-focused |
| **GLM 4.7** | product, description | Cost-effective, high volume |
| **GPT-4/o1** | review (all types) | Analytical, quality feedback |

---

## 4. Unified Interface

```python
from connector_manager import ConnectorManager

manager = ConnectorManager()

# Auto-route based on content type
result = manager.generate(
    content_type="blog",
    prompt="Write about workplace safety...",
    context={"industry": "OSGB", "tone": "professional"}
)

# Force specific model
result = manager.generate(
    content_type="blog",
    prompt="...",
    model="claude"  # Override auto-routing
)

# Get review from GPT-4
review = manager.review(
    content="...",
    criteria=["accuracy", "tone", "seo"]
)
```

---

## 5. Configuration

### CLI Mode (Default)

By default, connectors use CLI tools instead of API keys:

| Model | CLI Command | Fallback |
|-------|-------------|----------|
| Claude | `claude -p` | API with ANTHROPIC_API_KEY |
| Gemini | `gemini` / `gcloud ai` | API with GOOGLE_API_KEY |
| GLM | `zhipu` / `glm` | API with ZHIPU_API_KEY |
| GPT-4 | `openai api` | API with OPENAI_API_KEY |

**Advantages of CLI mode:**
- No API key management
- Uses existing CLI authentication
- Simpler setup

**To disable CLI mode:**
```json
{
  "use_cli": false
}
```

### API Mode (Fallback)

If CLI is not available, API mode requires environment variables:

```bash
# .env file (only if CLI not available)
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AI...
ZHIPU_API_KEY=...
OPENAI_API_KEY=sk-...
```

### Model Config

See `config/model-config.json` for:
- Model IDs and providers
- CLI vs API mode per model
- Content type mappings
- Fallback chains
- Rate limits and timeouts

---

## 6. Fallback Strategy

```
Primary model fails → Try fallback chain
All models fail → Return error with details
Rate limited → Wait and retry (exponential backoff)
Timeout → Try next model in chain
```

### Default Fallback Chain

```
claude → gemini → gpt4 → glm
```

---

## 7. Usage Examples

### Basic Content Generation

```python
from connector_manager import ConnectorManager

manager = ConnectorManager()
result = manager.generate(
    content_type="blog",
    prompt="Aile hekimliği ve iş sağlığı ilişkisi",
    context={"word_count": 1500}
)
```

### With Review

```python
content = manager.generate(content_type="landing", prompt="...")
review = manager.review(content, criteria=["conversion", "clarity"])

if review["score"] < 70:
    content = manager.revise(content, feedback=review["feedback"])
```

---

## 8. Integration Points

| System | Integration |
|--------|-------------|
| content-creation | Template loading |
| content-optimization | Post-generation optimization |
| content-review | GPT-4 quality review |
| content-publishing | CMS formatting |

---

## 9. Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `E001` | API key missing | Check .env |
| `E002` | Rate limited | Wait/fallback |
| `E003` | Model unavailable | Use fallback |
| `E004` | Invalid response | Retry/fallback |
| `E005` | All models failed | Report error |

---

> **Principle:** Use the right model for the right task. Quality over speed, but leverage cost-effective options for volume.
