# TransJakarta Occupancy Management System (OMS)

A comprehensive system designed to address critical overcrowding during peak hours by using overhead cameras to track passenger movement. These cameras, mounted above bus doors, detect and classify entries and exits through top-down head tracking. Each detected individual is marked with a status (IN or OUT), and a real-time passenger count is maintained using a differential algorithm.

## Features

### 🚌 Mobile App Interface
- Real-time bus occupancy information
- Route planning with occupancy predictions
- Push notifications for capacity alerts
- User-friendly interface for commuters

### 🚏 Bus Stop Displays
- Public displays showing real-time occupancy
- Estimated arrival times with capacity indicators
- Route information and next bus details
- High-visibility design for quick scanning

### 🛡️ Platform Guard Dashboard
- Tablet-based interface for station staff
- Manual occupancy override capabilities
- Real-time alerts and notifications
- Quick access to bus and route information

### 🖥️ Admin Web Dashboard
- Comprehensive system overview
- Real-time analytics and reporting
- User management and system configuration
- Alert management and resolution

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: React Query
- **Real-time**: Socket.io Client

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Real-time**: Socket.io
- **Authentication**: JWT
- **Security**: bcrypt, helmet, cors

## Project Structure

```
MPB-OMS/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   └── lib/           # Utilities and configurations
│   ├── prisma/            # Database schema and migrations
│   └── scripts/           # Database seeding and utilities
├── frontend/              # Next.js web application
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities and API client
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn** package manager

### 1. Database Setup

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

### 2. Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env with your database credentials
   # Update DATABASE_URL, JWT_SECRET, etc.
   ```

4. **Set up database**:
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Push schema to database
   npm run prisma:push
   
   # Seed database with initial data
   npm run seed
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

   The backend will be running at `http://localhost:3001`

### 3. Frontend Setup

1. **Navigate to frontend directory** (in a new terminal):
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   # Copy example environment file
   cp .env.local.example .env.local
   
   # Edit .env.local if needed (defaults should work)
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

   The frontend will be running at `http://localhost:3002`

### 4. Verify Installation

1. **Backend Health Check**: Visit `http://localhost:3001/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend**: Visit `http://localhost:3002`
   - Should show the landing page with system interface cards

3. **Database**: Check that tables were created:
   ```bash
   psql -U postgres -d tj_oms -c "\dt"
   ```

## Environment Variables

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

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/users` - Create user (admin only)

### Buses
- `GET /api/buses` - Get all buses
- `GET /api/buses/:id` - Get specific bus
- `PUT /api/buses/:id/occupancy` - Update bus occupancy
- `GET /api/buses/:id/occupancy/history` - Get occupancy history
- `PUT /api/buses/:id/location` - Update bus location

### Routes
- `GET /api/routes` - Get all routes
- `GET /api/routes/:id` - Get specific route
- `GET /api/routes/:id/buses` - Get buses on route

### Stations
- `GET /api/stations` - Get all stations
- `GET /api/stations/:id` - Get specific station

### Analytics
- `GET /api/analytics/overview` - System overview
- `GET /api/analytics/routes` - Route analytics
- `GET /api/analytics/stations` - Station analytics

### Alerts
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/:id` - Get specific alert
- `PUT /api/alerts/:id/resolve` - Resolve alert
- `GET /api/alerts/stats` - Alert statistics

## Real-time Events (Socket.io)

### Client Events
- `join:room` - Join a specific room (bus, route, station, admin, guard)
- `leave:room` - Leave a room
- `occupancy:update` - Manual occupancy update
- `camera:status` - Camera status update

### Server Events
- `camera:status` - Camera online/offline status
- `camera:occupancy` - Real-time occupancy from camera
- `bus:location` - Bus location updates
- `bus:occupancy` - Bus occupancy updates
- `bus:arrival` - Bus arrival updates
- `alert:new` - New alert notification
- `alert:resolved` - Alert resolved notification
- `system:status` - System health status
- `system:health` - Detailed system health

## Quick Start

### Option 1: Single Command (Recommended)
```bash
# Start both backend and frontend simultaneously
npm run dev

# Or use the provided scripts
./start.bat          # Windows Batch
./start.ps1          # Windows PowerShell
```

### Option 2: Individual Commands
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## Development Scripts

### Root (Project Level)
```bash
npm run dev              # Start both backend and frontend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only
npm run install:all      # Install dependencies for all packages
npm run build            # Build both backend and frontend
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
```

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

## Default Users

After running the seed script, these users will be available:

### Admin User
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `ADMIN`

### Platform Guard User
- **Username**: `guard`
- **Password**: `guard123`
- **Role**: `PLATFORM_GUARD`

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env
   - Ensure database exists

2. **Port Already in Use**:
   - Change PORT in .env
   - Kill existing processes: `npx kill-port 3002 3001`

3. **Prisma Errors**:
   - Run `npm run prisma:generate`
   - Check database connection
   - Verify schema syntax

4. **Frontend Build Errors**:
   - Clear .next folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

### Getting Help

- Check the console for error messages
- Verify all environment variables are set
- Ensure all dependencies are installed
- Check that both backend and frontend are running

## Next Steps

1. **Complete the frontend pages** for each interface
2. **Implement real-time features** using Socket.io
3. **Add authentication flows** and protected routes
4. **Create mobile-responsive designs**
5. **Add comprehensive error handling**
6. **Implement testing suite**
7. **Set up CI/CD pipeline**
8. **Add monitoring and logging**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
