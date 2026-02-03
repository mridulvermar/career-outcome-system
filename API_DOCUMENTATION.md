# API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Auth Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

---

### Login User
**POST** `/auth/login`

Login to existing account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### Get Current User
**GET** `/auth/me`

Get currently authenticated user's information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Analysis Endpoints

### Create Analysis
**POST** `/analysis`

Create a new career analysis.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "degree": "Computer Science",
  "skills": ["Python", "JavaScript", "SQL", "Docker"],
  "experience": 3,
  "interests": ["Software Development", "Machine Learning"],
  "education": "Bachelor's",
  "certifications": ["AWS Certified"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "inputData": {
      "degree": "Computer Science",
      "skills": ["Python", "JavaScript", "SQL", "Docker"],
      "experience": 3
    },
    "prediction": {
      "careerRole": "Software Engineer",
      "probability": 0.85,
      "confidence": "High",
      "salaryRange": {
        "min": 90000,
        "max": 150000,
        "average": 120000,
        "currency": "USD"
      },
      "alternativeCareers": [
        {
          "role": "Data Scientist",
          "probability": 0.72,
          "matchScore": 72
        }
      ]
    },
    "skillGap": {
      "matchingSkills": ["Python", "SQL"],
      "missingSkills": [
        {
          "skill": "React",
          "importance": "Critical",
          "impactOnSuccess": 20
        }
      ],
      "recommendedSkills": [
        {
          "skill": "Kubernetes",
          "reason": "Essential for Software Engineer role",
          "priority": 5
        }
      ],
      "overallMatch": 75
    },
    "insights": {
      "marketDemand": "High",
      "growthPotential": "High",
      "recommendations": [
        "Focus on acquiring React and Kubernetes",
        "Build a portfolio of projects"
      ],
      "industryTrends": [
        "AI and ML integration is trending",
        "Cloud computing skills in high demand"
      ]
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Get Analysis History
**GET** `/analysis?page=1&limit=10`

Get user's analysis history with pagination.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "prediction": {
        "careerRole": "Software Engineer",
        "probability": 0.85
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### Get Analysis by ID
**GET** `/analysis/:id`

Get a specific analysis by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    // Full analysis object (same as create response)
  }
}
```

---

### Delete Analysis
**DELETE** `/analysis/:id`

Delete an analysis by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Analysis deleted successfully"
}
```

---

### Compare Careers
**POST** `/analysis/compare`

Compare two career paths.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "career1": {
    "role": "Software Engineer",
    "avgSalary": 95000,
    "growthRate": "15%",
    "skills": ["JavaScript", "React", "Node.js"]
  },
  "career2": {
    "role": "Data Scientist",
    "avgSalary": 110000,
    "growthRate": "18%",
    "skills": ["Python", "Machine Learning", "Statistics"]
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "comparison": {
      "career1": {
        "role": "Software Engineer",
        "avgSalary": 95000,
        "growthRate": "15%",
        "requiredSkills": ["JavaScript", "React", "Node.js"]
      },
      "career2": {
        "role": "Data Scientist",
        "avgSalary": 110000,
        "growthRate": "18%",
        "requiredSkills": ["Python", "Machine Learning", "Statistics"]
      },
      "insights": {
        "salaryDifference": 15000,
        "betterGrowth": "Data Scientist",
        "recommendation": "Both careers show strong potential..."
      }
    }
  }
}
```

---

### Download PDF Report
**GET** `/analysis/:id/report`

Download analysis as PDF report.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename=career-analysis-{id}.pdf`
- Body: PDF file binary data

---

## ML Service Endpoints

### Health Check
**GET** `/health`

Check ML service health.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "model_loaded": true
}
```

---

### Get Prediction
**POST** `/predict`

Get career prediction from ML model.

**Request Body:**
```json
{
  "degree": "Computer Science",
  "skills": ["Python", "JavaScript", "SQL"],
  "experience": 3,
  "interests": ["Software Development"],
  "education": "Bachelor's",
  "certifications": []
}
```

**Response (200):**
```json
{
  "prediction": {
    "careerRole": "Software Engineer",
    "probability": 0.85,
    "confidence": "High",
    "salaryRange": {
      "min": 90000,
      "max": 150000,
      "average": 120000
    }
  },
  "skillGap": {
    "matchingSkills": ["Python", "SQL"],
    "missingSkills": [...],
    "overallMatch": 75
  },
  "insights": {
    "marketDemand": "High",
    "growthPotential": "High",
    "recommendations": [...]
  }
}
```

---

### Get Available Skills
**GET** `/skills`

Get list of all available skills in the system.

**Response (200):**
```json
{
  "skills": [
    "Python",
    "JavaScript",
    "Java",
    "SQL",
    "Docker",
    "Kubernetes",
    "React",
    "Machine Learning",
    ...
  ]
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Detailed error message"
}
```

---

## Rate Limiting

API endpoints are rate limited to:
- **100 requests per 15 minutes** per IP address

When rate limit is exceeded:
```json
{
  "message": "Too many requests, please try again later."
}
```

---

## Best Practices

1. **Always include Authorization header** for protected routes
2. **Handle errors gracefully** on the client side
3. **Implement retry logic** for failed requests
4. **Cache responses** where appropriate
5. **Validate input** before sending to API
6. **Use pagination** for list endpoints

---

## Example Usage (JavaScript)

```javascript
// Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { token } = await loginResponse.json();

// Create Analysis
const analysisResponse = await fetch('http://localhost:5000/api/analysis', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    degree: 'Computer Science',
    skills: ['Python', 'JavaScript'],
    experience: 3
  })
});
const analysis = await analysisResponse.json();
```
