// Initialize Map
var map = L.map('map').setView([23.8103, 90.4125], 10); // Default: Dhaka

// Load OpenStreetMap Tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Routing Control (Leaflet built-in)
var control = L.Routing.control({
    waypoints: []
}).addTo(map);

// Function to Find Route using Nominatim + Leaflet Routing Machine
function findRoute() {
    var start = document.getElementById("start").value;
    var end = document.getElementById("end").value;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${start}`)
        .then(response => response.json())
        .then(startData => {
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${end}`)
                .then(response => response.json())
                .then(endData => {
                    var startCoords = [startData[0].lat, startData[0].lon];
                    var endCoords = [endData[0].lat, endData[0].lon];

                    // Leaflet Routing Machine
                    control.setWaypoints([
                        L.latLng(startCoords[0], startCoords[1]),
                        L.latLng(endCoords[0], endCoords[1])
                    ]);
                });
        });
}

// 🔄 Function to Toggle Directions Panel Visibility
function toggleDirections() {
    const directionsBox = document.querySelector('.leaflet-routing-container');
    if (directionsBox) {
        directionsBox.classList.toggle('hide-directions');
    }
}

// ---- Custom Shortest Path using Dijkstra Algorithm ----

const graph = {
    A: { B: 1, C: 4 },
    B: { A: 1, C: 2, D: 5 },
    C: { A: 4, B: 2, D: 1 },
    D: { B: 5, C: 1 }
};

const coords = {
    A: [23.8103, 90.4125],
    B: [23.8200, 90.4300],
    C: [23.8000, 90.4200],
    D: [23.7900, 90.4000]
};

function dijkstra(start, end, graph) {
    let distances = {};
    let prev = {};
    let pq = [];

    for (let node in graph) {
        distances[node] = Infinity;
        prev[node] = null;
        pq.push(node);
    }
    distances[start] = 0;

    while (pq.length > 0) {
        pq.sort((a, b) => distances[a] - distances[b]);
        let current = pq.shift();

        if (current === end) break;

        for (let neighbor in graph[current]) {
            let alt = distances[current] + graph[current][neighbor];
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                prev[neighbor] = current;
            }
        }
    }

    let path = [];
    for (let at = end; at != null; at = prev[at]) {
        path.push(at);
    }
    return path.reverse();
}

function drawPath(path) {
    const latlngs = path.map(p => coords[p]);
    L.polyline(latlngs, { color: 'red' }).addTo(map);
}

