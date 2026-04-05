# skillz

Personal skill collection for Codex-compatible agents.

## Included Skills

- `frontend-11-skill`: Distinctive, production-grade frontend design and implementation.
- `simplify11`: Cleanup and simplify recent code changes without changing behavior.
- `on511-route-monitor`: Fixed-route Ontario 511 monitoring workflow and scripts.
- `e2b-python-sandbox-agent`: Python-first E2B integration and sandbox workflow guidance.
- `toon-python-mcp`: TOON format and MCP integration guidance for Python projects.
- `skill-creator`: Guidance and helper scripts for creating new skills.

## Install From This Repo

List the skills available in this repository:

```bash
npx skills add regexboi/skillz --list
```

Install `frontend-11-skill`:

```bash
npx skills add regexboi/skillz --skill frontend-11-skill
```

Install `simplify11`:

```bash
npx skills add regexboi/skillz --skill simplify11
```

Install `on511-route-monitor`:

```bash
npx skills add regexboi/skillz --skill on511-route-monitor
```

Install both from this repo:

```bash
npx skills add regexboi/skillz --skill frontend-11-skill simplify11
```

Install all three highlighted skills from this repo:

```bash
npx skills add regexboi/skillz --skill frontend-11-skill simplify11 on511-route-monitor
```

Install all skills from this repo:

```bash
npx skills add regexboi/skillz --all
```

Add `-g` to install globally instead of in the current project:

```bash
npx skills add regexboi/skillz --skill frontend-11-skill -g
```
