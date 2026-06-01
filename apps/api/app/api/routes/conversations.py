"""HTTP routes for conversations and messages."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.conversation import (
    ConversationCreate,
    ConversationDetail,
    ConversationSummary,
    Message,
    MessageCreate,
)
from app.services.ai_service import ChatMessage, LLMClient, LLMError, get_llm_client
from app.services.conversation_service import (
    ConversationNotFoundError,
    ConversationStore,
    get_conversation_store,
)

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post(
    "",
    response_model=ConversationDetail,
    status_code=status.HTTP_201_CREATED,
)
def create_conversation(
    payload: ConversationCreate,
    store: ConversationStore = Depends(get_conversation_store),
) -> ConversationDetail:
    return store.create(payload.title)


@router.get("", response_model=list[ConversationSummary])
def list_conversations(
    store: ConversationStore = Depends(get_conversation_store),
) -> list[ConversationSummary]:
    return store.list()


@router.get("/{conversation_id}", response_model=ConversationDetail)
def get_conversation(
    conversation_id: UUID,
    store: ConversationStore = Depends(get_conversation_store),
) -> ConversationDetail:
    try:
        return store.get(conversation_id)
    except ConversationNotFoundError as exc:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND, "Conversation not found"
        ) from exc


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: UUID,
    store: ConversationStore = Depends(get_conversation_store),
) -> None:
    try:
        store.delete(conversation_id)
    except ConversationNotFoundError as exc:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND, "Conversation not found"
        ) from exc


@router.post(
    "/{conversation_id}/messages",
    response_model=Message,
    status_code=status.HTTP_201_CREATED,
)
async def send_message(
    conversation_id: UUID,
    payload: MessageCreate,
    store: ConversationStore = Depends(get_conversation_store),
    llm: LLMClient = Depends(get_llm_client),
) -> Message:
    try:
        conv = store.get(conversation_id)
    except ConversationNotFoundError as exc:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND, "Conversation not found"
        ) from exc

    store.append_message(conv.id, "user", payload.content)

    history = [ChatMessage(role=m.role, content=m.content) for m in conv.messages]
    try:
        reply = await llm.complete(history)
    except LLMError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc)) from exc

    if not reply:
        reply = "(no response)"
    return store.append_message(conv.id, "assistant", reply)
