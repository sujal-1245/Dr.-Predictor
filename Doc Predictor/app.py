from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
import requests

app = Flask(__name__)

# Load model and data
with open('models/model.pkl', 'rb') as f:
    model = pickle.load(f)
with open('models/label_encoder.pkl', 'rb') as f:
    label_encoder = pickle.load(f)
with open('models/symptom_list.pkl', 'rb') as f:
    symptom_list = pickle.load(f)

# Disease to specialization mapping
disease_to_specialization = {
    'Heart Disease': 'Cardiologist',
    'Migraine': 'Neurologist',
    'Arthritis': 'Orthopedic',
    'Skin Allergy': 'Dermatologist',
    'Diabetes': 'Endocrinologist',
    'Tuberculosis': 'Pulmonologist',
    'Flu': 'General Physician',
    'Hypertension': 'Cardiologist',
    'Bronchial Asthma': 'Pulmonologist',
}

@app.route('/')
def index():
    return render_template('index.html', symptoms=symptom_list)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    selected_symptoms = data.get('symptoms', [])
    severity = int(data.get('severity', 1))  # Default severity is 1 if not provided
    city = data.get('city', None)

    # Prepare input features based on selected symptoms
    input_features = [0] * len(symptom_list)
    for symptom in selected_symptoms:
        if symptom in symptom_list:
            idx = symptom_list.index(symptom)
            input_features[idx] = 1

    input_features.append(severity)

    # Predict disease using the model
    prediction = model.predict(np.array(input_features).reshape(1, -1))[0]
    predicted_disease = label_encoder.inverse_transform([prediction])[0]

    # Predict specialization based on the disease
    specialization = disease_to_specialization.get(predicted_disease, 'General Physician')

    return jsonify({
        'disease': predicted_disease,
        'specialization': specialization
    })
@app.route('/geocode', methods=['POST'])
def geocode():
    data = request.get_json()
    city = data.get('city')

    if not city:
        return jsonify({'error': 'City is required'}), 400

    # Use OpenStreetMap Nominatim API to get lat and lon for the city
    url = f"https://nominatim.openstreetmap.org/search?format=json&q={city}"
    response = requests.get(url)
    
    if response.status_code == 200 and response.json():
        first_result = response.json()[0]
        lat = float(first_result['lat'])
        lon = float(first_result['lon'])
        return jsonify({'lat': lat, 'lon': lon})
    else:
        return jsonify({'error': 'City not found or invalid city name'}), 404

@app.route('/doctors', methods=['POST'])
def doctors():
    data = request.get_json()
    lat = data.get('lat')
    lon = data.get('lon')

    if lat is None or lon is None:
        return jsonify({'error': 'Latitude and longitude are required'}), 400

    # Query Overpass API to fetch doctors near the provided latitude and longitude
    overpass_query = f"""
    [out:json];
    node["amenity"="doctors"](around:5000,{lat},{lon});
    out;
    """
    
    overpass_url = 'https://overpass-api.de/api/interpreter'
    response = requests.get(overpass_url, params={'data': overpass_query})
    
    if response.status_code == 200:
        elements = response.json().get('elements', [])
        doctors = []
        for element in elements:
            name = element['tags'].get('name', 'Doctor')
            address = element['tags'].get('addr:street', 'Unknown Address')
            doctor_lat = element['lat']
            doctor_lon = element['lon']
            rating = round(np.random.uniform(3.5, 5.0), 1)  # Random rating for UI purposes
            doctors.append({
                'name': name,
                'address': address,
                'lat': doctor_lat,
                'lon': doctor_lon,
                'rating': rating  # Use random rating for now
            })
        return jsonify({'doctors': doctors})
    else:
        return jsonify({'error': 'Failed to fetch doctors from Overpass API'}), 500

if __name__ == '__main__':
    app.run(debug=True)
