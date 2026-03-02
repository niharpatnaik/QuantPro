import { Challenge } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Clock, TrendingUp } from "lucide-react";
import { Link } from "wouter";

interface ChallengeCardProps {
  challenge: Challenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const difficultyColor = {
    'Beginner': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Practitioner': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'Expert': 'bg-red-500/10 text-red-500 border-red-500/20',
  }[challenge.difficulty] || 'bg-secondary text-secondary-foreground';

  return (
    <Card className="flex flex-col h-full bg-card/40 hover:bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className={`${difficultyColor} font-mono text-xs uppercase tracking-wider`}>
            {challenge.difficulty}
          </Badge>
          <Badge variant="outline" className="bg-secondary/50 border-secondary font-mono text-xs">
            {challenge.points} PTS
          </Badge>
        </div>
        <CardTitle className="text-xl font-display group-hover:text-primary transition-colors">
          {challenge.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
          {challenge.description.slice(0, 120)}...
        </p>
        
        <div className="mt-6 flex items-center space-x-4 text-xs text-muted-foreground font-mono">
          <div className="flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>{challenge.track}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>{challenge.difficulty === 'Beginner' ? '~30m' : challenge.difficulty === 'Practitioner' ? '~45m' : '~90m'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link href={`/challenge/${challenge.id}`} className="w-full">
          <Button className="w-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-300 group-hover:shadow-lg shadow-none">
            Solve Challenge
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
