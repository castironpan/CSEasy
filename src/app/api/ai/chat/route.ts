// import { NextRequest } from 'next/server';
// import { chatWithAssistant, generateTaskSuggestions } from '@/ai/chat';
// import { suggestTasks } from '@/ai/flows/suggest-tasks';

// export const runtime = 'nodejs'; // ensure Node runtime for OpenAI SDK

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json().catch(() => ({}));
//     const mode = (body?.mode || 'chat') as 'chat' | 'suggest';
//     const message = (body?.message ?? '').trim();
//     const userId = typeof body?.userId === 'string' ? body.userId : undefined;
//     if (!message) {
//       return new Response(JSON.stringify({ error: 'Missing message' }), { status: 400 });
//     }
//     if (mode === 'suggest') {
//       let tasks: string[] = [];
//       try {
//         // Use Genkit flow (enriched prompt) for canonical task suggestions
//         const result = await suggestTasks({
//           courseContent: message,
//           studentId: userId,
//           includeKnowledgeBase: true,
//         });
//         tasks = result.tasks || [];
//       } catch (e) {
//         console.warn('[api/ai/chat] suggestTasks flow failed, falling back to OpenAI generator:', e);
//         tasks = await generateTaskSuggestions(message, userId);
//       }
//       const reply = tasks.map((t, i) => `[ADD_TODO] ${i + 1}. ${t}`).join('\n');
//       return new Response(JSON.stringify({ reply, tasks, source: 'suggest-tasks-flow' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
//     } else {
//       const reply = await chatWithAssistant(message, userId);
//       return new Response(JSON.stringify({ reply }), { status: 200, headers: { 'Content-Type': 'application/json' } });
//     }
//   } catch (e) {
//     console.error('[api/ai/chat] error', e);
//     return new Response(JSON.stringify({ error: 'Chat failed' }), { status: 500 });
//   }
// }
