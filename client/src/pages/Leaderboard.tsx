import { Layout } from "@/components/Layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Medal } from "lucide-react";

const mockLeaderboard = [
  { rank: 1, name: "QuantWizard", score: 2850, country: "USA", status: "Expert" },
  { rank: 2, name: "AlphaSeeker", score: 2720, country: "UK", status: "Expert" },
  { rank: 3, name: "HFT_Master", score: 2680, country: "SG", status: "Practitioner" },
  { rank: 4, name: "RiskManager_99", score: 2540, country: "US", status: "Practitioner" },
  { rank: 5, name: "Pythonista", score: 2400, country: "DE", status: "Practitioner" },
  // ... more mock data
];

export default function Leaderboard() {
  return (
    <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-display">Global Leaderboard</h1>
          <p className="text-muted-foreground">Top performers ranked by risk-adjusted returns and problem solving score.</p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLeaderboard.map((user) => (
                <TableRow key={user.rank} className="border-border/50 hover:bg-secondary/30">
                  <TableCell className="font-medium font-mono">
                    <div className="flex items-center">
                      {user.rank <= 3 && (
                        <Medal className={`w-4 h-4 mr-2 ${
                          user.rank === 1 ? 'text-yellow-500' :
                          user.rank === 2 ? 'text-gray-400' :
                          'text-amber-700'
                        }`} />
                      )}
                      #{user.rank}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-secondary/50 font-normal">
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-primary font-bold">
                    {user.score}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
  );
}
