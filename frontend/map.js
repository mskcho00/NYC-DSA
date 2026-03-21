// Initialize map
var map = L.map('map').setView([40.78493454009152, -73.9619603711282], 10);

// Add tile layer
L.tileLayer('https://api.maptiler.com/maps/openstreetmap/{z}/{x}/{y}.jpg?key=PomQwQ81LXSQaSTsapyk', {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
}).addTo(map);

// Color scale
function getColor(rent) {
    return rent > 4000 ? '#800026' :
           rent > 3500 ? '#BD0026' :
           rent > 3000 ? '#E31A1C' :
           rent > 2500 ? '#FC4E2A' :
           rent > 2000 ? '#FD8D3C' :
                         '#FEB24C';
}

// Style function
function style(feature) {
    return {
        fillColor: getColor(feature.properties.median_gross_rent),
        weight: 1,
        color: 'white',
        fillOpacity: 0.7
    };
}

// Highlight
function highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({weight: 3, color: '#666', fillOpacity: 0.9});
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

// Tooltip
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });

    layer.bindTooltip(`
        ZIP: ${feature.properties["GEOID20"]}<br>
        Total Renters: ${feature.properties["rent_burden_total_renter_households"]}<br>
        Rent <10% Income: ${feature.properties["rent_lt_10pct_income"]}
    `);
}

// Load GeoJSON
let geojson;
fetch('../datasets/final-usables/merged_nyc.geojson')
    .then(response => response.json())
    .then(data => {
        geojson = L.geoJson(data, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);
    })
    .catch(err => console.error('Error loading GeoJSON:', err));