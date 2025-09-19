# 🚌 **TransJakarta Occupancy Management System (OMS)**

> **A complete multi-platform solution for real-time bus occupancy monitoring with AI-powered people counting and edge device integration.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?logo=Firebase&logoColor=white)](https://firebase.google.com/)

## 🎯 **System Overview**

The TransJakarta OMS is a comprehensive solution that provides:

- **🌐 Web Dashboard** - Real-time bus occupancy display for operators
- **📱 Mobile App** - Cross-platform mobile application for passengers
- **🤖 AI Detection** - YOLO-based people counting with webcam integration
- **🔧 Backend API** - RESTful API with real-time WebSocket support
- **🔥 Firebase Integration** - Real-time database and authentication
- **📡 Edge Device Ready** - MQTT integration for IoT devices

## 🏗️ **Architecture**

```mermaid
graph TB
    subgraph "Edge Layer"
        A[Webcam/Camera] --> B[AI Detection Service]
        B --> C[MQTT Broker]
    end
    
    subgraph "Backend Layer"
        C --> D[Backend API]
        D --> E[Firebase Firestore]
        D --> F[Redis Cache]
    end
    
    subgraph "Frontend Layer"
        G[Web App - Next.js] --> D
        H[Mobile App - React Native] --> D
        I[Admin Dashboard] --> D
    end
    
    subgraph "Data Flow"
        J[Real-time Data] --> K[WebSocket]
        K --> G
        K --> H
    end
```

## 🚀 **Quick Start**

### **Single Command Start (Recommended)**

| Platform | Command | Description |
|----------|---------|-------------|
| **Windows** | `.\scripts\start-all.ps1` | PowerShell script |
| **Windows** | `scripts\start-all.bat` | Command Prompt |
| **macOS/Linux** | `./scripts/start-all.sh` | Bash script |

### **What Gets Started:**
1. **🌐 Web App** (Port 3002) - Bus occupancy dashboard
2. **🔧 Backend API** (Port 3001) - REST API server
3. **🤖 AI Service** (Port 8081) - YOLO people counting
4. **📱 Mobile App** (Port 8081) - React Native web version

### **Access URLs:**
- **🚌 Web Dashboard:** http://localhost:3002
- **📱 Mobile App:** http://localhost:8081
- **🔧 API:** http://localhost:3001/api/occupancy/now
- **🤖 AI Service:** http://localhost:8081/api/health

## 📁 **Project Structure**

```
MPB-OMS/
├── 📱 apps/                          # Applications
│   ├── web/                          # Next.js Web App
│   ├── mobile/                       # React Native Mobile App
│   └── api/                          # Backend API Server
├── 🤖 services/                      # Microservices
│   ├── ai-modelling/                 # YOLO AI Service
│   └── edge-device/                  # Edge Device Integration
├── 📊 shared/                        # Shared Code
│   ├── types/                        # TypeScript Types
│   ├── utils/                        # Shared Utilities
│   └── config/                       # Configuration
├── 🗄️ data/                          # Data & Models
├── 🐳 infrastructure/                # Infrastructure
├── 📚 docs/                          # Documentation
├── 🧪 tests/                         # Test Suites
└── 📋 scripts/                       # Utility Scripts
```

## 🛠️ **Technology Stack**

### **Frontend**
- **Web**: Next.js 14, TypeScript, Tailwind CSS
- **Mobile**: React Native, Expo, TypeScript
- **UI**: Custom components, responsive design

### **Backend**
- **API**: Node.js, Express, TypeScript
- **Database**: Firebase Firestore
- **Cache**: Redis (optional)
- **Real-time**: WebSocket, MQTT

### **AI & Detection**
- **Framework**: Python, Flask
- **AI**: YOLO v8, OpenCV
- **Detection**: People counting, occupancy tracking

### **Infrastructure**
- **Deployment**: Vercel, Firebase Hosting
- **CI/CD**: GitHub Actions
- **Monitoring**: Built-in health checks

## 🔧 **Development Setup**

### **Prerequisites**
- **Node.js 18+** and **npm**
- **Python 3.8+** (for AI service)
- **4GB RAM** minimum (8GB recommended)
- **Webcam** (for AI detection)

### **Manual Setup**

1. **Clone Repository**
```bash
git clone <repository-url>
cd MPB-OMS
```

2. **Install Dependencies**
```bash
# Backend
cd apps/api
npm install

# Web App
cd ../web
npm install

# Mobile App
cd ../mobile
npm install

# AI Service
cd ../../services/ai-modelling
pip install -r requirements.txt
```

3. **Environment Setup**
```bash
# Copy environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

4. **Start Services**
```bash
# Terminal 1: Backend API
cd apps/api
npm run dev

# Terminal 2: Web App
cd apps/web
npm run dev

# Terminal 3: AI Service
cd services/ai-modelling
python app.py

# Terminal 4: Mobile App (optional)
cd apps/mobile
npm start
```

## 📊 **API Endpoints**

### **Occupancy Management**
- `GET /api/occupancy/now` - Current occupancy for all buses
- `GET /api/occupancy/:busId` - Specific bus occupancy
- `GET /api/occupancy/:busId/history` - Occupancy history

### **System Status**
- `GET /health` - Health check
- `GET /api/system/status` - Detailed system status

### **AI Service**
- `GET /api/health` - AI service health
- `GET /api/occupancy` - Real-time occupancy data
- `POST /api/detect` - Trigger detection

## 🔄 **Data Flow**

### **1. Real-time Detection**
```
Webcam → AI Service → Backend API → Web/Mobile Apps
```

### **2. Data Storage**
```
Occupancy Data → Firebase Firestore → Real-time Updates
```

### **3. User Interface**
```
WebSocket → Real-time UI Updates → Live Dashboard
```

## 🚀 **Deployment**

### **Web App (Vercel)**
```bash
cd apps/web
vercel --prod
```

### **Mobile App (Expo)**
```bash
cd apps/mobile
expo build:android
expo build:ios
```

### **Backend API (Vercel)**
```bash
cd apps/api
vercel --prod
```

### **AI Service (Docker)**
```bash
cd services/ai-modelling
docker build -t tj-ai-service .
docker run -p 8081:8081 tj-ai-service
```

## 🔧 **Configuration**

### **Environment Variables**

#### **Backend API (.env)**
```env
PORT=3001
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
CORS_ORIGIN=http://localhost:3002
```

#### **Web App (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
```

#### **AI Service (.env)**
```env
FLASK_PORT=8081
MODEL_PATH=./models/yolov8n.pt
CAMERA_INDEX=0
```

## 🧪 **Testing**

### **Run Tests**
```bash
# Backend tests
cd apps/api
npm test

# Web app tests
cd apps/web
npm test

# AI service tests
cd services/ai-modelling
python -m pytest
```

### **Test Coverage**
```bash
# Generate coverage report
npm run test:coverage
```

## 📈 **Performance**

### **Expected Performance**
- **API Response**: < 100ms
- **Real-time Updates**: < 50ms
- **AI Detection**: 30 FPS
- **Concurrent Users**: 100+

### **Monitoring**
- **Health Checks**: All services
- **Metrics**: Built-in monitoring
- **Logging**: Structured logging

## 🔐 **Security**

### **Authentication**
- **JWT Tokens**: API access
- **Firebase Auth**: User management
- **CORS**: Configured origins

### **Data Protection**
- **Environment Variables**: Sensitive data
- **HTTPS**: Production deployment
- **Input Validation**: All endpoints

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Port Already in Use**
```bash
# Check ports
   netstat -ano | findstr :3001
   netstat -ano | findstr :3002
   netstat -ano | findstr :8081
```

2. **AI Service Not Starting**
   ```bash
# Check Python dependencies
   pip install -r requirements.txt
# Check webcam access
python -c "import cv2; print(cv2.VideoCapture(0).isOpened())"
   ```

3. **Firebase Connection Issues**
   ```bash
# Check environment variables
echo $FIREBASE_PROJECT_ID
   # Test connection
npm run test:firebase
   ```

### **Debug Mode**
   ```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 📚 **Documentation**

- **[Architecture Guide](docs/ARCHITECTURE.md)** - System design and components
- **[API Documentation](docs/API.md)** - Complete API reference
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment
- **[Development Guide](docs/DEVELOPMENT.md)** - Development setup

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **TransJakarta** - For the inspiration and use case
- **YOLO** - For the computer vision capabilities
- **Firebase** - For the real-time database
- **Next.js** - For the web framework
- **React Native** - For the mobile framework

## 📞 **Support**

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: support@transjakarta-oms.com

---

**Made with ❤️ for TransJakarta and the people of Jakarta**