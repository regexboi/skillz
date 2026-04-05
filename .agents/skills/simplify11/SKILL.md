---
name: simplify11
description: Refine recently modified code for clarity, consistency, and maintainability without changing behavior. Use when Codex should simplify a fresh diff, clean up code it just wrote, or make an existing change easier to read while still following repo-specific instructions from CLAUDE.md, AGENTS.md, lint rules, and local framework conventions.
---

# Simplify11

## Overview

Use this skill after writing code or when a user asks for cleanup without behavior changes. Focus on changed files first and prefer explicit, readable code over dense or clever rewrites.

## Workflow

1. Identify the active scope.
   - Start with files changed in the current session, the current diff, or the code the user explicitly points to.
   - Expand only when a small adjacent cleanup is necessary to keep the result coherent.
2. Read project instructions before editing.
   - Check for `CLAUDE.md`, `AGENTS.md`, lint config, and framework conventions.
   - Treat repo-specific rules as higher priority than generic preferences in this skill.
3. Simplify for readability.
   - Reduce unnecessary nesting and indirection.
   - Remove redundant helpers, repeated logic, dead branches, and temporary variables when the replacement is clearer.
   - Prefer straightforward names and explicit control flow.
   - Avoid nested ternaries. Use `if`/`else` chains or `switch` when multiple conditions are involved.
   - Prefer `function` declarations over arrow functions when that matches local standards.
   - Add explicit top-level return types in TypeScript when required by project conventions or when they materially improve clarity.
   - Keep React components explicit with readable props types and extracted helpers only when they clarify the component.
4. Preserve exact behavior.
   - Do not change outputs, side effects, public APIs, error semantics, async sequencing, or data flow.
   - Keep useful abstractions that encode domain meaning or genuinely reduce duplication.
   - Remove comments that only restate the code. Keep comments that explain non-obvious intent.
   - Avoid adding `try`/`catch` unless the behavior requires it. Do not remove necessary error handling.
5. Verify the result.
   - Run the narrowest relevant tests, lint, or typecheck for touched code when practical.
   - If verification cannot run, say so explicitly.

## Decision Rules

- Prefer clarity over fewer lines.
- Do not collapse separate concerns into one helper just to reduce repetition.
- Stop simplifying when the next change would make debugging, extension, or review harder.
- Keep the refactor local unless the user asks for a broader pass.

## Example Requests

- `Use $simplify11 to clean up the code I just changed.`
- `Use $simplify11 to simplify this component without altering behavior.`
- `Use $simplify11 to refine the current diff and make it more consistent with the repo.`
