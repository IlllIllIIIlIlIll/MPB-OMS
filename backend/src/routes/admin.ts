import express from 'express';
import { body, validationResult } from 'express-validator';
import { firestoreService } from '../services/firestoreService';

const router = express.Router();

// Serve a simple admin interface
router.get('/admin', (req: express.Request, res: express.Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>MPB-OMS Admin Panel</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .container { max-width: 800px; margin: 0 auto; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input, select, textarea { width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px; }
            button { background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background-color: #45a049; }
            .result { margin-top: 20px; padding: 10px; background-color: #f0f0f0; border-radius: 4px; }
            .error { background-color: #ffebee; color: #c62828; }
            .success { background-color: #e8f5e8; color: #2e7d32; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚌 MPB-OMS Admin Panel</h1>
            
            <h2>Add New Bus</h2>
            <form id="busForm">
                <div class="form-group">
                    <label>Bus ID:</label>
                    <input type="text" name="busId" required>
                </div>
                <div class="form-group">
                    <label>Bus Code:</label>
                    <input type="text" name="busCode" required>
                </div>
                <div class="form-group">
                    <label>Route ID:</label>
                    <input type="text" name="routeId" required>
                </div>
                <div class="form-group">
                    <label>Route Name:</label>
                    <input type="text" name="routeName" required>
                </div>
                <div class="form-group">
                    <label>Direction:</label>
                    <input type="text" name="direction" required>
                </div>
                <div class="form-group">
                    <label>Platform:</label>
                    <select name="platform">
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Capacity:</label>
                    <input type="number" name="capacity" value="40" required>
                </div>
                <div class="form-group">
                    <label>Device ID:</label>
                    <input type="text" name="deviceId" required>
                </div>
                <button type="submit">Add Bus</button>
            </form>
            
            <h2>Add Occupancy Data</h2>
            <form id="occupancyForm">
                <div class="form-group">
                    <label>Bus ID:</label>
                    <input type="text" name="busId" required>
                </div>
                <div class="form-group">
                    <label>Current Occupancy:</label>
                    <input type="number" name="occupancy" min="0" required>
                </div>
                <div class="form-group">
                    <label>Capacity:</label>
                    <input type="number" name="capacity" value="40" required>
                </div>
                <div class="form-group">
                    <label>In Count:</label>
                    <input type="number" name="inCount" min="0" value="0">
                </div>
                <div class="form-group">
                    <label>Out Count:</label>
                    <input type="number" name="outCount" min="0" value="0">
                </div>
                <div class="form-group">
                    <label>Estimasi (minutes):</label>
                    <input type="text" name="estimasi" placeholder="e.g., 2 mnt">
                </div>
                <div class="form-group">
                    <label>Device ID:</label>
                    <input type="text" name="deviceId" required>
                </div>
                <button type="submit">Add Occupancy</button>
            </form>
            
            <h2>View Data</h2>
            <button onclick="viewBuses()">View All Buses</button>
            <button onclick="viewOccupancy()">View All Occupancy</button>
            
            <div id="result"></div>
        </div>

        <script>
            // Add Bus
            document.getElementById('busForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                try {
                    const response = await fetch('/api/admin/bus', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    showResult(result, response.ok);
                } catch (error) {
                    showResult({ error: error.message }, false);
                }
            });
            
            // Add Occupancy
            document.getElementById('occupancyForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                try {
                    const response = await fetch('/api/admin/occupancy', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    showResult(result, response.ok);
                } catch (error) {
                    showResult({ error: error.message }, false);
                }
            });
            
            // View Buses
            async function viewBuses() {
                try {
                    const response = await fetch('/api/occupancy/now');
                    const data = await response.json();
                    showResult({ message: 'All Buses', data: data }, true);
                } catch (error) {
                    showResult({ error: error.message }, false);
                }
            }
            
            // View Occupancy
            async function viewOccupancy() {
                try {
                    const response = await fetch('/api/occupancy/now');
                    const data = await response.json();
                    showResult({ message: 'All Occupancy Data', data: data }, true);
                } catch (error) {
                    showResult({ error: error.message }, false);
                }
            }
            
            function showResult(result, isSuccess) {
                const resultDiv = document.getElementById('result');
                resultDiv.className = isSuccess ? 'result success' : 'result error';
                resultDiv.innerHTML = '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
            }
        </script>
    </body>
    </html>
  `);
});

// API endpoint to add a bus
router.post('/bus', [
  body('busId').notEmpty(),
  body('busCode').notEmpty(),
  body('routeId').notEmpty(),
  body('routeName').notEmpty(),
  body('direction').notEmpty(),
  body('platform').notEmpty(),
  body('capacity').isInt({ min: 1 }),
  body('deviceId').notEmpty()
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const busData = {
      busId: req.body.busId,
      busCode: req.body.busCode,
      routeId: req.body.routeId,
      routeName: req.body.routeName,
      direction: req.body.direction,
      platform: req.body.platform,
      capacity: parseInt(req.body.capacity),
      deviceId: req.body.deviceId,
      providerName: 'TransJakarta',
      category: 'Regular'
    };

    await firestoreService.createBus(busData);
    
    res.json({
      message: 'Bus created successfully',
      bus: busData
    });
  } catch (error) {
    console.error('Error creating bus:', error);
    res.status(500).json({ error: 'Failed to create bus' });
  }
});

// API endpoint to add occupancy data
router.post('/occupancy', [
  body('busId').notEmpty(),
  body('occupancy').isInt({ min: 0 }),
  body('capacity').isInt({ min: 1 }),
  body('deviceId').notEmpty()
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const occupancyData = {
      busId: req.body.busId,
      occupancy: parseInt(req.body.occupancy),
      capacity: parseInt(req.body.capacity),
      inCount: parseInt(req.body.inCount) || 0,
      outCount: parseInt(req.body.outCount) || 0,
      estimasi: req.body.estimasi || '-- mnt',
      deviceId: req.body.deviceId,
      routeId: req.body.routeId || 'Unknown',
      routeName: req.body.routeName || 'Unknown',
      direction: req.body.direction || 'Unknown',
      platform: req.body.platform || 'A',
      timestamp: new Date()
    };

    await firestoreService.createOccupancy(occupancyData);
    
    res.json({
      message: 'Occupancy data created successfully',
      occupancy: occupancyData
    });
  } catch (error) {
    console.error('Error creating occupancy:', error);
    res.status(500).json({ error: 'Failed to create occupancy data' });
  }
});

export default router;
