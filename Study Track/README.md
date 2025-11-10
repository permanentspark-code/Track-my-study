# Study Track

> Lightweight study tracker with per-task timers, notifications and local persistence.

This is a small static web app (HTML/CSS/JS). It works offline and can be installed as a PWA.

# Features
- Add tasks with a duration (minutes)
- Select a task and run a countdown timer
- Pause / Reset timer
- Mark tasks complete / Delete tasks
- Browser notifications + bell sound when a timer completes
- Data persisted in browser `localStorage`

## Files
- `index.html` — app UI
- `styles.css` — styling and background image
- `app.js` — app logic: tasks, timer, notifications, sound
- `.gitignore` — ignored files for Git

## Run locally (quick)
You can serve the app from the project directory. PWA features (service worker) require a local server (localhost is fine).

### Using Python (quick, no install)
```powershell
cd 'e:\Study Track'
# Python 3
python -m http.server 8000
# Open http://127.0.0.1:8000 in your browser
```

### Using Node (http-server)
```powershell
cd 'e:\Study Track'
npm install -g http-server
http-server . -p 3000 -a 127.0.0.1
# Open http://127.0.0.1:3000
```

## Upload to GitHub
Pick one of the following flows. Run these commands from the project folder (`e:\Study Track`).

### Option A — Using GitHub CLI (`gh`) (recommended):
```powershell
git init
git add .
git commit -m "Initial commit — Study Track"
gh repo create study-track --public --source=. --remote=origin --push
```

### Option B — Using the GitHub website:
```powershell
git init
git add .
git commit -m "Initial commit — Study Track"
```
- Create a new repo on https://github.com/new (name e.g. `study-track`).
- Then run (replace URL with your repo URL):
```powershell
git remote add origin https://github.com/yourusername/study-track.git
git branch -M main
git push -u origin main
```

## Publish with GitHub Pages (optional)
- In GitHub: Settings → Pages → Source → Select `main` branch and folder `/ (root)` → Save.
- After a minute your site is available at `https://yourusername.github.io/study-track`

## PWA & Notifications
- The app requests notification permission on first load. Grant it to receive desktop notifications when timers finish.
- The app also plays a bell sound when a timer completes. Browsers may block audio until the page receives user interaction — click anywhere on the page and test the sound using the "Test Sound" button in the footer.

## Troubleshooting
- If `git push` is rejected: run `git pull --rebase origin main` then push again.
- If notifications or sounds don't work:
  - Make sure your browser allows notifications for `localhost` or your custom hostname.
  - Click the page once (user interaction) then test the sound.
  - System volume and browser tab mute settings must allow audio.

## Next steps / Improvements
- Add a service worker and `manifest.json` to make the app fully installable (PWA). (If you want, I can add this.)
- Add a small build script and a `package.json` with an `npm start` script for local development.

---

If you want, I can now:
- Create `manifest.json` and `service-worker.js` for PWA installability, or
- Add `package.json` and `npm` scripts, or
- Initialize Git and create the remote repo for you (if you have `gh` installed and authenticated).
