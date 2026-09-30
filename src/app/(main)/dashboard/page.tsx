import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { interviewSessions, interviewReports } from "@/db/schema/interview";
import { eq, desc, inArray } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  FileSearch,
  Flame,
  Layers,
  Target,
  Plus,
} from "lucide-react";

export default async function DashboardPage() {
  const { user } = (await auth.api.getSession({ headers: await headers() })) ?? { user: null };
  if (!user) redirect("/sign-in");

  const sessions = await db.query.interviewSessions.findMany({
    where: eq(interviewSessions.userId, user.id),
    orderBy: [desc(interviewSessions.createdAt)],
  });

  const sessionIds = sessions.map(s => s.id);
  const reports = sessionIds.length > 0
    ? await db.select().from(interviewReports).where(inArray(interviewReports.sessionId, sessionIds))
    : [];

  const completedCount = sessions.filter(s => s.status === "REPORT" || s.status === "COMPLETED").length;
  const inProgressCount = sessions.length - completedCount;
  const avgScore = reports.length > 0
    ? Math.round(reports.reduce((acc, r) => acc + r.overallScore, 0) / reports.length)
    : null;

  const firstName = user.name?.split(" ")[0] ?? "there";

  return (
    <main className="min-h-screen w-full">
      {/* ── Hero Header ──────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-border/50">
        {/* Background gradient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-20 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute -top-20 right-0 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent">
                  {firstName}
                </span>{" "}
                👋
              </h1>
              <p className="mt-2 text-muted-foreground">
                Track your progress, revisit sessions, and keep levelling up.
              </p>
            </div>
            <Link href="/practice">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
                Start New Interview
              </Button>
            </Link>
          </div>

          {/* ── Stats Row ── */}
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              {
                label: "Total Sessions",
                value: sessions.length,
                icon: Layers,
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                label: "Completed",
                value: completedCount,
                icon: Flame,
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
              },
              {
                label: "In Progress",
                value: inProgressCount,
                icon: FileSearch,
                color: "text-amber-500",
                bg: "bg-amber-500/10",
              },
              {
                label: "Avg. Score",
                value: avgScore !== null ? `${avgScore}/100` : "—",
                icon: Target,
                color: "text-violet-500",
                bg: "bg-violet-500/10",
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm backdrop-blur"
              >
                <div className={`mb-3 inline-flex rounded-xl ${bg} p-2.5`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <p className="text-2xl font-extrabold tracking-tight">{value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sessions Grid ──────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="mb-6 text-lg font-bold tracking-tight">All Sessions</h2>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-card/40 py-24 text-center">
            <div className="mb-8 relative flex items-center justify-center w-40 h-40">
              {/* Glow base */}
              <div className="absolute bottom-0 w-24 h-6 bg-primary/20 rounded-full blur-xl" />
              {/* Animated sound-wave rings */}
              <svg viewBox="0 0 160 160" className="absolute inset-0 w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="80" cy="80" r="55" stroke="#a78bfa" strokeWidth="1" strokeDasharray="4 6" opacity="0.25">
                  <animateTransform attributeName="transform" type="rotate" from="0 80 80" to="360 80 80" dur="18s" repeatCount="indefinite" />
                </circle>
                <circle cx="80" cy="80" r="68" stroke="#6366f1" strokeWidth="0.8" strokeDasharray="2 8" opacity="0.15">
                  <animateTransform attributeName="transform" type="rotate" from="360 80 80" to="0 80 80" dur="24s" repeatCount="indefinite" />
                </circle>
                {/* Wave arcs emanating left */}
                <path d="M54 62 Q44 80 54 98" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" opacity="0.5">
                  <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2s" repeatCount="indefinite" />
                </path>
                <path d="M46 55 Q30 80 46 105" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.3">
                  <animate attributeName="opacity" values="0.1;0.4;0.1" dur="2s" begin="0.3s" repeatCount="indefinite" />
                </path>
                {/* Wave arcs emanating right */}
                <path d="M106 62 Q116 80 106 98" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" opacity="0.5">
                  <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2s" begin="0.15s" repeatCount="indefinite" />
                </path>
                <path d="M114 55 Q130 80 114 105" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" opacity="0.3">
                  <animate attributeName="opacity" values="0.1;0.4;0.1" dur="2s" begin="0.45s" repeatCount="indefinite" />
                </path>
              </svg>
              {/* Microphone SVG */}
              <svg viewBox="0 0 64 80" className="relative z-10 h-24 w-20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="micGrad" x1="0" y1="0" x2="64" y2="80" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#c4b5fd" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                  <filter id="micGlow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                {/* Mic body */}
                <rect x="20" y="4" width="24" height="38" rx="12" fill="url(#micGrad)" opacity="0.9" filter="url(#micGlow)" />
                {/* Mic grille lines */}
                <line x1="24" y1="18" x2="40" y2="18" stroke="white" strokeWidth="1.2" opacity="0.4" />
                <line x1="24" y1="24" x2="40" y2="24" stroke="white" strokeWidth="1.2" opacity="0.4" />
                <line x1="24" y1="30" x2="40" y2="30" stroke="white" strokeWidth="1.2" opacity="0.4" />
                {/* Mic arc stand */}
                <path d="M12 36 Q12 56 32 56 Q52 56 52 36" stroke="url(#micGrad)" strokeWidth="3" strokeLinecap="round" fill="none" />
                {/* Stand pole */}
                <line x1="32" y1="56" x2="32" y2="70" stroke="url(#micGrad)" strokeWidth="3" strokeLinecap="round" />
                {/* Base */}
                <line x1="18" y1="70" x2="46" y2="70" stroke="url(#micGrad)" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-1">No interviews yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Start your first practice session and come back to see your results, scores, and AI feedback here.
            </p>
            <Link href="/practice">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Start Practice
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {sessions.map((session) => {
              const report = reports.find(r => r.sessionId === session.id);
              const isCompleted = session.status === "REPORT" || session.status === "COMPLETED";
              const scoreColor =
                !report ? "" :
                report.overallScore >= 75 ? "text-emerald-500" :
                report.overallScore >= 50 ? "text-amber-500" :
                "text-rose-500";

              return (
                <Link
                  key={session.id}
                  href={`/practice/${session.id}`}
                  className="group relative flex flex-col rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5"
                >
                  {/* Glow on hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                        {session.company}
                      </p>
                      <h3 className="font-bold text-base leading-snug line-clamp-2">
                        {session.role}
                      </h3>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${
                        isCompleted
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {isCompleted ? "Completed" : "In Progress"}
                    </span>
                  </div>

                  {/* Score / Pending */}
                  {report ? (
                    <div className="flex items-end gap-2 mb-5">
                      <span className={`text-5xl font-black tabular-nums leading-none ${scoreColor}`}>
                        {report.overallScore}
                      </span>
                      <span className="mb-1 text-sm text-muted-foreground font-medium">/ 100</span>
                      <span className="mb-1 ml-auto text-xs text-muted-foreground">Overall score</span>
                    </div>
                  ) : (
                    <div className="mb-5 flex h-14 items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/30">
                      <p className="text-xs font-medium text-muted-foreground">Awaiting completion for feedback</p>
                    </div>
                  )}

                  {/* Score bar */}
                  {report && (
                    <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-border/50">
                      <div
                        className={`h-full rounded-full transition-all ${
                          report.overallScore >= 75
                            ? "bg-emerald-500"
                            : report.overallScore >= 50
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${report.overallScore}%` }}
                      />
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/50">
                    <span className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-all group-hover:gap-2">
                      {isCompleted ? "View Report" : "Continue"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
