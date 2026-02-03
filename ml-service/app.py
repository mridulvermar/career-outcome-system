from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Load models and encoders
MODEL_PATH = 'models/'

try:
    model = joblib.load(os.path.join(MODEL_PATH, 'career_model.pkl'))
    degree_encoder = joblib.load(os.path.join(MODEL_PATH, 'degree_encoder.pkl'))
    role_encoder = joblib.load(os.path.join(MODEL_PATH, 'role_encoder.pkl'))
    skills_encoder = joblib.load(os.path.join(MODEL_PATH, 'skills_encoder.pkl'))
    
    with open(os.path.join(MODEL_PATH, 'skill_role_mapping.json'), 'r') as f:
        skill_role_mapping = json.load(f)
    
    print("✓ Models loaded successfully")
except Exception as e:
    print(f"⚠ Warning: Could not load models - {e}")
    model = None

# Salary data (role-based)
SALARY_DATA = {
    'Software Engineer': {'min': 70000, 'max': 150000, 'avg': 110000},
    'Data Scientist': {'min': 80000, 'max': 180000, 'avg': 130000},
    'ML Engineer': {'min': 90000, 'max': 190000, 'avg': 140000},
    'DevOps Engineer': {'min': 75000, 'max': 160000, 'avg': 117500},
    'Full Stack Developer': {'min': 65000, 'max': 140000, 'avg': 102500},
    'Backend Engineer': {'min': 70000, 'max': 145000, 'avg': 107500},
    'Frontend Engineer': {'min': 60000, 'max': 130000, 'avg': 95000},
    'Data Analyst': {'min': 55000, 'max': 110000, 'avg': 82500},
    'Data Engineer': {'min': 75000, 'max': 165000, 'avg': 120000},
    'Research Scientist': {'min': 85000, 'max': 175000, 'avg': 130000},
    'BI Analyst': {'min': 60000, 'max': 115000, 'avg': 87500},
    'Product Manager': {'min': 80000, 'max': 180000, 'avg': 130000},
    'Business Analyst': {'min': 60000, 'max': 120000, 'avg': 90000},
    'Consultant': {'min': 70000, 'max': 160000, 'avg': 115000},
    'Marketing Manager': {'min': 65000, 'max': 135000, 'avg': 100000},
    'Project Manager': {'min': 70000, 'max': 145000, 'avg': 107500}
}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': model is not None
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    try:
        data = request.json
        
        # Validate input
        required_fields = ['degree', 'skills', 'experience']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400
        
        degree = data['degree']
        skills = data['skills']
        experience = data['experience']
        
        # If model is available, use it
        if model is not None:
            prediction_result = predict_with_model(degree, skills, experience)
        else:
            # Fallback to rule-based prediction
            prediction_result = predict_with_rules(degree, skills, experience)
        
        # Perform skill gap analysis
        skill_gap = analyze_skill_gap(
            skills, 
            prediction_result['careerRole'],
            experience
        )
        
        # Generate insights
        insights = generate_insights(
            prediction_result['careerRole'],
            experience,
            skill_gap['overallMatch']
        )
        
        # Prepare response
        response = {
            'prediction': prediction_result,
            'skillGap': skill_gap,
            'insights': insights
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

def predict_with_model(degree, skills, experience):
    """Use trained ML model for prediction"""
    try:
        # Encode degree
        degree_encoded = degree_encoder.transform([degree])[0]
        
        # Encode skills
        skills_encoded = skills_encoder.transform([skills])[0]
        
        # Prepare feature vector
        feature_vector = np.concatenate([
            [degree_encoded, experience],
            skills_encoded
        ]).reshape(1, -1)
        
        # Get prediction
        prediction = model.predict(feature_vector)[0]
        probabilities = model.predict_proba(feature_vector)[0]
        
        # Get predicted role
        predicted_role = role_encoder.inverse_transform([prediction])[0]
        confidence = probabilities[prediction]
        
        # Get alternative careers (top 3 other predictions)
        top_indices = np.argsort(probabilities)[-4:-1][::-1]
        alternatives = []
        for idx in top_indices:
            if idx != prediction:
                role = role_encoder.inverse_transform([idx])[0]
                prob = probabilities[idx]
                alternatives.append({
                    'role': role,
                    'probability': float(prob),
                    'matchScore': int(prob * 100)
                })
        
        # Calculate salary based on experience
        salary_base = SALARY_DATA.get(predicted_role, {'min': 60000, 'max': 120000, 'avg': 90000})
        experience_multiplier = 1 + (experience * 0.08)
        
        return {
            'careerRole': predicted_role,
            'probability': float(confidence),
            'confidence': 'High' if confidence > 0.7 else 'Medium' if confidence > 0.5 else 'Low',
            'salaryRange': {
                'min': int(salary_base['min'] * experience_multiplier),
                'max': int(salary_base['max'] * experience_multiplier),
                'average': int(salary_base['avg'] * experience_multiplier),
                'currency': 'USD'
            },
            'alternativeCareers': alternatives[:3]
        }
        
    except Exception as e:
        print(f"Model prediction error: {e}")
        return predict_with_rules(degree, skills, experience)

def predict_with_rules(degree, skills, experience):
    """Rule-based prediction as fallback"""
    
    # Define role mappings
    role_mappings = {
        'Computer Science': ['Software Engineer', 'Data Scientist', 'ML Engineer', 'DevOps Engineer'],
        'Data Science': ['Data Analyst', 'Data Engineer', 'ML Engineer'],
        'Business': ['Product Manager', 'Business Analyst', 'Consultant'],
        'Engineering': ['Software Engineer', 'DevOps Engineer', 'Backend Engineer']
    }
    
    # Get possible roles
    possible_roles = role_mappings.get(degree, ['Software Engineer'])
    predicted_role = possible_roles[0]
    
    # Calculate confidence based on skills match
    role_skills = skill_role_mapping.get(predicted_role, {})
    matching_skills = len(set(skills) & set(role_skills.keys()))
    confidence = min(0.6 + (matching_skills * 0.05), 0.95)
    
    # Get salary
    salary_base = SALARY_DATA.get(predicted_role, {'min': 60000, 'max': 120000, 'avg': 90000})
    experience_multiplier = 1 + (experience * 0.08)
    
    # Alternative careers
    alternatives = []
    for role in possible_roles[1:4]:
        alternatives.append({
            'role': role,
            'probability': confidence * 0.8,
            'matchScore': int(confidence * 80)
        })
    
    return {
        'careerRole': predicted_role,
        'probability': confidence,
        'confidence': 'High' if confidence > 0.7 else 'Medium',
        'salaryRange': {
            'min': int(salary_base['min'] * experience_multiplier),
            'max': int(salary_base['max'] * experience_multiplier),
            'average': int(salary_base['avg'] * experience_multiplier),
            'currency': 'USD'
        },
        'alternativeCareers': alternatives
    }

def analyze_skill_gap(user_skills, predicted_role, experience):
    """Analyze skill gaps for predicted role"""
    
    # Get required skills for role
    role_skills = skill_role_mapping.get(predicted_role, {})
    required_skills = list(role_skills.keys())[:10]  # Top 10 skills
    
    # Find matching and missing skills
    matching_skills = list(set(user_skills) & set(required_skills))
    missing_skills = list(set(required_skills) - set(user_skills))
    
    # Categorize missing skills by importance
    missing_skills_detailed = []
    for idx, skill in enumerate(missing_skills[:7]):
        importance = 'Critical' if idx < 3 else 'Important' if idx < 5 else 'Nice-to-have'
        impact = 20 - (idx * 2)
        missing_skills_detailed.append({
            'skill': skill,
            'importance': importance,
            'impactOnSuccess': impact
        })
    
    # Generate recommendations
    recommended_skills = []
    for idx, skill in enumerate(missing_skills[:5]):
        recommended_skills.append({
            'skill': skill,
            'reason': f'Essential for {predicted_role} role',
            'priority': 5 - idx
        })
    
    # Calculate overall match
    overall_match = int((len(matching_skills) / max(len(required_skills), 1)) * 100)
    
    return {
        'matchingSkills': matching_skills,
        'missingSkills': missing_skills_detailed,
        'recommendedSkills': recommended_skills,
        'overallMatch': overall_match
    }

def generate_insights(role, experience, skill_match):
    """Generate career insights"""
    
    # Market demand mapping
    high_demand_roles = ['Software Engineer', 'Data Scientist', 'ML Engineer', 'DevOps Engineer', 'Data Engineer']
    
    market_demand = 'High' if role in high_demand_roles else 'Medium'
    
    # Growth potential based on experience and skill match
    if experience < 3 and skill_match > 60:
        growth_potential = 'High'
    elif experience >= 3 and skill_match > 50:
        growth_potential = 'High'
    else:
        growth_potential = 'Medium'
    
    # Generate recommendations
    recommendations = []
    if skill_match < 70:
        recommendations.append('Focus on acquiring missing critical skills')
    if experience < 2:
        recommendations.append('Build a strong portfolio of projects')
        recommendations.append('Contribute to open-source projects')
    recommendations.append('Network with professionals in your target role')
    recommendations.append('Stay updated with industry trends and technologies')
    
    # Industry trends
    industry_trends = [
        'AI and Machine Learning integration is rapidly growing',
        'Cloud computing skills are in high demand',
        'Remote work opportunities continue to expand',
        'Emphasis on full-stack and cross-functional skills'
    ]
    
    return {
        'marketDemand': market_demand,
        'growthPotential': growth_potential,
        'recommendations': recommendations,
        'industryTrends': industry_trends
    }

@app.route('/api/skills', methods=['GET'])
def get_available_skills():
    """Get list of available skills"""
    if skills_encoder is not None:
        return jsonify({
            'skills': list(skills_encoder.classes_)
        })
    else:
        # Fallback skill list
        default_skills = [
            'Python', 'JavaScript', 'Java', 'C++', 'SQL', 'Git',
            'Docker', 'Kubernetes', 'AWS', 'Azure', 'React', 'Node.js',
            'Machine Learning', 'Data Analysis', 'Statistics', 'TensorFlow',
            'Agile', 'Communication', 'Problem Solving', 'Teamwork'
        ]
        return jsonify({'skills': default_skills})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
