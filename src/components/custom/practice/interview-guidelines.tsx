"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";

/* ─── Mini-visualizations ────────────────────────────────────────────── */

/** Chapter 1 — 7 sequential question-dots with animated fill */
function QuestionDots() {
  const dots = [1, 2, 3, 4, 5, 6, 7];
  return (
    <div className="flex items-center gap-2">
      {dots.map((d) => (
        <motion.div
          key={d}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: d * 0.1, type: "spring", stiffness: 200 }}
          className="relative flex items-center justify-center"
        >
          <div
            className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition-all ${
              d <= 5
                ? "bg-primary/90 border-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "border-dashed border-primary/40 text-primary/40"
            }`}
          >
            {d}
          </div>
          {d < 7 && (
            <div className={`absolute left-full top-1/2 h-px w-2 -translate-y-1/2 ${d < 5 ? "bg-primary/60" : "bg-border"}`} />
          )}
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, x: -6 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
        className="ml-3 text-xs text-muted-foreground font-medium"
      >
        ↳ +2 follow-ups possible
      </motion.div>
    </div>
  );
}

/** Chapter 2 — branching follow-up conversation tree */
function FollowUpTree() {
  return (
    <div className="relative flex flex-col gap-2 text-xs font-mono">
      {/* Main question bubble */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="self-start rounded-xl rounded-tl-none bg-primary/10 border border-primary/20 px-4 py-2.5 text-foreground max-w-[280px]"
      >
        <span className="text-[10px] font-bold text-primary/70 uppercase tracking-wider block mb-1">AI Interviewer</span>
        "How would you design a rate-limiter?"
      </motion.div>

      {/* Answer */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="self-end rounded-xl rounded-tr-none bg-muted border border-border px-4 py-2.5 text-muted-foreground max-w-[240px]"
      >
        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider block mb-1">You</span>
        "I'd use a token bucket algorithm…"
      </motion.div>

      {/* Follow-up branch line */}
      <motion.div
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="self-start ml-4 h-4 w-px bg-primary/30 origin-top"
      />

      {/* Follow-up question */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="self-start rounded-xl rounded-tl-none bg-violet-500/10 border border-violet-500/20 px-4 py-2.5 text-foreground max-w-[290px]"
      >
        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block mb-1">↳ Follow-up</span>
        "What happens under burst traffic?"
      </motion.div>
    </div>
  );
}

/** Chapter 3 — animated STAR method bars */
function StarBars() {
  const bars = [
    { label: "S — Situation", pct: 15, color: "bg-amber-500" },
    { label: "T — Task", pct: 20, color: "bg-orange-500" },
    { label: "A — Action", pct: 45, color: "bg-primary" },
    { label: "R — Result", pct: 20, color: "bg-emerald-500" },
  ];
  return (
    <div className="w-full space-y-2.5">
      {bars.map((b, i) => (
        <div key={b.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-[11px] font-mono font-semibold text-muted-foreground">{b.label}</span>
          <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${b.pct * 2}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: "easeOut" }}
              className={`h-full rounded-full ${b.color}`}
            />
          </div>
          <span className="text-[11px] text-muted-foreground/60 font-mono w-8 text-right">{b.pct}%</span>
        </div>
      ))}
      <p className="pt-1 text-[11px] text-muted-foreground/50 italic">Ideal answer time distribution</p>
    </div>
  );
}

/** Chapter 4 — radial score ring + cycling topic chips */
const TOPIC_SETS = [
  {
    label: "Frontend",
    topics: [
      { topic: "System Design", score: 90, color: "text-emerald-400" },
      { topic: "JavaScript",    score: 85, color: "text-sky-400" },
      { topic: "React Perf",    score: 70, color: "text-amber-400" },
    ],
  },
  {
    label: "Backend",
    topics: [
      { topic: "Python",     score: 92, color: "text-emerald-400" },
      { topic: "REST APIs",  score: 88, color: "text-violet-400" },
      { topic: "Databases",  score: 76, color: "text-amber-400" },
    ],
  },
  {
    label: "Cloud / DevOps",
    topics: [
      { topic: "AWS",        score: 82, color: "text-orange-400" },
      { topic: "Docker",     score: 78, color: "text-sky-400" },
      { topic: "CI / CD",    score: 72, color: "text-rose-400" },
    ],
  },
  {
    label: "Full-stack",
    topics: [
      { topic: "Node.js",        score: 88, color: "text-emerald-400" },
      { topic: "Microservices",  score: 80, color: "text-violet-400" },
      { topic: "Testing",        score: 74, color: "text-amber-400" },
    ],
  },
] as const;

function ScoreRing() {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const score = 84;
  const dash = (score / 100) * circ;
  const [setIdx, setSetIdx] = useState(0);

  // Cycle every 2.5 s
  useEffect(() => {
    const id = setInterval(() => {
      setSetIdx((prev) => (prev + 1) % TOPIC_SETS.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const current = TOPIC_SETS[setIdx];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-6">
        {/* Ring */}
        <div className="relative flex shrink-0 items-center justify-center">
          <svg width="100" height="100" className="-rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/50" />
            <motion.circle
              cx="50" cy="50" r={r}
              fill="none" stroke="url(#scoreGrad)" strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              whileInView={{ strokeDashoffset: circ - dash }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="oklch(0.54 0.179 288)" />
                <stop offset="100%" stopColor="oklch(0.72 0.16 290)" />
              </linearGradient>
            </defs>
          </svg>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="absolute flex flex-col items-center"
          >
            <span className="text-xl font-extrabold leading-none text-foreground">{score}</span>
            <span className="text-[10px] text-muted-foreground font-medium">/ 100</span>
          </motion.div>
        </div>

        {/* Cycling topic chips */}
        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={setIdx}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.38, ease: "easeInOut" }}
              className="flex flex-col gap-2"
            >
              {current.topics.map((t, i) => (
                <motion.div
                  key={t.topic}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.28 }}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 text-xs"
                >
                  <span className="font-medium text-foreground/80">{t.topic}</span>
                  <span className={`font-bold tabular-nums ${t.color}`}>{t.score}%</span>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom: role label + dot indicators */}
      <div className="flex items-center justify-between px-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={current.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest"
          >
            {current.label} example
          </motion.span>
        </AnimatePresence>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {TOPIC_SETS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSetIdx(i)}
              aria-label={`Show ${TOPIC_SETS[i].label} example`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === setIdx
                  ? "w-5 bg-primary"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-[11px] italic text-muted-foreground/45">
        Topics are personalised to your resume — these are examples
      </p>
    </div>
  );
}

/* ─── Chapter row ─────────────────────────────────────────────────────── */
type Chapter = {
  num: string;
  tag: string;
  heading: string;
  body: string;
  visual: React.ReactNode;
  flip?: boolean; // visual on left instead of right
};

function ChapterRow({ num, tag, heading, body, visual, flip }: Chapter) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="relative grid grid-cols-1 gap-10 py-16 lg:grid-cols-2 lg:gap-20">
      {/* Separator line that draws in */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-0 left-0 h-px w-full origin-left bg-gradient-to-r from-primary/40 via-border to-transparent"
      />

      {/* Text column */}
      <motion.div
        initial={{ opacity: 0, x: flip ? 40 : -40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.65, ease: "easeOut", delay: 0.15 }}
        className={`flex flex-col justify-center ${flip ? "lg:order-2" : ""}`}
      >
        {/* Giant faded chapter number */}
        <div
          aria-hidden
          className="pointer-events-none absolute select-none font-extrabold text-[clamp(80px,12vw,140px)] leading-none text-foreground/[0.03] -mt-4"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {num}
        </div>

        <div className="relative">
          <span className="mb-3 inline-block rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
            {tag}
          </span>
          <h3 className="mb-4 text-2xl font-extrabold tracking-tight text-foreground md:text-3xl leading-tight">
            {heading}
          </h3>
          <p className="text-[15px] leading-loose text-muted-foreground">{body}</p>
        </div>
      </motion.div>

      {/* Visual column */}
      <motion.div
        initial={{ opacity: 0, x: flip ? -40 : 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.65, ease: "easeOut", delay: 0.3 }}
        className={`flex items-center justify-center ${flip ? "lg:order-1" : ""}`}
      >
        <div className="w-full rounded-2xl border border-border/50 bg-card/60 p-6 shadow-lg shadow-black/5 backdrop-blur">
          {visual}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main export ─────────────────────────────────────────────────────── */
export function InterviewGuidelines() {
  return (
    <section className="relative w-full overflow-hidden bg-background">
      {/* Subtle atmospheric glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="pt-24 pb-2"
        >
          {/* Top rule */}
          <div className="mb-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="shrink-0 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
              Interview Brief
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-end">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight leading-tight md:text-[52px]">
                The rules of your
                <br />
                <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                  mock interview.
                </span>
              </h2>
            </div>
            <div className="lg:pb-1">
              <p className="text-base leading-loose text-muted-foreground">
                Before you submit your resume and job description, read how the
                AI interviewer works — so you can walk in knowing exactly what
                to expect and how to perform at your best.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Chapters ── */}
        <ChapterRow
          num="01"
          tag="Session Structure"
          heading="5 to 7 questions. Tailored entirely to you."
          body="Your resume and job description are cross-referenced by the AI to build 5 core thematic questions. Depending on your answers, up to 2 targeted follow-ups may be added — the session is always capped at 7 total, respecting your time."
          visual={<QuestionDots />}
        />

        <ChapterRow
          num="02"
          tag="Adaptive Intelligence"
          heading="The AI doesn't just listen — it probes."
          body="When you mention an interesting architecture decision or trade-off, the interviewer pivots with a focused follow-up. This mirrors real senior-level panel interviews, where depth and edge-case thinking matter more than surface answers."
          visual={<FollowUpTree />}
          flip
        />

        <ChapterRow
          num="03"
          tag="Scoring Strategy"
          heading="Great answers follow a structure."
          body="Use the STAR method: spend a brief moment on Situation and Task, dedicate most of your answer to the Actions you took, and close with a clear, metric-driven Result. Trade-off analysis and real project references always score higher than abstract theory."
          visual={<StarBars />}
        />

        <ChapterRow
          num="04"
          tag="Performance Report"
          heading="Instant coaching. Actionable scorecard."
          body="After every answer you receive live feedback. After the final question, a full 0–100% readiness scorecard is generated — with topic-by-topic ratings, identified gaps, and a concrete roadmap for your next practice session."
          visual={<ScoreRing />}
          flip
        />

        {/* ── Bottom closing strip ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-24 mt-4"
        >
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              { val: "5–7", lbl: "Questions per session" },
              { val: "~15 min", lbl: "Average duration" },
              { val: "Real-time", lbl: "Per-turn feedback" },
              { val: "0–100%", lbl: "Final readiness score" },
            ].map((s, i) => (
              <motion.div
                key={s.lbl}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <div className="text-2xl font-extrabold tracking-tight text-foreground">{s.val}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.lbl}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
