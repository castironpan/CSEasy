"use client";
import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Sparkles, Loader2, X, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
// Using internal API route for multi-turn chat instead of single-turn suggestTasks flow.

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatPanelProps {
  onClose?: () => void;
  defaultPrompt?: string;
}

export function AIChatPanel({ onClose, defaultPrompt }: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(defaultPrompt || '');
  const [isPending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const router = useRouter();
  // Using only the /chat endpoint from standalone ai/server.ts (same flow as test.html)
  const listRef = useRef<HTMLDivElement>(null);

  const AI_BASE = process.env.NEXT_PUBLIC_AI_SERVER_URL || 'http://localhost:3000';

  const send = () => {
    if (!input.trim()) return;
    const content = input.trim();
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    startTransition(async () => {
      try {
        const res = await fetch(`${AI_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content }),
        });
        const json = await res.json();
        if (!res.ok || !json.reply) throw new Error('Bad response');
        const replyText = json.reply;
        if (!replyText) throw new Error('Missing reply');
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: replyText }]);
      } catch (e) {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Sorry, I could not generate a reply right now.' }]);
      } finally {
        requestAnimationFrame(() => {
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
        });
      }
    });
  };

  // Extract candidate tasks from the most recent assistant message.
  function extractTasksFromLastReply(): string[] {
    const lastAssist = [...messages].reverse().find(m => m.role === 'assistant');
    if (!lastAssist) return [];
    const content = lastAssist.content.trim();
    const stripMarkdown = (s: string) => s.replace(/\*\*|__/g, '').trim();
    const isMeta = (line: string) => /^(primary recommendation|focus\s*:|time\s*:)/i.test(line);
  // Only treat lines that START with an action verb (after stripping numbering / bullets)
  const candidateVerb = /^(complete|start|begin|finish|work on|review|implement)\b/i;

    const lines = content.split(/\n/).map(l => stripMarkdown(l.trim())).filter(Boolean);
    const tasks: string[] = [];

    for (let raw of lines) {
  if (raw.length < 4) continue;
  if (isMeta(raw)) continue; // skip meta lines
  if (/^here\s+(are|is)\b/i.test(raw)) continue; // skip preamble like "Here are two tasks..."

      // Remove leading bullets / numbering ("- ", "1. ", "2) ")
      raw = raw.replace(/^(?:[-*]|\d+[.)])\s*/, '').trim();

      // Extract course code(s) within this line (could have multiple, pick all but we'll use first for prefix logic if needed)
      const codes = raw.match(/COMP\d{4}/gi) || [];
      // Detect and strip Task labels: "Task 1:", "Task 2 -" etc.
      raw = raw.replace(/^Task\s*\d*\s*[:\-]\s*/i, '').trim();

      // Skip lines that are now just meta after stripping
      if (isMeta(raw)) continue;
  if (!candidateVerb.test(raw)) continue; // must start with an action verb
      if (/^focus\b/i.test(raw) || /^time\b/i.test(raw)) continue; // extra guard

      // Trim trailing punctuation-only period
      raw = raw.replace(/[.!?]\s*$/,'');

      // If line became empty, skip
      if (!raw) continue;

      // Only add if not obviously a pure due date.
      if (/^due\b/i.test(raw)) continue;

      // If we want to ensure inclusion of course code and none present inside text, we can prefix the first code detected earlier in the entire content for context.
      // Instead we use per-line code: if codes found and not already at start, we leave as-is (contains code). If no code, do not force global one.
      // (User earlier wanted course code inserted if missing; we adapt: only prefix if EXACTLY one code found elsewhere in original content and none in this line.)

      if (!/COMP\d{4}/i.test(raw)) {
        // Search entire content for possible single course code context if only one unique code present overall.
        const allCodes = Array.from(new Set((content.match(/COMP\d{4}/gi) || []).map(c => c.toUpperCase())));
        if (allCodes.length === 1) {
          raw = `${allCodes[0]} - ${raw}`;
        }
      }

      tasks.push(raw);
    }

    // Fallback: JSON parse if nothing extracted
    if (!tasks.length) {
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.tasks)) {
          return parsed.tasks.map(String).filter(Boolean).map((t: string) => stripMarkdown(t).replace(/[.!?]\s*$/,'').trim());
        }
      } catch { /* ignore */ }
    }

    // Deduplicate case-insensitive
    const seen = new Set<string>();
    const deduped: string[] = [];
    for (const t of tasks) {
      const key = t.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(t);
    }
    return deduped;
  }

  async function addTasksToTodo() {
    const tasks = extractTasksFromLastReply();
    if (!tasks.length) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'No recognizable task lines to add.' }]);
      return;
    }
    setAdding(true);
    try {
      // Dispatch event for any listeners (e.g., AITodoList) to consume and add tasks via their own logic.
      window.dispatchEvent(new CustomEvent('ai-add-tasks', { detail: { tasks } }));
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: `Sent ${tasks.length} task(s) to your to-do list.` }]);
      router.refresh();
    } catch (e: any) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Failed to trigger task addition.' }]);
    } finally {
      setAdding(false);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
      });
    }
  }

  return (
    <Card className="flex flex-col h-full border-l rounded-none">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> AI Study Assistant</CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close chat">
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div ref={listRef} className="h-full overflow-y-auto space-y-4 p-4 text-sm">
          {messages.length === 0 && (
            <p className="text-muted-foreground text-xs">Chat about study strategy, prioritization, or paste syllabus content. (Using /chat endpoint)</p>
          )}
          {messages.map(m => (
            <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div className={`inline-block max-w-full whitespace-pre-wrap rounded-md px-3 py-2 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} text-xs`}>{m.content}</div>
            </div>
          ))}
          {/* Inline Add Tasks button below the latest assistant reply if extractable tasks exist */}
          {(() => {
            const tasks = extractTasksFromLastReply();
            if (!tasks.length || adding) return null;
            return (
              <div className="pt-2 border-t mt-2 flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={addTasksToTodo} aria-label="Add extracted tasks" className="flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Add {tasks.length} Task{tasks.length > 1 ? 's' : ''}
                </Button>
              </div>
            );
          })()}
        </div>
      </CardContent>
      <CardFooter className="border-t p-3 flex flex-col gap-2">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste lecture notes or ask for study tasks..."
            className="min-h-[60px] text-xs"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button onClick={send} disabled={isPending || !input.trim()} size="icon" aria-label="Send">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">AI can make mistakes. Verify important details.</p>
      </CardFooter>
    </Card>
  );
}
