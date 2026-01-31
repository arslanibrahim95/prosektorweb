"""
OpenAI Connector

OpenAI GPT-4 integration via CLI or API.
Primary role: Reviewer - analyzes and scores content from other models.
"""

import os
import time
import json
import logging
import subprocess
from typing import Optional, Dict, Any, List

from .base_connector import BaseConnector, ConnectorResponse, ModelInfo

logger = logging.getLogger(__name__)


class OpenAIConnector(BaseConnector):
    """Connector for OpenAI GPT-4 via CLI or API."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_id: str = "gpt-4o",
        max_tokens: int = 4096,
        temperature: float = 0.3,
        use_cli: bool = True
    ):
        super().__init__(
            name="gpt4",
            api_key=api_key,
            env_key="OPENAI_API_KEY",
            rpm=40,
            tpm=80000
        )
        self.model_id = model_id
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.use_cli = use_cli
        self._cli_available = None

    def _check_cli_available(self) -> bool:
        """Check if openai CLI is available."""
        if self._cli_available is not None:
            return self._cli_available

        try:
            result = subprocess.run(
                ["openai", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            self._cli_available = result.returncode == 0
            if self._cli_available:
                logger.debug(f"OpenAI CLI available: {result.stdout.strip()}")
        except (FileNotFoundError, subprocess.TimeoutExpired):
            self._cli_available = False
            logger.debug("OpenAI CLI not available")

        return self._cli_available

    def _get_client(self):
        """Lazy load the OpenAI client (for API mode)."""
        if self._client is None:
            try:
                from openai import OpenAI
                self._client = OpenAI(api_key=self.api_key)
            except ImportError:
                raise ImportError("openai package not installed. Run: pip install openai")
        return self._client

    def generate(
        self,
        prompt: str,
        context: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> ConnectorResponse:
        """Generate content using GPT-4 CLI or API."""
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
        """Generate content using OpenAI CLI."""
        start_time = time.time()

        try:
            messages = self._build_messages(prompt, context)

            # Build CLI command
            cmd = [
                "openai", "api", "chat.completions.create",
                "-m", self.model_id,
                "-g", "user", prompt
            ]

            # Add system message if present
            system_msg = next((m["content"] for m in messages if m["role"] == "system"), None)
            if system_msg:
                cmd.extend(["-g", "system", system_msg])

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=kwargs.get("timeout", 120)
            )

            if result.returncode != 0:
                logger.debug(f"OpenAI CLI failed: {result.stderr}")
                return self._generate_via_api(prompt, context, **kwargs)

            # Parse response
            try:
                response_data = json.loads(result.stdout)
                content = response_data.get("choices", [{}])[0].get("message", {}).get("content", "")
            except json.JSONDecodeError:
                content = result.stdout.strip()

            latency_ms = (time.time() - start_time) * 1000
            tokens_used = self._estimate_tokens(prompt, content)

            self.circuit_breaker.record_success()
            self.rate_limiter.record_request(tokens_used)

            logger.info(f"GPT-4 CLI generated {len(content)} chars in {latency_ms:.0f}ms")

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
            logger.debug(f"OpenAI CLI error: {e}, falling back to API")
            return self._generate_via_api(prompt, context, **kwargs)

    def _generate_via_api(
        self,
        prompt: str,
        context: Dict[str, Any],
        **kwargs
    ) -> ConnectorResponse:
        """Generate content using OpenAI API."""
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
            tokens_used = response.usage.total_tokens if response.usage else 0
            latency_ms = (time.time() - start_time) * 1000

            self.circuit_breaker.record_success()
            self.rate_limiter.record_request(tokens_used)

            logger.info(f"GPT-4 API generated {len(content)} chars in {latency_ms:.0f}ms")

            return ConnectorResponse(
                content=content,
                model=self.name,
                tokens_used=tokens_used,
                latency_ms=latency_ms,
                success=True,
                metadata={
                    "model_id": self.model_id,
                    "method": "api",
                    "finish_reason": response.choices[0].finish_reason if response.choices else None
                }
            )

        except Exception as e:
            return self._handle_error(e, "API generation failed")

    def review(
        self,
        content: str,
        criteria: Optional[List[str]] = None,
        content_type: str = "general"
    ) -> Dict[str, Any]:
        """Review content and provide quality assessment."""
        criteria = criteria or ["accuracy", "clarity", "tone", "seo", "engagement"]
        review_prompt = self._build_review_prompt(content, criteria, content_type)

        response = self.generate(
            prompt=review_prompt,
            context={"task": "review"},
            temperature=0.2
        )

        if not response.success:
            return {
                "success": False,
                "error": response.error,
                "score": 0,
                "feedback": [],
                "passed": False
            }

        return self._parse_review_response(response.content, criteria)

    def _build_messages(self, prompt: str, context: Dict[str, Any]) -> list:
        """Build message list."""
        system_content = (
            "You are an expert content analyst and editor. "
            "Provide detailed, actionable feedback."
        )

        if context.get("task") == "review":
            system_content = (
                "You are an expert content reviewer. Analyze content objectively, "
                "provide scores, and give specific, actionable feedback. "
                "Always respond in valid JSON format when reviewing."
            )
        elif context.get("industry"):
            system_content += f" Industry context: {context['industry']}."

        return [
            {"role": "system", "content": system_content},
            {"role": "user", "content": prompt}
        ]

    def _build_review_prompt(
        self,
        content: str,
        criteria: List[str],
        content_type: str
    ) -> str:
        """Build the review prompt."""
        criteria_descriptions = {
            "accuracy": "Factual correctness and claims verification",
            "clarity": "Readability and ease of understanding",
            "tone": "Appropriate voice and style for target audience",
            "seo": "SEO optimization (keywords, structure, meta elements)",
            "engagement": "Hook, flow, and reader engagement",
            "grammar": "Grammar, spelling, and punctuation",
            "structure": "Logical organization and heading hierarchy",
            "cta": "Call-to-action effectiveness",
            "eeat": "E-E-A-T signals (expertise, authority, trust)"
        }

        criteria_list = "\n".join([
            f"- {c}: {criteria_descriptions.get(c, c)}"
            for c in criteria
        ])

        return f"""Review the following {content_type} content and provide a detailed assessment.

CONTENT TO REVIEW:
---
{content}
---

EVALUATION CRITERIA:
{criteria_list}

Respond in this exact JSON format:
{{
    "overall_score": <0-100>,
    "criteria_scores": {{
        "<criterion>": {{
            "score": <0-100>,
            "feedback": "<specific feedback>"
        }}
    }},
    "strengths": ["<strength1>", "<strength2>"],
    "improvements": ["<specific improvement1>", "<specific improvement2>"],
    "critical_issues": ["<issue if any>"],
    "recommendation": "approve" | "revise" | "reject"
}}

Be specific and actionable in your feedback."""

    def _parse_review_response(
        self,
        response_text: str,
        criteria: List[str]
    ) -> Dict[str, Any]:
        """Parse the review response JSON."""
        try:
            json_start = response_text.find("{")
            json_end = response_text.rfind("}") + 1

            if json_start >= 0 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                result = json.loads(json_str)
                result["success"] = True
                result["passed"] = (
                    result.get("overall_score", 0) >= 70 and
                    result.get("recommendation") != "reject"
                )
                return result

        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse review JSON: {e}")

        return {
            "success": True,
            "overall_score": 70,
            "criteria_scores": {c: {"score": 70, "feedback": ""} for c in criteria},
            "strengths": [],
            "improvements": [response_text[:500]],
            "critical_issues": [],
            "recommendation": "revise",
            "passed": False,
            "raw_response": response_text
        }

    def _estimate_tokens(self, prompt: str, response: str) -> int:
        """Estimate token count."""
        total_chars = len(prompt) + len(response)
        return int(total_chars / 4)

    def is_available(self) -> bool:
        """Check if GPT-4 is available."""
        if self.use_cli and self._check_cli_available():
            return True
        if self.api_key and self.circuit_breaker.can_execute():
            return True
        return False

    def get_model_info(self) -> ModelInfo:
        """Get GPT-4 model information."""
        return ModelInfo(
            name="gpt4",
            provider="openai",
            model_id=self.model_id,
            max_tokens=self.max_tokens,
            content_types=[],
            cost_per_1k_input=0.005,
            cost_per_1k_output=0.015
        )
