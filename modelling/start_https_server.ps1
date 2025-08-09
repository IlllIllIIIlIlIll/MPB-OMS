#!/usr/bin/env powershell

Write-Host "Starting MPB-OMS Crowd Counter with HTTPS..." -ForegroundColor Green
Write-Host ""

# Change to the modelling directory
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Found: $pythonVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Python is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Generate SSL certificate if it doesn't exist
if (-not (Test-Path "certs\cert.pem")) {
    Write-Host "Generating SSL certificate..." -ForegroundColor Yellow
    python scripts\generate_ssl_cert.py
    Write-Host ""
}

# Start the HTTPS server
Write-Host "Starting HTTPS server on port 5000..." -ForegroundColor Green
Write-Host "Access the app at: " -NoNewline -ForegroundColor White
Write-Host "https://192.168.1.113:5000/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Your browser will show a security warning for the self-signed certificate." -ForegroundColor Yellow
Write-Host "Click 'Advanced' and 'Proceed to 192.168.1.113 (unsafe)' to continue." -ForegroundColor Yellow
Write-Host ""

python scripts\modeling.py --mode server --port 5000 --ssl

Read-Host "Press Enter to exit"
