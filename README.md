# MIFOS Sensor Dashboard

A professional web-based dashboard for monitoring fiber optic sensor data from MIFOS systems. Real-time visualization of signal traces, waterfall diagrams, alert locations on Google Maps, and CCTV monitoring.

## ✨ Features

### 📊 Dashboard Tab
- **Waterfall Diagram**: Real-time 2D visualization of signal history
- **Latest Trace**: Current single-trace measurement
- **Data Acquisition Control**: Start/stop sensor data collection
- **Auto-Refresh**: Updates every 2 seconds during acquisition
- **Connection Status**: Real-time server connectivity indicator

### ⚙️ Settings Tab
- **Server Configuration**: Connect to your MIFOS backend
- **ROI (Region of Interest)**: Adjust signal range
- **Location Range**: Configure monitoring area
- **Magnitude Range**: Set signal amplitude limits
- **Meter Unit Toggle**: Switch between different measurement units
- **CCTV Camera Configuration**: Add and manage IP cameras
- **Google Maps Configuration**: Set up map parameters

### 🗺️ Monitoring Tab
- **Fiber Route Map**: Interactive Google Maps showing cable route
- **Alert Markers**: Real-time alert locations with color coding
- **Alert Legend**: Color-coded severity levels (Critical, Warning, Info, Resolved)
- **CCTV Feeds**: Live camera monitoring
- **Recent Alerts**: Time-stamped alert history

### 🚨 Alarms Tab
- **Add Alarms**: Set custom threshold values
- **Manage Alarms**: View and toggle configured alarms
- **Alarm Events**: Monitor triggered events with timestamps
- **Reset Function**: Clear all alarms

### 🔒 Security Features
✅ HTTPS encryption (when deployed)
✅ Environment variables for sensitive data
✅ CORS protection
✅ Input validation
✅ Secure API communication

## Quick Start

### Prerequisites

- Node.js 14+ and npm
- Access to MIFOS Flask backend (running on your local network)

### Installation

1. **Extract the project**:
   ```bash
   cd mifos-web-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open in browser**:
   - Local: `http://localhost:3000`
   - Remote: Use the provided public URL

### Configuration

1. Navigate to the **Settings** tab
2. Enter your MIFOS server URL (e.g., `http://192.168.1.100:5000`)
3. Click **Test Connection** to verify connectivity
4. Once connected, adjust display parameters as needed:
   - **ROI**: Region of Interest range
   - **Location**: Fiber distance range in meters
   - **Magnitude**: Signal intensity range
   - **Meter**: Toggle between meter and sample units

## Tabs Overview

### Dashboard
- View real-time waterfall diagrams and signal traces
- Start/stop data acquisition
- Monitor connection status and acquisition status
- Auto-refresh plots during acquisition
- View current display settings

### Settings
- Configure server connection
- Adjust ROI, location, and magnitude ranges
- Toggle meter unit display
- Test connection to verify server accessibility

### Alarms
- Add new alarm thresholds
- Enable/disable individual alarms
- Delete alarms
- View triggered alarm events with location information
- Reset all alarms

## API Endpoints

The application uses the following backend API endpoints:

- `GET /data/get_plots` - Retrieve waterfall and single-trace plots
- `POST /data/dm` - Toggle data acquisition
- `GET /data/dm` - Get acquisition status
- `GET/POST /data/roi` - Region of Interest settings
- `GET/POST /data/locations` - Location range settings
- `GET/POST /data/magnitude` - Magnitude range settings
- `GET /data/meter` - Meter unit settings
- `GET/POST /data/alarm` - Alarm management
- `POST /data/alarm/toggle` - Toggle alarm enabled state
- `POST /data/alarm/delete` - Delete alarm
- `POST /data/alarm/reset` - Reset all alarms
- `GET /data/alarm/events` - Get triggered alarm events

## 🚀 Deployment

### Option 1: Deploy to Render.com (Recommended - FREE)

**Best for:** Production use with automatic HTTPS and free hosting

**Features:**
- ✅ Free tier available
- ✅ Automatic HTTPS/SSL encryption
- ✅ DDoS protection
- ✅ Easy GitHub integration
- ✅ Automatic deployments

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions.**

### Option 2: Local Network
1. Start the server on your machine
2. Access from any device on the network using your machine's IP address
3. Example: `http://192.168.1.100:3000`

### Option 3: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t mifos-dashboard .
docker run -p 3000:3000 mifos-dashboard
```

### Option 4: Other Cloud Platforms
- **Railway.app**: Free tier with $5 monthly credit
- **Replit**: Completely free
- **Heroku**: Free tier (limited)
- **DigitalOcean**: $5-10/month

## Environment Variables

Optional configuration via environment variables:

```bash
PORT=3000                    # Server port (default: 3000)
NODE_ENV=production         # Environment mode
```

## Troubleshooting

### Connection Failed
- Verify the MIFOS server is running and accessible
- Check the server URL format (include protocol and port)
- Ensure firewall allows connections to the MIFOS server port
- Test with `curl` or browser to verify server accessibility

### Plots Not Displaying
- Start data acquisition using the **Dashboard** tab
- Verify the MIFOS server is actively capturing sensor data
- Check browser console for error messages
- Ensure plots are being generated on the backend

### Auto-Refresh Not Working
- Click **Enable** in the Auto Refresh section
- Verify data acquisition is running
- Check network connectivity to the backend server

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

1. **Reduce Refresh Rate**: For slower networks, increase the refresh interval in `index.html` (line ~600)
2. **Optimize Plot Size**: Adjust plot container height in CSS for faster rendering
3. **Monitor Network**: Use browser DevTools to monitor API response times
4. **Server Optimization**: Ensure MIFOS backend is optimized for plot generation

## 🔐 Security Best Practices

✅ **HTTPS**: Always use HTTPS in production (automatic on Render.com)
✅ **API Keys**: Store sensitive keys in environment variables
✅ **Firewall**: Use firewall rules to restrict access
✅ **Updates**: Keep Node.js and dependencies updated
✅ **Authentication**: Consider adding login for sensitive environments
✅ **CORS**: Properly configure CORS for your MIFOS server

**Recommended:** Deploy to Render.com for automatic security features

## Support

For issues or feature requests:
1. Check the troubleshooting section above
2. Verify MIFOS backend is functioning correctly
3. Review browser console for error messages
4. Check server logs for backend issues

## License

MIT License - See LICENSE file for details

## Version

Version 1.0.0 - Initial Release
