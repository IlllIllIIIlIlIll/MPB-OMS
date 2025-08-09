# TransJakarta OMS Frontend Startup Script
# This script starts all backend services and the web frontend

Write-Host "🚀 Starting TransJakarta OMS Web Interface..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Navigate to project root
cd ..

Write-Host "🛑 Stopping any conflicting frontend containers..." -ForegroundColor Yellow
docker-compose stop frontend 2>$null
docker-compose rm -f frontend 2>$null

Write-Host "🔧 Starting backend services..." -ForegroundColor Cyan
Write-Host "   - PostgreSQL Database" -ForegroundColor Gray
Write-Host "   - Redis Cache and Streams" -ForegroundColor Gray
Write-Host "   - EMQX MQTT Broker" -ForegroundColor Gray
Write-Host "   - Backend API" -ForegroundColor Gray
Write-Host "   - Admin Tools (Redis Commander, Adminer)" -ForegroundColor Gray

docker-compose up -d postgres redis emqx backend adminer redis-commander

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend services started successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start backend services!" -ForegroundColor Red
    exit 1
}

Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Go back to frontend directory
cd frontend

Write-Host "🌐 Starting Next.js development server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Your dashboard will be available at:" -ForegroundColor Green
Write-Host "   🔗 Frontend: http://localhost:3002" -ForegroundColor White
Write-Host "   🔗 Backend API: http://localhost:3001" -ForegroundColor White
Write-Host "   🔗 Redis Commander: http://localhost:8081" -ForegroundColor White
Write-Host "   🔗 Database Admin: http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the frontend (backend will keep running)" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Green

# Start the frontend development server
npm run dev
