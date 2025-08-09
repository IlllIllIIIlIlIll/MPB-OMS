#!/usr/bin/env pwsh
# Start all services: Frontend, Backend, and YOLO Modelling
# Usage: .\start-all.ps1

Write-Host "Starting TransJakarta OMS Complete System..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Function to check if a service is responding
function Test-ServiceHealth {
    param(
        [string]$Url,
        [string]$ServiceName,
        [int]$MaxAttempts = 15,
        [int]$DelaySeconds = 1
    )
    
    Write-Host "Waiting for $ServiceName to be ready..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "$ServiceName is ready!" -ForegroundColor Green
                return $true
            }
        }
        catch {
            # Service not ready yet
        }
        
        Write-Host "Attempt $i/$MaxAttempts - $ServiceName not ready, waiting..." -ForegroundColor Yellow
        
        # If checking backend API, also show recent logs
        if ($ServiceName -eq "Backend API" -and (Test-Path "backend.log")) {
            Write-Host "Backend logs (last 3 lines):" -ForegroundColor Gray
            try {
                $logs = Get-Content "backend.log" -Tail 3 -ErrorAction SilentlyContinue
                foreach ($log in $logs) {
                    Write-Host "  $log" -ForegroundColor Gray
                }
            } catch {
                Write-Host "  Could not read backend logs" -ForegroundColor Gray
            }
            Write-Host ""
        }
        
        Start-Sleep -Seconds $DelaySeconds
    }
    
    Write-Host "$ServiceName failed to start within expected time" -ForegroundColor Red
    return $false
}

# Function to stop all processes
function Stop-AllProcesses {
    Write-Host "Stopping all services..." -ForegroundColor Red
    
    # Stop Node.js processes (Frontend + Backend)
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Stop Python processes (YOLO Modelling)
    Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "python" } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "All services stopped" -ForegroundColor Red
}

# Cleanup function for Ctrl+C
Register-ObjectEvent -InputObject ([System.Console]) -EventName CancelKeyPress -Action {
    Stop-AllProcesses
    exit 0
}

try {
    # Step 1: Start Frontend + Backend
    Write-Host "Starting Frontend + Backend..." -ForegroundColor Blue
    
    # Start Backend first
    Write-Host "Starting Backend..." -ForegroundColor Blue
    Set-Location "backend"
    Start-Job -ScriptBlock { 
        Set-Location $using:PWD
        npm run dev 
    } -Name "BackendJob"
    Set-Location ".."
    
    # Start Frontend
    Write-Host "Starting Frontend..." -ForegroundColor Blue
    Set-Location "frontend"
    Start-Job -ScriptBlock { 
        Set-Location $using:PWD
        npm run dev 
    } -Name "FrontendJob"
    Set-Location ".."
    
    # Step 2: Wait for Frontend to be ready
    if (-not (Test-ServiceHealth -Url "http://localhost:3002" -ServiceName "Frontend")) {
        throw "Frontend failed to start"
    }
    
    # Step 3: Wait for Backend to be ready
    if (-not (Test-ServiceHealth -Url "http://localhost:3001/api/occupancy/now" -ServiceName "Backend API")) {
        throw "Backend failed to start"
    }
    
    Write-Host "Frontend + Backend are running successfully!" -ForegroundColor Green
    Write-Host "   Frontend: http://localhost:3002" -ForegroundColor White
    Write-Host "   Backend API: http://localhost:3001" -ForegroundColor White
    
    # Step 4: Start YOLO Modelling Service
    Write-Host "Starting YOLO Modelling Service..." -ForegroundColor Blue
    
    Set-Location "modelling"
    Start-Job -ScriptBlock { 
        Set-Location $using:PWD
        python app.py 
    } -Name "ModellingJob"
    Set-Location ".."
    
    # Step 5: Wait for YOLO service to be ready
    if (-not (Test-ServiceHealth -Url "http://localhost:8081" -ServiceName "YOLO Modelling Service")) {
        throw "YOLO Modelling Service failed to start"
    }
    
    Write-Host "YOLO Modelling Service is running!" -ForegroundColor Green
    Write-Host "   YOLO Service: http://localhost:8081" -ForegroundColor White
    
    # Step 6: All services ready!
    Write-Host ""
    Write-Host "ALL SERVICES RUNNING SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Green
    Write-Host "Frontend: http://localhost:3002" -ForegroundColor Cyan
    Write-Host "Backend API: http://localhost:3001" -ForegroundColor Cyan  
    Write-Host "YOLO Service: http://localhost:8081" -ForegroundColor Cyan
    Write-Host "YOLO API: http://localhost:8081/api/occupancy" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Quick Start:" -ForegroundColor Yellow
    Write-Host "1. Open http://localhost:3002 to see the bus display" -ForegroundColor White
    Write-Host "2. Open http://localhost:8081 to start camera detection" -ForegroundColor White
    Write-Host "3. Walk in front of camera to see real-time occupancy changes!" -ForegroundColor White
    Write-Host ""
    Write-Host "Press Ctrl+C to stop all services..." -ForegroundColor Yellow
    
    # Keep running until Ctrl+C
    while ($true) {
        Start-Sleep -Seconds 5
        
        # Health check - make sure all services are still running
        $frontendHealthy = $false
        $backendHealthy = $false
        $modellingHealthy = $false
        
        try {
            $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3002" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
            if ($frontendResponse.StatusCode -eq 200) { $frontendHealthy = $true }
        } catch { }
        
        try {
            $backendResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/occupancy/now" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
            if ($backendResponse.StatusCode -eq 200) { $backendHealthy = $true }
        } catch { }
        
        try {
            $modellingResponse = Invoke-WebRequest -Uri "http://localhost:8081/api/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
            if ($modellingResponse.StatusCode -eq 200) { $modellingHealthy = $true }
        } catch { }
        
        if (-not $frontendHealthy -or -not $backendHealthy -or -not $modellingHealthy) {
            Write-Host "One or more services became unhealthy. Stopping..." -ForegroundColor Yellow
            throw "Service health check failed"
        }
    }
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Stop-AllProcesses
    exit 1
}
finally {
    Stop-AllProcesses
}
