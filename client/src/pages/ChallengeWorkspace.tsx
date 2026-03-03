import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useChallenge } from "@/hooks/use-challenges";
import { useCreateSubmission } from "@/hooks/use-submissions";
import { CodeEditor } from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Play, Loader2, RotateCcw, CheckCircle2, XCircle, Terminal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AIQuantAssistant } from "@/components/AIQuantAssistant";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function ChallengeWorkspace() {
  const [match, params] = useRoute("/challenge/:id");
  const id = Number(params?.id);
  const { data: challenge, isLoading: isChallengeLoading } = useChallenge(id);
  const createSubmission = useCreateSubmission();
  const { user } = useAuth();
  const { toast } = useToast();

  const [code, setCode] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("description");

  // Load starter code
  useEffect(() => {
    if (challenge) {
      setCode(challenge.starterCode);
    }
  }, [challenge]);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit your solution.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createSubmission.mutateAsync({
        userId: user.id,
        challengeId: id,
        code,
      });

      setOutput((result as any).feedback || (result.status === 'passed' 
        ? `Result: PASSED\nScore: ${result.score}`
        : `Result: FAILED`
      ));

      if (result.status === 'passed') {
        toast({
          title: "Solution Accepted!",
          description: `Great job! You scored ${result.score} points.`,
          className: "bg-green-600 border-none text-white",
        });
      } else {
        toast({
          title: "Solution Failed",
          description: "Check the output console for errors.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Submission Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isChallengeLoading || !challenge) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-background overflow-hidden -m-4 sm:-m-6 lg:-m-8">
      {/* Workspace Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/50">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            ← Back
          </Button>
          <span className="font-semibold">{challenge.title}</span>
          <Badge variant="outline">{challenge.difficulty}</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCode(challenge.starterCode)}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button 
            size="sm" 
            onClick={handleSubmit} 
            disabled={createSubmission.isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {createSubmission.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Run & Submit
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        
        {/* Left Panel: Description */}
        <ResizablePanel defaultSize={40} minSize={20}>
          <div className="h-full overflow-y-auto p-6 bg-card">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{challenge.description}</ReactMarkdown>
                
                <h3 className="mt-6 mb-2 text-lg font-semibold">Example</h3>
                <div className="bg-secondary/50 p-4 rounded-lg font-mono text-sm border border-border">
                  <span className="text-muted-foreground">Input:</span> prices = [100, 102, 101, 105]<br/>
                  <span className="text-muted-foreground">Output:</span> 0.85
                </div>
              </TabsContent>
              <TabsContent value="metrics">
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                    <h4 className="font-semibold mb-2">Scoring Criteria</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Correctness — 50% (does the code solve the problem?)</li>
                      <li>• Code Quality — 30% (vectorization, edge cases, style)</li>
                      <li>• Efficiency — 20% (algorithmic complexity, memory)</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                    <h4 className="font-semibold mb-2">Quant Metrics</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Sharpe Ratio — risk-adjusted return measure</li>
                      <li>• Max Drawdown — largest peak-to-trough decline</li>
                      <li>• Stability — consistency of strategy performance</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-xs text-muted-foreground">
                      Your code is evaluated by an AI grading engine that analyzes correctness, quality, and efficiency. You need ≥60% correctness to pass.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel: Editor & Output */}
        <ResizablePanel defaultSize={60}>
          <ResizablePanelGroup direction="vertical">
            {/* Editor */}
            <ResizablePanel defaultSize={70}>
              <div className="h-full bg-[#1e1e1e] p-4 overflow-hidden flex flex-col">
                <CodeEditor 
                  code={code} 
                  onChange={setCode} 
                  language="python"
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Console/Output */}
            <ResizablePanel defaultSize={30}>
              <div className="h-full bg-[#1e1e1e] border-t border-border p-4 font-mono text-sm overflow-y-auto">
                <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                  <Terminal className="w-4 h-4" />
                  <span>Console Output</span>
                </div>
                {output ? (
                  <pre className={`whitespace-pre-wrap ${output.includes('FAILED') ? 'text-red-400' : 'text-green-400'}`}>
                    {output}
                  </pre>
                ) : (
                  <div className="text-muted-foreground/50 italic">
                    Run your code to see output...
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

      </ResizablePanelGroup>

      <AIQuantAssistant />
    </div>
  );
}
