"""
Multi-Model Connector Package

Provides unified interface for multiple AI models:
- Claude (Anthropic)
- Gemini (Google)
- GLM 4.7 (Zhipu)
- GPT-4 (OpenAI)
"""

from .base_connector import BaseConnector, ConnectorResponse, ModelInfo
from .claude_connector import ClaudeConnector
from .gemini_connector import GeminiConnector
from .glm_connector import GLMConnector
from .openai_connector import OpenAIConnector

__all__ = [
    "BaseConnector",
    "ConnectorResponse",
    "ModelInfo",
    "ClaudeConnector",
    "GeminiConnector",
    "GLMConnector",
    "OpenAIConnector",
]
