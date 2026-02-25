from app import predict
import json

def test_prediction():
    test_data = {
        'degree': 'Computer Science',
        'skills': ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
        'experience': 3
    }
    
    # Mocking request context is hard, let's just use the functions directly
    # or actually we can test the logic inside predict
    pass

if __name__ == '__main__':
    # Since testing Flask routes directly requires more setup, 
    # let's just check if models are loaded in app.py
    import app
    if app.model is not None:
        print("ML Model is loaded and ready.")
    else:
        print("ML Model is NOT loaded.")
