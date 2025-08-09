@echo off
REM TransJakarta OMS Frontend Startup Script
REM This script starts all backend services and the web frontend

echo 🚀 Starting TransJakarta OMS Web Interface...
echo =================================

REM Navigate to project root
cd ..

echo 🛑 Stopping any conflicting frontend containers...
docker-compose stop frontend >nul 2>&1
docker-compose rm -f frontend >nul 2>&1

echo 🔧 Starting backend services...
echo    - PostgreSQL Database
echo    - Redis Cache ^& Streams
echo    - EMQX MQTT Broker
echo    - Backend API
echo    - Admin Tools (Redis Commander, Adminer)

docker-compose up -d postgres redis emqx backend adminer redis-commander

if %errorlevel% neq 0 (
    echo ❌ Failed to start backend services!
    pause
    exit /b 1
)

echo ✅ Backend services started successfully!
echo ⏳ Waiting for services to be ready...
timeout /t 5 /nobreak >nul

REM Go back to frontend directory
cd frontend

echo 🌐 Starting Next.js development server...
echo.
echo 📊 Your dashboard will be available at:
echo    🔗 Frontend: http://localhost:3002
echo    🔗 Backend API: http://localhost:3001
echo    🔗 Redis Commander: http://localhost:8081
echo    🔗 Database Admin: http://localhost:8080
echo.
echo Press Ctrl+C to stop the frontend (backend will keep running)
echo =================================

REM Start the frontend development server
npm run dev
