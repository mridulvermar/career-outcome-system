"""
Test script to verify improved job matching logic
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the prediction function
from app import predict_with_enhanced_rules, EXTENDED_SKILL_MAPPING

def test_job_matching():
    """Test various skill combinations to ensure proper job matching"""
    
    test_cases = [
        {
            'name': 'Data Science Skills',
            'degree': 'Computer Science',
            'skills': ['Python', 'Machine Learning', 'Statistics', 'Pandas', 'Tableau'],
            'experience': 2,
            'expected_roles': ['Data Scientist', 'ML Engineer', 'Data Analyst']
        },
        {
            'name': 'DevOps Skills',
            'degree': 'Information Technology',
            'skills': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
            'experience': 3,
            'expected_roles': ['DevOps Engineer', 'Cloud Architect']
        },
        {
            'name': 'Product Management Skills',
            'degree': 'Business',
            'skills': ['Product Strategy', 'Agile', 'User Research', 'Communication', 'Data Analysis'],
            'experience': 4,
            'expected_roles': ['Product Manager', 'Business Analyst']
        },
        {
            'name': 'Blockchain Skills',
            'degree': 'Computer Science',
            'skills': ['Solidity', 'Ethereum', 'Smart Contracts', 'Web3', 'Cryptography'],
            'experience': 2,
            'expected_roles': ['Blockchain Developer']
        },
        {
            'name': 'AI/ML Skills with Synonyms',
            'degree': 'Data Science',
            'skills': ['Python', 'TensorFlow', 'Deep Learning', 'NLP', 'AI/ML'],
            'experience': 3,
            'expected_roles': ['AI Engineer', 'ML Engineer', 'Data Scientist']
        },
        {
            'name': 'Frontend Development',
            'degree': 'Computer Science',
            'skills': ['React', 'JavaScript', 'HTML', 'CSS', 'TypeScript', 'Redux'],
            'experience': 2,
            'expected_roles': ['Frontend Engineer', 'Full Stack Developer']
        },
        {
            'name': 'Cybersecurity Skills',
            'degree': 'Information Technology',
            'skills': ['Network Security', 'Penetration Testing', 'Linux', 'Python', 'Firewalls'],
            'experience': 3,
            'expected_roles': ['Cybersecurity Analyst']
        }
    ]
    
    print("=" * 80)
    print("TESTING IMPROVED JOB MATCHING LOGIC")
    print("=" * 80)
    print()
    
    passed = 0
    failed = 0
    
    for test in test_cases:
        print(f"\nTest: {test['name']}")
        print(f"  Degree: {test['degree']}")
        print(f"  Skills: {', '.join(test['skills'])}")
        print(f"  Experience: {test['experience']} years")
        
        try:
            result = predict_with_enhanced_rules(
                test['degree'],
                test['skills'],
                test['experience']
            )
            
            predicted_role = result['careerRole']
            confidence = result['probability']
            alternatives = [alt['role'] for alt in result['alternativeCareers']]
            
            print(f"  → Predicted: {predicted_role} (confidence: {confidence:.2%})")
            print(f"  → Alternatives: {', '.join(alternatives[:3])}")
            
            # Check if predicted role is in expected roles
            all_suggested = [predicted_role] + alternatives
            match_found = any(expected in all_suggested for expected in test['expected_roles'])
            
            if match_found:
                print(f"  [PASS] - Found expected role in suggestions")
                passed += 1
            else:
                print(f"  [FAIL] - Expected one of {test['expected_roles']}, got {predicted_role}")
                failed += 1
                
        except Exception as e:
            print(f"  [ERROR]: {str(e)}")
            failed += 1
    
    print()
    print("=" * 80)
    print(f"RESULTS: {passed} passed, {failed} failed out of {len(test_cases)} tests")
    print("=" * 80)
    
    return passed, failed

if __name__ == '__main__':
    passed, failed = test_job_matching()
    sys.exit(0 if failed == 0 else 1)
