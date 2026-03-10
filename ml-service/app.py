from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from predictor import CareerPredictor

app = Flask(__name__)
CORS(app)

# Initialize Predictor
predictor = CareerPredictor()

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
        'model_loaded': predictor.model is not None
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
        
        result = predictor.predict(
            data['degree'],
            data['skills'],
            data['experience']
        )
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/skills', methods=['GET'])
def get_available_skills():
    """Get list of available skills"""
    skills = predictor.get_available_skills()
    return jsonify({
        'skills': skills
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
