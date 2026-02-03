#!/bin/bash

echo "================================="
echo "Career Outcome Analysis System"
echo "Quick Start Setup"
echo "================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js v16+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python is not installed. Please install Python 3.8+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python found: $(python3 --version)${NC}"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠ MongoDB not found in PATH. Make sure it's installed and running${NC}"
else
    echo -e "${GREEN}✓ MongoDB found${NC}"
fi

echo ""
echo "================================="
echo "Installing Dependencies"
echo "================================="

# Backend
echo ""
echo "📦 Installing Backend dependencies..."
cd backend
npm install
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created backend .env file${NC}"
fi
cd ..

# ML Service
echo ""
echo "🤖 Installing ML Service dependencies..."
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
echo ""
echo "🔨 Training ML model..."
python train_model.py
deactivate
cd ..

# Frontend
echo ""
echo "⚛️ Installing Frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "================================="
echo "✅ Setup Complete!"
echo "================================="
echo ""
echo "To run the application:"
echo ""
echo "1. Start MongoDB (if not running):"
echo "   ${YELLOW}mongod${NC}"
echo ""
echo "2. Start Backend (Terminal 1):"
echo "   ${YELLOW}cd backend && npm run dev${NC}"
echo ""
echo "3. Start ML Service (Terminal 2):"
echo "   ${YELLOW}cd ml-service && source venv/bin/activate && python app.py${NC}"
echo ""
echo "4. Start Frontend (Terminal 3):"
echo "   ${YELLOW}cd frontend && npm start${NC}"
echo ""
echo "Then visit: ${GREEN}http://localhost:3000${NC}"
echo ""
echo "For detailed documentation, see README.md"
echo ""
