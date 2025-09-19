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
    Write-Host "Checking URL: $Url" -ForegroundColor Gray
    
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        try {
            Write-Host "Attempt $i/$MaxAttempts - Testing $Url..." -ForegroundColor Gray
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
            Write-Host "Response Status: $($response.StatusCode)" -ForegroundColor Gray
            if ($response.StatusCode -eq 200) {
                Write-Host "$ServiceName is ready!" -ForegroundColor Green
                return $true
            }
        }
        catch {
            Write-Host "Error on attempt $i`: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Full error: $($_.Exception)" -ForegroundColor DarkRed
        }
        
        Write-Host "Attempt $i/$MaxAttempts - $ServiceName not ready, waiting..." -ForegroundColor Yellow
        
        # Enhanced debugging for YOLO service
        if ($ServiceName -eq "YOLO Modelling Service") {
            Write-Host "YOLO Service Debug Info:" -ForegroundColor Cyan
            
            # Check job status
            $yoloJob = Get-Job -Name "ModellingJob" -ErrorAction SilentlyContinue
            if ($yoloJob) {
                Write-Host "  - Job State: $($yoloJob.State)" -ForegroundColor Gray
                Write-Host "  - Job HasMoreData: $($yoloJob.HasMoreData)" -ForegroundColor Gray
                
                # Show job output if available
                if ($yoloJob.HasMoreData) {
                    Write-Host "  - Job output:" -ForegroundColor Gray
                    $jobOutput = Receive-Job -Name "ModellingJob" -Keep
                    foreach ($line in $jobOutput) {
                        Write-Host "    $line" -ForegroundColor DarkGray
                    }
                }
            } else {
                Write-Host "  - YOLO job not found" -ForegroundColor Red
            }
            
            Write-Host "  - Checking if Python process is running..." -ForegroundColor Gray
            $pythonProcesses = Get-Process python -ErrorAction SilentlyContinue
            if ($pythonProcesses) {
                Write-Host "  - Found $($pythonProcesses.Count) Python process(es)" -ForegroundColor Green
                foreach ($proc in $pythonProcesses) {
                    Write-Host "    PID: $($proc.Id), CPU: $($proc.CPU), Memory: $([math]::Round($proc.WorkingSet/1MB, 2))MB" -ForegroundColor Gray
                }
            } else {
                Write-Host "  - No Python processes found" -ForegroundColor Red
            }
            
            Write-Host "  - Checking if port 8081 is listening..." -ForegroundColor Gray
            $port8081 = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
            if ($port8081) {
                Write-Host "  - Port 8081 is listening (State: $($port8081.State))" -ForegroundColor Green
            } else {
                Write-Host "  - Port 8081 is not listening" -ForegroundColor Red
            }
            
            Write-Host "  - Testing basic connectivity..." -ForegroundColor Gray
            try {
                $testConnection = Test-NetConnection -ComputerName localhost -Port 8081 -InformationLevel Quiet
                if ($testConnection) {
                    Write-Host "  - Port 8081 is reachable" -ForegroundColor Green
                } else {
                    Write-Host "  - Port 8081 is not reachable" -ForegroundColor Red
                }
            } catch {
                Write-Host "  - Port test failed: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
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
    Write-Host "Final debug info for $ServiceName`:" -ForegroundColor Red
    Write-Host "  - URL tested: $Url" -ForegroundColor Red
    Write-Host "  - Max attempts: $MaxAttempts" -ForegroundColor Red
    Write-Host "  - Delay between attempts: $DelaySeconds seconds" -ForegroundColor Red
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
    Set-Location "apps\api"
    Start-Job -ScriptBlock { 
        Set-Location $using:PWD
        npm run dev 
    } -Name "BackendJob"
    Set-Location "..\.."
    
    # Start Frontend
    Write-Host "Starting Frontend..." -ForegroundColor Blue
    Set-Location "apps\web"
    Start-Job -ScriptBlock { 
        Set-Location $using:PWD
        npm run dev 
    } -Name "FrontendJob"
    Set-Location "..\.."
    
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
    
    # Check if the YOLO service directory and file exist
    $yoloDir = "services\ai-modelling"
    $yoloFile = "services\ai-modelling\simple_app.py"
    
    Write-Host "Checking YOLO service setup..." -ForegroundColor Gray
    if (Test-Path $yoloDir) {
        Write-Host "  - YOLO directory exists: $yoloDir" -ForegroundColor Green
    } else {
        Write-Host "  - YOLO directory missing: $yoloDir" -ForegroundColor Red
        throw "YOLO service directory not found"
    }
    
    if (Test-Path $yoloFile) {
        Write-Host "  - YOLO service file exists: $yoloFile" -ForegroundColor Green
    } else {
        Write-Host "  - YOLO service file missing: $yoloFile" -ForegroundColor Red
        throw "YOLO service file not found"
    }
    
    # Check if Python is available
    Write-Host "Checking Python availability..." -ForegroundColor Gray
    try {
        $pythonVersion = python --version 2>&1
        Write-Host "  - Python version: $pythonVersion" -ForegroundColor Green
    } catch {
        Write-Host "  - Python not found or not in PATH" -ForegroundColor Red
        throw "Python is not available"
    }
    
    # Check if Flask is available
    Write-Host "Checking Flask availability..." -ForegroundColor Gray
    try {
        $flaskCheck = python -c "import flask; print('Flask available')" 2>&1
        Write-Host "  - $flaskCheck" -ForegroundColor Green
    } catch {
        Write-Host "  - Flask not available: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  - Installing Flask..." -ForegroundColor Yellow
        try {
            pip install flask
            Write-Host "  - Flask installed successfully" -ForegroundColor Green
        } catch {
            Write-Host "  - Failed to install Flask: $($_.Exception.Message)" -ForegroundColor Red
            throw "Flask installation failed"
        }
    }
    
    Set-Location $yoloDir
    Write-Host "Starting YOLO service from: $(Get-Location)" -ForegroundColor Gray
    Start-Job -ScriptBlock { 
        Set-Location $using:PWD
        Write-Host "YOLO Job: Starting from $(Get-Location)" -ForegroundColor Gray
        Write-Host "YOLO Job: Running python simple_app.py" -ForegroundColor Gray
        python simple_app.py 
    } -Name "ModellingJob"
    Set-Location "..\.."
    
    Write-Host "YOLO service job started. Job details:" -ForegroundColor Gray
    $yoloJob = Get-Job -Name "ModellingJob"
    Write-Host "  - Job ID: $($yoloJob.Id)" -ForegroundColor Gray
    Write-Host "  - Job State: $($yoloJob.State)" -ForegroundColor Gray
    Write-Host "  - Job HasMoreData: $($yoloJob.HasMoreData)" -ForegroundColor Gray
    
    # Show any initial output from the job
    if ($yoloJob.HasMoreData) {
        Write-Host "YOLO Job initial output:" -ForegroundColor Cyan
        $jobOutput = Receive-Job -Name "ModellingJob" -Keep
        foreach ($line in $jobOutput) {
            Write-Host "  $line" -ForegroundColor Gray
        }
    }
    
    # Step 5: Wait for YOLO service to be ready
    if (-not (Test-ServiceHealth -Url "http://localhost:8081/api/health" -ServiceName "YOLO Modelling Service")) {
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
        
        # Only check if services are responding, don't stop if one fails
        if (-not $frontendHealthy) {
            Write-Host "⚠️ Frontend not responding" -ForegroundColor Yellow
        }
        if (-not $backendHealthy) {
            Write-Host "⚠️ Backend not responding" -ForegroundColor Yellow
        }
        if (-not $modellingHealthy) {
            Write-Host "⚠️ YOLO service not responding" -ForegroundColor Yellow
        }
        
        # Only stop if ALL services are down
        if (-not $frontendHealthy -and -not $backendHealthy -and -not $modellingHealthy) {
            Write-Host "All services are down. Stopping..." -ForegroundColor Red
            throw "All services are down"
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
