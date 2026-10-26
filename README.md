# ⚡ SpeedTest — Internet Speed Test Web App

A fast, free internet speed test that runs entirely in your browser. No server, no sign-up, no build step.

**Live demo:** `https://<your-github-username>.github.io/speedtest-app/`

## Features
- 🏓 **Ping & jitter** — median of 5 measurements
- ⬇️ **Download speed** — 4 parallel streams from Cloudflare's global network, live gauge + graph
- ⬆️ **Upload speed** — parallel POST streams
- 📊 Animated speedometer gauge and live speed chart
- 🕐 Test history saved in your browser (last 10 tests)
- 📋 Copy/share your result in one click
- 📱 Fully responsive, dark theme

## How it works
Measurements use Cloudflare's public speed-test endpoints (`speed.cloudflare.com/__down` and `__up`) — the same network behind [speed.cloudflare.com](https://speed.cloudflare.com). All testing happens client-side; no data is collected.

## Run locally
```bash
python3 -m http.server 8000
# open http://localhost:8000
```
Or just open `index.html` in a browser.

## Deploy on GitHub Pages
1. Push this repo to GitHub
2. Repo **Settings → Pages → Source: GitHub Actions** (workflow is included in `.github/workflows/pages.yml`)
3. Your site goes live at `https://<username>.github.io/speedtest-app/`

Alternatively: Settings → Pages → Deploy from branch `main` / root.

## Files
- `index.html` — page structure
- `style.css` — styling
- `app.js` — speed test logic (ping / download / upload)

Made by Rayhan using Muse, under the order of Sir Nauman
