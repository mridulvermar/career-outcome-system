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

# Salary data (role-based) - INDIAN STANDARDS (INR)
# Values are annual packages in INR
SALARY_DATA = {
    'Software Engineer': {'min': 450000, 'max': 2400000, 'avg': 950000},
    'Data Scientist': {'min': 600000, 'max': 3000000, 'avg': 1200000},
    'ML Engineer': {'min': 700000, 'max': 3500000, 'avg': 1400000},
    'AI Engineer': {'min': 800000, 'max': 4000000, 'avg': 1600000},  # Added
    'DevOps Engineer': {'min': 500000, 'max': 2800000, 'avg': 1100000},
    'Full Stack Developer': {'min': 500000, 'max': 2800000, 'avg': 1050000},
    'Backend Engineer': {'min': 450000, 'max': 2500000, 'avg': 1000000},
    'Frontend Engineer': {'min': 400000, 'max': 2200000, 'avg': 900000},
    'Data Analyst': {'min': 350000, 'max': 1500000, 'avg': 750000},
    'Data Engineer': {'min': 600000, 'max': 2800000, 'avg': 1300000},
    'Cloud Architect': {'min': 1200000, 'max': 5000000, 'avg': 2200000}, # Added
    'Cybersecurity Analyst': {'min': 500000, 'max': 2000000, 'avg': 1000000}, # Added
    'Research Scientist': {'min': 800000, 'max': 3500000, 'avg': 1500000},
    'BI Analyst': {'min': 400000, 'max': 1600000, 'avg': 850000},
    'Product Manager': {'min': 1000000, 'max': 4500000, 'avg': 1800000},
    'Business Analyst': {'min': 450000, 'max': 1800000, 'avg': 950000},
    'Consultant': {'min': 600000, 'max': 2500000, 'avg': 1200000},
    'Marketing Manager': {'min': 500000, 'max': 2000000, 'avg': 1000000},
    'Project Manager': {'min': 800000, 'max': 3000000, 'avg': 1500000},
    'Blockchain Developer': {'min': 600000, 'max': 4000000, 'avg': 1500000} # Added
}

# Enhanced Mapping for Rule-Based Prediction
EXTENDED_SKILL_MAPPING = {
    'AI Engineer': ['Python', 'TensorFlow', 'PyTorch', 'Deep Learning', 'NLP', 'Computer Vision', 'MLOps', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'AI/Ml'],
    'ML Engineer': ['Python', 'Scikit-learn', 'Pandas', 'NumPy', 'Data Modeling', 'AWS', 'SQL', 'Mathematics', 'Statistics', 'AI/Ml'],
    'Data Scientist': ['Python', 'R', 'SQL', 'Statistics', 'Data Visualization', 'Tableau', 'PowerBI', 'Machine Learning', 'Big Data'],
    'Data Engineer': ['Python', 'SQL', 'Spark', 'Hadoop', 'Kafka', 'Airflow', 'AWS', 'ETL', 'Big Data', 'Database Design'],
    'Software Engineer': ['Java', 'C++', 'Python', 'Data Structures', 'Algorithms', 'System Design', 'Git', 'SQL', 'Problem Solving'],
    'Full Stack Developer': ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'MongoDB', 'SQL', 'REST API', 'GraphQL', 'Git'],
    'Frontend Engineer': ['JavaScript', 'React', 'Angular', 'Vue.js', 'HTML', 'CSS', 'UI/UX', 'Responsive Design', 'TypeScript'],
    'Backend Engineer': ['Java', 'Python', 'Node.js', 'Go', 'SQL', 'NoSQL', 'Microservices', 'API Design', 'Redis', 'Docker'],
    'DevOps Engineer': ['Linux', 'Bash', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'AWS', 'Azure', 'CI/CD', 'Ansible'],
    'Cloud Architect': ['AWS', 'Azure', 'GCP', 'Networking', 'Security', 'System Design', 'Microservices', 'Kubernetes', 'Terraform'],
    'Cybersecurity Analyst': ['Network Security', 'Linux', 'Python', 'Penetration Testing', 'Firewalls', 'Cryptography', 'SIEM', 'Risk Analysis'],
    'Blockchain Developer': ['Solidity', 'Ethereum', 'Smart Contracts', 'Cryptography', 'Blockchain', 'Web3.js', 'Go', 'Rust'],
    'Product Manager': ['Product Strategy', 'Agile', 'Scrum', 'User Research', 'Data Analysis', 'Communication', 'Leadership', 'Roadmapping'],
    'Business Analyst': ['SQL', 'Excel', 'Tableau', 'PowerBI', 'Data Analysis', 'Requirements Gathering', 'Communication', 'Process Modeling']
}

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'message': 'Career Outcome Analysis ML Service is running',
        'endpoints': {
            'health': '/api/health',
            'predict': '/api/predict',
            'skills': '/api/skills'
        }
    })

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
        
        # Determine prediction method
        # Prioritize rule-based if specific new skills are present, otherwise use model if available
        # For now, let's mix: use Rules for new roles not in old model, Model for standard stuff
        
        # Simplified: Use Enhanced Rule-Based Logic (since we don't have a retrained model for new roles)
        prediction_result = predict_with_enhanced_rules(degree, skills, experience)
        
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

def simple_similarity(str1, str2):
    """Simple similarity score between two strings (0-100)"""
    s1, s2 = str1.lower(), str2.lower()
    if s1 == s2:
        return 100
    if s1 in s2 or s2 in s1:
        return 85
    # Count common words
    words1 = set(s1.split())
    words2 = set(s2.split())
    if not words1 or not words2:
        return 0
    common = len(words1 & words2)
    total = len(words1 | words2)
    return int((common / total) * 100) if total > 0 else 0

def predict_with_enhanced_rules(degree, skills, experience):
    """Improved Rule-based prediction with fuzzy skill matching, weighted scoring, and better confidence metrics."""
    
    # 1. Identify Candidate Roles based on Degree (Broad Filtering)
    degree_map = {
        'Computer Science': ['Software Engineer', 'Full Stack Developer', 'Backend Engineer', 'Frontend Engineer', 'DevOps Engineer', 'AI Engineer', 'ML Engineer', 'Cloud Architect', 'Cybersecurity Analyst', 'Blockchain Developer', 'Data Scientist', 'Data Engineer'],
        'Data Science': ['Data Scientist', 'Data Analyst', 'Data Engineer', 'ML Engineer', 'AI Engineer', 'BI Analyst', 'Research Scientist'],
        'Information Technology': ['Software Engineer', 'DevOps Engineer', 'Cloud Architect', 'Cybersecurity Analyst', 'Data Engineer', 'Business Analyst'],
        'Business': ['Product Manager', 'Business Analyst', 'Consultant', 'Marketing Manager', 'Project Manager'],
        'Mathematics': ['Data Scientist', 'Data Analyst', 'ML Engineer', 'Research Scientist'],
        'Engineering': ['Software Engineer', 'ML Engineer', 'AI Engineer', 'Data Engineer', 'DevOps Engineer'],
        'Other': ['Software Engineer', 'Data Analyst', 'Business Analyst'] # Default for less specific degrees
    }
    
    # Normalize degree input to match keys, or use 'Other'
    normalized_degree = 'Other'
    best_degree_match = 0
    for deg_key in degree_map.keys():
        similarity = simple_similarity(degree, deg_key)
        if similarity > best_degree_match:
            best_degree_match = similarity
            if similarity > 70:  # Threshold for degree matching
                normalized_degree = deg_key
    candidate_roles = degree_map.get(normalized_degree, degree_map['Other'])
    
    # 2. Score each candidate role based on Skill Match
    role_scores = []
    user_skills_lower = [s.lower() for s in skills]
    
    for role in set(candidate_roles): # Use set to avoid duplicates if any
        # Get defining skills for the role from our extended mapping
        required_skills_for_role = EXTENDED_SKILL_MAPPING.get(role, [])
        if not required_skills_for_role and skill_role_mapping and role in skill_role_mapping:
             required_skills_for_role = list(skill_role_mapping[role].keys())
        
        # Assign weights to skills (example: first few skills are more important)
        weighted_required_skills = []
        for i, skill in enumerate(required_skills_for_role):
            weight = 1.0
            if i < 3: weight = 2.0 # Top 3 skills are critical
            elif i < 6: weight = 1.5 # Next 3 are very important
            weighted_required_skills.append((skill, weight))

        current_role_score = 0
        matched_skills_count = 0
        
        for req_skill, weight in weighted_required_skills:
            # Simple similarity matching for skills
            best_match_score = 0
            for user_skill in user_skills_lower:
                similarity = simple_similarity(req_skill, user_skill)
                if similarity > best_match_score:
                    best_match_score = similarity
            
            # If a skill matches reasonably well (e.g., > 75% similarity)
            if best_match_score >= 75:
                current_role_score += (best_match_score / 100.0) * weight # Add weighted similarity score
                matched_skills_count += 1
        
        # Add bonus for experience if relevant to the role (simplified)
        if experience > 0 and role in ['Software Engineer', 'Data Scientist', 'ML Engineer', 'DevOps Engineer']:
            current_role_score += min(experience * 0.5, 5) # Max 5 bonus points for experience
            
        # Normalize score by total possible weighted score for the role
        total_possible_weighted_score = sum(w for _, w in weighted_required_skills)
        if total_possible_weighted_score > 0:
            normalized_score = (current_role_score / total_possible_weighted_score) * 100
        else:
            normalized_score = 0
            
        role_scores.append({
            'role': role,
            'score': normalized_score, # Now a percentage
            'matched_skills_count': matched_skills_count,
            'total_required_skills': len(required_skills_for_role)
        })
    
    # 3. Sort by Score
    role_scores.sort(key=lambda x: x['score'], reverse=True)
    
    # Primary Prediction
    if not role_scores:
        predicted_role = "Generalist"
        confidence = 0.1
        best_match_score = 0
    else:
        best_match = role_scores[0]
        predicted_role = best_match['role']
        best_match_score = best_match['score']
        
        # Calculate confidence based on the best score and number of matched skills
        # Confidence is higher if score is high AND many skills matched
        confidence = (best_match_score / 100.0) * (best_match['matched_skills_count'] / max(best_match['total_required_skills'], 1))
        confidence = min(max(confidence, 0.2), 0.95) # Clamp confidence between 20% and 95%
        
        # Adjust confidence based on experience
        if experience >= 5 and best_match_score > 60:
            confidence = min(confidence * 1.1, 0.99)
        elif experience < 1 and best_match_score < 40:
            confidence = max(confidence * 0.8, 0.15)

    # Get Salary Data (INR)
    salary_info = SALARY_DATA.get(predicted_role, {'min': 400000, 'max': 1000000, 'avg': 700000})
    
    # Experience Multiplier (Indian Market logic: huge jumps for relevant exp)
    if experience <= 1:
        exp_mult = 0.8
    elif experience <= 3:
        exp_mult = 1.0
    elif experience <= 6:
        exp_mult = 1.5
    elif experience <= 10:
        exp_mult = 2.2
    else:
        exp_mult = 3.0
        
    # Apply confidence to salary range (lower confidence, wider/lower range)
    salary_min = int(salary_info['min'] * exp_mult * (0.8 + 0.2 * confidence))
    salary_max = int(salary_info['max'] * exp_mult * (0.9 + 0.1 * confidence))
    salary_avg = int(salary_info['avg'] * exp_mult * (0.85 + 0.15 * confidence))

    # Alternatives
    alternatives = []
    for item in role_scores[1:4]: # Next 3 best
        if item['score'] > 20: # Only suggest alternatives with a reasonable score
            alt_prob = (item['score'] / 100.0) * (item['matched_skills_count'] / max(item['total_required_skills'], 1))
            alt_prob = min(max(alt_prob, 0.1), 0.8) # Clamp alternative probability
            alternatives.append({
                'role': item['role'],
                'probability': float(f"{alt_prob:.2f}"),
                'matchScore': int(item['score'])
            })

    return {
        'careerRole': predicted_role,
        'probability': float(f"{confidence:.2f}"),
        'confidence': 'Very High' if confidence > 0.85 else 'High' if confidence > 0.7 else 'Medium' if confidence > 0.4 else 'Low',
        'salaryRange': {
            'min': int(salary_info['min'] * exp_mult),
            'max': int(salary_info['max'] * exp_mult),
            'average': int(salary_info['avg'] * exp_mult),
            'currency': 'INR'
        },
        'alternativeCareers': alternatives
    }

def analyze_skill_gap(user_skills, predicted_role, experience):
    """Analyze skill gaps for predicted role"""
    
    # Get required skills for role from our DEFINITIVE list
    required_skills = EXTENDED_SKILL_MAPPING.get(predicted_role, [])
    if not required_skills and skill_role_mapping:
         required_skills = list(skill_role_mapping.get(predicted_role, {}).keys())
    
    required_skills = required_skills[:12] # Top 12 skills
    
    # Find matching and missing skills (Case insensitive check)
    user_skills_lower = [s.lower() for s in user_skills]
    
    matching_skills = []
    missing_skills = []
    
    for req in required_skills:
        if req.lower() in user_skills_lower:
            matching_skills.append(req)
        else:
            missing_skills.append(req)
    
    # Categorize missing skills by importance
    missing_skills_detailed = []
    for idx, skill in enumerate(missing_skills):
        importance = 'Critical' if idx < 3 else 'Important' if idx < 6 else 'Nice-to-have'
        impact = 20 - (idx * 1.5)
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
    high_demand_roles = ['Software Engineer', 'Data Scientist', 'ML Engineer', 'AI Engineer', 'DevOps Engineer', 'Data Engineer', 'Full Stack Developer', 'Cloud Architect', 'Cybersecurity Analyst', 'Blockchain Developer']
    
    market_demand = 'High' if role in high_demand_roles else 'Medium'
    
    # Growth potential
    if role in ['AI Engineer', 'ML Engineer', 'Data Scientist', 'Cybersecurity Analyst', 'Cloud Architect', 'Blockchain Developer']:
        growth_potential = 'Very High'
    elif experience < 3 and skill_match > 60:
        growth_potential = 'High'
    else:
        growth_potential = 'Medium'
    
    # Generate recommendations
    recommendations = []
    if skill_match < 70:
        recommendations.append('Focus on acquiring missing critical skills through projects or certifications.')
    if experience < 2:
        recommendations.append('Build a strong portfolio of projects on GitHub.')
        recommendations.append('Participate in hackathons to gain practical experience.')
    recommendations.append('Network with professionals on LinkedIn in your target role.')
    recommendations.append('Stay updated with industry trends (e.g., follow TechCrunch, HackerNews).')
    
    # Industry trends
    industry_trends = [
        'AI and Generative AI adoption is creating massive demand for AI/ML engineers.',
        'Cloud-native architectures are becoming the standard (AWS/Azure/GCP).',
        'Cybersecurity is a top priority for all enterprises.',
        'Remote and hybrid work models are stabilizing.'
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
    # Expanded Skill List
    default_skills = [
        'Python', 'JavaScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'Ruby',
        'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'Redis', 'Cassandra', 'Elasticsearch',
        'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Next.js', 'Tailwind CSS', 'TypeScript',
        'Node.js', 'Django', 'Flask', 'Spring Boot', '.NET', 'Express.js', 'FastAPI',
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'Ansible', 'Jenkins', 'Git', 'CI/CD',
        'Machine Learning', 'Deep Learning', 'Data Analysis', 'Statistics', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Computer Vision', 'NLP', 'AI/Ml', 'Generative AI',
        'Big Data', 'Spark', 'Hadoop', 'Kafka', 'Airflow', 'Databricks',
        'Cybersecurity', 'Penetration Testing', 'Network Security',
        'Blockchain', 'Soldity', 'Smart Contracts', 'Web3',
        'Agile', 'Scrum', 'Jira', 'Communication', 'Problem Solving', 'Teamwork', 'Leadership', 'Project Management'
    ]
    
    # Combine with encoder classes if available, but ensure unique and sorted
    final_skills = set(default_skills)
    if skills_encoder is not None:
         final_skills.update(skills_encoder.classes_)
         
    return jsonify({
        'skills': sorted(list(final_skills))
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
