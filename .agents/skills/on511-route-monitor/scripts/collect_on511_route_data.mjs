#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { firefox } from 'playwright';

const START = '4 Agincourt Drive, Scarborough, ON';
const END = '1908 Colonel Sam Drive, Oshawa, ON';
const BASE = 'https://511on.ca';
const CORRIDOR_BBOX = {
  minLat: 43.65,
  maxLat: 44.02,
  minLon: -79.55,
  maxLon: -78.65,
};

const CAMERA_NAME_NORMALIZE = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();

const fetchJson = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return await r.json();
};

const inBbox = ([lat, lon], b) => lat >= b.minLat && lat <= b.maxLat && lon >= b.minLon && lon <= b.maxLon;

const parseRouteDetails = (text) => {
  const time = (text.match(/Total Time:\s*([0-9]+\s*min)/i) || [])[1] || null;
  const distance = (text.match(/Total Travel Distance:\s*([0-9.]+\s*km)/i) || [])[1] || null;
  const events = Number((text.match(/Events\s*([0-9]+)/i) || [])[1] || 0);
  const currentRoadwork = (text.match(/Current Roadwork(.*?)Show more/i) || [])[1]?.trim() || null;
  const construction = [...text.matchAll(/Construction(.*?)(?=Construction|Cameras\s*[0-9]+|Take exit|Notes|$)/gis)]
    .map((m) => m[1].replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const cameraMatch = text.match(/Cameras\s*([0-9]+)\s(.*?)(?=Take exit|Turn left|Arrive at|Notes|$)/is);
  const cameraCount = cameraMatch ? Number(cameraMatch[1]) : 0;
  const cameraNames = cameraMatch
    ? [...cameraMatch[2].matchAll(/Highway 401.*?(?=Highway 401|$)/gis)].map((m) => m[0].replace(/\s+/g, ' ').trim()).filter(Boolean)
    : [];
  const avgSpeedKmh = time && distance
    ? Number((parseFloat(distance) / (parseInt(time, 10) / 60)).toFixed(1))
    : null;

  return { time, distance, events, currentRoadwork, construction, cameraCount, cameraNames, avgSpeedKmh };
};

const fetchListDataAll = async (type) => {
  const columns = type === 'RoadConditions'
    ? [
        { data: null, name: '' },
        { name: 'roadway', s: true },
        { name: 'description', s: true },
        { name: 'primaryCondition', s: true },
        { name: 'secondaryConditions', s: true },
        { name: 'visibility', s: true },
        { name: 'drifting', s: true },
        { name: 'lastUpdated', s: true },
        { name: 'area', s: true },
      ]
    : [
        { data: null, name: '' },
        { name: 'roadway', s: true },
        { name: 'description', s: true },
        { name: 'forecast', s: true },
        { name: 'timeframe', s: true },
        { name: 'date', s: true },
        { name: 'region', s: true },
      ];

  const order = type === 'RoadConditions' ? [{ column: 1, dir: 'asc' }] : [{ column: 2, dir: 'asc' }];

  const page = async (start, length = 100) => {
    const query = { columns, order, start, length, search: { value: '' } };
    const u = `${BASE}/List/GetData/${type}?query=${encodeURIComponent(JSON.stringify(query))}&lang=en`;
    return await fetchJson(u);
  };

  const first = await page(0, 100);
  const rows = [...(first.data || [])];
  for (let start = 100; start < (first.recordsTotal || 0); start += 100) {
    const next = await page(start, 100);
    rows.push(...(next.data || []));
  }

  return rows;
};

const routeConditionFilter = (row) => {
  const roadway = String(row.roadway || '').toLowerCase().trim();
  const text = `${row.roadway || ''} ${row.description || ''} ${row.area || ''} ${row.region || ''}`.toLowerCase();
  const is401 = roadway === '401' || roadway === 'highway 401';
  return is401 && /(morningside|scarborough|pickering|brock|westney|salem|lakeridge|harmony|oshawa|thickson|ajax|whitby|boundary road)/.test(text);
};

const fetchCameraTooltip = async (itemId) => {
  const r = await fetch(`${BASE}/tooltip/Cameras/${itemId}?lang=en`);
  if (!r.ok) return null;
  const html = await r.text();
  const name = (html.match(/<strong>\s*([^<]+?)\s*<\/strong>/i) || [])[1]?.trim() || null;
  const images = [...html.matchAll(/data-lazy="([^"]+)"/g)].map((m) => `${BASE}${m[1]}`);
  return { name, images: [...new Set(images)] };
};

const latLonToTile = (lat, lon, z) => {
  const n = 2 ** z;
  const x = Math.floor(((lon + 180) / 360) * n);
  const y = Math.floor((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2 * n);
  return { x, y };
};

const buildTrafficTileUrls = (bbox, z) => {
  const nw = latLonToTile(bbox.maxLat, bbox.minLon, z);
  const se = latLonToTile(bbox.minLat, bbox.maxLon, z);
  const urls = [];
  for (let x = nw.x; x <= se.x; x += 1) {
    for (let y = nw.y; y <= se.y; y += 1) {
      urls.push(`https://tiles.ibi511.com/Geoservice/GetTrafficTile?x=${x}&y=${y}&z=${z}`);
    }
  }
  return urls;
};

async function main() {
  const outDir = path.resolve(process.argv[2] || './tmp511-skill-output');
  await fs.mkdir(outDir, { recursive: true });

  const browser = await firefox.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`${BASE}/?lang=en`, { waitUntil: 'domcontentloaded' });

  await page.getByRole('textbox', { name: 'Start Location' }).fill(START);
  await page.getByRole('textbox', { name: 'Destination' }).fill(END);
  await page.getByRole('textbox', { name: 'Destination' }).press('Enter');
  await page.waitForTimeout(1500);

  const close = page.getByRole('button', { name: 'Close' });
  if (await close.count()) {
    try { await close.first().click({ timeout: 1000 }); } catch {}
  }

  try {
    await page.waitForSelector('#eventRouteToggle1', { timeout: 15000 });
  } catch {
    // Fallback: force autocomplete selection and retry route generation.
    const firstSuggestion = page.getByRole('listitem').first();
    if (await firstSuggestion.count()) {
      try { await firstSuggestion.click({ timeout: 1000 }); } catch {}
    }
    await page.getByRole('textbox', { name: 'Destination' }).press('Enter');
    await page.waitForTimeout(2000);
    await page.waitForSelector('#eventRouteToggle1', { timeout: 20000 });
  }

  const primaryBlock = await page.evaluate(() => {
    const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
    const eventNode = document.getElementById('eventRouteToggle1');
    if (!eventNode) return null;
    let cur = eventNode;
    while (cur) {
      const t = clean(cur.textContent);
      if (/Total Time:/i.test(t) && /Total Travel Distance:/i.test(t)) return t;
      cur = cur.parentElement;
    }
    return null;
  });

  if (!primaryBlock) throw new Error('Could not isolate primary route block.');
  const primaryRoute = parseRouteDetails(primaryBlock);

  const cameras = await fetchJson(`${BASE}/map/mapIcons/Cameras`);
  const corridorCandidates = (cameras.item2 || []).filter((c) => inBbox(c.location, CORRIDOR_BBOX));
  const wanted = new Set(primaryRoute.cameraNames.map(CAMERA_NAME_NORMALIZE));
  const matchedCameras = [];

  for (const c of corridorCandidates) {
    if (!wanted.size) break;
    const tip = await fetchCameraTooltip(c.itemId);
    if (!tip?.name) continue;
    const key = CAMERA_NAME_NORMALIZE(tip.name);
    if (wanted.has(key)) {
      matchedCameras.push({ itemId: c.itemId, location: c.location, name: tip.name, images: tip.images });
      wanted.delete(key);
    }
  }

  const [plows, wazeIncidents, wazeTraffic, wazeWeather, roadRows, forecastRows] = await Promise.all([
    fetchJson(`${BASE}/map/mapIcons/ServiceVehicles`),
    fetchJson(`${BASE}/map/mapIcons/WazeIncidents`),
    fetchJson(`${BASE}/map/mapIcons/WazeTraffic`),
    fetchJson(`${BASE}/map/mapIcons/WazeWeather`),
    fetchListDataAll('RoadConditions'),
    fetchListDataAll('ForecastedDrivingConditions'),
  ]);

  const plowsNearRoute = (plows.item2 || []).filter((p) => inBbox(p.location, CORRIDOR_BBOX));
  const roadConditions = roadRows.filter(routeConditionFilter);
  const forecastConditions = forecastRows.filter(routeConditionFilter);

  const trafficTileUrlsZ11 = buildTrafficTileUrls(CORRIDOR_BBOX, 11);

  const result = {
    generatedAt: new Date().toISOString(),
    route: {
      start: START,
      end: END,
      primary: primaryRoute,
      trafficSpeed: {
        note: '511ON traffic speeds are delivered as colorized tiles; numeric per-segment speeds are not exposed in list APIs.',
        averageFromRouteTimeKmh: primaryRoute.avgSpeedKmh,
        tileLegend: {
          closedStopped: '#808080 / stopped',
          slow: '#4D0001 to #CC0004',
          medium: '#F4FF24',
          fast: '#249D74',
        },
        sampleTileUrls: trafficTileUrlsZ11.slice(0, 12),
      },
    },
    eventsAndRoadwork: {
      eventsCount: primaryRoute.events,
      currentRoadwork: primaryRoute.currentRoadwork,
      constructionItems: primaryRoute.construction,
    },
    cameras: {
      primaryRouteCameraNames: primaryRoute.cameraNames,
      matched: matchedCameras,
      missingNames: [...wanted],
    },
    plows: {
      totalProvince: (plows.item2 || []).length,
      nearRouteCount: plowsNearRoute.length,
      nearRoute: plowsNearRoute,
    },
    roadConditions: {
      rows: roadConditions,
      count: roadConditions.length,
    },
    forecastedDrivingConditions: {
      rows: forecastConditions,
      count: forecastConditions.length,
    },
    waze: {
      incidentsCount: (wazeIncidents.item2 || []).length,
      trafficJamsCount: (wazeTraffic.item2 || []).length,
      weatherHazardsCount: (wazeWeather.item2 || []).length,
      incidents: wazeIncidents.item2 || [],
      trafficJams: wazeTraffic.item2 || [],
      weatherHazards: wazeWeather.item2 || [],
      note: 'Waze feeds can legitimately be empty at scrape time.',
    },
    gotchas: [
      'A login modal can appear after route generation; click the modal Close (×) button before scraping.',
      'Autocomplete can leave destination suggestions open; press Enter after filling destination.',
      'Road Conditions and Forecast layers conflict with Traffic Speeds in the map UI.',
      'Traffic speeds are tile-based, not row-based, so numeric speeds are not directly listed in report APIs.',
      'Camera map icons do not include camera names; resolve names and image URLs through /tooltip/Cameras/{itemId}?lang=en.',
    ],
  };

  const outPath = path.join(outDir, 'on511_route_report.json');
  await fs.writeFile(outPath, JSON.stringify(result, null, 2), 'utf8');

  await browser.close();

  console.log(JSON.stringify({ outPath, routeTime: primaryRoute.time, routeDistance: primaryRoute.distance, cameras: matchedCameras.length, plowsNearRoute: plowsNearRoute.length, roadConditions: roadConditions.length, forecastConditions: forecastConditions.length }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
