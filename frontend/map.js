// Initialize map
var map = L.map('map').setView([40.78493454009152, -73.9619603711282], 10);

// Add tile layer
L.tileLayer('https://api.maptiler.com/maps/openstreetmap/{z}/{x}/{y}.jpg?key=PomQwQ81LXSQaSTsapyk', {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
}).addTo(map);

let geojson;

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

let selectedFields = new Set();

function buildTooltipContent(properties) {
    let content = `ZIP: ${properties["GEOID20"]}<br>`;

    selectedFields.forEach(field => {
        content += `${fieldsToShow[field]}: ${properties[field]}<br>`;
    });

    return content;
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        mousemove: function() {
            layer.bindTooltip(buildTooltipContent(feature.properties), {
                sticky: true
            }).openTooltip();
        }
    });
}

const fieldsToShow = {
            median_gross_rent: "Median Gross Rent",
            median_household_income: "Median Household Income",
            total_population: "Total Population",
            housing_units_total: "Total Housing Units",
            renter_occupied_units: "Renter Occupied Units",
            owner_occupied_units: "Owner Occupied Units",
            rent_50pct_or_more_income: "Rent ≥ 50% Income"
        };

// Load GeoJSON
fetch('../datasets/final-usables/merged_nyc.geojson')
    .then(response => response.json())
    .then(data => {

        const toolbar = document.getElementById("toolbar");

        // --- Select All ---
        const selectAllLabel = document.createElement("label");
        selectAllLabel.innerHTML = `
            <input type="checkbox" id="selectAll"> <strong>Select All</strong><br><br>
        `;
        toolbar.appendChild(selectAllLabel);

        // --- Curated Checkboxes ---
        Object.entries(fieldsToShow).forEach(([key, labelText]) => {
            const label = document.createElement("label");
            label.innerHTML = `
                <input type="checkbox" value="${key}"> ${labelText}<br>
            `;
            toolbar.appendChild(label);
        });

        const checkboxes = document.querySelectorAll('#toolbar input[type="checkbox"]:not(#selectAll)');
        const selectAll = document.getElementById("selectAll");

        // Individual behavior
        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.checked) {
                    selectedFields.add(cb.value);
                } else {
                    selectedFields.delete(cb.value);
                }
            });
        });

        // Select All behavior
        selectAll.addEventListener('change', () => {
            if (selectAll.checked) {
                checkboxes.forEach(cb => {
                    cb.checked = true;
                    selectedFields.add(cb.value);
                });
            } else {
                checkboxes.forEach(cb => cb.checked = false);
                selectedFields.clear();
            }
        });

        geojson = L.geoJson(data, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);
    })
    .catch(err => console.error('Error loading GeoJSON:', err));