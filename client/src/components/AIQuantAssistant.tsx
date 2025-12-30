import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, X, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIQuantAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // Create a conversation when opening for the first time
  const [conversationId, setConversationId] = useState<number | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !conversationId && user) {
      // Initialize conversation
      fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Quant Assistant Session' }),
      })
      .then(res => res.json())
      .then(data => setConversationId(data.id))
      .catch(console.error);
    }
  }, [isOpen, conversationId, user]);

  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMsg }),
      });

      if (!response.ok) throw new Error('Failed to send');

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      let assistantMessage = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              assistantMessage += data.content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantMessage;
                return newMessages;
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-card border border-border shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Quant Assistant</h3>
                  <p className="text-xs text-muted-foreground">Ask about algorithms & finance</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary/40" />
                    <p className="text-sm">Hi! I can help you understand financial concepts or debug your trading strategy.</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`
                        max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed
                        ${msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                          : 'bg-secondary text-secondary-foreground rounded-tl-sm'
                        }
                      `}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary px-4 py-2 rounded-2xl rounded-tl-sm flex items-center space-x-2">
                      <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Analyzing...</span>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border bg-background">
              <form 
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex items-center space-x-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-secondary/50 border-transparent focus:border-primary/50 transition-all"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!input.trim() || isLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 p-0 flex items-center justify-center"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
        </Button>
      </motion.div>
    </>
  );
}
