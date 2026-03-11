# 🌿 HabitFlow — Daily Ritual Tracker

A beautiful habit tracker with Daily, Weekly, and Monthly views. Built as a static app — deployable on **GitHub Pages** with **Supabase** for persistent, multi-device data storage.

---

## ✨ Features

- **Daily View** — Circular progress ring + checkable habit list + streak counter
- **Weekly View** — 7-day column grid with per-day progress rings
- **Monthly View** — Full checkbox grid + completion rate analysis bars
- **Custom Habits** — Add emoji, color tag, and name per habit
- **Supabase Auth** — Email/password sign up & sign in
- **Multi-device sync** — Data persists across devices via Supabase Postgres
- **Warm terracotta theme** — Clean, modern aesthetic

---

## 🚀 Setup Guide

### Step 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **New Project**, give it a name like `habitflow`
3. Wait ~2 minutes for the project to provision

### Step 2 — Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** → **New Query**
2. Paste the contents of `supabase-schema.sql`
3. Click **Run** — this creates the `habits` and `habit_logs` tables with RLS enabled

### Step 3 — Get Your API Keys

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
   - **anon / public** key (long JWT string)

### Step 4 — Add Keys to index.html

Open `index.html` and find these two lines near the top of the `<script>` section:

```javascript
const SUPABASE_URL  = 'https://geldvxlffhyphrexumkz.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbGR2eGxmZmh5cGhyZXh1bWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTk3NTIsImV4cCI6MjA4ODc5NTc1Mn0.8nyEOvTpkVFomS5weXeS8HBRkMJDWaAg_RMNJ8ynLDw';
```

Replace with your actual values:

```javascript
const SUPABASE_URL  = 'https://xxxxxxxxxxxx.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### Step 5 — Enable Email Auth in Supabase

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Optionally disable "Confirm email" for easier dev/testing:
   - Go to **Authentication** → **Settings** → toggle off "Enable email confirmations"

### Step 6 — Deploy to GitHub Pages

```bash
# 1. Create a new GitHub repo (e.g. "habitflow")
# 2. Push your files
git init
git add .
git commit -m "Initial HabitFlow setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/habitflow.git
git push -u origin main

# 3. Enable GitHub Pages
# → Go to repo Settings → Pages → Source: Deploy from branch → main → / (root)
# → Your app will be live at: https://YOUR_USERNAME.github.io/habitflow/
```

---

## 📁 File Structure

```
habitflow/
├── index.html          ← Complete single-page app (edit SUPABASE_URL here)
├── supabase-schema.sql ← Run once in Supabase SQL Editor
└── README.md           ← This file
```

---

## 🔒 Security Notes

- The `anon` key is **safe to expose** in frontend code — Supabase Row Level Security (RLS) ensures users can only access their own data
- Never use the `service_role` key in frontend code

---

## 🛠 Customization Tips

| What | Where in index.html |
|------|---------------------|
| Colors / theme | `:root` CSS variables at top of `<style>` |
| Default emojis | `EMOJIS` array in JS |
| Default colors | `COLORS` array in JS |
| App name | Search for "HabitFlow" |

---

Built with ❤️ using vanilla JS + Supabase + Google Fonts
