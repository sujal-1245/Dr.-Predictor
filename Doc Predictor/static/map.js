// Initialize map
let map = L.map('map').setView([20.5937, 78.9629], 5); // Default: India Center
let doctorMarkers = [];
let userLat = null;
let userLon = null;

// Add OpenStreetMap Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Set location button
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('set-location-btn').addEventListener('click', handleSetLocation);
});

// Handle setting location
async function handleSetLocation() {
    const city = document.getElementById('city-input').value.trim();
    if (!city) {
        alert('Please enter a city name.');
        return;
    }

    try {
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();

        if (data.length === 0) {
            alert('City not found.');
            return;
        }

        userLat = parseFloat(data[0].lat);
        userLon = parseFloat(data[0].lon);

        map.setView([userLat, userLon], 13);

        fetchNearbyDoctors();
    } catch (error) {
        console.error(error);
        alert('Error finding the city.');
    }
}

// Fetch nearby doctors from Overpass API
async function fetchNearbyDoctors() {
    try {
        const query = `
            [out:json];
            node["healthcare"="doctor"](around:5000, ${userLat}, ${userLon});
            out body;
        `;

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query
        });

        const data = await response.json();

        if (!data.elements.length) {
            alert('No doctors found near this city.');
            return;
        }

        clearDoctorMarkers();

        const markers = [];

        data.elements.forEach(doc => {
            if (!doc.lat || !doc.lon) return;

            const name = doc.tags.name || 'Unknown Doctor';
            const specialization = doc.tags.specialty || 'General Practitioner';
            const clinic = doc.tags['healthcare:speciality'] || 'Private Clinic';

            const distance = calculateDistance(userLat, userLon, doc.lat, doc.lon).toFixed(2);

            const rating = generateFakeRating();
            const icon = getCustomDoctorIcon(rating);

            const marker = L.marker([doc.lat, doc.lon], { icon }).addTo(map);

            marker.bindPopup(`
                <div style="min-width: 200px;">
                    <strong style="font-size: 1.1em;">${name}</strong><br>
                    🩺 <em>${specialization}</em><br>
                    🏥 ${clinic}<br>
                    ⭐ <b>${rating}</b>/5 | 📍 ${distance} km
                </div>
            `);

            markers.push(marker);
            doctorMarkers.push(marker);
        });

        const group = new L.featureGroup(markers);
        setTimeout(() => {
            map.invalidateSize();
            map.fitBounds(group.getBounds().pad(0.3));
        }, 300);

    } catch (error) {
        console.error(error);
        alert('Error fetching doctors.');
    }
}

// Clear previous markers
function clearDoctorMarkers() {
    doctorMarkers.forEach(marker => map.removeLayer(marker));
    doctorMarkers = [];
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Generate random fake ratings (optional)
function generateFakeRating() {
    const ratings = [3.8, 4.0, 4.2, 4.5, 4.7, 4.9];
    return ratings[Math.floor(Math.random() * ratings.length)];
}

// Get custom icon based on rating
function getCustomDoctorIcon(rating) {
    let iconUrl = '';

    if (rating >= 4.5) {
        iconUrl = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
    } else if (rating >= 4.0) {
        iconUrl = 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    } else {
        iconUrl = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }

    return L.icon({
        iconUrl: iconUrl,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
}
