@echo off
echo Starting ML Service...
start cmd /k "cd ml-service && venv\Scripts\activate && python app.py"

echo Starting Backend...
start cmd /k "cd backend && npm run dev"

echo Starting Frontend...
start cmd /k "cd frontend && npm start"

echo All services started! Close the individual windows to stop the servers.
