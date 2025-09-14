@echo off
echo Starting Aithenos Development Servers with Backup System...
echo.

echo Starting Backend Server on port 3001...
start "Backend Server" cmd /k "npx tsx server/index.ts"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server on port 5173...
start "Frontend Server" cmd /k "npx vite --port 5173"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo Adaptive Learning: http://localhost:5173/adaptive-learning
echo.
echo Backup System Features:
echo - Auto-generates questions when original has no choices
echo - Uses OpenAI to create new questions for missing topics
echo - Fallback system ensures all questions have 4 choices
echo.
echo Press any key to exit...
pause > nul
