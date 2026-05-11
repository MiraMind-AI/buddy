# Security Policy

## Reporting Security Issues

Do not open a public GitHub issue for security vulnerabilities. Contact the maintainers directly via email or private message.

## General Rules

- Never commit secrets, API keys, passwords, or tokens to the repository.
- All sensitive configuration goes in `.env` files, which are excluded from version control.
- The `.env.example` file contains only placeholder values with no secrets.

## API Keys

- API keys for OpenAI or other providers belong in `.env` only.
- The frontend must never receive or expose API keys.
- All AI provider calls go through the backend.

## Environment Files

- Copy `.env.example` to `.env` and fill in your own values locally.
- Never share your `.env` file or its contents.
- Production secrets are managed through environment variables in the deployment environment, not through files.

## Memory and User Data

- User memory data is associated with authenticated user accounts.
- Sensitive memories should be handled with care in logs and exports.
- Users can delete their data at any time through the application.

## Logging

- Logs must not contain raw user messages, memory content, or authentication tokens.
- Structured logging with controlled log levels should be used throughout.
