# TransJakarta OMS Web Frontend

## 🚀 Quick Start

### Start Everything (One Command)
```powershell
# For PowerShell
.\start.ps1

# For Command Prompt
start.bat
```

### Stop Everything
```powershell
# For PowerShell
.\stop.ps1

# For Command Prompt
docker-compose down (from project root)
```

## 📊 Access Your Dashboard

After running the start script, open your browser to:

- **🌐 Main Dashboard**: http://localhost:3002
- **🔧 Backend API**: http://localhost:3001
- **📊 Redis Commander**: http://localhost:8081  
- **🗄️ Database Admin**: http://localhost:8080
- **📡 MQTT Dashboard**: http://localhost:18083

## 🎯 What the Start Script Does

1. **Stops any conflicting services** (cleans up port conflicts)
2. **Starts backend services**:
   - PostgreSQL Database (port 5432)
   - Redis Cache & Streams (port 6379)
   - EMQX MQTT Broker (port 1883)
   - Backend API (port 3001)
   - Admin Tools (ports 8080, 8081)
3. **Starts Next.js frontend** (port 3002)

## 🔧 Manual Commands (if needed)

```powershell
# Start backend only
docker-compose up -d postgres redis emqx backend adminer redis-commander

# Start frontend only
npm run dev

# View logs
docker-compose logs backend
```

## 📱 Mobile App

The mobile app in `/mobile-app` directory runs separately and connects to the same backend services.

## 🛠️ Development

- Frontend runs on **Next.js 14** with hot reloading
- Backend runs in **Docker containers**
- Real-time updates via **Socket.io**
- Data storage in **Redis** and **PostgreSQL**
- MQTT messaging via **EMQX**
