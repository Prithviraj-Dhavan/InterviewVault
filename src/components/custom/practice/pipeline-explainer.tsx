"use client";

import {
  ArrowRight,
  Clock,
  FileCheck2,
  MessageSquareText,
  Pause,
  Play,
  Shuffle,
  ShieldCheck,
  Sparkles,
  FileText,
  Settings,
  List,
  Mic,
  Target,
  RefreshCcw,
  BarChart2,
  CheckCircle2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  {
    number: "01",
    label: "INPUT",
    title: "Upload your resume",
    description:
      "Drop in a text-based resume PDF and paste the job description - that's all the interviewer needs to get started.",
    preview: `{\n  "resume": "your-resume.pdf",\n  "jobDescription": "pasted text"\n}`,
  },
  {
    number: "02",
    label: "ANALYSIS",
    title: "The AI reads your background",
    description:
      "Your resume is compared with the role to build a profile: your level, your strongest skills, and the gaps the job cares about.",
    preview: `{\n  "level": "senior",\n  "skills": ["React", "TypeScript", "GraphQL"],\n  "gaps": ["system design at scale"]\n}`,
  },
  {
    number: "03",
    label: "PLANNING",
    title: "It plans a tailored interview",
    description:
      "Based on the profile, it selects the topics to cover, allocating time to your weak spots and confirming your strong ones.",
    preview: `{\n  "topics": [\n    { "name": "React Performance", "weight": 0.4 },\n    { "name": "System Design", "weight": 0.6 }\n  ]\n}`,
  },
  {
    number: "04",
    label: "INTERVIEW LOOP",
    title: "Answer, get graded, get probed",
    description:
      "For each question, your answer is evaluated on the spot. If you miss the mark, the AI asks a follow-up to dig deeper.",
    preview: `{\n  "evaluation": { "score": 3, "feedback": "Vague on caching" },\n  "followUp": "How would you cache the GraphQL responses?"\n}`,
  },
  {
    number: "05",
    label: "REPORT",
    title: "A report you can act on",
    description:
      "After the last question, you get a detailed breakdown of your performance, with actionable feedback to improve.",
    preview: `{\n  "score": 82,\n  "readinessRating": "Almost there"\n}`,
  },
] as const;

const DIAGRAM_STATES = [
  "resume",
  "profile",
  "plan",
  "question",
  "answer",
  "evaluate",
  "followup",
  "report",
] as const;

const NODES = [
  { id: "resume", label: "Resume + JD", sub: "PDF, DOCX, TXT", icon: FileText, x: 20, y: 40 },
  { id: "profile", label: "Profile", sub: "LLM analysis", icon: Settings, x: 170, y: 40 },
  { id: "plan", label: "Plan", sub: "topic weights", icon: List, x: 320, y: 40 },
  { id: "question", label: "Question", sub: "with criteria", icon: MessageSquareText, x: 470, y: 40 },
  { id: "answer", label: "Answer", sub: "you respond", icon: Mic, x: 470, y: 140 },
  { id: "evaluate", label: "Evaluate", sub: "score 1-5", icon: Target, x: 320, y: 140 },
  { id: "followup", label: "Follow-up", sub: "up to 2", icon: RefreshCcw, x: 320, y: 240 },
  { id: "report", label: "Report", sub: "scored in code", icon: BarChart2, x: 20, y: 140 },
] as const;

const Node = ({ icon: Icon, label, sub, active, done, x, y }: any) => {
  return (
    <motion.div
      className={`absolute z-10 flex h-[64px] w-[110px] flex-col items-center justify-center gap-0.5 rounded-lg border-2 bg-background px-2 text-center transition-colors
        ${active ? "border-primary ring-4 ring-primary/10" : done ? "border-primary/40" : "border-border"}
      `}
      style={{ left: x, top: y }}
      animate={{
        scale: active ? 1.05 : 1,
        borderColor: active ? "var(--primary)" : done ? "var(--primary)" : "var(--border)",
      }}
    >
      <div className="flex items-center gap-1.5">
        <Icon className={`size-3.5 ${active ? "text-primary" : done ? "text-primary/70" : "text-muted-foreground"}`} />
        <span className={`text-xs font-semibold ${active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
      </div>
      <span className="text-[9px] leading-tight text-muted-foreground">{sub}</span>
      {done && (
        <div className="absolute -right-1.5 -top-1.5 rounded-full bg-background">
          <CheckCircle2 className="size-4 fill-primary/10 text-primary" />
        </div>
      )}
    </motion.div>
  );
};

export function PipelineExplainer() {
  const [diagramStep, setDiagramStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    const interval = setInterval(() => {
      setDiagramStep((prev) => (prev + 1) % DIAGRAM_STATES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const activeUiStep = diagramStep === 7 ? 4 : Math.min(diagramStep, 3);
  const current = STEPS[activeUiStep];
  const activeNodeId = DIAGRAM_STATES[diagramStep];

  const handleStepClick = (idx: number) => {
    if (idx === 0) setDiagramStep(0);
    if (idx === 1) setDiagramStep(1);
    if (idx === 2) setDiagramStep(2);
    if (idx === 3) setDiagramStep(3); // Start of loop
    if (idx === 4) setDiagramStep(7); // Report
    setIsPlaying(false);
  };

  return (
    <div className="mx-auto mb-12 max-w-6xl">
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        <Badge className="gap-1.5 px-3 py-1.5" variant="outline">
          <Clock className="size-3.5" /> About 20 minutes
        </Badge>
        <Badge className="gap-1.5 px-3 py-1.5" variant="outline">
          <RefreshCcw className="size-3.5" /> Up to 2 follow-ups per question
        </Badge>
        <Badge className="gap-1.5 px-3 py-1.5" variant="outline">
          <MessageSquareText className="size-3.5" /> Type, speak or sketch
        </Badge>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        {/* Left: step list */}
        <div>
          <h2 className="mb-6 text-2xl font-bold">
            How the AI interview works
          </h2>
          <div className="relative space-y-0">
            {STEPS.map((step, idx) => {
              const isActive = idx === activeUiStep;
              const isPast = idx < activeUiStep;
              return (
                <button
                  className="relative flex w-full gap-4 pb-8 text-left last:pb-0"
                  key={step.number}
                  onClick={() => handleStepClick(idx)}
                  type="button"
                >
                  {idx < STEPS.length - 1 && (
                    <span
                      className={`absolute left-[15px] top-9 h-full w-px ${
                        isPast ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                  <span
                    className={`z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : isPast
                          ? "border-primary text-primary bg-background"
                          : "border-border text-muted-foreground bg-background"
                    }`}
                  >
                    {step.number}
                  </span>
                  <div className="pt-0.5">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {step.label}
                    </p>
                    <p
                      className={`font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {step.title}
                    </p>
                    <AnimatePresence>
                      {isActive && (
                        <motion.p
                          animate={{ height: "auto", opacity: 1 }}
                          className="mt-1 overflow-hidden text-sm text-muted-foreground"
                          exit={{ height: 0, opacity: 0 }}
                          initial={{ height: 0, opacity: 0 }}
                        >
                          {step.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: animated pipeline diagram */}
        <div className="rounded-xl border bg-card p-5 shadow-sm overflow-hidden flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-red-400/70" />
              <span className="size-2.5 rounded-full bg-yellow-400/70" />
              <span className="size-2.5 rounded-full bg-green-400/70" />
              <span className="ml-2 text-xs font-mono text-muted-foreground">
                interview-pipeline
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-primary">
                Step {activeUiStep + 1} of {STEPS.length}
              </span>
              <button
                aria-label={isPlaying ? "Pause" : "Play"}
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsPlaying((p) => !p)}
                type="button"
              >
                {isPlaying ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 w-full overflow-x-auto overflow-y-hidden border-b pb-4 pt-4">
            <div className="relative mx-auto h-[320px] w-[580px] shrink-0">
              {NODES.map((node, i) => {
                const stepIndex = DIAGRAM_STATES.indexOf(node.id as any);
                const isDone = diagramStep > stepIndex;
                const isActive = diagramStep === stepIndex;
                return (
                  <Node
                    key={node.id}
                    {...node}
                    active={isActive}
                    done={isDone}
                  />
                );
              })}

              <svg
                className="absolute inset-0 pointer-events-none"
                width="580"
                height="320"
              >
                <defs>
                  <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" className="fill-border" />
                  </marker>
                </defs>

                {/* Resume -> Profile (Solid) */}
                <path
                  d="M 130 72 L 163 72"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-border"
                  markerEnd="url(#arrow)"
                />

                {/* Profile -> Plan (Dashed) */}
                <path
                  d="M 280 72 L 313 72"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="text-border"
                  markerEnd="url(#arrow)"
                />

                {/* Plan -> Question (Dashed) */}
                <path
                  d="M 430 72 L 463 72"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="text-border"
                  markerEnd="url(#arrow)"
                />

                {/* Question -> Answer (Dashed) */}
                <path
                  d="M 525 104 L 525 133"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="text-border"
                  markerEnd="url(#arrow)"
                />

                {/* Answer -> Evaluate (Solid, leftwards) */}
                <path
                  d="M 470 172 L 437 172"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-border"
                  markerEnd="url(#arrow)"
                />

                {/* Evaluate -> Report (Solid, leftwards) */}
                <path
                  d="M 320 172 L 137 172"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-border"
                  markerEnd="url(#arrow)"
                />

                {/* Evaluate -> Question (Up and right, dashed) */}
                <path
                  d="M 375 140 L 375 110 L 463 110"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="text-border"
                  markerEnd="url(#arrow)"
                  fill="none"
                />

                {/* Evaluate -> Follow-up (Down, dashed) */}
                <path
                  d="M 375 204 L 375 233"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="text-border"
                  markerEnd="url(#arrow)"
                />

                {/* Follow-up -> Answer (Right and up, dashed) */}
                <path
                  d="M 430 272 L 525 272 L 525 211"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="text-border"
                  markerEnd="url(#arrow)"
                  fill="none"
                />

                <text
                  x="225"
                  y="165"
                  className="fill-muted-foreground text-[10px]"
                  textAnchor="middle"
                >
                  after the last question
                </text>
                <text
                  x="420"
                  y="105"
                  className="fill-muted-foreground text-[10px]"
                  textAnchor="middle"
                >
                  next question
                </text>
                <text
                  x="405"
                  y="222"
                  className="fill-muted-foreground text-[10px]"
                >
                  score &lt; 4
                </text>
              </svg>

              <div className="absolute bottom-4 right-4 flex gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 border-t-2 border-border" />
                  always
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 border-t-2 border-dashed border-border" />
                  conditional
                </span>
              </div>
            </div>
          </div>

          {/* Live JSON-style preview */}
          <div className="mt-4 rounded-md bg-muted/50 p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Candidate Profile / Node Data
            </p>
            <AnimatePresence mode="wait">
              <motion.pre
                animate={{ opacity: 1 }}
                className="whitespace-pre-wrap font-mono text-xs text-foreground/80"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                key={diagramStep}
                transition={{ duration: 0.2 }}
              >
                {current.preview}
              </motion.pre>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
