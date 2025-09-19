# 🚀 Quick Start Guide - TransJakarta OMS

## 🎯 **Single Command Start (All Operating Systems)**

### **Windows Users**
```powershell
# PowerShell (Recommended)
.\start-all.ps1

# OR Command Prompt
start-all.bat
```

### **macOS/Linux Users**
```bash
# Make executable first time
chmod +x start-all.sh

# Then run
./start-all.sh
```

## 📋 **What Happens When You Run It:**

1. **✅ Starts Frontend** (Port 3002) - Bus display dashboard
2. **✅ Starts Backend** (Port 3001) - API server with YOLO integration
3. **✅ Starts YOLO** (Port 8081) - AI camera service for people counting
4. **✅ Waits for each service** to be healthy before starting the next
5. **✅ Monitors all services** continuously
6. **✅ Stops everything** when you press Ctrl+C

## 🌐 **Access Your System:**

| Service | URL | What You'll See |
|---------|-----|-----------------|
| **🚌 Bus Display** | http://localhost:3002 | Real-time bus schedules with AI occupancy |
| **📷 Camera** | http://localhost:8081 | Start camera detection for people counting |
| **📊 API Data** | http://localhost:3001/api/occupancy/now | Raw occupancy data |

## 🎯 **Quick Demo:**

1. **Run the start script** for your OS
2. **Wait for "ALL SERVICES RUNNING SUCCESSFULLY!"**
3. **Open http://localhost:3002** to see the bus display
4. **Open http://localhost:8081** to start camera
5. **Walk in front of camera** to see real-time occupancy changes!

## 🛑 **To Stop Everything:**
- Press **Ctrl+C** in the terminal where you ran the script
- All services will stop automatically

## ❓ **Need Help?**
- Check the main `README.md` for detailed troubleshooting
- Ensure ports 3001, 3002, and 8081 are not in use
- Make sure you have Node.js and Python installed

---
**🎉 That's it! One command starts your complete AI-powered bus occupancy system!**

