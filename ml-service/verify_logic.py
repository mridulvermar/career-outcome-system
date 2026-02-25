from app import get_prediction, model
import json

def test_ml_prediction():
    print("Testing ML Model Prediction...")
    if model is None:
        print("ERROR: Model not loaded in app context.")
        return

    test_cases = [
        {
            'degree': 'Computer Science',
            'skills': ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
            'experience': 3
        },
        {
            'degree': 'Business',
            'skills': ['Product Management', 'Agile', 'Strategy'],
            'experience': 5
        }
    ]
    
    for i, test in enumerate(test_cases):
        print(f"\nCase {i+1}: {test['degree']} with {len(test['skills'])} skills")
        try:
            result = get_prediction(test['degree'], test['skills'], test['experience'])
            pred = result['prediction']
            print(f"  Result Role: {pred['careerRole']}")
            print(f"  Confidence: {pred['probability']:.2%}")
            print(f"  Salary Range: {pred['salaryRange']['min']} - {pred['salaryRange']['max']} {pred['salaryRange']['currency']}")
            
            if 'Prediction made using Random Forest model' in str(pred): # This won't work because it prints, doesn't return
                pass # Check stdout instead
        except Exception as e:
            print(f"  FAILED: {e}")

if __name__ == '__main__':
    test_ml_prediction()
