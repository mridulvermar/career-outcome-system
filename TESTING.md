# Testing Guide

Comprehensive testing documentation for the Career Outcome Analysis System.

## Table of Contents
1. [Testing Setup](#testing-setup)
2. [Backend Tests](#backend-tests)
3. [Frontend Tests](#frontend-tests)
4. [ML Service Tests](#ml-service-tests)
5. [Integration Tests](#integration-tests)
6. [Manual Testing](#manual-testing)

---

## Testing Setup

### Install Testing Dependencies

#### Backend
```bash
cd backend
npm install --save-dev jest supertest mongodb-memory-server
```

#### Frontend
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

#### ML Service
```bash
cd ml-service
pip install pytest pytest-flask pytest-cov
```

---

## Backend Tests

### Test Configuration

Create `backend/jest.config.js`:
```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**'
  ],
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
};
```

### Authentication Tests

Create `backend/__tests__/auth.test.js`:
```javascript
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should not register user with existing email', async () => {
      await User.create({
        name: 'Existing User',
        email: 'test@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should not login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
```

### Analysis Tests

Create `backend/__tests__/analysis.test.js`:
```javascript
const request = require('supertest');
const app = require('../server');

describe('Analysis Endpoints', () => {
  let authToken;

  beforeAll(async () => {
    // Register and login to get token
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'analysis@example.com',
        password: 'password123'
      });
    authToken = res.body.token;
  });

  describe('POST /api/analysis', () => {
    it('should create analysis with valid data', async () => {
      const res = await request(app)
        .post('/api/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          degree: 'Computer Science',
          skills: ['Python', 'JavaScript'],
          experience: 3
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.prediction).toBeDefined();
      expect(res.body.data.skillGap).toBeDefined();
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/analysis')
        .send({
          degree: 'Computer Science',
          skills: ['Python'],
          experience: 3
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/analysis', () => {
    it('should get user analysis history', async () => {
      const res = await request(app)
        .get('/api/analysis')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
```

### Run Backend Tests
```bash
cd backend
npm test
npm test -- --coverage
```

---

## Frontend Tests

### Component Tests

Create `frontend/src/__tests__/AuthPage.test.js`:
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthPage from '../pages/AuthPage';
import { AuthProvider } from '../context/AuthContext';

const MockAuthPage = () => (
  <BrowserRouter>
    <AuthProvider>
      <AuthPage />
    </AuthProvider>
  </BrowserRouter>
);

describe('AuthPage', () => {
  test('renders login form', () => {
    render(<MockAuthPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('switches between login and register tabs', () => {
    render(<MockAuthPage />);
    
    const registerTab = screen.getByRole('tab', { name: /register/i });
    fireEvent.click(registerTab);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    render(<MockAuthPage />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please provide/i)).toBeInTheDocument();
    });
  });
});
```

Create `frontend/src/__tests__/Dashboard.test.js`:
```javascript
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { AuthProvider } from '../context/AuthContext';

jest.mock('../services/api');

const MockDashboard = () => (
  <BrowserRouter>
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  </BrowserRouter>
);

describe('Dashboard', () => {
  test('renders welcome message', () => {
    render(<MockDashboard />);
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });

  test('shows new analysis button', () => {
    render(<MockDashboard />);
    expect(screen.getByText(/new analysis/i)).toBeInTheDocument();
  });
});
```

### Run Frontend Tests
```bash
cd frontend
npm test
npm test -- --coverage
```

---

## ML Service Tests

Create `ml-service/test_app.py`:
```python
import pytest
import json
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    """Test health check endpoint"""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'

def test_prediction(client):
    """Test career prediction endpoint"""
    payload = {
        'degree': 'Computer Science',
        'skills': ['Python', 'JavaScript'],
        'experience': 3
    }
    response = client.post('/api/predict',
                          data=json.dumps(payload),
                          content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'prediction' in data
    assert 'skillGap' in data
    assert 'insights' in data

def test_prediction_validation(client):
    """Test prediction with missing fields"""
    payload = {
        'degree': 'Computer Science'
        # Missing required fields
    }
    response = client.post('/api/predict',
                          data=json.dumps(payload),
                          content_type='application/json')
    
    assert response.status_code == 400

def test_get_skills(client):
    """Test get available skills endpoint"""
    response = client.get('/api/skills')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'skills' in data
    assert isinstance(data['skills'], list)
```

### Run ML Service Tests
```bash
cd ml-service
source venv/bin/activate
pytest
pytest --cov=app
```

---

## Integration Tests

Create `integration-tests/test_flow.js`:
```javascript
const request = require('supertest');

const BACKEND_URL = 'http://localhost:5000';
let token;
let analysisId;

describe('Full Application Flow', () => {
  test('1. Register new user', async () => {
    const res = await request(BACKEND_URL)
      .post('/api/auth/register')
      .send({
        name: 'Integration Test',
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      });

    expect(res.statusCode).toBe(201);
    token = res.body.token;
  });

  test('2. Create career analysis', async () => {
    const res = await request(BACKEND_URL)
      .post('/api/analysis')
      .set('Authorization', `Bearer ${token}`)
      .send({
        degree: 'Computer Science',
        skills: ['Python', 'JavaScript', 'SQL'],
        experience: 3
      });

    expect(res.statusCode).toBe(201);
    analysisId = res.body.data._id;
  });

  test('3. Get analysis by ID', async () => {
    const res = await request(BACKEND_URL)
      .get(`/api/analysis/${analysisId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(analysisId);
  });

  test('4. Get analysis history', async () => {
    const res = await request(BACKEND_URL)
      .get('/api/analysis')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('5. Download PDF report', async () => {
    const res = await request(BACKEND_URL)
      .get(`/api/analysis/${analysisId}/report`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
  });
});
```

---

## Manual Testing

### Test Scenarios

#### 1. User Registration & Login
```
Steps:
1. Navigate to http://localhost:3000
2. Click "Register" tab
3. Enter name, email, password
4. Click "Register"
Expected: Redirect to dashboard with welcome message

5. Logout
6. Click "Login" tab
7. Enter email and password
8. Click "Login"
Expected: Redirect to dashboard
```

#### 2. Create Career Analysis
```
Steps:
1. Click "New Analysis"
2. Select degree: "Computer Science"
3. Select skills: Python, JavaScript, Docker
4. Enter experience: 3
5. Click "Analyze Career Outcomes"
Expected: Redirect to results page with predictions
```

#### 3. View Results
```
Steps:
1. Check predicted career role
2. Verify probability percentage
3. Review skill gap analysis
4. Check alternative careers
Expected: All data displayed correctly with charts
```

#### 4. Download PDF
```
Steps:
1. On results page, click "Download Report"
Expected: PDF file downloads with complete analysis
```

#### 5. View History
```
Steps:
1. Navigate to Dashboard
2. View analysis cards
3. Click "View Details" on any analysis
Expected: Navigate to results page for that analysis
```

---

## Performance Testing

### Load Testing with Artillery

Install Artillery:
```bash
npm install -g artillery
```

Create `load-test.yml`:
```yaml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
  processor: "./processor.js"

scenarios:
  - name: "Create Analysis"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "token"
      - post:
          url: "/api/analysis"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            degree: "Computer Science"
            skills: ["Python", "JavaScript"]
            experience: 3
```

Run load test:
```bash
artillery run load-test.yml
```

---

## CI/CD Testing

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm test

  ml-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - run: cd ml-service && pip install -r requirements.txt
      - run: cd ml-service && pytest
```

---

## Test Coverage Goals

- Backend: > 80%
- Frontend: > 70%
- ML Service: > 85%
- Integration: Critical paths covered

---

## Continuous Testing

Run tests automatically:
```bash
# Backend - watch mode
cd backend
npm run test:watch

# Frontend - watch mode
cd frontend
npm test -- --watch

# ML Service - watch mode
cd ml-service
pytest-watch
```

---

**Happy Testing! 🧪**
