"use client";

import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Users,
  MessageSquare,
  Mic,
  Trash2,
  X,
  ChevronRight,
  Shield,
  TrendingUp,
  Search,
  ExternalLink,
  CheckCircle2,
  Building2,
  CalendarDays,
  BarChart3,
  UserX,
  AlertTriangle,
  Briefcase,
  Crown,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserStat = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  questionCount: number;
};

type Stats = {
  totalUsers: number;
  totalQuestions: number;
  totalInterviews: number;
  loginsToday: number;
  loginsThisWeek: number;
  users: UserStat[];
};

type Question = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  companyName: string | null;
  aiAnswer: string | null;
};

type InterviewSession = {
  id: string;
  company: string;
  role: string;
  status: string;
  createdAt: string;
};

type ReportedQuestion = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  companyName: string | null;
  aiAnswer: string | null;
  spamReports: number;
  isDeleted: boolean;
  userName: string | null;
  userEmail: string | null;
};

// ─── Avatar helper ────────────────────────────────────────────────────────────

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

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  gradient: string;
  sub?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/80 p-4 shadow-sm backdrop-blur transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 group">
      <div
        className={`pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40 ${gradient}`}
      />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground truncate">
            {label}
          </p>
          <p className="mt-1.5 text-3xl font-black tabular-nums tracking-tight">
            {value}
          </p>
          {sub && (
            <p className="mt-0.5 text-[10px] text-muted-foreground/60 truncate">{sub}</p>
          )}
        </div>
        <div
          className={`shrink-0 rounded-lg p-2 ${gradient} flex items-center justify-center`}
        >
          <Icon className="h-3.5 w-3.5 text-white opacity-90" />
        </div>
      </div>
    </div>
  );
}

// ─── User Card ────────────────────────────────────────────────────────────────

function UserCard({
  u,
  onClick,
}: {
  u: UserStat;
  onClick: (user: UserStat) => void;
}) {
  const bg = getAvatarColor(u.name || u.email);
  const ini = initials(u.name, u.email);

  return (
    <button
      onClick={() => onClick(u)}
      type="button"
      className="group relative w-full rounded-2xl border border-border/50 bg-card/80 p-4 text-left shadow-sm backdrop-blur transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 cursor-pointer"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
          style={{ background: bg }}
        >
          {ini}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate font-semibold text-sm">{u.name || "—"}</p>
          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground/50">
            Joined {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
          </p>
        </div>
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <span
            className={`rounded-lg px-2.5 py-1 text-base font-black tabular-nums ${
              u.questionCount > 0
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {u.questionCount}
          </span>
          <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
            Qs
          </span>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary shrink-0" />
      </div>
    </button>
  );
}

// ─── Confirm Delete Dialog ────────────────────────────────────────────────────

function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="mb-1 text-base font-bold">{title}</h3>
        <p className="mb-5 text-sm text-muted-foreground">{message}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-border/60 bg-muted/50 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-destructive px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deleting…
              </span>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── User Detail Drawer ───────────────────────────────────────────────────────

function UserDrawer({
  user,
  onClose,
  onQuestionDeleted,
  onUserDeleted,
}: {
  user: UserStat | null;
  onClose: () => void;
  onQuestionDeleted: (questionId: string) => void;
  onUserDeleted: (userId: string) => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [deletingQId, setDeletingQId] = useState<string | null>(null);
  const [deletedQIds, setDeletedQIds] = useState<Set<string>>(new Set());
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  useEffect(() => {
    if (!user) return;
    setQuestions([]);
    setDeletedQIds(new Set());

    setLoadingQ(true);
    fetch(`/api/admin/users/${user.id}/questions`)
      .then((r) => r.json())
      .then((d) => setQuestions(d.questions ?? []))
      .finally(() => setLoadingQ(false));
  }, [user]);

  async function handleDeleteQuestion(questionId: string) {
    setDeletingQId(questionId);
    try {
      await fetch(`/api/admin/questions/${questionId}`, { method: "DELETE" });
      setDeletedQIds((prev) => new Set([...prev, questionId]));
      onQuestionDeleted(questionId);
    } finally {
      setDeletingQId(null);
    }
  }

  async function handleDeleteUser() {
    if (!user) return;
    setDeletingUser(true);
    try {
      await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      onUserDeleted(user.id);
      onClose();
    } finally {
      setDeletingUser(false);
      setConfirmDeleteUser(false);
    }
  }

  const visibleQuestions = questions.filter((q) => !deletedQIds.has(q.id));

  if (!user) return null;

  const bg = getAvatarColor(user.name || user.email);
  const ini = initials(user.name, user.email);
  const isCompleted = (s: string) => s === "REPORT" || s === "COMPLETED";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col bg-card border-l border-border/60 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative border-b border-border/50 bg-gradient-to-r from-primary/10 via-card to-violet-500/10 px-5 py-4">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 50%, oklch(0.7162 0.1597 290.3962 / 0.15) 0%, transparent 60%)",
            }}
          />
          <div className="relative flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg"
              style={{ background: bg }}
            >
              {ini}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold truncate">{user.name || "Unknown"}</h2>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground/60">
                  <CalendarDays className="h-2.5 w-2.5" />
                  Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  <MessageSquare className="h-2.5 w-2.5" />
                  {visibleQuestions.length} Qs
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {/* Delete User Button */}
              <button
                type="button"
                onClick={() => setConfirmDeleteUser(true)}
                title="Delete this user"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <UserX className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                type="button"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* ── Questions Tab ── */}
          <>
            {loadingQ ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/50" />
                ))}
              </div>
            ) : visibleQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 py-14 text-center">
                <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">No questions posted</p>
              </div>
            ) : (
              <div className="space-y-2">
                {visibleQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="group rounded-xl border border-border/50 bg-card/60 p-3.5 transition-all hover:border-border"
                  >
                    {q.companyName && (
                      <div className="mb-1.5 flex items-center gap-1">
                        <Building2 className="h-2.5 w-2.5 text-muted-foreground/50" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                          {q.companyName}
                        </span>
                      </div>
                    )}
                    <p className="text-sm font-semibold leading-snug line-clamp-2">{q.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{q.description}</p>
                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-border/40">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground/50">
                          {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                        </span>
                        {q.aiAnswer && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-500">
                            <CheckCircle2 className="h-2 w-2" />
                            AI
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/questions/${q.id}`}
                          target="_blank"
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          disabled={deletingQId === q.id}
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        >
                          {deletingQId === q.id ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        </div>
      </div>

      {/* Confirm Delete User Dialog */}
      {confirmDeleteUser && (
        <ConfirmDialog
          title="Delete User?"
          message={`This will permanently delete ${user.name || user.email} and all their data. This cannot be undone.`}
          onConfirm={handleDeleteUser}
          onCancel={() => setConfirmDeleteUser(false)}
          loading={deletingUser}
        />
      )}
    </>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function AdminDashboardClient({ adminName }: { adminName: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserStat | null>(null);
  const [search, setSearch] = useState("");
  
  const [activeTab, setActiveTab] = useState<"users" | "reports">("users");
  const [reportedQuestions, setReportedQuestions] = useState<ReportedQuestion[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const firstName = adminName.split(" ")[0] ?? "Admin";

  const loadStats = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const loadReports = useCallback(() => {
    setLoadingReports(true);
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then((d) => setReportedQuestions(d.questions ?? []))
      .finally(() => setLoadingReports(false));
  }, []);

  useEffect(() => {
    loadStats();
    loadReports();
  }, [loadStats, loadReports]);

  async function handleRestoreReport(id: string) {
    setProcessingId(id);
    await fetch(`/api/admin/questions/${id}/restore`, { method: "POST" });
    setReportedQuestions((prev) => prev.filter((q) => q.id !== id));
    setProcessingId(null);
  }

  async function handleHardDeleteReport(id: string) {
    setProcessingId(id);
    await fetch(`/api/admin/questions/${id}/hard`, { method: "DELETE" });
    setReportedQuestions((prev) => prev.filter((q) => q.id !== id));
    setProcessingId(null);
  }

  function handleQuestionDeleted(questionId: string) {
    setStats((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        totalQuestions: Math.max(0, prev.totalQuestions - 1),
        users: prev.users.map((u) =>
          u.id === selectedUser?.id
            ? { ...u, questionCount: Math.max(0, u.questionCount - 1) }
            : u
        ),
      };
    });
  }

  function handleUserDeleted(userId: string) {
    setStats((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        totalUsers: Math.max(0, prev.totalUsers - 1),
        users: prev.users.filter((u) => u.id !== userId),
      };
    });
  }

  const filteredUsers = (stats?.users ?? []).filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen w-full">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-20 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute -top-20 right-0 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[100px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-12">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
            <Shield className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Admin Console
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Welcome,{" "}
            <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent">
              {firstName}
            </span>
          </h1>
          <p className="mt-1.5 max-w-lg text-sm text-muted-foreground">
            Full platform oversight — monitor users, questions, and interview activity.
          </p>

          {/* Stats Row */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {loading ? (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/40" />
                ))}
              </>
            ) : (
              <>
                <StatCard
                  label="Total Users"
                  value={stats?.totalUsers ?? 0}
                  icon={Users}
                  gradient="bg-gradient-to-br from-violet-500 to-indigo-600"
                  sub="Registered members"
                />
                <StatCard
                  label="Total Questions"
                  value={stats?.totalQuestions ?? 0}
                  icon={MessageSquare}
                  gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
                  sub="Community questions"
                />
                <StatCard
                  label="Total Interviews"
                  value={stats?.totalInterviews ?? 0}
                  icon={Mic}
                  gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
                  sub="AI sessions conducted"
                />
                <StatCard
                  label="Logins Today"
                  value={stats?.loginsToday ?? 0}
                  icon={TrendingUp}
                  gradient="bg-gradient-to-br from-orange-500 to-amber-500"
                  sub="Unique active today"
                />
                <StatCard
                  label="This Week"
                  value={stats?.loginsThisWeek ?? 0}
                  icon={BarChart3}
                  gradient="bg-gradient-to-br from-rose-500 to-pink-500"
                  sub="Unique last 7 days"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Content Section ── */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex gap-6 border-b border-border/50">
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 text-sm font-bold transition-colors ${
              activeTab === "users"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Users
            </span>
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`pb-3 text-sm font-bold transition-colors ${
              activeTab === "reports"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Reported Questions
              {reportedQuestions.length > 0 && (
                <span className="ml-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                  {reportedQuestions.length}
                </span>
              )}
            </span>
          </button>
        </div>

        {activeTab === "users" && (
          <>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-base font-bold tracking-tight">
                  User Management
                </h2>
                <p className="text-xs text-muted-foreground">
                  Click any card to view questions, interviews, and delete users.
                </p>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search users…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-full rounded-xl border border-border/60 bg-card/80 pl-8 pr-4 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 sm:w-56"
                />
              </div>
            </div>

            {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted/40" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-card/40 py-16 text-center">
            <Users className="mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredUsers.map((u) => (
              <UserCard key={u.id} u={u} onClick={setSelectedUser} />
            ))}
          </div>
        )}
          </>
        )}

        {activeTab === "reports" && (
          <>
            <div className="mb-5">
              <h2 className="text-base font-bold tracking-tight">Reported Questions</h2>
              <p className="text-xs text-muted-foreground">
                Questions flagged by users. If spam reports {"\u2265"} 3, they are automatically hidden.
              </p>
            </div>

            {loadingReports ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/40" />
                ))}
              </div>
            ) : reportedQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-card/40 py-16 text-center">
                <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-500/50" />
                <p className="text-sm font-medium text-muted-foreground">No reported questions! All clear.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {reportedQuestions.map((q) => (
                  <div key={q.id} className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive uppercase tracking-wider">
                            {q.spamReports} Reports
                          </span>
                          {q.isDeleted && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-500 uppercase tracking-wider">
                              Hidden
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground/80">
                            by {q.userName || q.userEmail || "Unknown"}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm truncate">{q.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{q.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/questions/${q.id}`}
                          target="_blank"
                          className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-card/50 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> View
                        </Link>
                        <button
                          onClick={() => handleRestoreReport(q.id)}
                          disabled={processingId === q.id}
                          className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Restore
                        </button>
                        <button
                          onClick={() => handleHardDeleteReport(q.id)}
                          disabled={processingId === q.id}
                          className="flex items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* User Drawer */}
      {selectedUser && (
        <UserDrawer
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onQuestionDeleted={handleQuestionDeleted}
          onUserDeleted={handleUserDeleted}
        />
      )}
    </main>
  );
}
