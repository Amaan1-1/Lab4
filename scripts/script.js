/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js 
--------------------------------------------------------------------*/

/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
--------------------------------------------------------------------*/
// Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoiYW1hYW5iIiwiYSI6ImNtbGRkZW1meDFhdjMzZXEzb25ydDQwNXUifQ.9X7LgD4vFHgfHOLKdon0jg'; 

// Initialize map and edit to your preference
const map = new mapboxgl.Map({
    container: 'map', // container id in HTML
    style: 'mapbox://styles/amaanb/cmlfrw1us00ho01qq1aad4yvb',  // ****ADD MAP STYLE HERE *****
    center: [-79.39, 43.65],  // starting point, longitude/latitude
    zoom: 11 // starting zoom level
});

let collisionData;


// Add zoom and rotation controls in the map interface
map.addControl(new mapboxgl.NavigationControl());
//Full Screen control
map.addControl(new mapboxgl.FullscreenControl());
map.on('load', () => {
    resetButton(map, "reset-btn");
    //Step 2: VIEW GEOJSON POINT DATA ON MAP
    //Using fetch to get data from raw URL from github
    fetch('https://raw.githubusercontent.com/Amaan1-1/Lab4/refs/heads/main/data/pedcyc_collision_06-21.geojson')
        .then(response => response.json())
        .then(response => {
            collisionData = response; // Store geojson as variable using URL from fetch response

            //Step 3: CREATE BOUNDING BOX AND HEXGRID
            // Calculate the bounding box
            let bboxresult = turf.bbox(collisionData);
            // Convert the bounding box into a polygon feature
            let poly = turf.bboxPolygon(bboxresult);
            // Scale up the polygon by 1.5x to provide a buffer around the data points
            let bboxscaled = turf.transformScale(poly, 1.5);
            bboxresult = turf.bbox(bboxscaled);
            // Generate a 0.5km hexagon grid covering the final bounding box area
            let hexgrid = turf.hexGrid(bboxresult, 0.5, { units: 'kilometers'});

            //Step 4: AGGREGATE COLLISIONS BY HEXGRID
            // Collect point data into the hexagons based on spatial intersection
            let collishex = turf.collect(hexgrid, collisionData, "_id", "values");
            let maxcolisions = 0;

            // Loop through each hexagon to count how many collisions it contains
            collishex.features.forEach((feature) =>{
                feature.properties.COUNT = feature.properties.values.length;
                // Update the maximum collision count
                if (feature.properties.COUNT > maxcolisions){
                    maxcolisions = feature.properties.COUNT;
                    console.log("Max collisions in a hexagon:" + maxcolisions);
                }
            });

            // Add the aggregated hexgrid as a data source for the map
            map.addSource('collishexgrid', {
                type: 'geojson',
                data: collishex
            });

            // Add a source for user-inputted points and lines
            map.addSource('input-data', {
                type: 'geojson',
                data: geojson
            });

            // Add a layer to visualize the points the user clicks on the map
            map.addLayer({
                'id': 'input-pnts',
                'type': 'circle',
                'source': 'input-data',
                'paint': {
                    'circle-radius': 5,
                    'circle-color':"#2dff03",
                    'circle-stroke-width': 1.5,
                    'circle-emissive-strength': 1.1,
                    'circle-stroke-color': '#ffffff'
                }
            });

            //Create a line between the 2 points
            //Source: https://docs.mapbox.com/mapbox-gl-js/example/geojson-line/
            map.addLayer({
                'id': 'route',
                'type': 'line',
                'source': 'input-data',
                'layout': {
                    'line-cap': 'round',
                    'line-join': 'round'
                },
                'paint': {
                    'line-color':"#000000",
                    'line-stroke-width': 5.5,
                    'line-stroke-color': '#ffffff',
                    'line-width': 8,
                    'line-opacity': 1.0
                },
            });

            // Add a fill layer for the hexgrid with a color ramp based on collision counts
            map.addLayer({
                id: "collishexfill",
                type: "fill",
                source: "collishexgrid",
                paint: {
                    "fill-color": [
                        "interpolate",
                        ["linear"],
                        ["get", "COUNT"],
                        0, "#ffffff",
                        1, "#ffebf1",
                        6, "#ffb7ce",
                        16, "#ff2163",
                        31, "#ff0000",
                        maxcolisions, "#ff0000"
                    ],
                    "fill-opacity": 0.6,
                    "fill-outline-color": "white",
                },
                // Only show hexagons that actually contain at least one collision
                filter: ["!=", ["get", "COUNT"], 0],
            });

            
            // Initialize UI components and spatial analysis layers
            addLegend(map, maxcolisions);// Dynamic collision intensity legend
            addPopup(map, "collishexfill"); // Click/hover popups for hexagons

            // Live coordinate updates
            LatLngDisplay(map);
            // Layer toggle button
            UpdateVisibility("toggle-btn", "collishexfill", map);

        });

    });