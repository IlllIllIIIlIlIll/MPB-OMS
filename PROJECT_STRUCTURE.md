# 🏗️ **TransJakarta OMS - Project Structure**

## 📁 **Clean Project Organization**

```
MPB-OMS/
├── 📱 apps/                          # Applications
│   ├── web/                          # Next.js Web Application
│   │   ├── app/                      # App Router (Next.js 13+)
│   │   ├── components/               # Reusable UI Components
│   │   ├── lib/                      # Utilities & Configurations
│   │   ├── hooks/                    # Custom React Hooks
│   │   ├── public/                   # Static Assets
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   ├── mobile/                       # React Native Mobile App
│   │   ├── src/
│   │   │   ├── components/           # Mobile UI Components
│   │   │   ├── screens/              # App Screens
│   │   │   ├── services/             # API Services
│   │   │   ├── types/                # TypeScript Types
│   │   │   └── utils/                # Utilities
│   │   ├── assets/                   # Mobile Assets
│   │   ├── app.json
│   │   └── package.json
│   │
│   └── api/                          # Backend API Server
│       ├── src/
│       │   ├── routes/               # API Routes
│       │   ├── services/             # Business Logic
│       │   ├── middleware/           # Express Middleware
│       │   ├── workers/              # Background Workers
│       │   └── lib/                  # Utilities
│       ├── package.json
│       └── tsconfig.json
│
├── 🤖 services/                      # Microservices
│   ├── ai-modelling/                 # YOLO AI Service
│   │   ├── src/
│   │   │   ├── models/               # AI Models
│   │   │   ├── detection/            # Detection Logic
│   │   │   └── api/                  # Flask API
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   └── edge-device/                  # Edge Device Integration
│       ├── src/
│       │   ├── camera/               # Camera Integration
│       │   ├── mqtt/                 # MQTT Client
│       │   └── detection/            # Local Detection
│       └── requirements.txt
│
├── 📊 shared/                        # Shared Code
│   ├── types/                        # TypeScript Types
│   ├── utils/                        # Shared Utilities
│   ├── constants/                    # Constants
│   └── config/                       # Configuration Files
│
├── 🗄️ data/                          # Data & Models
│   ├── models/                       # AI Models
│   ├── datasets/                     # Training Data
│   └── artifacts/                    # Generated Artifacts
│
├── 🐳 infrastructure/                # Infrastructure
│   ├── docker/                       # Docker Configurations
│   ├── k8s/                          # Kubernetes Manifests
│   ├── terraform/                    # Infrastructure as Code
│   └── scripts/                      # Deployment Scripts
│
├── 📚 docs/                          # Documentation
│   ├── api/                          # API Documentation
│   ├── deployment/                   # Deployment Guides
│   ├── development/                  # Development Guides
│   └── architecture/                 # Architecture Docs
│
├── 🧪 tests/                         # Test Suites
│   ├── unit/                         # Unit Tests
│   ├── integration/                  # Integration Tests
│   └── e2e/                          # End-to-End Tests
│
├── 📋 scripts/                       # Utility Scripts
│   ├── setup/                        # Setup Scripts
│   ├── deployment/                   # Deployment Scripts
│   └── maintenance/                  # Maintenance Scripts
│
├── 🔧 config/                        # Configuration Files
│   ├── .env.example
│   ├── docker-compose.yml
│   ├── firebase.json
│   └── vercel.json
│
├── 📄 docs/                          # Main Documentation
│   ├── README.md                     # Main README
│   ├── ARCHITECTURE.md               # System Architecture
│   ├── API.md                        # API Documentation
│   ├── DEPLOYMENT.md                 # Deployment Guide
│   └── DEVELOPMENT.md                # Development Guide
│
├── 🚀 scripts/                       # Quick Start Scripts
│   ├── start-all.ps1                 # Windows PowerShell
│   ├── start-all.sh                  # macOS/Linux
│   └── start-all.bat                 # Windows CMD
│
└── 📦 Root Files
    ├── package.json                  # Root Package (Monorepo)
    ├── .gitignore
    ├── .env.example
    └── README.md
```

## 🎯 **Key Principles**

### 1. **Separation of Concerns**
- **Apps**: User-facing applications (web, mobile, api)
- **Services**: Backend services (AI, edge device)
- **Shared**: Common code and types
- **Infrastructure**: Deployment and configuration

### 2. **Single Source of Truth**
- **Shared Types**: Common TypeScript interfaces
- **Shared Utils**: Reusable utility functions
- **Shared Config**: Environment and configuration management

### 3. **Scalability**
- **Microservices**: Independent deployable services
- **Monorepo**: Shared code and dependencies
- **Edge Integration**: Ready for edge device deployment

### 4. **Developer Experience**
- **Clear Structure**: Easy to navigate and understand
- **Consistent Patterns**: Similar structure across apps
- **Documentation**: Comprehensive guides and examples

## 🔄 **Data Flow Architecture**

```
Edge Device (Webcam) → AI Service → Backend API → Web/Mobile Apps
     ↓                    ↓           ↓
MQTT/HTTP            Redis Cache   Firebase
     ↓                    ↓           ↓
Real-time Data      WebSocket     Real-time UI
```

## 🚀 **Quick Start**

```bash
# Start all services
.\scripts\start-all.ps1    # Windows
./scripts/start-all.sh     # macOS/Linux

# Access applications
Web App:    http://localhost:3002
Mobile App: http://localhost:8081
API:        http://localhost:3001
AI Service: http://localhost:8081
```

## 📱 **Platform Support**

- **Web**: Next.js with TypeScript
- **Mobile**: React Native with Expo
- **Backend**: Node.js with Express
- **AI**: Python with Flask
- **Database**: Firebase Firestore
- **Real-time**: WebSocket + MQTT
- **Edge**: Python + OpenCV + YOLO
