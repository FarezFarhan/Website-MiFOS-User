import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import http from 'http';
import https from 'https';
import crypto from 'crypto';
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

const DEFAULT_TIMEOUT_MS = 15000;
const LIVE_SIGNAL_TIMEOUT_MS = 30000;

function normalizeBaseUrl(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

async function getMifos(url, endpoint, timeout = DEFAULT_TIMEOUT_MS) {
  return axios.get(`${url}${endpoint}`, {
    timeout,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
}

async function loadMapConfig(area) {
  const configResponse = await getMifos(serverConfig.baseUrl, '/static/config/mimos.json');
  const maps = configResponse.data.maps || [];
  const selectedMap = area
    ? maps.find(m => m.title === area) || maps[0]
    : maps[0];

  return { maps, selectedMap };
}

function buildAlarmLocations(alarmEvents, selectedMap) {
  const center = selectedMap?.center || { latitude: 40.7128, longitude: -74.0060 };
  const coordinates = selectedMap?.coordinates || [];

  return alarmEvents.map(event => {
    const distance = Number(event.distance || event.location || 0);
    const point = interpolatePointAlongRoute(coordinates, distance);

    return {
      lat: event.lat || event.latitude || point?.lat || center.latitude,
      lng: event.lng || event.longitude || point?.lng || center.longitude,
      distance,
      type: event.type || 'warning',
      timestamp: event.timestamp || new Date().toISOString()
    };
  });
}

// API Routes

// Test connection
app.post('/api/test-connection', async (req, res) => {
  try {
    const url = normalizeBaseUrl(req.body.url);
    if (!url) {
      return res.status(400).json({ success: false, error: 'Server URL is required' });
    }

    const response = await getMifos(url, '/data/dm');
    serverConfig.baseUrl = url;
    serverConfig.connected = true;
    res.json({ success: true, message: 'Connected successfully', status: response.status });
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

// Raw live signal - single latest trace (used to build waterfall/trace client-side)
app.get('/api/live-signal', async (req, res) => {
  try {
    if (!serverConfig.connected) {
      return res.status(400).json({ error: 'Not connected to server' });
    }
    const response = await getMifos(serverConfig.baseUrl, '/data/live_signal/latest', LIVE_SIGNAL_TIMEOUT_MS);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle data acquisition
app.post('/api/acquisition', async (req, res) => {
  try {
    const { run } = req.body;
    const params = new URLSearchParams();
    params.append('run', run ? '1' : '0');

    const response = await axios.post(`${serverConfig.baseUrl}/data/dm`, params);
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
    const params = new URLSearchParams();
    params.append('roi', `${start}:${end}`);

    const response = await axios.post(`${serverConfig.baseUrl}/data/roi`, params);
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
    const params = new URLSearchParams();
    params.append('locations', `${start}:${end}`);

    const response = await axios.post(`${serverConfig.baseUrl}/data/locations`, params);
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
    const params = new URLSearchParams();
    params.append('magnitude', `${start}:${end}`);

    const response = await axios.post(`${serverConfig.baseUrl}/data/magnitude`, params);
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
    const params = new URLSearchParams();
    params.append('threshold', threshold);
    params.append('enable', '1');

    const response = await axios.post(`${serverConfig.baseUrl}/data/alarm`, params);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/alarms/:index/toggle', async (req, res) => {
  try {
    const { index } = req.params;
    const params = new URLSearchParams();
    params.append('index', index);

    const response = await axios.post(`${serverConfig.baseUrl}/data/alarm/toggle`, params);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/alarms/:index', async (req, res) => {
  try {
    const { index } = req.params;
    const params = new URLSearchParams();
    params.append('index', index);

    const response = await axios.post(`${serverConfig.baseUrl}/data/alarm/delete`, params);
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

function interpolatePointAlongRoute(coordinates, targetDistance) {
  if (!coordinates || coordinates.length === 0) return null;

  const distance = Number(targetDistance);
  if (!Number.isFinite(distance)) return null;

  let accumulated = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const start = coordinates[i];
    const end = coordinates[i + 1];
    const startLat = Number(start.latitude);
    const startLng = Number(start.longitude);
    const endLat = Number(end.latitude);
    const endLng = Number(end.longitude);

    const segmentDistance = Number(end.distance || 0);

    if (!Number.isFinite(startLat) || !Number.isFinite(startLng) || !Number.isFinite(endLat) || !Number.isFinite(endLng)) {
      continue;
    }

    if (accumulated + segmentDistance >= distance) {
      const distanceIntoSegment = distance - accumulated;
      const ratio = segmentDistance > 0 ? distanceIntoSegment / segmentDistance : 0;

      return {
        lat: startLat + (endLat - startLat) * ratio,
        lng: startLng + (endLng - startLng) * ratio,
      };
    }

    accumulated += segmentDistance;
  }

  const last = coordinates[coordinates.length - 1];
  return {
    lat: Number(last.latitude),
    lng: Number(last.longitude),
  };
}

// Map data endpoint - reads real fiber cable coordinates from Flask's static mimos.json
// Optional ?area=<title> query param selects which named cable area to show
// (MIMOS, PUTRA HEIGHTS, SEGAMAT, MEMPAGA). Defaults to the first one in the file.
app.get('/api/map-data', async (req, res) => {
  try {
    if (!serverConfig.connected) {
      return res.status(400).json({ error: 'Not connected to server' });
    }

    const { maps, selectedMap } = await loadMapConfig(req.query.area);

    if (maps.length === 0) {
      return res.json({ center: { lat: 40.7128, lng: -74.0060 }, zoom: 12, fiberRoute: [], alarmLocations: [], availableAreas: [] });
    }

    let alarmEvents = [];
    try {
      const alarmsResponse = await getMifos(serverConfig.baseUrl, '/data/alarm/events');
      alarmEvents = alarmsResponse.data || [];
    } catch (alarmError) {
      console.error('Error fetching alarm events:', alarmError.message);
    }

    const mapData = {
      title: selectedMap.title,
      center: { lat: selectedMap.center.latitude, lng: selectedMap.center.longitude },
      zoom: selectedMap.zoom || 18,
      mapType: selectedMap.type || 'roadmap',
      fiberRoute: (selectedMap.coordinates || []).map(coord => ({
        lat: coord.latitude,
        lng: coord.longitude,
        label: coord.label,
        distance: coord.distance
      })),
      alarmLocations: buildAlarmLocations(alarmEvents, selectedMap),
      availableAreas: maps.map(m => m.title)
    };

    res.json(mapData);
  } catch (error) {
    console.error('Error fetching map data:', error.message);
    res.json({
      center: { lat: 40.7128, lng: -74.0060 },
      zoom: 12,
      fiberRoute: [],
      alarmLocations: [],
      availableAreas: []
    });
  }
});

// Map alerts endpoint
app.get('/api/map-alerts', async (req, res) => {
  try {
    if (!serverConfig.connected) {
      return res.status(400).json({ error: 'Not connected to server' });
    }

    const { selectedMap } = await loadMapConfig(req.query.area);
    const alarmsResponse = await getMifos(serverConfig.baseUrl, '/data/alarm/events');
    const alarmEvents = alarmsResponse.data || [];
    const alarmLocations = buildAlarmLocations(alarmEvents, selectedMap);

    res.json({ alarmLocations, area: selectedMap?.title });
  } catch (error) {
    console.error('Error fetching map alerts:', error.message);
    res.json({ alarmLocations: [] });
  }
});

// --- CCTV camera proxy ---------------------------------------------------
//
// Dahua's cgi-bin endpoints require Digest authentication. Browsers strip
// user:password@ credentials from <img src="..."> URLs (a security measure),
// so the browser can never authenticate to the NVR directly that way.
//
// Instead, the browser points its <img> tag at THIS server (same-origin,
// no embedded credentials needed). This route does the Digest auth
// handshake with the NVR itself, then streams the resulting MJPEG feed
// straight through to the browser.
//
// Camera URLs are stored (in the browser's localStorage, via addCamera())
// in the form: http://username:password@nvr-ip/cgi-bin/mjpg/video.cgi?...
// Node's URL parser reads the embedded username/password directly - it's
// only browsers that refuse to send that part over the wire.

function parseDigestChallenge(header) {
  const result = {};
  const regex = /(\w+)=(?:"([^"]*)"|([^,]+))/g;
  let match;
  while ((match = regex.exec(header)) !== null) {
    result[match[1]] = match[2] !== undefined ? match[2] : match[3];
  }
  return result;
}

function buildDigestAuthHeader({ username, password, method, uri, challenge }) {
  const nc = '00000001';
  const cnonce = crypto.randomBytes(8).toString('hex');
  const qop = challenge.qop ? challenge.qop.split(',')[0].trim() : undefined;

  const ha1 = crypto.createHash('md5').update(`${username}:${challenge.realm}:${password}`).digest('hex');
  const ha2 = crypto.createHash('md5').update(`${method}:${uri}`).digest('hex');

  let responseHash;
  let authValue;
  if (qop) {
    responseHash = crypto.createHash('md5')
      .update(`${ha1}:${challenge.nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
      .digest('hex');
    authValue = `Digest username="${username}", realm="${challenge.realm}", nonce="${challenge.nonce}", uri="${uri}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${responseHash}"`;
  } else {
    responseHash = crypto.createHash('md5')
      .update(`${ha1}:${challenge.nonce}:${ha2}`)
      .digest('hex');
    authValue = `Digest username="${username}", realm="${challenge.realm}", nonce="${challenge.nonce}", uri="${uri}", response="${responseHash}"`;
  }
  if (challenge.opaque) authValue += `, opaque="${challenge.opaque}"`;
  return authValue;
}

async function proxyDigestStream(targetUrlStr, res) {
  const targetUrl = new URL(targetUrlStr);
  const username = decodeURIComponent(targetUrl.username);
  const password = decodeURIComponent(targetUrl.password);
  const uri = targetUrl.pathname + targetUrl.search;
  const isHttps = targetUrl.protocol === 'https:';
  const httpModule = isHttps ? https : http;
  const port = targetUrl.port || (isHttps ? 443 : 80);

  // Some embedded devices (this NVR included, apparently) tie a Digest nonce
  // to the specific TCP connection it was issued on, rather than accepting
  // it on a fresh connection - which is what a browser naturally does since
  // it reuses one connection for the challenge + authenticated retry. Force
  // that same behavior here with a single-socket keep-alive agent shared by
  // both requests below.
  const agent = new httpModule.Agent({ keepAlive: true, maxSockets: 1 });
  const baseOptions = { hostname: targetUrl.hostname, port, path: uri, method: 'GET', agent };

  // Step 1: challenge probe (no credentials) - discard the body, we only need
  // the WWW-Authenticate header (realm/nonce/qop/opaque).
  const challenge = await new Promise((resolve, reject) => {
    const probeReq = httpModule.request(baseOptions, (probeRes) => {
      probeRes.resume();
      if (probeRes.statusCode !== 401 || !probeRes.headers['www-authenticate']) {
        reject(new Error(`Camera did not return a digest auth challenge (status ${probeRes.statusCode})`));
        return;
      }
      const parsed = parseDigestChallenge(probeRes.headers['www-authenticate']);
      console.log('--- Digest challenge received ---');
      console.log('Raw header:', probeRes.headers['www-authenticate']);
      console.log('Parsed:', parsed);
      resolve(parsed);
    });
    probeReq.on('error', reject);
    probeReq.end();
  });

  const authValue = buildDigestAuthHeader({ username, password, method: 'GET', uri, challenge });
  console.log('--- Sending authenticated request ---');
  console.log('URI used in hash:', uri);
  console.log('Authorization header:', authValue);

  // Step 2: authenticated streaming request, over the same agent/connection.
  return new Promise((resolve, reject) => {
    const authReq = httpModule.request(
      { ...baseOptions, headers: { Authorization: authValue } },
      (streamRes) => {
        if (streamRes.statusCode !== 200) {
          streamRes.resume();
          reject(new Error(`Camera returned status ${streamRes.statusCode}`));
          return;
        }
        res.setHeader('Content-Type', streamRes.headers['content-type'] || 'multipart/x-mixed-replace');
        streamRes.pipe(res);
        res.on('close', () => streamRes.destroy());
        streamRes.on('error', reject);
        streamRes.on('end', resolve);
      }
    );
    authReq.on('error', reject);
    authReq.end();
  });
}

app.get('/api/camera-proxy', async (req, res) => {
  const targetUrlStr = req.query.url;
  if (!targetUrlStr) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    await proxyDigestStream(targetUrlStr, res);
  } catch (error) {
    console.error('Camera proxy error:', error.message);
    if (!res.headersSent) {
      res.status(502).json({ error: `Unable to reach camera: ${error.message}` });
    }
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
