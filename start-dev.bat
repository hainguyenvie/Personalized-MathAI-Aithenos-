@echo off
echo Starting Aithenos Development Servers...
echo.

echo Starting Backend Server on port 3001...
start "Backend Server" cmd /k "npx tsx server/index.ts"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server on port 5173...
start "Frontend Server" cmd /k "cd client && npx vite --port 5173"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo Adaptive Learning: http://localhost:5173/adaptive-learning
echo.
echo Press any key to exit...
pause > nul
