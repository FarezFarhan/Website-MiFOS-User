# MIFOS Dashboard - Render.com Deployment Guide

This guide will help you deploy the MIFOS Dashboard to Render.com for free with automatic HTTPS security.

## Prerequisites

Before starting, make sure you have:
- A GitHub account (free at github.com)
- A Render.com account (free at render.com)
- Git installed on your computer

## Step-by-Step Deployment

### Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Name it: `mifos-dashboard`
4. Choose **Public** (so Render can access it)
5. Click **Create repository**
6. Copy the repository URL (you'll need it soon)

### Step 2: Download Project Files

1. Go to your MIFOS Dashboard Management UI
2. Click **Code** panel (top right)
3. Click **Download all files**
4. Extract the ZIP file to a folder on your computer
5. Open terminal/command prompt in that folder

### Step 3: Initialize Git and Push to GitHub

Run these commands in your project folder:

```bash
# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial MIFOS Dashboard deployment"

# Add GitHub as remote (replace YOUR_USERNAME and YOUR_REPO_URL)
git remote add origin https://github.com/YOUR_USERNAME/mifos-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** You may need to authenticate with GitHub. Follow the prompts.

### Step 4: Deploy to Render.com

1. Go to [render.com](https://render.com) and sign in
2. Click **New +** → **Web Service**
3. Click **Connect a repository**
4. Search for `mifos-dashboard` and click **Connect**
5. Fill in the deployment form:

   | Field | Value |
   |-------|-------|
   | **Name** | `mifos-dashboard` |
   | **Environment** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Plan** | `Free` |

6. Click **Create Web Service**
7. Wait for deployment (2-5 minutes)
8. Once complete, you'll get a URL like: `https://mifos-dashboard.onrender.com`

### Step 5: Configure Environment Variables (Optional)

If you want to add security features later:

1. Go to your Render service dashboard
2. Click **Environment** in the left sidebar
3. Add new environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`

### Step 6: Test Your Deployment

1. Open the provided URL in your browser
2. You should see the MIFOS Dashboard
3. Go to **Settings** tab
4. Enter your MIFOS server URL (e.g., `http://192.168.1.100:5000`)
5. Click **Test Connection**
6. If successful, you're ready to use it!

## Important Notes

### Security Features (Automatic)
✅ HTTPS encryption (automatic SSL certificate)
✅ DDoS protection
✅ Secure environment variables
✅ Regular security updates

### Free Tier Limitations
- May sleep after 15 minutes of inactivity
- Wakes up when you access it (no data loss)
- Perfect for monitoring and testing

### Updating Your Dashboard

To make changes:

1. Edit files locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```
3. Render automatically redeploys (2-5 minutes)

## Troubleshooting

### "Build failed" error
- Check that `package.json` exists in the root folder
- Ensure all dependencies are listed in `package.json`
- Check the build logs in Render dashboard

### "Cannot connect to MIFOS server"
- Make sure your MIFOS server URL is correct
- Check that your MIFOS server is running
- If MIFOS is on your local network, use its local IP (e.g., `http://192.168.1.100:5000`)

### Dashboard is slow or unresponsive
- Free tier may have limited resources
- Upgrade to paid plan if needed
- Check Render dashboard for error logs

## Support

For issues with:
- **Render.com**: Visit [render.com/docs](https://render.com/docs)
- **MIFOS Dashboard**: Check the README.md in the project folder
- **GitHub**: Visit [github.com/support](https://github.com/support)

---

**Congratulations!** Your MIFOS Dashboard is now live and secure! 🎉
