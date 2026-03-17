function addPopup(map, layerId){
    // Open popup when user clicks on a hex
    map.on('click', layerId, (e) => {

        let area = turf.area(e.features[0].geometry);

        // Show popup with collision count and hex area on click
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML("<b>Collision Count:</b> " + e.features[0].properties.COUNT + 
                "<br><b>Hex Area:</b> " + turf.round(area/1000000, 3) + "Km²"
            ) //converting meters sqaured to km squared and then rounding to 3 decimal places
            //source: https://turfjs.org/docs/api/round
            .addTo(map);
    });

    // Change cursor style when hovering over a clickable feature
    map.on('mouseenter', layerId, () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Reset cursor when leaving the feature
    map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
        map.setPaintProperty(layerId, 'fill-opacity', 0.6);
    });

    // Add a hover effect by increasing opacity of all hexagons 
    map.on('mousemove', layerId, () => {
        map.setPaintProperty(layerId, 'fill-opacity', 0.9);
    });
        
}


//Goes back to original map view when reset button is clicked
function resetButton(map, button){
    document.getElementById(button).addEventListener('click', () => {
        map.flyTo({
            center: [-79.39, 43.65], 
            zoom: 11, 
            essential: true 
        });
    });

}

function UpdateVisibility(buttonId, label, map){
    document.getElementById(buttonId).addEventListener('click', () => {
        //Checking if the points are visible by using 
        // the function getLayoutProperty() 
        const visibility = map.getLayoutProperty(label, 'visibility');
        //If the points are visible then hide them and change the text on the button 
        // to say "Show"
        if(visibility !== "none"){
            map.setLayoutProperty(label, 'visibility', 'none');
            document.getElementById(buttonId).innerHTML = "Show";
        }
        else{
            //if the points are not visible then display them and change
            // text on the button to say "hide"
            document.getElementById(buttonId).innerHTML = "Hide";
            map.setLayoutProperty(label, 'visibility', 'visible');
        }
    });
}

//Source https://docs.mapbox.com/mapbox-gl-js/example/mouse-position/
//Show long and lat of mouse 
function LatLngDisplay(map) {
    map.on('mousemove', (e) => {
        let coords = e.lngLat.wrap();  
        const lng = coords.lng.toString().slice(0, 6);  
        const lat = coords.lat.toString().slice(0, 5);    
        //source for string slicing: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice

        document.getElementById('coordinate-display').innerHTML = "Longitude: " + lng + " | Latitude: " + lat;
    });
}

function addLegend(map, maxcollisions){
    const legend = document.getElementById('legend');
    if(!legend){
        return;
    } //No legend on analysis page, so dont run function on that page
    legend.innerHTML = '<h4>Collision Intensity</h4>';

    // Create legend for collision categories with matching colors
    const legenditems = [
        { label: "0 collisions", colour: "#ffffff" },
        { label: "1 - 5 collisions", colour: "#ffebf1" },
        { label: "6 - 15 collisions", colour: "#ffb7ce" },
        { label: "16 - 30 collisions", colour: "#ff2163" },
        { label: "31 - " + maxcollisions + " collisions", colour: "#ff0000" }
    ];


    // For each array item create a row to put the label and colour in
    legenditems.forEach(({ label, colour }) => {

        // Create a container row for the legend item
        const row = document.createElement('div'); 
        // create span for colour circle
        const colcircle = document.createElement('span'); 

        // the colcircle will take on the shape and style properties defined in css
        colcircle.className = 'legend-colcircle'; 
        // a custom property is used to take the colour from the array and apply it to the css class
        colcircle.style.setProperty('--legendcolour', colour); 

        // Create span element for legend label text
        const text = document.createElement('span'); 
        text.textContent = label; // set text variable to tlegend label value in array

        // Append each legend item (circle, text) to the container
        row.append(colcircle, text); 
        legend.appendChild(row); // Add row into main legend container
    });

    // Create an interactive button for toggling hex visibility
    const button = document.createElement("button");
    button.textContent = "Hide";
    button.id = "hex-toggle";
    button.className = "hide_button";
    legend.appendChild(button);
    //add toggle button functionality using UpdateVisibility method
    UpdateVisibility(button.id, "collishexfill", map);


}


//Create a geojson to sore the 2 points
let geojson = {
    'type': 'FeatureCollection',
    'features': []
};

//From start, have the buttons waiting to be clicked
//Not just selecting whenever someone clicks on map
setPoint("point1", 0, map);
setPoint("point2", 1, map);

function setPoint(button, point, map){
    // Listen for the button click to start the point selection 
    document.getElementById(button).addEventListener('click', () => {
        // // Using map.once to capture only the next single click on the map
        map.once('click', (e) => {
            // creating a new GeoJSON Feature object to store the coordinates of the user's click
            const clickedpoint = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [e.lngLat.lng, e.lngLat.lat] // Access map coords of mouse click
                }
            };
            // Assign the new feature to a specific index like geojson.features[0] for point 1, geojson.features[1] for point 2
            geojson.features[point] = clickedpoint;
            // Refresh the map source to display the newly placed point
            map.getSource('input-data').setData(geojson);
            // Trigger distance calculation now that a point has been updated
            getDistance();
        });
    });
}

function getDistance(){
    // Only run if both points have been set
    if(geojson.features[0] && geojson.features[1]){
        //compute distance
        let distance = turf.distance(geojson.features[0], geojson.features[1], 'kilometers');
        // Update the HTML display with the result which is rounded to 3 decimal places
        document.getElementById('distance-output').innerHTML = turf.round(distance, 3);

        //create the linestring between 2 points
        geojson.features[2] = {
            'type': 'Feature',
                'geometry': {
                    'type': 'LineString',
                    'coordinates': [
                        geojson.features[0].geometry.coordinates,
                        geojson.features[1].geometry.coordinates
                    ]
                }
            };

        // Update the map source to draw the connection line
        map.getSource('input-data').setData(geojson);
    }

}
