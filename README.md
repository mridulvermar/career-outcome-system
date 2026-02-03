# Career Outcome Analysis System (MERN Stack)

A full-stack web application that uses Machine Learning to predict career outcomes, analyze skill gaps, and provide personalized career insights.

## 🚀 Features

### Core Features
- ✅ **User Authentication** - JWT-based secure login/registration
- ✅ **Career Prediction** - ML-powered career role prediction with probability scores
- ✅ **Skill Gap Analysis** - Identify missing skills and get recommendations
- ✅ **Interactive Dashboard** - Visualize career data with charts and graphs
- ✅ **Analysis History** - Track all past predictions and results
- ✅ **PDF Reports** - Download comprehensive career analysis reports
- ✅ **Career Comparison** - Compare different career paths side-by-side

### Technical Features
- Real-time ML predictions using RandomForest model
- Comprehensive data visualization using Recharts
- Material-UI based responsive design
- RESTful API architecture
- MongoDB database for data persistence
- Rate limiting and security best practices

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│  React Frontend │────▶│  Express Backend │────▶│  Flask ML API   │
│  (Port 3000)    │     │  (Port 5000)     │     │  (Port 5001)    │
│                 │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   MongoDB    │
                        │  (Port 27017)│
                        └──────────────┘
```

## 📋 Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd career-outcome-system
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
```

**Backend .env Configuration:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/career_outcome_db
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
ML_SERVICE_URL=http://localhost:5001
CORS_ORIGIN=http://localhost:3000
```

### 3. ML Service Setup

```bash
cd ../ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train the ML model
python train_model.py
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install

# Create .env file (optional)
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

## 🚀 Running the Application

You need to start three services:

### Terminal 1: MongoDB
```bash
mongod
# Or if using MongoDB as a service, it should already be running
```

### Terminal 2: Backend API
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### Terminal 3: ML Service
```bash
cd ml-service
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py
# ML API runs on http://localhost:5001
```

### Terminal 4: Frontend
```bash
cd frontend
npm start
# React app opens at http://localhost:3000
```

## 📱 Usage Guide

### 1. Register/Login
- Navigate to `http://localhost:3000`
- Create a new account or login
- You'll be redirected to the dashboard

### 2. Create Analysis
- Click "New Analysis" button
- Fill in your details:
  - Degree/Field of Study
  - Skills (select multiple)
  - Years of Experience
  - Career Interests (optional)
  - Education Level (optional)
- Click "Analyze Career Outcomes"

### 3. View Results
- See your predicted career role with probability
- View salary range estimates
- Analyze skill gaps
- Check alternative career paths
- Review personalized recommendations

### 4. Download Report
- Click "Download Report" to get a PDF
- Share with mentors or keep for reference

### 5. View History
- Access past analyses from dashboard
- Compare different analyses
- Track your progress over time

## 🗂️ Project Structure

```
career-outcome-system/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── analysisController.js
│   │   └── reportController.js
│   ├── models/
│   │   ├── User.js
│   │   └── Analysis.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── analysis.js
│   ├── server.js
│   └── package.json
│
├── ml-service/
│   ├── models/              # Trained ML models
│   ├── app.py              # Flask API
│   ├── train_model.py      # Model training script
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── AuthPage.js
    │   │   ├── Dashboard.js
    │   │   ├── AnalysisForm.js
    │   │   └── ResultsPage.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Analysis
- `POST /api/analysis` - Create new analysis (protected)
- `GET /api/analysis` - Get analysis history (protected)
- `GET /api/analysis/:id` - Get specific analysis (protected)
- `DELETE /api/analysis/:id` - Delete analysis (protected)
- `POST /api/analysis/compare` - Compare careers (protected)
- `GET /api/analysis/:id/report` - Download PDF report (protected)

### ML Service
- `GET /api/health` - Health check
- `POST /api/predict` - Get career prediction
- `GET /api/skills` - Get available skills list

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🎨 Technologies Used

### Frontend
- React 18
- Material-UI (MUI)
- Recharts (data visualization)
- React Router
- Axios
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- BCrypt
- PDFKit

### ML Service
- Python
- Flask
- Scikit-learn
- Pandas
- NumPy
- Joblib

## 🔒 Security Features

- Password hashing with BCrypt
- JWT token authentication
- Rate limiting on API endpoints
- CORS protection
- Helmet.js security headers
- Input validation

## 📊 ML Model Details

The system uses a **RandomForest Classifier** trained on synthetic but realistic career data:

- **Features**: Degree, Skills, Experience
- **Target**: Career Role
- **Accuracy**: ~85% on training data
- **Model Type**: Multi-class classification
- **Encoders**: LabelEncoder for categorical data, MultiLabelBinarizer for skills

### Supported Career Roles
- Software Engineer, Data Scientist, ML Engineer
- DevOps Engineer, Full Stack Developer
- Data Analyst, Data Engineer, BI Analyst
- Product Manager, Business Analyst, Consultant
- And more...

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh
# Or check service status
sudo systemctl status mongod
```

### Port Already in Use
```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in .env file
```

### ML Model Not Found
```bash
cd ml-service
python train_model.py
```

### CORS Errors
- Ensure CORS_ORIGIN in backend .env matches frontend URL
- Check that ML_SERVICE_URL points to correct ML service

## 🚀 Deployment

### Backend & ML Service
- Deploy on Heroku, AWS EC2, or DigitalOcean
- Use MongoDB Atlas for database
- Set environment variables in hosting platform

### Frontend
- Deploy on Vercel, Netlify, or AWS S3
- Update API URL in production build
- Configure CORS on backend

## 📝 Future Enhancements

- [ ] Add more ML models (Neural Networks, XGBoost)
- [ ] Implement collaborative filtering for recommendations
- [ ] Add social features (share results)
- [ ] Integration with LinkedIn API
- [ ] Real-time market salary data
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support

## 👥 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📧 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@careeranalysis.com

## 🙏 Acknowledgments

- Scikit-learn for ML capabilities
- Material-UI for beautiful components
- Recharts for data visualization
- MongoDB for flexible data storage

---

**Built with ❤️ using MERN Stack + Machine Learning**
