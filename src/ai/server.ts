// server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import url from "url";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// ---- OpenAI setup ----
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const MODEL = process.env.MODEL || "gpt-4o-mini";

// SDK message type alias (prevents the 'name is required' / union widening issues)
type ChatMsg = OpenAI.Chat.Completions.ChatCompletionMessageParam;

// Your own turn type for lightweight memory
type ChatTurn = { role: "user" | "assistant"; content: string };

// ---- Load KB ----
const here = path.dirname(url.fileURLToPath(import.meta.url));
const KB_PATH = path.join(here, "knowledge-base", "KB.md");

let KB_TEXT = "";
try {
  KB_TEXT = fs.readFileSync(KB_PATH, "utf8");
  console.log(`[ai] Loaded KB: ${KB_PATH} (${KB_TEXT.length} chars)`);
} catch {
  console.error(`[ai] Could not read KB at ${KB_PATH}`);
  process.exit(1);
}

// ---- Per-user memory (typed) ----
const memory = new Map<string, ChatTurn[]>();
const MAX_TURNS = 10;

// Optional: scope the KB to a specific user block
function getContextForUser(userId?: string) {
  if (!userId) return KB_TEXT;
  const re = new RegExp(`<!--\\s*USER:${userId}\\s*-->[\\s\\S]*?(?=<!--\\s*USER:|$)`, "i");
  const m = KB_TEXT.match(re);
  return m ? m[0] : KB_TEXT;
}

// ---- System prompt (decisive + friendly, no solutions) ----
const SYSTEM_PROMPT = `
You are CSEasy Assistant — a warm, chatty, but efficient study buddy for UNSW CSE students.

Be human and natural. Use short, friendly sentences. Avoid corporate tone.

Decisive planning rules (in order):
1) Urgency first: nearest due dates win. Only consider RELEASED items.
2) Impact: higher weight (%) matters more.
3) Momentum: if something is In Progress, prefer finishing it unless a different item is due sooner.
4) If the student gives available hours, allocate them precisely (e.g., 70 min + 50 min). Otherwise assume ~2–3h once.
5) Make ONE clear primary recommendation and optionally ONE backup. No either/or.

Boundaries:
- Never provide coursework answers or code.
- If something is unknown, say so casually and suggest what to check.

Tone:
- Friendly, confident, brief. Start directly (no greeting unless the user greets first).
`;

// ---- Chat endpoint ----
app.post("/chat", async (req, res) => {
  try {
    const { message, userId } = (req.body ?? {}) as { message: string; userId?: string };
    if (!message) return res.status(400).json({ error: "Missing 'message'." });

    const uid = userId ?? "global";
    const context = getContextForUser(uid);
    const contextSlice = context.length > 12_000 ? context.slice(0, 12_000) : context;

    // Pull prior turns with a TYPED fallback so TS keeps literal roles
    const prior: ChatTurn[] = memory.get(uid) ?? ([] as ChatTurn[]);

    // Adapt your ChatTurn[] to the SDK's ChatMsg[]
    const priorMsgs: ChatMsg[] = prior.map((t) => ({ role: t.role, content: t.content }));

    const todayISO = new Date().toISOString();

    const messages: ChatMsg[] = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content:
          `Today: ${todayISO}\n` +
          `Student/course context:\n${contextSlice}\n\n` +
          `User message:\n${message}\n\n` +
          `Notes for assistant:\n- Be decisive (ONE main pick, optional ONE backup).\n` +
          `- Allocate time precisely based on hours stated.\n` +
          `- Keep it short and friendly; no coursework solutions.\n`,
      },
      ...priorMsgs,
    ];

    const resp = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.55,
      top_p: 0.9,
      presence_penalty: 0.2,
      messages, // typed as ChatMsg[]
    });

    let reply = resp.choices?.[0]?.message?.content?.trim() || "Not sure yet.";
    reply = reply.replace(/^(hi|hey|hello)[,!\s-]*/i, ""); // trim generic greetings if any

    // Update memory with literal roles (as const to keep the union)
    const updated: ChatTurn[] = [
      ...prior,
      { role: "user" as const, content: String(message) },
      { role: "assistant" as const, content: reply },
    ].slice(-MAX_TURNS);

    memory.set(uid, updated);

    res.json({ reply });
  } catch (err) {
    console.error("[/chat] error:", err);
    res.status(500).json({ error: "Chat failed." });
  }
});

// ---- Start server ----
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`[ai] Chat server running at http://localhost:${PORT}`);
});
