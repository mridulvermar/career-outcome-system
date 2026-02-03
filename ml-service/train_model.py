import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, MultiLabelBinarizer
import joblib
import json

# Career outcome dataset (synthetic but realistic)
def create_training_data():
    """Generate synthetic training data for career prediction"""
    
    data = []
    
    # Define career mappings
    career_mappings = {
        'Computer Science': {
            'roles': ['Software Engineer', 'Data Scientist', 'ML Engineer', 'DevOps Engineer', 
                     'Full Stack Developer', 'Backend Engineer', 'Frontend Engineer'],
            'skills': [
                ['Python', 'JavaScript', 'Git', 'SQL', 'Docker', 'AWS'],
                ['Python', 'Machine Learning', 'Statistics', 'SQL', 'TensorFlow', 'Data Visualization'],
                ['Python', 'Deep Learning', 'TensorFlow', 'PyTorch', 'MLOps', 'Kubernetes'],
                ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux', 'Git', 'Terraform'],
                ['JavaScript', 'React', 'Node.js', 'MongoDB', 'PostgreSQL', 'Git'],
                ['Python', 'Django', 'PostgreSQL', 'Redis', 'Docker', 'REST APIs'],
                ['React', 'TypeScript', 'CSS', 'HTML', 'Redux', 'Webpack']
            ]
        },
        'Data Science': {
            'roles': ['Data Analyst', 'Data Engineer', 'ML Engineer', 'Research Scientist', 'BI Analyst'],
            'skills': [
                ['SQL', 'Python', 'Excel', 'Tableau', 'Statistics', 'Data Visualization'],
                ['Python', 'Spark', 'SQL', 'Airflow', 'AWS', 'ETL', 'Kafka'],
                ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'MLOps'],
                ['Python', 'Research', 'Deep Learning', 'Publications', 'Statistics'],
                ['SQL', 'Tableau', 'Power BI', 'Excel', 'Data Warehousing']
            ]
        },
        'Business': {
            'roles': ['Product Manager', 'Business Analyst', 'Consultant', 'Marketing Manager', 'Project Manager'],
            'skills': [
                ['Product Strategy', 'Agile', 'Stakeholder Management', 'Analytics', 'UX Design'],
                ['SQL', 'Excel', 'Data Analysis', 'Requirements Gathering', 'Presentations'],
                ['Strategy', 'Problem Solving', 'Communication', 'Excel', 'PowerPoint'],
                ['Marketing Strategy', 'SEO', 'Content Marketing', 'Analytics', 'Social Media'],
                ['Project Management', 'Agile', 'Scrum', 'Risk Management', 'Stakeholder Management']
            ]
        }
    }
    
    # Generate samples
    for degree, info in career_mappings.items():
        for role_idx, role in enumerate(info['roles']):
            base_skills = info['skills'][role_idx] if role_idx < len(info['skills']) else info['skills'][0]
            
            # Generate multiple samples per role
            for exp in range(0, 11):  # 0-10 years experience
                for variation in range(5):  # 5 variations per experience level
                    # Vary skill count based on experience
                    skill_count = min(3 + exp // 2, len(base_skills))
                    np.random.seed(exp * 100 + variation)
                    skills = list(np.random.choice(base_skills, skill_count, replace=False))
                    
                    # Add some random skills
                    additional_skills = ['Agile', 'Communication', 'Problem Solving', 'Teamwork']
                    skills.extend(list(np.random.choice(additional_skills, np.random.randint(0, 3), replace=False)))
                    
                    data.append({
                        'degree': degree,
                        'skills': skills,
                        'experience': exp,
                        'career_role': role
                    })
    
    return pd.DataFrame(data)

def train_model():
    """Train the career prediction model"""
    
    print("Generating training data...")
    df = create_training_data()
    
    print(f"Training samples: {len(df)}")
    
    # Prepare features
    # Encode degree
    le_degree = LabelEncoder()
    df['degree_encoded'] = le_degree.fit_transform(df['degree'])
    
    # Encode skills using MultiLabelBinarizer
    mlb_skills = MultiLabelBinarizer()
    skills_encoded = mlb_skills.fit_transform(df['skills'])
    skills_df = pd.DataFrame(skills_encoded, columns=mlb_skills.classes_)
    
    # Combine features
    X = pd.concat([
        pd.DataFrame({'degree': df['degree_encoded'].values, 
                     'experience': df['experience'].values}),
        skills_df
    ], axis=1)
    
    # Encode target
    le_role = LabelEncoder()
    y = le_role.fit_transform(df['career_role'])
    
    # Train model
    print("Training Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X, y)
    
    print(f"Model accuracy: {model.score(X, y):.2%}")
    
    # Save model and encoders
    print("Saving model and encoders...")
    joblib.dump(model, 'models/career_model.pkl')
    joblib.dump(le_degree, 'models/degree_encoder.pkl')
    joblib.dump(le_role, 'models/role_encoder.pkl')
    joblib.dump(mlb_skills, 'models/skills_encoder.pkl')
    
    # Save skill-role mappings for skill gap analysis
    skill_role_mapping = {}
    for role in df['career_role'].unique():
        role_data = df[df['career_role'] == role]
        all_skills = []
        for skills_list in role_data['skills']:
            all_skills.extend(skills_list)
        skill_counts = pd.Series(all_skills).value_counts()
        skill_role_mapping[role] = skill_counts.head(10).to_dict()
    
    with open('models/skill_role_mapping.json', 'w') as f:
        json.dump(skill_role_mapping, f, indent=2)
    
    print("Model training complete!")
    return model, le_degree, le_role, mlb_skills

if __name__ == '__main__':
    import os
    os.makedirs('models', exist_ok=True)
    train_model()
