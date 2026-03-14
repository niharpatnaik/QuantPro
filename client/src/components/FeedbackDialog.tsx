import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquarePlus, Loader2 } from "lucide-react";

interface FeedbackDialogProps {
  autoOpen?: boolean;
}

export function FeedbackDialog({ autoOpen = false }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [location] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (autoOpen) {
      setOpen(true);
    }
  }, [autoOpen]);

  const submitFeedback = useMutation({
    mutationFn: async (data: { message: string; pageUrl: string }) => {
      await apiRequest("POST", "/api/feedback", data);
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted.",
        className: "bg-green-600 border-none text-white",
      });
      setMessage("");
      setOpen(false);
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!message.trim()) return;
    submitFeedback.mutate({ message, pageUrl: location });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center justify-start space-x-3 rounded-xl text-sm font-medium text-muted-foreground w-full"
          data-testid="button-open-feedback"
        >
          <MessageSquarePlus className="h-5 w-5" />
          <span>Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display">Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us improve QuantPro. Your feedback is valuable to us.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Tell us what you think, report a bug, or suggest a feature..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px] bg-background/50 border-border/50 resize-none"
            data-testid="input-feedback-message"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-testid="button-cancel-feedback"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitFeedback.isPending || !message.trim()}
            className="bg-primary text-primary-foreground"
            data-testid="button-submit-feedback"
          >
            {submitFeedback.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
