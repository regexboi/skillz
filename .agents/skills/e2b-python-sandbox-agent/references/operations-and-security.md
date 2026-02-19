# Operations And Security

Use this page for lifecycle, persistence, networking, files, and scaling constraints.

## Lifecycle

- Default sandbox lifetime is 5 minutes unless timeout is set.
- Create with explicit timeout:
  `Sandbox.create(timeout=300)`
- Extend with:
  `sandbox.set_timeout(seconds)`
- End with:
  `sandbox.kill()`

## Connect and reuse

- Track `sandbox_id` and user metadata.
- Reconnect with:
  `Sandbox.connect(sandbox_id, timeout=...)`
- List with pagination via `Sandbox.list(...)`.

## Persistence (beta)

- Pause with `beta_pause()`.
- Resume by connecting.
- Use for stateful workloads where memory/filesystem continuity matters.
- Note beta constraints:
  - Pause/resume latency scales with RAM usage.
  - Continuous runtime limits depend on plan.

## Secure access

- SDK v2+ enables secure access by default.
- Keep `secure=True` unless debugging old templates.
- Rebuild old templates (pre envd `v0.2.0`) to avoid compatibility issues.

## Network controls

- Disable all outbound internet:
  `Sandbox.create(allow_internet_access=False)`
- Fine-grained rules with `network`:
  - `allow_out`
  - `deny_out`
  - `ALL_TRAFFIC` helper
- Restrict public URL access:
  `network={"allow_public_traffic": False}`
  then require `e2b-traffic-access-token` header.

## Files and artifacts

- Read: `files.read(path)`
- Write single: `files.write(path, data)`
- Write many: `files.write_files([{path, data}, ...])`
- Metadata: `files.get_info(path)`
- Upload/download for untrusted clients via pre-signed URLs.

## Dependencies

Use runtime install only for ad-hoc needs:
- `commands.run("pip install ...")`
- `commands.run("apt-get ...")`

Use templates for repeatable production environments:
- Build with `e2b.Template`
- Use stable template name/id in `Sandbox.create(...)`

## Rate and scale constraints

Watch and design for:
- lifecycle API request limits
- sandbox operations request limits
- per-plan concurrent sandbox limits
- sandbox creation rate
- egress connection limit per sandbox

Handle `429`/rate-limit exceptions with retry/backoff and queueing.
