# Memory Design

## Overview

Memory is the central differentiator of Buddy. The system stores facts about the user across sessions and retrieves them when relevant. The design must balance usefulness with privacy, and accuracy with the inherent uncertainty of extracted information.

---

## Short-Term Context

Within a single conversation, the full message history is included in the LLM context up to the model's context window limit. When the conversation exceeds a manageable length, older messages are summarized and the summary is prepended in place of the raw messages.

This is standard context window management and requires no special storage.

---

## Long-Term Memory

Long-term memory consists of discrete facts extracted from conversations and stored in the database with vector embeddings. Examples:

- "User's name is Alex."
- "User is working on a machine learning project and finds it stressful."
- "User prefers concise responses."
- "User mentioned they have a dog named Milo."

Facts are scoped to a user. They are never shared between users.

---

## Memory Extraction

After each conversation ends (or periodically during a long session), the system sends the recent conversation to the LLM with a prompt that asks it to identify new facts worth remembering. The output is a list of candidate memories.

Each candidate includes:

- `content`: the fact in plain language
- `confidence`: a score from 0 to 1 indicating how certain the extraction is
- `source_message_id`: which message triggered the extraction

Candidates with confidence below a threshold are held in a review queue rather than added directly.

---

## Memory Review

The review queue holds uncertain memory candidates. The system can:

- Auto-approve candidates above a secondary confidence threshold after a delay
- Surface them to the user for explicit confirmation ("I noticed you mentioned X. Should I remember that?")

Users can disable the in-conversation prompts if they prefer not to be interrupted.

---

## Embeddings and Retrieval

Each stored memory is embedded using a text embedding model and stored in PostgreSQL with the pgvector extension.

At the start of each conversation, and at configurable intervals during a session, the system:

1. Embeds the current conversation context or user message
2. Queries pgvector for the top-k semantically similar memories
3. Injects retrieved memories into the system prompt

The number of injected memories and the similarity threshold are configurable.

---

## Memory Confidence

Each memory has a `confidence` field (0.0 to 1.0). Confidence decreases if:

- A later message contradicts the memory
- The memory has not been referenced in a long time
- The user explicitly marks it as incorrect

Confidence increases if:

- The user confirms the memory
- The same fact is re-extracted from a later conversation

Memories below a minimum confidence threshold are excluded from retrieval but not deleted automatically.

---

## Memory Deletion

Users can delete any memory from the memory panel. Deletion is soft-delete: the record is marked with a `deleted_at` timestamp and excluded from retrieval, but retained for audit purposes for a configurable period before hard deletion.

Users can also trigger full memory deletion from the settings screen, which schedules all memories for hard deletion.

---

## Sensitive Data Handling

The system does not attempt to classify memories as sensitive automatically. Instead:

- Memory extraction prompts instruct the model to avoid storing highly sensitive categories (health diagnoses, financial data, relationship details) unless explicitly mentioned multiple times by the user
- Users are shown all stored memories and can delete anything
- Raw audio is never stored
- Conversation messages are stored but can be deleted by the user

---

## User Consent

Memory storage requires explicit opt-in during onboarding. Users can:

- Enable or disable memory extraction at any time
- Pause memory storage for a specific conversation
- Export all memories as JSON
- Delete all memories

The memory consent state is stored per user and checked before any extraction job runs.

---

## Audit Log

Every memory operation (creation, update, deletion, retrieval) is logged with:

- Timestamp
- User ID
- Operation type
- Memory ID
- Triggered by (system extraction, user action, or AI confirmation prompt)

The audit log is not exposed in the UI in the initial version but is available for debugging and compliance review.
