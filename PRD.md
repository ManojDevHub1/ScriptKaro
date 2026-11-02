# ScriptKaro: PRD (Product Requirements Document)

> Topic do, viral reel script lo. 60 seconds mein.

## 1. Problem
Small creators (like me) spend 1-2 hours every day writing reel scripts, hooks, captions and hashtags. Writing a good hook is the hardest part, and Hinglish scripts are hard to get from normal AI tools.

## 2. Solution
A one-page web app. The user types a topic, picks a few options, and gets a ready-to-record 60-second Hinglish reel script, a scroll-stopping hook, a caption and hashtags, each with a copy button.

## 3. Target user
- Beginner Indian creators (tech, AI tools, education) on YouTube Shorts and Instagram Reels
- Age 15-25, posting daily, writing in Hinglish

## 4. Core features (MVP v1)
1. **Topic input**: a text box, e.g. "OpenJarvis free AI assistant"
2. **Options**:
   - Language: Hinglish (default), Hindi, English
   - Length: 30s / 60s / 90s
   - Tone: Funny, Informative, Hype
3. **Generate button**: calls the Gemini API
4. **Output cards** (each with a Copy button):
   - 3 hook options (first 3 seconds)
   - Full script, split into scenes with timestamps (0-3s, 3-10s ...)
   - Caption (clean English, 2-3 lines)
   - 10-15 hashtags
   - Thumbnail/cover text idea (max 5 words)
5. **Regenerate**: a new version with the same inputs
6. **History**: the last 10 scripts saved in the browser (localStorage)

## 5. Not in v1 (later)
- Login or accounts
- AI voice-over
- Auto video generation
- Payments

## 6. Tech stack
- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** (dark theme: background #0A0A0D, accent orange #FF7A1A)
- **Google Gemini API** (free tier). Model: gemini-2.5-flash
- API key ONLY on the server (`app/api/generate/route.ts`), in `.env.local` as `GEMINI_API_KEY`. Never put it in frontend code.
- Deploy: **Vercel** (free)

## 7. Folder structure
```
scriptkaro/
├── app/
│   ├── layout.tsx          # fonts, dark theme, metadata
│   ├── page.tsx            # main page: input form + results
│   ├── globals.css
│   └── api/
│       └── generate/
│           └── route.ts    # server: calls Gemini, returns JSON
├── components/
│   ├── TopicForm.tsx       # topic box + options + Generate button
│   ├── ResultCard.tsx      # one output card with Copy button
│   ├── ScriptView.tsx      # scene-wise script with timestamps
│   ├── HistoryList.tsx     # last 10 scripts (localStorage)
│   └── Loader.tsx
├── lib/
│   ├── prompt.ts           # the master prompt sent to Gemini
│   └── types.ts            # TypeScript types for the result
├── public/
│   └── logo.svg
├── .env.local              # GEMINI_API_KEY=... (never upload to GitHub)
├── .gitignore
├── PRD.md
└── README.md
```

## 8. API contract
**POST /api/generate**
Request:
```json
{ "topic": "string", "language": "hinglish", "length": 60, "tone": "funny" }
```
Response:
```json
{
  "hooks": ["...", "...", "..."],
  "script": [{ "time": "0-3s", "line": "...", "visual": "..." }],
  "caption": "...",
  "hashtags": ["#ai", "..."],
  "coverText": "..."
}
```
Gemini must return JSON only (use `responseMimeType: "application/json"`).

## 9. UI / design
- Dark, premium, mobile-first (most users are on phones)
- Big topic box at the top, options as pill buttons, an orange Generate button
- Result cards in glass style with soft orange glow, a Copy button on each
- Loading state: "Script likh raha hoon..." with a shimmer

## 10. Success criteria (v1 done when)
- [ ] A script generates in under 10 seconds
- [ ] Every card's Copy button works
- [ ] Works well on a phone screen
- [ ] API key is not visible in browser DevTools
- [ ] Live on a Vercel link

## 11. Build plan
- **Day 1**: Next.js setup, page design, TopicForm, dummy output
- **Day 2**: /api/generate route + Gemini + master prompt, real output
- **Day 3**: Copy buttons, history, polish, deploy on Vercel
