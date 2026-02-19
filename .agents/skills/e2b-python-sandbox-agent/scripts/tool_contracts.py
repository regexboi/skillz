#!/usr/bin/env python3
"""Generate provider-specific tool schemas for E2B use cases.

Usage examples:
  python scripts/tool_contracts.py --provider openai --tool code
  python scripts/tool_contracts.py --provider anthropic --tool all
"""

from __future__ import annotations

import argparse
import json
from typing import Any


def _code_schema() -> dict[str, Any]:
    return {
        "type": "object",
        "properties": {
            "code": {
                "type": "string",
                "description": "Code to execute in the sandbox.",
            },
            "language": {
                "type": "string",
                "enum": ["python", "bash", "javascript", "r", "java"],
                "description": "Runtime language. Default to python.",
            },
            "timeout_seconds": {
                "type": "integer",
                "minimum": 1,
                "maximum": 3600,
                "description": "Execution timeout in seconds.",
            },
            "context_id": {
                "type": "string",
                "description": "Optional E2B code context id.",
            },
        },
        "required": ["code"],
        "additionalProperties": False,
    }


def _bash_schema() -> dict[str, Any]:
    return {
        "type": "object",
        "properties": {
            "command": {
                "type": "string",
                "description": "Shell command to run in sandbox.",
            },
            "cwd": {
                "type": "string",
                "description": "Optional working directory.",
            },
            "timeout_seconds": {
                "type": "integer",
                "minimum": 1,
                "maximum": 3600,
                "description": "Command timeout in seconds.",
            },
            "background": {
                "type": "boolean",
                "description": "Run command in background and return immediately.",
            },
            "env": {
                "type": "object",
                "description": "Optional command-scoped environment variables.",
                "additionalProperties": {"type": "string"},
            },
        },
        "required": ["command"],
        "additionalProperties": False,
    }


def _desktop_schema() -> dict[str, Any]:
    return {
        "type": "object",
        "properties": {
            "action": {
                "type": "string",
                "enum": [
                    "click",
                    "right_click",
                    "double_click",
                    "middle_click",
                    "move",
                    "drag",
                    "type",
                    "keypress",
                    "scroll",
                    "screenshot",
                    "run_command",
                ],
                "description": "Desktop action to execute.",
            },
            "x": {"type": "integer"},
            "y": {"type": "integer"},
            "start_x": {"type": "integer"},
            "start_y": {"type": "integer"},
            "end_x": {"type": "integer"},
            "end_y": {"type": "integer"},
            "text": {"type": "string"},
            "key": {"type": "string"},
            "direction": {"type": "string", "enum": ["up", "down"]},
            "ticks": {"type": "integer", "minimum": 1, "maximum": 100},
            "command": {"type": "string"},
        },
        "required": ["action"],
        "additionalProperties": False,
    }


DEFS: dict[str, dict[str, Any]] = {
    "code": {
        "name": "execute_code",
        "description": "Run code in an E2B code-interpreter sandbox.",
        "schema": _code_schema(),
    },
    "bash": {
        "name": "execute_bash",
        "description": "Run a shell command in an E2B sandbox.",
        "schema": _bash_schema(),
    },
    "desktop": {
        "name": "desktop_action",
        "description": "Execute one validated action in an E2B desktop sandbox.",
        "schema": _desktop_schema(),
    },
}


def _for_openai(tool: dict[str, Any]) -> dict[str, Any]:
    return {
        "type": "function",
        "function": {
            "name": tool["name"],
            "description": tool["description"],
            "parameters": tool["schema"],
        },
    }


def _for_anthropic(tool: dict[str, Any]) -> dict[str, Any]:
    return {
        "name": tool["name"],
        "description": tool["description"],
        "input_schema": tool["schema"],
    }


def build_tools(provider: str, tool: str) -> list[dict[str, Any]]:
    selected = DEFS.values() if tool == "all" else [DEFS[tool]]
    if provider == "openai":
        return [_for_openai(t) for t in selected]
    return [_for_anthropic(t) for t in selected]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--provider",
        choices=["openai", "anthropic"],
        required=True,
        help="Tool schema target provider.",
    )
    parser.add_argument(
        "--tool",
        choices=["code", "bash", "desktop", "all"],
        default="all",
        help="Schema to output.",
    )
    args = parser.parse_args()

    tools = build_tools(args.provider, args.tool)
    print(json.dumps(tools, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
