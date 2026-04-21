import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSubmissions } from "@/hooks/use-submissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Activity, CheckCircle2, Target } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: submissions, isLoading } = useSubmissions();

  const stats = useMemo(() => {
    const subs = submissions || [];
    const now = Date.now();
    const weekAgo = now - 7 * DAY_MS;

    const passed = subs.filter((s) => s.status === "passed");
    const totalScore = passed.reduce((acc, s) => acc + Number(s.score || 0), 0);

    // Solved = distinct challenges with at least one passed submission
    const solvedChallengeIds = new Set<number>();
    const firstSolvedAt = new Map<number, number>();
    for (const s of passed) {
      const cid = s.challengeId;
      const t = s.createdAt ? new Date(s.createdAt).getTime() : 0;
      solvedChallengeIds.add(cid);
      if (!firstSolvedAt.has(cid) || t < (firstSolvedAt.get(cid) ?? Infinity)) {
        firstSolvedAt.set(cid, t);
      }
    }

    // Score earned this week (sum of passed submission scores within last 7 days)
    const scoreThisWeek = passed
      .filter((s) => s.createdAt && new Date(s.createdAt).getTime() >= weekAgo)
      .reduce((acc, s) => acc + Number(s.score || 0), 0);

    // New challenges first solved this week
    let solvedThisWeek = 0;
    for (const t of firstSolvedAt.values()) {
      if (t >= weekAgo) solvedThisWeek += 1;
    }

    // Avg Sharpe across passed submissions that recorded a sharpe metric
    const sharpes = passed
      .map((s) => s.metrics?.sharpe)
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    const avgSharpe =
      sharpes.length > 0 ? sharpes.reduce((a, b) => a + b, 0) / sharpes.length : null;

    // Pass rate across all submissions
    const passRate = subs.length > 0 ? (passed.length / subs.length) * 100 : null;

    // Performance history: last 7 days, points earned per day
    const days: { day: string; score: number }[] = [];
    const today = startOfDay(new Date());
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * DAY_MS);
      const dayStart = d.getTime();
      const dayEnd = dayStart + DAY_MS;
      const dayScore = passed
        .filter((s) => {
          const t = s.createdAt ? new Date(s.createdAt).getTime() : 0;
          return t >= dayStart && t < dayEnd;
        })
        .reduce((acc, s) => acc + Number(s.score || 0), 0);
      days.push({ day: dayLabels[d.getDay()], score: Math.round(dayScore) });
    }

    return {
      totalScore: Math.round(totalScore),
      scoreThisWeek: Math.round(scoreThisWeek),
      solvedCount: solvedChallengeIds.size,
      solvedThisWeek,
      avgSharpe,
      sharpeSampleSize: sharpes.length,
      passRate,
      totalSubmissions: subs.length,
      passedCount: passed.length,
      perfHistory: days,
    };
  }, [submissions]);

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const hasAnyHistory = stats.perfHistory.some((d) => d.score > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.firstName}. Here's your performance overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Score"
          value={stats.totalScore.toString()}
          icon={TrendingUp}
          trend={
            stats.scoreThisWeek > 0
              ? `+${stats.scoreThisWeek} this week`
              : "No points this week"
          }
          testId="stat-total-score"
        />
        <StatCard
          title="Challenges Solved"
          value={stats.solvedCount.toString()}
          icon={CheckCircle2}
          trend={
            stats.solvedThisWeek > 0
              ? `+${stats.solvedThisWeek} this week`
              : "None this week"
          }
          testId="stat-challenges-solved"
        />
        <StatCard
          title="Avg Sharpe Ratio"
          value={stats.avgSharpe !== null ? stats.avgSharpe.toFixed(2) : "—"}
          icon={Activity}
          trend={
            stats.sharpeSampleSize > 0
              ? `Across ${stats.sharpeSampleSize} solve${stats.sharpeSampleSize === 1 ? "" : "s"}`
              : "Solve a strategy challenge"
          }
          testId="stat-avg-sharpe"
        />
        <StatCard
          title="Pass Rate"
          value={stats.passRate !== null ? `${stats.passRate.toFixed(0)}%` : "—"}
          icon={Target}
          trend={
            stats.totalSubmissions > 0
              ? `${stats.passedCount} of ${stats.totalSubmissions} submissions`
              : "No submissions yet"
          }
          testId="stat-pass-rate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Performance History</CardTitle>
            <p className="text-xs text-muted-foreground">Points earned per day, last 7 days</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {hasAnyHistory ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.perfHistory}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                      itemStyle={{ color: "var(--primary)" }}
                    />
                    <Area type="monotone" dataKey="score" stroke="var(--primary)" fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground text-center px-6">
                  No points earned in the last 7 days. Solve a challenge to start your performance history.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submissions?.slice(0, 5).map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${sub.status === "passed" ? "bg-green-500" : "bg-red-500"}`} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Challenge #{sub.challengeId}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(sub.createdAt!).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-sm">{Number(sub.score).toFixed(0)} pts</span>
                </div>
              ))}
              {(!submissions || submissions.length === 0) && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No submissions yet. Start coding!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  testId,
}: {
  title: string;
  value: string;
  icon: any;
  trend: string;
  testId?: string;
}) {
  return (
    <Card className="bg-card/50 border-border/50" data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="text-2xl font-bold font-display" data-testid={testId ? `${testId}-value` : undefined}>{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{trend}</p>
      </CardContent>
    </Card>
  );
}
