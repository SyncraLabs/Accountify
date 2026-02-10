# Technical Documentation

## 1. Technology Stack
**Appcountability** is built on a modern, performance-oriented stack designed for scalability and user experience.

-   **Frontend Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `clsx` and `tailwind-merge`
-   **UI Library**: [Shadcn/ui](https://ui.shadcn.com/) (based on Radix UI)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
-   **AI Integration**: [Google Gemini API](https://ai.google.dev/) (`@google/generative-ai`)
-   **Internationalization**: `next-intl` (Spanish/English)

## 2. Project Architecture

### Directory Structure
```
/app
  /auth         # Authentication routes (login, register, callback)
  /dashboard    # Main user dashboard
  /groups       # Social & squad features
  /habits       # Habit management & tracking
  /coach        # AI Coach interface
  layout.tsx    # Root layout with providers
  page.tsx      # Landing page
/components
  /ui           # Reusable UI components (buttons, dialogs, inputs)
  /groups       # Group-specific components
  /habits       # Habit-specific components
  /dashboard    # Dashboard widgets
/lib
  utils.ts      # Helper functions
  supabase/     # Supabase client configuration
/supabase
  schema.sql    # Database schema definitions
  migrations/   # SQL migrations
```

### Key Architectural Decisions
-   **Server Components vs. Client Components**: We prioritize Server Components for data fetching and SEO, using Client Components (`"use client"`) only for interactivity (forms, dialogs, real-time updates).
-   **Supabase Auth**: Authentication is handled via Supabase's built-in Auth (Email/Password), integrated with Next.js middleware for route protection.
-   **Row Level Security (RLS)**: All data access is secured at the database level using Postgres RLS policies (see Database Schema).

## 3. Database Schema
The database works on a PostgreSQL instance hosted by Supabase.

| Table | Description | Key Columns |
| :--- | :--- | :--- |
| `profiles` | Extended user data linked to `auth.users` | `id`, `full_name`, `avatar_url`, `current_streak` |
| `habits` | User-defined habits | `id`, `user_id`, `title`, `frequency` |
| `habit_logs` | Daily completion records | `id`, `habit_id`, `completed_date` |
| `groups` | Accountability squads | `id`, `name`, `theme` |
| `group_members`| Junction table for users & groups | `group_id`, `user_id`, `role` |
| `group_messages`| Chat history | `group_id`, `user_id`, `content`, `is_ai_generated` |
| `notifications` | User notifications | `user_id`, `type`, `data`, `read` |

## 4. Environment Setup
To run the project locally:

1.  **Clone the repository**
2.  **Install dependencies**: `npm install`
3.  **Environment Variables**: Create a `.env.local` file with:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
    GEMINI_API_KEY=your_gemini_key
    ```
4.  **Run Development Server**: `npm run dev`

## 5. Deployment
The application is deployed on **Vercel**, which offers seamless integration with Next.js.
-   **Build Command**: `next build`
-   **Output Directory**: `.next`

Commits to the `main` branch trigger automatic deployments.
