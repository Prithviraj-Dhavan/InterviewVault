"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Mic,
  Search,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  Target,
  Users,
  X,
  ChevronRight,
  CalendarDays,
  Sparkles,
} from "lucide-react";

type SessionData = {
  id: string;
  company: string;
  role: string;
  status: string;
  createdAt: Date;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
};

type ReportData = {
  id: string;
  sessionId: string;
  overallScore: number;
};

type InterviewUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  interviews: SessionData[];
};

function getAvatarColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 65%, 45%)`;
}

function initials(name?: string | null, email?: string | null) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts.at(-1)?.[0] ?? "")).toUpperCase();
  }
  return (email?.charAt(0) ?? "?").toUpperCase();
}

function UserCard({ u, onClick }: { u: InterviewUser; onClick: (user: InterviewUser) => void }) {
  const bg = getAvatarColor(u.name || u.email || u.id);
  const ini = initials(u.name, u.email);
  const completedCount = u.interviews.filter(s => s.status === "REPORT" || s.status === "COMPLETED").length;

  return (
    <button
      onClick={() => onClick(u)}
      type="button"
      className="group relative w-full rounded-2xl border border-border/50 bg-card/80 p-5 text-left shadow-sm backdrop-blur transition-all duration-300 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1 cursor-pointer"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-center gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-md transition-transform group-hover:scale-105"
          style={{ background: bg }}
        >
          {ini}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate font-bold text-base">{u.name || "—"}</p>
          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider">
              {u.interviews.length} Total
            </span>
            {completedCount > 0 && (
              <span className="text-[10px] text-violet-500 font-bold uppercase tracking-wider">
                • {completedCount} Done
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className="rounded-xl px-3 py-1.5 text-lg font-black tabular-nums bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-colors">
            {u.interviews.length}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-all group-hover:translate-x-1 group-hover:text-violet-500 shrink-0 ml-1" />
      </div>
    </button>
  );
}

function InterviewDrawer({
  user,
  reports,
  onClose,
}: {
  user: InterviewUser | null;
  reports: ReportData[];
  onClose: () => void;
}) {
  if (!user) return null;

  const bg = getAvatarColor(user.name || user.email || user.id);
  const ini = initials(user.name, user.email);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col bg-background border-l border-border/40 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative border-b border-border/50 bg-gradient-to-br from-violet-500/10 via-background to-fuchsia-500/10 px-6 py-6">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: "radial-gradient(circle at 100% 0%, oklch(0.6 0.2 300 / 0.15) 0%, transparent 50%)",
            }}
          />
          <div className="relative flex items-start gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-base font-bold text-white shadow-lg ring-4 ring-background"
              style={{ background: bg }}
            >
              {ini}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h2 className="text-xl font-extrabold tracking-tight truncate">{user.name || "Unknown"}</h2>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-400">
                  <Mic className="h-3 w-3" />
                  {user.interviews.length} interviews
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="ml-auto shrink-0 rounded-full bg-muted/50 p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Header Tab Fake */}
        <div className="flex bg-muted/30 px-6 pt-4 border-b border-border/50">
          <div className="pb-3 border-b-2 border-violet-500 text-sm font-bold text-violet-600 dark:text-violet-400 flex items-center gap-2">
            <Mic className="h-4 w-4" /> Interview History
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-muted/10">
          {user.interviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-card py-16 text-center">
              <Mic className="mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm font-bold text-foreground">No interviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {user.interviews.map((session) => {
                const report = reports.find((r) => r.sessionId === session.id);
                const isCompleted = session.status === "REPORT" || session.status === "COMPLETED";

                return (
                  <div
                    key={session.id}
                    className="group flex flex-col rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-all hover:border-violet-500/30 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-1.5">
                          <Building2 className="h-3.5 w-3.5" />
                          {session.company}
                        </div>
                        <p className="text-base font-extrabold truncate">{session.role}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${isCompleted ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                        {isCompleted ? "Done" : "In Progress"}
                      </span>
                    </div>

                    <div className="flex items-end justify-between pt-4 border-t border-border/40">
                      <div>
                        {report ? (
                          <div className="flex items-end gap-1.5">
                            <Target className="h-4 w-4 text-violet-500 mb-0.5" />
                            <span className="text-2xl font-black tabular-nums leading-none text-foreground">
                              {report.overallScore}
                              <span className="text-xs text-muted-foreground font-semibold ml-1">/ 100</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground font-semibold">Awaiting feedback</span>
                        )}
                        <p className="mt-2 text-[11px] font-medium text-muted-foreground/70">
                          {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                        </p>
                      </div>

                      {isCompleted && (
                        <Link
                          href={`/practice/${session.id}`}
                          target="_blank"
                          className="flex h-9 items-center justify-center gap-2 rounded-xl bg-violet-500/10 px-4 text-xs font-bold text-violet-600 dark:text-violet-400 transition-all hover:bg-violet-500 hover:text-white"
                        >
                          Full Report <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function AdminInterviewsClient({
  sessions,
  reports,
}: {
  sessions: SessionData[];
  reports: ReportData[];
}) {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<InterviewUser | null>(null);

  // Group sessions by user
  const usersMap = new Map<string, InterviewUser>();
  for (const session of sessions) {
    if (!usersMap.has(session.userId)) {
      usersMap.set(session.userId, {
        id: session.userId,
        name: session.userName,
        email: session.userEmail,
        image: session.userImage,
        interviews: [],
      });
    }
    usersMap.get(session.userId)!.interviews.push(session);
  }

  const allUsers = Array.from(usersMap.values()).sort(
    (a, b) => b.interviews.length - a.interviews.length
  );

  const filteredUsers = allUsers.filter((u) => {
    const term = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term))
    );
  });

  return (
    <main className="min-h-screen w-full">
      {/* ── Header ── */}
      <div className="relative overflow-hidden border-b border-border/40 bg-card">
        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-20 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[120px]" />
          <div className="absolute -top-20 right-0 h-[400px] w-[400px] rounded-full bg-fuchsia-500/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            <span className="text-[11px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">
              Admin Platform Hub
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl text-foreground">
            User <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Interviews</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground font-medium leading-relaxed">
            Monitor and review AI mock interviews conducted by users across the platform in real-time.
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <input
              type="text"
              placeholder="Search user by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-2xl border border-border/60 bg-card/50 pl-10 pr-4 text-sm font-medium shadow-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-shadow"
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="tabular-nums font-bold text-foreground">{filteredUsers.length}</span> active candidates
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-card/30 py-24 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-bold text-foreground">No candidates found</p>
            <p className="mt-1.5 text-sm text-muted-foreground">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredUsers.map((u) => (
              <UserCard key={u.id} u={u} onClick={setSelectedUser} />
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      <InterviewDrawer
        user={selectedUser}
        reports={reports}
        onClose={() => setSelectedUser(null)}
      />
    </main>
  );
}
