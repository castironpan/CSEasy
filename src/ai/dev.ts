import { config } from 'dotenv';
config();

import '@/ai/flows/extract-course-events.ts';
import '@/ai/flows/estimate-task-completion-time.ts';
import '@/ai/flows/suggest-tasks.ts';