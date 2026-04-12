# Sipwise

Sipwise is a mobile-first web app for personalized alcohol suggestions, party planning, and safer pacing. Users can describe a party in natural language, save their taste profile, add group constraints, and get AI-powered drink suggestions with simple moderation guidance.

## What It Does

- Prompt-first party setup on the home screen
- Personal taste profile with allergies, tolerance, budget, and avoided drink categories
- Party setup for guest count, vibe, allergies, and preferences
- Mini itinerary for pacing the event
- Region-aware suggestions for more realistic local picks
- OpenAI-backed recommendation flow through `/api/recommendations`
- Local alcohol catalog for fallback ranking and structured product context

## Run Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add a local `.env` file:

   ```env
   APP_URL="http://localhost:3000"
   OPENAI_API_KEY=""
   OPENAI_MODEL="gpt-4o-mini"
   ```

   Notes:
   - `OPENAI_API_KEY` is used by the live recommendation route.
   - `OPENAI_MODEL` is optional and defaults to `gpt-4o-mini`.

3. Start the app:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Main Routes

- `/` → Start Here
- `/contacts` → My Taste
- `/drafts` → Party Setup
- `/itinerary` → Party Plan
- `/settings` → Local Picks + OpenAI setup

## OpenAI Flow

- Frontend trigger: home screen `Get suggestions`
- Backend route: `/api/recommendations`
- Environment key: `OPENAI_API_KEY`
- Optional in-app override: OpenAI key field in `Local Picks`

## Current Notes

- The current recommendation flow combines local alcohol catalog filtering with an OpenAI response layer.
