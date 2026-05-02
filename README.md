# ChatBotAlpha 🤖

An AI-powered chatbot built with **Gemini API** and deployed on **Cloudflare Pages**. Ask anything, get answers, and enjoy engaging follow-up questions!

## Features

- 💡 **Smart Conversations** — Powered by Gemini 2.0 Flash
- 🔄 **Natural Flow** — Bot answers AND asks relevant follow-up questions
- 🎨 **Modern Chat UI** — Clean dark theme with smooth animations
- ⚡ **Serverless** — Cloudflare Functions for secure API proxy
- 📱 **Responsive** — Works on all devices

## How It Works

1. User types a message
2. Frontend sends it to `/api/chat` (Cloudflare Function)
3. Function forwards to **Gemini API** with a prompt to answer + ask follow-up
4. Response is returned and displayed in the chat

## Quick Start

### 1. Clone & Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: ChatBotAlpha"
git remote add origin https://github.com/YOUR_USERNAME/ChatBotAlpha.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. **Create a project** → **Connect to Git**
3. Select your `ChatBotAlpha` repo → **Begin setup**
4. Build settings:
   - **Framework preset**: None
   - **Build command**: *(empty)*
   - **Build output directory**: `/`
5. **Environment variables** → **Add variable**:
   - Name: `GEMINI_API_KEY`
   - Value: `your_gemini_api_key_here`
   - Environment: **Production**
6. Click **Save and Deploy**

### 3. Get a Gemini API Key

- Visit [Google AI Studio](https://aistudio.google.com/apikey)
- Create a new API key (free tier available)

## Project Structure

```
ChatBotAlpha/
├── index.html              # Chat interface
├── style.css               # Dark theme chat UI
├── app.js                  # Frontend chat logic
├── functions/
│   └── api/
│       └── chat.js        # Cloudflare Function (Gemini proxy)
├── .gitignore
└── README.md
```

## License

MIT — Build, modify, and share freely!
