---
name: on511-route-monitor
description: Scrape Ontario 511 for a fixed Scarborough-to-Oshawa commute route (4 Agincourt Drive, Scarborough -> 1908 Colonel Sam Drive, Oshawa) and return route time, primary-route events/roadwork, route camera image URLs, plow locations, road conditions, forecasted driving conditions, Waze feeds, and traffic-speed artifacts. Use when this exact A/B route should be collected without rediscovering 511ON page structure or endpoints.
---

# ON511 Fixed Route Monitor

Run this skill when you need repeatable data extraction for this specific route:
- Start: `4 Agincourt Drive, Scarborough, ON`
- End: `1908 Colonel Sam Drive, Oshawa, ON`

## Quick run

```bash
PLAYWRIGHT_BROWSERS_PATH=/tmp/ms-playwright \
node .agents/skills/on511-route-monitor/scripts/collect_on511_route_data.mjs \
./tmp511-route-output
```

The script writes:
- `./tmp511-route-output/on511_route_report.json`

## What the script extracts

- Primary route travel time and distance
- Primary route events and roadwork text shown in route details
- Primary route camera names and camera image URLs (`/map/Cctv/{id}`)
- Track My Plow points near the route corridor
- Road Conditions rows for route-relevant Highway 401 segments
- Forecasted Driving Conditions rows for route-relevant Highway 401 segments
- Waze incidents / jams / weather (can be empty)
- Traffic-speed artifacts:
- Tile URL samples for the traffic-speed layer
- Computed average speed from route distance/time

## Required environment

- Node.js 18+
- `playwright` installed in workspace (`npm install playwright`)
- Browser binaries in `/tmp/ms-playwright` (or set `PLAYWRIGHT_BROWSERS_PATH` to your location)

If browsers are missing, install once:

```bash
XDG_CACHE_HOME=/tmp npx playwright install firefox
```

## Reliability notes

- Close login popup modal (`Close` / `×`) if present.
- Press `Enter` after destination input to settle autocomplete.
- Avoid hardcoded `e###` refs for core logic; these change.
- Waze feeds can legitimately return zero records.
- Traffic-speed layer is color-tile based; numeric segment speeds are not exposed by list APIs.

## References

- Playwright command registry and gotchas: `references/playwright-command-registry.md`
- Endpoint catalog: `references/endpoints.md`
