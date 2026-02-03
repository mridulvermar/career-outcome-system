# 🚀 Quick Start Reference

## One-Command Setup (Linux/Mac)
```bash
chmod +x setup.sh && ./setup.sh
```

## Manual Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npm run dev
```

### 2. ML Service
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python train_model.py
python app.py
```

### 3. Frontend
```bash
cd frontend
npm install
npm start
```

### 4. MongoDB
```bash
mongod
# Or if installed as service, it should already be running
```

## Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **ML Service**: http://localhost:5001
- **MongoDB**: mongodb://localhost:27017

## Default Test User
```
Email: test@example.com
Password: password123
```

## Common Commands

### Check Service Status
```bash
# Backend
curl http://localhost:5000/api/health

# ML Service
curl http://localhost:5001/api/health

# MongoDB
mongosh
```

### View Logs
```bash
# Backend (if using PM2)
pm2 logs career-backend

# Docker
docker-compose logs -f
```

### Reset Everything
```bash
# Stop all services
# Delete node_modules, venv, build folders
# Run setup.sh again
```

## Quick API Test
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Create Analysis (replace TOKEN)
curl -X POST http://localhost:5000/api/analysis \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"degree":"Computer Science","skills":["Python"],"experience":3}'
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Kill process: `lsof -ti:5000 \| xargs kill -9` |
| MongoDB not connecting | Check if running: `mongosh` |
| CORS errors | Verify CORS_ORIGIN in .env matches frontend URL |
| ML model not found | Run: `cd ml-service && python train_model.py` |
| Dependencies error | Delete node_modules, run `npm install` |

## File Structure Overview
```
career-outcome-system/
├── backend/           # Express API (Port 5000)
├── ml-service/        # Flask ML API (Port 5001)
├── frontend/          # React App (Port 3000)
├── README.md          # Full documentation
├── setup.sh           # Auto-setup script
└── docker-compose.yml # Docker deployment
```

## Key Technologies
- **Frontend**: React + Material-UI + Recharts
- **Backend**: Node.js + Express + MongoDB
- **ML**: Python + Flask + Scikit-learn
- **Auth**: JWT tokens
- **Database**: MongoDB

## Essential Documentation
- 📖 **README.md** - Complete setup guide
- 🔌 **API_DOCUMENTATION.md** - API reference
- 🚀 **DEPLOYMENT.md** - Production deployment
- 🧪 **TESTING.md** - Testing guide
- 📊 **PROJECT_SUMMARY.md** - Feature overview

## Support
- GitHub Issues: Report bugs
- Email: support@careeranalysis.com
- Documentation: All .md files in root

---
**Version 1.0.0** | Built with MERN + ML | MIT License
