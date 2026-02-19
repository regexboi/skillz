# Bash Tool Patterns

Use this page when the caller may send shell commands, not just Python code.

## Pick the right execution API

- Use `commands.run(...)` for one-shot shell commands.
- Use `commands.run(..., background=True)` for detached jobs.
- Use `run_code(..., language="bash")` when handling notebook-like generated bash snippets.
- Use `sandbox.pty` for interactive terminal sessions (stateful shell, streaming input/output).

## One-shot command execution

```python
result = sbx.commands.run(
    "ls -la /home/user",
    on_stdout=lambda data: print(data),
    on_stderr=lambda data: print(data),
    envs={"CI": "1"},
)
```

Normalize output with:
- `stdout`
- `stderr`
- `exit_code` (if exposed by SDK object)

## Background commands

```python
cmd = sbx.commands.run("python -m http.server 3000", background=True)
# ... do work ...
cmd.kill()
```

For Python background streams, iterate the command handle:

```python
for stdout, stderr, _ in cmd:
    if stdout:
        print(stdout)
    if stderr:
        print(stderr)
```

## Interactive shell with PTY

PTY gives real-time bidirectional terminal control:

```python
terminal = sbx.pty.create(
    cols=80,
    rows=24,
    on_data=lambda b: print(b.decode(), end=""),
    timeout=0,  # disable PTY timeout for long sessions
)
sbx.pty.send_stdin(terminal.pid, b"echo hello\n")
terminal.wait()
```

Useful PTY operations:
- `send_stdin(pid, bytes)`
- `resize(pid, cols=..., rows=...)`
- `connect(pid, on_data=...)`
- `kill(pid)` or `terminal.kill()`
- `terminal.disconnect()` + reconnect later

## Guardrails for bash tools

- Validate command length and reject empty commands.
- Restrict `cwd` to allowed project paths.
- Use env allowlist; avoid blindly forwarding host env.
- Set explicit sandbox timeout and command timeout.
- Use network restrictions for sensitive tasks.
- Kill background processes when request scope ends.

## Suggested tool args

Use this shape:

```json
{
  "command": "string",
  "cwd": "string (optional)",
  "timeout_seconds": 120,
  "background": false,
  "env": {"KEY": "VALUE"}
}
```

For reusable provider schemas, use `scripts/tool_contracts.py`.
