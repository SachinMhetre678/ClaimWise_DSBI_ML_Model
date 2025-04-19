from flask import Flask, request, jsonify, send_from_directory
import joblib
import numpy as np
import pandas as pd
from flask_cors import CORS
import os
import datetime  # Added for vehicle age calculation

app = Flask(__name__, static_folder='build', static_url_path='')
CORS(app)

# Load all required models and transformers
try:
    kmeans_model = joblib.load('kmeans_model.pkl')
    scaler = joblib.load('scaler.pkl')
    pca = joblib.load('pca.pkl')
    print("All models loaded successfully!")
except Exception as e:
    print(f"Error loading models: {e}")
    raise e

# Define your numeric columns (should match training)
numeric_columns = [
    'months_as_customer', 'age', 'policy_deductable', 
    'policy_annual_premium', 'umbrella_limit', 'capital-gains',
    'capital-loss', 'incident_hour_of_the_day', 'number_of_vehicles_involved',
    'bodily_injuries', 'witnesses', 'total_claim_amount', 
    'injury_claim', 'property_claim', 'vehicle_claim', 'auto_year'
]

# Define CLUSTER_PROFILES first (before any functions that use it)
CLUSTER_PROFILES = {
    0: {"fraud_probability": 0.2, "description": "Low risk profile"},
    1: {"fraud_probability": 0.6, "description": "Medium risk profile"},
    2: {"fraud_probability": 0.9, "description": "High risk profile"}
}

# Then define RISK_PROFILES
RISK_PROFILES = {
    "Low": {
        "threshold": 0.3,
        "color": "#4CAF50",
        "description": "Normal claim behavior detected",
        "action": "No additional review needed"
    },
    "Medium": {
        "threshold": 0.7,
        "color": "#FFC107",
        "description": "Suspicious patterns requiring review",
        "action": "Manual review recommended"
    },
    "High": {
        "threshold": 1.0,
        "color": "#F44336",
        "description": "High probability of fraudulent activity",
        "action": "Immediate investigation required"
    }
}

# Now define functions that use these variables
def get_risk_profile(fraud_probability):
    """Categorize risk based on configured thresholds"""
    if fraud_probability < RISK_PROFILES["Low"]["threshold"]:
        return "Low"
    elif fraud_probability < RISK_PROFILES["Medium"]["threshold"]:
        return "Medium"
    else:
        return "High"

def analyze_features(input_data, cluster):
    """Generate detailed risk factors"""
    analysis = []
    claim = input_data['total_claim_amount']
    witnesses = input_data['witnesses']
    premium = input_data['policy_annual_premium']
    deductible = input_data['policy_deductable']
    customer_months = input_data['months_as_customer']
    vehicle_age = datetime.datetime.now().year - input_data['auto_year']
    
    if cluster == 2:  # High risk cluster
        if claim > 15000:
            analysis.append(f"Extremely high claim amount (${claim:,.2f})")
        elif claim > 10000:
            analysis.append(f"Very high claim amount (${claim:,.2f})")
        
        if witnesses == 0:
            analysis.append("No witnesses reported")
        elif witnesses == 1:
            analysis.append("Only one witness reported")
            
        if deductible < 250:
            analysis.append(f"Very low deductible (${deductible:,.2f})")
        elif deductible < 500:
            analysis.append(f"Low deductible (${deductible:,.2f})")
            
        if vehicle_age > 15:
            analysis.append(f"Old vehicle ({vehicle_age} years)")
    
    elif cluster == 1:  # Medium risk cluster
        if premium < 800 and claim > 5000:
            analysis.append(f"Suspicious premium-to-claim ratio (${premium:,.2f} vs ${claim:,.2f})")
        elif premium < 1000:
            analysis.append(f"Below average premium (${premium:,.2f})")
            
        if customer_months < 3:
            analysis.append(f"Very new customer ({customer_months} months)")
        elif customer_months < 6:
            analysis.append(f"New customer ({customer_months} months)")
    
    return analysis if analysis else ["No significant risk factors detected"]

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        input_data = {
            'months_as_customer': float(data.get('months_as_customer', 0)),
            'age': float(data.get('age', 0)),
            'policy_deductable': float(data.get('policy_deductable', 0)),
            'policy_annual_premium': float(data.get('policy_annual_premium', 0)),
            'umbrella_limit': float(data.get('umbrella_limit', 0)),
            'capital-gains': float(data.get('capital-gains', 0)),
            'capital-loss': float(data.get('capital-loss', 0)),
            'incident_hour_of_the_day': float(data.get('incident_hour_of_the_day', 0)),
            'number_of_vehicles_involved': float(data.get('number_of_vehicles_involved', 0)),
            'bodily_injuries': float(data.get('bodily_injuries', 0)),
            'witnesses': float(data.get('witnesses', 0)),
            'total_claim_amount': float(data.get('total_claim_amount', 0)),
            'injury_claim': float(data.get('injury_claim', 0)),
            'property_claim': float(data.get('property_claim', 0)),
            'vehicle_claim': float(data.get('vehicle_claim', 0)),
            'auto_year': float(data.get('auto_year', 0))
        }
        
        new_df = pd.DataFrame([input_data])[numeric_columns]
        new_scaled = scaler.transform(new_df)
        new_pca = pca.transform(new_scaled)
        predicted_cluster = kmeans_model.predict(new_pca)[0]
        fraud_prob = CLUSTER_PROFILES[predicted_cluster]['fraud_probability']
        risk_profile = get_risk_profile(fraud_prob)
        
        response = {
            "risk_assessment": {
                "level": risk_profile,
                "color": RISK_PROFILES[risk_profile]["color"],
                "description": RISK_PROFILES[risk_profile]["description"],
                "action": RISK_PROFILES[risk_profile]["action"],
                "probability": float(fraud_prob),
                "percentage": round(fraud_prob * 100, 2),
                "is_high_risk": risk_profile == "High"
            },
            "cluster_info": {
                "id": int(predicted_cluster),
                "description": CLUSTER_PROFILES[predicted_cluster]['description']
            },
            "risk_factors": analyze_features(input_data, predicted_cluster),
            "input_features": input_data
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)