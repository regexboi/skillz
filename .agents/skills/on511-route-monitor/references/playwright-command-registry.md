# 511ON Playwright Command Registry (Fixed Route)

Hardcoded route:
- `A`: `4 Agincourt Drive, Scarborough, ON`
- `B`: `1908 Colonel Sam Drive, Oshawa, ON`

## Core session commands

```bash
XDG_CACHE_HOME=/tmp playwright-cli -s=on511 open 'https://511on.ca/?lang=en' --browser=firefox
XDG_CACHE_HOME=/tmp playwright-cli -s=on511 fill e89 '4 Agincourt Drive, Scarborough, ON'
XDG_CACHE_HOME=/tmp playwright-cli -s=on511 fill e101 '1908 Colonel Sam Drive, Oshawa, ON'
XDG_CACHE_HOME=/tmp playwright-cli -s=on511 press Enter
XDG_CACHE_HOME=/tmp playwright-cli -s=on511 snapshot
```

## Route extraction (robust selector-based)

Use `run-code` or the bundled script to avoid fragile `e###` refs:

```bash
XDG_CACHE_HOME=/tmp playwright-cli -s=on511 run-code "async page => {
  await page.getByRole('textbox', { name: 'Start Location' }).fill('4 Agincourt Drive, Scarborough, ON');
  await page.getByRole('textbox', { name: 'Destination' }).fill('1908 Colonel Sam Drive, Oshawa, ON');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  const close = page.getByRole('button', { name: 'Close' });
  if (await close.count()) { try { await close.first().click({ timeout: 1000 }); } catch {} }
  await page.waitForSelector('text=Route 1', { timeout: 20000 });
  return 'route ready';
}"
```

## Layer toggles used in validation

```bash
XDG_CACHE_HOME=/tmp playwright-cli -s=on511 check e312  # Traffic Speeds
XDG_CACHE_HOME=/tmp playwright-cli -s=on511 check e344  # Track My Plow
XDG_CACHE_HOME=/tmp playwright-cli -s=on511 check e381  # Forecasted Driving Conditions
XDG_CACHE_HOME=/tmp playwright-cli -s=on511 check e391  # Waze Incidents
XDG_CACHE_HOME=/tmp playwright-cli -s=on511 check e394  # Waze Traffic Jams
XDG_CACHE_HOME=/tmp playwright-cli -s=on511 check e397  # Waze Weather Hazards
```

## Known gotchas

- Login modal can appear after route generation; close with button `Close` (`×`) before extracting.
- Destination autocomplete can stay active; press `Enter` after filling destination.
- Route item refs (`e1088`, etc.) are unstable; prefer role/text selectors via `run-code`.
- `Road Conditions` / `Forecasted Driving Conditions` conflict with `Traffic Speeds` in map layer rules.
- Waze endpoints can return empty arrays even when layer is enabled.
