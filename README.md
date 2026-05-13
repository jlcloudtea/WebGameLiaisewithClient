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
git clone https://github.com/YOUR_USERNAME/WebGameLiaisewithClient.git
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

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/WebGameLiaisewithClient.git
git push -u origin main
```

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
   - **Value**: *(paste from Step 2)*
5. Click **Deploy**

### Step 4: Run Database Migrations

After the first deploy succeeds, create the database tables:

**Option A — Using Vercel CLI (recommended):**

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your Vercel project
vercel link

# Pull environment variables (including DATABASE_URL)
vercel env pull .env.local

# Run the migration
npx prisma migrate deploy
```

**Option B — Using the Vercel Dashboard:**

1. Go to your project → **Storage** → Click your Postgres database
2. Click the **Query** tab
3. Copy the SQL from `prisma/migrations/00000000000000_init/migration.sql` and run it

### Step 5: (Optional) Seed Demo Data

```bash
# If you pulled env vars with vercel env pull:
npx prisma db seed
```

### Step 6: Play!

Visit your deployed URL (e.g., `https://web-game-liaise-with-client.vercel.app`) and start playing!

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

## Cost

| Service | Free Tier |
|---------|-----------|
| Vercel Hosting | 100 GB bandwidth, unlimited sites |
| Neon Postgres | 0.5 GB storage, 100 compute hours/month |
| GitHub | Unlimited public repos |

**Total cost: $0**

---

## License

MIT
