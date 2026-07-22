# DietTrack 🥗

DietTrack is a minimal, premium-feeling full-stack web application designed for hostel and college students to track whether they have eaten in their mess each day. It provides students with a single-tap interface to log daily attendance, visualize monthly habits, and dispute billing discrepancies, while providing administrators with a powerful portal to oversee student attendance and moderation feedback logs.

Designed with a high-contrast dark theme and minimal layouts inspired by Vercel, Linear, and Notion.

---

## 🚀 Key Features

### 👨‍🎓 Student Dashboard
- **One-Tap Check-In:** Easily log today's meal status (Taken/Skipped) right from the dashboard.
- **Interactive Calendar Grid:** View and edit attendance history for any date in the current month using a beautiful overlay modal with smooth micro-animations.
- **Monthly Summary Cards:** Monitor total meals taken, skipped, and your overall attendance percentage ratio at a glance.
- **Recharts Analytics:** Review weekly and monthly eating patterns with custom date-range controls and visual bar charts.
- **Feedback & Bug Reporting:** Submit feedback logs to administrators and monitor resolution statuses.
- **Dark/Light Theme Toggle:** Supports high-contrast themes via `next-themes`.

### 👮‍♂️ Admin Portal (Credentials Authenticated)
- **Centralized Metrics:** Overview cards displaying total users, today's active students, pending feedbacks, and resolved issues.
- **Weekly Trend Charts:** Visualizes system-wide student check-in trends across the week.
- **Searchable Student Registry:** Quickly filter students by name or email, view overall attendance rates, and navigate to individual profiles.
- **Detailed Student Profiles:** View a student's full attendance calendar log and historical metrics.
- **Feedback Moderation:** A dedicated timeline interface permitting administrators to toggle feedback statuses between Pending and Resolved.

---

## 🛠 Tech Stack

- **Frontend Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Lucide Icons
- **State Management & Forms:** React Hook Form & Zod
- **Animations:** Framer Motion (for modal overlays & transitions)
- **Visualizations:** Recharts
- **Database ORM:** Prisma 7
- **Database Engine:** PostgreSQL (Neon Serverless Pooler)
- **Authentication:** 
  - Students: Clerk Authentication SDK (v5+)
  - Admins: Credentials-based cookie authentication using Edge-compatible JWT tokens (`jose`)

---

## 📂 Project Structure

```text
├── actions/             # Next.js Server Actions (User Sync, Attendance, Feedback, Admin Auth)
├── app/                 # Next.js 15 App Router Routes
│   ├── admin/           # Admin Pages (Credentials Login & Dashboard layouts)
│   ├── dashboard/       # Student Dashboard Pages (Analytics, Feedback logs, Settings)
│   ├── sign-in/         # Custom Clerk Sign-in Form
│   ├── sign-up/         # Custom Clerk Sign-up Form
│   └── layout.tsx       # Root layout configuration with Clerk & Theme Providers
├── components/          # Reusable UI widgets (Calendar, Navbar, Sidebar, AttendanceCard)
├── lib/                 # Core utilities (Prisma Client & Admin JWT token verification)
├── prisma/              # Prisma configuration schema & migrations
└── providers/           # Theme context wrappers
```

---

## ⚙ Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/Gagan-jain-004/Messbook.git
cd Messbook
```

### 2. Install dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Set up environment variables
Create a `.env` file in the root directory and configure the variables as shown in `.env.example`:
```env
# PostgreSQL database connection URL
DATABASE_URL="postgresql://user:password@localhost:5432/neondb?schema=public"

# Clerk authentication public and secret keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Clerk default routing targets
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Custom Administrator credentials
ADMIN_EMAIL="admin@diettrack.com"
ADMIN_PASSWORD="admin_secure_password"

# Secret string used to sign admin cookies (Edge compatible)
ADMIN_JWT_SECRET="generate-a-secure-jwt-signing-secret"
```

### 4. Push database schema
Synchronize your PostgreSQL database with the Prisma schema layout:
```bash
npx prisma db push
```

### 5. Launch local development server
```bash
npm run dev
```
Open `http://localhost:3000` to interact with your local instance.

---

## ☁ Deployment

### Deploying to Vercel
1. Set up your repository on GitHub.
2. Link your repository in the Vercel Dashboard.
3. Configure the **Environment Variables** in Vercel to match your `.env` values.
4. Vercel will automatically run:
   - `npm install` (using our `.npmrc` configuration to resolve peer-dependencies)
   - `prisma generate` (via our `postinstall` script hook)
   - `next build`
5. Your production deployment will go live automatically!
