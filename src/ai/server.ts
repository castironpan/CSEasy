// server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import url from "url";

const app = express();
app.use(cors());
app.use(express.json());

// ---- OpenAI ----
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const MODEL = process.env.MODEL || "gpt-4o-mini";

// ---- Load KB ----
const here = path.dirname(url.fileURLToPath(import.meta.url));
const KB_PATH = path.join(here, "knowledge-base", "KB.md");
let KB_TEXT = "";
try {
  KB_TEXT = fs.readFileSync(KB_PATH, "utf8");
  console.log(`[ai] Loaded KB: ${KB_PATH} (${KB_TEXT.length} chars)`);
} catch (e) {
  console.error(`[ai] Could not read KB at ${KB_PATH}`);
  process.exit(1);
}

// ---- Per-user scoped context ----
// Returns: student's block + only the course sections they are enrolled in (from the global block)
function getContextForUser(userId?: string) {
  if (!userId) return KB_TEXT;

  // Student block
  const studentRe = new RegExp(
    `<!--\\s*USER:${userId}\\s*-->[\\s\\S]*?(?=<!--\\s*USER:|$)`,
    "i"
  );
  const student = (KB_TEXT.match(studentRe)?.[0] || "").trim();
  if (!student) return KB_TEXT;

  // Enrolled course codes from student block
  const enrolledLine =
    student.match(/Enrolled Courses:\s*([A-Z]{4}\d{4}(?:\s*,\s*[A-Z]{4}\d{4})*)/i)?.[1] || "";
  const codes = enrolledLine.split(/\s*,\s*/).filter(Boolean);

  // Global block (shared course info)
  const global =
    (KB_TEXT.match(/<!--\s*USER:global\s*-->[\s\S]*?(?=<!--\s*USER:|$)/i)?.[0] || "").trim();

  // Pull only those course sections
  const selectedCourses: string[] = [];
  for (const code of codes) {
    const courseRe = new RegExp(
      `##\\s*Course:\\s*${code}[\\s\\S]*?(?=\\n##\\s*Course:|\\n<!--\\s*USER:|$)`,
      "i"
    );
    const sec = global.match(courseRe)?.[0];
    if (sec) selectedCourses.push(sec.trim());
  }

  return [
    `# Student Context\n${student}`,
    `# Relevant Courses\n${selectedCourses.join("\n\n")}`,
  ].join("\n\n");
}

// ---- Personality & boundaries ----
const SYSTEM_PROMPT = [
  "You are CSEasy Assistant — a friendly, down-to-earth study coach for UNSW CSE students.",
  "Base answers only on the provided context (student block + their enrolled courses).",
  "Mission: estimate roughly how long released tasks will take and suggest what to focus on next to make the best progress with the time they have.",
  "Be conversational, encouraging, and specific. Do not start with a greeting unless the user greets first.",
  "Boundaries: never generate solutions or code for labs/assignments/quizzes; if something is outside your ability, explain that kindly and suggest next steps.",
].join(" ");

// ---- Lightweight conversation memory (per userId) ----
type ChatTurn = { role: "user" | "assistant"; content: string };
const userMemory = new Map<string, ChatTurn[]>();
const MAX_MEMORY = 6; // keep last 6 turns per user

// ---- Chat endpoint ----
app.post("/chat", async (req, res) => {
  try {
    const { message, userId } = req.body || {};
    if (!message) return res.status(400).json({ error: "Missing 'message'." });

    // Reset memory if asked
    if (String(message).trim().toLowerCase() === "reset") {
      if (userId) userMemory.delete(userId);
      return res.json({ reply: "Conversation reset 👍" });
    }

    // Scoped context
    const context = getContextForUser(userId);

    // (Tiny safety) If KB is huge, send only first ~12k chars
    const MAX_CONTEXT = 12_000;
    const contextSlice = context.length > MAX_CONTEXT ? context.slice(0, MAX_CONTEXT) : context;

    // Load memory
    const memory = userMemory.get(userId) || [];

    // Build conversation
    const todayISO = new Date().toISOString();
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Today: ${todayISO}\n\nContext:\n${contextSlice}` },
      ...memory,
      {
        role: "user",
        content:
          `${message}\n\n` +
          `Notes for assistant: it's okay to infer and be chatty; avoid greetings unless user greets first; ` +
          `if hours aren't stated, you may assume ~3h and say so gently; never produce coursework solutions.`,
      },
    ];

    // Model call
    const resp = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.65,
      top_p: 0.9,
      presence_penalty: 0.2,
      messages,
    });

    let reply = resp.choices?.[0]?.message?.content?.trim() || "";

    // (Optional) strip leading generic salutations
    reply = reply.replace(/^(?:hi|hey|hello)[^.\n]*[.\n]+\s*/i, "").trim();

    // Update memory
    const updated = [...memory, { role: "user", content: message }, { role: "assistant", content: reply }].slice(-MAX_MEMORY);
    if (userId) userMemory.set(userId, updated);

    return res.json({ reply });
  } catch (err) {
    console.error("[/chat] error:", err);
    return res.status(500).json({ error: "Chat failed." });
  }
});

// ---- Start server ----
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`[ai] Chat server running at http://localhost:${PORT}`);
});
