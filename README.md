# Daily Compass

Minimal smart daily planning app as a web PWA.

## Features

- Morning kickoff prompt: "What would make today successful?"
- Daily task list with must-do priorities
- Week Planner view with day-by-day navigation bar
- Top navbar with separate Dashboard, Planner, and Notes sections
- Dropdown actions and slideout quick panel
- Mark tasks complete
- Context labels: `Home`, `Work`, `Errands`
- Voice capture task input (when browser supports Web Speech API)
- Auto rollover of unfinished tasks to the next day
- End-of-day recap with delayed-task reasons
- Streak and consistency score
- Weekly review dashboard: wins, missed patterns, time usage
- Gentle reminders based on your routine
- Notes section with search, sort, pin, edit, and delete
- Installable PWA for iPhone Home Screen

## Run locally

Serve this folder with any static server, for example:

```powershell
cd D:\app1
python -m http.server 5500 --bind 0.0.0.0
```

Open:

- Desktop: `http://localhost:5500`
- iPhone on same Wi-Fi: `http://<your-computer-ip>:5500`

## Install on iPhone

1. Open the app URL in Safari.
2. Tap Share.
3. Tap **Add to Home Screen**.

## Deploy Online (GitHub Pages)

1. Create an empty GitHub repository.
2. Run:

```powershell
cd D:\app1
git init
git add .
git commit -m "Initial Daily Compass app"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

3. In GitHub repo settings, open **Pages** and set Source to **GitHub Actions**.
4. Wait for the `Deploy To GitHub Pages` workflow to finish.
5. Open:

`https://<your-username>.github.io/<your-repo>/`

Then add that URL to iPhone Home Screen from Safari.
