const sampleData = [
  1.2, 2.5, 1.7, 5.6, 1.4, 2.1, 3.2, 1.3, 7.4, 2.8,
  1.8, 6.2, 1.5, 2.9, 1.1, 4.9, 2.2, 1.6, 3.5, 1.9,
  1.3, 8.1, 2.4, 1.7, 1.2, 5.1, 2.0, 1.4, 3.8, 1.8,
  1.1, 2.7, 4.5, 1.6, 2.3, 1.8, 3.7, 1.2, 6.5, 2.1,
  1.5, 1.9, 3.3, 1.4, 7.1, 2.8, 1.7, 5.2, 2.6, 1.3
];

function parseHistory(raw) {
  if (!raw || !raw.trim()) return [];

  return raw
    .split(/[ ,\n\r\t]+/)
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);
}

function calcStats(history) {
  if (!history.length) {
    return {
      avg: 0,
      median: 0,
      min: 0,
      max: 0,
      p95: 0,
      risk: 0,
      riskText: "No data",
      distribution: {},
      summary: "Add round history to view the statistical summary."
    };
  }

  const sorted = [...history].sort((a, b) => a - b);
  const avg = history.reduce((sum, value) => sum + value, 0) / history.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const p95Index = Math.max(0, Math.ceil(sorted.length * 0.95) - 1);
  const p95 = sorted[p95Index];

  const variance = history.reduce((sum, value) => sum + (value - avg) ** 2, 0) / history.length;
  const stdDev = Math.sqrt(variance);
  const risk = Math.min(100, Math.round((stdDev / 7) * 100));

  const ranges = {
    "1.0x-1.5x": 0,
    "1.5x-2.0x": 0,
    "2.0x-3.0x": 0,
    "3.0x-5.0x": 0,
    "5.0x+": 0
  };

  history.forEach((value) => {
    if (value < 1.5) ranges["1.0x-1.5x"]++;
    else if (value < 2.0) ranges["1.5x-2.0x"]++;
    else if (value < 3.0) ranges["2.0x-3.0x"]++;
    else if (value < 5.0) ranges["3.0x-5.0x"]++;
    else ranges["5.0x+"]++;
  });

  Object.keys(ranges).forEach((key) => {
    ranges[key] = (ranges[key] / history.length) * 100;
  });

  const topRange = Object.entries(ranges).sort((a, b) => b[1] - a[1])[0];
  const summary = `Most frequent range: ${topRange[0]} (${topRange[1].toFixed(1)}%). Average multiplier: ${avg.toFixed(2)}x. Median: ${median.toFixed(2)}x. Highest multiplier seen: ${max.toFixed(2)}x.`;

  return {
    avg,
    median,
    min,
    max,
    p95,
    risk,
    riskText: risk < 35 ? "Low" : risk < 70 ? "Moderate" : "High",
    distribution: ranges,
    summary
  };
}

function renderDistribution(distribution) {
  const container = document.getElementById("distributionContainer");
  container.innerHTML = "";

  Object.entries(distribution).forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "bar-row";

    const labelEl = document.createElement("span");
    labelEl.textContent = label;

    const track = document.createElement("div");
    track.className = "bar-track";

    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = `${Math.max(value, 2)}%`;

    track.appendChild(fill);

    const amount = document.createElement("span");
    amount.textContent = `${value.toFixed(1)}%`;

    row.appendChild(labelEl);
    row.appendChild(track);
    row.appendChild(amount);

    container.appendChild(row);
  });
}

function renderStats(history) {
  const stats = calcStats(history);

  document.getElementById("avgValue").textContent = stats.avg ? `${stats.avg.toFixed(2)}x` : "-";
  document.getElementById("medianValue").textContent = stats.median ? `${stats.median.toFixed(2)}x` : "-";
  document.getElementById("minValue").textContent = stats.min ? `${stats.min.toFixed(2)}x` : "-";
  document.getElementById("maxValue").textContent = stats.max ? `${stats.max.toFixed(2)}x` : "-";
  document.getElementById("p95Value").textContent = stats.p95 ? `${stats.p95.toFixed(2)}x` : "-";
  document.getElementById("riskValue").textContent = stats.risk ? `${stats.risk}/100` : "-";

  document.getElementById("riskBar").style.width = `${stats.risk || 0}%`;
  document.getElementById("riskText").textContent = stats.riskText || "-";

  renderDistribution(stats.distribution);

  document.getElementById("summaryBox").innerHTML = `
    <strong>Summary</strong><br />
    ${stats.summary}
  `;
}

function drawChart(history) {
  const canvas = document.getElementById("chartCanvas");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#0e1728";
  ctx.fillRect(0, 0, width, height);

  const padding = { top: 20, right: 20, bottom: 32, left: 38 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  if (!history.length) {
    ctx.fillStyle = "#a9bfd9";
    ctx.font = "16px Arial";
    ctx.fillText("No data available", padding.left + 10, height / 2);
    return;
  }

  const maxValue = Math.max(...history, 1);
  const bins = 12;
  const binSize = Math.max(1, (maxValue + 0.2) / bins);
  const bucketCounts = Array.from({ length: bins }, () => 0);

  history.forEach((value) => {
    const idx = Math.min(bins - 1, Math.floor(value / binSize));
    bucketCounts[idx]++;
  });

  const maxBucket = Math.max(...bucketCounts, 1);

  bucketCounts.forEach((count, idx) => {
    const x = padding.left + (idx / bins) * chartWidth + 8;
    const barWidth = chartWidth / bins - 12;
    const barHeight = (count / maxBucket) * chartHeight;

    ctx.fillStyle = idx % 2 === 0 ? "#5eead4" : "#8b5cf6";
    ctx.fillRect(x, height - padding.bottom - barHeight, barWidth, barHeight);

    ctx.fillStyle = "#a9bfd9";
    ctx.font = "10px Arial";
    const label = `${(idx * binSize).toFixed(1)}x`;
    ctx.fillText(label, x, height - 10);
  });
}

function analyzeHistory() {
  const raw = document.getElementById("historyInput").value;
  const history = parseHistory(raw);
  renderStats(history);
  drawChart(history);
}

function loadSampleData() {
  document.getElementById("historyInput").value = sampleData.join(", ");
  analyzeHistory();
}

function getWeightedRandomValue(distribution, min = 1, max = 10) {
  const weighted = [];

  for (let i = min; i <= max; i += 0.1) {
    const value = Number(i.toFixed(1));
    const chance = distribution[value] || 0;
    if (chance > 0) weighted.push({ value, chance });
  }

  if (!weighted.length) {
    return 1 + Math.random() * 5;
  }

  const total = weighted.reduce((sum, item) => sum + item.chance, 0);
  let roll = Math.random() * total;

  for (const item of weighted) {
    roll -= item.chance;
    if (roll <= 0) return item.value;
  }

  return weighted[weighted.length - 1].value;
}

function simulateStrategy() {
  const history = parseHistory(document.getElementById("historyInput").value);
  const startingBalance = Number(document.getElementById("balance").value) || 100;
  const bet = Number(document.getElementById("bet").value) || 10;
  const strategy = document.getElementById("strategy").value;
  const rounds = Number(document.getElementById("rounds").value) || 50;

  const baseDistribution = {};

  if (history.length) {
    const ranges = {};

    for (let value = 1; value <= 10; value += 0.1) {
      ranges[Number(value.toFixed(1))] = 0;
    }

    history.forEach((value) => {
      const key = Number(Math.min(10, Number(value.toFixed(1))).toFixed(1));
      if (ranges[key] !== undefined) ranges[key]++;
    });

    const total = Object.values(ranges).reduce((sum, value) => sum + value, 0) || 1;
    Object.keys(ranges).forEach((key) => {
      ranges[key] = (ranges[key] / total) * 100;
    });

    Object.assign(baseDistribution, ranges);
  } else {
    Object.assign(baseDistribution, {
      1.0: 18, 1.1: 14, 1.2: 12, 1.3: 10, 1.4: 8, 1.5: 7,
      1.6: 6, 1.7: 5, 1.8: 5, 1.9: 4, 2.0: 4, 2.1: 3, 2.2: 2,
      2.3: 2, 2.4: 2, 2.5: 2, 2.6: 2, 2.7: 1, 2.8: 1, 2.9: 1,
      3.0: 1, 3.5: 1, 4.0: 1, 4.5: 0.5, 5.0: 0.5, 6.0: 0.5,
      7.0: 0.3, 8.0: 0.2, 9.0: 0.1, 10.0: 0.1
    });
  }

  let balance = startingBalance;
  let currentBet = bet;
  let wins = 0;
  let losses = 0;

  for (let i = 0; i < rounds; i++) {
    const value = getWeightedRandomValue(baseDistribution, 1, 10);
    const payout = value * currentBet;

    if (strategy === "flat") {
      if (value >= 1.01) {
        balance += payout - currentBet;
        wins++;
      } else {
        balance -= currentBet;
        losses++;
      }
    } else if (strategy === "martingale") {
      if (value >= 1.01) {
        balance += payout - currentBet;
        wins++;
        currentBet = bet;
      } else {
        balance -= currentBet;
        losses++;
        currentBet = Math.min(balance * 0.8, currentBet * 2);
        if (currentBet < 1) currentBet = bet;
      }
    } else if (strategy === "anti") {
      if (value >= 1.01) {
        balance += payout - currentBet;
        wins++;
        currentBet = Math.min(balance * 0.5, currentBet * 2);
      } else {
        balance -= currentBet;
        losses++;
        currentBet = Math.max(bet, currentBet / 2);
      }
    }

    if (balance <= 0) break;
  }

  const finalBalance = balance.toFixed(2);
  const delta = (balance - startingBalance).toFixed(2);

  document.getElementById("simulateResult").innerHTML = `
    <strong>Simulation result</strong><br />
    Starting balance: $${startingBalance.toFixed(2)}<br />
    Final balance: $${finalBalance}<br />
    Net change: <strong>${Number(delta) >= 0 ? "+" : ""}$${delta}</strong><br />
    Wins: ${wins} | Losses: ${losses}<br /><br />
    This is an educational simulation and not a real prediction system.
  `;
}

document.getElementById("analyzeBtn").addEventListener("click", analyzeHistory);
document.getElementById("loadSampleBtn").addEventListener("click", loadSampleData);
document.getElementById("simulateBtn").addEventListener("click", simulateStrategy);

loadSampleData();
