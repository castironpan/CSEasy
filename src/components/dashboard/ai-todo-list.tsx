'use client';

import { useState, useTransition, useRef } from 'react';
import type { Todo } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Sparkles, Clock, Loader2, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { getAiTaskSuggestions, getAiTimeEstimate, addTodo as addTodoAction, toggleTodo as toggleTodoAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface AITodoListProps {
  initialTodos: Todo[];
  studentId: string;
}

export function AITodoList({ initialTodos, studentId }: AITodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodo, setNewTodo] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const [isSuggestionsOpen, setSuggestionsOpen] = useState(false);
  const [isEstimatorOpen, setEstimatorOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
  const [estimation, setEstimation] = useState<{ estimatedTime: string; reasoning: string } | null>(null);

  const [isSuggesting, startSuggestingTransition] = useTransition();
  const [isEstimating, startEstimatingTransition] = useTransition();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    startTransition(async () => {
      const created = await addTodoAction(newTodo.trim(), studentId);
      if (created) {
        setTodos(prev => [...prev, created]);
        setNewTodo('');
      }
    });
  };

  const handleToggleTodo = (id: string, completed: boolean) => {
     startTransition(async () => {
      setTodos(prev => prev.map(todo => todo.id === id ? { ...todo, completed } : todo));
      await toggleTodoAction(id, studentId);
    });
  };

  const handleGetSuggestions = () => {
    setSuggestionsOpen(true);
    startSuggestingTransition(async () => {
      try {
        const result = await getAiTaskSuggestions('Computer Science course content including data structures, algorithms, and operating systems principles.');
        if(result) setSuggestions(result.tasks);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'AI Suggestion Failed',
          description: 'Could not fetch AI suggestions. Please try again later.',
        });
        setSuggestionsOpen(false);
      }
    });
  };

  const handleEstimateTime = (todo: Todo) => {
    setActiveTodo(todo);
    setEstimatorOpen(true);
    setEstimation(null);
    startEstimatingTransition(async () => {
      try {
        const result = await getAiTimeEstimate(todo.text);
        if(result) setEstimation(result);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'AI Estimation Failed',
          description: 'Could not get time estimate. Please try again later.',
        });
        setEstimatorOpen(false);
      }
    });
  };

  const addSuggestionToTodos = (suggestion: string) => {
    startTransition(async () => {
      const created = await addTodoAction(suggestion, studentId);
      if (created) {
        setTodos(prev => [...prev, created]);
        setSuggestions(prev => prev.filter(s => s !== suggestion));
        toast({ title: 'Task added!', description: `"${suggestion}" was added to your list.` });
      }
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered To-Do List</CardTitle>
          <CardDescription>Manage your personal study tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleAddTodo} className="flex gap-2 mb-4">
            <Input
              placeholder="Add a new task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
            />
            <Button type="submit" size="icon" aria-label="Add Task">
              <Plus />
            </Button>
          </form>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {todos.map((todo) => (
              <div key={todo.id} className="flex items-center gap-2 group">
                <Checkbox
                  id={`todo-${todo.id}`}
                  checked={todo.completed}
                  onCheckedChange={(checked) => handleToggleTodo(todo.id, !!checked)}
                />
                <label
                  htmlFor={`todo-${todo.id}`}
                  className={cn(
                    'flex-1 text-sm cursor-pointer',
                    todo.completed && 'line-through text-muted-foreground'
                  )}
                >
                  {todo.text}
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={() => handleEstimateTime(todo)}
                  aria-label={`Estimate time for ${todo.text}`}
                >
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={handleGetSuggestions}>
            <Sparkles className="mr-2 h-4 w-4" />
            Get AI Suggestions
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isSuggestionsOpen} onOpenChange={setSuggestionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Task Suggestions</DialogTitle>
            <DialogDescription>
              Here are some tasks suggested by AI based on your courses.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            {isSuggesting ? (
              <div className="flex justify-center items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Generating ideas...</span>
              </div>
            ) : (
              suggestions.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-2 p-2 border rounded-lg">
                  <p className="text-sm">{s}</p>
                  <Button size="sm" onClick={() => addSuggestionToTodos(s)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEstimatorOpen} onOpenChange={setEstimatorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                AI Time Estimation
            </DialogTitle>
            <DialogDescription>For task: "{activeTodo?.text}"</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {isEstimating || !estimation ? (
                <div className="flex justify-center items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Analyzing task...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold">Estimated Time</h4>
                        <p className="text-2xl text-primary font-bold">{estimation.estimatedTime}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold">Reasoning</h4>
                        <p className="text-sm text-muted-foreground">{estimation.reasoning}</p>
                    </div>
                </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setEstimatorOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
