@echo off
echo Starting Tri Thuc Vang Development Server...
echo.
echo If you see any errors about NODE_ENV, that's normal on Windows.
echo The application will still work correctly.
echo.
echo Starting server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
npx tsx server/index.ts
pause