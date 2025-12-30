import { useAuth } from "@/hooks/use-auth";
import { useSubmissions } from "@/hooks/use-submissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { Loader2, TrendingUp, Activity, CheckCircle2, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockPerformanceData = [
  { day: 'Mon', score: 120 },
  { day: 'Tue', score: 132 },
  { day: 'Wed', score: 145 },
  { day: 'Thu', score: 140 },
  { day: 'Fri', score: 155 },
  { day: 'Sat', score: 168 },
  { day: 'Sun', score: 180 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { data: submissions, isLoading } = useSubmissions();

  if (isLoading) {
    return (
      <Layout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const passedSubmissions = submissions?.filter(s => s.status === 'passed') || [];
  const totalScore = passedSubmissions.reduce((acc, curr) => acc + Number(curr.score || 0), 0);

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-display">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.firstName}. Here's your performance overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Score" 
            value={totalScore.toString()} 
            icon={TrendingUp} 
            trend="+12% from last week"
          />
          <StatCard 
            title="Challenges Solved" 
            value={passedSubmissions.length.toString()} 
            icon={CheckCircle2}
            trend="+3 new"
          />
          <StatCard 
            title="Avg Sharpe Ratio" 
            value="1.85" 
            icon={Activity}
            trend="Top 15%"
          />
          <StatCard 
            title="Time Spent" 
            value="12.5h" 
            icon={Clock}
            trend="This week"
          />
        </div>

        {/* Charts & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockPerformanceData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                      itemStyle={{ color: 'var(--primary)' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="var(--primary)" fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
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
                  <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${sub.status === 'passed' ? 'bg-green-500' : 'bg-red-500'}`} />
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
    </Layout>
  );
}

function StatCard({ title, value, icon: Icon, trend }: { title: string, value: string, icon: any, trend: string }) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="text-2xl font-bold font-display">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{trend}</p>
      </CardContent>
    </Card>
  );
}
