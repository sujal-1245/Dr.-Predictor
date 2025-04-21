let selectedSymptoms = [];

// Handle adding a symptom
document.getElementById('add-symptom').addEventListener('click', function() {
    const select = document.getElementById('symptoms');
    const symptom = select.value;
    if (symptom && !selectedSymptoms.includes(symptom)) {
        selectedSymptoms.push(symptom);
        const listItem = document.createElement('li');
        listItem.textContent = symptom;
        document.getElementById('symptom-list').appendChild(listItem);
    }
});

// Handle predicting disease
document.getElementById('predict').addEventListener('click', function() {
    const severity = document.getElementById('severity').value;
    const city = document.getElementById('city-input').value.trim();

    fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            symptoms: selectedSymptoms,
            severity: severity,
            city: city
        })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('disease-name').textContent = data.disease;
        document.getElementById('result').classList.remove('hidden');
        document.getElementById('result').classList.add('visible');

        // Place doctors on the map (this function will now be inside map.js)
        if (typeof placeDoctorMarkers === 'function') {
            placeDoctorMarkers();
        }
    })
    .catch(error => console.error('Error:', error));
});
