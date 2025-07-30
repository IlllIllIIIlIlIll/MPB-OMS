@echo off
setlocal enabledelayedexpansion

echo 🚀 TransJakarta OMS Setup Script
echo ==================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1,2 delims=." %%a in ('node --version') do set NODE_VERSION=%%a
set NODE_VERSION=%NODE_VERSION:~1%
if %NODE_VERSION% lss 18 (
    echo ❌ Node.js version 18+ is required. Current version: 
    node --version
    pause
    exit /b 1
)

echo ✅ Node.js detected
node --version

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not installed. Please install PostgreSQL 14+ first.
    echo    Download from https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo ✅ PostgreSQL detected

REM Check if database exists
echo 🔍 Checking database connection...
psql -U postgres -d tj_oms -c "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo 📝 Creating database 'tj_oms'...
    psql -U postgres -c "CREATE DATABASE tj_oms;" >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Failed to create database. Please check your PostgreSQL installation.
        pause
        exit /b 1
    )
)

echo ✅ Database 'tj_oms' is ready

REM Backend setup
echo.
echo 🔧 Setting up Backend...
cd backend

REM Install dependencies
echo 📦 Installing backend dependencies...
call npm install

REM Copy environment file
if not exist .env (
    echo 📝 Creating .env file...
    copy .env.example .env >nul
    echo ✅ .env file created. Please edit it with your database credentials.
) else (
    echo ✅ .env file already exists
)

REM Generate Prisma client
echo 🔧 Generating Prisma client...
call npm run prisma:generate

REM Push schema to database
echo 🗄️  Setting up database schema...
call npm run prisma:push

REM Seed database
echo 🌱 Seeding database with initial data...
call npm run seed

echo ✅ Backend setup complete!

REM Frontend setup
echo.
echo 🔧 Setting up Frontend...
cd ..\frontend

REM Install dependencies
echo 📦 Installing frontend dependencies...
call npm install

REM Copy environment file
if not exist .env.local (
    echo 📝 Creating .env.local file...
    copy .env.local.example .env.local >nul
    echo ✅ .env.local file created
) else (
    echo ✅ .env.local file already exists
)

echo ✅ Frontend setup complete!

REM Return to root
cd ..

echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo Next steps:
echo 1. Edit backend\.env with your database credentials
echo 2. Start the backend: cd backend ^&^& npm run dev
echo 3. Start the frontend: cd frontend ^&^& npm run dev
echo.
echo Default users (after seeding):
echo - Admin: username=admin, password=admin123
echo - Guard: username=guard, password=guard123
echo.
echo Backend will run on: http://localhost:3001
echo Frontend will run on: http://localhost:3002
echo.
echo Happy coding! 🚌
pause 