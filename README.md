# Aviator Analytics

A small browser-based app for viewing historical Aviator-style multiplier data in a more analytical and honest way.

What this project does:
- accepts round history input from the user
- calculates average, median, min, max, and P95
- groups results by multiplier ranges
- shows a chart of the historical distribution
- estimates a risk score based on variability
- simulates a few betting strategies using the observed data

Important:
- This app does not promise to know the exact next crash outcome.
- It is intended for educational analysis and statistical review only.

## Run locally

Open `index.html` in a browser.

If you want to serve it through a local web server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Project files
- `index.html` — main page
- `styles.css` — styling
- `script.js` — analysis logic and simulation

## Notes
This project is designed to be transparent and non-deceptive: it analyzes past round history and gives ranges and risk indicators, but it does not claim certainty about future outcomes.
