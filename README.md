# Aviator Analytics Dashboard

A browser-based dashboard that analyzes Aviator-style multiplier history in a transparent, non-predictive way.

Features:
- round history input
- CSV upload support
- sample CSV download
- average, median, min, max, and P95 calculations
- distribution by multiplier range
- risk analysis
- bar chart and line chart views
- simple strategy simulation

Important:
- This project does not predict the exact next crash.
- It is for historical analysis, trend review, and educational experimentation only.

## Run locally

Open `index.html` directly in your browser, or serve it locally:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Files
- `index.html` — app layout
- `styles.css` — styling
- `script.js` — analysis and simulation logic

## CSV format
You can upload a CSV with either single-column values or multiple values per row.

Example:

```csv
1.2
2.5
1.7
5.6
```

or:

```csv
1.2,2.5,1.7,5.6
3.1,1.4,2.0
```
