# Naked Jim — $JIM Campaign Tracker

A live X (Twitter) engagement tracker for the $JIM / #NakedJim campaign.

## Features
- Tracks posts with `$JIM`, `#NakedJim`, `#JIMshill`
- Account leaderboard with bot detection
- Post feed with engagement metrics
- Demo mode when API not connected

---

## Deploy to Render (Free)

### Step 1 — Push to GitHub
1. Create a new repository on GitHub called `naked-jim-tracker`
2. Upload all these files to the repo

### Step 2 — Connect to Render
1. Go to [render.com](https://render.com) and log in
2. Click **New → Web Service**
3. Connect your GitHub repo `naked-jim-tracker`
4. Render will auto-detect the settings from `render.yaml`
5. Click **Deploy**

### Step 3 — Add your Bearer Token
1. In Render, go to your service → **Environment**
2. Add a new variable:
   - Key: `X_BEARER_TOKEN`
   - Value: *(your Bearer Token from X Developer Portal)*
3. Save — Render will redeploy automatically

Your tracker will be live at: `https://naked-jim-tracker.onrender.com`

---

## Local Development
```bash
npm install
X_BEARER_TOKEN=your_token_here node server.js
```
Then open `http://localhost:3000`
