"""In-memory conversation store (M2 first pass).

Persistence will move to Postgres in a follow-up milestone; the interface is
kept intentionally narrow so a future SQLModel-backed implementation can drop
in without touching routes.
"""

from __future__ import annotations

from datetime import datetime, timezone
from threading import RLock
from uuid import UUID, uuid4

from app.schemas.conversation import (
    ConversationDetail,
    ConversationSummary,
    Message,
    Role,
)


class ConversationNotFoundError(KeyError):
    """Raised when a conversation id is unknown."""


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ConversationStore:
    def __init__(self) -> None:
        self._lock = RLock()
        self._conversations: dict[UUID, ConversationDetail] = {}

    # ---- conversations ----------------------------------------------------

    def create(self, title: str | None) -> ConversationDetail:
        now = _utcnow()
        conv = ConversationDetail(
            id=uuid4(),
            title=title or "New conversation",
            messages=[],
            created_at=now,
            updated_at=now,
        )
        with self._lock:
            self._conversations[conv.id] = conv
        return conv

    def list(self) -> list[ConversationSummary]:
        with self._lock:
            items = list(self._conversations.values())
        items.sort(key=lambda c: c.updated_at, reverse=True)
        return [
            ConversationSummary(
                id=c.id,
                title=c.title,
                message_count=len(c.messages),
                created_at=c.created_at,
                updated_at=c.updated_at,
            )
            for c in items
        ]

    def get(self, conversation_id: UUID) -> ConversationDetail:
        with self._lock:
            conv = self._conversations.get(conversation_id)
        if conv is None:
            raise ConversationNotFoundError(str(conversation_id))
        return conv

    def delete(self, conversation_id: UUID) -> None:
        with self._lock:
            if self._conversations.pop(conversation_id, None) is None:
                raise ConversationNotFoundError(str(conversation_id))

    # ---- messages ---------------------------------------------------------

    def append_message(
        self, conversation_id: UUID, role: Role, content: str
    ) -> Message:
        message = Message(
            id=uuid4(),
            role=role,
            content=content,
            created_at=_utcnow(),
        )
        with self._lock:
            conv = self._conversations.get(conversation_id)
            if conv is None:
                raise ConversationNotFoundError(str(conversation_id))
            conv.messages.append(message)
            conv.updated_at = message.created_at
            # Auto-title from first user message if still default.
            if conv.title == "New conversation" and role == "user":
                conv.title = content.strip().splitlines()[0][:60] or conv.title
        return message

    # ---- test helpers -----------------------------------------------------

    def reset(self) -> None:
        with self._lock:
            self._conversations.clear()


_store: ConversationStore | None = None


def get_conversation_store() -> ConversationStore:
    global _store
    if _store is None:
        _store = ConversationStore()
    return _store
