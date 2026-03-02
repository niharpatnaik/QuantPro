import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Loader2 } from "lucide-react";

type UserTrafficData = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: string | null;
  lastLoginAt: string | null;
  challengesAttempted: number;
  totalScore: number;
  rank: number;
};

type TrafficStats = {
  totalUsers: number;
  usersThisWeek: number;
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UserTraffic() {
  const { data: users, isLoading: usersLoading } = useQuery<UserTrafficData[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<TrafficStats>({
    queryKey: ["/api/admin/stats"],
  });

  if (usersLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display" data-testid="text-user-traffic-title">User Traffic</h1>
        <p className="text-muted-foreground">Platform usage and user analytics — owner view only.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Registered Users</p>
              <p className="text-3xl font-bold font-mono" data-testid="text-total-users">{stats?.totalUsers ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Signed In This Week</p>
              <p className="text-3xl font-bold font-mono" data-testid="text-users-this-week">{stats?.usersThisWeek ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-center">Challenges</TableHead>
              <TableHead className="text-right">Total Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((u) => (
                <TableRow key={u.id} className="border-border/50 hover:bg-secondary/30" data-testid={`row-user-${u.id}`}>
                  <TableCell className="font-mono font-medium">#{u.rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {u.firstName?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{u.firstName} {u.lastName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{u.email || "—"}</TableCell>
                  <TableCell className="text-sm">{formatDate(u.lastLoginAt)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-secondary/50 font-mono">
                      {u.challengesAttempted}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-primary font-bold">{u.totalScore}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No users registered yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
