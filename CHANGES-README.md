# Practice section, redesigned around the pipeline look

This is the complete, self-contained set of files — includes the explainer
from before plus the new live status bar, so you only need this one zip.

## What's here

- **Setup page** (`/practice`): the animated "how it works" explainer
  (auto-cycling demo) sits above your existing form — unchanged from
  before.
- **Live session page** (`/practice/[sessionId]`): now has a real,
  non-demo version of the same diagram at the top — `PipelineStatusBar`.
  It reflects your *actual* progress:
  - Shows "Question N of 6" for real, using the real question count
  - Highlights the "Question" node while you're mid-interview
  - Highlights "Report" once the session is completed, with the other
    nodes shown as done
  - The bottom JSON preview shows the **real** category and reason for
    your current question (not placeholder text), or your real score and
    readiness rating once finished

## Files in this zip

```
src/lib/interview-constants.ts                        (new)
src/actions/interview.ts                               (updated — imports the
                                                          shared constant instead
                                                          of defining it locally)
src/components/custom/practice/pipeline-explainer.tsx  (unchanged from before)
src/components/custom/practice/pipeline-status-bar.tsx (new — the live version)
src/app/(main)/practice/page.tsx                        (unchanged from before)
src/app/(main)/practice/[sessionId]/page.tsx            (updated — renders the
                                                          new status bar)
```

## An important technical note (worth knowing, not just trivia)

`src/actions/interview.ts` starts with `"use server"` at the top of the
file. Next.js requires that **every** export from a file like that be an
async function — you can't export a plain constant from it. I'd
originally tried to export the "6 questions total" number directly from
that file so the UI could stay in sync with it, and that would have
broken your build. Instead, I moved that number into a new, tiny file —
`src/lib/interview-constants.ts` — that both the server action and the UI
import from. This keeps the "6" in exactly one place without violating
that rule.

## Steps to apply

1. Copy every file from this zip into your project at the matching paths,
   overwriting what's there (the two `page.tsx` files, `interview.ts`) and
   creating the new ones (`interview-constants.ts`, `pipeline-status-bar.tsx`).
2. No new dependencies, no database changes.
3. Restart: `pnpm dev`.
4. Go to `/practice`, start a new interview, and you should see the live
   status bar above each question, updating as you go, ending on the
   "Report" node once you finish.

## Still open, if you want it

As mentioned before: the reference screenshot's actual *interview logic*
(a distinct "Profile" extraction step, a weighted "Plan," immediate 1–5
scoring per answer, and up to 2 conditional follow-ups when a score is
low) is not implemented — this delivery is the pipeline's *look*, wired to
your *real* progress, but the underlying question flow is still the one
we built earlier (fixed set of grounded/mixed questions, validated, then
one final scorecard). Say the word if you want that deeper rework too.
