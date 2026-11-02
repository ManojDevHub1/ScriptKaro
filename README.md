# ScriptKaro 🎬🔥

> **Topic do, viral reel script lo. 60 seconds mein.**

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-8E75C2?style=for-the-badge&logo=google)](https://aistudio.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**ScriptKaro** is a high-speed, AI-powered reel & video scriptwriter built specifically for Indian creators publishing daily on **Instagram Reels** and **YouTube Shorts**. 

Enter any topic, select your preferred language (*Roman Hinglish, Hindi, or English*), target duration (*30s, 60s, or 90s*), and tone (*Hype, Funny, or Informative*). ScriptKaro generates a complete viral video package with scroll-stopping 3-second hooks, scene-wise camera directions, teleprompter-ready lines, clean captions, and trending hashtags.

---

## ✨ Features

- **🎯 3 Scroll-Stopping Hooks (0–3s)**: High Curiosity/FOMO, Pain Point, and Mindblown hooks scientifically engineered to beat the scroll.
- **📌 Grounded Key Facts**: Optional facts box (features, pricing, links) so the AI never invents or hallucinates fake claims.
- **⏱️ Scene-Wise Timestamps & Camera Cues**: Paced scene breakdowns with dialogue and exact editing/visual cues (B-roll, zooms, onscreen text popups).
- **🗣️ Natural Roman Hinglish & Creator Slang**: Real conversational cadence (*"Bhai yeh secret trick dekh ke dimaag hil jayega"*) rather than robotic translation.
- **🔄 Multi-Provider AI Fallback**: Resilient cascading provider pipeline: **Google Gemini Flash ➔ Groq (Llama 3.3 70B) ➔ OpenRouter Free Models**.
- **📋 1-Click Copy & Confetti**: Copy individual hooks, scenes, captions, hashtags, or the entire script package with one click.
- **⚡ Upstash Redis & Distributed Cache**: Global sub-100ms caching and rate limiting via Upstash Redis (with seamless in-memory fallback).
- **🛡️ Rate-Limited & Protected**: Built-in IP-based rate limiting (10 req/min) with polite retry notices.
- **💾 Local History**: Last 10 scripts saved automatically in your browser's `localStorage` (no account or database needed).
- **📱 PWA & Mobile-First Design**: Installable on iOS and Android devices, with touch targets sized at 44px+ and fluid responsive typography.
- **🌙 Dark Glassmorphism UI**: High-contrast, premium aesthetic (`#0A0A0D` background with `#FF7A1A` vibrant orange accents).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15.5](https://nextjs.org/) (App Router, Server Actions, Dynamic Metadata) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) with Custom Glassmorphism |
| **Motion** | [Framer Motion](https://www.framer.com/motion/) (Word-by-word hero reveals, spring cards, interactive micro-interactions) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **AI Providers** | Google Gemini (`@google/genai`), Groq API, OpenRouter API |
| **Audio & Canvas** | Canvas Confetti for joyful feedback |

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/ManojDevHub1/ScriptKaro.git
cd ScriptKaro
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API Keys

Create a `.env.local` file in the root directory:

```env
# Google Gemini (Primary Provider - Free tier available)
# Get your free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Groq (Optional Fallback - Llama 3.3 70B Versatile)
# Get key at: https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here

# OpenRouter (Optional Tertiary Fallback - Free models)
# Get key at: https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
ScriptKaro/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts        # POST endpoint with Rate-Limiting, CORS & Fallback
│   ├── globals.css             # Tailwind layers, glassmorphism & safe-area styles
│   ├── layout.tsx              # SEO metadata, PWA viewport, font configuration
│   ├── opengraph-image.tsx     # Dynamic social sharing preview card
│   ├── page.tsx                # Main application page with Hero, Form & Results
│   ├── robots.txt/route.ts     # Search engine crawler permissions
│   └── sitemap.xml/route.ts    # Auto-generated XML sitemap
├── components/
│   ├── ClapperLoader.tsx       # Animated film reel loading state
│   ├── ErrorBoundary.tsx       # UI crash protection wrapper
│   ├── HistoryList.tsx         # Local storage saved scripts drawer
│   ├── MagneticButton.tsx      # Physics-based magnetic hover button
│   ├── ResultCard.tsx          # Copyable glass result containers
│   ├── ScriptView.tsx          # Scene breakdown with visual directions
│   ├── SettingsModal.tsx       # Custom user API key settings dialog
│   └── TopicForm.tsx           # Topic input form with dynamic typing placeholder
├── lib/
│   ├── ai.ts                   # Multi-provider cascade (Gemini -> Groq -> OpenRouter)
│   ├── cache.ts                # In-memory TTL cache (10 min expiration)
│   ├── prompt.ts               # Master viral prompt with injection defense
│   ├── rate-limit.ts           # Per-IP rate limiting engine
│   ├── types.ts                # TypeScript interfaces and schema contracts
│   └── validator.ts            # Strict request schema and character validation
├── public/
│   ├── logo.svg                # Vector brand logo
│   └── manifest.json           # Progressive Web App (PWA) manifest
├── next.config.ts              # Security headers (CSP, X-Frame-Options, HSTS)
├── package.json
└── tailwind.config.ts
```

---

## 🔒 Security & Privacy

- **Safe Credential Handling**: Server API keys are stored exclusively in `.env.local` and `.gitignore` ensures they are never committed.
- **Client Key Isolation**: Any custom API key entered by the user is stored solely in their browser's local storage and never logged on the server.
- **Input Sanitization**: Topics are strictly validated (3–200 characters), stripped of script tags, and prompt injection protected using isolated `<user_topic>` XML enclosures.
- **Security Headers**: Includes `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`.
- **Zero XSS**: Scripts and hooks are outputted safely as standard React text nodes without using raw HTML injection.

---

## 🚀 Deployment to Vercel

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your `ScriptKaro` repository.
4. In **Environment Variables**, add `GEMINI_API_KEY` (and optional fallback keys).
5. Click **Deploy**.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
