# MTryOut Simulator — Implementation Plan

## Architecture

Modular monolith using Next.js App Router and strict TypeScript. PostgreSQL is the source of truth, accessed only through Prisma. Participant sessions use unguessable public tokens; admin authentication uses a signed, HTTP-only cookie. Route handlers are thin and delegate to domain modules under `src/lib`.

Historical integrity is provided by immutable JSON snapshots on `TrainingSessionQuestion`. Correct answers are never returned by an in-progress quiz API. Scoring and timeout finalization are server-side operations.

## Entities

- `AdminUser`: admin credentials and audit identity.
- `Participant`: a per-entry identity; identical names are not merged.
- `Material`, `Topic`: dynamic classification hierarchy.
- `Question`, `QuestionOption`, `Tag`, `QuestionTag`: question bank.
- `QuestionImport`, `QuestionImportItem`: import audit and row-level outcomes.
- `TrainingSession`, `TrainingSessionQuestion`, `TrainingAnswer`: configuration, immutable snapshots, shuffled order, and autosaved answers.
- `AppSetting`: typed JSON settings.

## Routes

Participant: `/`, `/quiz/config`, `/quiz/[token]`, `/result/[code]`.

Admin: `/admin/login`, `/admin`, `/admin/questions`, `/admin/questions/new`, `/admin/import`, `/admin/imports`, `/admin/materials`, `/admin/sessions`, `/admin/participants`, `/admin/analytics`, `/admin/settings`.

Route handlers: `/api/quiz/availability`, `/api/quiz/sessions`, `/api/quiz/sessions/[token]`, answer/flag/submit endpoints, admin CRUD/import/settings/session export endpoints.

## Question parsing

The importer supports two strategies:

1. Deterministic blocks with YAML-like frontmatter and `# Question`, `## Options`, `## Answer`, and optional explanation.
2. The supplied legacy bank: `#####` section headings, numbered one-line questions, inline `A.`–`D.` options, and a trailing `No,Kunci` answer table. The parser resets question numbering for each section and maps each answer-key column group to the corresponding section.

Every parsed item is validated. Duplicate external IDs and normalized question hashes are detected. Default duplicate policy is `SKIP`; `REPLACE` and `IMPORT_NEW` are explicit choices.

## Phases

1. Schema, migration, seed, authentication, layout.
2. Parser, validation, duplicate detection, admin question management.
3. Participant configuration, balanced selection, stable shuffling.
4. Session snapshots, timer, autosave, timeout/manual submit, scoring.
5. Results, review policy, admin session/participant views.
6. Analytics, settings, CSV, tests, documentation, production build.
