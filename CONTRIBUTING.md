# Contributing to WhatsApp Agent SaaS

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone: `git clone https://github.com/YOUR_USERNAME/whatsapp-agent-saas.git`
3. Create branch: `git checkout -b feature/your-feature`
4. Make changes and commit: `git commit -m "feat: describe change"`
5. Push and open a Pull Request

## Development Setup

```bash
cp .env.example .env
docker compose up -d
ollama pull qwen2.5:7b-instruct
# Seed the knowledge base
curl -X POST http://localhost:8000/knowledge/seed
```

## Contribution Ideas

- Add new AI prompt templates for different business types
- Improve lead qualification logic
- Add Arabic language UI support
- Add more export formats (Excel, PDF)
- Implement real Evolution API integration
- Add webhook verification
- Write tests

## Code Style

- Python: PEP 8
- TypeScript: functional components
- Commits: conventional commits (feat:, fix:, docs:)

## Important Notes

- Always test with the mock WhatsApp simulator first
- Never commit real WhatsApp credentials or Evolution API tokens
- Respect WhatsApp/Meta Terms of Service in all contributions
