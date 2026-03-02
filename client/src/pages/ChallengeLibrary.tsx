import { useChallenges } from "@/hooks/use-challenges";
import { ChallengeCard } from "@/components/ChallengeCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ChallengeLibrary() {
  const { data: challenges, isLoading } = useChallenges();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [track, setTrack] = useState("all");

  const filteredChallenges = challenges?.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = difficulty === "all" || c.difficulty === difficulty;
    const matchesTrack = track === "all" || c.track === track;
    return matchesSearch && matchesDifficulty && matchesTrack;
  });

  const counts = {
    total: challenges?.length || 0,
    beginner: challenges?.filter(c => c.difficulty === 'Beginner').length || 0,
    practitioner: challenges?.filter(c => c.difficulty === 'Practitioner').length || 0,
    expert: challenges?.filter(c => c.difficulty === 'Expert').length || 0,
  };

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display" data-testid="text-challenge-library-title">Challenge Library</h1>
            <p className="text-muted-foreground">Practice problems from top hedge fund interviews.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-mono" data-testid="badge-beginner-count">{counts.beginner} Beginner</Badge>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-mono" data-testid="badge-practitioner-count">{counts.practitioner} Practitioner</Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 font-mono" data-testid="badge-expert-count">{counts.expert} Expert</Badge>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 bg-card/30 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search challenges..." 
              className="pl-9 bg-background/50 border-border/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-challenges"
            />
          </div>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-[180px] bg-background/50 border-border/50" data-testid="select-difficulty">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Practitioner">Practitioner</SelectItem>
              <SelectItem value="Expert">Expert</SelectItem>
            </SelectContent>
          </Select>
          <Select value={track} onValueChange={setTrack}>
            <SelectTrigger className="w-[180px] bg-background/50 border-border/50" data-testid="select-track">
              <SelectValue placeholder="Track" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tracks</SelectItem>
              <SelectItem value="Alpha">Alpha</SelectItem>
              <SelectItem value="Risk">Risk</SelectItem>
              <SelectItem value="Execution">Execution</SelectItem>
              <SelectItem value="Portfolio">Portfolio</SelectItem>
              <SelectItem value="Data">Data</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground" data-testid="text-showing-count">
          Showing {filteredChallenges?.length || 0} of {counts.total} challenges
        </p>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredChallenges?.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
            {filteredChallenges?.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                No challenges found matching your criteria.
              </div>
            )}
          </div>
        )}
      </div>
  );
}
