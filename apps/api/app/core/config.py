from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Buddy API"
    version: str = "0.1.0"
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    # LLM via Cloudflare Worker proxy (text/plain streaming).
    llm_proxy_url: str = "https://pytutorai-proxy.ultrichedima.workers.dev/api/llm/complete"
    llm_model: str = "gpt-4o-mini"
    llm_max_words: int = 220
    llm_timeout_seconds: float = 60.0
    llm_system_prompt: str = (
        "You are Buddy, a warm, attentive, professional AI companion. "
        "Reply concisely, with empathy and clarity. "
        "Match the user's language. Avoid disclaimers unless safety-critical."
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="BUDDY_",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
