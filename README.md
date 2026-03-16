# GGR472 Lab 4: Toronto Collision Analysis

This project is an interactive web map designed to visualize and analyze pedestrian and cyclist collision data within the City of Toronto from 2006 to 2021. The webpage uses spatial aggregation to identify high-density incident areas and provides tools for basic proximity analysis.

## Core Features
* **Hexagonal Aggregation:** Point data is dynamically binned into a 0.5km hexgrid. The map uses an interpolation scale to color-code hexagons based on the density of collisions.
* **Point to Point Distance:** A tool that allows users to select two locations on the map to calculate the distance in kilometers and visualize the path with a LineString.
* **Real-time Coordinates:** A display tracking the mouse cursor to provide constant longitude and latitude feedback.
* **Interactive Data Inspection:** Map popups provide specific collision counts and calculated land area for each individual hexagon.

## File Descriptions
* **index.html:** The project entry point and home page.
* **analysis.html:** The primary interface containing the map container, the spatial tools panel and the coordinate display.
* **scripts/script.js:** The main logic file. It handles map initialization, data fetching, the bounding box calculation, and the generation of the hexgrid using Turf.js.
* **scripts/functions.js:** A modular script containing helper functions for event listeners, popup generation, distance calculations, and layer visibility toggles.
* **style.css:** Contains all layout rules, including the positioning of the map, the styling of the legend, and the management of the UI panels to prevent overlap with Mapbox controls.
* **data/pedcyc_collision_06-21.geojson:** The source dataset containing historical collision records for the Greater Toronto Area.

## Technical Implementation
* **Mapbox GL JS:** Utilized for rendering the map tiles and its API was used to handle user interaction events and manage layer visibility
* **Turf.js:** The primary engine for spatial analysis. It is used to create the hexgrid, calculate distances between two points
* **Data Handling:** The application uses the Fetch API to load GeoJSON data from this github repository.

