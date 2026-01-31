"""
Gemini Connector

Google Gemini integration via CLI or API.
Best for: Landing pages, FAQ sections, comparison content.
"""

import os
import time
import json
import logging
import subprocess
from typing import Optional, Dict, Any

from .base_connector import BaseConnector, ConnectorResponse, ModelInfo

logger = logging.getLogger(__name__)


class GeminiConnector(BaseConnector):
    """Connector for Google Gemini via CLI or API."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_id: str = "gemini-2.0-flash",
        max_tokens: int = 8192,
        temperature: float = 0.7,
        use_cli: bool = True
    ):
        super().__init__(
            name="gemini",
            api_key=api_key,
            env_key="GOOGLE_API_KEY",
            rpm=60,
            tpm=120000
        )
        self.model_id = model_id
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.use_cli = use_cli
        self._cli_available = None

    def _check_cli_available(self) -> bool:
        """Check if gemini/gcloud CLI is available."""
        if self._cli_available is not None:
            return self._cli_available

        # Try gemini CLI first
        try:
            result = subprocess.run(
                ["gemini", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                self._cli_available = True
                self._cli_tool = "gemini"
                logger.debug("Gemini CLI available")
                return True
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass

        # Try gcloud AI
        try:
            result = subprocess.run(
                ["gcloud", "ai", "models", "list", "--help"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                self._cli_available = True
                self._cli_tool = "gcloud"
                logger.debug("gcloud AI available")
                return True
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass

        self._cli_available = False
        logger.debug("Gemini CLI not available")
        return False

    def _get_client(self):
        """Lazy load the Gemini client (for API mode)."""
        if self._client is None:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._client = genai.GenerativeModel(self.model_id)
            except ImportError:
                raise ImportError(
                    "google-generativeai package not installed. "
                    "Run: pip install google-generativeai"
                )
        return self._client

    def generate(
        self,
        prompt: str,
        context: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> ConnectorResponse:
        """Generate content using Gemini CLI or API."""
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
        """Generate content using Gemini CLI."""
        start_time = time.time()

        try:
            full_prompt = self._build_prompt(prompt, context)

            if getattr(self, '_cli_tool', 'gemini') == 'gemini':
                # Direct gemini CLI
                cmd = [
                    "gemini",
                    "prompt",
                    "--model", self.model_id,
                    full_prompt
                ]
            else:
                # gcloud AI
                cmd = [
                    "gcloud", "ai", "models", "predict",
                    "--model", self.model_id,
                    "--json-request", json.dumps({"prompt": full_prompt})
                ]

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=kwargs.get("timeout", 120)
            )

            if result.returncode != 0:
                # CLI failed, try API
                logger.debug(f"Gemini CLI failed: {result.stderr}")
                return self._generate_via_api(prompt, context, **kwargs)

            content = result.stdout.strip()
            latency_ms = (time.time() - start_time) * 1000
            tokens_used = self._estimate_tokens(full_prompt, content)

            self.circuit_breaker.record_success()
            self.rate_limiter.record_request(tokens_used)

            logger.info(f"Gemini CLI generated {len(content)} chars in {latency_ms:.0f}ms")

            return ConnectorResponse(
                content=content,
                model=self.name,
                tokens_used=tokens_used,
                latency_ms=latency_ms,
                success=True,
                metadata={
                    "model_id": self.model_id,
                    "method": "cli"
                }
            )

        except subprocess.TimeoutExpired:
            return self._handle_error(Exception("CLI timeout"), "Generation timeout")
        except Exception as e:
            # Fallback to API on any CLI error
            logger.debug(f"Gemini CLI error: {e}, falling back to API")
            return self._generate_via_api(prompt, context, **kwargs)

    def _generate_via_api(
        self,
        prompt: str,
        context: Dict[str, Any],
        **kwargs
    ) -> ConnectorResponse:
        """Generate content using Gemini API."""
        error = self._pre_request_check()
        if error:
            return ConnectorResponse(
                content="", model=self.name, tokens_used=0,
                latency_ms=0, success=False, error=error
            )

        start_time = time.time()

        try:
            model = self._get_client()
            full_prompt = self._build_prompt(prompt, context)

            generation_config = {
                "max_output_tokens": kwargs.get("max_tokens", self.max_tokens),
                "temperature": kwargs.get("temperature", self.temperature),
            }

            response = model.generate_content(
                full_prompt,
                generation_config=generation_config
            )

            content = response.text if response.text else ""
            tokens_used = self._estimate_tokens(full_prompt, content)
            latency_ms = (time.time() - start_time) * 1000

            self.circuit_breaker.record_success()
            self.rate_limiter.record_request(tokens_used)

            logger.info(f"Gemini API generated {len(content)} chars in {latency_ms:.0f}ms")

            return ConnectorResponse(
                content=content,
                model=self.name,
                tokens_used=tokens_used,
                latency_ms=latency_ms,
                success=True,
                metadata={
                    "model_id": self.model_id,
                    "method": "api",
                    "finish_reason": getattr(response, "finish_reason", None)
                }
            )

        except Exception as e:
            return self._handle_error(e, "API generation failed")

    def _build_prompt(self, prompt: str, context: Dict[str, Any]) -> str:
        """Build full prompt with context."""
        parts = [
            "You are an expert content writer specializing in conversion-focused, "
            "structured content. Create clear, scannable content with strong CTAs."
        ]

        if context.get("industry"):
            parts.append(f"Industry: {context['industry']}")
        if context.get("tone"):
            parts.append(f"Tone: {context['tone']}")
        if context.get("format"):
            parts.append(f"Format: {context['format']}")
        if context.get("word_count"):
            parts.append(f"Target length: {context['word_count']} words")
        if context.get("language"):
            parts.append(f"Write in: {context['language']}")

        parts.append(f"\nTask:\n{prompt}")

        return "\n".join(parts)

    def _estimate_tokens(self, prompt: str, response: str) -> int:
        """Estimate token count."""
        total_chars = len(prompt) + len(response)
        return int(total_chars / 4)

    def is_available(self) -> bool:
        """Check if Gemini is available."""
        if self.use_cli and self._check_cli_available():
            return True
        if self.api_key and self.circuit_breaker.can_execute():
            return True
        return False

    def get_model_info(self) -> ModelInfo:
        """Get Gemini model information."""
        return ModelInfo(
            name="gemini",
            provider="google",
            model_id=self.model_id,
            max_tokens=self.max_tokens,
            content_types=["landing", "faq", "comparison"],
            cost_per_1k_input=0.0005,
            cost_per_1k_output=0.0015
        )
