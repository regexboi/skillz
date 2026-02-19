# E2B Doc Map

This skill is based on local docs in `docs/docs/` from the cloned E2B repository.

## Primary sources used

- `docs/docs/quickstart.mdx`
- `docs/docs/quickstart/connect-llms.mdx`
- `docs/docs/sandbox.mdx`
- `docs/docs/migration/v2.mdx`
- `docs/docs/commands.mdx`
- `docs/docs/commands/streaming.mdx`
- `docs/docs/commands/background.mdx`
- `docs/docs/sandbox/pty.mdx`
- `docs/docs/code-interpreting/supported-languages.mdx`
- `docs/docs/code-interpreting/supported-languages/python.mdx`
- `docs/docs/code-interpreting/supported-languages/bash.mdx`
- `docs/docs/code-interpreting/streaming.mdx`
- `docs/docs/code-interpreting/contexts.mdx`
- `docs/docs/code-interpreting/analyze-data-with-ai.mdx`
- `docs/docs/code-interpreting/create-charts-visualizations/static-charts.mdx`
- `docs/docs/code-interpreting/create-charts-visualizations/interactive-charts.mdx`
- `docs/docs/use-cases/computer-use.mdx`
- `docs/docs/template/examples/desktop.mdx`
- `docs/docs/filesystem/read-write.mdx`
- `docs/docs/filesystem/upload.mdx`
- `docs/docs/filesystem/download.mdx`
- `docs/docs/filesystem/info.mdx`
- `docs/docs/sandbox/connect.mdx`
- `docs/docs/sandbox/list.mdx`
- `docs/docs/sandbox/persistence.mdx`
- `docs/docs/sandbox/metadata.mdx`
- `docs/docs/sandbox/environment-variables.mdx`
- `docs/docs/sandbox/internet-access.mdx`
- `docs/docs/sandbox/secured-access.mdx`
- `docs/docs/sandbox/rate-limits.mdx`
- `docs/docs/quickstart/install-custom-packages.mdx`

## Version-safe defaults

- Use `Sandbox.create()` in synchronous Python (`migration/v2.mdx`), not `Sandbox()`.
- Keep secure mode enabled (default in SDK v2+).
- Use `files.write()` for single file and `files.write_files()` for multiple files in Python SDK v2.
- Treat `Sandbox.list()` as paginated API in SDK v2.

## Research notes for this skill

- Use `e2b_code_interpreter` for code and command execution.
- Use `e2b_desktop` for GUI computer-use flows.
- Use `e2b` template APIs when you need custom images/dependencies.
- Prefer model tool calling over regex extraction; fallback extraction pattern is documented if provider lacks tool use.

## Doc inconsistencies to handle carefully

- `sandbox/pty.mdx` shows Python constructor usage (`Sandbox()`), but `migration/v2.mdx` defines `Sandbox.create()` as v2 pattern.
- `quickstart/upload-download-files.mdx` says directory/multi-file workflows are limited, while newer filesystem pages document `files.write_files`.

When docs conflict, prefer `migration/v2.mdx` and newer, more specific pages.
