import OpenAI from 'openai';
import { getStudentTasks, getStudentCourses } from '@/lib/data';
import type { StudentTask } from '@/lib/types';

// Simple in-memory chat history (non-durable; resets on server restart or serverless cold start)
// Keyed by userId ("global" default)
export type ChatTurn = { role: 'user' | 'assistant'; content: string };
const memory = new Map<string, ChatTurn[]>();
const MAX_TURNS = 10;

const MODEL = process.env.MODEL || 'gpt-4o-mini';
const SYSTEM_PROMPT = `You are CSEasy Assistant — a warm, succinct, study buddy for UNSW CSE students.
Focus on actionable planning. Never give solutions to graded work. Encourage prioritization.
Tone: friendly, brief, confident.`;

let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function chatWithAssistant(message: string, userId?: string): Promise<string> {
  const uid = userId || 'global';
  const prior = memory.get(uid) ?? [];

  if (!openai) {
    return '(OpenAI API key missing) Example plan: 1) List all due tasks. 2) Block 90m deep work now. 3) Finish nearest due lab. 4) Draft notes summary.';
  }

  const todayISO = new Date().toISOString();

  // Convert prior into OpenAI messages
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'system', content: `Today: ${todayISO}` },
    ...prior.map(t => ({ role: t.role, content: t.content } as { role: 'user' | 'assistant'; content: string })),
    { role: 'user', content: message },
  ] as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

  const resp = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.55,
    top_p: 0.9,
    presence_penalty: 0.2,
    messages,
  });

  let reply = resp.choices?.[0]?.message?.content?.trim() || 'Not sure yet.';
  reply = reply.replace(/^(hi|hey|hello)[,!\s-]*/i, '');

  const updated: ChatTurn[] = [...prior, { role: 'user', content: message } as ChatTurn, { role: 'assistant', content: reply } as ChatTurn].slice(-MAX_TURNS);
  memory.set(uid, updated);
  return reply;
}

// --- Task suggestion (structured) ---
// Returns array of tasks; each will later be prefixed with [ADD_TODO] for downstream parsing.
export async function generateTaskSuggestions(rawContent: string, studentId?: string): Promise<string[]> {
  // If we have a student ID, enrich the content with their actual pending labs/assignments.
  let enriched = rawContent.trim();
  if (studentId) {
    try {
      const [courses, tasks] = await Promise.all([
        getStudentCourses(studentId),
        getStudentTasks(studentId),
      ]);
      const codeMap = Object.fromEntries(courses.map(c => [c.id, c.code] as const));
      const pending = tasks.filter(t => !t.completed);
      if (pending.length) {
        const lines = pending
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          .map(t => formatStudentTaskForContext(t, codeMap[t.courseId] || t.courseId));
        enriched += `\n\n# CURRENT_PENDING_TASKS\n${lines.join('\n')}`;
      }
    } catch (e) {
      // Swallow enrichment errors; fall back to raw content.
      console.warn('[generateTaskSuggestions] enrichment failed:', e);
    }
  }

  if (!openai) {
    return fallbackHeuristic(enriched || rawContent);
  }

  const prompt = `You are an AI assistant designed to decompose current course obligations into actionable STUDY todos.
Input includes optional free-form user text plus a machine generated list headed by # CURRENT_PENDING_TASKS.
Rules:
1. Focus on uncompleted items.
2. Break large assignments/projects into concrete next steps (draft outline, implement data structure X, write tests, review rubric, etc.).
3. Include spaced review / preparation tasks if exams inferred.
4. Be concise (max ~12 tasks). No duplicates. No generic "study more".
5. Return ONLY valid JSON: {"tasks":["..."]}.

Content:\n${enriched}\n\nJSON ONLY:`;

  const resp = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.45,
    top_p: 0.9,
    messages: [
      { role: 'system', content: 'Return ONLY valid JSON in the format {"tasks":["..."]}. No commentary.' },
      { role: 'user', content: prompt },
    ],
  });
  const raw = resp.choices?.[0]?.message?.content?.trim() || '';
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed.tasks)) {
      return parsed.tasks.map(String).filter(Boolean).slice(0, 15);
    }
  } catch (e) {
    // fall through to heuristic
  }
  return fallbackHeuristic(enriched || rawContent);
}

function fallbackHeuristic(content: string): string[] {
  const lower = content.toLowerCase();
  const tasks: string[] = [];
  if (/exam|midterm|final/.test(lower)) tasks.push('Create spaced review plan for upcoming exam');
  if (/assignment|project/.test(lower)) tasks.push('Break assignment into subtasks with mini-deadlines');
  if (/lecture|week/.test(lower)) tasks.push('Summarize this week\'s lecture concepts');
  if (/lab/.test(lower)) tasks.push('Prepare lab environment and skim starter code');
  if (tasks.length === 0) tasks.push('Draft concise study notes from provided content');
  return tasks;
}

function formatStudentTaskForContext(task: StudentTask, courseCode: string): string {
  const due = new Date(task.dueDate);
  const days = Math.round((due.getTime() - Date.now()) / 86400000);
  const rel = days < 0 ? `OVERDUE ${Math.abs(days)}d` : days === 0 ? 'due TODAY' : `due in ${days}d`;
  return `${courseCode} ${task.sourceType}: ${task.title} (${rel})`;
}
