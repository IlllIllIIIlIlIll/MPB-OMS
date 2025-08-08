# TransJakarta Occupancy Management System (OMS)

A backend-heavy Occupancy Management System designed for TransJakarta operators to monitor real-time bus occupancy. The system integrates with edge devices (Jetson/RPi + Camera) that detect passenger movement and provides a simplified UI focused on displaying occupancy information prominently.

## 🚀 Complete Infrastructure

### High-Priority Components Implemented ✅

1. **MQTT Broker (EMQX)** - Real-time device communication
2. **Redis Streams** - Durable message processing
3. **BullMQ Workers** - Distributed job processing
4. **Docker Compose** - Complete infrastructure orchestration
5. **PostgreSQL + TimescaleDB** - Time-series data storage

### System Architecture

```
[Edge Device per Bus]
 Jetson/RPi + Camera → local IN/OUT → publishes occupancy events (JSON)

            │  MQTT or HTTPS (TLS)
            ▼
┌────────────────────────────────────────────────────────────────────┐
│                         Ingestion & Streams (Node)                 │
│  1) MQTT Broker (EMQX)  ← fallback HTTPS ingest (Express)        │
│  2) Ingest Service (Node): subscribe/validate/normalize           │
│  3) Persist to Redis Streams (XADD) for durable fan‑out           │
└────────────────────────────────────────────────────────────────────┘
            │                                  │
            │ (XREADGROUP)                     │ (XREADGROUP)
            ▼                                  ▼
┌───────────────────────────────┐     ┌───────────────────────────────┐
│ Realtime Aggregator           │     │ Recommendation & Hotspots     │
│ (Node workers, BullMQ)        │     │ (Node workers, BullMQ)        │
│ - dedupe, windowed reconcile  │     │ - per-demand recs             │
│ - upsert "now" cache          │     │ - periodic hotspot precompute │
└───────────────┬───────────────┘     └───────────────┬───────────────┘
                │                                     │
                ▼                                     ▼
       [Redis Cluster]                         [PostgreSQL/Timescale]
       - hot cache: occ:now:<bus_id>          - source of truth, history
       - Pub/Sub for UI pushes                - analytics & reports

                      ▲                                   │
                      │                                   │
               WebSocket/SSE                       Batch/retention jobs
                      │                                   │
                      ▼                                   ▼
            Next.js Frontend  ─────→  Node/Express API Gateway
                    (SSR/CSR)          (/occupancy, /map, /recommendation)
```

## 🏗️ Infrastructure Components

### 1. MQTT Broker (EMQX)
- **Port**: 1883 (MQTT), 8883 (MQTT/SSL), 8083 (WebSocket), 18083 (Dashboard)
- **Topics**: `/oms/v1/occupancy`, `/oms/v1/device/+/status`, `/oms/v1/device/+/heartbeat`
- **Features**: TLS support, authentication, message persistence

### 2. Redis Streams & Caching
- **Port**: 6379
- **Streams**: `stream:occupancy` for real-time processing
- **Cache**: `occ:now:<bus_id>` for current occupancy
- **Queues**: BullMQ for job processing

### 3. PostgreSQL Database
- **Port**: 5432
- **Database**: `tj_oms`
- **Extensions**: TimescaleDB for time-series optimization
- **Schema**: Bus codes, metadata, occupancy logs, devices

### 4. BullMQ Workers
- **Aggregator Worker**: Processes Redis streams, updates cache
- **Recommendation Worker**: Analyzes hotspots, generates recommendations
- **Scheduled Jobs**: Periodic analysis every 60 seconds

## 🚀 Quick Start with Docker

### Prerequisites
- **Docker** and **Docker Compose**
- **4GB RAM** minimum (8GB recommended)
- **10GB disk space**

### 1. Clone and Setup
```bash
git clone <repository-url>
cd MPB-OMS
```

### 2. Start Complete Infrastructure
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### 3. Initialize Database
```bash
# Run database migrations and seed data
docker-compose exec backend npm run db:push
docker-compose exec backend npm run db:seed
```

### 4. Access Services

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3002 | OMS Dashboard |
| **Backend API** | http://localhost:3001 | REST API |
| **MQTT Dashboard** | http://localhost:18083 | EMQX Management |
| **Redis Commander** | http://localhost:8081 | Redis Management |
| **Adminer** | http://localhost:8080 | Database Management |

### 5. Test Edge Device Integration
```bash
# Simulate edge device message
mosquitto_pub -h localhost -p 1883 -t "/oms/v1/occupancy" -m '{
  "bus_id": "TJ-0345",
  "bus_code": "TJ",
  "door_id": 1,
  "in_count": 3,
  "out_count": 1,
  "occupancy": 37,
  "ts_device": "2025-01-15T12:34:56Z",
  "device_id": "EDGE-A1B2",
  "fw_version": "1.7.3",
  "sig": "HMAC_SHA256_BASE64"
}'
```

## 🔧 Development Setup

### Local Development (without Docker)

#### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

#### 2. Setup Infrastructure
```bash
# Install Redis
# macOS: brew install redis
# Ubuntu: sudo apt-get install redis-server

# Install PostgreSQL
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Install MQTT Broker (EMQX)
# Download from: https://www.emqx.io/downloads
```

#### 3. Environment Variables
```bash
# Backend .env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/tj_oms"
REDIS_URL="redis://localhost:6379"
MQTT_URL="mqtt://localhost:1883"
JWT_SECRET="your-super-secret-jwt-key"
```

#### 4. Start Services
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Workers
cd backend
npm run worker:aggregator
npm run worker:recommendation
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Occupancy Management
- `GET /api/occupancy/now` - Get current occupancy for all active buses
- `GET /api/occupancy/:busId` - Get current occupancy for specific bus
- `GET /api/occupancy/:busId/history` - Get occupancy history for bus
- `POST /api/occupancy/ingest` - Ingest occupancy data from edge devices

### System Status
- `GET /health` - Health check with component status
- `GET /api/system/status` - Detailed system status

### MQTT Topics
- `/oms/v1/occupancy` - Occupancy events from edge devices
- `/oms/v1/device/{device_id}/status` - Device status updates
- `/oms/v1/device/{device_id}/heartbeat` - Device heartbeat

## 🔄 Data Flow

### 1. Edge Device → MQTT → Redis Streams
```json
{
  "bus_id": "TJ-0345",
  "bus_code": "TJ",
  "door_id": 1,
  "in_count": 3,
  "out_count": 1,
  "occupancy": 37,
  "ts_device": "2025-01-15T12:34:56Z",
  "device_id": "EDGE-A1B2",
  "fw_version": "1.7.3",
  "sig": "HMAC_SHA256_BASE64"
}
```

### 2. Redis Streams → BullMQ Workers
- **Aggregator Worker**: Processes streams, updates cache
- **Recommendation Worker**: Analyzes patterns, generates insights

### 3. Cache → Frontend
- **Redis Cache**: `occ:now:<bus_id>` for real-time data
- **WebSocket**: Real-time updates to UI

## 🐳 Docker Commands

### Management
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Access specific service
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d tj_oms
```

### Monitoring
```bash
# Check service health
docker-compose ps

# View resource usage
docker stats

# Check logs for specific service
docker-compose logs backend
docker-compose logs mqtt
```

## 🔍 Monitoring & Debugging

### MQTT Dashboard
- **URL**: http://localhost:18083
- **Default**: admin/public
- **Features**: Topic monitoring, message inspection, device management

### Redis Commander
- **URL**: http://localhost:8081
- **Features**: Stream inspection, cache management, key monitoring

### Database Management
- **URL**: http://localhost:8080
- **System**: PostgreSQL
- **Server**: postgres
- **Username**: postgres
- **Password**: postgres123
- **Database**: tj_oms

## 🚀 Production Deployment

### Environment Variables
```bash
# Production .env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/tj_oms
REDIS_URL=redis://host:6379
MQTT_URL=mqtt://host:1883
JWT_SECRET=your-production-secret
```

### Kubernetes Deployment
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods
kubectl get services
```

### Scaling
```bash
# Scale backend replicas
kubectl scale deployment oms-backend --replicas=3

# Scale workers
kubectl scale deployment oms-aggregator --replicas=2
kubectl scale deployment oms-recommendation --replicas=2
```

## 🔧 Troubleshooting

### Common Issues

1. **MQTT Connection Failed**
   ```bash
   # Check MQTT broker
   docker-compose logs mqtt
   
   # Test connection
   mosquitto_pub -h localhost -p 1883 -t "test" -m "hello"
   ```

2. **Redis Connection Failed**
   ```bash
   # Check Redis
   docker-compose logs redis
   
   # Test connection
   docker-compose exec redis redis-cli ping
   ```

3. **Database Connection Failed**
   ```bash
   # Check PostgreSQL
   docker-compose logs postgres
   
   # Test connection
   docker-compose exec postgres psql -U postgres -d tj_oms -c "SELECT 1"
   ```

4. **Workers Not Processing**
   ```bash
   # Check worker logs
   docker-compose logs backend
   
   # Check Redis streams
   docker-compose exec redis redis-cli XINFO STREAM stream:occupancy
   ```

## 📈 Performance Metrics

### Expected Performance
- **Latency**: < 100ms for API responses
- **Throughput**: 1000+ messages/second
- **Concurrent Users**: 100+ simultaneous connections
- **Data Retention**: 6 months detailed, 2 years aggregated

### Monitoring
- **Health Checks**: All services have health endpoints
- **Metrics**: Prometheus metrics available
- **Logging**: Structured logging with correlation IDs
- **Alerts**: High occupancy, device offline, system errors

## 🔐 Security

### Authentication
- **JWT Tokens**: For API access
- **Device Signatures**: HMAC-SHA256 for edge devices
- **MQTT Authentication**: Username/password for devices

### Network Security
- **TLS/SSL**: For all external communications
- **Firewall**: Port restrictions and network isolation
- **VPN**: For remote device management

## 📚 Next Steps

### Phase 2: Kubernetes Deployment
- [ ] Kubernetes manifests
- [ ] Helm charts
- [ ] Service mesh (Istio)
- [ ] Horizontal pod autoscaling

### Phase 3: Apache Airflow
- [ ] DAGs for batch processing
- [ ] Data retention policies
- [ ] Analytics pipelines
- [ ] ETL workflows

### Phase 4: Advanced Monitoring
- [ ] Prometheus metrics
- [ ] Grafana dashboards
- [ ] ELK stack for logging
- [ ] Alert management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
