# Doc Predictor 🩺🗺️

An intelligent disease prediction system that analyzes user symptoms and severity to predict possible diseases and recommend nearby doctors.  
Built using **Flask**, **Machine Learning**, and **Leaflet.js** for interactive mapping.

---

## ✨ Features

- Predict diseases based on multiple symptoms.
- Adjust severity level for more accurate predictions.
- Get a list of recommended specialists for the predicted disease.
- Find and visualize nearby doctors on a live map.
- Beautiful and responsive UI.

---

## 🛠️ Tech Stack

- **Backend:** Flask, Python (ML model with Pickle)
- **Frontend:** HTML, CSS, JavaScript, Leaflet.js
- **Machine Learning:** Decision Tree Classifier (or your model)
- **Other:** Axios (for city-to-location geocoding), OpenStreetMap

---

## 📂 Project Structure

```
|-- disease-symptoms.csv
|-- doctors.csv
|-- models/
|   |-- label_encoder.pkl
|   |-- model.pkl
|   |-- symptom_list.pkl
|-- Doc Predictor/
|   |-- app.py
|   |-- diseases.csv
|   |-- doctors.json
|   |-- preprocess.py
|   |-- models/
|   |   |-- label_encoder.pkl
|   |   |-- model.pkl
|   |-- static/
|   |   |-- leaflet.js
|   |   |-- map.js
|   |   |-- script.js
|   |   |-- style.css
|   |-- templates/
|   |   |-- index.html
```

---

## 🚀 How to Run Locally

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/doc-predictor.git
   cd doc-predictor/Doc\ Predictor
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Flask app**
   ```bash
   python app.py
   ```

4. **Open your browser**
   ```
   http://127.0.0.1:5000/
   ```

---

## 🎯 Future Enhancements

- Add user login/signup system.
- Train with larger, real-world datasets.
- Suggest hospitals/clinics dynamically based on specialization.
- Add live API integration for real doctor data.

---

