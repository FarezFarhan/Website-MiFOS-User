import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store server configuration
let serverConfig = {
  baseUrl: 'http://localhost:5000',
  connected: false,
};

// API Routes

// Test connection
app.post('/api/test-connection', async (req, res) => {
  try {
    const { url } = req.body;
    const response = await axios.get(`${url}/data/view`, { timeout: 5000 });
    serverConfig.baseUrl = url;
    serverConfig.connected = true;
    res.json({ success: true, message: 'Connected successfully' });
  } catch (error) {
    serverConfig.connected = false;
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get plots
app.get('/api/plots', async (req, res) => {
  try {
    if (!serverConfig.connected) {
      return res.status(400).json({ error: 'Not connected to server' });
    }
    const response = await axios.get(`${serverConfig.baseUrl}/data/get_plots`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle data acquisition
app.post('/api/acquisition', async (req, res) => {
  try {
    const { run } = req.body;
    const formData = new FormData();
    formData.append('run', run ? '1' : '0');
    
    const response = await axios.post(`${serverConfig.baseUrl}/data/dm`, formData);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get acquisition status
app.get('/api/acquisition', async (req, res) => {
  try {
    const response = await axios.get(`${serverConfig.baseUrl}/data/dm`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ROI endpoints
app.get('/api/roi', async (req, res) => {
  try {
    const response = await axios.get(`${serverConfig.baseUrl}/data/roi`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/roi', async (req, res) => {
  try {
    const { start, end } = req.body;
    const formData = new FormData();
    formData.append('roi', `${start}:${end}`);
    
    const response = await axios.post(`${serverConfig.baseUrl}/data/roi`, formData);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Locations endpoints
app.get('/api/locations', async (req, res) => {
  try {
    const response = await axios.get(`${serverConfig.baseUrl}/data/locations`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/locations', async (req, res) => {
  try {
    const { start, end } = req.body;
    const formData = new FormData();
    formData.append('locations', `${start}:${end}`);
    
    const response = await axios.post(`${serverConfig.baseUrl}/data/locations`, formData);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Magnitude endpoints
app.get('/api/magnitude', async (req, res) => {
  try {
    const response = await axios.get(`${serverConfig.baseUrl}/data/magnitude`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/magnitude', async (req, res) => {
  try {
    const { start, end } = req.body;
    const formData = new FormData();
    formData.append('magnitude', `${start}:${end}`);
    
    const response = await axios.post(`${serverConfig.baseUrl}/data/magnitude`, formData);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Meter endpoints
app.get('/api/meter', async (req, res) => {
  try {
    const { set } = req.query;
    const response = await axios.get(`${serverConfig.baseUrl}/data/meter?set=${set || 1}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Alarms endpoints
app.get('/api/alarms', async (req, res) => {
  try {
    const response = await axios.get(`${serverConfig.baseUrl}/data/alarm`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/alarms', async (req, res) => {
  try {
    const { threshold } = req.body;
    const formData = new FormData();
    formData.append('threshold', threshold);
    formData.append('enable', '1');
    
    const response = await axios.post(`${serverConfig.baseUrl}/data/alarm`, formData);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/alarms/:index/toggle', async (req, res) => {
  try {
    const { index } = req.params;
    const formData = new FormData();
    formData.append('index', index);
    
    const response = await axios.post(`${serverConfig.baseUrl}/data/alarm/toggle`, formData);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/alarms/:index', async (req, res) => {
  try {
    const { index } = req.params;
    const formData = new FormData();
    formData.append('index', index);
    
    const response = await axios.post(`${serverConfig.baseUrl}/data/alarm/delete`, formData);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/alarms/reset', async (req, res) => {
  try {
    const response = await axios.post(`${serverConfig.baseUrl}/data/alarm/reset`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Alarm events
app.get('/api/alarm-events', async (req, res) => {
  try {
    const response = await axios.get(`${serverConfig.baseUrl}/data/alarm/events`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Map data endpoint
app.get('/api/map-data', async (req, res) => {
  try {
    if (!serverConfig.connected) {
      return res.status(400).json({ error: 'Not connected to server' });
    }
    
    const dmResponse = await axios.get(`${serverConfig.baseUrl}/data/dm`);
    const alarmsResponse = await axios.get(`${serverConfig.baseUrl}/data/alarm/events`);
    
    const dmData = dmResponse.data;
    const alarmEvents = alarmsResponse.data || [];
    
    const mapData = {
      center: dmData.maps && dmData.maps[0] ? {
        lat: dmData.maps[0].center?.lat || 40.7128,
        lng: dmData.maps[0].center?.lng || -74.0060
      } : { lat: 40.7128, lng: -74.0060 },
      zoom: dmData.maps && dmData.maps[0] ? dmData.maps[0].zoom || 12 : 12,
      fiberRoute: dmData.maps && dmData.maps[0] && dmData.maps[0].polyline ? dmData.maps[0].polyline : [],
      alarmLocations: alarmEvents.map(event => ({
        lat: event.lat || event.latitude || 40.7128,
        lng: event.lng || event.longitude || -74.0060,
        distance: event.distance || event.location || 0,
        type: event.type || 'warning',
        timestamp: event.timestamp || new Date().toISOString()
      }))
    };
    
    res.json(mapData);
  } catch (error) {
    console.error('Error fetching map data:', error.message);
    res.json({
      center: { lat: 40.7128, lng: -74.0060 },
      zoom: 12,
      fiberRoute: [],
      alarmLocations: []
    });
  }
});

// Map alerts endpoint
app.get('/api/map-alerts', async (req, res) => {
  try {
    if (!serverConfig.connected) {
      return res.status(400).json({ error: 'Not connected to server' });
    }
    
    const alarmsResponse = await axios.get(`${serverConfig.baseUrl}/data/alarm/events`);
    const alarmEvents = alarmsResponse.data || [];
    
    const alarmLocations = alarmEvents.map(event => ({
      lat: event.lat || event.latitude || 40.7128,
      lng: event.lng || event.longitude || -74.0060,
      distance: event.distance || event.location || 0,
      type: event.type || 'warning',
      timestamp: event.timestamp || new Date().toISOString()
    }));
    
    res.json({ alarmLocations });
  } catch (error) {
    console.error('Error fetching map alerts:', error.message);
    res.json({ alarmLocations: [] });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`MIFOS Dashboard server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
