# 511ON Data Endpoints Used by This Skill

## Route and map layers

- Route calculation: `POST https://511on.ca/api/route/getroutes`
- Camera points: `GET https://511on.ca/map/mapIcons/Cameras`
- Camera tooltip/details/images: `GET https://511on.ca/tooltip/Cameras/{itemId}?lang=en`
- Plow/service vehicles: `GET https://511on.ca/map/mapIcons/ServiceVehicles`
- Waze incidents: `GET https://511on.ca/map/mapIcons/WazeIncidents`
- Waze traffic jams: `GET https://511on.ca/map/mapIcons/WazeTraffic`
- Waze weather hazards: `GET https://511on.ca/map/mapIcons/WazeWeather`

## Conditions reports (tabular)

- Road conditions data: `GET https://511on.ca/List/GetData/RoadConditions?query=<urlencoded-json>&lang=en`
- Forecasted driving data: `GET https://511on.ca/List/GetData/ForecastedDrivingConditions?query=<urlencoded-json>&lang=en`

## Forecast KML layer feeds (map)

- Current 0-3h: `https://511on.ca/NoSession/GetKml?name=CurrentForecast`
- Short-term 3-6h: `https://511on.ca/NoSession/GetKml?name=ShortTermForecast`
- Medium-term 6-9h: `https://511on.ca/NoSession/GetKml?name=MediumTermForecast`
- Long-term 9-12h: `https://511on.ca/NoSession/GetKml?name=LongTermForecast`

## Traffic speed layer

- Tile format: `https://tiles.ibi511.com/Geoservice/GetTrafficTile?x={x}&y={y}&z={z}`
- Note: this layer is tile/color based; no public list endpoint returns numeric per-segment speeds.
