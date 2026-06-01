"""Pydantic schemas for conversations and messages.

Field names use snake_case to match `docs/api-contract.md`.
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field

Role = Literal["user", "assistant", "system"]


class ConversationCreate(BaseModel):
    title: str | None = None


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=8000)


class Message(BaseModel):
    id: UUID
    role: Role
    content: str
    created_at: datetime


class ConversationSummary(BaseModel):
    id: UUID
    title: str
    message_count: int
    created_at: datetime
    updated_at: datetime


class ConversationDetail(BaseModel):
    id: UUID
    title: str
    messages: list[Message]
    created_at: datetime
    updated_at: datetime
