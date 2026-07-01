# WhatsApp Agent SaaS 💬

> AI-powered WhatsApp assistant for small businesses. Automated replies, lead capture, and conversation management — powered by Ollama (local AI, no paid APIs).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-compose-blue.svg)
![AI](https://img.shields.io/badge/AI-Ollama%20%7C%20Qwen-green.svg)

## ⚠️ Important Disclaimer

WhatsApp automation must comply with WhatsApp/Meta Terms of Service and Business Policies.
This project uses Evolution API for WhatsApp connectivity. Use responsibly and only for legitimate business purposes.

**A Mock WhatsApp Simulator is included for testing WITHOUT connecting real WhatsApp.**

## 🎯 What It Does

- 🤖 **AI Auto-Replies** — Answer customer questions automatically 24/7
- 📋 **FAQ Knowledge Base** — Train AI with your business FAQ
- 👥 **Lead Capture** — Capture and export leads to CSV
- 📊 **Admin Dashboard** — Monitor all conversations
- ✋ **Manual Takeover** — Flag conversations for human attention
- 🔌 **WhatsApp Integration** — Via Evolution API (optional for demo)
- 🧪 **Mock Simulator** — Test without real WhatsApp

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| AI Engine | Ollama (local) |
| WhatsApp | Evolution API (optional) |
| Container | Docker Compose |

## 🤖 AI Models (Free & Local)

Default: `qwen2.5:7b-instruct`

Change in `.env`:
```env
OLLAMA_MODEL=qwen2.5:7b-instruct
# Or: llama3.1:8b, mistral:7b
```

## 🚀 Quick Start (10 Minutes)

```bash
git clone https://github.com/majaber1/whatsapp-agent-saas.git
cd whatsapp-agent-saas
cp .env.example .env
ollama pull qwen2.5:7b-instruct
docker compose up -d
```

Open http://localhost:3000 | Login: admin@demo.com / demo123

## 🧪 Test Without WhatsApp (Mock Simulator)

1. Open http://localhost:3000/simulator
2. Type a message as a customer would
3. See AI auto-reply in real-time
4. Check leads page for captured info

## 📁 Project Structure

```
whatsapp-agent-saas/
├── frontend/                 # Next.js application
│   └── app/
│       ├── page.tsx         # Landing page (green/white SaaS)
│       ├── login/           # Login page
│       ├── dashboard/       # Admin dashboard
│       ├── conversations/   # Conversation history
│       ├── knowledge-base/  # FAQ management
│       ├── leads/           # Lead capture & export
│       ├── settings/        # Business profile settings
│       └── simulator/       # Mock WhatsApp simulator
├── backend/                 # FastAPI backend
│   ├── main.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── conversations.py
│   │   ├── knowledge.py
│   │   ├── leads.py
│   │   └── webhook.py       # Evolution API webhook
│   ├── services/
│   │   ├── ollama_service.py
│   │   └── whatsapp_service.py
│   └── prompts/
│       ├── faq_answer.txt
│       ├── lead_qualification.txt
│       ├── booking_assistant.txt
│       ├── price_inquiry.txt
│       └── escalation_detection.txt
├── docker-compose.yml
├── .env.example
├── samples/                 # Sample FAQ data
├── screenshots/
├── LICENSE
├── CONTRIBUTING.md
└── README.md
```

## 🗄️ Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 3000 | Next.js admin UI |
| backend | 8000 | FastAPI server |
| postgres | 5432 | Database |
| ollama | 11434 | Local AI engine |

## 🔐 Default Credentials

Email: admin@demo.com | Password: demo123

## 💰 Pricing Plans

| Plan | Price | Features |
|------|-------|---------|
| Small Business | SAR 199/month | 1 WhatsApp, 500 msgs/month |
| Pro | SAR 499/month | 3 WhatsApp, unlimited msgs |
| Custom | SAR 1,500 setup | Full customization |

## 🌐 Deployment

```bash
# Pull model first
docker exec -it ollama ollama pull qwen2.5:7b-instruct

# Start services
docker compose up -d

# View logs
docker compose logs -f backend
```

## ⚠️ WhatsApp Policy Compliance

- Only send messages to users who have opted in
- Do not spam or send unsolicited messages
- Follow Meta's WhatsApp Business Policy
- Evolution API is open-source: https://github.com/EvolutionAPI/evolution-api

## 🗺️ Roadmap

- [ ] Multi-language support (Arabic/English)
- [ ] Booking calendar integration
- [ ] CRM integration (HubSpot, Salesforce)
- [ ] Voice message transcription
- [ ] Multi-WhatsApp number support

## 📄 License

MIT License — see LICENSE for details.
