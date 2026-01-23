"""
Connector Manager

Factory and routing manager for multi-model AI content generation.
Handles model selection, fallback logic, and unified interface.
"""

import os
import json
import time
import logging
from pathlib import Path
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field

from connectors import (
    BaseConnector,
    ConnectorResponse,
    ClaudeConnector,
    GeminiConnector,
    GLMConnector,
    OpenAIConnector,
)

logger = logging.getLogger(__name__)


@dataclass
class PipelineMetrics:
    """Metrics for pipeline operations."""
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    fallback_count: int = 0
    total_tokens: int = 0
    total_latency_ms: float = 0
    model_usage: Dict[str, int] = field(default_factory=dict)

    def record(self, response: ConnectorResponse, used_fallback: bool = False):
        """Record metrics from a response."""
        self.total_requests += 1
        if response.success:
            self.successful_requests += 1
            self.total_tokens += response.tokens_used
            self.total_latency_ms += response.latency_ms
            self.model_usage[response.model] = self.model_usage.get(response.model, 0) + 1
        else:
            self.failed_requests += 1
        if used_fallback:
            self.fallback_count += 1

    def summary(self) -> Dict[str, Any]:
        """Get metrics summary."""
        return {
            "total_requests": self.total_requests,
            "success_rate": (
                self.successful_requests / self.total_requests * 100
                if self.total_requests > 0 else 0
            ),
            "fallback_rate": (
                self.fallback_count / self.total_requests * 100
                if self.total_requests > 0 else 0
            ),
            "total_tokens": self.total_tokens,
            "avg_latency_ms": (
                self.total_latency_ms / self.successful_requests
                if self.successful_requests > 0 else 0
            ),
            "model_usage": self.model_usage
        }


class ConnectorManager:
    """
    Factory and router for AI model connectors.

    Provides unified interface for content generation with:
    - Automatic model routing based on content type
    - Fallback chain execution
    - Metrics collection
    - Caching support
    """

    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the connector manager.

        Args:
            config_path: Path to model-config.json. If not provided,
                        uses default from skill config directory.
        """
        self.config = self._load_config(config_path)
        self.connectors: Dict[str, BaseConnector] = {}
        self.metrics = PipelineMetrics()
        self._cache: Dict[str, ConnectorResponse] = {}

        self._initialize_connectors()

    def _load_config(self, config_path: Optional[str] = None) -> Dict[str, Any]:
        """Load configuration from JSON file."""
        if config_path is None:
            # Default path relative to this script
            config_path = Path(__file__).parent.parent / "config" / "model-config.json"

        try:
            with open(config_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Config not found at {config_path}, using defaults")
            return self._default_config()

    def _default_config(self) -> Dict[str, Any]:
        """Return default configuration."""
        return {
            "models": {
                "claude": {"content_types": ["blog", "service", "article"]},
                "gemini": {"content_types": ["landing", "faq", "comparison"]},
                "glm": {"content_types": ["product", "description"]},
                "gpt4": {"role": "reviewer", "content_types": []}
            },
            "fallback_chain": ["claude", "gemini", "gpt4", "glm"],
            "content_routes": {
                "blog": ["claude", "gemini", "gpt4"],
                "landing": ["gemini", "claude", "gpt4"],
                "faq": ["gemini", "glm", "claude"],
                "product": ["glm", "gemini", "claude"]
            },
            "retry_config": {"max_retries": 3, "base_delay": 1.0},
            "cache": {"enabled": True, "ttl": {"default": 3600}}
        }

    def _initialize_connectors(self):
        """Initialize all available connectors."""
        connector_classes = {
            "claude": ClaudeConnector,
            "gemini": GeminiConnector,
            "glm": GLMConnector,
            "gpt4": OpenAIConnector
        }

        # Global CLI setting (can be overridden per model)
        global_use_cli = self.config.get("use_cli", True)

        for name, cls in connector_classes.items():
            model_config = self.config.get("models", {}).get(name, {})
            # Per-model CLI setting, defaults to global
            use_cli = model_config.get("use_cli", global_use_cli)

            try:
                connector = cls(
                    model_id=model_config.get("model_id"),
                    max_tokens=model_config.get("max_tokens", 4096),
                    temperature=model_config.get("temperature", 0.7),
                    use_cli=use_cli
                )
                self.connectors[name] = connector
                method = "CLI" if use_cli else "API"
                logger.debug(f"Initialized {name} connector ({method} mode)")
            except Exception as e:
                logger.warning(f"Failed to initialize {name} connector: {e}")

    def generate(
        self,
        content_type: str,
        prompt: str,
        context: Optional[Dict[str, Any]] = None,
        model: Optional[str] = None,
        use_cache: bool = True,
        **kwargs
    ) -> ConnectorResponse:
        """
        Generate content using the appropriate model.

        Args:
            content_type: Type of content (blog, landing, faq, product, etc.)
            prompt: The generation prompt
            context: Additional context (industry, tone, keywords, etc.)
            model: Force specific model (optional, overrides routing)
            use_cache: Whether to use cached responses
            **kwargs: Additional arguments passed to connector

        Returns:
            ConnectorResponse with generated content
        """
        context = context or {}

        # Check cache
        if use_cache and self.config.get("cache", {}).get("enabled"):
            cache_key = self._cache_key(content_type, prompt, context)
            if cache_key in self._cache:
                logger.debug("Cache hit for content generation")
                return self._cache[cache_key]

        # Get model chain
        if model:
            model_chain = [model]
        else:
            model_chain = self._get_model_chain(content_type)

        # Try each model in chain
        used_fallback = False
        for i, model_name in enumerate(model_chain):
            if model_name not in self.connectors:
                continue

            connector = self.connectors[model_name]

            if not connector.is_available():
                logger.debug(f"{model_name} not available, trying next")
                used_fallback = True
                continue

            response = connector.generate(prompt, context, **kwargs)

            if response.success:
                # Record metrics
                self.metrics.record(response, used_fallback)

                # Cache response
                if use_cache:
                    self._cache[cache_key] = response

                # Add routing info to metadata
                response.metadata["content_type"] = content_type
                response.metadata["used_fallback"] = used_fallback
                if used_fallback:
                    response.metadata["primary_model"] = model_chain[0]

                return response

            used_fallback = True
            logger.warning(f"{model_name} failed: {response.error}, trying fallback")

        # All models failed
        self.metrics.record(
            ConnectorResponse(
                content="", model="none", tokens_used=0,
                latency_ms=0, success=False, error="All models failed"
            ),
            used_fallback=True
        )

        return ConnectorResponse(
            content="",
            model="none",
            tokens_used=0,
            latency_ms=0,
            success=False,
            error=f"All models in chain {model_chain} failed",
            metadata={"content_type": content_type, "tried_models": model_chain}
        )

    def review(
        self,
        content: str,
        criteria: Optional[List[str]] = None,
        content_type: str = "general"
    ) -> Dict[str, Any]:
        """
        Review content using GPT-4.

        Args:
            content: Content to review
            criteria: Review criteria
            content_type: Type of content for context

        Returns:
            Review result with scores and feedback
        """
        if "gpt4" not in self.connectors:
            return {
                "success": False,
                "error": "GPT-4 connector not available",
                "score": 0,
                "passed": False
            }

        gpt4 = self.connectors["gpt4"]

        if not gpt4.is_available():
            return {
                "success": False,
                "error": "GPT-4 not available",
                "score": 0,
                "passed": False
            }

        return gpt4.review(content, criteria, content_type)

    def revise(
        self,
        content: str,
        feedback: List[str],
        content_type: str = "general",
        model: Optional[str] = None
    ) -> ConnectorResponse:
        """
        Revise content based on feedback.

        Args:
            content: Original content
            feedback: List of improvements to make
            content_type: Type of content
            model: Model to use for revision

        Returns:
            Revised content
        """
        feedback_text = "\n".join([f"- {f}" for f in feedback])

        prompt = f"""Revise the following content based on the feedback provided.

ORIGINAL CONTENT:
---
{content}
---

FEEDBACK TO ADDRESS:
{feedback_text}

Provide the revised content only, maintaining the same format and structure."""

        return self.generate(
            content_type=content_type,
            prompt=prompt,
            context={"task": "revision"},
            model=model
        )

    def _get_model_chain(self, content_type: str) -> List[str]:
        """Get the model chain for a content type."""
        content_routes = self.config.get("content_routes", {})
        if content_type in content_routes:
            return content_routes[content_type]
        return self.config.get("fallback_chain", ["claude", "gemini", "gpt4", "glm"])

    def _cache_key(
        self,
        content_type: str,
        prompt: str,
        context: Dict[str, Any]
    ) -> str:
        """Generate cache key."""
        context_str = json.dumps(sorted(context.items()), default=str)
        return f"{content_type}:{hash(prompt)}:{hash(context_str)}"

    def get_available_models(self) -> Dict[str, bool]:
        """Get availability status of all models."""
        return {
            name: connector.is_available()
            for name, connector in self.connectors.items()
        }

    def get_metrics(self) -> Dict[str, Any]:
        """Get pipeline metrics."""
        return self.metrics.summary()

    def clear_cache(self):
        """Clear the response cache."""
        self._cache.clear()

    def reset_circuit_breakers(self):
        """Reset all circuit breakers."""
        for connector in self.connectors.values():
            connector.circuit_breaker.reset()


# CLI usage
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Multi-model content generator")
    parser.add_argument("--type", "-t", required=True, help="Content type")
    parser.add_argument("--prompt", "-p", required=True, help="Generation prompt")
    parser.add_argument("--model", "-m", help="Force specific model")
    parser.add_argument("--review", "-r", action="store_true", help="Review after generation")
    parser.add_argument("--output", "-o", help="Output file")

    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO)

    manager = ConnectorManager()

    # Check model availability
    available = manager.get_available_models()
    print("Model availability:", available)

    # Generate content
    result = manager.generate(
        content_type=args.type,
        prompt=args.prompt,
        model=args.model
    )

    if result.success:
        print(f"\n--- Generated by {result.model} ---\n")
        print(result.content)

        if args.review:
            print("\n--- Review ---\n")
            review = manager.review(result.content, content_type=args.type)
            print(json.dumps(review, indent=2, ensure_ascii=False))

        if args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                f.write(result.content)
            print(f"\nSaved to {args.output}")
    else:
        print(f"Error: {result.error}")
