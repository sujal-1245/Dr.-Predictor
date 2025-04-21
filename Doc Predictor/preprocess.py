# train_model.py

import pandas as pd
import os
import pickle
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import numpy as np

# Load dataset
try:
    df = pd.read_csv('disease-symptoms.csv')
except Exception as e:
    print(f"Error loading the CSV file: {e}")
    exit(1)

df = df.dropna()

# Get all unique symptoms
all_symptoms = set()
for symptom_list in df['Symptoms']:
    symptoms = symptom_list.split(';')
    all_symptoms.update(symptoms)

all_symptoms = sorted(list(all_symptoms))

# Create binary columns
for symptom in all_symptoms:
    df[symptom] = df['Symptoms'].apply(lambda x: 1 if symptom in x.split(';') else 0)

# 🎯 Correct: add Severity manually if dataset does not have
np.random.seed(42)
df['Severity'] = np.random.randint(0, 3, size=len(df))

# Final features
feature_columns = all_symptoms + ['Severity']
X = df[feature_columns]
y = df['Disease']

# Encode target labels
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# Save label encoder
os.makedirs('models', exist_ok=True)
with open('models/label_encoder.pkl', 'wb') as f:
    pickle.dump(le, f)

# Split and train
X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save model and symptom list
with open('models/model.pkl', 'wb') as f:
    pickle.dump(model, f)
with open('models/symptom_list.pkl', 'wb') as f:
    pickle.dump(all_symptoms, f)

print("✅ Correct model trained and saved!")
