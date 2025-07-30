#!/bin/bash

# TransJakarta OMS Setup Script
# This script will help you set up the entire project

set -e

echo "🚀 TransJakarta OMS Setup Script"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 14+ first."
    echo "   Windows: Download from https://www.postgresql.org/download/windows/"
    echo "   macOS: brew install postgresql"
    echo "   Linux: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

echo "✅ PostgreSQL detected"

# Check if database exists
echo "🔍 Checking database connection..."
if ! psql -U postgres -d tj_oms -c "SELECT 1;" &> /dev/null; then
    echo "📝 Creating database 'tj_oms'..."
    psql -U postgres -c "CREATE DATABASE tj_oms;" || {
        echo "❌ Failed to create database. Please check your PostgreSQL installation."
        exit 1
    }
fi

echo "✅ Database 'tj_oms' is ready"

# Backend setup
echo ""
echo "🔧 Setting up Backend..."
cd backend

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your database credentials."
else
    echo "✅ .env file already exists"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run prisma:generate

# Push schema to database
echo "🗄️  Setting up database schema..."
npm run prisma:push

# Seed database
echo "🌱 Seeding database with initial data..."
npm run seed

echo "✅ Backend setup complete!"

# Frontend setup
echo ""
echo "🔧 Setting up Frontend..."
cd ../frontend

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Copy environment file
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.local.example .env.local
    echo "✅ .env.local file created"
else
    echo "✅ .env.local file already exists"
fi

echo "✅ Frontend setup complete!"

# Return to root
cd ..

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your database credentials"
echo "2. Start the backend: cd backend && npm run dev"
echo "3. Start the frontend: cd frontend && npm run dev"
echo ""
echo "Default users (after seeding):"
echo "- Admin: username=admin, password=admin123"
echo "- Guard: username=guard, password=guard123"
echo ""
echo "Backend will run on: http://localhost:3001"
echo "Frontend will run on: http://localhost:3002"
echo ""
echo "Happy coding! 🚌" 