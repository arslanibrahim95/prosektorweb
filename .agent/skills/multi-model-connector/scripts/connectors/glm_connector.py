"""
GLM Connector

Zhipu GLM-4 integration via CLI or API.
Best for: Product descriptions, short-form content, cost-effective bulk generation.
"""

import os
import time
import json
import logging
import subprocess
from typing import Optional, Dict, Any

from .base_connector import BaseConnector, ConnectorResponse, ModelInfo

logger = logging.getLogger(__name__)


class GLMConnector(BaseConnector):
    """Connector for Zhipu GLM-4 via CLI or API."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_id: str = "glm-4",
        max_tokens: int = 4096,
        temperature: float = 0.7,
        use_cli: bool = True
    ):
        super().__init__(
            name="glm",
            api_key=api_key,
            env_key="ZHIPU_API_KEY",
            rpm=100,
            tpm=200000
        )
        self.model_id = model_id
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.use_cli = use_cli
        self._cli_available = None
        self.base_url = "https://open.bigmodel.cn/api/paas/v4"

    def _check_cli_available(self) -> bool:
        """Check if zhipu/glm CLI is available."""
        if self._cli_available is not None:
            return self._cli_available

        # Try zhipu CLI
        try:
            result = subprocess.run(
                ["zhipu", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                self._cli_available = True
                self._cli_tool = "zhipu"
                logger.debug("Zhipu CLI available")
                return True
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass

        # Try glm CLI
        try:
            result = subprocess.run(
                ["glm", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                self._cli_available = True
                self._cli_tool = "glm"
                logger.debug("GLM CLI available")
                return True
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass

        self._cli_available = False
        logger.debug("GLM CLI not available, will use API")
        return False

    def _get_client(self):
        """Lazy load the ZhipuAI client (for API mode)."""
        if self._client is None:
            try:
                from zhipuai import ZhipuAI
                self._client = ZhipuAI(api_key=self.api_key)
            except ImportError:
                raise ImportError("zhipuai package not installed. Run: pip install zhipuai")
        return self._client

    def generate(
        self,
        prompt: str,
        context: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> ConnectorResponse:
        """Generate content using GLM CLI or API."""
        context = context or {}

        if self.use_cli and self._check_cli_available():
            return self._generate_via_cli(prompt, context, **kwargs)

        return self._generate_via_api(prompt, context, **kwargs)

    def _generate_via_cli(
        self,
        prompt: str,
        context: Dict[str, Any],
        **kwargs
    ) -> ConnectorResponse:
        """Generate content using GLM CLI."""
        start_time = time.time()

        try:
            full_prompt = self._build_prompt(prompt, context)
            cli_tool = getattr(self, '_cli_tool', 'zhipu')

            if cli_tool == "zhipu":
                cmd = [
                    "zhipu", "chat",
                    "--model", self.model_id,
                    "--message", full_prompt
                ]
            else:
                cmd = [
                    "glm", "generate",
                    "--model", self.model_id,
                    "--prompt", full_prompt
                ]

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=kwargs.get("timeout", 120)
            )

            if result.returncode != 0:
                logger.debug(f"GLM CLI failed: {result.stderr}")
                return self._generate_via_api(prompt, context, **kwargs)

            # Try to parse JSON response
            try:
                response_data = json.loads(result.stdout)
                content = response_data.get("content", response_data.get("text", result.stdout))
            except json.JSONDecodeError:
                content = result.stdout.strip()

            latency_ms = (time.time() - start_time) * 1000
            tokens_used = self._estimate_tokens(full_prompt, content)

            self.circuit_breaker.record_success()
            self.rate_limiter.record_request(tokens_used)

            logger.info(f"GLM CLI generated {len(content)} chars in {latency_ms:.0f}ms")

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
            logger.debug(f"GLM CLI error: {e}, falling back to API")
            return self._generate_via_api(prompt, context, **kwargs)

    def _generate_via_api(
        self,
        prompt: str,
        context: Dict[str, Any],
        **kwargs
    ) -> ConnectorResponse:
        """Generate content using GLM API."""
        error = self._pre_request_check()
        if error:
            return ConnectorResponse(
                content="", model=self.name, tokens_used=0,
                latency_ms=0, success=False, error=error
            )

        start_time = time.time()

        try:
            client = self._get_client()
            messages = self._build_messages(prompt, context)

            response = client.chat.completions.create(
                model=self.model_id,
                messages=messages,
                max_tokens=kwargs.get("max_tokens", self.max_tokens),
                temperature=kwargs.get("temperature", self.temperature),
            )

            content = response.choices[0].message.content if response.choices else ""

            tokens_used = 0
            if hasattr(response, "usage") and response.usage:
                tokens_used = (
                    getattr(response.usage, "total_tokens", 0) or
                    (getattr(response.usage, "prompt_tokens", 0) +
                     getattr(response.usage, "completion_tokens", 0))
                )

            latency_ms = (time.time() - start_time) * 1000

            self.circuit_breaker.record_success()
            self.rate_limiter.record_request(tokens_used)

            logger.info(f"GLM API generated {len(content)} chars in {latency_ms:.0f}ms")

            return ConnectorResponse(
                content=content,
                model=self.name,
                tokens_used=tokens_used,
                latency_ms=latency_ms,
                success=True,
                metadata={
                    "model_id": self.model_id,
                    "method": "api",
                    "finish_reason": (
                        response.choices[0].finish_reason
                        if response.choices else None
                    )
                }
            )

        except Exception as e:
            return self._handle_error(e, "API generation failed")

    def _build_prompt(self, prompt: str, context: Dict[str, Any]) -> str:
        """Build full prompt for CLI mode."""
        parts = [
            "You are an efficient content writer creating concise, "
            "accurate product descriptions and short-form content."
        ]

        if context.get("industry"):
            parts.append(f"Industry: {context['industry']}")
        if context.get("tone"):
            parts.append(f"Tone: {context['tone']}")
        if context.get("language"):
            parts.append(f"Write in {context['language']}")

        parts.append(f"\nTask: {prompt}")

        return "\n".join(parts)

    def _build_messages(self, prompt: str, context: Dict[str, Any]) -> list:
        """Build message list for API mode."""
        system_content = (
            "You are an efficient content writer creating concise, "
            "accurate product descriptions and short-form content."
        )

        if context.get("industry"):
            system_content += f" Industry: {context['industry']}."
        if context.get("tone"):
            system_content += f" Tone: {context['tone']}."
        if context.get("language"):
            system_content += f" Write in {context['language']}."

        return [
            {"role": "system", "content": system_content},
            {"role": "user", "content": prompt}
        ]

    def _estimate_tokens(self, prompt: str, response: str) -> int:
        """Estimate token count."""
        total_chars = len(prompt) + len(response)
        return int(total_chars / 4)

    def is_available(self) -> bool:
        """Check if GLM is available."""
        if self.use_cli and self._check_cli_available():
            return True
        if self.api_key and self.circuit_breaker.can_execute():
            return True
        return False

    def get_model_info(self) -> ModelInfo:
        """Get GLM model information."""
        return ModelInfo(
            name="glm",
            provider="zhipu",
            model_id=self.model_id,
            max_tokens=self.max_tokens,
            content_types=["product", "description"],
            cost_per_1k_input=0.001,
            cost_per_1k_output=0.002
        )
