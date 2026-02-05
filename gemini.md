# 📜 Project Constitution (gemini.md)

## 1. Identity & Vision
*   **Project Name:** Appcountability
*   **Language:** Spanish (España/Neutro)
*   **North Star:** A gamified, social accountability platform where friends track habits, chat, and challenge each other, powered by AI coaching.
*   **Brand Voice:** Syncra (Directo, Cercano, Auténtico).
*   **Visual Style:** Deep Blue (`#3a00e4`), Dark Mode support, Glassmorphism, Smooth Animations (Framer Motion).

## 2. Data Schemas (The "Payload")
> **Status:** Draft - To be implemented in Supabase.

### 2.1 Users (`users`)
*   `id` (UUID, PK)
*   `full_name` (Text)
*   `avatar_url` (Text)
*   `bio` (Text)
*   `current_streak` (Int) - Global streak of completing habits.

### 2.2 Groups (`groups`)
*   `id` (UUID, PK)
*   `name` (Text)
*   `description` (Text)
*   `theme` (Text) - For UI customization.
*   `created_at` (Timestamp)

### 2.3 Habits (`habits`)
*   `id` (UUID, PK)
*   `user_id` (UUID, FK)
*   `title` (Text)
*   `frequency` (Text) - e.g., 'daily', 'weekly'.
*   `icon` (Text) - Emoji or Icon name.
*   `streak` (Int)

### 2.4 Chat (`group_messages`)
*   `id` (UUID, PK)
*   `group_id` (UUID, FK)
*   `user_id` (UUID, FK)
*   `content` (Text)
*   `is_ai_generated` (Boolean) - For AI coach messages.
*   `created_at` (Timestamp)

## 3. Tech Stack & Architecture
*   **Frontend:** Next.js 14+ (App Router), React, TypeScript.
*   **Styling:** Tailwind CSS, Framer Motion, Lucide React, Shadcn/UI.
*   **Backend:** Supabase (Auth, DB, Realtime).
*   **AI:** OpenAI (via Vercel AI SDK).

## 4. Behavioral Rules
*   **Zero-Guessing:** If a schema isn't defined, don't build the UI for it.
*   **Mobile-First:** The dashboard must look perfect on mobile.
*   **Interactive:** Use optimisitc UI updates for checking off habits.

## 5. Maintenance Log
*   [2026-01-26] - Defined Blueprint and Schemas.
