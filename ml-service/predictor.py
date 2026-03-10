import os
import joblib
import json
import numpy as np
from datetime import datetime
from data_constants import (
    SALARY_DATA, EXTENDED_SKILL_MAPPING, SKILL_SYNONYMS, 
    DEGREE_MAP, MAX_SKILLS_TO_CHECK
)

class CareerPredictor:
    def __init__(self, model_path='models/'):
        self.model_path = model_path
        self.model = None
        self.degree_encoder = None
        self.role_encoder = None
        self.skills_encoder = None
        self.skill_role_mapping = {}
        self._load_models()

    def _load_models(self):
        """Load models and encoders if they exist"""
        try:
            if os.path.exists(os.path.join(self.model_path, 'career_model.pkl')):
                self.model = joblib.load(os.path.join(self.model_path, 'career_model.pkl'))
                self.degree_encoder = joblib.load(os.path.join(self.model_path, 'degree_encoder.pkl'))
                self.role_encoder = joblib.load(os.path.join(self.model_path, 'role_encoder.pkl'))
                self.skills_encoder = joblib.load(os.path.join(self.model_path, 'skills_encoder.pkl'))
                print("SUCCESS: Models loaded successfully")
            else:
                print("WARNING: Model files not found. Using rule-based fallback.")

            mapping_path = os.path.join(self.model_path, 'skill_role_mapping.json')
            if os.path.exists(mapping_path):
                with open(mapping_path, 'r') as f:
                    self.skill_role_mapping = json.load(f)
        except Exception as e:
            print(f"WARNING: Could not load models - {e}")

    def normalize_skill(self, skill):
        """Normalize a skill to its canonical form using synonym mapping"""
        skill_lower = skill.lower().strip()
        
        # Check if it's already a canonical form
        if skill_lower in SKILL_SYNONYMS:
            return skill_lower
        
        # Check if it's a synonym
        for canonical, synonyms in SKILL_SYNONYMS.items():
            if skill_lower in synonyms:
                return canonical
        
        # Return as-is if no mapping found
        return skill_lower

    def match_skill_with_synonyms(self, user_skill, required_skill):
        """
        Advanced skill matching with synonym support and fuzzy matching.
        Returns a score from 0-100 indicating match quality.
        """
        user_norm = self.normalize_skill(user_skill)
        req_norm = self.normalize_skill(required_skill)
        
        if user_norm == req_norm:
            return 100
        
        user_canonical = user_norm
        req_canonical = req_norm
        
        for canonical, synonyms in SKILL_SYNONYMS.items():
            if user_norm in synonyms:
                user_canonical = canonical
            if req_norm in synonyms:
                req_canonical = canonical
        
        if user_canonical == req_canonical:
            return 95
        
        user_lower = user_skill.lower().strip()
        req_lower = required_skill.lower().strip()
        
        if user_lower == req_lower:
            return 100
        
        if user_lower in req_lower or req_lower in user_lower:
            return 85
        
        user_words = set(user_lower.split())
        req_words = set(req_lower.split())
        
        if not user_words or not req_words:
            return 0
        
        common = len(user_words & req_words)
        total = len(user_words | req_words)
        
        if total > 0:
            return int((common / total) * 100)
        
        return 0

    def predict_with_enhanced_rules(self, degree, skills, experience):
        """Improved Rule-based prediction logic"""
        normalized_degree = 'Other'
        best_degree_match = 0
        for deg_key in DEGREE_MAP.keys():
            similarity = self.match_skill_with_synonyms(degree, deg_key)
            if similarity > best_degree_match:
                best_degree_match = similarity
                if similarity > 70:
                    normalized_degree = deg_key
        
        degree_based_roles = DEGREE_MAP.get(normalized_degree, DEGREE_MAP['Other'])
        all_possible_roles = list(EXTENDED_SKILL_MAPPING.keys())
        candidate_roles = list(set(degree_based_roles + all_possible_roles))
        
        role_scores = []
        for role in candidate_roles:
            required_skills_for_role = EXTENDED_SKILL_MAPPING.get(role, [])
            if not required_skills_for_role and self.skill_role_mapping and role in self.skill_role_mapping:
                 required_skills_for_role = list(self.skill_role_mapping[role].keys())
            
            required_skills_for_role = required_skills_for_role[:MAX_SKILLS_TO_CHECK]
            weighted_required_skills = []
            for i, skill in enumerate(required_skills_for_role):
                weight = 1.0
                if i < 3: weight = 3.0
                elif i < 7: weight = 2.0
                elif i < 12: weight = 1.2
                weighted_required_skills.append((skill, weight))

            current_role_score = 0
            matched_skills_count = 0
            for req_skill, weight in weighted_required_skills:
                best_match_score = 0
                for user_skill in skills:
                    similarity = self.match_skill_with_synonyms(user_skill, req_skill)
                    if similarity > best_match_score:
                        best_match_score = similarity
                
                if best_match_score >= 70:
                    current_role_score += (best_match_score / 100.0) * weight
                    matched_skills_count += 1
            
            if role in degree_based_roles:
                current_role_score += 2.0
            
            if experience > 0:
                current_role_score += min(experience * 0.3, 3)
                
            total_possible_weighted_score = sum(w for _, w in weighted_required_skills)
            normalized_score = (current_role_score / total_possible_weighted_score * 100) if total_possible_weighted_score > 0 else 0
                
            role_scores.append({
                'role': role,
                'score': normalized_score,
                'matched_skills_count': matched_skills_count,
                'total_required_skills': len(required_skills_for_role)
            })
        
        role_scores.sort(key=lambda x: x['score'], reverse=True)
        
        if not role_scores:
            predicted_role = "Generalist"
            confidence = 0.1
        else:
            best_match = role_scores[0]
            predicted_role = best_match['role']
            confidence = min(max(best_match['score'] / 100.0, 0.15), 0.95)
            
            if experience >= 5 and confidence > 0.6:
                confidence = min(confidence * 1.1, 0.99)
            elif experience < 1 and confidence < 0.4:
                confidence = max(confidence * 0.8, 0.15)

        salary_info = SALARY_DATA.get(predicted_role, {'min': 400000, 'max': 1000000, 'avg': 700000})
        exp_mult = 0.8 if experience <= 1 else 1.0 if experience <= 3 else 1.5 if experience <= 6 else 2.2 if experience <= 10 else 3.0
            
        alternatives = []
        for item in role_scores[1:4]:
            if item['score'] > 20:
                alt_prob = (item['score'] / 100.0) * (item['matched_skills_count'] / max(item['total_required_skills'], 1))
                alt_prob = min(max(alt_prob, 0.1), 0.8)
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

    def analyze_skill_gap(self, user_skills, predicted_role, experience, probability=None):
        """Analyze skill gaps for predicted role"""
        required_skills = EXTENDED_SKILL_MAPPING.get(predicted_role, [])
        if not required_skills and self.skill_role_mapping:
             required_skills = list(self.skill_role_mapping.get(predicted_role, {}).keys())
        
        required_skills = required_skills[:MAX_SKILLS_TO_CHECK]
        user_skills_lower = [s.lower() for s in user_skills]
        
        matching_skills = []
        missing_skills = []
        for req in required_skills:
            if req.lower() in user_skills_lower:
                matching_skills.append(req)
            else:
                missing_skills.append(req)
        
        missing_skills_detailed = []
        for idx, skill in enumerate(missing_skills):
            importance = 'Critical' if idx < 3 else 'Important' if idx < 6 else 'Nice-to-have'
            impact = 20 - (idx * 1.5)
            missing_skills_detailed.append({
                'skill': skill,
                'importance': importance,
                'impactOnSuccess': impact
            })
        
        recommended_skills = []
        for idx, skill in enumerate(missing_skills[:5]):
            recommended_skills.append({
                'skill': skill,
                'reason': f'Essential for {predicted_role} role',
                'priority': 5 - idx
            })
        
        overall_match = int(probability * 100) if probability is not None else int((len(matching_skills) / max(len(required_skills), 1)) * 100)
        
        return {
            'matchingSkills': matching_skills,
            'missingSkills': missing_skills_detailed,
            'recommendedSkills': recommended_skills,
            'overallMatch': overall_match
        }

    def generate_insights(self, role, experience, skill_match):
        """Generate career insights"""
        high_demand_roles = ['Software Engineer', 'Data Scientist', 'ML Engineer', 'AI Engineer', 'DevOps Engineer', 'Data Engineer', 'Full Stack Developer', 'Cloud Architect', 'Cybersecurity Analyst', 'Blockchain Developer']
        market_demand = 'High' if role in high_demand_roles else 'Medium'
        
        if role in ['AI Engineer', 'ML Engineer', 'Data Scientist', 'Cybersecurity Analyst', 'Cloud Architect', 'Blockchain Developer']:
            growth_potential = 'Very High'
        elif experience < 3 and skill_match > 60:
            growth_potential = 'High'
        else:
            growth_potential = 'Medium'
        
        recommendations = []
        if skill_match < 70:
            recommendations.append('Focus on acquiring missing critical skills through projects or certifications.')
        if experience < 2:
            recommendations.append('Build a strong portfolio of projects on GitHub.')
            recommendations.append('Participate in hackathons to gain practical experience.')
        recommendations.append('Network with professionals on LinkedIn in your target role.')
        recommendations.append('Stay updated with industry trends.')
        
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

    def get_available_skills(self):
        """Get list of available skills"""
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
        
        final_skills = set(default_skills)
        if self.skills_encoder is not None:
             final_skills.update(self.skills_encoder.classes_)
             
        return sorted(list(final_skills))

    def predict(self, degree, skills, experience):
        """Main prediction entry point"""
        # For now, we use rule-based logic primarily as per user request to ignore model for now
        # But the architecture supports both.
        prediction_result = self.predict_with_enhanced_rules(degree, skills, experience)
        
        skill_gap = self.analyze_skill_gap(
            skills, 
            prediction_result['careerRole'],
            experience,
            prediction_result['probability']
        )
        
        insights = self.generate_insights(
            prediction_result['careerRole'],
            experience,
            skill_gap['overallMatch']
        )
        
        return {
            'prediction': prediction_result,
            'skillGap': skill_gap,
            'insights': insights
        }
