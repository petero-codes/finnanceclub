# AI-Powered Code Review Assistant

A full-stack application that provides AI-powered code reviews using Claude. Features a VS Code-styled interface with Monaco editor, real-time feedback, and review history.

## Features

- **Monaco Editor** — Full-featured code editor with syntax highlighting for 12+ languages
- **AI Reviews** — Instant feedback on bugs, optimizations, standards violations, and positives
- **Review History** — Persistent storage of all past reviews with detail view
- **VS Code Theme** — Dark UI inspired by Visual Studio Code
- **Responsive** — Split-pane layout with collapsible sections
- **Docker Ready** — One-command deployment with docker-compose

## Tech Stack

**Frontend**
- React 19 + Vite
- Monaco Editor (@monaco-editor/react)
- React Router v7
- Tailwind CSS v3 (custom VS Code theme)
- Framer Motion (animations)
- Lucide React (icons)

**Backend**
- FastAPI (Python 3.11)
- SQLAlchemy + PostgreSQL
- Pydantic v2
- Mock AI reviewer (ready for Anthropic Claude integration)

**DevOps**
- Docker & Docker Compose
- PostgreSQL 15
- ESLint + strict config

## Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- OR: Python 3.11+, Node.js 18+, PostgreSQL (for local)

### Option 1: Docker Compose (Easiest)

```bash
# Clone and start everything
git clone https://github.com/petero-codes/AI-Powered-Code-Review-Assistant.git
cd AI-Powered-Code-Review-Assistant

# Create environment file
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY (optional for now)

# Start all services
docker-compose up
```

App runs at: http://localhost:3000

### Option 2: Local Development

**1. Backend**
```bash
cd backend

# Create virtual environment
python -m venv venv
# On Windows:
venv\Scripts\Activate.ps1
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup database (PostgreSQL or SQLite fallback)
# For PostgreSQL:
#   - Ensure DATABASE_URL is set in .env (postgresql://user:pass@localhost:5432/codereview)
# For SQLite (dev only):
#   - No action needed; uses ./sql_app.db

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**2. Frontend**
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev -- --host 0.0.0.0 --port 3000
```

App runs at: http://localhost:3000

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL=postgresql://admin:password@localhost:5432/codereview
# OR omit for SQLite (development only)

# Backend
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
POSTGRES_DB=codereview

# Frontend
VITE_API_URL=http://localhost:8000

# AI (optional - currently uses mock data)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
ANTHROPIC_API_KEY=sk-ant-...
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/review` | Submit code for review |
| GET | `/api/history` | List all past reviews |
| GET | `/api/review/{id}` | Get specific review |
| DELETE | `/api/review/{id}` | Delete a review |

### Example Request

```bash
curl -X POST http://localhost:8000/api/review \
  -H "Content-Type: application/json" \
  -d '{"code":"console.log(\"hello\");","language":"javascript"}'
```

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI app & routes
│   ├── database.py          # DB connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── services/
│   │   └── ai_reviewer.py   # Mock AI (ready for Claude)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── editor/      # Monaco editor wrapper
│   │   │   ├── layout/      # Sidebar & main layout
│   │   │   └── review/      # Review panel
│   │   ├── pages/           # Home, History, Settings
│   │   └── services/        # API client
│   ├── tailwind.config.js   # VS Code theme colors
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── .gitignore
```

## Adding Real AI (Claude)

The backend accepts `x-api-key` header (or falls back to `ANTHROPIC_API_KEY` env var). To enable real Claude reviews:

1. Get key from [console.anthropic.com](https://console.anthropic.com)
2. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-...`
3. Modify `backend/services/ai_reviewer.py` to call Anthropic API when key is present

Example integration point in `analyze_code()`:

```python
import anthropic

async def analyze_code(code: str, language: str, api_key: str = None) -> dict:
    if api_key:
        client = anthropic.AsyncAnthropic(api_key=api_key)
        # Call Claude and parse response
        ...
    # Fallback to mock
    return mock_response()
```

## Development

### Linting
```bash
# Frontend
cd frontend && npm run lint

# Backend (install ruff or flake8 first)
cd backend && flake8 .
```

### Build
```bash
cd frontend && npm run build  # Outputs to frontend/dist/
```

### Database Migrations (Future)

If using Alembic:
```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Notes

- **SQLite** is used by default if `DATABASE_URL` is not set (for quick dev setup)
- **PostgreSQL** recommended for production (configured in docker-compose.yml)
- **Mock AI** returns realistic sample data; no API key required for development
- All secrets are gitignored; use `.env.example` as template

## License

MIT
