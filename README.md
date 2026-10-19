# FoodWise — Eat Well. Stay You.

An AI-powered nutrition **education** assistant prototype for the UnivaBio 2026 hackathon
(theme: *Artificial Intelligence for Human Health*).

FoodWise helps adults make balanced everyday food choices that respect their culture, taste,
budget and health context — and explains *why*, so people gradually learn to choose on their own.

## Run it

Requires Node.js 18+.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build in dist/
```

Best viewed at a 375–430 px mobile width; on desktop it renders inside a phone frame.

**Live demo:** _add the GitHub Pages link here after the first deploy_

## Publish on GitHub Pages

1. Create an empty public repository on GitHub (e.g. `foodwise`) and push this folder to its `main` branch.
2. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` builds and publishes the app on every push.
   The site appears at `https://<your-username>.github.io/foodwise/`.

## Demo script (≈2 minutes)

1. Enter a name (photo optional) → **Get Started**.
2. **Home**: mission, five principles (tap to expand), learning journey.
3. **AI Assistant** → **Use example** → **Continue** → tick the allergy confirmation → **Save My Context**.
4. Tap the sample *Skipped breakfast · 50k UZS · 15 min*.
5. Swipe the meal cards, open **Why this works**, tap a principle tag, **Swap** a meal, **Choose this meal**.
6. Use follow-ups: *I have only 20,000 UZS*, *Can I eat plov instead?*, *vegetarian alternative*.
7. **Try Making Your Own Choice** → pick a combination → reflect → *Try another scenario*.
8. **Library**: filter by source type, search, open real articles.

## What is implemented vs simulated vs planned

| Implemented in this prototype | Simulated (Interactive Demo) | Planned |
|---|---|---|
| Onboarding with optional photo, local persistence | Recommendation "AI" is a transparent **rule-based engine** (`src/engine/`) — no model is called | Server-side integration with a real LLM (API key kept on the server, never in the frontend) |
| Conversational context setup with extraction + explicit confirmation of allergies/conditions | Free-text understanding covers common phrasings; unrecognised input is acknowledged honestly | Validation of content and logic by nutrition and medical experts |
| Context-aware suggestions (budget, time, hunger, tiredness, place, culture, diet, dislikes) | Meal prices are **illustrative estimates** in UZS, not live prices | Real local price / availability data |
| Allergy & diet filtering in every turn and swap (never relaxed) | 18 curated demo meals | Larger, localised food database |
| SVG plate/bowl illustrations that change with each meal | | Optional AI-generated imagery |
| "Why this works" explanations with WHO principles + FoodWise *Satisfaction* | | |
| Progressive Independence exercise and learning journey | | Longer-term learning paths |
| Searchable, filterable Library with real sources | | |
| Safety: emergency and extreme-restriction responses, condition caveats | | |
| Edit context, clear chat, delete all data | | |

## Responsible design

- Educational tool, not medical advice; no diagnosis or guaranteed physiological outcomes.
- Adequacy, balance, moderation, diversity come from WHO/FAO healthy diet guidance.
  **Satisfaction** is FoodWise's own proposed principle — not a WHO principle.
- Plate illustrations show share of plate **area**, not calories, inspired by the
  Harvard Healthy Eating Plate as a flexible guide.
- Library labels distinguish public-health guidance, educational research, a clinical perspective
  (IFM) and a coaching concept (IIN). No source endorses FoodWise.
- Privacy: all data stays in the browser's localStorage. Nothing is sent to analytics or third parties.
  The app has not been clinically validated.

## Project structure

```
src/
  App.tsx                 state, navigation, persistence
  types.ts                shared data model (ready for a real AI service)
  engine/                 demoEngine (respond, swap), parse, safety, practice
  data/                   meals, library, principles, practice building blocks
  components/             PlateViz (SVG), MealCard, ContextSetup/Editor, sheets…
  screens/                Onboarding, Home, Assistant, Library
  styles/tokens.css       design tokens — change the look from one place
```

To connect a real model later, replace `respond()` in `src/engine/demoEngine.ts` with a call to
your own backend endpoint that returns the same `AssistantReply` shape, and keep the
allergy filter (`violation()` in `engine/safety.ts`) as a final safety check on every response.
