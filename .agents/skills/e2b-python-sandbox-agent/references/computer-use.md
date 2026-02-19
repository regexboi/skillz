# Computer Use (Desktop Sandbox)

Use this page when building GUI agents that must see and control a desktop.

## Setup

1. Install SDK:
   `pip install e2b-desktop`
2. Create sandbox:

```python
from e2b_desktop import Sandbox

desktop = Sandbox.create(
    resolution=(1024, 720),
    dpi=96,
    timeout=300,
)
```

3. Start stream only when needed:

```python
desktop.stream.start()
print(desktop.stream.get_url())
```

## Action surface

Mouse:
- `left_click(x, y)`
- `right_click(x, y)`
- `double_click(x, y)`
- `middle_click(x, y)`
- `move_mouse(x, y)`
- `drag([start_x, start_y], [end_x, end_y])`

Keyboard:
- `write(text)`
- `press(key)`

Scroll:
- `scroll("up" | "down", ticks)`

Capture:
- `screenshot()` -> bytes

Terminal inside desktop sandbox:
- `commands.run("...")`

## Recommended loop

1. Capture screenshot.
2. Send screenshot + prior step context to vision-capable model.
3. Parse one action.
4. Validate action arguments.
5. Execute action.
6. Repeat until done or step limit reached.

Always enforce `max_steps` and clear stop conditions.

## Validation rules

- Require integer coordinates within current resolution bounds.
- Clamp or reject large scroll/tick values.
- Allowlist key names.
- Limit typed text length per step.
- Reject unsupported action types early.

## Suggested desktop action contract

```json
{
  "action": "click|right_click|double_click|middle_click|move|drag|type|keypress|scroll|screenshot|run_command",
  "x": 100,
  "y": 200,
  "start_x": 0,
  "start_y": 0,
  "end_x": 0,
  "end_y": 0,
  "text": "optional",
  "key": "optional",
  "direction": "up|down",
  "ticks": 3,
  "command": "optional shell command"
}
```

Use `scripts/tool_contracts.py` to emit provider-specific versions of this schema.

## Template reference

If you need a custom desktop image, use the template example in:
- `docs/docs/template/examples/desktop.mdx`

It documents Ubuntu + XFCE + VNC setup and build settings.
