# TransJakarta OMS Stop Script
# This script stops all services

Write-Host "🛑 Stopping TransJakarta OMS Services..." -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Red

# Navigate to project root
cd ..

Write-Host "🔧 Stopping all Docker services..." -ForegroundColor Yellow
docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All services stopped successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Some services may still be running!" -ForegroundColor Red
}

Write-Host "=================================" -ForegroundColor Red
Write-Host "All TransJakarta OMS services have been stopped." -ForegroundColor Green
pause
