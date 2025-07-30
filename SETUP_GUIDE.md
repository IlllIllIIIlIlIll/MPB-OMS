# TransJakarta OMS Setup Guide

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn** package manager

### Option 1: Automated Setup (Recommended)

#### Windows
```bash
# Run the setup script
setup.bat
```

#### macOS/Linux
```bash
# Make the script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

### Option 2: Manual Setup

#### 1. Database Setup

1. **Install PostgreSQL** (if not already installed):
   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - **macOS**: `brew install postgresql`
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib`

2. **Create Database**:
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE tj_oms;
   
   # Exit psql
   \q
   ```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# Update DATABASE_URL, JWT_SECRET, etc.

# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed database with initial data
npm run seed

# Start development server
npm run dev
```

The backend will be running at `http://localhost:3001`

#### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Start development server
npm run dev
```

The frontend will be running at `http://localhost:3002`

## 🔧 Environment Configuration

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tj_oms"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# Server
PORT=3001
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:3002"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH="./uploads"

# Socket.io
SOCKET_CORS_ORIGIN="http://localhost:3002"

# Logging
LOG_LEVEL="info"
```

### Frontend (.env.local)
```env
# Backend API
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Socket.io
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"

# App Info
NEXT_PUBLIC_APP_NAME="TransJakarta OMS"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

## 👥 Default Users

After running the seed script, these users will be available:

### Admin User
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `ADMIN`
- **Access**: Full system access

### Platform Guard User
- **Username**: `guard`
- **Password**: `guard123`
- **Role**: `PLATFORM_GUARD`
- **Access**: Guard dashboard only

## 🌐 Available Interfaces

### 1. Landing Page
- **URL**: `http://localhost:3002`
- **Description**: Main entry point with interface selection

### 2. Login Page
- **URL**: `http://localhost:3002/login`
- **Description**: Authentication for admin and guard users

### 3. Admin Dashboard
- **URL**: `http://localhost:3002/admin`
- **Access**: Admin users only
- **Features**:
  - System overview and statistics
  - Real-time bus monitoring
  - Alert management
  - Analytics and reporting
  - User management

### 4. Platform Guard Dashboard
- **URL**: `http://localhost:3002/guard`
- **Access**: Guard users only
- **Features**:
  - Real-time bus occupancy monitoring
  - Manual occupancy updates
  - Quick actions and alerts
  - Tablet-optimized interface

### 5. Mobile App Interface
- **URL**: `http://localhost:3002/mobile`
- **Access**: Public (no authentication required)
- **Features**:
  - Route selection and bus information
  - Real-time occupancy data
  - Estimated arrival times
  - Mobile-optimized design

### 6. Bus Stop Display
- **URL**: `http://localhost:3002/display`
- **Access**: Public (no authentication required)
- **Features**:
  - High-visibility design for outdoor screens
  - Real-time arrival information
  - Occupancy indicators
  - System status display

## 🔍 Verification Steps

### 1. Backend Health Check
Visit `http://localhost:3001/health`
- Should return: `{"status":"ok","timestamp":"..."}`

### 2. Frontend Landing Page
Visit `http://localhost:3002`
- Should show the landing page with system interface cards

### 3. Database Verification
```bash
psql -U postgres -d tj_oms -c "\dt"
```
Should show tables: `User`, `Session`, `Route`, `Station`, `RouteStop`, `Bus`, `Camera`, `Occupancy`, `Arrival`, `Alert`, `SystemLog`

### 4. Authentication Test
1. Visit `http://localhost:3002/login`
2. Login with admin credentials: `admin` / `admin123`
3. Should redirect to admin dashboard

## 🛠️ Development Scripts

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
npm run prisma:generate  # Generate Prisma client
npm run prisma:push     # Push schema to database
npm run prisma:migrate  # Run migrations
npm run prisma:studio   # Open Prisma Studio
npm run seed         # Seed database
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript check
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Error
**Symptoms**: Backend fails to start with database connection error
**Solutions**:
- Verify PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Ensure database exists: `psql -U postgres -c "CREATE DATABASE tj_oms;"`

#### 2. Port Already in Use
**Symptoms**: "EADDRINUSE" error
**Solutions**:
- Change PORT in backend/.env
- Kill existing processes: `npx kill-port 3002 3001`

#### 3. Prisma Errors
**Symptoms**: Database schema or client generation errors
**Solutions**:
- Run `npm run prisma:generate`
- Check database connection
- Verify schema syntax in prisma/schema.prisma

#### 4. Frontend Build Errors
**Symptoms**: TypeScript or build errors
**Solutions**:
- Clear .next folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

#### 5. Socket.io Connection Issues
**Symptoms**: Real-time features not working
**Solutions**:
- Check CORS settings in backend/.env
- Verify Socket.io URL in frontend/.env.local
- Check browser console for connection errors

### Getting Help

1. **Check Console Logs**: Both backend and frontend terminals
2. **Verify Environment Variables**: Ensure all required variables are set
3. **Database Status**: Confirm PostgreSQL is running and accessible
4. **Network Issues**: Check if ports 3002 and 3001 are available

## 📱 Interface Features

### Admin Dashboard
- **System Overview**: Real-time statistics and health monitoring
- **Bus Management**: View and manage all buses in the system
- **Route Analytics**: Performance metrics for each route
- **Alert Management**: System alerts and resolution
- **User Management**: Admin user creation and management

### Platform Guard Dashboard
- **Real-time Monitoring**: Live bus occupancy data
- **Manual Updates**: Override occupancy counts when needed
- **Quick Actions**: Report issues, mark alerts as resolved
- **Bus Selection**: Click on buses to view details and update occupancy

### Mobile App Interface
- **Route Selection**: Choose from available TransJakarta routes
- **Bus Information**: Real-time occupancy and arrival times
- **Occupancy Indicators**: Visual representation of bus capacity
- **Quick Actions**: Find nearest station, view schedule

### Bus Stop Display
- **High Visibility**: Optimized for outdoor viewing
- **Arrival Information**: Real-time bus arrival times
- **Occupancy Status**: Color-coded capacity indicators
- **System Status**: Live system health information

## 🔄 Real-time Features

### Socket.io Events
The system uses Socket.io for real-time communication:

#### Client Events
- `join:room` - Join specific rooms (bus, route, station, admin, guard)
- `leave:room` - Leave rooms
- `occupancy:update` - Manual occupancy updates
- `camera:status` - Camera status updates

#### Server Events
- `camera:status` - Camera online/offline status
- `camera:occupancy` - Real-time occupancy from cameras
- `bus:location` - Bus location updates
- `bus:occupancy` - Bus occupancy updates
- `bus:arrival` - Bus arrival updates
- `alert:new` - New alert notifications
- `alert:resolved` - Alert resolution notifications
- `system:status` - System health status
- `system:health` - Detailed system health

## 🚀 Next Steps

### Immediate Development Tasks
1. **Complete API Integration**: Connect frontend to real backend APIs
2. **Real-time Implementation**: Implement actual Socket.io event handling
3. **Authentication Flow**: Complete login/logout functionality
4. **Error Handling**: Add comprehensive error handling and user feedback

### Advanced Features
1. **Mobile Responsiveness**: Optimize all interfaces for mobile devices
2. **Testing Suite**: Add unit and integration tests
3. **Performance Optimization**: Implement caching and optimization
4. **Monitoring**: Add logging and monitoring capabilities
5. **Deployment**: Set up production deployment pipeline

### Production Considerations
1. **Security**: Implement proper security measures
2. **Scalability**: Design for high-traffic scenarios
3. **Backup**: Set up database backup and recovery
4. **Monitoring**: Add production monitoring and alerting
5. **Documentation**: Complete API and user documentation

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review console logs for error messages
3. Verify all prerequisites are installed
4. Ensure environment variables are correctly configured

---

**Happy coding! 🚌**

The TransJakarta OMS is now ready for development and testing. All interfaces are functional with mock data and ready for real API integration. 