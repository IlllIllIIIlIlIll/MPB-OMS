#!/bin/bash
# Start all services: Frontend, Backend, and YOLO Modelling
# Usage: ./start-all.sh

echo "Starting TransJakarta OMS Complete System..."
echo "================================="

# Function to check if a service is responding
test_service_health() {
    local url=$1
    local service_name=$2
    local max_attempts=${3:-30}
    local delay_seconds=${4:-2}
    
    echo "Waiting for $service_name to be ready..."
    
    for ((i=1; i<=max_attempts; i++)); do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo "$service_name is ready!"
            return 0
        fi
        
        echo "Attempt $i/$max_attempts - $service_name not ready, waiting..."
        sleep $delay_seconds
    done
    
    echo "$service_name failed to start within expected time"
    return 1
}

# Function to stop all processes
stop_all_processes() {
    echo "Stopping all services..."
    
    # Stop Node.js processes (Frontend + Backend)
    pkill -f "node.*dev" 2>/dev/null || true
    
    # Stop Python processes (YOLO Modelling)
    pkill -f "python.*app.py" 2>/dev/null || true
    
    echo "All services stopped"
}

# Trap Ctrl+C to stop all processes
trap stop_all_processes INT TERM

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "Port $port is already in use"
        return 1
    fi
    return 0
}

# Check if ports are available
echo "Checking port availability..."
if ! check_port 3001 || ! check_port 3002 || ! check_port 8081; then
    echo "Some ports are already in use. Please stop other services first."
    exit 1
fi

# Step 1: Start Frontend + Backend
echo "Starting Frontend + Backend..."

# Start Backend
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Start Frontend
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Step 2: Wait for Frontend to be ready
if ! test_service_health "http://localhost:3002" "Frontend"; then
    echo "Frontend failed to start"
    stop_all_processes
    exit 1
fi

# Step 3: Wait for Backend to be ready
if ! test_service_health "http://localhost:3001/api/occupancy/now" "Backend API"; then
    echo "Backend failed to start"
    stop_all_processes
    exit 1
fi

echo "Frontend + Backend are running successfully!"
echo "   Frontend: http://localhost:3002"
echo "   Backend API: http://localhost:3001"

# Step 4: Start YOLO Modelling Service
echo "Starting YOLO Modelling Service..."

cd modelling
python app.py > ../modelling.log 2>&1 &
MODELLING_PID=$!
cd ..

# Step 5: Wait for YOLO service to be ready
if ! test_service_health "http://localhost:8081" "YOLO Modelling Service"; then
    echo "YOLO Modelling Service failed to start"
    stop_all_processes
    exit 1
fi

echo "YOLO Modelling Service is running!"
echo "   YOLO Service: http://localhost:8081"

# Step 6: All services ready!
echo ""
echo "ALL SERVICES RUNNING SUCCESSFULLY!"
echo "================================="
echo "Frontend: http://localhost:3002"
echo "Backend API: http://localhost:3001"
echo "YOLO Service: http://localhost:8081"
echo "YOLO API: http://localhost:8081/api/occupancy"
echo ""
echo "Quick Start:"
echo "1. Open http://localhost:3002 to see the bus display"
echo "2. Open http://localhost:8081 to start camera detection"
echo "3. Walk in front of camera to see real-time occupancy changes!"
echo ""
echo "Log files:"
echo "   Backend: backend.log"
echo "   Frontend: frontend.log"
echo "   YOLO: modelling.log"
echo ""
echo "Press Ctrl+C to stop all services..."

# Keep running until Ctrl+C
while true; do
    sleep 5
    
    # Health check - make sure all services are still running
    frontend_healthy=false
    backend_healthy=false
    modelling_healthy=false
    
    if curl -s -f "http://localhost:3002" > /dev/null 2>&1; then
        frontend_healthy=true
    fi
    
    if curl -s -f "http://localhost:3001/api/occupancy/now" > /dev/null 2>&1; then
        backend_healthy=true
    fi
    
    if curl -s -f "http://localhost:8081/api/health" > /dev/null 2>&1; then
        modelling_healthy=true
    fi
    
    if [ "$frontend_healthy" = false ] || [ "$backend_healthy" = false ] || [ "$modelling_healthy" = false ]; then
        echo "One or more services became unhealthy. Stopping..."
        break
    fi
done

stop_all_processes
