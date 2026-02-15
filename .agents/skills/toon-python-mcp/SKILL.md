---
name: toon-python-mcp
description: Implement TOON in Python RAG and MCP-tool projects using toon_format encode/decode, strict validation, and model I/O contracts. Use when replacing JSON prompt payloads with TOON, adding TOON support to MCP tools, or validating model-generated TOON before converting back to Python objects.
---

# TOON Python MCP

Implement TOON as a transport format at model boundaries. Keep internal application data as normal Python dict/list values.

## Apply This Workflow

1. Install and pin dependency.

```bash
pip install "toon_format @ git+https://github.com/toon-format/toon-python.git"
```

2. Add a thin codec module (for example `toon_codec.py`) and centralize all TOON I/O there.

```python
from __future__ import annotations

import re
from typing import Any

from toon_format import ToonDecodeError, decode, encode

_TOON_BLOCK_RE = re.compile(r"```(?:toon|yaml)?\\n(.*?)```", re.DOTALL)


def encode_for_llm(payload: Any) -> str:
    # Use one delimiter consistently across the app.
    return encode(payload, {"delimiter": "\t", "indent": 2})


def decode_from_llm(text: str) -> Any:
    match = _TOON_BLOCK_RE.search(text)
    candidate = match.group(1).strip() if match else text.strip()
    return decode(candidate, {"strict": True, "indent": 2})


def try_decode_from_llm(text: str) -> tuple[Any | None, str | None]:
    try:
        return decode_from_llm(text), None
    except ToonDecodeError as err:
        return None, str(err)
```

3. Integrate at MCP boundaries.
- Keep MCP tool handlers returning plain Python objects.
- Encode tool output to TOON only when inserting structured context into a model prompt.
- Decode model TOON output immediately and convert to Python objects before downstream logic.

4. Enforce a response contract in prompts.
- Require a single fenced TOON block.
- Require `[N]` counts to match row count.
- Require stable field order for tabular arrays.
- Forbid prose outside the code block when machine parsing is required.

5. Implement repair loop on decode errors.
- If strict decode fails, send one repair prompt containing:
  - previous invalid TOON
  - decoder error message
  - instruction to return corrected TOON only
- Retry once. After one failure, fall back to JSON output contract.

## MCP Pattern

Use TOON for large structured tool results passed to the model:

```python
def build_messages(query: str, tool_payload: dict[str, Any]) -> list[dict[str, str]]:
    toon_data = encode_for_llm(tool_payload)
    return [
        {
            "role": "system",
            "content": "Return only a fenced TOON block. Keep counts and fields valid.",
        },
        {
            "role": "user",
            "content": f"Question: {query}\\n\\nTool data:\\n```toon\\n{toon_data}\\n```",
        },
    ]
```

## Delimiter And Marker Rules

- Default to tab delimiter (`"\t"`) for arrays unless your data frequently contains tabs.
- Use comma delimiter only if tab handling is brittle in your stack.
- Use `lengthMarker: "#"` only when you explicitly want `[#N]` headers for stricter visual checks.
- Do not mix delimiters across producers/consumers in one pipeline.

## Compatibility Guardrail

`toon_format` is currently beta (`0.9.x`) and may lag the latest TOON spec features.

Before implementing parser-sensitive features:
1. Check the library version in the target project.
2. Validate required syntax using round-trip tests (`encode -> decode`).
3. If behavior differs from your expected spec version, pin library version and document the chosen syntax profile in code comments.

## Minimum Verification

Run these checks before finishing:

1. Round-trip test for representative MCP payloads (nested objects, uniform arrays, mixed arrays).
2. Strict decode failure test (count mismatch or malformed row) to confirm repair loop path.
3. Prompt contract test to verify model output is parseable without manual cleanup.
