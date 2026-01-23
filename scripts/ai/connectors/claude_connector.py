"""
Claude Connector

Anthropic Claude integration via CLI or API.
Best for: Blog posts, service pages, articles with E-E-A-T requirements.
"""

import os
import time
import json
import logging
import subprocess
import tempfile
from typing import Optional, Dict, Any

from .base_connector import BaseConnector, ConnectorResponse, ModelInfo

logger = logging.getLogger(__name__)


class ClaudeConnector(BaseConnector):
    """Connector for Claude via CLI or API."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_id: str = "claude-sonnet-4-20250514",
        max_tokens: int = 8192,
        temperature: float = 0.7,
        use_cli: bool = True  # Default to CLI mode
    ):
        super().__init__(
            name="claude",
            api_key=api_key,
            env_key="ANTHROPIC_API_KEY",
            rpm=50,
            tpm=100000
        )
        self.model_id = model_id
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.use_cli = use_cli
        self._cli_available = None

    def _check_cli_available(self) -> bool:
        """Check if claude CLI is available."""
        if self._cli_available is not None:
            return self._cli_available

        try:
            result = subprocess.run(
                ["claude", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            self._cli_available = result.returncode == 0
            if self._cli_available:
                logger.debug(f"Claude CLI available: {result.stdout.strip()}")
        except (FileNotFoundError, subprocess.TimeoutExpired):
            self._cli_available = False
            logger.debug("Claude CLI not available")

        return self._cli_available

    def _get_client(self):
        """Lazy load the Anthropic client (for API mode)."""
        if self._client is None:
            try:
                import anthropic
                self._client = anthropic.Anthropic(api_key=self.api_key)
            except ImportError:
                raise ImportError("anthropic package not installed. Run: pip install anthropic")
        return self._client

    def generate(
        self,
        prompt: str,
        context: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> ConnectorResponse:
        """Generate content using Claude CLI or API."""
        context = context or {}

        # Try CLI first if enabled
        if self.use_cli and self._check_cli_available():
            return self._generate_via_cli(prompt, context, **kwargs)

        # Fallback to API
        return self._generate_via_api(prompt, context, **kwargs)

    def _generate_via_cli(
        self,
        prompt: str,
        context: Dict[str, Any],
        **kwargs
    ) -> ConnectorResponse:
        """Generate content using Claude CLI."""
        start_time = time.time()

        try:
            # Build full prompt with context
            full_prompt = self._build_full_prompt(prompt, context)

            # Create temp file for long prompts
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
                f.write(full_prompt)
                prompt_file = f.name

            try:
                # Run claude CLI with print mode (non-interactive)
                cmd = [
                    "claude",
                    "-p",  # Print mode (non-interactive)
                    "--output-format", "text",
                    full_prompt
                ]

                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=kwargs.get("timeout", 120)
                )

                if result.returncode != 0:
                    error_msg = result.stderr or "CLI execution failed"
                    return self._handle_error(Exception(error_msg), "CLI generation failed")

                content = result.stdout.strip()
                latency_ms = (time.time() - start_time) * 1000

                # Estimate tokens (CLI doesn't return exact count)
                tokens_used = self._estimate_tokens(full_prompt, content)

                self.circuit_breaker.record_success()
                self.rate_limiter.record_request(tokens_used)

                logger.info(f"Claude CLI generated {len(content)} chars in {latency_ms:.0f}ms")

                return ConnectorResponse(
                    content=content,
                    model=self.name,
                    tokens_used=tokens_used,
                    latency_ms=latency_ms,
                    success=True,
                    metadata={
                        "model_id": self.model_id,
                        "method": "cli",
                        "estimated_tokens": True
                    }
                )

            finally:
                # Clean up temp file
                os.unlink(prompt_file)

        except subprocess.TimeoutExpired:
            return self._handle_error(Exception("CLI timeout"), "Generation timeout")
        except Exception as e:
            return self._handle_error(e, "CLI generation failed")

    def _generate_via_api(
        self,
        prompt: str,
        context: Dict[str, Any],
        **kwargs
    ) -> ConnectorResponse:
        """Generate content using Claude API."""
        # Pre-request checks
        error = self._pre_request_check()
        if error:
            return ConnectorResponse(
                content="", model=self.name, tokens_used=0,
                latency_ms=0, success=False, error=error
            )

        start_time = time.time()

        try:
            client = self._get_client()
            system_prompt = self._build_system_prompt(context)

            response = client.messages.create(
                model=self.model_id,
                max_tokens=kwargs.get("max_tokens", self.max_tokens),
                temperature=kwargs.get("temperature", self.temperature),
                system=system_prompt,
                messages=[{"role": "user", "content": prompt}]
            )

            content = response.content[0].text if response.content else ""
            tokens_used = response.usage.input_tokens + response.usage.output_tokens
            latency_ms = (time.time() - start_time) * 1000

            self.circuit_breaker.record_success()
            self.rate_limiter.record_request(tokens_used)

            logger.info(f"Claude API generated {len(content)} chars in {latency_ms:.0f}ms")

            return ConnectorResponse(
                content=content,
                model=self.name,
                tokens_used=tokens_used,
                latency_ms=latency_ms,
                success=True,
                metadata={
                    "model_id": self.model_id,
                    "method": "api",
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens,
                    "stop_reason": response.stop_reason
                }
            )

        except Exception as e:
            return self._handle_error(e, "API generation failed")

    def _build_full_prompt(self, prompt: str, context: Dict[str, Any]) -> str:
        """Build full prompt with context for CLI mode."""
        parts = [
            "You are an expert content writer creating professional, SEO-optimized content.",
            "Write in a clear, authoritative voice with proper E-E-A-T signals.",
            "Use proper heading hierarchy and formatting.",
            ""
        ]

        if context.get("industry"):
            parts.append(f"Industry: {context['industry']}")
        if context.get("tone"):
            parts.append(f"Tone: {context['tone']}")
        if context.get("word_count"):
            parts.append(f"Target word count: {context['word_count']}")
        if context.get("language"):
            parts.append(f"Write in: {context['language']}")
        if context.get("keywords"):
            parts.append(f"Keywords: {', '.join(context['keywords'])}")

        parts.append("")
        parts.append(f"Task: {prompt}")

        return "\n".join(parts)

    def _build_system_prompt(self, context: Dict[str, Any]) -> str:
        """Build system prompt for API mode."""
        parts = [
            "You are an expert content writer creating professional, SEO-optimized content.",
            "Write in a clear, authoritative voice with proper E-E-A-T signals.",
            "Use proper heading hierarchy and formatting."
        ]

        if context.get("industry"):
            parts.append(f"Industry context: {context['industry']}")
        if context.get("tone"):
            parts.append(f"Tone: {context['tone']}")
        if context.get("word_count"):
            parts.append(f"Target word count: {context['word_count']}")
        if context.get("language"):
            parts.append(f"Write in: {context['language']}")
        if context.get("keywords"):
            parts.append(f"Include keywords: {', '.join(context['keywords'])}")

        return "\n".join(parts)

    def _estimate_tokens(self, prompt: str, response: str) -> int:
        """Estimate token count (rough approximation)."""
        total_chars = len(prompt) + len(response)
        return int(total_chars / 4)

    def is_available(self) -> bool:
        """Check if Claude is available (CLI or API)."""
        # Check CLI first
        if self.use_cli and self._check_cli_available():
            return True

        # Check API
        if self.api_key and self.circuit_breaker.can_execute():
            return True

        return False

    def get_model_info(self) -> ModelInfo:
        """Get Claude model information."""
        return ModelInfo(
            name="claude",
            provider="anthropic",
            model_id=self.model_id,
            max_tokens=self.max_tokens,
            content_types=["blog", "service", "article"],
            cost_per_1k_input=0.003,
            cost_per_1k_output=0.015
        )
