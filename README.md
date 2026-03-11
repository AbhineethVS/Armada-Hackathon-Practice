# ⚓ Atlas AI Briefing

> **AI-Powered Maritime Operations Dashboard** — Built for Armada's Atlas Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org)
[![Groq](https://img.shields.io/badge/AI-Groq%20Llama%203.3%2070B-orange?style=flat-square)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![CodeReCET](https://img.shields.io/badge/CodeReCET-2026-purple?style=flat-square)](https://cet.ac.in)

---

## 🚢 The Problem

Fleet managers, NOC analysts and safety officers at maritime companies spend **45–60 minutes every morning** manually checking 8+ independent dashboards to understand the state of their fleet. This fragmented process increases the risk of missed critical alerts — alerts that can put crew safety at risk and cost companies tens of thousands of dollars per incident.

## ✨ The Solution

Atlas AI Briefing gives every maritime operator a **single intelligent dashboard** that generates a personalized AI briefing in seconds. One page. Two minutes. Nothing missed.

> _"Captain Rajan opens one page, speaks two words, and knows everything about his 50 vessels across the Indian Ocean. Hands free. In 2 minutes."_

---

## 🎯 Features

### Core

- **Role-Based AI Briefings** — Fleet Manager, NOC Analyst, and Safety Officer each receive completely different briefings tailored to their priorities
- **Ask Your Fleet** — Natural language chatbot powered by Groq AI to query any aspect of fleet status
- **5-Section Briefing Format** — Needs Immediate Attention | Trending Issues | All Clear | Upcoming This Week | Recommended Actions

### Visual Intelligence

- **Interactive Vessel Map** — Leaflet.js map with live vessel positions, green/red status dots, click any vessel for details
- **Analytics Charts** — Online/offline doughnut, data usage bar chart, 30-day uptime trend line
- **Vessel Detail Panel** — Role-specific information and action buttons per vessel
- **30-Day History Tab** — Collapsible daily stats table with full historical breakdown
- **Anomaly Badges** — Automatic ⚠️ warnings when today's metrics deviate from historical baseline

### AI Intelligence

- **Pattern Detection** — AI references 14 days of historical briefings to identify recurring issues
- **Weather Context** — Signal issues explained with real atmospheric event data
- **Threshold Alerts** — Auto popup when vessel offline >2hrs or data usage >90%
- **Shift Handover Summary** — One-page summary view for incoming shift officers

### Wow Factor

- **🎤 Voice Briefing** — Click to hear the entire briefing read aloud (Web Speech API)
- **🎙️ Dictate Mode** — Speak questions into the chat, completely hands free
- **📧 Email Briefing** — One-click dispatch of formatted briefing to operations team
- **📄 PDF Export** — Download today's briefing as a formatted PDF
- **🔔 Live Alerts** — Real-time push notifications with sound for critical vessel events
- **🔄 Auto Refresh** — Silent data refresh every 5 minutes
- **📱 Mobile Responsive** — Full dashboard on any device

---

## 🏗️ System Architecture

```
User (Fleet Manager / NOC Analyst / Safety Officer)
              │
              ▼
    ┌─────────────────┐
    │  Role Selection  │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │  Node.js/Express │  ← reads fleetData.json + historical txt files
    │     Backend      │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │   Groq API       │  ← Llama 3.3 70B
    │  (Llama 3.3 70B) │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │  HTML/CSS/JS     │  ← Leaflet.js + Chart.js + Web Speech API
    │    Frontend      │
    └─────────────────┘
```

---

## 🛠️ Tech Stack

| Layer    | Technology               |
| -------- | ------------------------ |
| Backend  | Node.js + Express        |
| Frontend | HTML + CSS + JavaScript  |
| AI Model | Groq API — Llama 3.3 70B |
| Maps     | Leaflet.js               |
| Charts   | Chart.js                 |
| Voice    | Web Speech API           |
| Email    | Nodemailer               |
| Hosting  | Railway                  |

**Total infrastructure cost: $0**

---

## 📁 Project Structure

```
atlas-ai-briefing/
├── server.js
├── package.json
├── .env                        ← GROQ_API_KEY (never committed)
├── .gitignore
├── data/
│   ├── fleetData.json          ← vessel telemetry data
│   ├── weatherEvents.json      ← atmospheric events context
│   ├── supportTickets.json     ← open support tickets
│   ├── safetyIncidents.json    ← safety incident records
│   └── daily_briefings/
│       ├── 2026-02-01.txt      ← 14 days of historical briefings
│       └── monthly_summary.txt
└── public/
    ├── index.html
    ├── style.css
    └── script.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### Installation

```bash
# Clone the repo
git clone https://github.com/AbhineethVS/Armada-Hackathon-Practice.git
cd Armada-HAckathon-Practice

# Install dependencies
npm install

# Create your .env file
echo "GROQ_API_KEY=your_key_here" > .env

# Start the server
node server.js
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 The Three Roles

### 📊 Fleet Manager

Focuses on business impact — uptime percentages, cost implications, data overages, and high-level recommendations. Action buttons: Call Operations Head, View Cost Report, Escalate to Management.

### 📡 NOC Analyst

Focuses on technical details — signal strength in dBm, connection logs, coordinates, hardware faults. Action buttons: Call Vessel, Attempt Reconnect, View Full Logs.

### 🆘 Safety Officer

Focuses on crew welfare — communication blackouts, crew counts, nearest coast guard, emergency protocols. Action buttons: Alert Coast Guard, Emergency Call, Initiate SAR Protocol.

---

## 🔮 Roadmap

- [x] Role-based AI briefings
- [x] Ask Your Fleet chatbot
- [x] Stat cards with live counts
- [x] Markdown rendering
- [ ] Interactive vessel map
- [ ] Chart.js analytics
- [ ] Voice briefing + dictate mode
- [ ] Anomaly detection
- [ ] Email + PDF export
- [ ] Railway deployment

---

## 🏆 Built For

**CodeReCET 2026** — Annual Hackathon at College of Engineering Trivandrum, powered by Armada.
Problem Statement 13: AI-Generated Daily Operations Briefing.

---

## 📄 License

MIT License — feel free to use, modify and distribute.

---

<p align="center">Built with ☕ by Team 404_not_found | CET Trivandrum 2026</p>
