from __future__ import annotations

from collections.abc import Iterable

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.ai_service import ChatMessage, set_llm_client
from app.services.conversation_service import get_conversation_store


class StubLLM:
    def __init__(self, reply: str = "Hello from stub") -> None:
        self.reply = reply
        self.calls: list[list[ChatMessage]] = []

    async def complete(
        self,
        messages: Iterable[ChatMessage],
        *,
        system: str | None = None,
    ) -> str:
        self.calls.append(list(messages))
        return self.reply


@pytest.fixture(autouse=True)
def _reset_state() -> None:
    get_conversation_store().reset()
    set_llm_client(None)
    yield
    set_llm_client(None)


def test_create_and_list_conversation() -> None:
    client = TestClient(app)

    created = client.post("/api/v1/conversations", json={"title": "Test"})
    assert created.status_code == 201
    data = created.json()
    assert data["title"] == "Test"
    assert data["messages"] == []

    listed = client.get("/api/v1/conversations")
    assert listed.status_code == 200
    items = listed.json()
    assert len(items) == 1
    assert items[0]["id"] == data["id"]
    assert items[0]["message_count"] == 0


def test_send_message_invokes_llm_and_persists() -> None:
    stub = StubLLM("Hi there!")
    set_llm_client(stub)

    client = TestClient(app)
    conv = client.post("/api/v1/conversations", json={}).json()

    reply = client.post(
        f"/api/v1/conversations/{conv['id']}/messages",
        json={"content": "Hello buddy"},
    )
    assert reply.status_code == 201
    body = reply.json()
    assert body["role"] == "assistant"
    assert body["content"] == "Hi there!"

    # Stub should have received the user message in history.
    assert len(stub.calls) == 1
    assert stub.calls[0][-1].role == "user"
    assert stub.calls[0][-1].content == "Hello buddy"

    detail = client.get(f"/api/v1/conversations/{conv['id']}").json()
    assert [m["role"] for m in detail["messages"]] == ["user", "assistant"]
    assert detail["title"].startswith("Hello buddy")


def test_send_message_unknown_conversation_returns_404() -> None:
    client = TestClient(app)
    res = client.post(
        "/api/v1/conversations/00000000-0000-0000-0000-000000000000/messages",
        json={"content": "hi"},
    )
    assert res.status_code == 404
