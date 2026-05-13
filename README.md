# Scope Creep & Paper Trails

An educational web game for ICT students learning how to manage client requirements, avoid verbal traps, and produce correct documentation.

Built around the **"Bark & Byte"** dog daycare scenario, students navigate 5 rounds of client communication, identify scope creep and verbal approval traps, and generate the right paperwork to score points.

---

## Game Overview

| | Details |
|---|---|
| **Rounds** | 5 |
| **Time per Round** | 5 minutes |
| **Max Score** | 65 points |
| **Players** | Teams (enter a team name to start) |

### Round Breakdown

| Round | Client Message | Document Type | Verbal Trap? | Max Points |
|-------|---------------|---------------|-------------|------------|
| 1 | Initial request for computers and cameras | Confirmation | No | +10 |
| 2 | Scope creep: mic and power boards added verbally | Additional / Amendment | Yes | +5 (−10 if no amendment) |
| 3 | Verbal approval: "Looks good, start now" | Approval | Yes | +20 (−15 if verbal accepted) |
| 4 | Training skip: "We'll figure it out" | Training | Yes | +15 (−10 if no training) |
| 5 | Genuine request for user docs | User Documentation | No | +15 |

### Key Lessons

- **Round 2**: Never accept verbal additions without documenting them. Always amend originals.
- **Round 3**: Verbal approvals are not legally binding. Always get written sign-off.
- **Round 4**: Never skip training delivery — it is part of professional service.
- **Round 5**: Always provide user documentation for handover.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: PostgreSQL (via Prisma ORM)
- **Animations**: Framer Motion
- **Hosting**: Vercel (free tier)

---

## Local Development

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL (local or Docker)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/jlcloudtea/WebGameLiaisewithClient.git
cd WebGameLiaisewithClient

# 2. Install dependencies
npm install

# 3. Set up your database URL in .env
# DATABASE_URL=postgresql://user:password@localhost:5432/scopecreep

# 4. Run database migrations
npx prisma migrate deploy

# 5. (Optional) Seed demo data
npm run db:seed

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

### Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Create a new migration |
| `npm run db:migrate:deploy` | Apply migrations to production DB |
| `npm run db:seed` | Seed the database with demo data |
| `npm run db:reset` | Reset the database |

---

## Deploy to Vercel (Free)

### Step 1: Push to GitHub

The project is already available at:
`https://github.com/jlcloudtea/WebGameLiaisewithClient`

### Step 2: Create a Free PostgreSQL Database

1. Log in to [vercel.com](https://vercel.com)
2. Go to the **Storage** tab
3. Click **Create Database**
4. Select **Neon Postgres** (Free plan)
5. Give it a name (e.g., `scope-creep-db`)
6. Click **Create**
7. Go to the **.env** tab and copy the `DATABASE_URL`

### Step 3: Import & Deploy the Project

1. Go to **Projects** → **Add New** → **Import Git Repository**
2. Select your GitHub repository (`WebGameLiaisewithClient`)
3. In **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: leave default
   - **Install Command**: leave default
4. Under **Environment Variables**, add:
   - **Key**: `DATABASE_URL`
   - **Value**: *(paste from Step 2 — the part after the `=` sign)*
5. Click **Deploy**

### Step 4: Run Database Migrations

After the first deploy, create the database tables. Run these SQL statements **one at a time** in the Neon SQL editor (Dashboard → Storage → your database → Query tab):

```sql
CREATE TYPE "DocumentType" AS ENUM ('CONFIRMATION', 'ADDITIONAL', 'APPROVAL', 'TRAINING', 'USER_DOC');
```

```sql
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);
```

```sql
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "currentRound" INTEGER NOT NULL DEFAULT 1,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);
```

```sql
CREATE TABLE "ClientMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "isVerbalTrap" BOOLEAN NOT NULL DEFAULT false,
    "gameSessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClientMessage_pkey" PRIMARY KEY ("id")
);
```

```sql
CREATE TABLE "PlayerDocument" (
    "id" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "content" TEXT NOT NULL,
    "roundSubmitted" INTEGER NOT NULL,
    "scoreEarned" INTEGER NOT NULL DEFAULT 0,
    "feedback" TEXT NOT NULL DEFAULT '',
    "gameSessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlayerDocument_pkey" PRIMARY KEY ("id")
);
```

```sql
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");
```

```sql
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

```sql
ALTER TABLE "ClientMessage" ADD CONSTRAINT "ClientMessage_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

```sql
ALTER TABLE "PlayerDocument" ADD CONSTRAINT "PlayerDocument_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

### Step 5: Play!

Visit your deployed URL (e.g., `https://web-game-liaisewith-client.vercel.app`) and start playing!

---

## Keep the Database Alive (Important!)

Neon may delete inactive databases after 90 days. Set up a **free weekly ping** to keep it alive:

1. Go to [https://cron-job.org](https://cron-job.org) → **Create Free Account**
2. Click **Create Cron Job**
3. Fill in:
   - **Title**: `Keep Neon DB Alive`
   - **URL**: `https://your-app-name.vercel.app/api/health`
   - **Schedule**: Every **7 days**
4. Click **Create**

This pings your app once a week, which keeps Neon counting your project as active.

---

## Auto-Cleanup (Data Older Than 3 Months)

The app automatically cleans up game data older than 90 days (3 months) via a cleanup endpoint.

### Set Up the Cleanup Cron Job

1. In [cron-job.org](https://cron-job.org), create another cron job:
   - **Title**: `Cleanup Old Game Data`
   - **URL**: `https://your-app-name.vercel.app/api/cleanup`
   - **Schedule**: Every **7 days**
2. Under **Advanced** → **Request headers**, add:
   - **Header name**: `Authorization`
   - **Header value**: `Bearer scope-creep-cleanup-2025`
3. Click **Create**

### How It Works

When the cron runs weekly, data older than 90 days is automatically deleted:

| Data | Rule |
|------|------|
| PlayerDocuments | Created > 90 days ago → deleted |
| ClientMessages | Created > 90 days ago → deleted |
| GameSessions | Created > 90 days ago → deleted (after child records removed) |
| Teams | Deleted only if they have no remaining sessions |

### Custom Cleanup Secret (Optional)

For stronger security, add an environment variable in Vercel:
- **Key**: `CLEANUP_SECRET`
- **Value**: any strong password (e.g., `my-secret-key-2025`)

Then use that as the Bearer token in cron-job.org instead.

### Manual Cleanup

To manually reset all game data at any time (e.g., between semesters), run these **one at a time** in the Neon SQL editor:

```sql
DELETE FROM "PlayerDocument";
DELETE FROM "ClientMessage";
DELETE FROM "GameSession";
DELETE FROM "Team";
```

> **Order matters!** Delete child tables first due to foreign key constraints.

---

## Security & Abuse Prevention

The app includes built-in protections:

| Protection | What It Does |
|-----------|-------------|
| **Rate Limiting** | Max 5 requests per IP per minute for team creation, game start, and document submission |
| **DB Size Limits** | Max 200 teams and 1,000 game sessions — blocks new entries when hit |
| **Input Sanitization** | Team name trimmed, max 50 characters, minimum 2 characters |
| **Spam Filtering** | Blocks obvious spam names (test, spam, asdf, aaa, etc.) |
| **Cleanup Auth** | Cleanup endpoint requires a secret Bearer token |

---

## Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database models (Team, GameSession, ClientMessage, PlayerDocument)
│   ├── seed.ts                # Demo data seeder
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main page (landing, game, game-over screens)
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   └── api/
│   │       ├── team/route.ts           # POST: Create a new team
│   │       ├── leaderboard/route.ts    # GET: Fetch leaderboard
│   │       ├── health/route.ts         # GET: Health check (keeps Neon alive)
│   │       ├── cleanup/route.ts        # GET: Auto-cleanup old data (>90 days)
│   │       └── game/
│   │           ├── start/route.ts      # POST: Start a new game session
│   │           └── [id]/
│   │               ├── route.ts        # GET: Fetch game state
│   │               └── submit/route.ts # POST: Submit document & score
│   ├── components/
│   │   ├── game/
│   │   │   ├── landing-screen.tsx      # Team name entry
│   │   │   ├── game-screen.tsx         # Main game orchestrator
│   │   │   ├── chat-panel.tsx          # Client communication chat
│   │   │   ├── document-panel.tsx      # Dynamic document form per round
│   │   │   ├── round-timer.tsx         # 5-minute countdown timer
│   │   │   ├── feedback-modal.tsx      # Score feedback after submission
│   │   │   ├── game-over-screen.tsx    # Final results & round summary
│   │   │   └── leaderboard.tsx         # In-game leaderboard dialog
│   │   └── ui/                         # shadcn/ui components
│   └── lib/
│       ├── db.ts                # Prisma client singleton
│       ├── game-types.ts        # TypeScript types, round configs, scoring rules
│       ├── rate-limit.ts        # Rate limiting & DB size protection
│       └── utils.ts             # Utility functions
├── public/
│   └── game-logo.png            # Game logo image
├── .env.example                 # Environment variable template
└── package.json
```

---

## Scoring System

### Round 1 — Confirmation Document (max +10)
- +10 if both **service** and **timeframe** are documented
- −5 if service is missing
- −5 if timeframe is missing

### Round 2 — Additional / Amendment Document (max +5)
- +5 for documenting additional requirements
- **−10** if the original document is NOT amended (scope creep trap!)

### Round 3 — Approval Document (max +20)
- +20 if all four fields are present (standard, price, time, ongoing)
- **−15** if verbal approval was accepted (verbal approval trap!)

### Round 4 — Training Document (max +15)
- +15 if at least one training type is selected AND support details provided
- **−10** if no training types selected (training skip trap!)

### Round 5 — User Documentation (max +15)
- +15 if at least one documentation type is selected AND specifics provided

**Maximum possible score: 65 points**

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string from Neon |
| `CLEANUP_SECRET` | No | Custom secret for cleanup endpoint (default: `scope-creep-cleanup-2025`) |

---

## Cost

| Service | Free Tier |
|---------|-----------|
| Vercel Hosting | 100 GB bandwidth, unlimited sites |
| Neon Postgres | 0.5 GB storage, 100 compute hours/month |
| cron-job.org | Unlimited free cron jobs |
| GitHub | Unlimited public repos |

**Total cost: $0**

---

## License

MIT
