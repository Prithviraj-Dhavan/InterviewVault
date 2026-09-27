# Switch AI Interview Practice from Gemini to Groq

## Why

The practice feature was originally built on Google Gemini (a separate,
new feature — it never touched your existing Groq-based `completion`/
`evaluate` routes). But Gemini's free tier rate-limits aggressively, and
when the AI answer-validation call got rate-limited, the code was designed
to "fail open" (let the answer through) rather than block the user
entirely — which is why gibberish like `adwegergeev` slipped past and got
scored 5/10 with a "rate limited" message.

Switching this feature to Groq (the same provider and model your other AI
routes already use successfully: `openai/gpt-oss-120b`) fixes this at the
source, and needs no new API key or dependency — `@ai-sdk/groq` is already
in your `package.json` and `GROQ_API_KEY` is already in your `.env`.

## What changed

Only `src/actions/interview.ts`:
- `import { google } from "@ai-sdk/google"` → `import { groq } from "@ai-sdk/groq"`
- Model changed from `"gemini-1.5-flash"` → `"openai/gpt-oss-120b"`
- All three AI calls (`validateAnswer`, `generateQuestion`, `generateScorecard`)
  now call `groq(MODEL)` instead of `google(MODEL)`
- The scorecard's fallback message no longer blames "Google Gemini free
  tier" (it's generic now, since it shouldn't come up nearly as often)

Nothing else changed — your resume upload, JD parsing, question mixing,
the two-step gibberish check, and the scorecard UI all work exactly as
before, just backed by Groq now.

## Steps to apply

1. Open `src/actions/interview.ts` in your project and replace it entirely
   with the version in this zip.
2. No new dependency, no new env variable, no database migration needed.
3. Restart your dev server: stop it (Ctrl+C), run `pnpm dev` again.
4. Test: start a new practice session, answer a question with something
   like `chwgwwhfhww` — it should still be rejected instantly (that catch
   is a built-in check, unrelated to which AI provider is used). Then try
   a real, on-topic-but-vague answer to confirm it still gets accepted and
   moves you forward.

## One more thing

Old sessions you already ran (with the "API Overloaded" scorecard) already
have their feedback saved in the database — this fix only affects new
sessions going forward. If you want to re-score an old session, you'd need
to start a fresh one.
