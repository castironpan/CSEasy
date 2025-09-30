import { cookies } from 'next/headers';
import 'server-only';

export const STUDENT_SESSION_COOKIE_KEY = 'student_id';

/**
 * Gets the current student ID from the session cookie.
 * This is a server-side only function.
 * NOTE: cookies() is async in this project setup, so we await it.
 */
export async function getStudentIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(STUDENT_SESSION_COOKIE_KEY)?.value ?? null;
}

/**
 * Sets the student ID in the session cookie.
 * Intended to be called from a server action.
 */
export async function setStudentIdCookie(studentId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(STUDENT_SESSION_COOKIE_KEY, studentId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    // secure: process.env.NODE_ENV === 'production',
    // maxAge: 60 * 60 * 24 * 7,
  });
}

/**
 * Deletes the student session cookie (logout).
 */
export async function deleteStudentIdCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(STUDENT_SESSION_COOKIE_KEY);
}
