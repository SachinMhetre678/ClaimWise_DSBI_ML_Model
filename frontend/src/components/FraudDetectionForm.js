import React, { useState } from 'react';
import axios from 'axios';
import './FraudDetectionForm.css';

const FraudDetectionForm = () => {
  const [formData, setFormData] = useState({
    months_as_customer: '',
    age: '',
    policy_deductable: '',
    policy_annual_premium: '',
    umbrella_limit: '',
    'capital-gains': '',
    'capital-loss': '',
    incident_hour_of_the_day: '',
    number_of_vehicles_involved: '',
    bodily_injuries: '',
    witnesses: '',
    total_claim_amount: '',
    injury_claim: '',
    property_claim: '',
    vehicle_claim: '',
    auto_year: ''
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
        const response = await axios.post('/api/predict', formData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fraud-detection-container">
      <h2>Insurance Claim Fraud Detection</h2>
      
      <form onSubmit={handleSubmit} className="fraud-form">
        <div className="form-row">
          <div className="form-group">
            <label>Months as Customer:</label>
            <input 
              type="number" 
              name="months_as_customer" 
              value={formData.months_as_customer}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Age:</label>
            <input 
              type="number" 
              name="age" 
              value={formData.age}
              onChange={handleChange}
              min="18"
              max="100"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Policy Deductible ($):</label>
            <input 
              type="number" 
              name="policy_deductable" 
              value={formData.policy_deductable}
              onChange={handleChange}
              min="0"
              step="100"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Annual Premium ($):</label>
            <input 
              type="number" 
              name="policy_annual_premium" 
              value={formData.policy_annual_premium}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Umbrella Limit ($):</label>
            <input 
              type="number" 
              name="umbrella_limit" 
              value={formData.umbrella_limit}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Capital Gains ($):</label>
            <input 
              type="number" 
              name="capital-gains" 
              value={formData['capital-gains']}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Capital Loss ($):</label>
            <input 
              type="number" 
              name="capital-loss" 
              value={formData['capital-loss']}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Incident Hour (0-23):</label>
            <input 
              type="number" 
              name="incident_hour_of_the_day" 
              value={formData.incident_hour_of_the_day}
              onChange={handleChange}
              min="0"
              max="23"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Vehicles Involved:</label>
            <input 
              type="number" 
              name="number_of_vehicles_involved" 
              value={formData.number_of_vehicles_involved}
              onChange={handleChange}
              min="1"
              max="10"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Bodily Injuries:</label>
            <input 
              type="number" 
              name="bodily_injuries" 
              value={formData.bodily_injuries}
              onChange={handleChange}
              min="0"
              max="10"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Witnesses:</label>
            <input 
              type="number" 
              name="witnesses" 
              value={formData.witnesses}
              onChange={handleChange}
              min="0"
              max="10"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Auto Year:</label>
            <input 
              type="number" 
              name="auto_year" 
              value={formData.auto_year}
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear()}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Total Claim Amount ($):</label>
            <input 
              type="number" 
              name="total_claim_amount" 
              value={formData.total_claim_amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Injury Claim ($):</label>
            <input 
              type="number" 
              name="injury_claim" 
              value={formData.injury_claim}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Property Claim ($):</label>
            <input 
              type="number" 
              name="property_claim" 
              value={formData.property_claim}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Vehicle Claim ($):</label>
            <input 
              type="number" 
              name="vehicle_claim" 
              value={formData.vehicle_claim}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span> Processing...
            </>
          ) : (
            'Check for Fraud'
          )}
        </button>
      </form>
      
      {error && (
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className={`result-container ${result.is_fraud ? 'fraud' : 'no-fraud'}`}>
          <h3>Fraud Detection Result</h3>
          <div className="result-item">
            <span className="result-label">Cluster:</span>
            <span className="result-value">{result.cluster} - {result.cluster_description}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Fraud Probability:</span>
            <span className="result-value">{(result.fraud_probability * 100).toFixed(2)}%</span>
          </div>
          <div className="result-item">
            <span className="result-label">Conclusion:</span>
            <span className="result-value">
              {result.is_fraud ? (
                <strong className="fraud-text">Potential Fraud Detected</strong>
              ) : (
                <strong className="no-fraud-text">No Fraud Detected</strong>
              )}
            </span>
          </div>
          
          {result.features_analysis.length > 0 && (
            <div className="features-analysis">
              <h4>Key Risk Factors:</h4>
              <ul>
                {result.features_analysis.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FraudDetectionForm;