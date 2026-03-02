import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, Loader2, MessageSquare } from "lucide-react";
import type { Feedback } from "@shared/schema";

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

export default function AdminFeedback() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data: allFeedback, isLoading } = useQuery<Feedback[]>({
    queryKey: ["/api/admin/feedback"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/feedback/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback"] });
      toast({ title: "Deleted", description: "Feedback entry removed." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const filtered = allFeedback?.filter((fb) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      fb.message.toLowerCase().includes(q) ||
      (fb.userEmail || "").toLowerCase().includes(q) ||
      (fb.userName || "").toLowerCase().includes(q) ||
      (fb.pageUrl || "").toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display" data-testid="text-feedback-title">All Feedback</h1>
          <p className="text-muted-foreground">User feedback and suggestions — owner view only.</p>
        </div>
        <Badge variant="outline" className="bg-secondary/50 font-mono" data-testid="badge-feedback-count">
          <MessageSquare className="h-3 w-3 mr-1" />
          {allFeedback?.length || 0} total
        </Badge>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search feedback by keyword, email, or page..."
          className="pl-9 bg-background/50 border-border/50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="input-search-feedback"
        />
      </div>

      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="w-[160px]">Date</TableHead>
              <TableHead className="w-[160px]">Name / Email</TableHead>
              <TableHead className="w-[140px]">Page</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered && filtered.length > 0 ? (
              filtered.map((fb) => (
                <TableRow key={fb.id} className="border-border/50 hover:bg-secondary/30" data-testid={`row-feedback-${fb.id}`}>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(fb.createdAt as any)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{fb.userName || "—"}</p>
                      <p className="text-xs text-muted-foreground">{fb.userEmail || "—"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-secondary/30 font-mono text-xs">
                      {fb.pageUrl}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm max-w-[400px]">
                    <p className="line-clamp-3">{fb.message}</p>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteMutation.mutate(fb.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-feedback-${fb.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {search ? "No feedback matching your search." : "No feedback submitted yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
