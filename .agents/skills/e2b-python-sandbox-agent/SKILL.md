---
name: e2b-python-sandbox-agent
description: Build Python-first E2B integrations for code interpreter tool-calling, bash/terminal tools, and computer-use desktop agents. Use when implementing or updating e2b_code_interpreter/e2b_desktop workflows, defining LLM tool schemas, running untrusted code in sandboxes, handling files/results, or managing sandbox lifecycle, security, and persistence.
---

# E2b Python Sandbox Agent

Use Python-hosted E2B sandboxes for three tool classes: code interpreter, bash/terminal, and computer use (desktop automation). Keep execution deterministic, bounded, and safe.

## Choose Execution Surface

- Use `e2b_code_interpreter.Sandbox.run_code()` for generated code cells and structured results.
- Use `sandbox.commands.run()` for one-shot shell commands.
- Use `sandbox.pty` for interactive terminal sessions.
- Use `e2b_desktop.Sandbox` for GUI automation with screenshots and mouse/keyboard actions.
- Use custom templates (`e2b.Template`) when dependencies are known in advance and cold-start speed matters.

## Python-First Workflow

1. Load `E2B_API_KEY`, then create a sandbox with explicit timeout and metadata.
2. Validate tool inputs before execution (language, command length, cwd, env allowlist, desktop action args).
3. Execute in the correct surface (`run_code`, `commands.run`, `pty`, or desktop action API).
4. Normalize outputs into a stable response shape for your client and model loop.
5. Persist/reconnect when needed, otherwise kill sandboxes promptly.

## Default Output Contract

Return this shape from wrappers so model providers stay interchangeable:

```python
{
  "ok": bool,
  "sandbox_id": str,
  "stdout": str,
  "stderr": str,
  "text": str | None,
  "results": list,
  "artifacts": list[dict],
  "error": dict | None,
}
```

## Use Case Playbooks

### Code Interpreter Tool

- Use `Sandbox.create()` (v2 pattern) and run generated code with `run_code`.
- Accept `language` when needed (`python`, `javascript`, `r`, `java`, `bash`).
- Handle runtime failures via `execution.error` and return structured error payloads.
- Parse `execution.results` for charts/artifacts (`result.png`, `result.chart`, and text outputs).
- Use code contexts only for parallel stateful sessions.

Read first: `references/code-interpreter.md`.

### Bash Tool

- Prefer `commands.run(command, on_stdout=..., on_stderr=...)` for shell tasks.
- Use `background=True` only when caller explicitly needs detached processes.
- Use `run_code(..., language="bash")` only for notebook-style generated bash snippets.
- Use PTY for interactive sessions, not for simple one-shot commands.

Read first: `references/bash-tool.md`.

### Computer Use Tool

- Use `e2b_desktop.Sandbox.create(resolution=..., dpi=..., timeout=...)`.
- Start stream only when a human must watch the desktop.
- Run loop: screenshot -> model action -> execute action -> repeat with max step guard.
- Validate coordinates, keypresses, and scroll values before execution.
- Keep desktop actions and terminal actions as separate tools unless you need both.

Read first: `references/computer-use.md`.

## Security And Operations

- Keep secure mode enabled (default in SDK v2+).
- Restrict networking for sensitive jobs (`allow_internet_access=False` or `network` allow/deny lists).
- Restrict public URL access with `network.allow_public_traffic=False` when exposing ports.
- Tag sandboxes with metadata to reconnect per user/session.
- Respect concurrency and request limits when scaling.

Read first: `references/operations-and-security.md`.

## Resources

- `scripts/tool_contracts.py`: Generate OpenAI/Anthropic tool schemas for code, bash, and desktop actions.
- `references/doc-map.md`: Source-doc map and version-safe defaults.
- `references/code-interpreter.md`: Code execution, results, contexts, and LLM patterns.
- `references/bash-tool.md`: Command execution, background jobs, and PTY.
- `references/computer-use.md`: Desktop automation loop and action mapping.
- `references/operations-and-security.md`: Security, networking, persistence, files, and limits.
