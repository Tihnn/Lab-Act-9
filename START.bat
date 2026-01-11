@echo off
echo ========================================
echo   BikeShop E-Commerce System
echo ========================================
echo.
echo This will start both backend and frontend servers.
echo Make sure MySQL is running and database 'activity9_db' exists!
echo.
pause
echo.
echo Starting Backend Server...
cd backend
start "BikeShop Backend" cmd /k "npm run start:dev"
cd..
echo Backend started on http://localhost:3001
echo.
timeout /t 5
echo.
echo Starting Frontend Application...
cd frontend
start "BikeShop Frontend" cmd /k "npm start"
cd..
echo Frontend will open on http://localhost:3000
echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo To seed the database with sample products:
echo Run: npm run seed
echo.
pause
