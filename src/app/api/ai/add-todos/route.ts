import { NextRequest } from 'next/server';
import { addSuggestedTodos } from '@/app/actions';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tasks: string[] = Array.isArray(body?.tasks) ? body.tasks : [];
    if (!tasks.length) return new Response(JSON.stringify({ error: 'No tasks provided' }), { status: 400 });
  const result = await addSuggestedTodos(tasks);
  return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('[api/ai/add-todos] error', e);
    return new Response(JSON.stringify({ error: 'Failed to add todos' }), { status: 500 });
  }
}
