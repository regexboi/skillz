# Code Interpreter (Python Client)

Use this page when implementing `run_code` tools and parsing execution outputs.

## Baseline setup

1. Install SDK:
   `pip install e2b-code-interpreter`
2. Set API key:
   `E2B_API_KEY=...`
3. Create sandbox:

```python
from e2b_code_interpreter import Sandbox

sbx = Sandbox.create(timeout=300, metadata={"user_id": "u_123"})
```

## Run generated code

```python
execution = sbx.run_code(code, language="python")
if execution.error:
    err = {
        "name": execution.error.name,
        "value": execution.error.value,
        "traceback": execution.error.traceback,
    }
```

Supported runtimes are documented as:
- `python`
- `javascript`
- `r`
- `java`
- `bash`

## Streaming callbacks

Use callbacks for partial outputs:

```python
execution = sbx.run_code(
    code,
    on_stdout=lambda data: print(data),
    on_stderr=lambda data: print(data),
    on_error=lambda err: print(err),
    on_result=lambda result: print(result),
)
```

Use streaming when execution may be long or when incremental UI updates are needed.

## Results and artifacts

- Use `execution.text` for simple text result.
- Inspect `execution.results` for rich outputs.
- Save chart images from `result.png` (base64).
- Use `result.chart` for interactive chart payloads.

Static and interactive chart patterns are documented in:
- `code-interpreting/create-charts-visualizations/static-charts.mdx`
- `code-interpreting/create-charts-visualizations/interactive-charts.mdx`

## Code contexts for parallel state

Use contexts when you need separate stateful sessions in one sandbox:

```python
ctx = sbx.create_code_context(
    cwd="/home/user",
    language="python",
    request_timeout=60_000,
)
execution = sbx.run_code(code, context=ctx)
```

Manage contexts with:
- `list_code_contexts()`
- `restart_code_context(...)`
- `remove_code_context(...)`

## LLM tool-calling pattern

Preferred pattern from quickstart docs:

1. Define tool schema with one code argument (and optional language).
2. Receive tool call from model.
3. Execute in sandbox.
4. Return structured result back to model.

When model does not support tool use, fallback to code extraction is possible but weaker.
Keep this as fallback only.
